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
    } else {
      console.log(`Column already exists: ${columnName}`);
    }
  }

  console.log("Student background fields added successfully.");
} catch (error) {
  console.error("Failed to add student background fields:", error.message);
  process.exitCode = 1;
} finally {
  await connection.end();
}
