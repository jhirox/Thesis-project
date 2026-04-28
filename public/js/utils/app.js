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
        dashboard: "/dashboard",
        registrar: "/registrar",
        accounts: "/accounts",
        applicationQueue: "/application-queue",
        applicationEvaluation: "/application-evaluation",
        notification: "/notification",
        analytics: "/rep-and-analytics",
        login: "/login"
    },
    superadmin: {
        dashboard: "/dashboard",
        accounts: "/accounts",
        registrar: "/registrar",
        applicationQueue: "/application-queue",
        applicationEvaluation: "/application-evaluation",
        notification: "/notification",
        analytics: "/rep-and-analytics",
        superadmin: "/superadmin",
        login: "/login"
    }
};

const routeAliases = {
    "/dashboard": "dashboard",
    "/dashboard.html": "dashboard",
    "./dashboard.html": "dashboard",
    "/registrardashboard": "dashboard",
    "/registrardashboard.html": "dashboard",
    "/registrar/dashboard": "dashboard",
    "/registrar/dashboard.html": "dashboard",
    "/registrar": "registrar",
    "/registrar.html": "registrar",
    "./registrar.html": "registrar",

    "/accounts": "accounts",
    "/accounts.html": "accounts",
    "./accounts.html": "accounts",

    "/application-queue": "applicationQueue",
    "/application-queue.html": "applicationQueue",
    "./application-queue.html": "applicationQueue",
    "/registrar/application-queue": "applicationQueue",
    "/registrar/application-queue.html": "applicationQueue",

    "/application-evaluation": "applicationEvaluation",
    "/application-evaluation.html": "applicationEvaluation",
    "./application-evaluation.html": "applicationEvaluation",
    "/registrar/application-evaluation": "applicationEvaluation",
    "/registrar/application-evaluation.html": "applicationEvaluation",

    "/notification": "notification",
    "/notification.html": "notification",
    "./notification.html": "notification",
    "/registrar/notification": "notification",
    "/registrar/notification.html": "notification",

    "/rep-and-analytics": "analytics",
    "/rep-and-analytics.html": "analytics",
    "./rep-and-analytics.html": "analytics",
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
    "/superadmin/dashboard": "dashboard",
    "/superadmin/dashboard.html": "dashboard",
    "/superadmin": "superadmin",
    "/superadmin.html": "superadmin",

    "/superadmin/registrar": "registrar",
    "/superadmin/registrar.html": "registrar",

    "/superadmin/application-queue": "applicationQueue",
    "/superadmin/application-queue.html": "applicationQueue",

    "/superadmin/application-evaluation": "applicationEvaluation",
    "/superadmin/application-evaluation.html": "applicationEvaluation",

    "/superadmin/notification": "notification",
    "/superadmin/notification.html": "notification",

    "/superadmin/rep-and-analytics": "analytics",
    "/superadmin/rep-and-analytics.html": "analytics",
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
    return sessionUser?.user?.role || sessionUser?.role || null;
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

    if (routeKey === "registrar" && role === "admin") {
        return portalRoutes.admin.accounts || null;
    }

    return portalRoutes[role][routeKey] || null;
}

function shouldManagePortalPath(path) {
    return path.startsWith("/registrar") ||
        path === "/dashboard" ||
        path === "/dashboard.html" ||
        path === "/superadmin" ||
        path === "/superadmin.html" ||
        path.startsWith("/superadmin/") ||
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

        if (!rawHref || rawHref.startsWith("#") || /^https?:/i.test(rawHref)) {
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

function toggleSuperAdminOnlyNav(role) {
    // Hide Super Admin link for non-superadmin users (admin and registrar)
    if (role !== "superadmin" && role !== "super admin") {
        const superAdminLinks = Array.from(document.querySelectorAll("a[href]")).filter((link) => {
            const href = normalizePath(link.getAttribute("href"));
            const label = (link.textContent || "").trim().toLowerCase();
            return href === "/superadmin" && label === "super admin";
        });

        superAdminLinks.forEach((link) => {
            const navItem = link.closest(".nav-item");
            if (!navItem) return;
            navItem.style.display = "none";
        });
    }
}

function hideEmptySectionHeaders() {
    // Find all section headers (h5 tags in sidebar)
    const sectionHeaders = document.querySelectorAll(".sidebar-menu h5");
    
    sectionHeaders.forEach((header) => {
        // Get all nav items following this header until the next header
        const navItems = [];
        let nextElement = header.nextElementSibling;
        
        while (nextElement && nextElement.tagName !== "H5") {
            if (nextElement.classList.contains("nav-item")) {
                navItems.push(nextElement);
            }
            nextElement = nextElement.nextElementSibling;
        }
        
        // Check if all nav items in this section are hidden
        const allItemsHidden = navItems.length > 0 && navItems.every(item => {
            return item.style.display === "none" || 
                   window.getComputedStyle(item).display === "none";
        });
        
        // Hide the header if all nav items are hidden
        if (allItemsHidden) {
            header.style.display = "none";
        } else {
            header.style.display = "";
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const role = getStoredRole();
    const currentPath = normalizePath(window.location.pathname);

    // Always hide nav items based on role
    if (role) {
        toggleRegistrarOnlyNav(role);
        toggleSuperAdminOnlyNav(role);
        hideEmptySectionHeaders();
    }

    if (!role || !shouldManagePortalPath(currentPath)) {
        return;
    }

    const targetPath = getRoleTargetPath(role, currentPath);

    if (targetPath && targetPath !== currentPath) {
        window.location.replace(targetPath);
        return;
    }

    rewritePortalLinks(role);
});
