function showPage(page) {
    document.querySelectorAll(".content-page").forEach(p => p.classList.add("d-none"));
    document.getElementById(page).classList.remove("d-none");

    // Tabs active effect
    document.querySelectorAll(".tab-btn").forEach(btn => btn.classList.remove("active"));
    if (typeof event !== "undefined" && event?.target) {
        event.target.classList.add("active");
    }
}

const portalRoutes = {
    admin: {
        dashboard: "/dashboard",
        accounts: "/accounts",
        applicationQueue: "/application-queue",
        applicationEvaluation: "/application-evaluation",
        notification: "/notification",
        analytics: "/rep-and-analytics",
        login: "/login"
    },
    registrar: {
        dashboard: "/registrar/dashboard",
        accounts: "/registrar",
        applicationQueue: "/registrar/application-queue",
        applicationEvaluation: "/registrar/application-evaluation",
        notification: "/registrar/notification",
        analytics: "/registrar/rep-and-analytics",
        login: "/login"
    },
    superadmin: {
        dashboard: "/superadmin",
        accounts: "/superadmin/accounts",
        applicationQueue: "/superadmin/application-queue",
        applicationEvaluation: "/superadmin/application-evaluation",
        notification: "/superadmin/notification",
        analytics: "/superadmin/rep-and-analytics",
        login: "/login"
    }
};

const routeAliases = {
    "/dashboard": "dashboard",
    "/dashboard.html": "dashboard",
    "./dashboard.html": "dashboard",
    "/superadmin": "dashboard",
    "/superadmin.html": "dashboard",
    "./superadmin.html": "dashboard",
    "/registrardashboard": "dashboard",
    "/registrardashboard.html": "dashboard",
    "/registrar/dashboard": "dashboard",
    "/registrar/dashboard.html": "dashboard",

    "/accounts": "accounts",
    "/accounts.html": "accounts",
    "./accounts.html": "accounts",
    "/superadmin/accounts": "accounts",
    "/superadmin/accounts.html": "accounts",
    "/registrar": "accounts",
    "/registrar.html": "accounts",
    "./registrar.html": "accounts",

    "/application-queue": "applicationQueue",
    "/application-queue.html": "applicationQueue",
    "./application-queue.html": "applicationQueue",
    "/superadmin/application-queue": "applicationQueue",
    "/superadmin/application-queue.html": "applicationQueue",
    "/registrar/application-queue": "applicationQueue",
    "/registrar/application-queue.html": "applicationQueue",

    "/application-evaluation": "applicationEvaluation",
    "/application-evaluation.html": "applicationEvaluation",
    "./application-evaluation.html": "applicationEvaluation",
    "/superadmin/application-evaluation": "applicationEvaluation",
    "/superadmin/application-evaluation.html": "applicationEvaluation",
    "/registrar/application-evaluation": "applicationEvaluation",
    "/registrar/application-evaluation.html": "applicationEvaluation",

    "/notification": "notification",
    "/notification.html": "notification",
    "./notification.html": "notification",
    "/superadmin/notification": "notification",
    "/superadmin/notification.html": "notification",
    "/registrar/notification": "notification",
    "/registrar/notification.html": "notification",

    "/rep-and-analytics": "analytics",
    "/rep-and-analytics.html": "analytics",
    "./rep-and-analytics.html": "analytics",
    "/superadmin/rep-and-analytics": "analytics",
    "/superadmin/rep-and-analytics.html": "analytics",
    "/registrar/rep-and-analytics": "analytics",
    "/registrar/rep-and-analytics.html": "analytics",

    "/adminlogin": "login",
    "/adminlogin.html": "login",
    "../auth/adminlogin": "login",
    "../auth/adminlogin.html": "login",
    "/registrarlogin": "login",
    "/registrarlogin.html": "login",
    "../auth/registrarlogin": "login",
    "../auth/registrarlogin.html": "login",
    "/login": "login",
    "/login.html": "login",
    "../auth/login": "login",
    "../auth/login.html": "login"
};

function getStoredSessionUser() {
    try {
        const sessionUser = localStorage.getItem("sessionUser");
        return sessionUser ? JSON.parse(sessionUser) : null;
    } catch (error) {
        return null;
    }
}

function getStoredRole() {
    const sessionUser = getStoredSessionUser();
    const rawRole = sessionUser?.user?.role || sessionUser?.role || null;
    if (!rawRole) return null;

    const normalizedRole = String(rawRole).trim().toLowerCase();
    return normalizedRole === "super admin" ? "superadmin" : normalizedRole;
}

function normalizePath(path) {
    if (!path) return "/";
    const normalizedPath = path.replace(/\/+$/, "");
    return normalizedPath || "/";
}

function getRoleTargetPath(role, currentPath) {
    const routeKey = routeAliases[currentPath];

    if (!routeKey || !portalRoutes[role]) {
        return null;
    }

    return portalRoutes[role][routeKey] || null;
}

function shouldManagePortalPath(path) {
    return path.startsWith("/superadmin") ||
        path.startsWith("/registrar") ||
        path === "/dashboard" ||
        path === "/dashboard.html" ||
        path === "/accounts" ||
        path === "/accounts.html" ||
        path === "/application-queue" ||
        path === "/application-queue.html" ||
        path === "/application-evaluation" ||
        path === "/application-evaluation.html" ||
        path === "/notification" ||
        path === "/notification.html" ||
        path === "/rep-and-analytics" ||
        path === "/rep-and-analytics.html" ||
        path === "/registrardashboard" ||
        path === "/registrardashboard.html";
}

function rewritePortalLinks(role) {
    if (!portalRoutes[role]) return;

    document.querySelectorAll("a[href]").forEach((link) => {
        const rawHref = link.getAttribute("href");

        if (
            !rawHref ||
            rawHref.startsWith("#") ||
            /^https?:/i.test(rawHref) ||
            link.hasAttribute("data-skip-portal-rewrite")
        ) {
            return;
        }

        const routeKey = routeAliases[rawHref];
        const targetPath = routeKey ? portalRoutes[role][routeKey] : null;

        if (targetPath && rawHref !== targetPath) {
            link.setAttribute("href", targetPath);
        }
    });
}

function toggleRegistrarOnlyNav(role) {
    const registrarLinks = Array.from(document.querySelectorAll("a[href]")).filter((link) => {
        const href = normalizePath(link.getAttribute("href"));
        const label = (link.textContent || "").trim().toLowerCase();
        return href === "/registrar" && label === "registrar";
    });

    registrarLinks.forEach((link) => {
        const navItem = link.closest(".nav-item");
        if (!navItem) return;
        navItem.style.display = role === "admin" ? "none" : "";
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const role = getStoredRole();
    const currentPath = normalizePath(window.location.pathname);

    if (!role || !shouldManagePortalPath(currentPath)) {
        return;
    }

    const targetPath = getRoleTargetPath(role, currentPath);

    if (targetPath && targetPath !== currentPath) {
        window.location.replace(targetPath);
        return;
    }

    rewritePortalLinks(role);
    toggleRegistrarOnlyNav(role);
});
