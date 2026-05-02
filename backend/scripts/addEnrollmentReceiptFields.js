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
    ["official_receipt_number", "VARCHAR(255) NULL"],
    ["official_receipt_file_url", "VARCHAR(500) NULL"],
    ["official_receipt_file_name", "VARCHAR(255) NULL"],
    ["official_receipt_file_type", "VARCHAR(100) NULL"],
  ];

  for (const [columnName, definition] of columns) {
    const [rows] = await connection.query(
      `SELECT 1
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'enrollments'
        AND COLUMN_NAME = ?
      LIMIT 1`,
      [columnName]
    );

    if (!rows.length) {
      await connection.query(
        `ALTER TABLE enrollments ADD COLUMN ${columnName} ${definition}`
      );
    }
  }

  console.log("Enrollment official receipt fields added successfully.");
} catch (error) {
  console.error("Failed to add enrollment official receipt fields:", error.message);
  process.exitCode = 1;
} finally {
  await connection.end();
}
