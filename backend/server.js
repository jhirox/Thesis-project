import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import {
  ensureUploadsDir,
  uploadsDir,
  uploadsPublicUrlBase,
} from "./src/config/uploadStorage.js";

// Route Imports
import studentRoutes from "./src/routes/studentRoutes.js";
import notificationRoutes from "./src/routes/notificationRoutes.js";
import { getStudents } from "./src/controllers/studentController.js";
import authRoutes from "./src/routes/authRoutes.js";
import viewRoutes from "./src/routes/viewRoutes.js"; // Import our new router

// Config
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, "../.env");
dotenv.config({ path: envPath });
if (!process.env.JWT_SECRET) {
  console.warn(`WARNING: JWT_SECRET is not set. Checked env path: ${envPath}`);
}

const app = express();
const publicPath = path.join(__dirname, "../public");
ensureUploadsDir();

// 1. GLOBAL MIDDLEWARE
import corsMiddleware from "./src/middlewares/corsMiddleware.js";
import errorMiddleware from "./src/middlewares/errorMiddleware.js";
import jsonMiddleware from "./src/middlewares/jsonMiddleware.js";
app.use(corsMiddleware);
app.use(jsonMiddleware);

// 2. AUTOMATIC URL CLEANUP (Replaces your massive cleanMap)
app.use((req, res, next) => {
    // 1. Redirect .html to clean URLs
    if (/\.html$/i.test(req.path)) {
        return res.redirect(301, req.path.replace(/\.html$/i, ''));
    }
    // 2. Handle specific legacy redirects
    const legacyRedirects = ["/adminlogin", "/adminsignup", "/registrarlogin", "/registrarsignup"];
    if (legacyRedirects.includes(req.path)) {
        return res.redirect(301, "/login");
    }
    next();
});

// 3. STATIC FILES
if (uploadsPublicUrlBase.startsWith("/")) {
  app.use(uploadsPublicUrlBase, express.static(uploadsDir));
}
app.use(express.static(publicPath));

// 4. API & VIEW ROUTES
app.use("/api/students", studentRoutes);
app.use("/api/notifications", notificationRoutes);
app.get("/getStudents", getStudents);
app.use("/api/auth", authRoutes);
app.use("/", viewRoutes); // Handles all HTML serving

app.use(errorMiddleware);

// 5. 404 HANDLER
app.use((req, res) => {
    res.status(404).sendFile(path.join(publicPath, "404.html"), (err) => {
        if (err) res.status(404).send("Page not found");
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
