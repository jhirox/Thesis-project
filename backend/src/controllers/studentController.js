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

// POST submit enrollment
export const submitEnrollment = async (req, res) => {
  try {
    const {
      firstName,
      middleName,
      lastName,
      suffix,
      birthDate,
      birthPlace,
      sex,
      civilStatus,
      spouseName,
      nationality,
      religion,
      email,
      contactNumber,
      address,
      program,
      learningModality,
      studentType,
      highestAttainment,
      lastSchool,
      lastSchoolYear,
      semester,
      workingStatus,
      motherMaiden,
      fatherName,
      guardianName,
      guardianContact,
      remarks,
      agreedToTerms,
      agreedAt,
      orNumber,
      orImagePath,
      authUserId
    } = req.body;

    // Check if student already exists by email
    let studentId = null;
    if (email) {
      const [studentRows] = await db.query(
        "SELECT student_id FROM students WHERE email_address = ? LIMIT 1",
        [email]
      );
      if (studentRows.length > 0) {
        studentId = studentRows[0].student_id;
      }
    }

    // If student doesn't exist, create new student record
    if (!studentId) {
      const [studentResult] = await db.query(`
        INSERT INTO students (
          first_name, middle_name, last_name, suffix, birth_date, birth_place, sex,
          civil_status, spouse_name, nationality, religion, email_address, contact_number,
          complete_address, is_active, created_date, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())
      `, [
        firstName,
        middleName,
        lastName,
        suffix,
        birthDate,
        birthPlace,
        sex,
        civilStatus,
        spouseName,
        nationality,
        religion,
        email,
        contactNumber,
        address
      ]);
      studentId = studentResult.insertId;
    }

    // Insert family information if provided
    if (motherMaiden || fatherName || guardianName) {
      await db.query(`
        INSERT INTO family_information (
          student_id, mother_maiden_name, father_name, guardian_name, guardian_contact, guardian_relationship, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, 'Guardian', NOW(), NOW())
        ON DUPLICATE KEY UPDATE
          mother_maiden_name = VALUES(mother_maiden_name),
          father_name = VALUES(father_name),
          guardian_name = VALUES(guardian_name),
          guardian_contact = VALUES(guardian_contact),
          updated_at = NOW()
      `, [
        studentId,
        motherMaiden || null,
        fatherName || null,
        guardianName || null,
        guardianContact || null
      ]);
    }

    // Insert academic history if provided
    if (highestAttainment || lastSchool) {
      await db.query(`
        INSERT INTO academic_history (
          student_id, highest_attainment, last_school_attended, last_school_year, is_working, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, NOW(), NOW())
        ON DUPLICATE KEY UPDATE
          highest_attainment = VALUES(highest_attainment),
          last_school_attended = VALUES(last_school_attended),
          last_school_year = VALUES(last_school_year),
          is_working = VALUES(is_working),
          updated_at = NOW()
      `, [
        studentId,
        highestAttainment || null,
        lastSchool || null,
        lastSchoolYear || null,
        workingStatus === 'Working student' ? 1 : 0
      ]);
    }

    // Generate queue number
    const queueNumber = generateQueueNumber();

    // Insert into enrollments table
    const [result] = await db.query(`
      INSERT INTO enrollments (
        student_id, program_id, modality_id, student_type_id, semester_types,
        academic_year, enrollment_date, or_number, or_image_path, payment_verified_at,
        queue_number, application_status, special_remarks, agreed_to_terms, agreed_at,
        created_at, updated_at, reviewed_by_admin_id, reviewed_at, reviewed_remarks
      ) VALUES (?, ?, ?, ?, ?, ?, NOW(), ?, ?, NULL, ?, 'Submitted', ?, ?, ?, NOW(), NOW(), NULL, NULL, NULL)
    `, [
      studentId,
      getProgramId(program),
      getModalityId(learningModality),
      getStudentTypeId(studentType),
      semester,
      getAcademicYear(),
      orNumber || null,
      orImagePath || null,
      queueNumber,
      remarks || null,
      agreedToTerms ? 1 : 0,
      agreedAt || new Date()
    ]);

    res.status(201).json({
      success: true,
      message: "Enrollment submitted successfully",
      enrollmentId: result.insertId,
      queueNumber
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error submitting enrollment",
      error: error.message,
    });
  }
};

// GET all enrollments
export const getEnrollments = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM enrollments ORDER BY created_at DESC");
    res.status(200).json({
      success: true,
      message: "Enrollments retrieved successfully",
      totalEnrollments: rows.length,
      data: rows,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error in getting enrollments",
      error: error.message,
    });
  }
};

// Helper functions
function generateQueueNumber() {
  const letters = ["A", "B", "C", "D"];
  const letter = letters[Math.floor(Math.random() * letters.length)];
  const num = Math.floor(Math.random() * 900) + 100;
  return `${letter}${num}`;
}

function getProgramId(program) {
  // Map program names to IDs - this needs to be adjusted based on your programs table
  const programMap = {
    "BSBA Major in Marketing Management": 1,
    "BSBA Major in Financial Management": 2,
    "BSBA Major in Human Resource Management": 3,
    "BSED Major in English": 4,
    "BSED Major in Mathematics": 5,
    "BSED Major in Filipino": 6,
    "BEED - Bachelor of Elementary Education": 7,
    "BSCS - Bachelor of Science in Computer Science": 8,
    "BSCRIM - Bachelor of Science in Criminology": 9
  };
  return programMap[program] || null;
}

function getModalityId(modality) {
  const modalityMap = {
    "Face-to-Face": 1,
    "Online / Flexible": 2
  };
  return modalityMap[modality] || null;
}

function getStudentTypeId(type) {
  const typeMap = {
    "New Regular Enrollee": 1,
    "Existing Regular": 2,
    "Irregular Student": 3,
    "College Transferee": 4,
    "Re-Entry / iCare": 5,
    "Uniting Student / CPTP": 6
  };
  return typeMap[type] || null;
}

function getAcademicYear() {
  const now = new Date();
  const year = now.getFullYear();
  return `${year}-${year + 1}`;
}