// Inside studentService.js
export async function submitEnrollment(payload) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const programId = await Lookup.resolveProgramId(connection, payload.program);
    const studentId = await Student.upsert(connection, payload);
    
    // ... logic for queue number ...
    
    const enrollmentId = await Enrollment.insert(connection, {
      studentId, programId, ...payload
    });

    const nextPos = await ApplicationQueue.getNextPosition(connection);
    await ApplicationQueue.addToQueue(connection, enrollmentId, nextPos);

    await connection.commit();
    return { studentId, enrollmentId, queueNumber };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}