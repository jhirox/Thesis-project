import db from "../config/db.js";

class Enrollment {
  static async getAllDetailed() {
    const sql = `
      SELECT e.*, s.first_name, s.last_name, p.program_name 
      FROM enrollments e
      JOIN students s ON e.student_id = s.student_id
      JOIN programs p ON e.program_id = p.program_id
      ORDER BY e.created_at DESC
    `;
    const [rows] = await db.query(sql);
    return rows;
  }

  static async getRecent(limit = 5) {
    const [rows] = await db.query(
      "SELECT * FROM enrollments ORDER BY created_at DESC LIMIT ?", 
      [limit]
    );
    return rows;
  }

  static async create(connection, data) {
    const sql = `
      INSERT INTO enrollments (
        student_id, program_id, modality_id, student_type_id, 
        semester_types, academic_year, queue_number, application_status, agreed_to_terms
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'Submitted', ?)
    `;
    const [result] = await connection.query(sql, [
      data.studentId, data.programId, data.modalityId, data.studentTypeId,
      data.semester, data.academicYear, data.queueNumber, data.agreedToTerms
    ]);
    return result.insertId;
  }
}

export default Enrollment;