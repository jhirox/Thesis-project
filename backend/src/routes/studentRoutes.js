import express from 'express';
import { getStudents, getStudentByID, submitEnrollment, getEnrollments, getRecentEnrollments, getEnrollmentApplicantDetails, getStudentProfile, updateStudentProfile } from '../controllers/studentController.js';

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
router.put('/profile', updateStudentProfile);

// GET student by ID
router.get('/:id', getStudentByID);

export default router;
