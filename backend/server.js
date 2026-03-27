import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import path from "path";
import { fileURLToPath } from "url";
import db from "./src/config/db.js";
import studentRoutes from "./src/routes/studentRoutes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Fix __dirname (ES Modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Serve static assets ONLY (CSS, JS, images)
app.use("/assets", express.static(path.join(__dirname, "public/assets")));
app.use("/css", express.static(path.join(__dirname, "public/css")));
app.use("/js", express.static(path.join(__dirname, "public/js")));

// ✅ Serve root public files (index.html, etc.)
app.use(express.static(path.join(__dirname, "public")));

// ✅ Database connection
//

// ✅ Routes for pages (clean URLs)
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "public/index.html")));
app.get("/courses", (req, res) => res.sendFile(path.join(__dirname, "public/pages/user/courses.html")));
app.get("/enrollment", (req, res) => res.sendFile(path.join(__dirname, "public/pages/user/enrollment.html")));
app.get("/about-us", (req, res) => res.sendFile(path.join(__dirname, "public/pages/user/about-us.html")));
app.get("/profile", (req, res) => res.sendFile(path.join(__dirname, "public/pages/user/profile.html")));
app.get("/notifications", (req, res) => res.sendFile(path.join(__dirname, "public/pages/user/notifications.html")));
app.get("/login", (req, res) => res.sendFile(path.join(__dirname, "public/pages/auth/login.html")));
app.get("/dashboard", (req, res) => res.sendFile(path.join(__dirname, "public/pages/admin/dashboard.html")));
app.get("/registrardashboard", (req, res) => res.sendFile(path.join(__dirname, "public/pages/registrar/registrardashboard.html")));
app.get("/adminlogin", (req, res) => res.sendFile(path.join(__dirname, "public/pages/auth/adminlogin.html")));

// ✅ Redirect legacy URLs to clean URLs
app.get([
  "/index.html",
  "/courses.html",
  "/enrollment.html",
  "/about-us.html",
  "/profile.html",
  "/notifications.html",
  "/login.html",
  "/dashboard.html",
  "/registrardashboard.html",
  "/adminlogin.html"
], (req, res) => {
  const cleanMap = {
    "index.html": "/",
    "courses.html": "/courses",
    "enrollment.html": "/enrollment",
    "about-us.html": "/about-us",
    "profile.html": "/profile",
    "notifications.html": "/notifications",
    "login.html": "/login",
    "dashboard.html": "/dashboard",
    "registrardashboard.html": "/registrardashboard",
    "adminlogin.html": "/adminlogin"
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

// ✅ Railway / local port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});