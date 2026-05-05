import db from "../config/db.js";
import { fullNameSql, studentStatusSql } from "../utils/sqlBuilders.js";

class Student {
  static async findById(id) {
    const [rows] = await db.query("SELECT * FROM students WHERE student_id = ?", [id]);
    return rows[0];
  }

  // Used by findStudentProfile and updateStudentProfile
  static getProfileSelectionSql() {
    return `
      s.student_id, s.first_name, s.middle_name, s.last_name, s.suffix,
      ${fullNameSql("s")} AS full_name, s.email_address, s.contact_number,
      s.birth_date, s.birth_place, s.complete_address, s.sex,
      s.civil_status, s.spouse_name, s.nationality, s.religion,
      ${studentStatusSql("s")} AS enrollment_status
    `;
  }

  static async upsert(connection, data) {
    const sql = `
      INSERT INTO students (
        first_name, middle_name, last_name, suffix, birth_date, birth_place, sex,
        civil_status, spouse_name, nationality, religion, email_address,
        contact_number, complete_address, is_active, created_date, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())
      ON DUPLICATE KEY UPDATE
        student_id = LAST_INSERT_ID(student_id),
        first_name = VALUES(first_name),
        updated_at = NOW()`;
    
    const [result] = await connection.query(sql, [
      data.firstName, data.middleName, data.lastName, data.suffix,
      data.birthDate, data.birthPlace, data.sex, data.civilStatus || "Single",
      data.spouseName, data.nationality, data.religion, data.email,
      data.contactNumber, data.address
    ]);
    return result.insertId;
  }
}

export default Student;