import db from "../config/db.js";
import Student from "../models/Student.js";
import Enrollment from "../models/Enrollment.js";
import ApplicationQueue from "../models/ApplicationQueue.js";
import Lookup from "../models/Lookup.js";
import {
  fullNameSql,
  latestEnrollmentJoinSql,
  normalizePagination,
  studentStatusSql,
} from "../utils/sqlBuilders.js";

const registrarApprovalDraftColumnDefinitions = {
  draft_id: "INT AUTO_INCREMENT PRIMARY KEY",
  enrollment_id: "INT NOT NULL",
  student_id: "INT NULL",
  created_at: "TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP",
  updated_at: "TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
};

let registrarApprovalDraftSchemaReady = false;

async function ensureRegistrarApprovalDraftsTableShape() {
  if (registrarApprovalDraftSchemaReady) {
    return;
  }

  await db.query(`
    CREATE TABLE IF NOT EXISTS registrar_approval_drafts (
      draft_id INT AUTO_INCREMENT PRIMARY KEY,
      enrollment_id INT NOT NULL,
      student_id INT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY unique_registrar_approval_draft_enrollment (enrollment_id)
    )
  `);

  const [existingColumns] = await db.query("SHOW COLUMNS FROM registrar_approval_drafts");
  const existingColumnNames = new Set(existingColumns.map((column) => column.Field));

  for (const [columnName, definition] of Object.entries(registrarApprovalDraftColumnDefinitions)) {
    if (!existingColumnNames.has(columnName)) {
      await db.query(`ALTER TABLE registrar_approval_drafts ADD COLUMN ${columnName} ${definition}`);
    }
  }

  registrarApprovalDraftSchemaReady = true;
}

export async function submitEnrollment(payload) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const programId = await Lookup.resolveProgramId(connection, payload.program);
    const modalityId = await Lookup.resolveModalityId(connection, payload.learningModality);
    const studentTypeId = await Lookup.resolveStudentTypeId(connection, payload.studentType);
    const studentId = await Student.upsert(connection, payload);

    if (!programId) {
      throw new Error(`Program lookup failed for "${payload.program}".`);
    }

    if (!modalityId) {
      throw new Error(`Learning modality lookup failed for "${payload.learningModality}".`);
    }

    if (!studentTypeId) {
      throw new Error(`Student type lookup failed for "${payload.studentType}".`);
    }

    const queueNumber = await ApplicationQueue.getNextPosition(connection);
    const agreedAtDate = payload.agreedAt ? new Date(payload.agreedAt) : null;
    const enrollmentId = await Enrollment.insert(connection, {
      studentId,
      programId,
      modalityId,
      studentTypeId,
      yearLevel: payload.yearLevel,
      semester: payload.semester,
      academicYear: (payload.academicYear ?? payload.lastSchoolYear) || null,
      queueNumber,
      remarks: payload.remarks,
      agreedToTerms: payload.agreedToTerms,
      formattedAgreedAt: agreedAtDate,

      // Family / guardian + academic extras (used by profile.html)
      highestAttainment: payload.highestAttainment ?? null,
      lastSchoolAttended: payload.lastSchoolAttended ?? null,
      lastSchoolYear: payload.lastSchoolYear ?? null,
      isWorking: payload.workingStatus
        ? payload.workingStatus === "Working student" ? 1
          : payload.workingStatus === "Non-working" ? 0
          : payload.isWorking ?? 0
        : payload.isWorking ?? 0,

      motherMaidenName: payload.motherMaiden ?? null,
      fatherName: payload.fatherName ?? null,
      guardianName: payload.guardianName ?? null,
      guardianContact: payload.guardianContact ?? null,
    });

    await ApplicationQueue.addToQueue(connection, enrollmentId, queueNumber);

    await connection.commit();
    return { studentId, enrollmentId, queueNumber };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function findEnrollments(query) {
  const { limit, offset } = normalizePagination(query, { defaultLimit: 50, maxLimit: 200 });

  const [data] = await db.query(
    `SELECT
      e.enrollment_id,
      e.student_id,
      e.program_id,
      e.modality_id,
      e.student_type_id,
      e.year_level,
      e.semester_types AS semester,
      e.academic_year,
      e.enrollment_date,
      e.queue_number,
      e.application_status,
      e.special_remarks,
      e.official_receipt_number,
      e.official_receipt_file_url,
      e.official_receipt_file_name,
      e.official_receipt_file_type,
      e.agreed_to_terms,
      e.agreed_at,
      e.created_at,
      e.updated_at,
      s.email_address,
      s.first_name,
      s.middle_name,
      s.last_name,
      s.suffix,
      CONCAT(s.first_name, ' ', IFNULL(CONCAT(s.middle_name, ' '), ''), s.last_name, IFNULL(CONCAT(' ', s.suffix), '')) AS full_name,
      p.program_name,
      p.program_code
    FROM enrollments e
    LEFT JOIN students s ON e.student_id = s.student_id
    LEFT JOIN programs p ON e.program_id = p.program_id
    ORDER BY e.created_at DESC
    LIMIT ? OFFSET ?`,
    [limit, offset]
  );

  const [[countResult]] = await db.query("SELECT COUNT(*) AS total FROM enrollments");

  return {
    total: Number(countResult.total || 0),
    limit,
    offset,
    data,
  };
}

export async function findRecentEnrollments(query) {
  const { limit, offset } = normalizePagination(query, { defaultLimit: 5, maxLimit: 20 });

  const [data] = await db.query(
    `SELECT
      e.enrollment_id,
      e.student_id,
      e.program_id,
      e.modality_id,
      e.student_type_id,
      e.year_level,
      e.semester_types AS semester,
      e.academic_year,
      e.enrollment_date,
      e.queue_number,
      e.application_status,
      e.special_remarks,
      e.official_receipt_number,
      e.official_receipt_file_url,
      e.official_receipt_file_name,
      e.official_receipt_file_type,
      e.agreed_to_terms,
      e.agreed_at,
      e.created_at,
      e.updated_at,
      s.first_name,
      s.middle_name,
      s.last_name,
      s.suffix,
      CONCAT(s.first_name, ' ', IFNULL(CONCAT(s.middle_name, ' '), ''), s.last_name, IFNULL(CONCAT(' ', s.suffix), '')) AS full_name,
      p.program_name,
      p.program_code
    FROM enrollments e
    LEFT JOIN students s ON e.student_id = s.student_id
    LEFT JOIN programs p ON e.program_id = p.program_id
    ORDER BY e.created_at DESC
    LIMIT ? OFFSET ?`,
    [limit, offset]
  );

  return {
    data,
    limit,
    offset,
  };
}

export async function findEnrollmentApplicantDetails(id) {
  const [rows] = await db.query(
    `SELECT
      e.enrollment_id,
      e.student_id,
      e.program_id,
      e.modality_id,
      e.student_type_id,
      e.year_level,
      e.semester_types AS semester,
      e.academic_year,
      e.enrollment_date,
      e.queue_number,
      e.application_status,
      e.special_remarks,
      e.official_receipt_number,
      e.official_receipt_file_url,
      e.official_receipt_file_name,
      e.official_receipt_file_type,
      e.agreed_to_terms,
      e.agreed_at,
      e.created_at,
      e.updated_at,
      e.highest_attainment,
      e.last_school_attended,
      e.last_school_year,
      e.is_working,
      e.mother_maiden_name,
      e.father_name,
      e.guardian_name,
      e.guardian_contact,
      s.first_name,
      s.middle_name,
      s.last_name,
      s.suffix,
      CONCAT(s.first_name, ' ', IFNULL(CONCAT(s.middle_name, ' '), ''), s.last_name, IFNULL(CONCAT(' ', s.suffix), '')) AS full_name,
      s.email_address,
      s.contact_number,
      s.profile_photo_url AS photo,
      s.birth_date,
      s.birth_place,
      s.complete_address,
      s.sex,
      s.civil_status,
      s.nationality,
      s.religion,
      p.program_name,
      p.program_code,
      st.type_name AS student_type,
      lm.modality_name AS modality_name,
      e.year_level,
      e.semester_types,
      ${studentStatusSql("s")} AS enrollment_status
    FROM enrollments e
    LEFT JOIN students s ON e.student_id = s.student_id
    LEFT JOIN programs p ON e.program_id = p.program_id
    LEFT JOIN student_types st ON e.student_type_id = st.type_id
    LEFT JOIN learning_modalities lm ON e.modality_id = lm.modality_id
    WHERE e.enrollment_id = ?
    LIMIT 1`,
    [id]
  );

  return rows[0] || null;
}

export async function findStudents(query) {
  const { limit, offset } = normalizePagination(query, { defaultLimit: 25, maxLimit: 100 });
  const { course, status, search } = query;
  const filters = [];
  const values = [];

  if (course) {
    filters.push("(p.program_code = ? OR p.program_name = ?)");
    values.push(course, course);
  }

  if (status) {
    filters.push(`${studentStatusSql("s")} = ?`);
    values.push(status);
  }

  if (search) {
    filters.push(`(
      ${fullNameSql("s")} LIKE ?
      OR s.email_address LIKE ?
      OR CAST(s.student_id AS CHAR) LIKE ?
    )`);
    const searchValue = `%${search}%`;
    values.push(searchValue, searchValue, searchValue);
  }

  const whereClause = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

  const [data] = await db.query(
    `SELECT
      s.student_id,
      s.first_name,
      s.middle_name,
      s.last_name,
      s.suffix,
      ${fullNameSql("s")} AS full_name,
      s.email_address,
      s.contact_number,
      s.profile_photo_url AS photo,
      ${studentStatusSql("s")} AS enrollment_status,
      e.enrollment_id,
      e.queue_number,
      e.year_level,
      e.application_status,
      e.official_receipt_file_url,
      st.type_name AS student_type,
      p.program_name,
      p.program_code,
      s.created_date,
      s.updated_at
    FROM students s
    ${latestEnrollmentJoinSql("e", "le")}
    LEFT JOIN programs p ON e.program_id = p.program_id
    LEFT JOIN student_types st ON e.student_type_id = st.type_id
    ${whereClause}
    ORDER BY s.created_date DESC
    LIMIT ? OFFSET ?`,
    [...values, limit, offset]
  );
  const [[countResult]] = await db.query(
    `SELECT COUNT(*) AS total
    FROM students s
    ${latestEnrollmentJoinSql("e", "le")}
    LEFT JOIN programs p ON e.program_id = p.program_id
    LEFT JOIN student_types st ON e.student_type_id = st.type_id
    ${whereClause}`,
    values
  );

  return {
    total: Number(countResult.total || 0),
    limit,
    offset,
    data,
  };
}

export async function findStudentById(id) {
  const [rows] = await db.query("SELECT * FROM students WHERE student_id = ? LIMIT 1", [id]);
  return rows[0] || null;
}

export async function findStudentProfile({ studentId, email }) {
  const [rows] = await db.query(
    `SELECT
      ${Student.getProfileSelectionSql()},
      s.profile_photo_url AS photo,
      p.program_name,
      p.program_code,
      st.type_name AS student_type,
      lm.modality_name AS modality_name,
      e.year_level,
      e.semester_types,
      e.academic_year,
      e.queue_number,
      e.application_status,
      e.special_remarks,
      e.official_receipt_number,
      e.official_receipt_file_url,
      e.official_receipt_file_name,
      e.official_receipt_file_type
    FROM students s
    ${latestEnrollmentJoinSql("e", "le")}
    LEFT JOIN programs p ON e.program_id = p.program_id
    LEFT JOIN learning_modalities lm ON e.modality_id = lm.modality_id
    LEFT JOIN student_types st ON e.student_type_id = st.type_id
    WHERE s.student_id = ? OR s.email_address = ?
    LIMIT 1`,
    [studentId || null, email || null]
  );

  return rows[0] || null;
}

async function resolveEnrollmentTarget({ enrollmentId, studentId, email }) {
  if (enrollmentId) {
    const [rows] = await db.query(
      `SELECT enrollment_id, student_id
      FROM enrollments
      WHERE enrollment_id = ?
      LIMIT 1`,
      [enrollmentId]
    );
    return rows[0] || null;
  }

  const [rows] = await db.query(
    `SELECT e.enrollment_id, s.student_id
    FROM students s
    ${latestEnrollmentJoinSql("e", "le")}
    WHERE s.student_id = ? OR s.email_address = ?
    LIMIT 1`,
    [studentId || null, email || null]
  );

  return rows[0] || null;
}

export async function updateStudentProfile(payload) {
  const updates = [];
  const values = [];

  if (payload.contactNumber != null) {
    updates.push("contact_number = ?");
    values.push(payload.contactNumber);
  }
  if (payload.birthDate != null) {
    updates.push("birth_date = ?");
    values.push(payload.birthDate);
  }
  if (payload.completeAddress != null) {
    updates.push("complete_address = ?");
    values.push(payload.completeAddress);
  }
  if (payload.sex != null) {
    updates.push("sex = ?");
    values.push(payload.sex);
  }

  if (payload.profilePhotoUrl != null) {
    updates.push("profile_photo_url = ?");
    values.push(payload.profilePhotoUrl);
  }

  if (!updates.length) {
    throw new Error("No profile fields provided to update.");
  }

  let whereClause;
  let whereValue;

  if (payload.studentId) {
    whereClause = "student_id = ?";
    whereValue = payload.studentId;
  } else if (payload.email) {
    whereClause = "email_address = ?";
    whereValue = payload.email;
  } else {
    throw new Error("Student id or email is required to update profile.");
  }

  values.push(whereValue);

  const [result] = await db.query(
    `UPDATE students SET ${updates.join(", ")} WHERE ${whereClause}`,
    values
  );

  if (result.affectedRows === 0) {
    throw new Error("Student profile not found.");
  }

  return findStudentProfile({ studentId: payload.studentId, email: payload.email });
}

export async function updateStudentStatus(payload) {
  const isActive = payload.status === "Active" ? 1 : 0;
  const whereClause = payload.studentId ? "student_id = ?" : "email_address = ?";
  const whereValue = payload.studentId || payload.email;

  const [result] = await db.query(
    `UPDATE students SET is_active = ?, updated_at = NOW() WHERE ${whereClause}`,
    [isActive, whereValue]
  );

  if (result.affectedRows === 0) {
    throw new Error("Student account not found.");
  }

  return findStudentProfile({ studentId: payload.studentId, email: payload.email });
}

export async function updateStudentAccount(payload) {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const target = await resolveStudentAccountTarget(connection, payload);
    if (!target?.student_id) {
      throw new Error("Student account not found.");
    }

    const nameParts = splitFullName(payload.fullName);
    await connection.query(
      `UPDATE students
      SET first_name = ?,
          middle_name = ?,
          last_name = ?,
          suffix = ?,
          email_address = ?,
          is_active = ?,
          updated_at = NOW()
      WHERE student_id = ?`,
      [
        nameParts.firstName,
        nameParts.middleName,
        nameParts.lastName,
        nameParts.suffix,
        payload.email,
        payload.status === "Active" ? 1 : 0,
        target.student_id,
      ]
    );

    const enrollment = await findLatestEnrollmentForStudent(connection, target.student_id);
    if (enrollment?.enrollment_id) {
      const enrollmentUpdates = [];
      const enrollmentValues = [];

      if (payload.course) {
        const programId = await Lookup.resolveProgramId(connection, payload.course);
        if (programId) {
          enrollmentUpdates.push("program_id = ?");
          enrollmentValues.push(programId);
        }
      }

      if (payload.studentType) {
        const studentTypeId = await Lookup.resolveStudentTypeId(connection, payload.studentType);
        if (studentTypeId) {
          enrollmentUpdates.push("student_type_id = ?");
          enrollmentValues.push(studentTypeId);
        }
      }

      if (enrollmentUpdates.length) {
        enrollmentUpdates.push("updated_at = NOW()");
        await connection.query(
          `UPDATE enrollments SET ${enrollmentUpdates.join(", ")} WHERE enrollment_id = ?`,
          [...enrollmentValues, enrollment.enrollment_id]
        );
      }
    }

    await connection.commit();
    return findStudentProfile({ studentId: target.student_id, email: payload.email });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function resolveStudentAccountTarget(connection, payload) {
  const [rows] = await connection.query(
    `SELECT student_id
    FROM students
    WHERE student_id = ? OR email_address = ? OR email_address = ?
    LIMIT 1`,
    [payload.studentId || null, payload.originalEmail || null, payload.email || null]
  );

  return rows[0] || null;
}

async function findLatestEnrollmentForStudent(connection, studentId) {
  const [rows] = await connection.query(
    `SELECT enrollment_id
    FROM enrollments
    WHERE student_id = ?
    ORDER BY enrollment_id DESC
    LIMIT 1`,
    [studentId]
  );

  return rows[0] || null;
}

function splitFullName(fullName) {
  const parts = String(fullName || "").trim().split(/\s+/).filter(Boolean);

  if (parts.length <= 1) {
    return {
      firstName: parts[0] || "Student",
      middleName: null,
      lastName: "",
      suffix: null,
    };
  }

  return {
    firstName: parts[0],
    middleName: parts.length > 2 ? parts.slice(1, -1).join(" ") : null,
    lastName: parts.at(-1),
    suffix: null,
  };
}

export async function updateStudentReceipt(payload) {
  const enrollmentTarget = await resolveEnrollmentTarget(payload);

  if (!enrollmentTarget?.enrollment_id) {
    throw new Error("Enrollment record not found for official receipt update.");
  }

  const updates = [];
  const values = [];

  if (payload.officialReceiptNumber !== undefined) {
    updates.push("official_receipt_number = ?");
    values.push(payload.officialReceiptNumber ?? null);
  }

  if (payload.officialReceiptFileUrl != null) {
    updates.push("official_receipt_file_url = ?");
    values.push(payload.officialReceiptFileUrl);
    updates.push("official_receipt_file_name = ?");
    values.push(payload.officialReceiptFileName ?? null);
    updates.push("official_receipt_file_type = ?");
    values.push(payload.officialReceiptFileType ?? null);
  }

  if (!updates.length) {
    throw new Error("No official receipt fields provided to update.");
  }

  values.push(enrollmentTarget.enrollment_id);

  const [result] = await db.query(
    `UPDATE enrollments
    SET ${updates.join(", ")}
    WHERE enrollment_id = ?`,
    values
  );

  if (result.affectedRows === 0) {
    throw new Error("Enrollment record not found.");
  }

  return findStudentProfile({
    studentId: payload.studentId || enrollmentTarget.student_id,
    email: payload.email,
  });
}

export async function updateEnrollmentStatus(payload) {
  const enrollmentId = Number.parseInt(payload.enrollmentId, 10);

  if (!Number.isInteger(enrollmentId) || enrollmentId <= 0) {
    throw new Error("A valid enrollment id is required to update status.");
  }

  const [result] = await db.query(
    `UPDATE enrollments
    SET application_status = ?, updated_at = NOW()
    WHERE enrollment_id = ?`,
    [payload.applicationStatus, enrollmentId]
  );

  if (result.affectedRows === 0) {
    throw new Error("Enrollment record not found.");
  }

  return findEnrollmentApplicantDetails(enrollmentId);
}

export async function findRegistrarApprovalDrafts() {
  await ensureRegistrarApprovalDraftsTableShape();

  const [rows] = await db.query(`
    SELECT
      draft_id,
      enrollment_id,
      student_id,
      created_at,
      updated_at
    FROM registrar_approval_drafts
    ORDER BY updated_at DESC
  `);

  return rows;
}

export async function saveRegistrarApprovalDraft(payload) {
  await ensureRegistrarApprovalDraftsTableShape();

  const enrollmentId = Number.parseInt(payload.enrollmentId, 10);
  const studentId = payload.studentId ? Number.parseInt(payload.studentId, 10) : null;

  if (!Number.isInteger(enrollmentId) || enrollmentId <= 0) {
    throw new Error("A valid enrollment id is required to save a registrar approval draft.");
  }

  await db.query(
    `INSERT INTO registrar_approval_drafts (enrollment_id, student_id)
     VALUES (?, ?)
     ON DUPLICATE KEY UPDATE
       student_id = VALUES(student_id),
       updated_at = CURRENT_TIMESTAMP`,
    [enrollmentId, Number.isInteger(studentId) && studentId > 0 ? studentId : null]
  );

  const [rows] = await db.query(
    `SELECT
      draft_id,
      enrollment_id,
      student_id,
      created_at,
      updated_at
    FROM registrar_approval_drafts
    WHERE enrollment_id = ?
    LIMIT 1`,
    [enrollmentId]
  );

  return rows[0] || { enrollment_id: enrollmentId, student_id: studentId };
}

export async function deleteRegistrarApprovalDraft(payload) {
  await ensureRegistrarApprovalDraftsTableShape();

  const enrollmentId = Number.parseInt(payload.enrollmentId, 10);

  if (!Number.isInteger(enrollmentId) || enrollmentId <= 0) {
    throw new Error("A valid enrollment id is required to delete a registrar approval draft.");
  }

  await db.query(
    `DELETE FROM registrar_approval_drafts
     WHERE enrollment_id = ?`,
    [enrollmentId]
  );

  return { enrollment_id: enrollmentId };
}

export async function searchStudentsByName(searchQuery) {
  const query = `%${searchQuery}%`;

  const [rows] = await db.query(
    `SELECT
      s.student_id,
      s.first_name,
      s.middle_name,
      s.last_name,
      s.suffix,
      s.email_address,
      CONCAT(s.first_name, ' ', IFNULL(CONCAT(s.middle_name, ' '), ''), s.last_name, IFNULL(CONCAT(' ', s.suffix), '')) AS full_name
    FROM students s
    WHERE CONCAT(s.first_name, ' ', IFNULL(CONCAT(s.middle_name, ' '), ''), s.last_name) LIKE ?
    LIMIT 10`,
    [query]
  );

  return rows;
}
