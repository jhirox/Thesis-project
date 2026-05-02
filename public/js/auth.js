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

    // ✅ STRICTLY protected pages - No guest mode allowed
    const restrictedPages = [
      '/profile',
      '/enrollment-form',
      '/notifications',
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

// ======================
// LOGOUT FUNCTION
// ======================
function logout() {
  try {
    localStorage.removeItem('sessionUser');
    localStorage.removeItem('sessionTimeout');
    localStorage.removeItem('authToken');
    localStorage.removeItem('guestMode');
  } catch (error) {}

  window.location.replace('/login');
}
