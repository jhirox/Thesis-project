import db from "../config/db.js";

// GET all students
export const getStudents = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM students");
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No students found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Students retrieved successfully",
      totalStudents: rows.length,
      data: rows,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error in getting students",
      error: error.message,
    });
  }
};

// GET student by ID
export const getStudentByID = async (req, res) => {
  try {
    const studentId = req.params.id;
    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: "Student ID is required",
      });
    }

    const [rows] = await db.query(
      "SELECT * FROM students WHERE student_id = ?",
      [studentId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    res.status(200).json({
      success: true,
      studentDetails: rows[0],
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error in getting student by ID",
      error: error.message,
    });
  }
};

// POST submit enrollment
export const submitEnrollment = async (req, res) => {
  const connection = await db.getConnection();

  try {
    const {
      firstName,
      middleName,
      lastName,
      suffix,
      birthDate,
      birthPlace,
      sex,
      civilStatus,
      spouseName,
      nationality,
      religion,
      email,
      contactNumber,
      address,
      program,
      learningModality,
      studentType,
      highestAttainment,
      lastSchool,
      lastSchoolYear,
      semester,
      workingStatus,
      motherMaiden,
      fatherName,
      guardianName,
      guardianContact,
      remarks,
      agreedToTerms,
      agreedAt,
    } = req.body;

    const requiredFields = [
      ["firstName", firstName],
      ["lastName", lastName],
      ["birthDate", birthDate],
      ["sex", sex],
      ["email", email],
      ["contactNumber", contactNumber],
      ["program", program],
      ["learningModality", learningModality],
      ["studentType", studentType],
      ["highestAttainment", highestAttainment],
      ["semester", semester],
    ];

    const missingField = requiredFields.find(([, value]) => !value);
    if (missingField) {
      return res.status(400).json({
        success: false,
        message: `${missingField[0]} is required`,
      });
    }

    if (!agreedToTerms) {
      return res.status(400).json({
        success: false,
        message: "You must agree to the terms and conditions before submitting.",
      });
    }

    await connection.beginTransaction();

    const programId = await resolveProgramId(connection, program);
    const modalityId = await resolveLookupId(
      connection,
      "learning_modalities",
      "modality_id",
      "modality_name",
      learningModality
    );
    const studentTypeId = await resolveLookupId(
      connection,
      "student_types",
      "type_id",
      "type_name",
      studentType
    );

    if (!programId || !modalityId || !studentTypeId) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message:
          "Some enrollment options are not configured in the database yet. Please check programs, modalities, and student types.",
      });
    }

    let studentId;
    const [existingStudents] = await connection.query(
      "SELECT student_id FROM students WHERE email_address = ? LIMIT 1",
      [email.trim()]
    );

    if (existingStudents.length > 0) {
      studentId = existingStudents[0].student_id;
      await connection.query(
        `UPDATE students
         SET first_name = ?, middle_name = ?, last_name = ?, suffix = ?, birth_date = ?,
             birth_place = ?, sex = ?, civil_status = ?, spouse_name = ?, nationality = ?,
             religion = ?, email_address = ?, contact_number = ?, complete_address = ?,
             is_active = 1, updated_at = NOW()
         WHERE student_id = ?`,
        [
          firstName.trim(),
          normalizeNullable(middleName),
          lastName.trim(),
          normalizeNullable(suffix),
          birthDate,
          normalizeNullable(birthPlace),
          sex,
          normalizeNullable(civilStatus) || "Single",
          normalizeNullable(spouseName),
          normalizeNullable(nationality),
          normalizeNullable(religion),
          email.trim(),
          contactNumber.trim(),
          normalizeRequiredText(address),
          studentId,
        ]
      );
    } else {
      const [studentResult] = await connection.query(
        `INSERT INTO students (
          first_name, middle_name, last_name, suffix, birth_date, birth_place, sex,
          civil_status, spouse_name, nationality, religion, email_address,
          contact_number, complete_address, is_active, created_date, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())`,
        [
          firstName.trim(),
          normalizeNullable(middleName),
          lastName.trim(),
          normalizeNullable(suffix),
          birthDate,
          normalizeNullable(birthPlace),
          sex,
          normalizeNullable(civilStatus) || "Single",
          normalizeNullable(spouseName),
          normalizeNullable(nationality),
          normalizeNullable(religion),
          email.trim(),
          contactNumber.trim(),
          normalizeRequiredText(address),
        ]
      );

      studentId = studentResult.insertId;
    }

    await upsertAcademicHistory(connection, {
      studentId,
      highestAttainment,
      lastSchool,
      lastSchoolYear,
      workingStatus,
    });

    await upsertFamilyInformation(connection, {
      studentId,
      motherMaiden,
      fatherName,
      guardianName,
      guardianContact,
    });

    const queueNumber = await generateQueueNumber(connection);
    const academicYear = getAcademicYear();
    const submittedAt = agreedAt || new Date().toISOString();

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
        semester,
        academicYear,
        queueNumber,
        normalizeNullable(remarks),
        agreedToTerms ? 1 : 0,
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

    res.status(201).json({
      success: true,
      message: "Enrollment submitted successfully",
      studentId,
      enrollmentId: result.insertId,
      queueNumber,
    });
  } catch (error) {
    await connection.rollback();
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error submitting enrollment",
      error: error.message,
    });
  } finally {
    connection.release();
  }
};

// GET all enrollments
export const getEnrollments = async (req, res) => {
  try {
    const [rows] = await db.query(`
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
        CONCAT(
          s.first_name,
          ' ',
          IFNULL(CONCAT(s.middle_name, ' '), ''),
          s.last_name,
          IFNULL(CONCAT(' ', s.suffix), '')
        ) AS full_name,
        p.program_code,
        p.program_name
      FROM enrollments e
      LEFT JOIN students s ON s.student_id = e.student_id
      LEFT JOIN programs p ON p.program_id = e.program_id
      ORDER BY e.created_at DESC
    `);
    res.status(200).json({
      success: true,
      message: "Enrollments retrieved successfully",
      totalEnrollments: rows.length,
      data: rows,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error in getting enrollments",
      error: error.message,
    });
  }
};

export const getRecentEnrollments = async (req, res) => {
  try {
    const requestedLimit = Number.parseInt(req.query.limit, 10);
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
          CONCAT(
            s.first_name,
            ' ',
            IFNULL(CONCAT(s.middle_name, ' '), ''),
            s.last_name,
            IFNULL(CONCAT(' ', s.suffix), '')
          ) AS full_name,
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

    res.status(200).json({
      success: true,
      message: "Recent enrollments retrieved successfully",
      totalRecentEnrollments: rows.length,
      limit,
      data: rows,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error in getting recent enrollments",
      error: error.message,
    });
  }
};

export const getEnrollmentApplicantDetails = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Enrollment ID or application ID is required",
      });
    }

    const numericEnrollmentId = Number.parseInt(id, 10);
    const isNumericEnrollmentId = Number.isInteger(numericEnrollmentId);

    const [rows] = await db.query(
      `
        SELECT
          e.enrollment_id,
          e.queue_number AS application_id,
          CONCAT(
            s.first_name,
            ' ',
            IFNULL(CONCAT(s.middle_name, ' '), ''),
            s.last_name,
            IFNULL(CONCAT(' ', s.suffix), '')
          ) AS full_name,
          p.program_code,
          p.program_name
        FROM enrollments e
        INNER JOIN students s ON s.student_id = e.student_id
        LEFT JOIN programs p ON p.program_id = e.program_id
        WHERE e.queue_number = ?
           OR (? IS NOT NULL AND e.enrollment_id = ?)
        LIMIT 1
      `,
      [id, isNumericEnrollmentId ? numericEnrollmentId : null, isNumericEnrollmentId ? numericEnrollmentId : null]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Enrollment or application not found",
      });
    }

    const enrollment = rows[0];

    res.status(200).json({
      success: true,
      message: "Enrollment applicant details retrieved successfully",
      data: {
        enrollmentId: enrollment.enrollment_id,
        applicationId: enrollment.application_id,
        fullName: enrollment.full_name,
        course: enrollment.program_code || enrollment.program_name || null,
        programCode: enrollment.program_code,
        programName: enrollment.program_name,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error in getting enrollment applicant details",
      error: error.message,
    });
  }
};

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
    "BSCRIM - Bachelor of Science in Criminology": 9
  };

  return fallbackMap[programValue] || null;
}

async function resolveLookupId(
  connection,
  tableName,
  idColumn,
  nameColumn,
  selectedValue
) {
  if (!selectedValue) {
    return null;
  }

  const [rows] = await connection.query(
    `SELECT ${idColumn} AS id
     FROM ${tableName}
     WHERE ${nameColumn} = ?
     LIMIT 1`,
    [selectedValue]
  );

  return rows.length > 0 ? rows[0].id : null;
}

async function upsertAcademicHistory(connection, payload) {
  const [existing] = await connection.query(
    "SELECT history_id FROM academic_history WHERE student_id = ? LIMIT 1",
    [payload.studentId]
  );

  const values = [
    payload.highestAttainment,
    normalizeNullable(payload.lastSchool),
    normalizeNullable(payload.lastSchoolYear),
    payload.workingStatus === "Working student" ? 1 : 0,
    payload.studentId,
  ];

  if (existing.length > 0) {
    await connection.query(
      `UPDATE academic_history
       SET highest_attainment = ?, last_school_attended = ?, last_school_year = ?,
           is_working = ?, updated_at = NOW()
       WHERE student_id = ?`,
      values
    );
    return;
  }

  await connection.query(
    `INSERT INTO academic_history (
      highest_attainment, last_school_attended, last_school_year,
      is_working, student_id, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
    values
  );
}

async function upsertFamilyInformation(connection, payload) {
  const [existing] = await connection.query(
    "SELECT family_id FROM family_information WHERE student_id = ? LIMIT 1",
    [payload.studentId]
  );

  const values = [
    normalizeNullable(payload.motherMaiden),
    normalizeNullable(payload.fatherName),
    normalizeNullable(payload.guardianName),
    normalizeNullable(payload.guardianContact),
    payload.studentId,
  ];

  if (existing.length > 0) {
    await connection.query(
      `UPDATE family_information
       SET mother_maiden_name = ?, father_name = ?, guardian_name = ?,
           guardian_contact = ?, updated_at = NOW()
       WHERE student_id = ?`,
      values
    );
    return;
  }

  await connection.query(
    `INSERT INTO family_information (
      mother_maiden_name, father_name, guardian_name,
      guardian_contact, student_id, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
    values
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

function normalizeNullable(value) {
  if (value === undefined || value === null) {
    return null;
  }

  const normalized = String(value).trim();
  return normalized === "" ? null : normalized;
}

function normalizeRequiredText(value) {
  if (value === undefined || value === null) {
    return "";
  }

  return String(value).trim();
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
      CONCAT(
        s.first_name,
        ' ',
        IFNULL(CONCAT(s.middle_name, ' '), ''),
        s.last_name,
        IFNULL(CONCAT(' ', s.suffix), '')
      ) AS full_name,
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
      CASE
        WHEN s.is_active = 1 THEN 'Active'
        ELSE 'Inactive'
      END AS enrollment_status
    FROM students s
    LEFT JOIN academic_history ah ON ah.student_id = s.student_id
    LEFT JOIN family_information fi ON fi.student_id = s.student_id
    LEFT JOIN enrollments e ON s.student_id = e.student_id
      AND e.enrollment_id = (
        SELECT MAX(e2.enrollment_id)
        FROM enrollments e2
        WHERE e2.student_id = s.student_id
      )
    LEFT JOIN programs p ON e.program_id = p.program_id
    LEFT JOIN learning_modalities lm ON e.modality_id = lm.modality_id
    LEFT JOIN student_types st ON e.student_type_id = st.type_id
    WHERE ${whereClause}
    LIMIT 1
  `;
}

// GET profile data for the logged-in student
export const getStudentProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.query;

    if (!id && !email) {
      return res.status(400).json({
        success: false,
        message: 'Student id or email is required to fetch profile',
      });
    }

    const whereClause = id ? 's.student_id = ?' : 's.email_address = ?';
    const whereValue = id || email;

    const query = buildStudentProfileQuery(whereClause);

    const [rows] = await db.query(query, [whereValue]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    const profile = rows[0];
    if (profile.semester !== undefined && profile.semester_types === undefined) {
      profile.semester_types = profile.semester;
    }
    if (profile.learning_modality !== undefined && profile.modality_name === undefined) {
      profile.modality_name = profile.learning_modality;
    }

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error('Get student profile error:', error);
    res.status(500).json({ success: false, message: 'Error loading profile', error: error.message });
  }
};

export const updateStudentProfile = async (req, res) => {
  try {
    const { studentId, email, contactNumber, birthDate, completeAddress, sex } = req.body;

    if (!studentId && !email) {
      return res.status(400).json({
        success: false,
        message: 'Student id or email is required to update profile',
      });
    }

    const lookupQuery = studentId
      ? 'SELECT student_id FROM students WHERE student_id = ? LIMIT 1'
      : 'SELECT student_id FROM students WHERE email_address = ? LIMIT 1';

    const [studentRows] = await db.query(lookupQuery, [studentId || email]);

    if (studentRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const studentRecordId = studentRows[0].student_id;
    const updates = [];
    const params = [];

    if (contactNumber !== undefined) {
      updates.push('contact_number = ?');
      params.push(contactNumber.trim() || null);
    }

    if (birthDate !== undefined) {
      updates.push('birth_date = ?');
      params.push(birthDate || null);
    }

    if (completeAddress !== undefined) {
      updates.push('complete_address = ?');
      params.push(completeAddress.trim() || null);
    }

    if (sex !== undefined) {
      updates.push('sex = ?');
      params.push(sex || null);
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No profile fields provided to update' });
    }

    const updateQuery = `
      UPDATE students
      SET ${updates.join(', ')}, updated_at = NOW()
      WHERE student_id = ?
    `;

    params.push(studentRecordId);
    await db.query(updateQuery, params);

    const [updatedRows] = await db.query(
      buildStudentProfileQuery('s.student_id = ?'),
      [studentRecordId]
    );

    const updatedProfile = updatedRows[0] || {};
    if (updatedProfile.semester !== undefined && updatedProfile.semester_types === undefined) {
      updatedProfile.semester_types = updatedProfile.semester;
    }
    if (updatedProfile.learning_modality !== undefined && updatedProfile.modality_name === undefined) {
      updatedProfile.modality_name = updatedProfile.learning_modality;
    }

    res.status(200).json({ success: true, data: updatedProfile });
  } catch (error) {
    console.error('Update student profile error:', error);
    res.status(500).json({ success: false, message: 'Error updating profile', error: error.message });
  }
};
