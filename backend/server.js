// ======================
// SERVER.JS
// ======================

import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import db from "./src/config/db.js";
import studentRoutes from "./src/routes/studentRoutes.js";
import authRoutes from "./src/routes/authRoutes.js";

// ======================
// CONFIG
// ======================
// Fix __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });
const app = express();

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
app.use("/api/auth", authRoutes);

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

app.get("/signup", (req, res) =>
  res.sendFile(path.join(publicPath, "pages/auth/signup.html"))
);

app.get("/dashboard", (req, res) =>
  res.sendFile(path.join(publicPath, "pages/admin/dashboard.html"))
);

app.get("/superadmin", (req, res) =>
  res.sendFile(path.join(publicPath, "pages/superadmin/superadmin.html"))
);

app.get("/registrardashboard", (req, res) =>
  res.sendFile(path.join(publicPath, "pages/admin/dashboard.html"))
);

app.get("/enrollment-form", (req, res) =>
  res.sendFile(path.join(publicPath, "pages/auth/enrollment-form.html"))
);

app.get("/adminlogin", (req, res) => res.redirect(301, "/login"));
app.get("/adminsignup", (req, res) => res.redirect(301, "/login"));
app.get("/registrarlogin", (req, res) => res.redirect(301, "/login"));
app.get("/registrarsignup", (req, res) => res.redirect(301, "/login"));

// Registrar clean routes
app.get("/registrar", (req, res) =>
  res.sendFile(path.join(publicPath, "pages/registrar/registrar.html"))
);

// Registrar routes now serve admin equivalents (no duplicates)
app.get("/registrar/application-evaluation", (req, res) =>
  res.sendFile(path.join(publicPath, "pages/admin/application-evaluation.html"))
);

app.get("/registrar/application-queue", (req, res) =>
  res.sendFile(path.join(publicPath, "pages/admin/application-queue.html"))
);

app.get("/registrar/notification", (req, res) =>
  res.sendFile(path.join(publicPath, "pages/admin/notification.html"))
);

app.get("/registrar/dashboard", (req, res) =>
  res.sendFile(path.join(publicPath, "pages/admin/dashboard.html"))
);

app.get("/registrar/rep-and-analytics", (req, res) =>
  res.sendFile(path.join(publicPath, "pages/admin/rep-and-analytics.html"))
);

// Admin clean routes
app.get("/accounts", (req, res) =>
  res.sendFile(path.join(publicPath, "pages/admin/accounts.html"))
);

app.get("/application-evaluation", (req, res) =>
  res.sendFile(path.join(publicPath, "pages/admin/application-evaluation.html"))
);

app.get("/application-queue", (req, res) =>
  res.sendFile(path.join(publicPath, "pages/admin/application-queue.html"))
);

app.get("/notification", (req, res) =>
  res.sendFile(path.join(publicPath, "pages/admin/notification.html"))
);

app.get("/rep-and-analytics", (req, res) =>
  res.sendFile(path.join(publicPath, "pages/admin/rep-and-analytics.html"))
);

app.get("/enrollment-form", (req, res) =>
  res.sendFile(path.join(publicPath, "pages/auth/enrollment-form.html"))
);


// optional fallbacks for admin old .html
app.get("/accounts.html", (req, res) =>
  res.sendFile(path.join(publicPath, "pages/admin/accounts.html"))
);

app.get("/application-evaluation.html", (req, res) =>
  res.sendFile(path.join(publicPath, "pages/admin/application-evaluation.html"))
);

app.get("/application-queue.html", (req, res) =>
  res.sendFile(path.join(publicPath, "pages/admin/application-queue.html"))
);

app.get("/notification.html", (req, res) =>
  res.sendFile(path.join(publicPath, "pages/admin/notification.html"))
);

app.get("/rep-and-analytics.html", (req, res) =>
  res.sendFile(path.join(publicPath, "pages/admin/rep-and-analytics.html"))
);


// Registrar fallback routes now serve admin equivalents (Files were deleted on purpose)
app.get("/registrar/application-evaluation.html", (req, res) =>
  res.sendFile(path.join(publicPath, "pages/admin/application-evaluation.html"))
);

app.get("/registrar/application-queue.html", (req, res) =>
  res.sendFile(path.join(publicPath, "pages/admin/application-queue.html"))
);

app.get("/registrar/notification.html", (req, res) =>
  res.sendFile(path.join(publicPath, "pages/admin/notification.html"))
);

app.get("/registrar/rep-and-analytics.html", (req, res) =>
  res.sendFile(path.join(publicPath, "pages/admin/rep-and-analytics.html"))
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
    "/signup.html",
    "/registrarlogin.html",
    "/registrar.html",
    "/registrardashboard.html",
    "/application-evaluation.html",
    "/application-queue.html",
    "/notification.html",
    "/dashboard.html",
    "/superadmin.html",
    "/registrardashboard.html",
    "/adminlogin.html",
    "/accounts.html",
    "/rep-and-analytics.html",
    "/enrollment-form.html",
    "/adminsignup.html",
    "/registrarsignup.html"
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
      "signup.html": "/signup",
      "dashboard.html": "/dashboard",
      "superadmin.html": "/superadmin",
      "registrardashboard.html": "/registrar/dashboard",
      "registrar.html": "/registrar",
      "registrarlogin.html": "/login",
      "adminlogin.html": "/login",
      "accounts.html": "/accounts",
      "application-evaluation.html": "/application-evaluation",
      "application-queue.html": "/application-queue",
      "notification.html": "/notification",
      "rep-and-analytics.html": "/rep-and-analytics",
      "enrollment-form.html": "/enrollment-form",
      "adminsignup.html": "/login",
      "registrarsignup.html": "/login"
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

// Test enrollments table
app.get("/test-enrollments", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM enrollments LIMIT 5");
    res.json({ message: "Enrollments table exists!", count: rows.length, data: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Check users table structure
app.get("/test-users", async (req, res) => {
  try {
    // Check if table exists and get structure
    const [columns] = await db.query("DESCRIBE users");
    
    // Get sample data if any
    const [rows] = await db.query("SELECT * FROM users LIMIT 5");
    
    res.json({ 
      message: "Users table exists!", 
      columns: columns,
      sampleData: rows,
      count: rows.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message, details: "Users table may not exist or has no columns" });
  }
});

app.get("/env-debug", (req, res) => {
  res.json({
    MYSQLHOST: process.env.MYSQLHOST || null,
    MYSQLUSER: process.env.MYSQLUSER || null,
    MYSQLPASSWORD: process.env.MYSQLPASSWORD ? "SET" : null,
    MYSQLDATABASE: process.env.MYSQLDATABASE || null,
    MYSQLPORT: process.env.MYSQLPORT || null
  });
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
const routeStack = app._router ? app._router.stack : [];
console.log('Registered routes:', routeStack
  .filter(layer => layer.route)
  .map(layer => `${Object.keys(layer.route.methods).join(',').toUpperCase()} ${layer.route.path}`)
);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
