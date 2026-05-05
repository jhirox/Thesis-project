import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../config/db.js';

class AuthService {
  async ensureStaffAccountShape() {
    const [columns] = await db.query("SHOW COLUMNS FROM users");
    const columnNames = new Set(columns.map((column) => column.Field));

    if (!columnNames.has("full_name")) {
      await db.query("ALTER TABLE users ADD COLUMN full_name VARCHAR(150) NULL AFTER email");
    }

    if (!columnNames.has("updated_at")) {
      await db.query("ALTER TABLE users ADD COLUMN updated_at DATETIME NULL AFTER created_date");
    }
  }

  async findRoleId(roleName) {
    const normalizedRole = String(roleName || "").trim().toLowerCase();
    const roleCandidates = normalizedRole === "super admin" || normalizedRole === "superadmin"
      ? ["super admin", "superadmin"]
      : [normalizedRole];
    const [roles] = await db.query(
      "SELECT id, role_name FROM role WHERE LOWER(role_name) IN (?) LIMIT 1",
      [roleCandidates]
    );

    if (!roles.length) {
      throw new Error(`Role '${roleName}' is not configured.`);
    }

    return roles[0].id;
  }

  async listStaffAccounts() {
    await this.ensureStaffAccountShape();

    const [rows] = await db.query(`
      SELECT
        u.user_id,
        u.email,
        u.full_name,
        u.is_active,
        u.created_date,
        u.updated_at,
        r.role_name AS role
      FROM users u
      INNER JOIN role r ON r.id = u.role_id
      WHERE LOWER(r.role_name) IN ('admin', 'registrar', 'superadmin', 'super admin')
      ORDER BY
        FIELD(LOWER(r.role_name), 'superadmin', 'super admin', 'admin', 'registrar'),
        u.created_date DESC,
        u.user_id DESC
    `);

    return rows.map((row) => ({
      userId: row.user_id,
      email: row.email,
      fullName: row.full_name || this.getDisplayNameFromEmail(row.email),
      role: this.normalizeStaffRoleLabel(row.role),
      status: row.is_active === 1 ? "Active" : "Inactive",
      createdAt: row.created_date,
      updatedAt: row.updated_at,
    }));
  }

  async createStaffAccount(payload) {
    await this.ensureStaffAccountShape();

    const email = String(payload.email || "").trim().toLowerCase();
    const fullName = String(payload.fullName || "").trim();
    const password = String(payload.password || "");
    const role = this.normalizeStaffRoleLabel(payload.role);

    if (!email || !password || !role) {
      throw new Error("Email, password, and role are required.");
    }

    if (password.length < 6) {
      throw new Error("Password must be at least 6 characters.");
    }

    const roleId = await this.findRoleId(role);
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      `INSERT INTO users (email, full_name, passkey, role_id, is_active, created_date, updated_at)
       VALUES (?, ?, ?, ?, 1, NOW(), NOW())`,
      [email, fullName || this.getDisplayNameFromEmail(email), hashedPassword, roleId]
    );

    return this.findStaffAccountById(result.insertId);
  }

  async updateStaffAccount(userId, payload) {
    await this.ensureStaffAccountShape();

    const id = Number.parseInt(userId, 10);
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error("A valid user id is required.");
    }

    const current = await this.findStaffAccountById(id);
    if (!current) {
      throw new Error("Staff account not found.");
    }

    const email = String(payload.email || current.email).trim().toLowerCase();
    const fullName = String(payload.fullName || current.fullName || "").trim();
    const role = this.normalizeStaffRoleLabel(payload.role || current.role);
    const status = String(payload.status || current.status).trim();
    const isActive = status === "Inactive" ? 0 : 1;
    const roleId = await this.findRoleId(role);

    await db.query(
      `UPDATE users
       SET email = ?, full_name = ?, role_id = ?, is_active = ?, updated_at = NOW()
       WHERE user_id = ?`,
      [email, fullName || this.getDisplayNameFromEmail(email), roleId, isActive, id]
    );

    if (payload.password) {
      const password = String(payload.password);
      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters.");
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      await db.query("UPDATE users SET passkey = ?, updated_at = NOW() WHERE user_id = ?", [hashedPassword, id]);
    }

    return this.findStaffAccountById(id);
  }

  async deleteStaffAccount(userId) {
    const id = Number.parseInt(userId, 10);
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error("A valid user id is required.");
    }

    const current = await this.findStaffAccountById(id);
    if (!current) {
      throw new Error("Staff account not found.");
    }

    await db.query("DELETE FROM users WHERE user_id = ?", [id]);
    return current;
  }

  async findStaffAccountById(userId) {
    await this.ensureStaffAccountShape();

    const [rows] = await db.query(
      `SELECT
        u.user_id,
        u.email,
        u.full_name,
        u.is_active,
        u.created_date,
        u.updated_at,
        r.role_name AS role
      FROM users u
      INNER JOIN role r ON r.id = u.role_id
      WHERE u.user_id = ?
        AND LOWER(r.role_name) IN ('admin', 'registrar', 'superadmin', 'super admin')`,
      [userId]
    );

    const row = rows[0];
    if (!row) return null;

    return {
      userId: row.user_id,
      email: row.email,
      fullName: row.full_name || this.getDisplayNameFromEmail(row.email),
      role: this.normalizeStaffRoleLabel(row.role),
      status: row.is_active === 1 ? "Active" : "Inactive",
      createdAt: row.created_date,
      updatedAt: row.updated_at,
    };
  }

  normalizeStaffRoleLabel(role) {
    const normalized = String(role || "").trim().toLowerCase();
    if (normalized === "superadmin" || normalized === "super admin") return "super admin";
    if (normalized === "admin") return "admin";
    if (normalized === "registrar") return "registrar";
    return "";
  }

  getDisplayNameFromEmail(email) {
    return String(email || "")
      .split("@")[0]
      .replace(/[._-]+/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase()) || "Staff Account";
  }

  // ... signup method ...
  async signup(email, password) {
    // 1. Get role (Can be cached in memory if it doesn't change often)
    const [roleRows] = await db.query(
      "SELECT id FROM role WHERE role_name IN ('user', 'student') ORDER BY FIELD(role_name, 'user', 'student') LIMIT 1"
    );
    
    if (!roleRows.length) throw new Error('Default role configuration error');

    const hashedPassword = await bcrypt.hash(password, 10);

    // 2. Insert directly. If email exists, MySQL UNIQUE constraint throws error
    const [result] = await db.query(
      'INSERT INTO users (email, passkey, role_id, is_active, created_date) VALUES (?, ?, ?, 1, NOW())',
      [email, hashedPassword, roleRows[0].id]
    );

    return result.insertId;
  }

  async login(email, password) {
    await this.ensureStaffAccountShape();

    // 1. Fetch user with role and profile info in one join
    const [users] = await db.query(
      `SELECT u.user_id, u.email, u.full_name, u.passkey, u.role_id, u.is_active,
              r.role_name as role,
              s.first_name, s.last_name
       FROM users u
       LEFT JOIN role r ON r.id = u.role_id
       LEFT JOIN students s ON s.email_address = u.email
       WHERE u.email = ?`,
      [email]
    );

    const user = users[0];

    // 2. Validations
    if (!user) throw new Error('Invalid credentials');
    if (user.is_active !== 1) throw new Error('Account is inactive');

    const isValid = await bcrypt.compare(password, user.passkey);
    if (!isValid) throw new Error('Invalid credentials');

    // 3. Token Generation
    const token = jwt.sign(
      { userId: user.user_id, email: user.email, role: user.role },
      process.env.JWT_SECRET, // No fallback! Force env config.
      { expiresIn: '24h' }
    );

    return {
      token,
      user: {
        id: user.user_id,
        email: user.email,
        role: user.role,
        fullname: user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email.split('@')[0]
      }
    };
  }
}

export default new AuthService();
