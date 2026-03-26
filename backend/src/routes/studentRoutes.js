import express from 'express';
import { getStudents, getStudentByID } from '../controllers/studentController.js';

// router object
const router = express.Router();

// Get all students
router.get('/getAll', getStudents);

// Get student by id
router.get('/get/:id', getStudentByID);

export default router;