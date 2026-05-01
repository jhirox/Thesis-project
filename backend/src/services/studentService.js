import db from "../config/db.js";
import { badRequest, notFound } from "../utils/httpError.js";
import {
  fullNameSql,
  latestEnrollmentJoinSql,
  normalizePagination,
  studentStatusSql,
} from "../utils/sqlBuilders.js";

const lookupTables = {
  learningModality: {
    table: "learning_modalities",
    idColumn: "modality_id",
    nameColumn: "modality_name",
  },
  studentType: {
    table: "student_types",
    idColumn: "type_id",
    nameColumn: "type_name",
  },
};

export async function findStudents(query = {}) {
  const { limit, offset } = normalizePagination(query);
  const program = query.program || query.course;
  const status = query.status;
  const search = query.search?.trim();
  const params = [];
  const countParams = [];
  let whereSql = "WHERE 1=1";

  if (program) {
    whereSql += ` AND (
      CAST(p.program_id AS CHAR) = ?
      OR p.program_code LIKE ?
      OR p.program_name LIKE ?
    )`;
    const programSearch = `%${program}%`;
    params.push(program, programSearch, programSearch);
    countParams.push(program, programSearch, programSearch);
  }

  if (status && ["active", "inactive"].includes(status.toLowerCase())) {
    whereSql += " AND s.is_active = ?";
    const activeValue = status.toLowerCase() === "active" ? 1 : 0;
    params.push(activeValue);
    countParams.push(activeValue);
  }

  if (search) {
    whereSql += ` AND (
      s.first_name LIKE ?
      OR s.middle_name LIKE ?
      OR s.last_name LIKE ?
      OR s.email_address LIKE ?
      OR ${fullNameSql("s")} LIKE ?
    )`;
    const searchValue = `%${search}%`;
    params.push(searchValue, searchValue, searchValue, searchValue, searchValue);
    countParams.push(searchValue, searchValue, searchValue, searchValue, searchValue);
  }

  const baseFromSql = `
    FROM students s
    ${latestEnrollmentJoinSql("e", "le")}
    LEFT JOIN programs p ON e.program_id = p.program_id
    ${whereSql}
  `;

  const [rows] = await db.query(
    `
      SELECT
        s.student_id,
        s.first_name,
        s.middle_name,
        s.last_name,
        s.suffix,
        ${fullNameSql("s")} AS full_name,
        s.email_address,
        s.contact_number,
        s.is_active,
        ${studentStatusSql("s")} AS status,
        p.program_id,
        p.program_code,
        p.program_name,
        e.enrollment_id,
        e.queue_number,
        e.application_status,
        e.created_at AS latest_enrollment_created_at
      ${baseFromSql}
      ORDER BY s.created_date DESC, s.student_id DESC
      LIMIT ? OFFSET ?
    `,
    [...params, limit, offset]
  );

  const [[countRow]] = await db.query(
    `SELECT COUNT(*) AS total ${baseFromSql}`,
    countParams
  );

  return {
    data: rows,
    total: countRow.total || 0,
    limit,
    offset,
  };
}

export async function findStudentById(studentId) {
  if (!studentId) {
    throw badRequest("Student ID is required");
  }

  const [rows] = await db.query(
    "SELECT * FROM students WHERE student_id = ?",
    [studentId]
  );

  if (rows.length === 0) {
    throw notFound("Student not found");
  }

  return rows[0];
}

export async function submitEnrollment(payload) {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const programId = await resolveProgramId(connection, payload.program);
    const modalityId = await resolveLookupId(
      connection,
      "learningModality",
      payload.learningModality
    );
    const studentTypeId = await resolveLookupId(
      connection,
      "studentType",
      payload.studentType
    );

    if (!programId || !modalityId || !studentTypeId) {
      throw badRequest(
        "Some enrollment options are not configured in the database yet. Please check programs, modalities, and student types."
      );
    }

    const studentId = await upsertStudent(connection, payload);

    await upsertAcademicHistory(connection, {
      studentId,
      highestAttainment: payload.highestAttainment,
      lastSchool: payload.lastSchool,
      lastSchoolYear: payload.lastSchoolYear,
      workingStatus: payload.workingStatus,
    });

    await upsertFamilyInformation(connection, {
      studentId,
      motherMaiden: payload.motherMaiden,
      fatherName: payload.fatherName,
      guardianName: payload.guardianName,
      guardianContact: payload.guardianContact,
    });

    const queueNumber = await generateQueueNumber(connection);
    const academicYear = getAcademicYear();
    const submittedAt = payload.agreedAt || new Date().toISOString();

    const [result] = await connection.query(
      `INSERT INTO enrollments (
        student_id, program_id, modality_id, student_type_id, semester_types,
        academic_year, enrollment_date, queue_number, application_status,
        special_remarks, agreed_to_terms, agreed_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, NOW(), ?, 'Submitted', ?, ?, ?, NOW(), NOW())`,
      [
        studentId,
        programId,
        modalityId,
        studentTypeId,
        payload.semester,
        academicYear,
        queueNumber,
        payload.remarks,
        payload.agreedToTerms ? 1 : 0,
        formatForMysqlTimestamp(submittedAt),
      ]
    );

    await connection.query(
      `INSERT INTO application_queue (
        enrollment_id, queued_at, position, status
      ) VALUES (?, NOW(), ?, 'Waiting')`,
      [result.insertId, await getNextQueuePosition(connection)]
    );

    await connection.commit();

    return {
      studentId,
      enrollmentId: result.insertId,
      queueNumber,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function findEnrollments(query = {}) {
  const { limit, offset } = normalizePagination(query);
  const program = query.program || query.course;
  const status = query.status;
  const search = query.search?.trim();
  const params = [];
  const countParams = [];
  let whereSql = "WHERE 1=1";

  if (program) {
    whereSql += ` AND (
      CAST(p.program_id AS CHAR) = ?
      OR p.program_code LIKE ?
      OR p.program_name LIKE ?
    )`;
    const programSearch = `%${program}%`;
    params.push(program, programSearch, programSearch);
    countParams.push(program, programSearch, programSearch);
  }

  if (status) {
    whereSql += " AND e.application_status = ?";
    params.push(status);
    countParams.push(status);
  }

  if (search) {
    whereSql += ` AND (
      s.first_name LIKE ?
      OR s.middle_name LIKE ?
      OR s.last_name LIKE ?
      OR s.email_address LIKE ?
      OR ${fullNameSql("s")} LIKE ?
      OR e.queue_number LIKE ?
    )`;
    const searchValue = `%${search}%`;
    params.push(searchValue, searchValue, searchValue, searchValue, searchValue, searchValue);
    countParams.push(searchValue, searchValue, searchValue, searchValue, searchValue, searchValue);
  }

  const baseFromSql = `
    FROM enrollments e
    LEFT JOIN students s ON s.student_id = e.student_id
    LEFT JOIN programs p ON p.program_id = e.program_id
    ${whereSql}
  `;

  const [rows] = await db.query(
    `
      SELECT
        e.enrollment_id,
        e.student_id,
        e.program_id,
        e.modality_id,
        e.student_type_id,
        e.semester_types,
        e.academic_year,
        e.enrollment_date,
        e.queue_number,
        e.application_status,
        e.special_remarks,
        e.agreed_to_terms,
        e.agreed_at,
        e.created_at,
        e.updated_at,
        s.first_name,
        s.middle_name,
        s.last_name,
        s.suffix,
        ${fullNameSql("s")} AS full_name,
        p.program_code,
        p.program_name
      ${baseFromSql}
      ORDER BY e.created_at DESC
      LIMIT ? OFFSET ?
    `,
    [...params, limit, offset]
  );

  const [[countRow]] = await db.query(
    `SELECT COUNT(*) AS total ${baseFromSql}`,
    countParams
  );

  return {
    data: rows,
    total: countRow.total || 0,
    limit,
    offset,
  };
}

export async function findRecentEnrollments(query = {}) {
  const requestedLimit = Number.parseInt(query.limit, 10);
  const limit =
    Number.isInteger(requestedLimit) && requestedLimit > 0
      ? Math.min(requestedLimit, 5)
      : 5;

  const [rows] = await db.query(
    `
      SELECT
        e.enrollment_id,
        e.student_id,
        e.queue_number,
        e.application_status,
        e.enrollment_date,
        e.created_at,
        e.updated_at,
        s.first_name,
        s.middle_name,
        s.last_name,
        s.suffix,
        ${fullNameSql("s")} AS full_name,
        p.program_code,
        p.program_name
      FROM enrollments e
      INNER JOIN students s ON s.student_id = e.student_id
      LEFT JOIN programs p ON p.program_id = e.program_id
      ORDER BY e.created_at DESC
      LIMIT ?
    `,
    [limit]
  );

  return { data: rows, limit };
}

export async function findEnrollmentApplicantDetails(id) {
  if (!id) {
    throw badRequest("Enrollment ID or application ID is required");
  }

  const numericEnrollmentId = Number.parseInt(id, 10);
  const isNumericEnrollmentId = Number.isInteger(numericEnrollmentId);

  const [rows] = await db.query(
    `
      SELECT
        e.enrollment_id,
        e.queue_number AS application_id,
        ${fullNameSql("s")} AS full_name,
        p.program_code,
        p.program_name
      FROM enrollments e
      INNER JOIN students s ON s.student_id = e.student_id
      LEFT JOIN programs p ON p.program_id = e.program_id
      WHERE e.queue_number = ?
         OR (? IS NOT NULL AND e.enrollment_id = ?)
      LIMIT 1
    `,
    [
      id,
      isNumericEnrollmentId ? numericEnrollmentId : null,
      isNumericEnrollmentId ? numericEnrollmentId : null,
    ]
  );

  if (rows.length === 0) {
    throw notFound("Enrollment or application not found");
  }

  const enrollment = rows[0];
  return {
    enrollmentId: enrollment.enrollment_id,
    applicationId: enrollment.application_id,
    fullName: enrollment.full_name,
    course: enrollment.program_code || enrollment.program_name || null,
    programCode: enrollment.program_code,
    programName: enrollment.program_name,
  };
}

export async function findStudentProfile({ id, email }) {
  if (!id && !email) {
    throw badRequest("Student id or email is required to fetch profile");
  }

  const whereClause = id ? "s.student_id = ?" : "s.email_address = ?";
  const whereValue = id || email;
  const [rows] = await db.query(buildStudentProfileQuery(whereClause), [whereValue]);

  if (rows.length === 0) {
    throw notFound("Profile not found");
  }

  return normalizeStudentProfile(rows[0]);
}

export async function updateStudentProfile(payload) {
  const lookupValue = payload.studentId || payload.email;
  const lookupQuery = payload.studentId
    ? "SELECT student_id FROM students WHERE student_id = ? LIMIT 1"
    : "SELECT student_id FROM students WHERE email_address = ? LIMIT 1";

  const [studentRows] = await db.query(lookupQuery, [lookupValue]);

  if (studentRows.length === 0) {
    throw notFound("Student not found");
  }

  const studentRecordId = studentRows[0].student_id;
  const updates = [];
  const params = [];

  if (payload.contactNumber !== undefined) {
    updates.push("contact_number = ?");
    params.push(payload.contactNumber || null);
  }

  if (payload.birthDate !== undefined) {
    updates.push("birth_date = ?");
    params.push(payload.birthDate || null);
  }

  if (payload.completeAddress !== undefined) {
    updates.push("complete_address = ?");
    params.push(payload.completeAddress || null);
  }

  if (payload.sex !== undefined) {
    updates.push("sex = ?");
    params.push(payload.sex || null);
  }

  if (updates.length === 0) {
    throw badRequest("No profile fields provided to update");
  }

  params.push(studentRecordId);
  await db.query(
    `
      UPDATE students
      SET ${updates.join(", ")}, updated_at = NOW()
      WHERE student_id = ?
    `,
    params
  );

  const [updatedRows] = await db.query(
    buildStudentProfileQuery("s.student_id = ?"),
    [studentRecordId]
  );

  return normalizeStudentProfile(updatedRows[0] || {});
}

async function upsertStudent(connection, payload) {
  const [result] = await connection.query(
    `INSERT INTO students (
      first_name, middle_name, last_name, suffix, birth_date, birth_place, sex,
      civil_status, spouse_name, nationality, religion, email_address,
      contact_number, complete_address, is_active, created_date, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())
    ON DUPLICATE KEY UPDATE
      student_id = LAST_INSERT_ID(student_id),
      first_name = VALUES(first_name),
      middle_name = VALUES(middle_name),
      last_name = VALUES(last_name),
      suffix = VALUES(suffix),
      birth_date = VALUES(birth_date),
      birth_place = VALUES(birth_place),
      sex = VALUES(sex),
      civil_status = VALUES(civil_status),
      spouse_name = VALUES(spouse_name),
      nationality = VALUES(nationality),
      religion = VALUES(religion),
      contact_number = VALUES(contact_number),
      complete_address = VALUES(complete_address),
      is_active = 1,
      updated_at = NOW()`,
    [
      payload.firstName,
      payload.middleName,
      payload.lastName,
      payload.suffix,
      payload.birthDate,
      payload.birthPlace,
      payload.sex,
      payload.civilStatus || "Single",
      payload.spouseName,
      payload.nationality,
      payload.religion,
      payload.email,
      payload.contactNumber,
      payload.address,
    ]
  );

  return result.insertId;
}

async function resolveProgramId(connection, programValue) {
  if (!programValue) {
    return null;
  }

  const [rows] = await connection.query(
    `SELECT program_id
     FROM programs
     WHERE program_name = ?
        OR program_code = ?
        OR CONCAT(program_code, ' - ', program_name) = ?
     LIMIT 1`,
    [programValue, programValue, programValue]
  );

  if (rows.length > 0) {
    return rows[0].program_id;
  }

  const fallbackMap = {
    "BSBA Major in Marketing Management": 1,
    "BSBA Major in Financial Management": 2,
    "BSBA Major in Human Resource Management": 3,
    "BSED Major in English": 4,
    "BSED Major in Mathematics": 5,
    "BSED Major in Filipino": 6,
    "BEED - Bachelor of Elementary Education": 7,
    "BSCS - Bachelor of Science in Computer Science": 8,
    "BSCRIM - Bachelor of Science in Criminology": 9,
  };

  return fallbackMap[programValue] || null;
}

async function resolveLookupId(connection, lookupKey, selectedValue) {
  if (!selectedValue) {
    return null;
  }

  const lookup = lookupTables[lookupKey];
  if (!lookup) {
    throw badRequest("Invalid lookup configuration");
  }

  const [rows] = await connection.query(
    `SELECT ${lookup.idColumn} AS id
     FROM ${lookup.table}
     WHERE ${lookup.nameColumn} = ?
     LIMIT 1`,
    [selectedValue]
  );

  return rows.length > 0 ? rows[0].id : null;
}

async function upsertAcademicHistory(connection, payload) {
  await connection.query(
    `INSERT INTO academic_history (
      history_id, highest_attainment, last_school_attended, last_school_year,
      is_working, student_id, created_at, updated_at
    ) VALUES (
      (
        SELECT history_id
        FROM (
          SELECT history_id
          FROM academic_history
          WHERE student_id = ?
          LIMIT 1
        ) existing_history
      ),
      ?, ?, ?, ?, ?, NOW(), NOW()
    )
    ON DUPLICATE KEY UPDATE
      highest_attainment = VALUES(highest_attainment),
      last_school_attended = VALUES(last_school_attended),
      last_school_year = VALUES(last_school_year),
      is_working = VALUES(is_working),
      updated_at = NOW()`,
    [
      payload.studentId,
      payload.highestAttainment,
      payload.lastSchool,
      payload.lastSchoolYear,
      payload.workingStatus === "Working student" ? 1 : 0,
      payload.studentId,
    ]
  );
}

async function upsertFamilyInformation(connection, payload) {
  await connection.query(
    `INSERT INTO family_information (
      family_id, mother_maiden_name, father_name, guardian_name,
      guardian_contact, student_id, created_at, updated_at
    ) VALUES (
      (
        SELECT family_id
        FROM (
          SELECT family_id
          FROM family_information
          WHERE student_id = ?
          LIMIT 1
        ) existing_family
      ),
      ?, ?, ?, ?, ?, NOW(), NOW()
    )
    ON DUPLICATE KEY UPDATE
      mother_maiden_name = VALUES(mother_maiden_name),
      father_name = VALUES(father_name),
      guardian_name = VALUES(guardian_name),
      guardian_contact = VALUES(guardian_contact),
      updated_at = NOW()`,
    [
      payload.studentId,
      payload.motherMaiden,
      payload.fatherName,
      payload.guardianName,
      payload.guardianContact,
      payload.studentId,
    ]
  );
}

async function generateQueueNumber(connection) {
  let queueNumber = "";
  let isUnique = false;

  while (!isUnique) {
    const letters = ["A", "B", "C", "D"];
    const letter = letters[Math.floor(Math.random() * letters.length)];
    const num = Math.floor(Math.random() * 900) + 100;
    queueNumber = `${letter}${num}`;

    const [existing] = await connection.query(
      "SELECT enrollment_id FROM enrollments WHERE queue_number = ? LIMIT 1",
      [queueNumber]
    );

    isUnique = existing.length === 0;
  }

  return queueNumber;
}

async function getNextQueuePosition(connection) {
  const [rows] = await connection.query(
    "SELECT COALESCE(MAX(position), 0) + 1 AS nextPosition FROM application_queue"
  );

  return rows[0]?.nextPosition || 1;
}

function getAcademicYear() {
  const now = new Date();
  const year = now.getFullYear();
  return `${year}-${year + 1}`;
}

function formatForMysqlTimestamp(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return new Date();
  }

  const pad = (num) => String(num).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
    date.getSeconds()
  )}`;
}

function buildStudentProfileQuery(whereClause) {
  return `
    SELECT
      s.student_id,
      s.first_name,
      s.middle_name,
      s.last_name,
      s.suffix,
      ${fullNameSql("s")} AS full_name,
      s.email_address,
      s.contact_number,
      s.birth_date,
      s.birth_place,
      s.complete_address,
      s.sex,
      s.civil_status,
      s.spouse_name,
      s.nationality,
      s.religion,
      ah.highest_attainment,
      ah.last_school_attended,
      ah.last_school_year,
      ah.is_working,
      fi.mother_maiden_name,
      fi.father_name,
      fi.guardian_name,
      fi.guardian_contact,
      fi.guardian_relationship,
      p.program_name,
      p.program_code,
      st.type_name AS student_type,
      e.semester_types,
      lm.modality_name AS modality_name,
      e.queue_number,
      e.application_status,
      e.special_remarks,
      e.academic_year,
      e.agreed_at,
      ${studentStatusSql("s")} AS enrollment_status
    FROM students s
    LEFT JOIN academic_history ah ON ah.student_id = s.student_id
    LEFT JOIN family_information fi ON fi.student_id = s.student_id
    ${latestEnrollmentJoinSql("e", "le")}
    LEFT JOIN programs p ON e.program_id = p.program_id
    LEFT JOIN learning_modalities lm ON e.modality_id = lm.modality_id
    LEFT JOIN student_types st ON e.student_type_id = st.type_id
    WHERE ${whereClause}
    LIMIT 1
  `;
}

function normalizeStudentProfile(profile) {
  if (profile.semester !== undefined && profile.semester_types === undefined) {
    profile.semester_types = profile.semester;
  }

  if (profile.learning_modality !== undefined && profile.modality_name === undefined) {
    profile.modality_name = profile.learning_modality;
  }

  return profile;
}
