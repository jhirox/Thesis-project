import db from "../config/db.js";

class Enrollment {
  static async insert(connection, data) {
    const sql = `
      INSERT INTO enrollments (
        student_id, program_id, modality_id, student_type_id, semester_types,
        academic_year, enrollment_date, queue_number, application_status,
        special_remarks, agreed_to_terms, agreed_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, NOW(), ?, 'Submitted', ?, ?, ?, NOW(), NOW())`;

    const [result] = await connection.query(sql, [
      data.studentId, data.programId, data.modalityId, data.studentTypeId,
      data.semester, data.academicYear, data.queueNumber, data.remarks,
      data.agreedToTerms ? 1 : 0, data.formattedAgreedAt
    ]);
    return result.insertId;
  }

  static async isQueueNumberExists(connection, queueNumber) {
    const [rows] = await connection.query(
      "SELECT enrollment_id FROM enrollments WHERE queue_number = ? LIMIT 1",
      [queueNumber]
    );
    return rows.length > 0;
  }
}

export default Enrollment;