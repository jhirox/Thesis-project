// ======================
// SERVER.JS
// ======================

import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import db from "./src/config/db.js";
import studentRoutes from "./src/routes/studentRoutes.js";

// Custom middleware
import corsMiddleware from "./middleware/corsMiddleware.js";
import jsonMiddleware from "./middleware/jsonMiddleware.js";

dotenv.config();

const app = express();

// ======================
// MIDDLEWARE
// ======================
app.use(corsMiddleware);
app.use(jsonMiddleware);

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

// ✅ Routes for pages (clean URLs)
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "public/index.html")));
app.get("/course", (req, res) => res.sendFile(path.join(__dirname, "public/pages/user/course.html")));
app.get("/enrollment", (req, res) => res.sendFile(path.join(__dirname, "public/pages/user/enrollment.html")));
app.get("/about-us", (req, res) => res.sendFile(path.join(__dirname, "public/pages/user/about-us.html")));
app.get("/profile", (req, res) => res.sendFile(path.join(__dirname, "public/pages/user/profile.html")));
app.get("/notifications", (req, res) => res.sendFile(path.join(__dirname, "public/pages/user/notifications.html")));
app.get("/login", (req, res) => res.sendFile(path.join(__dirname, "public/pages/auth/login.html")));
app.get("/dashboard", (req, res) => res.sendFile(path.join(__dirname, "public/pages/admin/dashboard.html")));
app.get("/registrardashboard", (req, res) => res.sendFile(path.join(__dirname, "public/pages/registrar/registrardashboard.html")));
app.get("/adminlogin", (req, res) => res.sendFile(path.join(__dirname, "public/pages/auth/adminlogin.html")));
app.get("/enrollment-form", (req, res) => res.sendFile(path.join(__dirname, "public/pages/auth/enrollment-form.html")));
app.get("/signup", (req, res) => res.sendFile(path.join(__dirname, "public/pages/auth/signup.html")));
app.get("/adminsignup", (req, res) => res.sendFile(path.join(__dirname, "public/pages/auth/adminsignup.html")));
app.get("/registrarsignup", (req, res) => res.sendFile(path.join(__dirname, "public/pages/auth/registrarsignup.html")));

// ✅ Redirect legacy URLs to clean URLs
const cleanMap = {
  "index.html": "/",
  "course.html": "/course",
  "enrollment.html": "/enrollment",
  "about-us.html": "/about-us",
  "profile.html": "/profile",
  "notifications.html": "/notifications",
  "login.html": "/login",
  "dashboard.html": "/dashboard",
  "registrardashboard.html": "/registrardashboard",
  "adminlogin.html": "/adminlogin",
  "enrollment-form.html": "/enrollment-form",
  "signup.html": "/signup",
  "adminsignup.html": "/adminsignup",
  "registrarsignup.html": "/registrarsignup"
};

app.get(Object.keys(cleanMap).map(file => `/${file}`), (req, res) => {
  const fileName = req.path.substring(1); // Remove leading /
  const cleanPath = cleanMap[fileName];
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