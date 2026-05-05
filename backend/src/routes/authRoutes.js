import express from 'express';
import multer from 'multer';
import path from 'path';
import AuthService from '../services/auth.service.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { buildStoredFileUrl, ensureUploadsDir, uploadsDir } from '../config/uploadStorage.js';

const router = express.Router();

ensureUploadsDir();

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => {
      ensureUploadsDir();
      cb(null, uploadsDir);
    },
    filename: (_req, file, cb) => {
      const extension = path.extname(file.originalname).toLowerCase();
      const safeName = `portal-profile-${Date.now()}-${Math.round(Math.random() * 1e6)}${extension}`;
      cb(null, safeName);
    },
  }),
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Please upload a valid image file.'));
    }
    cb(null, true);
  },
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
});

const uploadPortalProfileImage = (req, res, next) => {
  upload.single('profileImage')(req, res, (error) => {
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message || 'Unable to upload profile image',
      });
    }
    next();
  });
};

const requireSuperAdmin = (req, res, next) => {
  const role = String(req.user?.role || '').trim().toLowerCase();
  if (role !== 'superadmin' && role !== 'super admin') {
    return res.status(403).json({ error: 'Super admin access required' });
  }
  next();
};

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
    res.cookie('authToken', result.token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({
      message: 'Login successful',
      ...result
    });
  } catch (error) {
    // Just log the real error for yourself
    console.error('Login Error:', error.message);

    const status = error.message === 'Account is inactive' ? 403 : 401;
    res.status(status).json({ error: error.message });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('authToken', {
    httpOnly: true,
    sameSite: 'lax',
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
  });
  res.json({ success: true, message: 'Logged out' });
});

router.get('/me/profile', authenticateToken, async (req, res) => {
  try {
    const profile = await AuthService.findPortalProfileById(req.user.userId);
    res.json({ success: true, data: profile });
  } catch (error) {
    console.error('Portal Profile Load Error:', error.message);
    res.status(400).json({ success: false, error: error.message || 'Unable to load profile' });
  }
});

router.put('/me/profile', authenticateToken, uploadPortalProfileImage, async (req, res) => {
  try {
    const profile = await AuthService.updatePortalProfile(req.user.userId, {
      displayName: req.body.displayName,
      profileImage: req.file ? buildStoredFileUrl(req.file.filename) : undefined,
      removeProfileImage: req.body.removeProfileImage === 'true',
    });
    res.json({ success: true, data: profile, message: 'Profile updated' });
  } catch (error) {
    console.error('Portal Profile Update Error:', error.message);
    res.status(400).json({ success: false, error: error.message || 'Unable to update profile' });
  }
});

router.get('/staff', authenticateToken, requireSuperAdmin, async (_req, res) => {
  try {
    const staff = await AuthService.listStaffAccounts();
    res.json({ success: true, data: staff });
  } catch (error) {
    console.error('Staff List Error:', error.message);
    res.status(500).json({ success: false, error: error.message || 'Unable to load staff accounts' });
  }
});

router.post('/staff', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const account = await AuthService.createStaffAccount(req.body);
    res.status(201).json({ success: true, data: account, message: 'Staff account created' });
  } catch (error) {
    console.error('Staff Create Error:', error.message);
    const status = error.code === 'ER_DUP_ENTRY' ? 409 : 400;
    res.status(status).json({ success: false, error: error.message || 'Unable to create staff account' });
  }
});

router.put('/staff/:userId', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    if (
      String(req.user?.userId) === String(req.params.userId) &&
      (String(req.body?.status || '').trim() === 'Inactive' ||
        (req.body?.role !== undefined &&
          !['superadmin', 'super admin'].includes(String(req.body.role || '').trim().toLowerCase())))
    ) {
      return res.status(400).json({
        success: false,
        error: 'You cannot remove super admin access from your current session.'
      });
    }

    const account = await AuthService.updateStaffAccount(req.params.userId, req.body);
    res.json({ success: true, data: account, message: 'Staff account updated' });
  } catch (error) {
    console.error('Staff Update Error:', error.message);
    res.status(400).json({ success: false, error: error.message || 'Unable to update staff account' });
  }
});

router.delete('/staff/:userId', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    if (String(req.user?.userId) === String(req.params.userId)) {
      return res.status(400).json({
        success: false,
        error: 'You cannot delete your own active super admin session.'
      });
    }

    const account = await AuthService.deleteStaffAccount(req.params.userId);
    res.json({ success: true, data: account, message: 'Staff account deleted' });
  } catch (error) {
    console.error('Staff Delete Error:', error.message);
    res.status(400).json({ success: false, error: error.message || 'Unable to delete staff account' });
  }
});

export default router;
