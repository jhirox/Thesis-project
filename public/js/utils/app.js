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
        registrar: "/registrar",
        accounts: "/registrar/accounts",
        applicationQueue: "/registrar/application-queue",
        applicationEvaluation: "/registrar/application-evaluation",
        notification: "/registrar/notification",
        analytics: "/registrar/rep-and-analytics",
        login: "/login"
    },
    superadmin: {
        dashboard: "/superadmin/dashboard",
        accounts: "/superadmin/accounts",
        registrar: "/superadmin/registrar",
        applicationQueue: "/superadmin/application-queue",
        applicationEvaluation: "/superadmin/application-evaluation",
        notification: "/superadmin/notification",
        analytics: "/superadmin/rep-and-analytics",
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
    "/registrar/accounts": "accounts",
    "/registrar/accounts.html": "accounts",
    "/superadmin/accounts": "accounts",
    "/superadmin/accounts.html": "accounts",

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

const defaultPortalProfileImage = "https://lh3.googleusercontent.com/a/ACg8ocJZRFDYP52Px5s5A5hCDSPAwCHlrEebkZDNYbMcQnSSdvacvufz=s360-c-no";

function getPortalProfileStorageKey(sessionUser) {
    const user = sessionUser?.user || sessionUser || {};
    const userKey = user.id || user.email || user.username || user.role || "portal-user";
    return `portalProfile:${userKey}`;
}

function getStoredPortalProfile(sessionUser) {
    try {
        const storedProfile = localStorage.getItem(getPortalProfileStorageKey(sessionUser));
        return storedProfile ? JSON.parse(storedProfile) : {};
    } catch (error) {
        return {};
    }
}

function getPortalDisplayName(sessionUser, profile) {
    const user = sessionUser?.user || sessionUser || {};
    return profile.displayName ||
        user.fullname ||
        user.fullName ||
        user.name ||
        user.email ||
        "Portal User";
}

function getPortalProfileImage(sessionUser, profile) {
    const user = sessionUser?.user || sessionUser || {};
    return profile.profileImage ||
        user.profileImage ||
        user.picture ||
        user.photoUrl ||
        defaultPortalProfileImage;
}

function savePortalProfile(sessionUser, profile) {
    if (sessionUser?.user) {
        sessionUser.user.fullname = profile.displayName;
        sessionUser.user.profileImage = profile.profileImage;
    } else if (sessionUser) {
        sessionUser.fullname = profile.displayName;
        sessionUser.profileImage = profile.profileImage;
    }

    try {
        localStorage.setItem(getPortalProfileStorageKey(sessionUser), JSON.stringify(profile));
        localStorage.setItem("sessionUser", JSON.stringify(sessionUser));
        return true;
    } catch (error) {
        alert("Unable to save profile in this browser.");
        return false;
    }
}

function getAuthToken() {
    return localStorage.getItem("authToken") || "";
}

function toPortalProfile(sessionUser, data = {}) {
    return {
        displayName: data.fullname || data.fullName || data.displayName || getPortalDisplayName(sessionUser, {}),
        profileImage: data.profileImage || defaultPortalProfileImage
    };
}

async function loadPortalProfileFromServer(sessionUser) {
    const authToken = getAuthToken();
    if (!authToken) {
        return null;
    }

    const response = await fetch("/api/auth/me/profile", {
        headers: {
            Authorization: `Bearer ${authToken}`
        }
    });
    const result = await response.json();
    if (!response.ok || !result.success) {
        throw new Error(result.error || "Unable to load profile.");
    }

    const profile = toPortalProfile(sessionUser, result.data);
    savePortalProfile(sessionUser, profile);
    updatePortalProfileUi(profile.displayName, profile.profileImage);
    return profile;
}

async function savePortalProfileToServer({ displayName, profileImageFile, removeProfileImage }) {
    const authToken = getAuthToken();
    if (!authToken) {
        throw new Error("Your session token is missing. Please sign in again.");
    }

    const formData = new FormData();
    formData.append("displayName", displayName);
    if (profileImageFile) {
        formData.append("profileImage", profileImageFile);
    }
    if (removeProfileImage) {
        formData.append("removeProfileImage", "true");
    }

    const response = await fetch("/api/auth/me/profile", {
        method: "PUT",
        headers: {
            Authorization: `Bearer ${authToken}`
        },
        body: formData
    });
    const result = await response.json();
    if (!response.ok || !result.success) {
        throw new Error(result.error || "Unable to save profile.");
    }

    return result.data;
}

function updatePortalProfileUi(displayName, profileImage) {
    const fullNameElement = document.querySelector("#user-full-name");
    if (fullNameElement) {
        fullNameElement.textContent = displayName;
    }

    document.querySelectorAll(".user-menu img, img.user-image").forEach((image) => {
        image.src = profileImage || defaultPortalProfileImage;
    });

    document.querySelectorAll(".user-menu .user-header p").forEach((profileText) => {
        const smallText = profileText.querySelector("small")?.textContent || "";
        profileText.innerHTML = "";
        profileText.append(document.createTextNode(displayName));

        if (smallText) {
            const small = document.createElement("small");
            small.textContent = smallText;
            profileText.appendChild(small);
        }
    });
}

function ensurePortalProfileModal() {
    let modal = document.getElementById("portalProfileModal");
    if (modal) {
        return modal;
    }

    modal = document.createElement("div");
    modal.className = "modal fade";
    modal.id = "portalProfileModal";
    modal.tabIndex = -1;
    modal.setAttribute("aria-labelledby", "portalProfileModalLabel");
    modal.setAttribute("aria-hidden", "true");
    modal.innerHTML = `
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content portal-profile-modal">
                <form id="portalProfileForm">
                    <div class="modal-header">
                        <h1 class="modal-title fs-5" id="portalProfileModalLabel">Profile</h1>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="portal-profile-editor">
                            <img id="portalProfilePreview" class="portal-profile-editor__image" src="${defaultPortalProfileImage}" alt="Profile preview" />
                            <div class="portal-profile-editor__controls">
                                <label for="portalProfileName" class="form-label">Display name</label>
                                <input id="portalProfileName" class="form-control" type="text" maxlength="80" required />
                                <label for="portalProfileImageInput" class="form-label mt-3">Profile picture</label>
                                <input id="portalProfileImageInput" class="form-control" type="file" accept="image/*" />
                                <button id="portalProfileRemoveImage" class="btn btn-outline-light btn-sm mt-3" type="button">
                                    <i class="fa-solid fa-trash me-2"></i>Remove picture
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="submit" class="btn btn-primary">Save Profile</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    return modal;
}

function setupPortalProfileEditor() {
    const sessionUser = getStoredSessionUser();
    if (!sessionUser) {
        return;
    }

    let profile = getStoredPortalProfile(sessionUser);
    profile = {
        displayName: getPortalDisplayName(sessionUser, profile),
        profileImage: getPortalProfileImage(sessionUser, profile)
    };

    savePortalProfile(sessionUser, profile);
    updatePortalProfileUi(profile.displayName, profile.profileImage);
    loadPortalProfileFromServer(sessionUser).catch((error) => {
        console.warn("Portal profile load failed:", error.message);
    });

    const profileLink = Array.from(document.querySelectorAll(".user-menu .user-footer a")).find((link) =>
        (link.textContent || "").trim().toLowerCase() === "profile"
    );

    if (!profileLink || typeof bootstrap === "undefined") {
        return;
    }

    profileLink.href = "#";
    profileLink.setAttribute("data-bs-toggle", "modal");
    profileLink.setAttribute("data-bs-target", "#portalProfileModal");

    const modal = ensurePortalProfileModal();
    const profileForm = modal.querySelector("#portalProfileForm");
    const nameInput = modal.querySelector("#portalProfileName");
    const imageInput = modal.querySelector("#portalProfileImageInput");
    const imagePreview = modal.querySelector("#portalProfilePreview");
    const removeImageButton = modal.querySelector("#portalProfileRemoveImage");
    const saveButton = profileForm.querySelector('button[type="submit"]');
    let selectedProfileImage = profile.profileImage;
    let selectedProfileImageFile = null;
    let removeSelectedProfileImage = false;

    modal.addEventListener("show.bs.modal", () => {
        const latestSessionUser = getStoredSessionUser();
        const latestProfile = getStoredPortalProfile(latestSessionUser);
        profile = {
            displayName: getPortalDisplayName(latestSessionUser, latestProfile),
            profileImage: getPortalProfileImage(latestSessionUser, latestProfile)
        };
        selectedProfileImage = profile.profileImage;
        selectedProfileImageFile = null;
        removeSelectedProfileImage = false;
        nameInput.value = profile.displayName;
        imagePreview.src = selectedProfileImage;
        imageInput.value = "";
    });

    imageInput.addEventListener("change", () => {
        const file = imageInput.files?.[0];
        if (!file) {
            return;
        }

        if (!file.type.startsWith("image/")) {
            imageInput.value = "";
            alert("Please select a valid image file.");
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            imageInput.value = "";
            alert("Please choose an image smaller than 2MB.");
            return;
        }

        selectedProfileImageFile = file;
        removeSelectedProfileImage = false;
        const reader = new FileReader();
        reader.addEventListener("load", () => {
            selectedProfileImage = reader.result;
            imagePreview.src = selectedProfileImage;
        });
        reader.readAsDataURL(file);
    });

    removeImageButton.addEventListener("click", () => {
        selectedProfileImage = defaultPortalProfileImage;
        selectedProfileImageFile = null;
        removeSelectedProfileImage = true;
        imagePreview.src = selectedProfileImage;
        imageInput.value = "";
    });

    profileForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const latestSessionUser = getStoredSessionUser();
        const displayName = nameInput.value.trim();
        if (!displayName || !latestSessionUser) {
            return;
        }

        if (saveButton) {
            saveButton.disabled = true;
            saveButton.textContent = "Saving...";
        }

        try {
            const savedProfile = await savePortalProfileToServer({
                displayName,
                profileImageFile: selectedProfileImageFile,
                removeProfileImage: removeSelectedProfileImage
            });

            profile = toPortalProfile(latestSessionUser, savedProfile);

            if (!savePortalProfile(latestSessionUser, profile)) {
                return;
            }
            updatePortalProfileUi(profile.displayName, profile.profileImage);
        } catch (error) {
            console.error("Portal profile save failed:", error);
            alert(error.message || "Unable to save profile.");
            return;
        } finally {
            if (saveButton) {
                saveButton.disabled = false;
                saveButton.textContent = "Save Profile";
            }
        }

        const modalInstance = bootstrap.Modal.getInstance(modal);
        if (document.activeElement) {
            document.activeElement.blur();
        }
        modalInstance?.hide();
    });
}

document.addEventListener("DOMContentLoaded", () => {
    setupPortalProfileEditor();

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
