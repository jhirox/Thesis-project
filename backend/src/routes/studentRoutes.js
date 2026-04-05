import express from 'express';
import { getStudents, getStudentByID, submitEnrollment, getEnrollments } from '../controllers/studentController.js';

const router = express.Router();

// GET all students
router.get('/', getStudents);

// GET student by ID
router.get('/:id', getStudentByID);

// GET all enrollments
router.get('/enrollments/all', getEnrollments);

// POST submit enrollment
router.post('/enrollment', submitEnrollment);

export default router;