document.addEventListener('DOMContentLoaded', function() { 
  try {
    const sessionUser = localStorage.getItem('sessionUser');
    const sessionTimeout = localStorage.getItem('sessionTimeout');
    const guestMode = localStorage.getItem('guestMode') === 'true';
    const now = Date.now();

    let hasValidSession = false;

    if (sessionUser && sessionTimeout) {
      const timeout = parseInt(sessionTimeout, 10);
      if (!isNaN(timeout)) {
        hasValidSession = now < timeout;

        if (!hasValidSession) {
          localStorage.removeItem('sessionUser');
          localStorage.removeItem('sessionTimeout');
        }
      }
    }

    const currentPath = window.location.pathname;

    // ✅ ONLY protected pages
    const restrictedPages = ['/', '/profile', '/enrollment', '/notifications'];

    if (restrictedPages.includes(currentPath) && !hasValidSession && !guestMode) {
      window.location.href = '/login';
      return;
    }

  } catch (error) {
    console.log("Storage error:", error);
  }
});

// ======================
// LOGOUT FUNCTION
// ======================
function logout() {
  try {
    localStorage.removeItem('sessionUser');
    localStorage.removeItem('sessionTimeout');
    localStorage.removeItem('guestMode');
  } catch (error) {}

  window.location.href = '/login';
}