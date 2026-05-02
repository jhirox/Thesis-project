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
  const [rows] = await connection.query(`
    SELECT COLUMN_NAME
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'enrollments'
      AND COLUMN_NAME = 'year_level'
    LIMIT 1
  `);

  if (rows.length === 0) {
    await connection.query(`
      ALTER TABLE enrollments
      ADD COLUMN year_level VARCHAR(20) NULL
      AFTER student_type_id
    `);
    console.log("Added enrollments.year_level column successfully.");
  } else {
    console.log("enrollments.year_level column already exists.");
  }
} catch (error) {
  console.error("Failed to add enrollments.year_level column:", error.message);
  process.exitCode = 1;
} finally {
  await connection.end();
}
