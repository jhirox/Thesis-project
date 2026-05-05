import dotenv from "dotenv";
import mysql from "mysql2/promise";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const connection = await mysql.createConnection({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT,
});

try {
  // Add missing student background columns if they don't exist
  const columns = [
    ["highest_attainment", "VARCHAR(255) NULL"],
    ["last_school_attended", "VARCHAR(255) NULL"],
    ["last_school_year", "VARCHAR(50) NULL"],
    ["working_status", "VARCHAR(100) NULL"],
    ["mother_maiden_name", "VARCHAR(255) NULL"],
    ["father_name", "VARCHAR(255) NULL"],
    ["guardian_name", "VARCHAR(255) NULL"],
    ["guardian_contact", "VARCHAR(20) NULL"],
  ];

  for (const [columnName, definition] of columns) {
    const [rows] = await connection.query(
      `SELECT 1
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'students'
        AND COLUMN_NAME = ?
      LIMIT 1`,
      [columnName]
    );

    if (!rows.length) {
      await connection.query(
        `ALTER TABLE students ADD COLUMN ${columnName} ${definition}`
      );
      console.log(`Added column: ${columnName}`);
    }
  }

  const query = `
    CREATE OR REPLACE VIEW student_profile_view AS
    SELECT 
      -- Basic Student Info
      s.student_id,
      s.first_name,
      s.middle_name,
      s.last_name,
      s.suffix,
      CONCAT(s.first_name, ' ', IFNULL(CONCAT(s.middle_name, ' '), ''), s.last_name, IFNULL(CONCAT(' ', s.suffix), '')) AS full_name,
      s.email_address,
      s.profile_photo_url AS photo,
      s.contact_number,
      s.birth_date,
      s.complete_address,
      s.sex,
      
      -- Academic & Enrollment Info
      p.program_name,
      p.program_code,
      e.year_level,
      e.semester_types AS semester,
      lm.modality_name AS learning_modality,
      s.highest_attainment,
      s.last_school_attended,
      s.last_school_year,
      s.working_status,
      
      -- Family Information
      s.mother_maiden_name,
      s.father_name,
      s.guardian_name,
      s.guardian_contact,
      
      -- Application Tracking (For the Profile Bottom Card)
      e.queue_number,
      e.application_status,
      
      -- Enrollment Status Badge
      CASE 
          WHEN s.is_active = 1 THEN 'Active' 
          ELSE 'Inactive' 
      END AS enrollment_status
    FROM students s
    LEFT JOIN enrollments e ON s.student_id = e.student_id
      AND e.enrollment_id = (
        SELECT MAX(enrollment_id)
        FROM enrollments
        WHERE student_id = s.student_id
      )
    LEFT JOIN programs p ON e.program_id = p.program_id
    LEFT JOIN learning_modalities lm ON e.modality_id = lm.modality_id;
  `;

  await connection.query(query);
  console.log("student_profile_view created or replaced successfully.");
} catch (error) {
  console.error("Failed to create student_profile_view:", error.message);
  process.exitCode = 1;
} finally {
  await connection.end();
}
