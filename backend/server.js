// ======================
// SERVER.JS
// ======================

import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import db from "./src/config/db.js";
import studentRoutes from "./src/routes/studentRoutes.js";

dotenv.config();

const app = express();

// ======================
// MIDDLEWARE
// ======================
import corsMiddleware from "./src/middlewares/corsMiddleware.js";
import jsonMiddleware from "./src/middlewares/jsonMiddleware.js";

// Fix __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ======================
// STATIC FILES
// ======================
app.use("/assets", express.static(path.join(__dirname, "public/assets")));
app.use("/css", express.static(path.join(__dirname, "public/css")));
app.use("/js", express.static(path.join(__dirname, "public/js")));

// ======================
// API ROUTES
// ======================
app.use("/api/students", studentRoutes);

// ======================
// CLEAN URL ROUTES (must come before legacy redirects)
// ======================
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

// ======================
// TEST DB CONNECTION
// ======================
app.get("/test-db", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT 1");
    res.json({ message: "Database connected!", rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ======================
// 404 HANDLER
// ======================
app.use((req, res) => {
  res.status(404).send("Page not found");
});

// ======================
// START SERVER
// ======================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});