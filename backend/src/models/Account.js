import db from "../config/db.js";

class Account {
  static async findByEmail(email) {
    // Note: Your schema has both 'users' and 'accounts'. 
    // Usually, you check against the one used for login.
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    return rows[0];
  }

  static async getRole(roleId) {
    const [rows] = await db.query("SELECT role_name FROM role WHERE id = ?", [roleId]);
    return rows[0]?.role_name;
  }
}

export default Account;