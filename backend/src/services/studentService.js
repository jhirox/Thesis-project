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
      semester: payload.semester,
      academicYear: (payload.academicYear ?? payload.lastSchoolYear) || null,
      queueNumber,
      remarks: payload.remarks,
      agreedToTerms: payload.agreedToTerms,
      formattedAgreedAt: agreedAtDate,
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
      e.application_status,
      e.official_receipt_file_url,
      p.program_name,
      p.program_code
    FROM students s
    ${latestEnrollmentJoinSql("e", "le")}
    LEFT JOIN programs p ON e.program_id = p.program_id
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
