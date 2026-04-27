import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../config/db.js';

class AuthService {
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
    // 1. Fetch user with role and profile info in one join
    const [users] = await db.query(
      `SELECT u.user_id, u.email, u.passkey, u.role_id, u.is_active,
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
        fullname: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email.split('@')[0]
      }
    };
  }
}

export default new AuthService();