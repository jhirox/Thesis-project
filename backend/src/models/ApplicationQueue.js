import db from "../config/db.js";

class ApplicationQueue {
  static async getNextPosition(connection) {
    const [rows] = await connection.query(
      "SELECT COALESCE(MAX(position), 0) + 1 AS nextPosition FROM application_queue"
    );
    return rows[0]?.nextPosition || 1;
  }

  static async addToQueue(connection, enrollmentId, position) {
    return await connection.query(
      `INSERT INTO application_queue (enrollment_id, queued_at, position, status) 
       VALUES (?, NOW(), ?, 'Waiting')`,
      [enrollmentId, position]
    );
  }
}

export default ApplicationQueue;