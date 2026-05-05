import db from "../config/db.js";
import { fullNameSql, studentStatusSql } from "../utils/sqlBuilders.js";

const DEFAULT_PROFILE_PHOTO_URL = "/assets/images/lancephoto.png";

class Student {
  static async findById(id) {
    const [rows] = await db.query("SELECT * FROM students WHERE student_id = ?", [id]);
    return rows[0];
  }

  // Used by findStudentProfile and updateStudentProfile
  static getProfileSelectionSql() {
    // NOTE:
    // `profile.html` expects enrollment/family-extra fields to come from the
    // latest enrollment record (stored in `enrollments`).
    // In `studentService.findStudentProfile()`, we join the latest enrollment
    // via `latestEnrollmentJoinSql("e","le")`, so selecting from `e.*` is correct.
    return `
      s.student_id, s.first_name, s.middle_name, s.last_name, s.suffix,
      ${fullNameSql("s")} AS full_name, s.email_address, s.contact_number,
      s.birth_date, s.birth_place, s.complete_address, s.sex,
      s.civil_status, s.spouse_name, s.nationality, s.religion,

      -- Academic/Enrollment (from latest enrollment)
      e.program_id,
      e.modality_id,
      e.student_type_id,
      e.year_level,
      e.semester_types AS semester,
      e.academic_year,
      e.queue_number,
      e.application_status,
      e.special_remarks,
      e.official_receipt_number,
      e.official_receipt_file_url,
      e.official_receipt_file_name,
      e.official_receipt_file_type,

      e.highest_attainment,
      e.last_school_attended,
      e.last_school_year,
      e.is_working,

      e.mother_maiden_name,
      e.father_name,
      e.guardian_name,
      e.guardian_contact,

      ${studentStatusSql("s")} AS enrollment_status
    `;
  }

  static async upsert(connection, data) {
    const sql = `
      INSERT INTO students (
        first_name, middle_name, last_name, suffix, birth_date, birth_place, sex,
        civil_status, spouse_name, nationality, religion, email_address,
        contact_number, complete_address, profile_photo_url, is_active, created_date, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())
      ON DUPLICATE KEY UPDATE
        student_id = LAST_INSERT_ID(student_id),
        first_name = VALUES(first_name),
        updated_at = NOW()`;
    
    const [result] = await connection.query(sql, [
      data.firstName, data.middleName, data.lastName, data.suffix,
      data.birthDate, data.birthPlace, data.sex, data.civilStatus || "Single",
      data.spouseName, data.nationality, data.religion, data.email,
      data.contactNumber, data.address, data.profilePhotoUrl || DEFAULT_PROFILE_PHOTO_URL
    ]);
    return result.insertId;
  }
}

export default Student;
