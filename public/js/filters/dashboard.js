const accountFilterTimers = new Map();

function debounceAccountFilter(section) {
  window.clearTimeout(accountFilterTimers.get(section));
  accountFilterTimers.set(
    section,
    window.setTimeout(() => {
      if (typeof window.applyAccountFilters === "function") {
        window.applyAccountFilters({ section });
      }
    }, 150)
  );
}

function filterAccountSection(section) {
  if (typeof window.applyAccountFilters === "function") {
    debounceAccountFilter(section);
    return;
  }

  filterStaticAccountTable(section);
}

function resetAccountSection(section) {
  if (typeof window.clearAccountFilters === "function") {
    window.clearAccountFilters(section);
    return;
  }

  const suffix = section === "overview" ? "" : section.charAt(0).toUpperCase() + section.slice(1);
  ["searchInput", "courseFilter", "studentTypeFilter"].forEach((id) => {
    const input = document.getElementById(`${id}${suffix}`);
    if (input) {
      input.value = "";
    }
  });

  filterStaticAccountTable(section);
}

function filterStaticAccountTable(section) {
  const suffix = section === "overview" ? "" : section.charAt(0).toUpperCase() + section.slice(1);
  const search = document.getElementById(`searchInput${suffix}`)?.value.trim().toLowerCase() || "";
  const course = document.getElementById(`courseFilter${suffix}`)?.value.trim() || "";
  const studentType = document.getElementById(`studentTypeFilter${suffix}`)?.value.trim() || "";
  const rows = document.querySelectorAll(`#${section} table tbody tr`);

  rows.forEach((row) => {
    const cells = row.querySelectorAll("td");
    if (cells.length < 3) {
      return;
    }

    const accountText = cells[0].textContent.toLowerCase();
    const rowCourse = cells[1].textContent.trim();
    const rowStudentType = cells[2].textContent.trim();
    const matches =
      (!search || accountText.includes(search)) &&
      (!course || rowCourse === course) &&
      (!studentType || rowStudentType === studentType);

    row.classList.toggle("d-none", !matches);
  });
}

function filterTable() {
  filterAccountSection("overview");
}

function resetFilters() {
  resetAccountSection("overview");
}

function filterTableActive() {
  filterAccountSection("active");
}

function resetFiltersActive() {
  resetAccountSection("active");
}

function filterTableInactive() {
  filterAccountSection("inactive");
}

function resetFiltersInactive() {
  resetAccountSection("inactive");
}
