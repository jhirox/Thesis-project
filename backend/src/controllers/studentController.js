// backend/controllers/studentController.js
import db from "../config/db.js"; // ES module import

// GET all students
export const getStudents = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM students");
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No students found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Students retrieved successfully",
      totalStudents: rows.length,
      data: rows,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error in getting students",
      error: error.message,
    });
  }
};

// GET student by ID
export const getStudentByID = async (req, res) => {
  try {
    const studentId = req.params.id;
    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: "Student ID is required",
      });
    }

    const [rows] = await db.query("SELECT * FROM students WHERE id = ?", [
      studentId,
    ]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    res.status(200).json({
      success: true,
      studentDetails: rows[0],
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error in getting student by ID",
      error: error.message,
    });
  }
};