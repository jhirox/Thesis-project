import express from 'express';
import { getStudents, getStudentByID } from '../controllers/studentController.js';

const router = express.Router();

// GET all students
router.get('/', getStudents);

// GET student by ID
router.get('/:id', getStudentByID);

export default router;