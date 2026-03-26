const db = require("../config/db");

// get all students
const getStudents = async (req, res) => {
    try {
        const data = await db.query(' SELECT * FROM students');
        if(!data){
            return res.status(404).send({
                success: false,
                message: 'No students found'
            });
        }
        res.status(200).send({
            success: true,
            message: 'Students retrieved successfully',
            totalStudents: data[0].length, 
            data: data[0],
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error in getting students",
            error
        });
    }
};

//GET STUDENT ID
const getStudentByID = async (req, res) => {
    try {
        const studentId = req.params.id;
        if(!studentId){
            return res.status(404).send({
                success: false,
                message: 'Student ID is required'
            });
        }
     const data = await db.query('SELECT * FROM students WHERE id = ?', [studentId])
        if(data){
            return res.status(404).send({
                success: false,
                message: 'Student retrieved successfully',
            });
        }
        res.status(200).send({
            success: true,
            studentDetails: data[0],
        });
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: "Error in getting student by id",
            error
        });
    }
};


module.exports = { getStudents , getStudentByID };