import express from "express";
import path from "path";
import jwt from "jsonwebtoken";
const router = express.Router();

const publicPath = path.join(process.cwd(), "public");

const roleHome = {
    admin: "/dashboard",
    registrar: "/registrar/dashboard",
    superadmin: "/superadmin/dashboard",
    "super admin": "/superadmin/dashboard",
    user: "/profile",
    student: "/profile",
};

const parseCookies = (cookieHeader = "") => Object.fromEntries(
    cookieHeader
        .split(";")
        .map((cookie) => cookie.trim())
        .filter(Boolean)
        .map((cookie) => {
            const separatorIndex = cookie.indexOf("=");
            if (separatorIndex === -1) return [cookie, ""];
            return [
                decodeURIComponent(cookie.slice(0, separatorIndex)),
                decodeURIComponent(cookie.slice(separatorIndex + 1)),
            ];
        })
);

const getAuthUser = (req) => {
    const token = parseCookies(req.headers.cookie).authToken;
    if (!token || !process.env.JWT_SECRET) {
        return null;
    }

    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch {
        return null;
    }
};

const normalizeRole = (role) => String(role || "").trim().toLowerCase();

const requireRoles = (...allowedRoles) => (req, res, next) => {
    const user = getAuthUser(req);
    const role = normalizeRole(user?.role);
    const allowed = allowedRoles.map(normalizeRole);

    if (!user) {
        return res.redirect(`/login?next=${encodeURIComponent(req.originalUrl)}`);
    }

    if (!allowed.includes(role)) {
        return res.redirect(roleHome[role] || "/profile");
    }

    req.user = user;
    next();
};

const redirectRegistrarToMappedPage = (page) => (req, res, next) => {
    const user = getAuthUser(req);
    const role = normalizeRole(user?.role);

    if (role === "registrar") {
        return res.redirect(`/registrar/${page}`);
    }

    next();
};

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
    router.get(`/${page}`, redirectRegistrarToMappedPage(page), requireRoles("admin", "superadmin", "super admin"), serve('admin', page));
    // Registrar mapping to Admin files
    router.get(`/registrar/${page}`, requireRoles("registrar", "superadmin", "super admin"), serve('admin', page));
});

router.get("/registrar", requireRoles("registrar", "superadmin", "super admin"), serve('registrar', 'registrar'));

// --- SUPERADMIN ---
router.get("/superadmin", requireRoles("superadmin", "super admin"), serve('superadmin', 'superadmin'));
router.get("/superadmin/dashboard", requireRoles("superadmin", "super admin"), serve('admin', 'dashboard'));

// Superadmin can access registrar and all admin pages
router.get("/superadmin/registrar", requireRoles("superadmin", "super admin"), serve('registrar', 'registrar'));
adminPages.forEach(page => {
    router.get(`/superadmin/${page}`, requireRoles("superadmin", "super admin"), serve('admin', page));
});

export default router;
