import db from "../config/db.js";
import { notFound } from "../utils/httpError.js";
import { findEnrollmentApplicantDetails } from "./studentService.js";
import { sendEmail } from "./email.service.js";

function buildNotificationMessage({ studentName, appointmentDate, appointmentTime, customMessage, includesSoftCopy }) {
  const messageParts = [
    `Your enrollment appointment has been scheduled for ${appointmentDate} at ${appointmentTime}.`,
  ];

  if (customMessage) {
    messageParts.push(customMessage);
  }

  if (includesSoftCopy) {
    messageParts.push("A soft copy of your enrollment form for registration is included in this notice.");
  }

  return `Hello ${studentName}, ${messageParts.join(" ")}`;
}

function buildSoftCopySummary(profile = {}, appointmentDate, appointmentTime) {
  return {
    studentId: profile.student_id || null,
    studentName: profile.full_name || null,
    programCode: profile.program_code || null,
    programName: profile.program_name || null,
    yearLevel: profile.year_level || null,
    semester: profile.semester || profile.semester_types || null,
    appointmentDate,
    appointmentTime,
  };
}

function buildEmailHtml({ profile, appointmentDate, appointmentTime, customMessage, includesSoftCopy }) {
  const studentName = profile.full_name || "Student";
  const program = [profile.program_code, profile.program_name].filter(Boolean).join(" - ") || "Not set";
  const yearLevel = profile.year_level || "Not set";
  const semester = profile.semester || profile.semester_types || "Not set";

  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
      <h2 style="margin-bottom: 12px;">Enrollment Appointment Scheduled</h2>
      <p>Hello ${studentName},</p>
      <p>Your enrollment appointment has been scheduled.</p>
      <ul>
        <li><strong>Date:</strong> ${appointmentDate}</li>
        <li><strong>Time:</strong> ${appointmentTime}</li>
        <li><strong>Program:</strong> ${program}</li>
        <li><strong>Year Level:</strong> ${yearLevel}</li>
        <li><strong>Semester:</strong> ${semester}</li>
      </ul>
      ${customMessage ? `<p><strong>Message from Registrar:</strong> ${customMessage}</p>` : ""}
      ${
        includesSoftCopy
          ? `
            <h3 style="margin-top: 20px;">Enrollment Form Soft Copy</h3>
            <p>Please keep this summary for your registration reference:</p>
            <ul>
              <li><strong>Student ID:</strong> ${profile.student_id || "Not set"}</li>
              <li><strong>Student Name:</strong> ${studentName}</li>
              <li><strong>Program:</strong> ${program}</li>
              <li><strong>Year Level:</strong> ${yearLevel}</li>
              <li><strong>Semester:</strong> ${semester}</li>
            </ul>
          `
          : ""
      }
      <p>Thank you.</p>
      <p><strong>QEC Registrar</strong></p>
    </div>
  `;
}

export async function createScheduleNotification(payload) {
  const profile = await findEnrollmentApplicantDetails(payload.enrollmentId);

  if (!profile) {
    throw notFound("Enrollment record not found for scheduling notification.");
  }

  const studentName = profile.full_name || "Student";
  const notificationTitle = "Enrollment Appointment Scheduled";
  const notificationType = "Appointment";
  const notificationMessage = buildNotificationMessage({
    studentName,
    appointmentDate: payload.appointmentDate,
    appointmentTime: payload.appointmentTime,
    customMessage: payload.message,
    includesSoftCopy: payload.includesSoftCopy,
  });
  const softCopyPayload = payload.includesSoftCopy
    ? JSON.stringify(buildSoftCopySummary(profile, payload.appointmentDate, payload.appointmentTime))
    : null;

  const emailResult = await sendEmail({
    to: payload.studentEmail,
    subject: notificationTitle,
    text: notificationMessage,
    html: buildEmailHtml({
      profile,
      appointmentDate: payload.appointmentDate,
      appointmentTime: payload.appointmentTime,
      customMessage: payload.message,
      includesSoftCopy: payload.includesSoftCopy,
    }),
  });

  const [result] = await db.query(
    `INSERT INTO notifications (
      enrollment_id,
      student_id,
      student_email,
      title,
      notification_type,
      message,
      appointment_date,
      appointment_time,
      includes_soft_copy,
      soft_copy_payload,
      email_delivery_status,
      email_delivery_message,
      is_read,
      created_at,
      updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, NOW(), NOW())`,
    [
      payload.enrollmentId,
      profile.student_id || payload.studentId || null,
      payload.studentEmail,
      notificationTitle,
      notificationType,
      notificationMessage,
      payload.appointmentDate,
      payload.appointmentTime,
      payload.includesSoftCopy ? 1 : 0,
      softCopyPayload,
      emailResult.status,
      emailResult.message,
    ]
  );

  return {
    notificationId: result.insertId,
    title: notificationTitle,
    type: notificationType,
    message: notificationMessage,
    emailDeliveryStatus: emailResult.status,
    emailDeliveryMessage: emailResult.message,
  };
}

export async function listNotificationsByEmail(email) {
  const [rows] = await db.query(
    `SELECT
      notification_id,
      enrollment_id,
      student_id,
      student_email,
      title,
      notification_type,
      message,
      appointment_date,
      appointment_time,
      includes_soft_copy,
      soft_copy_payload,
      email_delivery_status,
      email_delivery_message,
      is_read,
      created_at,
      updated_at
    FROM notifications
    WHERE student_email = ?
    ORDER BY created_at DESC`,
    [email]
  );

  return rows;
}

export async function markNotificationRead(notificationId) {
  const [result] = await db.query(
    `UPDATE notifications
    SET is_read = 1, updated_at = NOW()
    WHERE notification_id = ?`,
    [notificationId]
  );

  if (result.affectedRows === 0) {
    throw notFound("Notification not found.");
  }
}

export async function markAllNotificationsRead(email) {
  await db.query(
    `UPDATE notifications
    SET is_read = 1, updated_at = NOW()
    WHERE student_email = ? AND is_read = 0`,
    [email]
  );
}

export async function clearNotificationsByEmail(email) {
  await db.query("DELETE FROM notifications WHERE student_email = ?", [email]);
}

export async function deleteNotification(notificationId) {
  const [result] = await db.query("DELETE FROM notifications WHERE notification_id = ?", [notificationId]);

  if (result.affectedRows === 0) {
    throw notFound("Notification not found.");
  }
}
