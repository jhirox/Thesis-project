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

    const currentPath = window.location.pathname;

    // ✅ STRICTLY protected pages - No guest mode allowed
    const restrictedPages = ['/profile', '/enrollment-form', '/notifications'];

    if (restrictedPages.includes(currentPath) && !hasValidSession) {
      // Use replace to prevent browser back button
      window.location.replace('/login');
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

  window.location.replace('/login');
}