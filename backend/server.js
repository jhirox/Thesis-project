// ======================
// SERVER.JS
// ======================

import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import db from "./src/config/db.js";
import studentRoutes from "./src/routes/studentRoutes.js";

// ======================
// CONFIG
// ======================
dotenv.config();
const app = express();

// Fix __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ DEFINE PUBLIC PATH (IMPORTANT)
const publicPath = path.join(__dirname, "../public");

// ======================
// MIDDLEWARE
// ======================
import corsMiddleware from "./src/middlewares/corsMiddleware.js";
import jsonMiddleware from "./src/middlewares/jsonMiddleware.js";

app.use(corsMiddleware);
app.use(jsonMiddleware);

// ======================
// STATIC FILES
// ======================
app.use(express.static(publicPath));

// ======================
// API ROUTES
// ======================
app.use("/api/students", studentRoutes);

// ======================
// CLEAN URL ROUTES
// ======================
app.get("/", (req, res) =>
  res.sendFile(path.join(publicPath, "index.html"))
);

app.get("/courses", (req, res) =>
  res.sendFile(path.join(publicPath, "pages/user/courses.html"))
);

app.get("/enrollment", (req, res) =>
  res.sendFile(path.join(publicPath, "pages/user/enrollment.html"))
);

app.get("/about-us", (req, res) =>
  res.sendFile(path.join(publicPath, "pages/user/about-us.html"))
);

app.get("/profile", (req, res) =>
  res.sendFile(path.join(publicPath, "pages/user/profile.html"))
);

app.get("/notifications", (req, res) =>
  res.sendFile(path.join(publicPath, "pages/user/notifications.html"))
);

app.get("/login", (req, res) =>
  res.sendFile(path.join(publicPath, "pages/auth/login.html"))
);

app.get("/dashboard", (req, res) =>
  res.sendFile(path.join(publicPath, "pages/admin/dashboard.html"))
);

app.get("/registrardashboard", (req, res) =>
  res.sendFile(path.join(publicPath, "pages/registrar/registrardashboard.html"))
);

app.get("/adminlogin", (req, res) =>
  res.sendFile(path.join(publicPath, "pages/auth/adminlogin.html"))
);

// ======================
// REDIRECT LEGACY URLS
// ======================
app.get(
  [
    "/index.html",
    "/courses.html",
    "/enrollment.html",
    "/about-us.html",
    "/profile.html",
    "/notifications.html",
    "/login.html",
    "/dashboard.html",
    "/registrardashboard.html",
    "/adminlogin.html",
  ],
  (req, res) => {
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
      "adminlogin.html": "/adminlogin",
    };

    const cleanPath = cleanMap[req.path.substring(1)];

    if (cleanPath) {
      return res.redirect(301, cleanPath);
    }

    res.status(404).send("Not Found");
  }
);

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