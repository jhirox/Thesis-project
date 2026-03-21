const express = require('express');
const { getStudents, getStudentByID } = require('../controllers/studentController');

//router object
const router = express.Router();

//Get all students
router.get('/getAll', getStudents);

//get student by id
router.get('/get/:id', getStudentByID);

module.exports = router;