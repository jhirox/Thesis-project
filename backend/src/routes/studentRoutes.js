import express from 'express';
import { getStudents, getStudentByID, submitEnrollment, getEnrollments, getStudentProfile, updateStudentProfile } from '../controllers/studentController.js';

const router = express.Router();

// GET all students
router.get('/', getStudents);

// GET all enrollments
router.get('/enrollments/all', getEnrollments);

// POST submit enrollment
router.post('/enrollment', submitEnrollment);

// GET profile by email or student ID
router.get('/profile', getStudentProfile);
router.get('/profile/:id', getStudentProfile);

// UPDATE profile by email or student ID
router.put('/profile', updateStudentProfile);

// GET student by ID
router.get('/:id', getStudentByID);

export default router;