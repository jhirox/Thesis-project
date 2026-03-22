import express from "express";
import mysql from "mysql2/promise";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from"bcrypt";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Fix __dirname (IMPORTANT)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Serve static assets ONLY (CSS, JS, images)
app.use("/assets", express.static(path.join(__dirname, "public/assets")));
app.use("/css", express.static(path.join(__dirname, "public/css")));
app.use("/js", express.static(path.join(__dirname, "public/js")));

// ✅ Serve public root files (index.html, etc.) so /index.html works
app.use(express.static(path.join(__dirname, "public")));

// ✅ Serve page HTML files for direct paths like /pages/user/course.html
app.use("/pages", express.static(path.join(__dirname, "public/pages")));

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

// ✅ Course page route (clean URL)
app.get("/course", (req, res) => {
  res.sendFile(path.join(__dirname, "public/pages/user/course.html"));
});

// ✅ Enrollment page route (clean URL)
app.get("/enrollment", (req, res) => {
  res.sendFile(path.join(__dirname, "public/pages/user/enrollment.html"));
});

// ✅ About Us page route (clean URL)
app.get("/about-us", (req, res) => {
  res.sendFile(path.join(__dirname, "public/pages/user/about-us.html"));
});

// ✅ Profile page route (clean URL)
app.get("/profile", (req, res) => {
  res.sendFile(path.join(__dirname, "public/pages/user/profile.html"));
});

// ✅ Notifications page route (clean URL)
app.get("/notifications", (req, res) => {
  res.sendFile(path.join(__dirname, "public/pages/user/notifications.html"));
});

// ✅ Legacy/Direct HTML route support (e.g., /course.html -> /course)
app.get(["/index.html", "/course.html", "/enrollment.html", "/about-us.html", "/profile.html", "/notifications.html"], (req, res) => {
  const cleanMap = {
    "index.html": "/",
    "course.html": "/course",
    "enrollment.html": "/enrollment",
    "about-us.html": "/about-us",
    "profile.html": "/profile",
    "notifications.html": "/notifications"
  };

  const cleanPath = cleanMap[req.path.substring(1)];
  if (cleanPath) {
    return res.redirect(301, cleanPath);
  }
  res.status(404).send("Not Found");
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