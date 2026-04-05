-- SQL schema for Thesis Project
CREATE DATABASE IF NOT EXISTS thesis_project;
USE thesis_project;

-- example table
CREATE TABLE IF NOT EXISTS students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL
);

-- Enrollments table
CREATE TABLE IF NOT EXISTS enrollments (
  enrollment_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  student_id BIGINT NULL,
  first_name VARCHAR(100) NULL,
  middle_name VARCHAR(100) NULL,
  last_name VARCHAR(100) NULL,
  suffix VARCHAR(10) NULL,
  birth_date DATE NULL,
  birth_place VARCHAR(255) NULL,
  sex ENUM('Male','Female') NULL,
  civil_status VARCHAR(20) NULL,
  spouse_name VARCHAR(255) NULL,
  nationality VARCHAR(100) NULL,
  religion VARCHAR(100) NULL,
  email VARCHAR(255) NULL,
  contact_number VARCHAR(20) NULL,
  address TEXT NULL,
  highest_educational_attainment VARCHAR(100) NULL,
  last_school_attended VARCHAR(255) NULL,
  last_school_year VARCHAR(20) NULL,
  working_student TINYINT(1) NULL,
  mother_maiden_name VARCHAR(255) NULL,
  father_name VARCHAR(255) NULL,
  guardian_name VARCHAR(255) NULL,
  guardian_contact VARCHAR(20) NULL,
  program_id INT NULL,
  modality_id BIGINT NULL,
  student_type_id BIGINT NULL,
  semester_types ENUM('First Semester','Second Semester','Summer') NULL,
  academic_year VARCHAR(9) NULL,
  enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  or_number VARCHAR(50) NULL,
  or_image_path VARCHAR(255) NULL,
  payment_verified_at TIMESTAMP NULL,
  queue_number VARCHAR(10) NULL,
  application_status ENUM('Submitted','Under Review','Approved','Rejected','Enrolled') DEFAULT 'Submitted',
  special_remarks TEXT NULL,
  agreed_to_terms TINYINT(1) DEFAULT 0,
  agreed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  reviewed_by_admin_id BIGINT NULL,
  reviewed_at TIMESTAMP NULL,
  reviewed_remarks TEXT NULL
);
