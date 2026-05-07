/**
 * Central Skeleton Loading Templates
 * Consolidated skeleton templates for all pages across the application
 * Each template is exported as a function that returns the HTML string
 */

// ============================================================================
// ADMIN PAGES - Dashboard & Management
// ============================================================================

/**
 * Admin Dashboard Skeleton - Shows loading state for dashboard with stats and charts
 */
export const skeletons = {
  // =========================================================================
  // HOME/PUBLIC PAGES
  // =========================================================================

  /**
   * Home Page Skeleton - Full loading state for homepage with hero section
   */
  homePageSkeleton: () => `
    <div id="skeleton-screen" class="skeleton-screen">
      <div class="container-fluid p-0 d-flex h-100">
        <!-- Skeleton Sidebar -->
        <div class="skeleton-sidebar-wrapper d-none d-md-flex flex-column align-items-center flex-shrink-0 p-3">
          <div class="skeleton skeleton-logo mb-3"></div>
          <div class="skeleton skeleton-nav-item mb-2"></div>
          <div class="skeleton skeleton-nav-item mb-2"></div>
          <div class="skeleton skeleton-nav-item mb-2"></div>
          <div class="skeleton skeleton-nav-item mb-2"></div>
        </div>

        <!-- Skeleton Main Content -->
        <div class="skeleton-main flex-fill">
          <!-- Skeleton Mobile Header -->
          <div class="skeleton-header d-md-none p-3">
            <div class="d-flex align-items-center justify-content-between">
              <div class="d-flex align-items-center">
                <div class="skeleton skeleton-icon me-2"></div>
                <div class="skeleton skeleton-title ms-2"></div>
              </div>
              <div class="skeleton skeleton-icon"></div>
            </div>
          </div>

          <!-- Skeleton Desktop Header -->
          <div class="skeleton-header d-none d-md-block p-3">
            <div class="d-flex align-items-center justify-content-between">
              <div class="skeleton skeleton-title"></div>
              <div class="d-flex gap-3">
                <div class="skeleton skeleton-icon"></div>
                <div class="skeleton skeleton-icon"></div>
              </div>
            </div>
          </div>

          <!-- Skeleton Hero Section -->
          <div class="skeleton-hero-section">
            <div class="container">
              <div class="row align-items-center">
                <div class="col-lg-7">
                  <div class="skeleton skeleton-text-small mb-2"></div>
                  <div class="skeleton skeleton-text-large mb-3"></div>
                  <div class="skeleton skeleton-text-lead mb-4"></div>
                  <div class="d-flex flex-column flex-sm-row gap-3">
                    <div class="skeleton skeleton-button"></div>
                    <div class="skeleton skeleton-button-outline"></div>
                  </div>
                </div>
                <div class="col-lg-5 d-none d-lg-block">
                  <div class="skeleton skeleton-image"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Skeleton Office Section -->
          <div class="skeleton-office-section">
            <div class="container">
              <div class="text-center mb-5">
                <div class="skeleton skeleton-text-large mb-2"></div>
                <div class="skeleton skeleton-text mb-0"></div>
              </div>
              <div class="row g-4">
                <div class="col-12 col-md-6 col-lg-4">
                  <div class="skeleton skeleton-office-card"></div>
                </div>
                <div class="col-12 col-md-6 col-lg-4">
                  <div class="skeleton skeleton-office-card"></div>
                </div>
                <div class="col-12 col-md-6 col-lg-4">
                  <div class="skeleton skeleton-office-card"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Skeleton Contact Section -->
          <div class="skeleton-contact-section py-5">
            <div class="container-fluid">
              <div class="row justify-content-center g-4">
                <div class="col-12 text-center mb-4">
                  <div class="skeleton skeleton-text mb-0"></div>
                </div>
                <div class="col-12 col-md-4">
                  <div class="skeleton skeleton-contact-tile"></div>
                </div>
                <div class="col-12 col-md-4">
                  <div class="skeleton skeleton-contact-tile"></div>
                </div>
                <div class="col-12 col-md-4">
                  <div class="skeleton skeleton-contact-tile"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Skeleton Footer -->
          <div class="skeleton-footer py-4">
            <div class="container">
              <div class="row mb-4 pb-4">
                <div class="col-md-3 mb-3 mb-md-0">
                  <div class="skeleton skeleton-text mb-3"></div>
                  <div class="skeleton skeleton-link mb-2"></div>
                  <div class="skeleton skeleton-link mb-2"></div>
                  <div class="skeleton skeleton-link mb-0"></div>
                </div>
                <div class="col-md-3 mb-3 mb-md-0">
                  <div class="skeleton skeleton-text mb-3"></div>
                  <div class="skeleton skeleton-link mb-2"></div>
                  <div class="skeleton skeleton-link mb-2"></div>
                  <div class="skeleton skeleton-link mb-0"></div>
                </div>
                <div class="col-md-3 mb-3 mb-md-0">
                  <div class="skeleton skeleton-text mb-3"></div>
                  <div class="skeleton skeleton-link mb-2"></div>
                  <div class="skeleton skeleton-link mb-2"></div>
                  <div class="skeleton skeleton-link mb-0"></div>
                </div>
                <div class="col-md-3">
                  <div class="skeleton skeleton-text mb-3"></div>
                  <div class="skeleton skeleton-link mb-2"></div>
                  <div class="skeleton skeleton-link mb-0"></div>
                </div>
              </div>
              <div class="text-center">
                <div class="skeleton skeleton-text mb-1"></div>
                <div class="skeleton skeleton-text-small mb-1"></div>
                <div class="skeleton skeleton-text-small mb-0"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,

  // =========================================================================
  // ADMIN - DASHBOARD
  // =========================================================================

  /**
   * Admin Dashboard Skeleton - Full dashboard with stats cards, charts, and recent applications
   */
  adminDashboardSkeleton: () => `
    <div id="dashboard-shell-skeleton" class="dashboard-shell-skeleton">
      <div class="dashboard-shell-skeleton__header">
        <div class="dashboard-shell-skeleton__header-left">
          <div class="skeleton dashboard-shell-skeleton__hamburger"></div>
        </div>
        <div class="dashboard-shell-skeleton__header-right">
          <div class="skeleton dashboard-shell-skeleton__header-user"></div>
          <div class="skeleton dashboard-shell-skeleton__header-avatar"></div>
        </div>
      </div>

      <div class="dashboard-shell-skeleton__body">
        <aside class="dashboard-shell-skeleton__sidebar">
          <div class="dashboard-shell-skeleton__brand">
            <div class="skeleton dashboard-shell-skeleton__brand-logo"></div>
            <div class="skeleton dashboard-shell-skeleton__brand-text"></div>
          </div>

          <div class="dashboard-shell-skeleton__section">
            <div class="skeleton dashboard-shell-skeleton__section-title"></div>
            <div class="skeleton dashboard-shell-skeleton__nav-item is-active"></div>
            <div class="skeleton dashboard-shell-skeleton__nav-item"></div>
            <div class="skeleton dashboard-shell-skeleton__nav-item"></div>
          </div>

          <div class="dashboard-shell-skeleton__section">
            <div class="skeleton dashboard-shell-skeleton__section-title"></div>
            <div class="skeleton dashboard-shell-skeleton__nav-item"></div>
            <div class="skeleton dashboard-shell-skeleton__nav-item"></div>
            <div class="skeleton dashboard-shell-skeleton__nav-item"></div>
          </div>
        </aside>

        <div class="dashboard-shell-skeleton__main">
          <div class="dashboard-shell-skeleton__page-header">
            <div>
              <div class="skeleton dashboard-shell-skeleton__page-title"></div>
            </div>
            <div class="dashboard-shell-skeleton__breadcrumbs">
              <div class="skeleton dashboard-shell-skeleton__crumb"></div>
              <div class="skeleton dashboard-shell-skeleton__crumb dashboard-shell-skeleton__crumb--small"></div>
            </div>
          </div>

          <div class="dashboard-shell-skeleton__content">
            <div class="row top-cards g-3 mb-4 px-4 py-3 pt-0">
              <div class="col-sm-6 col-md-3">
                <div class="skeleton-dashboard-card">
                  <div class="d-flex justify-content-between align-items-start mb-4">
                    <div class="skeleton skeleton-label"></div>
                    <div class="skeleton skeleton-stat-icon"></div>
                  </div>
                  <div class="skeleton skeleton-stat-value mb-3"></div>
                  <div class="skeleton skeleton-stat-meta"></div>
                </div>
              </div>
              <div class="col-sm-6 col-md-3">
                <div class="skeleton-dashboard-card">
                  <div class="d-flex justify-content-between align-items-start mb-4">
                    <div class="skeleton skeleton-label"></div>
                    <div class="skeleton skeleton-stat-icon"></div>
                  </div>
                  <div class="skeleton skeleton-stat-value mb-3"></div>
                  <div class="skeleton skeleton-stat-meta"></div>
                </div>
              </div>
              <div class="col-sm-6 col-md-3">
                <div class="skeleton-dashboard-card">
                  <div class="d-flex justify-content-between align-items-start mb-4">
                    <div class="skeleton skeleton-label"></div>
                    <div class="skeleton skeleton-stat-icon"></div>
                  </div>
                  <div class="skeleton skeleton-stat-value mb-3"></div>
                  <div class="skeleton skeleton-stat-meta"></div>
                </div>
              </div>
              <div class="col-sm-6 col-md-3">
                <div class="skeleton-dashboard-card">
                  <div class="d-flex justify-content-between align-items-start mb-4">
                    <div class="skeleton skeleton-label"></div>
                    <div class="skeleton skeleton-stat-icon"></div>
                  </div>
                  <div class="skeleton skeleton-stat-value mb-3"></div>
                  <div class="skeleton skeleton-stat-meta"></div>
                </div>
              </div>
            </div>

            <div class="row g-3 mb-4 px-4">
              <div class="col-lg-7">
                <div class="skeleton-dashboard-panel skeleton-dashboard-chart">
                  <div class="skeleton skeleton-panel-title mb-4"></div>
                  <div class="skeleton skeleton-chart-bars"></div>
                </div>
              </div>
              <div class="col-lg-5">
                <div class="skeleton-dashboard-panel skeleton-dashboard-chart">
                  <div class="skeleton skeleton-panel-title mb-4"></div>
                  <div class="skeleton skeleton-chart-donut"></div>
                </div>
              </div>
            </div>

            <div class="px-4">
              <div class="recent-applications p-3 skeleton-dashboard-panel">
                <div class="skeleton skeleton-panel-title mb-3"></div>

                <div class="skeleton-dashboard-application-card">
                  <div>
                    <div class="skeleton skeleton-application-name mb-2"></div>
                    <div class="skeleton skeleton-application-id"></div>
                  </div>
                  <div class="skeleton-application-meta">
                    <div class="skeleton skeleton-status-pill"></div>
                    <div class="skeleton skeleton-timestamp"></div>
                  </div>
                </div>

                <div class="skeleton-dashboard-application-card">
                  <div>
                    <div class="skeleton skeleton-application-name mb-2"></div>
                    <div class="skeleton skeleton-application-id"></div>
                  </div>
                  <div class="skeleton-application-meta">
                    <div class="skeleton skeleton-status-pill"></div>
                    <div class="skeleton skeleton-timestamp"></div>
                  </div>
                </div>

                <div class="skeleton-dashboard-application-card">
                  <div>
                    <div class="skeleton skeleton-application-name mb-2"></div>
                    <div class="skeleton skeleton-application-id"></div>
                  </div>
                  <div class="skeleton-application-meta">
                    <div class="skeleton skeleton-status-pill"></div>
                    <div class="skeleton skeleton-timestamp"></div>
                  </div>
                </div>

                <div class="skeleton-dashboard-application-card">
                  <div>
                    <div class="skeleton skeleton-application-name mb-2"></div>
                    <div class="skeleton skeleton-application-id"></div>
                  </div>
                  <div class="skeleton-application-meta">
                    <div class="skeleton skeleton-status-pill"></div>
                    <div class="skeleton skeleton-timestamp"></div>
                  </div>
                </div>

                <div class="justify-content-center d-flex pt-2">
                  <div class="skeleton skeleton-dashboard-button"></div>
                </div>
              </div>
            </div>

            <div class="quick-actions col-lg-10 px-4 py-3">
              <div class="skeleton skeleton-panel-title mb-3"></div>
              <div class="skeleton skeleton-dashboard-action mb-2"></div>
              <div class="skeleton skeleton-dashboard-action mb-2"></div>
              <div class="skeleton skeleton-dashboard-action mb-2"></div>
              <div class="skeleton skeleton-dashboard-action"></div>
            </div>
          </div>

          <div class="dashboard-shell-skeleton__footer">
            <div class="skeleton dashboard-shell-skeleton__footer-line"></div>
            <div class="skeleton dashboard-shell-skeleton__footer-line dashboard-shell-skeleton__footer-line--short"></div>
          </div>
        </div>
      </div>
    </div>
  `,

  // =========================================================================
  // ADMIN - GENERAL PAGES (Accounts, Notification, etc.)
  // =========================================================================

  /**
   * Admin Generic Page Skeleton - Base skeleton for standard admin pages with header/sidebar
   */
  adminPageBaseSkeleton: () => `
    <div id="page-skeleton" class="admin-page-skeleton">
      <div class="admin-page-skeleton__header">
        <div class="admin-page-skeleton__header-group">
          <div class="skeleton admin-page-skeleton__hamburger"></div>
        </div>
        <div class="admin-page-skeleton__header-group">
          <div class="skeleton admin-page-skeleton__header-user"></div>
          <div class="skeleton admin-page-skeleton__header-avatar"></div>
        </div>
      </div>
      <div class="admin-page-skeleton__body">
        <aside class="admin-page-skeleton__sidebar">
          <div class="admin-page-skeleton__brand">
            <div class="skeleton admin-page-skeleton__brand-logo"></div>
            <div class="skeleton admin-page-skeleton__brand-text"></div>
          </div>
          <div class="admin-page-skeleton__section">
            <div class="skeleton admin-page-skeleton__section-title"></div>
            <div class="skeleton admin-page-skeleton__nav-item"></div>
            <div class="skeleton admin-page-skeleton__nav-item"></div>
            <div class="skeleton admin-page-skeleton__nav-item"></div>
          </div>
          <div class="admin-page-skeleton__section">
            <div class="skeleton admin-page-skeleton__section-title"></div>
            <div class="skeleton admin-page-skeleton__nav-item is-active"></div>
            <div class="skeleton admin-page-skeleton__nav-item"></div>
            <div class="skeleton admin-page-skeleton__nav-item"></div>
          </div>
        </aside>
        <div class="admin-page-skeleton__main">
          <div class="admin-page-skeleton__page-header">
            <div class="skeleton admin-page-skeleton__page-title"></div>
            <div class="admin-page-skeleton__breadcrumbs">
              <div class="skeleton admin-page-skeleton__crumb"></div>
              <div class="skeleton admin-page-skeleton__crumb admin-page-skeleton__crumb--small"></div>
            </div>
          </div>
          <div class="admin-page-skeleton__content">
            <div class="row top-cards g-3 mb-4 px-4 py-3 pt-0">
              <div class="col-sm-6 col-md-3"><div class="skeleton-dashboard-card"><div class="d-flex justify-content-between align-items-start mb-4"><div class="skeleton skeleton-label"></div><div class="skeleton skeleton-stat-icon"></div></div><div class="skeleton skeleton-stat-value mb-3"></div><div class="skeleton skeleton-stat-meta"></div></div></div>
              <div class="col-sm-6 col-md-3"><div class="skeleton-dashboard-card"><div class="d-flex justify-content-between align-items-start mb-4"><div class="skeleton skeleton-label"></div><div class="skeleton skeleton-stat-icon"></div></div><div class="skeleton skeleton-stat-value mb-3"></div><div class="skeleton skeleton-stat-meta"></div></div></div>
              <div class="col-sm-6 col-md-3"><div class="skeleton-dashboard-card"><div class="d-flex justify-content-between align-items-start mb-4"><div class="skeleton skeleton-label"></div><div class="skeleton skeleton-stat-icon"></div></div><div class="skeleton skeleton-stat-value mb-3"></div><div class="skeleton skeleton-stat-meta"></div></div></div>
              <div class="col-sm-6 col-md-3"><div class="skeleton-dashboard-card"><div class="d-flex justify-content-between align-items-start mb-4"><div class="skeleton skeleton-label"></div><div class="skeleton skeleton-stat-icon"></div></div><div class="skeleton skeleton-stat-value mb-3"></div><div class="skeleton skeleton-stat-meta"></div></div></div>
            </div>
          </div>
          <div class="admin-page-skeleton__footer">
            <div class="skeleton admin-page-skeleton__footer-line"></div>
            <div class="skeleton admin-page-skeleton__footer-line admin-page-skeleton__footer-line--short"></div>
          </div>
        </div>
      </div>
    </div>
  `,

  /**
   * Admin Accounts Page Skeleton - With tabs and table
   */
  adminAccountsSkeleton: () => `
    <div id="page-skeleton" class="admin-page-skeleton">
      <div class="admin-page-skeleton__header">
        <div class="admin-page-skeleton__header-group">
          <div class="skeleton admin-page-skeleton__hamburger"></div>
        </div>
        <div class="admin-page-skeleton__header-group">
          <div class="skeleton admin-page-skeleton__header-user"></div>
          <div class="skeleton admin-page-skeleton__header-avatar"></div>
        </div>
      </div>
      <div class="admin-page-skeleton__body">
        <aside class="admin-page-skeleton__sidebar">
          <div class="admin-page-skeleton__brand">
            <div class="skeleton admin-page-skeleton__brand-logo"></div>
            <div class="skeleton admin-page-skeleton__brand-text"></div>
          </div>
          <div class="admin-page-skeleton__section">
            <div class="skeleton admin-page-skeleton__section-title"></div>
            <div class="skeleton admin-page-skeleton__nav-item"></div>
            <div class="skeleton admin-page-skeleton__nav-item"></div>
            <div class="skeleton admin-page-skeleton__nav-item"></div>
          </div>
          <div class="admin-page-skeleton__section">
            <div class="skeleton admin-page-skeleton__section-title"></div>
            <div class="skeleton admin-page-skeleton__nav-item is-active"></div>
            <div class="skeleton admin-page-skeleton__nav-item"></div>
            <div class="skeleton admin-page-skeleton__nav-item"></div>
          </div>
        </aside>
        <div class="admin-page-skeleton__main">
          <div class="admin-page-skeleton__page-header">
            <div class="skeleton admin-page-skeleton__page-title"></div>
            <div class="admin-page-skeleton__breadcrumbs">
              <div class="skeleton admin-page-skeleton__crumb"></div>
              <div class="skeleton admin-page-skeleton__crumb admin-page-skeleton__crumb--small"></div>
            </div>
          </div>
          <div class="admin-page-skeleton__content">
            <div class="row top-cards g-3 mb-4 px-4 py-3 pt-0">
              <div class="col-sm-6 col-md-3"><div class="skeleton-dashboard-card"><div class="d-flex justify-content-between align-items-start mb-4"><div class="skeleton skeleton-label"></div><div class="skeleton skeleton-stat-icon"></div></div><div class="skeleton skeleton-stat-value mb-3"></div><div class="skeleton skeleton-stat-meta"></div></div></div>
              <div class="col-sm-6 col-md-3"><div class="skeleton-dashboard-card"><div class="d-flex justify-content-between align-items-start mb-4"><div class="skeleton skeleton-label"></div><div class="skeleton skeleton-stat-icon"></div></div><div class="skeleton skeleton-stat-value mb-3"></div><div class="skeleton skeleton-stat-meta"></div></div></div>
              <div class="col-sm-6 col-md-3"><div class="skeleton-dashboard-card"><div class="d-flex justify-content-between align-items-start mb-4"><div class="skeleton skeleton-label"></div><div class="skeleton skeleton-stat-icon"></div></div><div class="skeleton skeleton-stat-value mb-3"></div><div class="skeleton skeleton-stat-meta"></div></div></div>
              <div class="col-sm-6 col-md-3"><div class="skeleton-dashboard-card"><div class="d-flex justify-content-between align-items-start mb-4"><div class="skeleton skeleton-label"></div><div class="skeleton skeleton-stat-icon"></div></div><div class="skeleton skeleton-stat-value mb-3"></div><div class="skeleton skeleton-stat-meta"></div></div></div>
            </div>
            <div class="admin-skeleton-tabs">
              <div class="skeleton admin-skeleton-tab"></div>
              <div class="skeleton admin-skeleton-tab"></div>
              <div class="skeleton admin-skeleton-tab"></div>
            </div>
            <div class="admin-skeleton-panel">
              <div class="skeleton admin-skeleton-panel-title"></div>
              <div class="skeleton admin-skeleton-panel-subtitle"></div>
              <div class="admin-skeleton-fields">
                <div class="skeleton admin-skeleton-field--long"></div>
                <div class="skeleton admin-skeleton-field"></div>
                <div class="skeleton admin-skeleton-field"></div>
                <div class="skeleton admin-skeleton-field"></div>
                <div class="skeleton admin-skeleton-field"></div>
                <div class="skeleton admin-skeleton-button"></div>
              </div>
              <div class="admin-skeleton-table">
                <div class="skeleton admin-skeleton-table-head"></div>
                <div class="skeleton admin-skeleton-table-row"></div>
                <div class="skeleton admin-skeleton-table-row"></div>
                <div class="skeleton admin-skeleton-table-row"></div>
                <div class="skeleton admin-skeleton-table-row"></div>
              </div>
            </div>
          </div>
          <div class="admin-page-skeleton__footer">
            <div class="skeleton admin-page-skeleton__footer-line"></div>
            <div class="skeleton admin-page-skeleton__footer-line admin-page-skeleton__footer-line--short"></div>
          </div>
        </div>
      </div>
    </div>
  `,

  /**
   * Admin Application Queue Skeleton - With list cards and action buttons
   */
  adminApplicationQueueSkeleton: () => `
    <div id="page-skeleton" class="admin-page-skeleton">
      <div class="admin-page-skeleton__header">
        <div class="admin-page-skeleton__header-group">
          <div class="skeleton admin-page-skeleton__hamburger"></div>
        </div>
        <div class="admin-page-skeleton__header-group">
          <div class="skeleton admin-page-skeleton__header-user"></div>
          <div class="skeleton admin-page-skeleton__header-avatar"></div>
        </div>
      </div>
      <div class="admin-page-skeleton__body">
        <aside class="admin-page-skeleton__sidebar">
          <div class="admin-page-skeleton__brand">
            <div class="skeleton admin-page-skeleton__brand-logo"></div>
            <div class="skeleton admin-page-skeleton__brand-text"></div>
          </div>
          <div class="admin-page-skeleton__section">
            <div class="skeleton admin-page-skeleton__section-title"></div>
            <div class="skeleton admin-page-skeleton__nav-item"></div>
            <div class="skeleton admin-page-skeleton__nav-item is-active"></div>
            <div class="skeleton admin-page-skeleton__nav-item"></div>
          </div>
          <div class="admin-page-skeleton__section">
            <div class="skeleton admin-page-skeleton__section-title"></div>
            <div class="skeleton admin-page-skeleton__nav-item"></div>
            <div class="skeleton admin-page-skeleton__nav-item"></div>
            <div class="skeleton admin-page-skeleton__nav-item"></div>
          </div>
        </aside>
        <div class="admin-page-skeleton__main">
          <div class="admin-page-skeleton__page-header">
            <div class="skeleton admin-page-skeleton__page-title"></div>
            <div class="admin-page-skeleton__breadcrumbs">
              <div class="skeleton admin-page-skeleton__crumb"></div>
              <div class="skeleton admin-page-skeleton__crumb admin-page-skeleton__crumb--small"></div>
            </div>
          </div>
          <div class="admin-page-skeleton__content">
            <div class="row top-cards g-3 mb-4 px-4 py-3 pt-0">
              <div class="col-sm-6 col-md-3"><div class="skeleton-dashboard-card"><div class="d-flex justify-content-between align-items-start mb-4"><div class="skeleton skeleton-label"></div><div class="skeleton skeleton-stat-icon"></div></div><div class="skeleton skeleton-stat-value mb-3"></div><div class="skeleton skeleton-stat-meta"></div></div></div>
              <div class="col-sm-6 col-md-3"><div class="skeleton-dashboard-card"><div class="d-flex justify-content-between align-items-start mb-4"><div class="skeleton skeleton-label"></div><div class="skeleton skeleton-stat-icon"></div></div><div class="skeleton skeleton-stat-value mb-3"></div><div class="skeleton skeleton-stat-meta"></div></div></div>
              <div class="col-sm-6 col-md-3"><div class="skeleton-dashboard-card"><div class="d-flex justify-content-between align-items-start mb-4"><div class="skeleton skeleton-label"></div><div class="skeleton skeleton-stat-icon"></div></div><div class="skeleton skeleton-stat-value mb-3"></div><div class="skeleton skeleton-stat-meta"></div></div></div>
              <div class="col-sm-6 col-md-3"><div class="skeleton-dashboard-card"><div class="d-flex justify-content-between align-items-start mb-4"><div class="skeleton skeleton-label"></div><div class="skeleton skeleton-stat-icon"></div></div><div class="skeleton skeleton-stat-value mb-3"></div><div class="skeleton skeleton-stat-meta"></div></div></div>
            </div>
            <div class="admin-skeleton-panel">
              <div class="admin-skeleton-toolbar">
                <div class="skeleton admin-skeleton-panel-title"></div>
                <div class="admin-skeleton-toolbar-right">
                  <div class="skeleton admin-skeleton-search"></div>
                  <div class="skeleton admin-skeleton-button admin-skeleton-button--short"></div>
                </div>
              </div>
              <div class="admin-skeleton-list-card">
                <div class="admin-skeleton-list-main">
                  <div><div class="skeleton admin-skeleton-list-block"></div><div class="skeleton admin-skeleton-list-block--small mt-2"></div></div>
                  <div><div class="skeleton admin-skeleton-list-block"></div><div class="skeleton admin-skeleton-list-block--small mt-2"></div></div>
                  <div><div class="skeleton admin-skeleton-list-block--small"></div><div class="skeleton admin-skeleton-list-block--small mt-2"></div></div>
                </div>
                <div class="admin-skeleton-icon-row"><div class="skeleton admin-skeleton-status"></div><div class="skeleton admin-skeleton-icon"></div><div class="skeleton admin-skeleton-icon"></div><div class="skeleton admin-skeleton-icon"></div></div>
              </div>
              <div class="admin-skeleton-list-card">
                <div class="admin-skeleton-list-main">
                  <div><div class="skeleton admin-skeleton-list-block"></div><div class="skeleton admin-skeleton-list-block--small mt-2"></div></div>
                  <div><div class="skeleton admin-skeleton-list-block"></div><div class="skeleton admin-skeleton-list-block--small mt-2"></div></div>
                  <div><div class="skeleton admin-skeleton-list-block--small"></div><div class="skeleton admin-skeleton-list-block--small mt-2"></div></div>
                </div>
                <div class="admin-skeleton-icon-row"><div class="skeleton admin-skeleton-status"></div><div class="skeleton admin-skeleton-icon"></div><div class="skeleton admin-skeleton-icon"></div><div class="skeleton admin-skeleton-icon"></div></div>
              </div>
              <div class="admin-skeleton-list-card">
                <div class="admin-skeleton-list-main">
                  <div><div class="skeleton admin-skeleton-list-block"></div><div class="skeleton admin-skeleton-list-block--small mt-2"></div></div>
                  <div><div class="skeleton admin-skeleton-list-block"></div><div class="skeleton admin-skeleton-list-block--small mt-2"></div></div>
                  <div><div class="skeleton admin-skeleton-list-block--small"></div><div class="skeleton admin-skeleton-list-block--small mt-2"></div></div>
                </div>
                <div class="admin-skeleton-icon-row"><div class="skeleton admin-skeleton-status"></div><div class="skeleton admin-skeleton-icon"></div><div class="skeleton admin-skeleton-icon"></div><div class="skeleton admin-skeleton-icon"></div></div>
              </div>
            </div>
          </div>
          <div class="admin-page-skeleton__footer">
            <div class="skeleton admin-page-skeleton__footer-line"></div>
            <div class="skeleton admin-page-skeleton__footer-line admin-page-skeleton__footer-line--short"></div>
          </div>
        </div>
      </div>
    </div>
  `,

  /**
   * Admin Application Evaluation Skeleton - With tabs and table
   */
  adminApplicationEvaluationSkeleton: () => `
    <div id="page-skeleton" class="admin-page-skeleton">
      <div class="admin-page-skeleton__header">
        <div class="admin-page-skeleton__header-group">
          <div class="skeleton admin-page-skeleton__hamburger"></div>
        </div>
        <div class="admin-page-skeleton__header-group">
          <div class="skeleton admin-page-skeleton__header-user"></div>
          <div class="skeleton admin-page-skeleton__header-avatar"></div>
        </div>
      </div>
      <div class="admin-page-skeleton__body">
        <aside class="admin-page-skeleton__sidebar">
          <div class="admin-page-skeleton__brand">
            <div class="skeleton admin-page-skeleton__brand-logo"></div>
            <div class="skeleton admin-page-skeleton__brand-text"></div>
          </div>
          <div class="admin-page-skeleton__section">
            <div class="skeleton admin-page-skeleton__section-title"></div>
            <div class="skeleton admin-page-skeleton__nav-item"></div>
            <div class="skeleton admin-page-skeleton__nav-item"></div>
            <div class="skeleton admin-page-skeleton__nav-item is-active"></div>
          </div>
          <div class="admin-page-skeleton__section">
            <div class="skeleton admin-page-skeleton__section-title"></div>
            <div class="skeleton admin-page-skeleton__nav-item"></div>
            <div class="skeleton admin-page-skeleton__nav-item"></div>
            <div class="skeleton admin-page-skeleton__nav-item"></div>
          </div>
        </aside>
        <div class="admin-page-skeleton__main">
          <div class="admin-page-skeleton__page-header">
            <div class="skeleton admin-page-skeleton__page-title"></div>
            <div class="admin-page-skeleton__breadcrumbs">
              <div class="skeleton admin-page-skeleton__crumb"></div>
              <div class="skeleton admin-page-skeleton__crumb admin-page-skeleton__crumb--small"></div>
            </div>
          </div>
          <div class="admin-page-skeleton__content">
            <div class="row top-cards g-3 mb-4 px-4 py-3 pt-0">
              <div class="col-sm-6 col-md-3"><div class="skeleton-dashboard-card"><div class="d-flex justify-content-between align-items-start mb-4"><div class="skeleton skeleton-label"></div><div class="skeleton skeleton-stat-icon"></div></div><div class="skeleton skeleton-stat-value mb-3"></div><div class="skeleton skeleton-stat-meta"></div></div></div>
              <div class="col-sm-6 col-md-3"><div class="skeleton-dashboard-card"><div class="d-flex justify-content-between align-items-start mb-4"><div class="skeleton skeleton-label"></div><div class="skeleton skeleton-stat-icon"></div></div><div class="skeleton skeleton-stat-value mb-3"></div><div class="skeleton skeleton-stat-meta"></div></div></div>
              <div class="col-sm-6 col-md-3"><div class="skeleton-dashboard-card"><div class="d-flex justify-content-between align-items-start mb-4"><div class="skeleton skeleton-label"></div><div class="skeleton skeleton-stat-icon"></div></div><div class="skeleton skeleton-stat-value mb-3"></div><div class="skeleton skeleton-stat-meta"></div></div></div>
              <div class="col-sm-6 col-md-3"><div class="skeleton-dashboard-card"><div class="d-flex justify-content-between align-items-start mb-4"><div class="skeleton skeleton-label"></div><div class="skeleton skeleton-stat-icon"></div></div><div class="skeleton skeleton-stat-value mb-3"></div><div class="skeleton skeleton-stat-meta"></div></div></div>
            </div>
            <div class="admin-skeleton-tabs">
              <div class="skeleton admin-skeleton-tab"></div>
              <div class="skeleton admin-skeleton-tab"></div>
              <div class="skeleton admin-skeleton-tab"></div>
              <div class="skeleton admin-skeleton-tab"></div>
            </div>
            <div class="admin-skeleton-panel">
              <div class="admin-skeleton-toolbar">
                <div>
                  <div class="skeleton admin-skeleton-panel-title"></div>
                  <div class="skeleton admin-skeleton-panel-subtitle"></div>
                </div>
                <div class="admin-skeleton-toolbar-right">
                  <div class="skeleton admin-skeleton-search"></div>
                  <div class="skeleton admin-skeleton-button"></div>
                </div>
              </div>
              <div class="admin-skeleton-table">
                <div class="skeleton admin-skeleton-table-head"></div>
                <div class="skeleton admin-skeleton-table-row"></div>
                <div class="skeleton admin-skeleton-table-row"></div>
                <div class="skeleton admin-skeleton-table-row"></div>
                <div class="skeleton admin-skeleton-table-row"></div>
              </div>
            </div>
          </div>
          <div class="admin-page-skeleton__footer">
            <div class="skeleton admin-page-skeleton__footer-line"></div>
            <div class="skeleton admin-page-skeleton__footer-line admin-page-skeleton__footer-line--short"></div>
          </div>
        </div>
      </div>
    </div>
  `,

  /**
   * Admin Notification Page Skeleton - With form and table
   */
  adminNotificationSkeleton: () => `
    <div id="page-skeleton" class="admin-page-skeleton">
      <div class="admin-page-skeleton__header">
        <div class="admin-page-skeleton__header-group">
          <div class="skeleton admin-page-skeleton__hamburger"></div>
        </div>
        <div class="admin-page-skeleton__header-group">
          <div class="skeleton admin-page-skeleton__header-user"></div>
          <div class="skeleton admin-page-skeleton__header-avatar"></div>
        </div>
      </div>
      <div class="admin-page-skeleton__body">
        <aside class="admin-page-skeleton__sidebar">
          <div class="admin-page-skeleton__brand">
            <div class="skeleton admin-page-skeleton__brand-logo"></div>
            <div class="skeleton admin-page-skeleton__brand-text"></div>
          </div>
          <div class="admin-page-skeleton__section">
            <div class="skeleton admin-page-skeleton__section-title"></div>
            <div class="skeleton admin-page-skeleton__nav-item"></div>
            <div class="skeleton admin-page-skeleton__nav-item"></div>
            <div class="skeleton admin-page-skeleton__nav-item"></div>
          </div>
          <div class="admin-page-skeleton__section">
            <div class="skeleton admin-page-skeleton__section-title"></div>
            <div class="skeleton admin-page-skeleton__nav-item"></div>
            <div class="skeleton admin-page-skeleton__nav-item is-active"></div>
            <div class="skeleton admin-page-skeleton__nav-item"></div>
          </div>
        </aside>
        <div class="admin-page-skeleton__main">
          <div class="admin-page-skeleton__page-header">
            <div class="skeleton admin-page-skeleton__page-title"></div>
            <div class="admin-page-skeleton__breadcrumbs">
              <div class="skeleton admin-page-skeleton__crumb"></div>
              <div class="skeleton admin-page-skeleton__crumb admin-page-skeleton__crumb--small"></div>
            </div>
          </div>
          <div class="admin-page-skeleton__content">
            <div class="row top-cards g-3 mb-4 px-4 py-3 pt-0">
              <div class="col-sm-6 col-md-3"><div class="skeleton-dashboard-card"><div class="d-flex justify-content-between align-items-start mb-4"><div class="skeleton skeleton-label"></div><div class="skeleton skeleton-stat-icon"></div></div><div class="skeleton skeleton-stat-value mb-3"></div><div class="skeleton skeleton-stat-meta"></div></div></div>
              <div class="col-sm-6 col-md-3"><div class="skeleton-dashboard-card"><div class="d-flex justify-content-between align-items-start mb-4"><div class="skeleton skeleton-label"></div><div class="skeleton skeleton-stat-icon"></div></div><div class="skeleton skeleton-stat-value mb-3"></div><div class="skeleton skeleton-stat-meta"></div></div></div>
              <div class="col-sm-6 col-md-3"><div class="skeleton-dashboard-card"><div class="d-flex justify-content-between align-items-start mb-4"><div class="skeleton skeleton-label"></div><div class="skeleton skeleton-stat-icon"></div></div><div class="skeleton skeleton-stat-value mb-3"></div><div class="skeleton skeleton-stat-meta"></div></div></div>
              <div class="col-sm-6 col-md-3"><div class="skeleton-dashboard-card"><div class="d-flex justify-content-between align-items-start mb-4"><div class="skeleton skeleton-label"></div><div class="skeleton skeleton-stat-icon"></div></div><div class="skeleton skeleton-stat-value mb-3"></div><div class="skeleton skeleton-stat-meta"></div></div></div>
            </div>
            <div class="admin-skeleton-tabs">
              <div class="skeleton admin-skeleton-tab"></div>
              <div class="skeleton admin-skeleton-tab"></div>
              <div class="skeleton admin-skeleton-tab"></div>
            </div>
            <div class="admin-skeleton-panel">
              <div class="skeleton admin-skeleton-panel-title"></div>
              <div class="admin-skeleton-form-grid">
                <div style="grid-column: 1 / -1;"><div class="skeleton admin-skeleton-form-label"></div><div class="skeleton admin-skeleton-form-input"></div></div>
                <div><div class="skeleton admin-skeleton-form-label"></div><div class="skeleton admin-skeleton-form-input"></div></div>
                <div><div class="skeleton admin-skeleton-form-label"></div><div class="skeleton admin-skeleton-form-input"></div></div>
                <div style="grid-column: 1 / -1;"><div class="skeleton admin-skeleton-form-label"></div><div class="skeleton admin-skeleton-form-textarea"></div></div>
              </div>
              <div class="admin-skeleton-form-actions">
                <div class="skeleton admin-skeleton-button admin-skeleton-button--wide"></div>
                <div class="skeleton admin-skeleton-button admin-skeleton-button--wide"></div>
              </div>
            </div>
            <div class="admin-skeleton-panel">
              <div class="skeleton admin-skeleton-panel-title"></div>
              <div class="skeleton admin-skeleton-table-head"></div>
              <div class="skeleton admin-skeleton-table-row mt-3"></div>
              <div class="skeleton admin-skeleton-table-row mt-3"></div>
            </div>
          </div>
          <div class="admin-page-skeleton__footer">
            <div class="skeleton admin-page-skeleton__footer-line"></div>
            <div class="skeleton admin-page-skeleton__footer-line admin-page-skeleton__footer-line--short"></div>
          </div>
        </div>
      </div>
    </div>
  `,

  /**
   * Admin Reports & Analytics Skeleton - With charts and progress bars
   */
  adminReportsSkeleton: () => `
    <div id="page-skeleton" class="admin-page-skeleton">
      <div class="admin-page-skeleton__header">
        <div class="admin-page-skeleton__header-group">
          <div class="skeleton admin-page-skeleton__hamburger"></div>
        </div>
        <div class="admin-page-skeleton__header-group">
          <div class="skeleton admin-page-skeleton__header-user"></div>
          <div class="skeleton admin-page-skeleton__header-avatar"></div>
        </div>
      </div>
      <div class="admin-page-skeleton__body">
        <aside class="admin-page-skeleton__sidebar">
          <div class="admin-page-skeleton__brand">
            <div class="skeleton admin-page-skeleton__brand-logo"></div>
            <div class="skeleton admin-page-skeleton__brand-text"></div>
          </div>
          <div class="admin-page-skeleton__section">
            <div class="skeleton admin-page-skeleton__section-title"></div>
            <div class="skeleton admin-page-skeleton__nav-item"></div>
            <div class="skeleton admin-page-skeleton__nav-item"></div>
            <div class="skeleton admin-page-skeleton__nav-item"></div>
          </div>
          <div class="admin-page-skeleton__section">
            <div class="skeleton admin-page-skeleton__section-title"></div>
            <div class="skeleton admin-page-skeleton__nav-item"></div>
            <div class="skeleton admin-page-skeleton__nav-item"></div>
            <div class="skeleton admin-page-skeleton__nav-item is-active"></div>
          </div>
        </aside>
        <div class="admin-page-skeleton__main">
          <div class="admin-page-skeleton__page-header">
            <div class="skeleton admin-page-skeleton__page-title"></div>
            <div class="admin-page-skeleton__breadcrumbs">
              <div class="skeleton admin-page-skeleton__crumb"></div>
              <div class="skeleton admin-page-skeleton__crumb admin-page-skeleton__crumb--small"></div>
            </div>
          </div>
          <div class="admin-page-skeleton__content">
            <div class="row top-cards g-3 mb-4 px-4 py-3 pt-0">
              <div class="col-sm-6 col-md-4"><div class="skeleton-dashboard-card"><div class="d-flex justify-content-between align-items-start mb-4"><div class="skeleton skeleton-label"></div><div class="skeleton skeleton-stat-icon"></div></div><div class="skeleton skeleton-stat-value mb-3"></div><div class="skeleton skeleton-stat-meta"></div></div></div>
              <div class="col-sm-6 col-md-4"><div class="skeleton-dashboard-card"><div class="d-flex justify-content-between align-items-start mb-4"><div class="skeleton skeleton-label"></div><div class="skeleton skeleton-stat-icon"></div></div><div class="skeleton skeleton-stat-value mb-3"></div><div class="skeleton skeleton-stat-meta"></div></div></div>
              <div class="col-sm-6 col-md-4"><div class="skeleton-dashboard-card"><div class="d-flex justify-content-between align-items-start mb-4"><div class="skeleton skeleton-label"></div><div class="skeleton skeleton-stat-icon"></div></div><div class="skeleton skeleton-stat-value mb-3"></div><div class="skeleton skeleton-stat-meta"></div></div></div>
            </div>
            <div class="admin-skeleton-tabs">
              <div class="skeleton admin-skeleton-tab"></div>
              <div class="skeleton admin-skeleton-tab"></div>
              <div class="skeleton admin-skeleton-tab"></div>
              <div class="skeleton admin-skeleton-tab"></div>
            </div>
            <div class="admin-skeleton-chart-grid">
              <div class="admin-skeleton-chart-panel"><div class="skeleton admin-skeleton-panel-title"></div><div class="skeleton admin-skeleton-chart"></div></div>
              <div class="admin-skeleton-chart-panel"><div class="skeleton admin-skeleton-panel-title"></div><div class="skeleton admin-skeleton-chart admin-skeleton-chart--donut"></div></div>
            </div>
            <div class="admin-skeleton-wide-panel">
              <div class="skeleton admin-skeleton-panel-title"></div>
              <div class="skeleton admin-skeleton-progress-line"></div>
              <div class="skeleton admin-skeleton-progress-line"></div>
              <div class="skeleton admin-skeleton-progress-line"></div>
            </div>
          </div>
          <div class="admin-page-skeleton__footer">
            <div class="skeleton admin-page-skeleton__footer-line"></div>
            <div class="skeleton admin-page-skeleton__footer-line admin-page-skeleton__footer-line--short"></div>
          </div>
        </div>
      </div>
    </div>
  `,

  // =========================================================================
  // USER PAGES
  // =========================================================================

  /**
   * User Profile Page Skeleton - With profile card and forms
   */
  userProfileSkeleton: () => `
    <div id="skeleton-screen" class="skeleton-screen">
      <div class="container-fluid p-0 d-flex h-100">
        <!-- Skeleton Sidebar -->
        <div class="skeleton-sidebar-wrapper d-none d-md-flex flex-column align-items-center flex-shrink-0 p-3">
          <div class="skeleton skeleton-logo mb-3"></div>
          <div class="skeleton skeleton-nav-item mb-2"></div>
          <div class="skeleton skeleton-nav-item mb-2"></div>
          <div class="skeleton skeleton-nav-item mb-2"></div>
          <div class="skeleton skeleton-nav-item mb-2"></div>
        </div>

        <!-- Skeleton Main Content -->
        <div class="skeleton-main flex-fill">
          <!-- Skeleton Mobile Header -->
          <div class="skeleton-header d-md-none p-3">
            <div class="d-flex align-items-center justify-content-between">
              <div class="d-flex align-items-center">
                <div class="skeleton skeleton-icon me-2"></div>
                <div class="skeleton skeleton-title ms-2"></div>
              </div>
              <div class="skeleton skeleton-icon"></div>
            </div>
          </div>

          <!-- Skeleton Desktop Header -->
          <div class="skeleton-header d-none d-md-block p-3">
            <div class="d-flex align-items-center justify-content-between">
              <div class="skeleton skeleton-title"></div>
              <div class="d-flex gap-3">
                <div class="skeleton skeleton-icon"></div>
                <div class="skeleton skeleton-icon"></div>
              </div>
            </div>
          </div>

          <!-- Skeleton Profile Section -->
          <div class="skeleton-office-section">
            <div class="container">
              <div class="row g-4">
                <div class="col-lg-4">
                  <div class="skeleton skeleton-profile-card"></div>
                </div>
                <div class="col-lg-8">
                  <div class="skeleton skeleton-office-card mb-3"></div>
                  <div class="skeleton skeleton-office-card mb-3"></div>
                  <div class="skeleton skeleton-office-card mb-0"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Skeleton Footer -->
          <div class="skeleton-footer py-4">
            <div class="container">
              <div class="row mb-4 pb-4">
                <div class="col-md-3 mb-3 mb-md-0">
                  <div class="skeleton skeleton-text mb-3"></div>
                  <div class="skeleton skeleton-link mb-2"></div>
                  <div class="skeleton skeleton-link mb-2"></div>
                  <div class="skeleton skeleton-link mb-0"></div>
                </div>
                <div class="col-md-3 mb-3 mb-md-0">
                  <div class="skeleton skeleton-text mb-3"></div>
                  <div class="skeleton skeleton-link mb-2"></div>
                  <div class="skeleton skeleton-link mb-2"></div>
                  <div class="skeleton skeleton-link mb-0"></div>
                </div>
                <div class="col-md-3 mb-3 mb-md-0">
                  <div class="skeleton skeleton-text mb-3"></div>
                  <div class="skeleton skeleton-link mb-2"></div>
                  <div class="skeleton skeleton-link mb-2"></div>
                  <div class="skeleton skeleton-link mb-0"></div>
                </div>
                <div class="col-md-3">
                  <div class="skeleton skeleton-text mb-3"></div>
                  <div class="skeleton skeleton-link mb-2"></div>
                  <div class="skeleton skeleton-link mb-0"></div>
                </div>
              </div>
              <div class="text-center">
                <div class="skeleton skeleton-text mb-1"></div>
                <div class="skeleton skeleton-text-small mb-1"></div>
                <div class="skeleton skeleton-text-small mb-0"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,

  /**
   * User About Us Page Skeleton - With hero, mission/vision, and values sections
   */
  userAboutUsSkeleton: () => `
    <div id="skeleton-screen" class="skeleton-screen">
      <div class="container-fluid p-0 d-flex h-100">
        <!-- Skeleton Sidebar -->
        <div class="skeleton-sidebar-wrapper d-none d-md-flex flex-column align-items-center flex-shrink-0 p-3">
          <div class="skeleton skeleton-logo mb-3"></div>
          <div class="skeleton skeleton-nav-item mb-2"></div>
          <div class="skeleton skeleton-nav-item mb-2"></div>
          <div class="skeleton skeleton-nav-item mb-2"></div>
          <div class="skeleton skeleton-nav-item mb-2"></div>
        </div>

        <!-- Skeleton Main Content -->
        <div class="skeleton-main flex-fill">
          <!-- Skeleton Mobile Header -->
          <div class="skeleton-header d-md-none p-3">
            <div class="d-flex align-items-center justify-content-between">
              <div class="d-flex align-items-center">
                <div class="skeleton skeleton-icon me-2"></div>
                <div class="skeleton skeleton-title ms-2"></div>
              </div>
              <div class="skeleton skeleton-icon"></div>
            </div>
          </div>

          <!-- Skeleton Desktop Header -->
          <div class="skeleton-header d-none d-md-block p-3">
            <div class="d-flex align-items-center justify-content-between">
              <div class="skeleton skeleton-title"></div>
              <div class="d-flex gap-3">
                <div class="skeleton skeleton-icon"></div>
                <div class="skeleton skeleton-icon"></div>
              </div>
            </div>
          </div>

          <!-- Skeleton Hero Section -->
          <div class="skeleton-hero-section">
            <div class="container">
              <div class="row align-items-center">
                <div class="col-lg-7">
                  <div class="skeleton skeleton-text-small mb-2"></div>
                  <div class="skeleton skeleton-text-large mb-3"></div>
                  <div class="skeleton skeleton-text-lead mb-4"></div>
                  <div class="d-flex flex-column flex-sm-row gap-3">
                    <div class="skeleton skeleton-button"></div>
                  </div>
                </div>
                <div class="col-lg-5 d-none d-lg-block">
                  <div class="skeleton skeleton-image"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Skeleton History Section -->
          <div class="skeleton-office-section">
            <div class="container">
              <div class="text-center mb-5">
                <div class="skeleton skeleton-text-large mb-2"></div>
                <div class="skeleton skeleton-text mb-0"></div>
              </div>
              <div class="row g-4">
                <div class="col-12 col-md-6 col-lg-7">
                  <div class="skeleton skeleton-office-card" style="height: 200px;"></div>
                </div>
                <div class="col-12 col-md-6 col-lg-5">
                  <div class="skeleton skeleton-office-card" style="height: 200px;"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Skeleton Mission/Vision Section -->
          <div class="skeleton-office-section">
            <div class="container">
              <div class="text-center mb-5">
                <div class="skeleton skeleton-text-large mb-2"></div>
                <div class="skeleton skeleton-text mb-0"></div>
              </div>
              <div class="row g-4">
                <div class="col-12 col-md-6">
                  <div class="skeleton skeleton-office-card" style="height: 200px;"></div>
                </div>
                <div class="col-12 col-md-6">
                  <div class="skeleton skeleton-office-card" style="height: 200px;"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Skeleton Core Values Section -->
          <div class="skeleton-contact-section">
            <div class="container">
              <div class="text-center mb-5">
                <div class="skeleton skeleton-text-large mb-2"></div>
                <div class="skeleton skeleton-text mb-0"></div>
              </div>
              <div class="row g-4">
                <div class="col-12 col-md-6 col-lg-3">
                  <div class="skeleton skeleton-contact-tile"></div>
                </div>
                <div class="col-12 col-md-6 col-lg-3">
                  <div class="skeleton skeleton-contact-tile"></div>
                </div>
                <div class="col-12 col-md-6 col-lg-3">
                  <div class="skeleton skeleton-contact-tile"></div>
                </div>
                <div class="col-12 col-md-6 col-lg-3">
                  <div class="skeleton skeleton-contact-tile"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Skeleton Footer -->
          <div class="skeleton-footer py-4">
            <div class="container">
              <div class="row mb-4 pb-4">
                <div class="col-md-3 mb-3 mb-md-0">
                  <div class="skeleton skeleton-text mb-3"></div>
                  <div class="skeleton skeleton-link mb-2"></div>
                  <div class="skeleton skeleton-link mb-2"></div>
                  <div class="skeleton skeleton-link mb-0"></div>
                </div>
                <div class="col-md-3 mb-3 mb-md-0">
                  <div class="skeleton skeleton-text mb-3"></div>
                  <div class="skeleton skeleton-link mb-2"></div>
                  <div class="skeleton skeleton-link mb-2"></div>
                  <div class="skeleton skeleton-link mb-0"></div>
                </div>
                <div class="col-md-3 mb-3 mb-md-0">
                  <div class="skeleton skeleton-text mb-3"></div>
                  <div class="skeleton skeleton-link mb-2"></div>
                  <div class="skeleton skeleton-link mb-2"></div>
                  <div class="skeleton skeleton-link mb-0"></div>
                </div>
                <div class="col-md-3">
                  <div class="skeleton skeleton-text mb-3"></div>
                  <div class="skeleton skeleton-link mb-2"></div>
                  <div class="skeleton skeleton-link mb-0"></div>
                </div>
              </div>
              <div class="text-center">
                <div class="skeleton skeleton-text mb-1"></div>
                <div class="skeleton skeleton-text-small mb-1"></div>
                <div class="skeleton skeleton-text-small mb-0"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,

  /**
   * User Courses Page Skeleton - With grid of course cards
   */
  userCoursesSkeleton: () => `
    <div id="skeleton-screen" class="skeleton-screen">
      <div class="container-fluid p-0 d-flex h-100">
        <!-- Skeleton Sidebar -->
        <div class="skeleton-sidebar-wrapper d-none d-md-flex flex-column align-items-center flex-shrink-0 p-3">
          <div class="skeleton skeleton-logo mb-3"></div>
          <div class="skeleton skeleton-nav-item mb-2"></div>
          <div class="skeleton skeleton-nav-item mb-2"></div>
          <div class="skeleton skeleton-nav-item mb-2"></div>
          <div class="skeleton skeleton-nav-item mb-2"></div>
        </div>

        <!-- Skeleton Main Content -->
        <div class="skeleton-main flex-fill">
          <!-- Skeleton Mobile Header -->
          <div class="skeleton-header d-md-none p-3">
            <div class="d-flex align-items-center justify-content-between">
              <div class="d-flex align-items-center">
                <div class="skeleton skeleton-icon me-2"></div>
                <div class="skeleton skeleton-title ms-2"></div>
              </div>
              <div class="skeleton skeleton-icon"></div>
            </div>
          </div>

          <!-- Skeleton Desktop Header -->
          <div class="skeleton-header d-none d-md-block p-3">
            <div class="d-flex align-items-center justify-content-between">
              <div class="skeleton skeleton-title"></div>
              <div class="d-flex gap-3">
                <div class="skeleton skeleton-icon"></div>
                <div class="skeleton skeleton-icon"></div>
              </div>
            </div>
          </div>

          <!-- Skeleton Courses Section -->
          <div class="skeleton-office-section">
            <div class="container">
              <div class="text-center mb-5">
                <div class="skeleton skeleton-text-large mb-2"></div>
                <div class="skeleton skeleton-text mb-0"></div>
              </div>
              <div class="row g-4">
                <div class="col-12 col-md-6 col-lg-3">
                  <div class="skeleton skeleton-office-card"></div>
                </div>
                <div class="col-12 col-md-6 col-lg-3">
                  <div class="skeleton skeleton-office-card"></div>
                </div>
                <div class="col-12 col-md-6 col-lg-3">
                  <div class="skeleton skeleton-office-card"></div>
                </div>
                <div class="col-12 col-md-6 col-lg-3">
                  <div class="skeleton skeleton-office-card"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Skeleton Footer -->
          <div class="skeleton-footer py-4">
            <div class="container">
              <div class="row mb-4 pb-4">
                <div class="col-md-3 mb-3 mb-md-0">
                  <div class="skeleton skeleton-text mb-3"></div>
                  <div class="skeleton skeleton-link mb-2"></div>
                  <div class="skeleton skeleton-link mb-2"></div>
                  <div class="skeleton skeleton-link mb-0"></div>
                </div>
                <div class="col-md-3 mb-3 mb-md-0">
                  <div class="skeleton skeleton-text mb-3"></div>
                  <div class="skeleton skeleton-link mb-2"></div>
                  <div class="skeleton skeleton-link mb-2"></div>
                  <div class="skeleton skeleton-link mb-0"></div>
                </div>
                <div class="col-md-3 mb-3 mb-md-0">
                  <div class="skeleton skeleton-text mb-3"></div>
                  <div class="skeleton skeleton-link mb-2"></div>
                  <div class="skeleton skeleton-link mb-2"></div>
                  <div class="skeleton skeleton-link mb-0"></div>
                </div>
                <div class="col-md-3">
                  <div class="skeleton skeleton-text mb-3"></div>
                  <div class="skeleton skeleton-link mb-2"></div>
                  <div class="skeleton skeleton-link mb-0"></div>
                </div>
              </div>
              <div class="text-center">
                <div class="skeleton skeleton-text mb-1"></div>
                <div class="skeleton skeleton-text-small mb-1"></div>
                <div class="skeleton skeleton-text-small mb-0"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,

  /**
   * User Enrollment Page Skeleton - With form section
   */
  userEnrollmentSkeleton: () => `
    <div id="skeleton-screen" class="skeleton-screen">
      <div class="container-fluid p-0 d-flex h-100">
        <!-- Skeleton Sidebar -->
        <div class="skeleton-sidebar-wrapper d-none d-md-flex flex-column align-items-center flex-shrink-0 p-3">
          <div class="skeleton skeleton-logo mb-3"></div>
          <div class="skeleton skeleton-nav-item mb-2"></div>
          <div class="skeleton skeleton-nav-item mb-2"></div>
          <div class="skeleton skeleton-nav-item mb-2"></div>
          <div class="skeleton skeleton-nav-item mb-2"></div>
        </div>

        <!-- Skeleton Main Content -->
        <div class="skeleton-main flex-fill">
          <!-- Skeleton Mobile Header -->
          <div class="skeleton-header d-md-none p-3">
            <div class="d-flex align-items-center justify-content-between">
              <div class="d-flex align-items-center">
                <div class="skeleton skeleton-icon me-2"></div>
                <div class="skeleton skeleton-title ms-2"></div>
              </div>
              <div class="skeleton skeleton-icon"></div>
            </div>
          </div>

          <!-- Skeleton Desktop Header -->
          <div class="skeleton-header d-none d-md-block p-3">
            <div class="d-flex align-items-center justify-content-between">
              <div class="skeleton skeleton-title"></div>
              <div class="d-flex gap-3">
                <div class="skeleton skeleton-icon"></div>
                <div class="skeleton skeleton-icon"></div>
              </div>
            </div>
          </div>

          <!-- Skeleton Form Section -->
          <div class="skeleton-office-section">
            <div class="container">
              <div class="text-center mb-5">
                <div class="skeleton skeleton-text-large mb-2"></div>
                <div class="skeleton skeleton-text mb-0"></div>
              </div>
              <div class="row">
                <div class="col-lg-8 mx-auto">
                  <div class="mb-4">
                    <div class="skeleton skeleton-text mb-2"></div>
                    <div class="skeleton skeleton-input"></div>
                  </div>
                  <div class="mb-4">
                    <div class="skeleton skeleton-text mb-2"></div>
                    <div class="skeleton skeleton-input"></div>
                  </div>
                  <div class="mb-4">
                    <div class="skeleton skeleton-text mb-2"></div>
                    <div class="skeleton skeleton-input"></div>
                  </div>
                  <div class="mb-4">
                    <div class="skeleton skeleton-text mb-2"></div>
                    <div class="skeleton skeleton-input"></div>
                  </div>
                  <div class="text-center">
                    <div class="skeleton skeleton-button"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Skeleton Footer -->
          <div class="skeleton-footer py-4">
            <div class="container">
              <div class="row mb-4 pb-4">
                <div class="col-md-3 mb-3 mb-md-0">
                  <div class="skeleton skeleton-text mb-3"></div>
                  <div class="skeleton skeleton-link mb-2"></div>
                  <div class="skeleton skeleton-link mb-2"></div>
                  <div class="skeleton skeleton-link mb-0"></div>
                </div>
                <div class="col-md-3 mb-3 mb-md-0">
                  <div class="skeleton skeleton-text mb-3"></div>
                  <div class="skeleton skeleton-link mb-2"></div>
                  <div class="skeleton skeleton-link mb-2"></div>
                  <div class="skeleton skeleton-link mb-0"></div>
                </div>
                <div class="col-md-3 mb-3 mb-md-0">
                  <div class="skeleton skeleton-text mb-3"></div>
                  <div class="skeleton skeleton-link mb-2"></div>
                  <div class="skeleton skeleton-link mb-2"></div>
                  <div class="skeleton skeleton-link mb-0"></div>
                </div>
                <div class="col-md-3">
                  <div class="skeleton skeleton-text mb-3"></div>
                  <div class="skeleton skeleton-link mb-2"></div>
                  <div class="skeleton skeleton-link mb-0"></div>
                </div>
              </div>
              <div class="text-center">
                <div class="skeleton skeleton-text mb-1"></div>
                <div class="skeleton skeleton-text-small mb-1"></div>
                <div class="skeleton skeleton-text-small mb-0"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,

  /**
   * User Notifications Page Skeleton - With notification items
   */
  userNotificationsSkeleton: () => `
    <div id="skeleton-screen" class="skeleton-screen">
      <div class="container-fluid p-0 d-flex h-100">
        <!-- Skeleton Sidebar -->
        <div class="skeleton-sidebar-wrapper d-none d-md-flex flex-column align-items-center flex-shrink-0 p-3">
          <div class="skeleton skeleton-logo mb-3"></div>
          <div class="skeleton skeleton-nav-item mb-2"></div>
          <div class="skeleton skeleton-nav-item mb-2"></div>
          <div class="skeleton skeleton-nav-item mb-2"></div>
          <div class="skeleton skeleton-nav-item mb-2"></div>
        </div>

        <!-- Skeleton Main Content -->
        <div class="skeleton-main flex-fill">
          <!-- Skeleton Mobile Header -->
          <div class="skeleton-header d-md-none p-3">
            <div class="d-flex align-items-center justify-content-between">
              <div class="d-flex align-items-center">
                <div class="skeleton skeleton-icon me-2"></div>
                <div class="skeleton skeleton-title ms-2"></div>
              </div>
              <div class="skeleton skeleton-icon"></div>
            </div>
          </div>

          <!-- Skeleton Desktop Header -->
          <div class="skeleton-header d-none d-md-block p-3">
            <div class="d-flex align-items-center justify-content-between">
              <div class="skeleton skeleton-title"></div>
              <div class="d-flex gap-3">
                <div class="skeleton skeleton-icon"></div>
                <div class="skeleton skeleton-icon"></div>
              </div>
            </div>
          </div>

          <!-- Skeleton Notifications Section -->
          <div class="skeleton-office-section">
            <div class="container">
              <div class="text-center mb-5">
                <div class="skeleton skeleton-text-large mb-2"></div>
                <div class="skeleton skeleton-text mb-0"></div>
              </div>
              <div class="row g-3">
                <div class="col-12">
                  <div class="skeleton skeleton-notification-item mb-3"></div>
                  <div class="skeleton skeleton-notification-item mb-3"></div>
                  <div class="skeleton skeleton-notification-item mb-3"></div>
                  <div class="skeleton skeleton-notification-item mb-0"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Skeleton Footer -->
          <div class="skeleton-footer py-4">
            <div class="container">
              <div class="row mb-4 pb-4">
                <div class="col-md-3 mb-3 mb-md-0">
                  <div class="skeleton skeleton-text mb-3"></div>
                  <div class="skeleton skeleton-link mb-2"></div>
                  <div class="skeleton skeleton-link mb-2"></div>
                  <div class="skeleton skeleton-link mb-0"></div>
                </div>
                <div class="col-md-3 mb-3 mb-md-0">
                  <div class="skeleton skeleton-text mb-3"></div>
                  <div class="skeleton skeleton-link mb-2"></div>
                  <div class="skeleton skeleton-link mb-2"></div>
                  <div class="skeleton skeleton-link mb-0"></div>
                </div>
                <div class="col-md-3 mb-3 mb-md-0">
                  <div class="skeleton skeleton-text mb-3"></div>
                  <div class="skeleton skeleton-link mb-2"></div>
                  <div class="skeleton skeleton-link mb-2"></div>
                  <div class="skeleton skeleton-link mb-0"></div>
                </div>
                <div class="col-md-3">
                  <div class="skeleton skeleton-text mb-3"></div>
                  <div class="skeleton skeleton-link mb-2"></div>
                  <div class="skeleton skeleton-link mb-0"></div>
                </div>
              </div>
              <div class="text-center">
                <div class="skeleton skeleton-text mb-1"></div>
                <div class="skeleton skeleton-text-small mb-1"></div>
                <div class="skeleton skeleton-text-small mb-0"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,

  // =========================================================================
  // SUPERADMIN PAGES
  // =========================================================================

  /**
   * Superadmin Dashboard Skeleton - With stats cards and table
   */
  superadminDashboardSkeleton: () => `
    <div id="page-skeleton" class="admin-page-skeleton">
      <div class="admin-page-skeleton__header">
        <div class="admin-page-skeleton__header-group">
          <div class="skeleton admin-page-skeleton__hamburger"></div>
        </div>
        <div class="admin-page-skeleton__header-group">
          <div class="skeleton admin-page-skeleton__header-user"></div>
          <div class="skeleton admin-page-skeleton__header-avatar"></div>
        </div>
      </div>
      <div class="admin-page-skeleton__body">
        <aside class="admin-page-skeleton__sidebar">
          <div class="admin-page-skeleton__brand">
            <div class="skeleton admin-page-skeleton__brand-logo"></div>
            <div class="skeleton admin-page-skeleton__brand-text"></div>
          </div>
          <div class="admin-page-skeleton__section">
            <div class="skeleton admin-page-skeleton__section-title"></div>
            <div class="skeleton admin-page-skeleton__nav-item"></div>
            <div class="skeleton admin-page-skeleton__nav-item"></div>
            <div class="skeleton admin-page-skeleton__nav-item"></div>
            <div class="skeleton admin-page-skeleton__nav-item"></div>
          </div>
          <div class="admin-page-skeleton__section">
            <div class="skeleton admin-page-skeleton__section-title"></div>
            <div class="skeleton admin-page-skeleton__nav-item"></div>
            <div class="skeleton admin-page-skeleton__nav-item"></div>
            <div class="skeleton admin-page-skeleton__nav-item"></div>
          </div>
          <div class="admin-page-skeleton__section">
            <div class="skeleton admin-page-skeleton__section-title"></div>
            <div class="skeleton admin-page-skeleton__nav-item is-active"></div>
          </div>
        </aside>
        <div class="admin-page-skeleton__main">
          <div class="admin-page-skeleton__page-header">
            <div class="skeleton admin-page-skeleton__page-title"></div>
            <div class="admin-page-skeleton__breadcrumbs">
              <div class="skeleton admin-page-skeleton__crumb"></div>
              <div class="skeleton admin-page-skeleton__crumb admin-page-skeleton__crumb--small"></div>
            </div>
          </div>
          <div class="admin-page-skeleton__content">
            <div class="row g-3 mb-4 px-4 py-3 pt-0">
              <div class="col-sm-6 col-xl-4">
                <div class="skeleton-dashboard-card">
                  <div class="d-flex justify-content-between align-items-start mb-4">
                    <div class="skeleton skeleton-label"></div>
                    <div class="skeleton skeleton-stat-icon"></div>
                  </div>
                  <div class="skeleton skeleton-stat-value mb-3"></div>
                </div>
              </div>
              <div class="col-sm-6 col-xl-4">
                <div class="skeleton-dashboard-card">
                  <div class="d-flex justify-content-between align-items-start mb-4">
                    <div class="skeleton skeleton-label"></div>
                    <div class="skeleton skeleton-stat-icon"></div>
                  </div>
                  <div class="skeleton skeleton-stat-value mb-3"></div>
                </div>
              </div>
              <div class="col-sm-6 col-xl-4">
                <div class="skeleton-dashboard-card">
                  <div class="d-flex justify-content-between align-items-start mb-4">
                    <div class="skeleton skeleton-label"></div>
                    <div class="skeleton skeleton-stat-icon"></div>
                  </div>
                  <div class="skeleton skeleton-stat-value mb-3"></div>
                </div>
              </div>
            </div>
            <div class="px-4">
              <div class="admin-skeleton-panel">
                <div class="skeleton admin-skeleton-panel-title"></div>
                <div class="skeleton admin-skeleton-panel-subtitle"></div>
                <div class="admin-skeleton-table">
                  <div class="skeleton admin-skeleton-table-head"></div>
                  <div class="skeleton admin-skeleton-table-row"></div>
                  <div class="skeleton admin-skeleton-table-row"></div>
                  <div class="skeleton admin-skeleton-table-row"></div>
                </div>
              </div>
            </div>
          </div>
          <div class="admin-page-skeleton__footer">
            <div class="skeleton admin-page-skeleton__footer-line"></div>
            <div class="skeleton admin-page-skeleton__footer-line admin-page-skeleton__footer-line--short"></div>
          </div>
        </div>
      </div>
    </div>
  `
};

/**
 * Helper function to inject a skeleton into the DOM
 * @param {string} skeletonKey - The key of the skeleton template to use
 * @param {string|HTMLElement} targetSelector - CSS selector or DOM element to inject into
 */
export function injectSkeleton(skeletonKey, targetSelector) {
  if (!skeletons[skeletonKey]) {
    console.error(`Skeleton template "${skeletonKey}" not found`);
    return;
  }

  const targetElement = typeof targetSelector === 'string' 
    ? document.querySelector(targetSelector)
    : targetSelector;

  if (!targetElement) {
    console.error(`Target element "${targetSelector}" not found in DOM`);
    return;
  }

  targetElement.innerHTML = skeletons[skeletonKey]();
}

/**
 * Helper function to hide a skeleton (typically after content loads)
 * @param {string|HTMLElement} skeletonSelector - CSS selector or DOM element of the skeleton
 * @param {number} delay - Optional delay in milliseconds before hiding
 */
export function hideSkeleton(skeletonSelector, delay = 0) {
  const element = typeof skeletonSelector === 'string'
    ? document.querySelector(skeletonSelector)
    : skeletonSelector;

  if (!element) {
    console.error(`Skeleton element "${skeletonSelector}" not found in DOM`);
    return;
  }

  const hideElement = () => {
    element.style.display = 'none';
  };

  if (delay > 0) {
    setTimeout(hideElement, delay);
  } else {
    hideElement();
  }
}

/**
 * Helper function to show a skeleton
 * @param {string|HTMLElement} skeletonSelector - CSS selector or DOM element of the skeleton
 */
export function showSkeleton(skeletonSelector) {
  const element = typeof skeletonSelector === 'string'
    ? document.querySelector(skeletonSelector)
    : skeletonSelector;

  if (!element) {
    console.error(`Skeleton element "${skeletonSelector}" not found in DOM`);
    return;
  }

  element.style.display = '';
}
