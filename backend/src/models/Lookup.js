import db from "../config/db.js";

class Lookup {
  static async getProgramId(name) {
    const [rows] = await db.query(
      "SELECT program_id FROM programs WHERE program_name = ? OR program_code = ?", 
      [name, name]
    );
    return rows[0]?.program_id;
  }

  static async getModalityId(name) {
    const [rows] = await db.query(
      "SELECT modality_id FROM learning_modalities WHERE modality_name = ?", 
      [name]
    );
    return rows[0]?.modality_id;
  }
}

export default Lookup;