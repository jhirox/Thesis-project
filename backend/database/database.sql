-- SQL schema for Thesis Project
CREATE DATABASE IF NOT EXISTS thesis_project;
USE thesis_project;

-- example table
CREATE TABLE IF NOT EXISTS students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL
);
