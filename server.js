import express from "express";
import mysql from "mysql2/promise";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import path from "path";
import { fileURLToPath } from "url";
import pool from "./config/db.js";


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
app.use("/vendor", express.static(path.join(__dirname, "public/vendor")));
app.use("/data", express.static(path.join(__dirname, "public/data")));

// ✅ Serve root public files (index.html, etc.)
app.use(express.static(path.join(__dirname, "public")));


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
app.get([
  "/index.html",
  "/course.html",
  "/enrollment.html",
  "/about-us.html",
  "/profile.html",
  "/notifications.html",
  "/login.html",
  "/dashboard.html",
  "/registrardashboard.html",
  "/adminlogin.html",
  "/enrollment-form.html",
  "/signup.html",
  "/adminsignup.html",
  "/registrarsignup.html"
], (req, res) => {
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

//listen
pool
  .query("SELECT 1")
  .then(() => {
  console.log("Database connected successfully!");
  //listen
  app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
  });
})
.catch((err) => {
  console.error(error);
});


// ✅ Railway / local port
const PORT = process.env.PORT || 3000;
