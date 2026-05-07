document.addEventListener('DOMContentLoaded', function() { 
  try {
    const sessionUser = localStorage.getItem('sessionUser');
    const sessionTimeout = localStorage.getItem('sessionTimeout');
    const guestMode = localStorage.getItem('guestMode') === 'true';
    const now = Date.now();

    let hasValidSession = false;

    if (sessionUser && sessionTimeout && !guestMode) {
      const timeout = parseInt(sessionTimeout, 10);
      if (!isNaN(timeout)) {
        hasValidSession = now < timeout;

        if (!hasValidSession) {
          localStorage.removeItem('sessionUser');
          localStorage.removeItem('sessionTimeout');
        }
      }
    }

    const currentPath = window.location.pathname.replace(/\/+$|^\s+|\s+$/g, '') || '/';
    const parsedSessionUser = sessionUser ? JSON.parse(sessionUser) : null;
    const role = String(parsedSessionUser?.user?.role || parsedSessionUser?.role || '').trim().toLowerCase();
    const roleHome = {
      admin: '/dashboard',
      registrar: '/registrar',
      superadmin: '/superadmin/dashboard',
      'super admin': '/superadmin/dashboard',
      user: '/profile',
      student: '/profile',
    };
    const roleRoutePrefix = role === 'registrar'
      ? '/registrar'
      : (role === 'superadmin' || role === 'super admin')
        ? '/superadmin'
        : '';

    if (roleRoutePrefix) {
      const roleAwareLinks = [
        '/dashboard',
        '/accounts',
        '/application-evaluation',
        '/application-queue',
        '/notification',
        '/rep-and-analytics',
      ];

      roleAwareLinks.forEach((path) => {
        document.querySelectorAll(`a[href="${path}"]`).forEach((link) => {
          link.setAttribute('href', `${roleRoutePrefix}${path}`);
        });
      });
    }

    // ✅ STRICTLY protected pages - No guest mode allowed
    const restrictedPages = [
      '/profile',
      '/enrollment-form',
      '/notifications',
      '/staff-notifications',
      '/registrar',
      '/dashboard',
      '/accounts',
      '/application-evaluation',
      '/application-queue',
      '/notification',
      '/rep-and-analytics',
      '/superadmin',
      '/superadmin/dashboard',
      '/superadmin/registrar',
      '/superadmin/accounts',
      '/superadmin/application-evaluation',
      '/superadmin/application-queue',
      '/superadmin/notification',
      '/superadmin/rep-and-analytics',
    ];

    const isRestrictedPage = restrictedPages.includes(currentPath) ||
      currentPath.startsWith('/registrar/') ||
      currentPath.startsWith('/superadmin/');

    if (isRestrictedPage && !hasValidSession) {
      window.location.replace('/login?next=' + encodeURIComponent(window.location.pathname));
      return;
    }

    const adminOnlyPages = [
      '/dashboard',
      '/accounts',
      '/application-evaluation',
      '/application-queue',
      '/notification',
      '/rep-and-analytics',
    ];
    const superAdminOnlyPage = currentPath === '/superadmin' || currentPath.startsWith('/superadmin/');
    const registrarOnlyPage = currentPath === '/registrar' || currentPath.startsWith('/registrar/');
    const adminPage = adminOnlyPages.includes(currentPath);
    const isSuperAdmin = role === 'superadmin' || role === 'super admin';
    const hasWrongRole =
      (adminPage && role !== 'admin' && !isSuperAdmin) ||
      (registrarOnlyPage && role !== 'registrar' && !isSuperAdmin) ||
      (superAdminOnlyPage && !isSuperAdmin);

    if (isRestrictedPage && hasValidSession && hasWrongRole) {
      window.location.replace(roleHome[role] || '/profile');
      return;
    }

    if (hasValidSession && ['admin', 'registrar', 'superadmin', 'super admin'].includes(role)) {
      installStaffNotificationBell();
    }

    // For homepage, require login unless in guest mode
    if (currentPath === '/' && !hasValidSession && !guestMode) {
      window.location.replace('/login');
      return;
    }

  } catch (error) {
    console.log("Storage error:", error);
  }

  const signOutButtons = document.querySelectorAll('#sign-out');
  signOutButtons.forEach((button) => {
    button.addEventListener('click', function(event) {
      event.preventDefault();
      logout();
    });
  });
});

function installStaffNotificationBell() {
  const navbar = document.querySelector('.app-header .navbar-nav.ms-auto');
  if (!navbar || navbar.querySelector('[data-staff-notification-link]')) {
    return;
  }

  const userMenu = navbar.querySelector('.user-menu');
  const item = document.createElement('li');
  item.className = 'nav-item';
  item.innerHTML = `
    <a class="nav-link position-relative" href="/staff-notifications" data-staff-notification-link title="Notification inbox">
      <i class="fa-regular fa-bell"></i>
      <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger d-none" data-staff-notification-badge></span>
    </a>
  `;

  if (userMenu) {
    navbar.insertBefore(item, userMenu);
  } else {
    navbar.prepend(item);
  }

  refreshStaffNotificationBadge();
}

async function refreshStaffNotificationBadge() {
  const badge = document.querySelector('[data-staff-notification-badge]');
  if (!badge) {
    return;
  }

  try {
    const response = await fetch('/api/notifications/staff');
    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Unable to load staff notifications.');
    }

    const unreadCount = (Array.isArray(result.data) ? result.data : []).filter((notification) =>
      notification?.is_read !== 1 && String(notification?.is_read).toLowerCase() !== 'true'
    ).length;

    if (unreadCount > 0) {
      badge.textContent = unreadCount > 9 ? '9+' : String(unreadCount);
      badge.classList.remove('d-none');
    } else {
      badge.textContent = '';
      badge.classList.add('d-none');
    }
  } catch (error) {
    badge.textContent = '';
    badge.classList.add('d-none');
  }
}

// ======================
// LOGOUT FUNCTION
// ======================
function logout() {
  try {
    fetch('/api/auth/logout', { method: 'POST', keepalive: true }).catch(() => {});
    localStorage.removeItem('sessionUser');
    localStorage.removeItem('sessionTimeout');
    localStorage.removeItem('authToken');
    localStorage.removeItem('guestMode');
    localStorage.removeItem('studentProfileId');
    localStorage.removeItem('studentProfileEmail');
  } catch (error) {}

  window.location.replace('/login');
}
