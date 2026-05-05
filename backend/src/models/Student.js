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
      s.highest_attainment, s.last_school_attended, s.last_school_year,
      s.working_status, s.mother_maiden_name, s.father_name,
      s.guardian_name, s.guardian_contact,
      ${studentStatusSql("s")} AS enrollment_status
    `;
  }

  static async upsert(connection, data) {
    const sql = `
      INSERT INTO students (
        first_name, middle_name, last_name, suffix, birth_date, birth_place, sex,
        civil_status, spouse_name, nationality, religion, email_address,
        contact_number, complete_address, highest_attainment, last_school_attended,
        last_school_year, working_status, mother_maiden_name, father_name,
        guardian_name, guardian_contact, is_active, created_date, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())
      ON DUPLICATE KEY UPDATE
        student_id = LAST_INSERT_ID(student_id),
        first_name = VALUES(first_name),
        highest_attainment = VALUES(highest_attainment),
        last_school_attended = VALUES(last_school_attended),
        last_school_year = VALUES(last_school_year),
        working_status = VALUES(working_status),
        mother_maiden_name = VALUES(mother_maiden_name),
        father_name = VALUES(father_name),
        guardian_name = VALUES(guardian_name),
        guardian_contact = VALUES(guardian_contact),
        updated_at = NOW()`;
    
    const [result] = await connection.query(sql, [
      data.firstName, data.middleName, data.lastName, data.suffix,
      data.birthDate, data.birthPlace, data.sex, data.civilStatus || "Single",
      data.spouseName, data.nationality, data.religion, data.email,
      data.contactNumber, data.address, data.highestAttainment, data.lastSchool,
      data.lastSchoolYear, data.workingStatus, data.motherMaiden, data.fatherName,
      data.guardianName, data.guardianContact
    ]);
    return result.insertId;
  }
}

export default Student;