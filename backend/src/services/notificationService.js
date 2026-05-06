import db from "../config/db.js";
import { notFound } from "../utils/httpError.js";
import { findEnrollmentApplicantDetails } from "./studentService.js";
import { isEmailDeliveryConfigured, sendEmail } from "./email.service.js";

const notificationColumnDefinitions = {
  notification_id: "INT AUTO_INCREMENT PRIMARY KEY",
  enrollment_id: "INT NULL",
  student_id: "INT NULL",
  student_email: "VARCHAR(255) NOT NULL",
  title: "VARCHAR(255) NOT NULL",
  notification_type: "VARCHAR(100) NOT NULL",
  message: "TEXT NOT NULL",
  appointment_date: "DATE NULL",
  appointment_time: "VARCHAR(20) NULL",
  includes_soft_copy: "TINYINT(1) NOT NULL DEFAULT 0",
  soft_copy_payload: "LONGTEXT NULL",
  email_delivery_status: "VARCHAR(50) NOT NULL DEFAULT 'pending'",
  email_delivery_message: "TEXT NULL",
  is_read: "TINYINT(1) NOT NULL DEFAULT 0",
  created_at: "TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP",
  updated_at: "TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
};

let notificationSchemaReady = false;

async function updateNotificationDeliveryResult(notificationId, emailResult) {
  await db.query(
    `UPDATE notifications
    SET email_delivery_status = ?, email_delivery_message = ?, updated_at = NOW()
    WHERE notification_id = ?`,
    [emailResult.status, emailResult.message, notificationId]
  );
}

async function dispatchScheduleEmailInBackground({
  notificationId,
  studentEmail,
  notificationTitle,
  notificationMessage,
  profile,
  appointmentDate,
  appointmentTime,
  customMessage,
  includesSoftCopy,
}) {
  try {
    const emailResult = await sendEmail({
      to: studentEmail,
      subject: notificationTitle,
      text: notificationMessage,
      html: buildEmailHtml({
        profile,
        appointmentDate,
        appointmentTime,
        customMessage,
        includesSoftCopy,
      }),
      attachments: includesSoftCopy ? [buildSoftCopyAttachment({ profile, appointmentDate, appointmentTime })] : [],
    });

    await updateNotificationDeliveryResult(notificationId, emailResult);
    return emailResult;
  } catch (error) {
    const emailResult = {
      status: "failed",
      message: error?.message || "Failed to send email.",
    };
    await updateNotificationDeliveryResult(notificationId, emailResult);
    return emailResult;
  }
}

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

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function buildSoftCopyAttachment({ profile = {}, appointmentDate, appointmentTime }) {
  const studentName = profile.full_name || "Student";
  const program = [profile.program_code, profile.program_name].filter(Boolean).join(" - ") || "Not set";
  const semester = profile.semester || profile.semester_types || "Not set";
  const rows = [
    ["Student ID", profile.student_id || "Not set"],
    ["Student Name", studentName],
    ["Email", profile.email_address || "Not set"],
    ["Program", program],
    ["Year Level", profile.year_level || "Not set"],
    ["Semester", semester],
    ["Appointment Date", appointmentDate || "Not set"],
    ["Appointment Time", appointmentTime || "Not set"],
  ];
  const filenameName = String(studentName)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "student";
  const content = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Enrollment Form Soft Copy</title>
    <style>
      body { font-family: Arial, sans-serif; color: #111827; margin: 32px; }
      .header { border-bottom: 2px solid #111827; margin-bottom: 24px; padding-bottom: 12px; }
      h1 { font-size: 22px; margin: 0 0 6px; }
      p { margin: 0; color: #4b5563; }
      table { border-collapse: collapse; width: 100%; margin-top: 20px; }
      th, td { border: 1px solid #d1d5db; padding: 10px 12px; text-align: left; }
      th { width: 220px; background: #f3f4f6; }
      .footer { margin-top: 28px; font-size: 13px; color: #4b5563; }
    </style>
  </head>
  <body>
    <div class="header">
      <h1>Enrollment Form Soft Copy</h1>
      <p>QEC Registrar</p>
    </div>
    <table>
      <tbody>
        ${rows.map(([label, value]) => `<tr><th>${escapeHtml(label)}</th><td>${escapeHtml(value)}</td></tr>`).join("")}
      </tbody>
    </table>
    <div class="footer">
      Please keep this soft copy for your registration reference.
    </div>
  </body>
</html>`;

  return {
    filename: `enrollment-form-${filenameName}.html`,
    content,
    contentType: "text/html",
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
            <p>The enrollment form soft copy is attached to this email. Please keep this summary for your registration reference:</p>
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

function buildDirectEmailHtml({ title, studentName, message, notificationType, appointmentDate }) {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
      <h2 style="margin-bottom: 12px;">${title}</h2>
      <p>Hello ${studentName || "Student"},</p>
      <p>${message}</p>
      ${notificationType ? `<p><strong>Type:</strong> ${notificationType}</p>` : ""}
      ${appointmentDate ? `<p><strong>Date:</strong> ${appointmentDate}</p>` : ""}
      <p>Thank you.</p>
      <p><strong>QEC Registrar</strong></p>
    </div>
  `;
}

async function ensureNotificationsTableShape() {
  if (notificationSchemaReady) {
    return;
  }

  await db.query(`
    CREATE TABLE IF NOT EXISTS notifications (
      notification_id INT AUTO_INCREMENT PRIMARY KEY,
      enrollment_id INT NULL,
      student_id INT NULL,
      student_email VARCHAR(255) NOT NULL,
      title VARCHAR(255) NOT NULL,
      notification_type VARCHAR(100) NOT NULL,
      message TEXT NOT NULL,
      appointment_date DATE NULL,
      appointment_time VARCHAR(20) NULL,
      includes_soft_copy TINYINT(1) NOT NULL DEFAULT 0,
      soft_copy_payload LONGTEXT NULL,
      email_delivery_status VARCHAR(50) NOT NULL DEFAULT 'pending',
      email_delivery_message TEXT NULL,
      is_read TINYINT(1) NOT NULL DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  const [existingColumns] = await db.query("SHOW COLUMNS FROM notifications");
  const existingColumnNames = new Set(existingColumns.map((column) => column.Field));
  const legacyTypeIdColumn = existingColumns.find((column) => column.Field === "type_id");

  for (const [columnName, definition] of Object.entries(notificationColumnDefinitions)) {
    if (!existingColumnNames.has(columnName)) {
      await db.query(`ALTER TABLE notifications ADD COLUMN ${columnName} ${definition}`);
    }
  }

  // Older deployments may still have a required legacy type_id column.
  // The current app no longer writes to it, so relax the column to keep inserts working.
  if (
    legacyTypeIdColumn &&
    legacyTypeIdColumn.Null === "NO" &&
    (legacyTypeIdColumn.Default === null || legacyTypeIdColumn.Default === undefined)
  ) {
    await db.query("ALTER TABLE notifications MODIFY COLUMN type_id INT NULL DEFAULT NULL");
  }

  notificationSchemaReady = true;
}

export async function createScheduleNotification(payload) {
  await ensureNotificationsTableShape();
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
  const emailDeliveryConfigured = isEmailDeliveryConfigured();
  const initialEmailDeliveryStatus = emailDeliveryConfigured ? "sending" : "skipped";
  const initialEmailDeliveryMessage = emailDeliveryConfigured
    ? "Email delivery in progress."
    : "Email delivery is not configured.";

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
      initialEmailDeliveryStatus,
      initialEmailDeliveryMessage,
    ]
  );

  const emailResult = emailDeliveryConfigured
    ? await dispatchScheduleEmailInBackground({
        notificationId: result.insertId,
        studentEmail: payload.studentEmail,
        notificationTitle,
        notificationMessage,
        profile,
        appointmentDate: payload.appointmentDate,
        appointmentTime: payload.appointmentTime,
        customMessage: payload.message,
        includesSoftCopy: payload.includesSoftCopy,
      })
    : {
        success: false,
        status: "skipped",
        message: "Email delivery is not configured.",
      };

  return {
    notificationId: result.insertId,
    title: notificationTitle,
    type: notificationType,
    message: notificationMessage,
    emailDeliveryStatus: emailResult.status,
    emailDeliveryMessage: emailResult.message,
  };
}

export async function createDirectNotification(payload) {
  await ensureNotificationsTableShape();

  const emailDeliveryConfigured = isEmailDeliveryConfigured();
  const initialEmailDeliveryStatus = emailDeliveryConfigured ? "queued" : "skipped";
  const initialEmailDeliveryMessage = emailDeliveryConfigured
    ? "Email delivery queued."
    : "Email delivery is not configured.";
  const notificationType = payload.notificationType || "General";

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
    ) VALUES (NULL, NULL, ?, ?, ?, ?, ?, NULL, 0, NULL, ?, ?, 0, NOW(), NOW())`,
    [
      payload.studentEmail,
      payload.title,
      notificationType,
      payload.message,
      payload.appointmentDate || null,
      initialEmailDeliveryStatus,
      initialEmailDeliveryMessage,
    ]
  );

  const emailResult = emailDeliveryConfigured
    ? await sendEmail({
        to: payload.studentEmail,
        subject: payload.title,
        text: payload.message,
        html: buildDirectEmailHtml({
          title: payload.title,
          studentName: payload.studentName,
          message: payload.message,
          notificationType,
          appointmentDate: payload.appointmentDate,
        }),
      })
    : {
        success: false,
        status: "skipped",
        message: "Email delivery is not configured.",
      };

  await updateNotificationDeliveryResult(result.insertId, emailResult);

  return {
    notificationId: result.insertId,
    title: payload.title,
    type: notificationType,
    message: payload.message,
    emailDeliveryStatus: emailResult.status,
    emailDeliveryMessage: emailResult.message,
  };
}

export async function listNotificationsByEmail(email) {
  await ensureNotificationsTableShape();
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
  await ensureNotificationsTableShape();
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
  await ensureNotificationsTableShape();
  await db.query(
    `UPDATE notifications
    SET is_read = 1, updated_at = NOW()
    WHERE student_email = ? AND is_read = 0`,
    [email]
  );
}

export async function clearNotificationsByEmail(email) {
  await ensureNotificationsTableShape();
  await db.query("DELETE FROM notifications WHERE student_email = ?", [email]);
}

export async function deleteNotification(notificationId) {
  await ensureNotificationsTableShape();
  const [result] = await db.query("DELETE FROM notifications WHERE notification_id = ?", [notificationId]);

  if (result.affectedRows === 0) {
    throw notFound("Notification not found.");
  }
}
