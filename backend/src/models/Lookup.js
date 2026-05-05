import db from "../config/db.js";

const programAliases = {
  "BSBA Major in Marketing Management": "BSBA-MM",
  "BSBA Major in Financial Management": "BSBA-FM",
  "BSBA Major in Human Resource Management": "BSBA-HRM",
  "BSED Major in English": "BSED-ENG",
  "BSED Major in Mathematics": "BSED-MATH",
  "BSED Major in Filipino": "BSED-FIL",
};

class Lookup {
  static async findIdByName(connection, table, idCol, nameCol, value) {
    const [rows] = await connection.query(
      `SELECT ${idCol} AS id FROM ${table} WHERE ${nameCol} = ? LIMIT 1`,
      [value]
    );
    return rows.length > 0 ? rows[0].id : null;
  }

  static async resolveId(connection, table, idCol, nameCol, value) {
    if (value === undefined || value === null) {
      return null;
    }

    const numericValue = Number(value);
    if (Number.isInteger(numericValue) && String(numericValue) === String(value).trim()) {
      const [rows] = await connection.query(
        `SELECT ${idCol} FROM ${table} WHERE ${idCol} = ? LIMIT 1`,
        [numericValue]
      );
      if (rows.length > 0) {
        return numericValue;
      }
    }

    return this.findIdByName(connection, table, idCol, nameCol, value);
  }

  static async resolveProgramId(connection, value) {
    const normalizedValue = String(value || "").trim();
    const lookupValue = programAliases[normalizedValue] || normalizedValue;

     const [rows] = await connection.query(
      `SELECT program_id FROM programs 
       WHERE program_name = ? OR program_code = ? 
       OR CONCAT(program_code, ' - ', program_name) = ? LIMIT 1`,
      [lookupValue, lookupValue, lookupValue]
    );
    return rows[0]?.program_id || null;
  }

  static async resolveModalityId(connection, value) {
    return this.resolveId(connection, "learning_modalities", "modality_id", "modality_name", value);
  }

  static async resolveStudentTypeId(connection, value) {
    return this.resolveId(connection, "student_types", "type_id", "type_name", value);
  }
}

export default Lookup;
