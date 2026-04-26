import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../config/db.js';

const router = express.Router();

// Signup route
router.post('/signup', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check if user already exists
    const [existingUser] = await db.query(
      'SELECT user_id FROM users WHERE email = ?',
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Resolve the default student/user role without relying on a fixed ID.
    const [roleRows] = await db.query(
      "SELECT id FROM role WHERE role_name IN ('user', 'student') ORDER BY FIELD(role_name, 'user', 'student') LIMIT 1"
    );
    if (roleRows.length === 0) {
      return res.status(500).json({ error: 'Default signup role is not configured in the database.' });
    }

    const defaultRoleId = roleRows[0].id;

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert new user with the resolved default role.
    const [result] = await db.query(
      'INSERT INTO users (email, passkey, role_id, is_active, created_date) VALUES (?, ?, ?, ?, NOW())',
      [email, hashedPassword, defaultRoleId, 1]
    );

    res.status(201).json({ message: 'User created successfully', userId: result.insertId });
  } catch (error) {
    console.error('Signup error:', error);
    const isDuplicateEmail = error?.code === 'ER_DUP_ENTRY';
    const message = isDuplicateEmail
      ? 'User already exists'
      : (error?.sqlMessage || error?.message || 'Internal server error');

    res.status(isDuplicateEmail ? 409 : 500).json({ error: message });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const [users] = await db.query(
      `SELECT
        u.user_id,
        u.email,
        u.passkey AS password,
        u.role_id,
        u.is_active,
        COALESCE(
          NULLIF(TRIM(CONCAT_WS(' ', s.first_name, s.middle_name, s.last_name, s.suffix)), ''),
          SUBSTRING_INDEX(u.email, '@', 1)
        ) AS fullname,
        COALESCE(NULLIF(TRIM(r.role_name), ''), 'user') AS role
      FROM users u
      LEFT JOIN role r ON r.id = u.role_id
      LEFT JOIN students s ON s.email_address = u.email
      WHERE u.email = ?`,
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];

    // Check if user is active
    if (user.is_active !== 1) {
      return res.status(401).json({ error: 'Account is inactive' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.user_id, email: user.email, roleId: user.role_id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.user_id,
        email: user.email,
        roleId: user.role_id,
        role: user.role,
        fullname: user.fullname
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error?.sqlMessage || error?.message || 'Internal server error' });
  }
});

export default router;
