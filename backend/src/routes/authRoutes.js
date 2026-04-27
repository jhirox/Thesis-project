import express from 'express';
import AuthService from '../services/auth.service.js';

const router = express.Router();

router.post('/signup', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'All fields required' });

    const userId = await AuthService.signup(email, password);
    res.status(201).json({ message: 'User created', userId });
  } catch (error) {
    // Handle Duplicate Entry specifically
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'User already exists' });
    }
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Call the service
    const result = await AuthService.login(email, password);

    res.json({
      message: 'Login successful',
      ...result
    });
  } catch (error) {
    // Senior Tip: Don't tell the user WHY login failed (security)
    // Just log the real error for yourself
    console.error('Login Error:', error.message);
    
    const status = error.message === 'Account is inactive' ? 403 : 401;
    res.status(status).json({ error: error.message });
  }
});

export default router;