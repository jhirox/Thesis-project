import express from 'express';
import multer from 'multer';
import path from 'path';
import { getStudents, getStudentByID, submitEnrollment, getEnrollments, getRecentEnrollments, getEnrollmentApplicantDetails, getStudentProfile, updateStudentProfile, updateStudentReceipt, updateEnrollmentStatus, getRegistrarApprovalDrafts, saveRegistrarApprovalDraft, deleteRegistrarApprovalDraft } from '../controllers/studentController.js';
import { ensureUploadsDir, uploadsDir } from '../config/uploadStorage.js';

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

// GET all students
router.get('/', getStudents);

// GET all enrollments
router.get('/enrollments/all', getEnrollments);

// GET recent enrollments
router.get('/enrollments/recent', getRecentEnrollments);

// GET applicant name and course by enrollment ID or application ID
router.get('/enrollments/details/:id', getEnrollmentApplicantDetails);

// UPDATE enrollment application status
router.put('/enrollments/status', updateEnrollmentStatus);

// Registrar approval drafts
router.get('/enrollments/approval-drafts', getRegistrarApprovalDrafts);
router.put('/enrollments/approval-drafts', saveRegistrarApprovalDraft);
router.delete('/enrollments/approval-drafts', deleteRegistrarApprovalDraft);

// POST submit enrollment
router.post('/enrollment', submitEnrollment);

// GET profile by email or student ID
router.get('/profile', getStudentProfile);
router.get('/profile/:id', getStudentProfile);

// UPDATE profile by email or student ID
router.put('/profile', upload.single('profilePhoto'), updateStudentProfile);
router.put('/profile/receipt', upload.single('officialReceiptFile'), updateStudentReceipt);

// GET student by ID
router.get('/:id', getStudentByID);

export default router;
