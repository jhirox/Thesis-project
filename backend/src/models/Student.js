import db from "../config/db.js";

class Student {
  static async findAll() {
    const [rows] = await db.query("SELECT * FROM students");
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.query("SELECT * FROM students WHERE student_id = ?", [id]);
    return rows[0];
  }

  static async findByEmail(email) {
    const [rows] = await db.query("SELECT * FROM students WHERE email_address = ?", [email]);
    return rows[0];
  }

  static async updateProfile(id, data) {
    const { contactNumber, birthDate, completeAddress, sex } = data;
    const sql = `
      UPDATE students 
      SET contact_number = ?, birth_date = ?, complete_address = ?, sex = ?, updated_at = NOW()
      WHERE student_id = ?
    `;
    return await db.query(sql, [contactNumber, birthDate, completeAddress, sex, id]);
  }
}

export default Student;