export function fullNameSql(alias = "s") {
  return `CONCAT(
    ${alias}.first_name,
    ' ',
    IFNULL(CONCAT(${alias}.middle_name, ' '), ''),
    ${alias}.last_name,
    IFNULL(CONCAT(' ', ${alias}.suffix), '')
  )`;
}

export function studentStatusSql(alias = "s") {
  return `CASE
    WHEN ${alias}.is_active = 1 THEN 'Active'
    ELSE 'Inactive'
  END`;
}

export function latestEnrollmentJoinSql(enrollmentAlias = "e", latestAlias = "le") {
  return `
    LEFT JOIN (
      SELECT student_id, MAX(enrollment_id) AS enrollment_id
      FROM enrollments
      GROUP BY student_id
    ) ${latestAlias} ON ${latestAlias}.student_id = s.student_id
    LEFT JOIN enrollments ${enrollmentAlias} ON ${enrollmentAlias}.enrollment_id = ${latestAlias}.enrollment_id
  `;
}

export function normalizePagination(query, { defaultLimit = 25, maxLimit = 100 } = {}) {
  const parsedLimit = Number.parseInt(query.limit, 10);
  const parsedOffset = Number.parseInt(query.offset, 10);
  const parsedPage = Number.parseInt(query.page, 10);

  const limit =
    Number.isInteger(parsedLimit) && parsedLimit > 0
      ? Math.min(parsedLimit, maxLimit)
      : defaultLimit;

  const offset =
    Number.isInteger(parsedOffset) && parsedOffset >= 0
      ? parsedOffset
      : Number.isInteger(parsedPage) && parsedPage > 1
        ? (parsedPage - 1) * limit
        : 0;

  return { limit, offset };
}

export function buildStudentAccountFilterQuery(filters = {}) {
  const clauses = [];
  const values = [];

  if (filters.course) {
    clauses.push("(p.program_code = ? OR p.program_name = ?)");
    values.push(filters.course, filters.course);
  }

  if (filters.studentType) {
    clauses.push("st.type_name = ?");
    values.push(filters.studentType);
  }

  if (filters.status) {
    clauses.push(`${studentStatusSql("u")} = ?`);
    values.push(filters.status);
  }

  if (filters.search) {
    clauses.push(`(
      ${fullNameSql("s")} LIKE ?
      OR u.full_name LIKE ?
      OR u.email LIKE ?
      OR CAST(s.student_id AS CHAR) LIKE ?
    )`);

    const searchValue = `%${filters.search}%`;
    values.push(searchValue, searchValue, searchValue, searchValue);
  }

  return {
    whereClause: clauses.length ? `AND ${clauses.join(" AND ")}` : "",
    values,
  };
}
