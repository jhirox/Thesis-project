import dotenv from "dotenv";
import mysql from "mysql2/promise";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const connection = await mysql.createConnection({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT,
});

try {
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
      s.contact_number,
      s.birth_date,
      s.complete_address,
      s.sex,
      
      -- Academic & Enrollment Info
      p.program_name,
      p.program_code,
      e.semester_types AS semester,
      lm.modality_name AS learning_modality,
      
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
