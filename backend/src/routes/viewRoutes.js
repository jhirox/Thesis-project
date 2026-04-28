import express from "express";
import path from "path";
const router = express.Router();

const publicPath = path.join(process.cwd(), "public");

// Helper to serve files from specific folders
const serve = (folder, file) => (req, res) => {
    res.sendFile(path.join(publicPath, `pages/${folder}/${file}.html`));
};

// --- USER ROUTES ---
router.get("/", (req, res) => res.sendFile(path.join(publicPath, "index.html")));
router.get("/courses", serve('user', 'courses'));
router.get("/enrollment", serve('user', 'enrollment'));
router.get("/about-us", serve('user', 'about-us'));
router.get("/profile", serve('user', 'profile'));
router.get("/notifications", serve('user', 'notifications'));

// --- AUTH ROUTES ---
router.get("/login", serve('auth', 'login'));
router.get("/signup", serve('auth', 'signup'));
router.get("/enrollment-form", serve('auth', 'enrollment-form'));

// --- ADMIN & REGISTRAR ROUTES ---
// Since Registrar uses Admin files, we can group them logically
const adminPages = ["dashboard", "accounts", "application-evaluation", "application-queue", "notification", "rep-and-analytics"];

adminPages.forEach(page => {
    // Standard Admin Routes
    router.get(`/${page}`, serve('admin', page));
    // Registrar mapping to Admin files
    router.get(`/registrar/${page}`, serve('admin', page));
});

router.get("/registrar", serve('registrar', 'registrar'));

// --- SUPERADMIN ---
router.get("/superadmin", serve('superadmin', 'superadmin'));
router.get("/superadmin/dashboard", serve('admin', 'dashboard'));

// Superadmin can access registrar and all admin pages
router.get("/superadmin/registrar", serve('registrar', 'registrar'));
adminPages.forEach(page => {
    router.get(`/superadmin/${page}`, serve('admin', page));
});

export default router;