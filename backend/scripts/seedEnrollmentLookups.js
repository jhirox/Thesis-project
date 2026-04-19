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

const departments = [
  "Business Administration",
  "Teacher Education",
  "Computer Studies",
  "Criminology",
];

const modalities = [
  "Face-to-Face",
  "Online / Flexible",
];

const studentTypes = [
  {
    type_name: "New Regular Enrollee",
    description: "New student enrolling as a regular student.",
  },
  {
    type_name: "Existing Regular",
    description: "Continuing student with regular load.",
  },
  {
    type_name: "Irregular Student",
    description: "Student taking a non-regular academic load.",
  },
  {
    type_name: "College Transferee",
    description: "Student transferring from another college.",
  },
  {
    type_name: "Re-Entry / iCare",
    description: "Returning student under re-entry or iCare process.",
  },
  {
    type_name: "Uniting Student / CPTP",
    description: "Student taking units or under CPTP.",
  },
];

const programs = [
  {
    program_code: "BSBA-MM",
    program_name: "BSBA Major in Marketing Management",
    dept_name: "Business Administration",
  },
  {
    program_code: "BSBA-FM",
    program_name: "BSBA Major in Financial Management",
    dept_name: "Business Administration",
  },
  {
    program_code: "BSBA-HRM",
    program_name: "BSBA Major in Human Resource Management",
    dept_name: "Business Administration",
  },
  {
    program_code: "BSED-ENG",
    program_name: "BSED Major in English",
    dept_name: "Teacher Education",
  },
  {
    program_code: "BSED-MATH",
    program_name: "BSED Major in Mathematics",
    dept_name: "Teacher Education",
  },
  {
    program_code: "BSED-FIL",
    program_name: "BSED Major in Filipino",
    dept_name: "Teacher Education",
  },
  {
    program_code: "BEED",
    program_name: "Bachelor of Elementary Education",
    dept_name: "Teacher Education",
  },
  {
    program_code: "BSCS",
    program_name: "Bachelor of Science in Computer Science",
    dept_name: "Computer Studies",
  },
  {
    program_code: "BSCRIM",
    program_name: "Bachelor of Science in Criminology",
    dept_name: "Criminology",
  },
];

try {
  await connection.beginTransaction();

  const departmentIds = new Map();

  for (const deptName of departments) {
    const [existing] = await connection.query(
      "SELECT dept_id FROM departments WHERE dept_name = ? LIMIT 1",
      [deptName]
    );

    if (existing.length > 0) {
      departmentIds.set(deptName, existing[0].dept_id);
      continue;
    }

    const [result] = await connection.query(
      "INSERT INTO departments (dept_name, created_at) VALUES (?, NOW())",
      [deptName]
    );

    departmentIds.set(deptName, result.insertId);
  }

  for (const modalityName of modalities) {
    const [existing] = await connection.query(
      "SELECT modality_id FROM learning_modalities WHERE modality_name = ? LIMIT 1",
      [modalityName]
    );

    if (existing.length === 0) {
      await connection.query(
        `INSERT INTO learning_modalities (modality_name, description, is_active)
         VALUES (?, ?, 1)`,
        [modalityName, `${modalityName} learning setup`]
      );
    }
  }

  for (const studentType of studentTypes) {
    const [existing] = await connection.query(
      "SELECT type_id FROM student_types WHERE type_name = ? LIMIT 1",
      [studentType.type_name]
    );

    if (existing.length === 0) {
      await connection.query(
        `INSERT INTO student_types (type_name, description, is_active)
         VALUES (?, ?, 1)`,
        [studentType.type_name, studentType.description]
      );
    }
  }

  for (const program of programs) {
    const deptId = departmentIds.get(program.dept_name);
    const [existing] = await connection.query(
      "SELECT program_id FROM programs WHERE program_code = ? OR program_name = ? LIMIT 1",
      [program.program_code, program.program_name]
    );

    if (existing.length === 0) {
      await connection.query(
        `INSERT INTO programs (dept_id, program_code, program_name)
         VALUES (?, ?, ?)`,
        [deptId, program.program_code, program.program_name]
      );
    }
  }

  await connection.commit();
  console.log("Enrollment lookup seed completed successfully.");
} catch (error) {
  await connection.rollback();
  console.error("Enrollment lookup seed failed:", error.message);
  process.exitCode = 1;
} finally {
  await connection.end();
}
