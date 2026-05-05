(function () {
  function getSessionUserEmail() {
    try {
      const sessionUserStr = localStorage.getItem("sessionUser");
      const sessionUser = sessionUserStr ? JSON.parse(sessionUserStr) : null;
      return sessionUser?.user?.email || "";
    } catch (error) {
      console.error("Unable to read session user for notifications badge:", error);
      return "";
    }
  }

  function getNotificationTargets() {
    const explicitTargets = Array.from(document.querySelectorAll("[data-notification-link], [data-notification-trigger]"));
    const inferredTargets = Array.from(document.querySelectorAll('a[href="/notifications"]')).filter((element) =>
      element.querySelector(".bi-bell")
    );

    return Array.from(new Set([...explicitTargets, ...inferredTargets]));
  }

  function ensureBadge(target) {
    if (!target) {
      return null;
    }

    target.classList.add("position-relative");
    let badge = target.querySelector("[data-notification-badge]");

    if (!badge) {
      badge = document.createElement("span");
      badge.setAttribute("data-notification-badge", "");
      badge.className = "position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger d-none";
      target.appendChild(badge);
    }

    return badge;
  }

  function renderUnreadBadge(count) {
    const safeCount = Number.isFinite(Number(count)) ? Number(count) : 0;
    const displayCount = safeCount > 9 ? "9+" : String(safeCount);

    getNotificationTargets().forEach((target) => {
      const badge = ensureBadge(target);
      if (!badge) {
        return;
      }

      if (safeCount > 0) {
        badge.textContent = displayCount;
        badge.classList.remove("d-none");
      } else {
        badge.textContent = "";
        badge.classList.add("d-none");
      }
    });
  }

  function isNotificationRead(notification) {
    const readValue = notification?.is_read;
    return readValue === true ||
      readValue === 1 ||
      String(readValue).trim().toLowerCase() === "1" ||
      String(readValue).trim().toLowerCase() === "true";
  }

  function setStoredUnreadCount(count) {
    const safeCount = Math.max(0, Number(count) || 0);
    try {
      localStorage.setItem("userNotificationUnreadCount", String(safeCount));
    } catch (error) {}
    renderUnreadBadge(safeCount);
  }

  async function fetchUnreadCount() {
    const email = getSessionUserEmail();
    if (!email) {
      setStoredUnreadCount(0);
      return;
    }

    try {
      const response = await fetch(`/api/notifications?email=${encodeURIComponent(email)}`);
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to load notifications.");
      }

      const notifications = Array.isArray(result.data) ? result.data : [];
      const unreadCount = notifications.filter((notification) => !isNotificationRead(notification)).length;
      setStoredUnreadCount(unreadCount);
    } catch (error) {
      console.error("Unable to refresh notifications badge:", error);
      setStoredUnreadCount(0);
    }
  }

  function loadStoredUnreadCount() {
    try {
      const storedCount = Number(localStorage.getItem("userNotificationUnreadCount") || "0");
      renderUnreadBadge(storedCount);
    } catch (error) {
      renderUnreadBadge(0);
    }
  }

  window.addEventListener("user-notifications-updated", (event) => {
    setStoredUnreadCount(event?.detail?.unreadCount || 0);
  });

  window.addEventListener("storage", (event) => {
    if (event.key === "userNotificationUnreadCount") {
      renderUnreadBadge(Number(event.newValue || "0"));
    }
  });

  document.addEventListener("DOMContentLoaded", () => {
    renderUnreadBadge(0);
    fetchUnreadCount();
  });
})();
