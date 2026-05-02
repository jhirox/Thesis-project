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
  await connection.query(`
    CREATE TABLE IF NOT EXISTS notifications (
      notification_id INT AUTO_INCREMENT PRIMARY KEY,
      enrollment_id INT NULL,
      student_id INT NULL,
      student_email VARCHAR(255) NOT NULL,
      title VARCHAR(255) NOT NULL,
      notification_type VARCHAR(100) NOT NULL,
      message TEXT NOT NULL,
      appointment_date DATE NULL,
      appointment_time VARCHAR(20) NULL,
      includes_soft_copy TINYINT(1) NOT NULL DEFAULT 0,
      soft_copy_payload LONGTEXT NULL,
      email_delivery_status VARCHAR(50) NOT NULL DEFAULT 'pending',
      email_delivery_message TEXT NULL,
      is_read TINYINT(1) NOT NULL DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_notifications_student_email (student_email),
      INDEX idx_notifications_student_id (student_id),
      INDEX idx_notifications_enrollment_id (enrollment_id)
    )
  `);

  console.log("notifications table is ready.");
} catch (error) {
  console.error("Failed to create notifications table:", error.message);
  process.exitCode = 1;
} finally {
  await connection.end();
}
