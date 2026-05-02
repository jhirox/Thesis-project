import db from "../config/db.js";
import Student from "../models/Student.js";
import Enrollment from "../models/Enrollment.js";
import ApplicationQueue from "../models/ApplicationQueue.js";
import Lookup from "../models/Lookup.js";
import { normalizePagination } from "../utils/sqlBuilders.js";

export async function submitEnrollment(payload) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const programId = await Lookup.resolveProgramId(connection, payload.program);
    const studentId = await Student.upsert(connection, payload);

    const queueNumber = await ApplicationQueue.getNextPosition(connection);
    const enrollmentId = await Enrollment.insert(connection, {
      studentId,
      programId,
      modalityId: payload.learningModality,
      studentTypeId: payload.studentType,
      semester: payload.semester,
      academicYear: payload.academicYear || null,
      queueNumber,
      remarks: payload.remarks,
      agreedToTerms: payload.agreedToTerms,
      formattedAgreedAt: payload.agreedAt,
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
      s.complete_address,
      p.program_name,
      p.program_code
    FROM enrollments e
    LEFT JOIN students s ON e.student_id = s.student_id
    LEFT JOIN programs p ON e.program_id = p.program_id
    WHERE e.enrollment_id = ?
    LIMIT 1`,
    [id]
  );

  return rows[0] || null;
}

export async function findStudents(query) {
  const { limit, offset } = normalizePagination(query, { defaultLimit: 25, maxLimit: 100 });
  const [data] = await db.query(
    `SELECT * FROM students ORDER BY created_date DESC LIMIT ? OFFSET ?`,
    [limit, offset]
  );
  const [[countResult]] = await db.query("SELECT COUNT(*) AS total FROM students");

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
    `SELECT * FROM student_profile_view WHERE student_id = ? OR email_address = ? LIMIT 1`,
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
