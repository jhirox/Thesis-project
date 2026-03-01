function filterTable() {
  const searchInput = document.getElementById('searchInput').value.toLowerCase();
  const courseFilter = document.getElementById('courseFilter').value;
  const studentTypeFilter = document.getElementById('studentTypeFilter').value;
  const statusFilter = document.getElementById('statusFilter').value;
  const loginFromDate = document.getElementById('loginFromDate').value;
  const loginToDate = document.getElementById('loginToDate').value;
  const tables = document.querySelectorAll('#overview table tbody');
  
  tables.forEach(table => {
    const rows = table.getElementsByTagName('tr');

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const nameCell = row.querySelector('td:nth-child(1)');
      const courseCell = row.querySelector('td:nth-child(2)');
      const studentTypeCell = row.querySelector('td:nth-child(3)');
      const lastLoginCell = row.querySelector('td:nth-child(4)');
      const statusCell = row.querySelector('td:nth-child(5)');

      if (!nameCell || !courseCell || !studentTypeCell || !lastLoginCell || !statusCell) continue;

      const name = nameCell.textContent.toLowerCase();
      const course = courseCell.textContent.trim();
      const studentType = studentTypeCell.textContent.trim();
      const lastLogin = lastLoginCell.textContent.trim();
      const status = statusCell.textContent.trim();

      let matchesSearch = name.includes(searchInput);
      let matchesCourse = courseFilter === '' || course === courseFilter;
      let matchesStudentType = studentTypeFilter === '' || studentType === studentTypeFilter;
      let matchesStatus = statusFilter === '' || status === statusFilter;

      // Check date range
      let matchesDateRange = true;
      if (loginFromDate || loginToDate) {
        const lastLoginDate = new Date(lastLogin);
        if (loginFromDate) {
          const fromDate = new Date(loginFromDate);
          matchesDateRange = matchesDateRange && lastLoginDate >= fromDate;
        }
        if (loginToDate) {
          const toDate = new Date(loginToDate);
          matchesDateRange = matchesDateRange && lastLoginDate <= toDate;
        }
      }

      row.style.display = matchesSearch && matchesCourse && matchesStudentType && matchesStatus && matchesDateRange ? '' : 'none';
    }
  });
}

function resetFilters() {
  document.getElementById('searchInput').value = '';
  document.getElementById('courseFilter').value = '';
  document.getElementById('studentTypeFilter').value = '';
  document.getElementById('statusFilter').value = '';
  document.getElementById('loginFromDate').value = '';
  document.getElementById('loginToDate').value = '';
  filterTable();
}

// Active Section Filters
function filterTableActive() {
  const searchInput = document.getElementById('searchInputActive').value.toLowerCase();
  const courseFilter = document.getElementById('courseFilterActive').value;
  const studentTypeFilter = document.getElementById('studentTypeFilterActive').value;
  const loginFromDate = document.getElementById('loginFromDateActive').value;
  const loginToDate = document.getElementById('loginToDateActive').value;
  const tables = document.querySelectorAll('#active table tbody');
  
  tables.forEach(table => {
    const rows = table.getElementsByTagName('tr');

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const nameCell = row.querySelector('td:nth-child(1)');
      const courseCell = row.querySelector('td:nth-child(2)');
      const studentTypeCell = row.querySelector('td:nth-child(3)');
      const lastLoginCell = row.querySelector('td:nth-child(4)');

      if (!nameCell || !courseCell || !studentTypeCell || !lastLoginCell) continue;

      const name = nameCell.textContent.toLowerCase();
      const course = courseCell.textContent.trim();
      const studentType = studentTypeCell.textContent.trim();
      const lastLogin = lastLoginCell.textContent.trim();

      let matchesSearch = name.includes(searchInput);
      let matchesCourse = courseFilter === '' || course === courseFilter;
      let matchesStudentType = studentTypeFilter === '' || studentType === studentTypeFilter;

      // Check date range
      let matchesDateRange = true;
      if (loginFromDate || loginToDate) {
        const lastLoginDate = new Date(lastLogin);
        if (loginFromDate) {
          const fromDate = new Date(loginFromDate);
          matchesDateRange = matchesDateRange && lastLoginDate >= fromDate;
        }
        if (loginToDate) {
          const toDate = new Date(loginToDate);
          matchesDateRange = matchesDateRange && lastLoginDate <= toDate;
        }
      }

      row.style.display = matchesSearch && matchesCourse && matchesStudentType && matchesDateRange ? '' : 'none';
    }
  });
}

function resetFiltersActive() {
  document.getElementById('searchInputActive').value = '';
  document.getElementById('courseFilterActive').value = '';
  document.getElementById('studentTypeFilterActive').value = '';
  document.getElementById('loginFromDateActive').value = '';
  document.getElementById('loginToDateActive').value = '';
  filterTableActive();
}

// Inactive Section Filters
function filterTableInactive() {
  const searchInput = document.getElementById('searchInputInactive').value.toLowerCase();
  const courseFilter = document.getElementById('courseFilterInactive').value;
  const studentTypeFilter = document.getElementById('studentTypeFilterInactive').value;
  const loginFromDate = document.getElementById('loginFromDateInactive').value;
  const loginToDate = document.getElementById('loginToDateInactive').value;
  const tables = document.querySelectorAll('#inactive table tbody');
  
  tables.forEach(table => {
    const rows = table.getElementsByTagName('tr');

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const nameCell = row.querySelector('td:nth-child(1)');
      const courseCell = row.querySelector('td:nth-child(2)');
      const studentTypeCell = row.querySelector('td:nth-child(3)');
      const lastLoginCell = row.querySelector('td:nth-child(4)');

      if (!nameCell || !courseCell || !studentTypeCell || !lastLoginCell) continue;

      const name = nameCell.textContent.toLowerCase();
      const course = courseCell.textContent.trim();
      const studentType = studentTypeCell.textContent.trim();
      const lastLogin = lastLoginCell.textContent.trim();

      let matchesSearch = name.includes(searchInput);
      let matchesCourse = courseFilter === '' || course === courseFilter;
      let matchesStudentType = studentTypeFilter === '' || studentType === studentTypeFilter;

      // Check date range
      let matchesDateRange = true;
      if (loginFromDate || loginToDate) {
        const lastLoginDate = new Date(lastLogin);
        if (loginFromDate) {
          const fromDate = new Date(loginFromDate);
          matchesDateRange = matchesDateRange && lastLoginDate >= fromDate;
        }
        if (loginToDate) {
          const toDate = new Date(loginToDate);
          matchesDateRange = matchesDateRange && lastLoginDate <= toDate;
        }
      }

      row.style.display = matchesSearch && matchesCourse && matchesStudentType && matchesDateRange ? '' : 'none';
    }
  });
}

function resetFiltersInactive() {
  document.getElementById('searchInputInactive').value = '';
  document.getElementById('courseFilterInactive').value = '';
  document.getElementById('studentTypeFilterInactive').value = '';
  document.getElementById('loginFromDateInactive').value = '';
  document.getElementById('loginToDateInactive').value = '';
  filterTableInactive();
}
