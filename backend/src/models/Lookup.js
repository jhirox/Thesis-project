import db from "../config/db.js";

class Lookup {
  static async findIdByName(connection, table, idCol, nameCol, value) {
    const [rows] = await connection.query(
      `SELECT ${idCol} AS id FROM ${table} WHERE ${nameCol} = ? LIMIT 1`,
      [value]
    );
    return rows.length > 0 ? rows[0].id : null;
  }

  static async resolveProgramId(connection, value) {
     const [rows] = await connection.query(
      `SELECT program_id FROM programs 
       WHERE program_name = ? OR program_code = ? 
       OR CONCAT(program_code, ' - ', program_name) = ? LIMIT 1`,
      [value, value, value]
    );
    return rows[0]?.program_id || null;
  }
}

export default Lookup;