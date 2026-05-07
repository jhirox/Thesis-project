import express from 'express';
import multer from 'multer';
import path from 'path';
import { getStudents, getStudentByID, submitEnrollment, getEnrollments, getRecentEnrollments, getEnrollmentApplicantDetails, getStudentProfile, updateStudentProfile, updateStudentReceipt, updateEnrollmentStatus, moveRejectedEnrollmentToTrash, restoreRejectedEnrollmentFromTrash, updateStudentStatus, updateStudentAccount, getRegistrarApprovalDrafts, saveRegistrarApprovalDraft, deleteRegistrarApprovalDraft, searchStudents } from '../controllers/studentController.js';
import { ensureUploadsDir, uploadsDir } from '../config/uploadStorage.js';
import { authenticateToken, requireRoles } from '../middlewares/authMiddleware.js';

ensureUploadsDir();

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      ensureUploadsDir();
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      const extension = path.extname(file.originalname).toLowerCase();
      const prefix = file.fieldname === 'officialReceiptFile' ? 'or' : 'student';
      const safeName = `${prefix}-${Date.now()}-${Math.round(Math.random() * 1e6)}${extension}`;
      cb(null, safeName);
    },
  }),
});

const router = express.Router();

const staffAccess = requireRoles('admin', 'registrar', 'superadmin', 'super admin');
const adminAccess = requireRoles('admin', 'superadmin', 'super admin');
const registrarAccess = requireRoles('registrar', 'superadmin', 'super admin');
const registrarOrAdminAccess = requireRoles('admin', 'registrar', 'superadmin', 'super admin');

// GET all students
router.get('/', registrarOrAdminAccess, getStudents);

// SEARCH students by name
router.get('/search/by-name', registrarOrAdminAccess, searchStudents);

// GET all enrollments
router.get('/enrollments/all', staffAccess, getEnrollments);

// GET recent enrollments
router.get('/enrollments/recent', staffAccess, getRecentEnrollments);

// GET applicant name and course by enrollment ID or application ID
router.get('/enrollments/details/:id', staffAccess, getEnrollmentApplicantDetails);

// UPDATE enrollment application status
router.put('/enrollments/status', registrarOrAdminAccess, updateEnrollmentStatus);

// MOVE rejected applicant to/from registrar trash
router.put('/enrollments/rejected-trash', registrarAccess, moveRejectedEnrollmentToTrash);
router.delete('/enrollments/rejected-trash', registrarAccess, restoreRejectedEnrollmentFromTrash);

// UPDATE student account status
router.put('/status', adminAccess, updateStudentStatus);

// UPDATE student account summary fields
router.put('/account', adminAccess, updateStudentAccount);

// Registrar approval drafts
router.get('/enrollments/approval-drafts', registrarAccess, getRegistrarApprovalDrafts);
router.put('/enrollments/approval-drafts', registrarAccess, saveRegistrarApprovalDraft);
router.delete('/enrollments/approval-drafts', registrarAccess, deleteRegistrarApprovalDraft);

// POST submit enrollment
router.post('/enrollment', submitEnrollment);

// GET profile by email or student ID
router.get('/profile', authenticateToken, getStudentProfile);
router.get('/profile/:id', authenticateToken, getStudentProfile);

// UPDATE profile by email or student ID
router.put('/profile', authenticateToken, upload.single('profilePhoto'), updateStudentProfile);
router.put('/profile/receipt', authenticateToken, upload.single('officialReceiptFile'), updateStudentReceipt);

// GET student by ID
router.get('/:id', staffAccess, getStudentByID);

export default router;
