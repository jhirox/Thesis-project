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

function formatDisplayDate(value) {
  if (!value) {
    return "Not set";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatSemesterLabel(value) {
  const normalized = String(value || "").trim();
  if (!normalized) {
    return "Not set";
  }

  if (/semester/i.test(normalized) || /\bsem\b/i.test(normalized)) {
    return normalized;
  }

  return `${normalized} Sem`;
}

function buildEnrollmentSubjectRows(appointmentTime) {
  const subjects = [
    ["GE", "Art Appreciation", "3"],
    ["CS ELECTIVE 1", "Graphics and Visual Computing", "3"],
    ["HC 101 / IAS 101", "Human Computer Interaction, Information Assurance and Security", "3"],
    ["SP 101", "Social Issues and Professional Practice", "3"],
    ["SE 102", "Software Engineering 2", "3"],
    ["THS 101", "Thesis 1", "3"],
  ];

  return subjects
    .map(([code, description, units]) => `
      <tr>
        <td>${escapeHtml(code)}</td>
        <td>${escapeHtml(description)}</td>
        <td>${escapeHtml(units)}</td>
        <td>${escapeHtml(appointmentTime || "--:--")}</td>
        <td>MTWFSaSu</td>
        <td>Room 101</td>
        <td>Instructor</td>
      </tr>
    `)
    .join("");
}

function buildSoftCopyAttachment({ profile = {}, appointmentDate, appointmentTime }) {
  const studentName = profile.full_name || "Student";
  const programCode = profile.program_code || profile.major || "";
  const programName = profile.program_name || "";
  const semester = formatSemesterLabel(profile.semester || profile.semester_types);
  const schoolYear = profile.academic_year || "SY 2025-2026";
  const course = profile.year_level || programCode || "Not set";
  const yearSection = programName || programCode || "Not set";
  const registrationDate = formatDisplayDate(appointmentDate || profile.enrollment_date);
  const fullAddress = profile.complete_address || "Not Provided";
  const feesTitle = [programCode || "BSCS", profile.year_level || "2", semester, schoolYear].join(" ");
  const filenameName = String(studentName)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "student";
  const content = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Enrollment Form</title>
    <xml>
      <w:WordDocument>
        <w:View>Print</w:View>
        <w:Zoom>90</w:Zoom>
      </w:WordDocument>
    </xml>
    <style>
      @page Section1 { size: 8.27in 11.69in; margin: .35in; }
      body { font-family: Arial, sans-serif; color: #111827; margin: 0; }
      .doc { width: 100%; border: 1px solid #9ca3af; background: #fffdfa; }
      .header { background: #0b2545; color: #ffffff; border: 2px solid #d5aa20; padding: 10px 14px; text-align: center; }
      .header h2 { margin: 0; font-size: 18px; letter-spacing: .04em; }
      .header p { margin: 4px 0 0; font-size: 11px; }
      .title { background: #d5aa20; color: #0b2545; text-align: center; font-weight: bold; text-transform: uppercase; padding: 8px; }
      .title .small { font-size: 11px; }
      .title .large { font-size: 16px; letter-spacing: 1px; }
      .student-grid { width: 100%; border-collapse: collapse; margin-top: 8px; }
      .student-grid td { width: 33.33%; padding: 6px 8px; vertical-align: top; }
      .label { display: block; font-size: 10px; font-weight: bold; color: #0b2545; text-transform: uppercase; }
      .field { display: block; min-height: 18px; border-bottom: 2px solid #94a3b8; padding: 3px 0; font-size: 12px; }
      .subjects, .fees { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 10px; }
      .subjects th { background: #0b2545; color: #ffffff; text-transform: uppercase; padding: 5px; border: 1px solid #d9dee7; }
      .subjects td, .fees td { border: 1px solid #d9dee7; padding: 5px; }
      .bottom-grid { width: 100%; border-collapse: collapse; margin-top: 8px; }
      .bottom-grid td { width: 33.33%; padding: 6px 8px; vertical-align: top; }
      .staff { margin-top: 10px; border-top: 1px solid #d5aa20; padding-top: 8px; }
      .signatures { width: 100%; border-collapse: collapse; margin-top: 8px; }
      .signatures td { width: 33.33%; text-align: center; padding: 8px; vertical-align: bottom; }
      .notice { background: #0b2545; color: #ffffff; border: 1px solid #d5aa20; margin-top: 10px; padding: 8px; font-size: 10px; line-height: 1.35; }
      .notice strong { color: #ffd24a; }
      .fees-title { background: #d5aa20; color: #0b2545; text-align: center; font-weight: bold; text-transform: uppercase; padding: 7px; margin-top: 10px; }
      .fees .amount { text-align: right; width: 150px; }
      .total td { font-weight: bold; border-color: #d5aa20; }
      .cashier-box { width: 100%; border-collapse: collapse; margin-top: 8px; }
      .cashier-box td { border: 1px solid #d9dee7; text-align: center; padding: 18px 8px 8px; font-weight: bold; color: #0b2545; text-transform: uppercase; }
    </style>
  </head>
  <body>
    <div class="doc">
      <div class="header">
        <h2>QUEZONIAN EDUCATIONAL COLLEGE, INC.</h2>
        <p>Dr. Ramon Solar Street, Zone II Poblacion, Atimonan, Quezon</p>
        <p>Tel. No. (042) 316-4129 | Email: qeciatimonan@yahoo.com.ph</p>
      </div>
      <div class="title">
        <div class="small">COLLEGIATE DEPARTMENT</div>
        <div class="large">CERTIFICATE OF REGISTRATION</div>
      </div>

      <table class="student-grid">
        <tr>
          <td><span class="label">Student Last Name:</span><span class="field">${escapeHtml(profile.last_name || "Not set")}</span></td>
          <td><span class="label">Student First Name:</span><span class="field">${escapeHtml(profile.first_name || "Not set")}</span></td>
          <td><span class="label">Student Middle Name:</span><span class="field">${escapeHtml(profile.middle_name || "Not set")}</span></td>
        </tr>
        <tr>
          <td><span class="label">Student Number:</span><span class="field">${escapeHtml(profile.student_id || "Not set")}</span></td>
          <td><span class="label">School Year:</span><span class="field">${escapeHtml(schoolYear)}</span></td>
          <td><span class="label">Semester:</span><span class="field">${escapeHtml(semester)}</span></td>
        </tr>
        <tr>
          <td><span class="label">Course:</span><span class="field">${escapeHtml(course)}</span></td>
          <td><span class="label">Year & Section:</span><span class="field">${escapeHtml(yearSection)}</span></td>
          <td><span class="label">Email Address:</span><span class="field">${escapeHtml(profile.email_address || "Not set")}</span></td>
        </tr>
        <tr>
          <td><span class="label">Birthday:</span><span class="field">${escapeHtml(formatDisplayDate(profile.birth_date))}</span></td>
          <td><span class="label">Birthplace:</span><span class="field">${escapeHtml(profile.birth_place || "Not set")}</span></td>
          <td><span class="label">Gender:</span><span class="field">${escapeHtml(profile.sex || "Not set")}</span></td>
        </tr>
        <tr>
          <td><span class="label">Contact Number:</span><span class="field">${escapeHtml(profile.contact_number || "Not set")}</span></td>
          <td colspan="2"><span class="label">Address:</span><span class="field">${escapeHtml(fullAddress)}</span></td>
        </tr>
      </table>

      <table class="subjects">
        <thead>
          <tr>
            <th>CODE</th>
            <th>DESCRIPTION</th>
            <th>UNITS</th>
            <th>TIME</th>
            <th>DAYS</th>
            <th>ROOM</th>
            <th>INSTRUCTOR</th>
          </tr>
        </thead>
        <tbody>
          ${buildEnrollmentSubjectRows(appointmentTime)}
        </tbody>
      </table>

      <table class="bottom-grid">
        <tr>
          <td><span class="label">Number of units earned:</span><span class="field">18</span></td>
          <td><span class="label">Remarks:</span><span class="field">${escapeHtml(profile.special_remarks || "Approved")}</span></td>
          <td><span class="label">Learning Modality:</span><span class="field">${escapeHtml(profile.modality_name || "Face-to-face")}</span></td>
        </tr>
        <tr>
          <td></td>
          <td><span class="field" style="text-align:center;">${escapeHtml(studentName)}</span><span class="label" style="text-align:center;">STUDENT<br>(Signature Over Printed Name)</span></td>
          <td></td>
        </tr>
      </table>

      <div class="staff">
        <span class="label">(QECI STAFF ONLY)</span>
        <span class="label" style="margin-top: 8px;">Process by:</span>
        <table class="signatures">
          <tr>
            <td><span class="field">Registrar</span><span class="label">Admission Officer</span></td>
            <td><span class="field">&nbsp;</span><span class="label">Signature</span></td>
            <td><span class="field">${escapeHtml(registrationDate)}</span><span class="label">Date of Registration</span></td>
          </tr>
        </table>
      </div>

      <div class="notice">
        <strong>IMPORTANT:</strong> Keep this portion. Present it to your instructors on the first day of classes for his/her signature.
        You will also be required to present this at the Office of the Student Affairs when applying for your identification card and in all your dealings in the School.
      </div>

      <div class="fees-title">ASSESSMENT OF FEES</div>
      <table class="fees">
        <tr><td colspan="2" style="text-align:center;font-weight:bold;color:#0b2545;">${escapeHtml(feesTitle)}</td></tr>
        <tr><td>Tuition Fee</td><td class="amount">5,400.00</td></tr>
        <tr><td>Registration Fee</td><td class="amount"></td></tr>
        <tr><td>Miscellaneous Fee</td><td class="amount"></td></tr>
        <tr><td>Computer Lab Fee</td><td class="amount"></td></tr>
        <tr><td>Cultural Fee</td><td class="amount"></td></tr>
        <tr><td>CSSG Fee</td><td class="amount"></td></tr>
        <tr><td>Class Card</td><td class="amount"></td></tr>
        <tr><td>Research Fee</td><td class="amount"></td></tr>
        <tr><td>Thesis/FS/Comp Proj: Oral Defense</td><td class="amount"></td></tr>
        <tr><td>Practicum/OJT Fee</td><td class="amount"></td></tr>
        <tr class="total"><td>TOTAL OBLIGATION</td><td class="amount">10,700.00</td></tr>
      </table>
      <table class="cashier-box">
        <tr>
          <td>School Cashier</td>
          <td>Finance Officer</td>
        </tr>
      </table>
      <div class="notice">
        <strong>NOTES:</strong> Please settle your account before the examination. If you have settled your account,
        please present your OR to our Finance Officer for your examination permit. Thank you.
      </div>
    </div>
  </body>
</html>`;

  return {
    filename: `enrollment-form-${filenameName}.doc`,
    content,
    contentType: "application/msword",
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
