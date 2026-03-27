import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import db from "./src/config/db.js";
import studentRoutes from "./src/routes/studentRoutes.js";
import corsMiddleware from "./middleware/corsMiddleware.js";
import jsonMiddleware from "./middleware/jsonMiddleware.js";

dotenv.config();

const app = express();

// ======================
// MIDDLEWARE
// ======================

app.use(corsMiddleware);
app.use(jsonMiddleware);


// Fix __dirname (ESM)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ======================
// STATIC FILES (SAFE ONLY)
// ======================
app.use("/assets", express.static(path.join(__dirname, "public/assets")));
app.use("/css", express.static(path.join(__dirname, "public/css")));
app.use("/js", express.static(path.join(__dirname, "public/js")));

// ======================
// 🚨 BLOCK OLD /pages ACCESS
// ======================
app.get("/pages/*", (req, res) => {
  return res.redirect(301, "/");
});

// ======================
// API ROUTES
// ======================
app.use("/api/students", studentRoutes);

// ======================
// PAGE ROUTES (CLEAN URLS)
// ======================
const sendPage = (res, filePath) => {
  res.sendFile(path.join(__dirname, "public", filePath));
};

app.get("/", (req, res) => sendPage(res, "index.html"));

app.get("/courses", (req, res) =>
  sendPage(res, "pages/user/courses.html")
);

app.get("/enrollment", (req, res) =>
  sendPage(res, "pages/user/enrollment.html")
);

app.get("/about-us", (req, res) =>
  sendPage(res, "pages/user/about-us.html")
);

app.get("/profile", (req, res) =>
  sendPage(res, "pages/user/profile.html")
);

app.get("/notifications", (req, res) =>
  sendPage(res, "pages/user/notifications.html")
);

app.get("/login", (req, res) =>
  sendPage(res, "pages/auth/login.html")
);

app.get("/dashboard", (req, res) =>
  sendPage(res, "pages/admin/dashboard.html")
);

app.get("/registrardashboard", (req, res) =>
  sendPage(res, "pages/registrar/registrardashboard.html")
);

app.get("/adminlogin", (req, res) =>
  sendPage(res, "pages/auth/adminlogin.html")
);

// ======================
// 🔁 REDIRECT .html → CLEAN URLS
// ======================
const cleanRoutes = {
  "/index.html": "/",
  "/courses.html": "/courses",
  "/enrollment.html": "/enrollment",
  "/about-us.html": "/about-us",
  "/profile.html": "/profile",
  "/notifications.html": "/notifications",
  "/login.html": "/login",
  "/dashboard.html": "/dashboard",
  "/registrardashboard.html": "/registrardashboard",
  "/adminlogin.html": "/adminlogin",
};

app.get(Object.keys(cleanRoutes), (req, res) => {
  return res.redirect(301, cleanRoutes[req.path]);
});

// ======================
// TEST DB
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
// 404 HANDLER (IMPORTANT)
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