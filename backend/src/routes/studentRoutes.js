import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getStudents, getStudentByID, submitEnrollment, getEnrollments, getRecentEnrollments, getEnrollmentApplicantDetails, getStudentProfile, updateStudentProfile, updateStudentReceipt } from '../controllers/studentController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '../../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
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
