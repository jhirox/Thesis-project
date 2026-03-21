import express from "express";
import mysql from "mysql2/promise";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Fix __dirname (IMPORTANT)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Serve frontend
app.use(express.static(path.join(__dirname, "public")));

// ✅ Database connection (safe)
let db;
async function connectDB() {
  try {
    db = await mysql.createPool({
      host: process.env.MYSQLHOST,
      user: process.env.MYSQLUSER,
      password: process.env.MYSQLPASSWORD,
      database: process.env.MYSQLDATABASE,
      port: process.env.MYSQLPORT
    });
    console.log("Database connected");
  } catch (err) {
    console.error("DB Error:", err.message);
  }
}
connectDB();

// ✅ Home route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ✅ Test DB
app.get("/test-db", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT 1");
    res.json({ message: "Database connected!", rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Railway port
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});