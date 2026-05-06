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

function escapeXml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function crc32(buffer) {
  let crc = 0xffffffff;

  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }

  return (crc ^ 0xffffffff) >>> 0;
}

function getDosDateTime(date = new Date()) {
  const dosTime =
    (date.getHours() << 11) |
    (date.getMinutes() << 5) |
    Math.floor(date.getSeconds() / 2);
  const dosDate =
    ((date.getFullYear() - 1980) << 9) |
    ((date.getMonth() + 1) << 5) |
    date.getDate();

  return { dosTime, dosDate };
}

function createZip(entries) {
  const localParts = [];
  const centralParts = [];
  let offset = 0;
  const { dosTime, dosDate } = getDosDateTime();

  for (const entry of entries) {
    const nameBuffer = Buffer.from(entry.name, "utf8");
    const contentBuffer = Buffer.isBuffer(entry.content) ? entry.content : Buffer.from(entry.content, "utf8");
    const checksum = crc32(contentBuffer);

    const localHeader = Buffer.alloc(30);
    localHeader.writeUInt32LE(0x04034b50, 0);
    localHeader.writeUInt16LE(20, 4);
    localHeader.writeUInt16LE(0, 6);
    localHeader.writeUInt16LE(0, 8);
    localHeader.writeUInt16LE(dosTime, 10);
    localHeader.writeUInt16LE(dosDate, 12);
    localHeader.writeUInt32LE(checksum, 14);
    localHeader.writeUInt32LE(contentBuffer.length, 18);
    localHeader.writeUInt32LE(contentBuffer.length, 22);
    localHeader.writeUInt16LE(nameBuffer.length, 26);
    localHeader.writeUInt16LE(0, 28);
    localParts.push(localHeader, nameBuffer, contentBuffer);

    const centralHeader = Buffer.alloc(46);
    centralHeader.writeUInt32LE(0x02014b50, 0);
    centralHeader.writeUInt16LE(20, 4);
    centralHeader.writeUInt16LE(20, 6);
    centralHeader.writeUInt16LE(0, 8);
    centralHeader.writeUInt16LE(0, 10);
    centralHeader.writeUInt16LE(dosTime, 12);
    centralHeader.writeUInt16LE(dosDate, 14);
    centralHeader.writeUInt32LE(checksum, 16);
    centralHeader.writeUInt32LE(contentBuffer.length, 20);
    centralHeader.writeUInt32LE(contentBuffer.length, 24);
    centralHeader.writeUInt16LE(nameBuffer.length, 28);
    centralHeader.writeUInt16LE(0, 30);
    centralHeader.writeUInt16LE(0, 32);
    centralHeader.writeUInt16LE(0, 34);
    centralHeader.writeUInt16LE(0, 36);
    centralHeader.writeUInt32LE(0, 38);
    centralHeader.writeUInt32LE(offset, 42);
    centralParts.push(centralHeader, nameBuffer);

    offset += localHeader.length + nameBuffer.length + contentBuffer.length;
  }

  const centralDirectory = Buffer.concat(centralParts);
  const endRecord = Buffer.alloc(22);
  endRecord.writeUInt32LE(0x06054b50, 0);
  endRecord.writeUInt16LE(0, 4);
  endRecord.writeUInt16LE(0, 6);
  endRecord.writeUInt16LE(entries.length, 8);
  endRecord.writeUInt16LE(entries.length, 10);
  endRecord.writeUInt32LE(centralDirectory.length, 12);
  endRecord.writeUInt32LE(offset, 16);
  endRecord.writeUInt16LE(0, 20);

  return Buffer.concat([...localParts, centralDirectory, endRecord]);
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

function docxText(value) {
  return `<w:r><w:t xml:space="preserve">${escapeXml(value)}</w:t></w:r>`;
}

function docxParagraph(value, { bold = false, center = false, size = 22 } = {}) {
  return `
    <w:p>
      <w:pPr>${center ? '<w:jc w:val="center"/>' : ""}</w:pPr>
      <w:r>
        <w:rPr>${bold ? "<w:b/>" : ""}<w:sz w:val="${size}"/></w:rPr>
        <w:t xml:space="preserve">${escapeXml(value)}</w:t>
      </w:r>
    </w:p>`;
}

function docxTable(rows) {
  return `
    <w:tbl>
      <w:tblPr><w:tblW w:w="5000" w:type="pct"/><w:tblBorders>
        <w:top w:val="single" w:sz="4" w:space="0" w:color="999999"/>
        <w:left w:val="single" w:sz="4" w:space="0" w:color="999999"/>
        <w:bottom w:val="single" w:sz="4" w:space="0" w:color="999999"/>
        <w:right w:val="single" w:sz="4" w:space="0" w:color="999999"/>
        <w:insideH w:val="single" w:sz="4" w:space="0" w:color="999999"/>
        <w:insideV w:val="single" w:sz="4" w:space="0" w:color="999999"/>
      </w:tblBorders></w:tblPr>
      ${rows.map((row) => `
        <w:tr>
          ${row.map((cell) => `
            <w:tc>
              <w:tcPr><w:tcW w:w="2400" w:type="dxa"/></w:tcPr>
              <w:p>${docxText(cell)}</w:p>
            </w:tc>
          `).join("")}
        </w:tr>
      `).join("")}
    </w:tbl>`;
}

function createDocxDocumentXml({ profile, appointmentDate, appointmentTime }) {
  const studentName = profile.full_name || "Student";
  const programCode = profile.program_code || profile.major || "";
  const programName = profile.program_name || "";
  const semester = formatSemesterLabel(profile.semester || profile.semester_types);
  const schoolYear = profile.academic_year || "SY 2025-2026";
  const course = profile.year_level || programCode || "Not set";
  const yearSection = programName || programCode || "Not set";
  const registrationDate = formatDisplayDate(appointmentDate || profile.enrollment_date);
  const subjectRows = [
    ["CODE", "DESCRIPTION", "UNITS", "TIME", "DAYS", "ROOM", "INSTRUCTOR"],
    ["GE", "Art Appreciation", "3", appointmentTime || "--:--", "MTWFSaSu", "Room 101", "Instructor"],
    ["CS ELECTIVE 1", "Graphics and Visual Computing", "3", appointmentTime || "--:--", "MTWFSaSu", "Room 101", "Instructor"],
    ["HC 101 / IAS 101", "Human Computer Interaction, Information Assurance and Security", "3", appointmentTime || "--:--", "MTWFSaSu", "Room 101", "Instructor"],
    ["SP 101", "Social Issues and Professional Practice", "3", appointmentTime || "--:--", "MTWFSaSu", "Room 101", "Instructor"],
    ["SE 102", "Software Engineering 2", "3", appointmentTime || "--:--", "MTWFSaSu", "Room 101", "Instructor"],
    ["THS 101", "Thesis 1", "3", appointmentTime || "--:--", "MTWFSaSu", "Room 101", "Instructor"],
  ];
  const studentRows = [
    ["Student Last Name", profile.last_name || "Not set", "Student First Name", profile.first_name || "Not set", "Student Middle Name", profile.middle_name || "Not set"],
    ["Student Number", profile.student_id || "Not set", "School Year", schoolYear, "Semester", semester],
    ["Course", course, "Year & Section", yearSection, "Email Address", profile.email_address || "Not set"],
    ["Birthday", formatDisplayDate(profile.birth_date), "Birthplace", profile.birth_place || "Not set", "Gender", profile.sex || "Not set"],
    ["Contact Number", profile.contact_number || "Not set", "Address", profile.complete_address || "Not Provided", "PWD", ""],
  ];
  const feeRows = [
    ["ASSESSMENT OF FEES", `${programCode || "BSCS"} ${profile.year_level || "2"} ${semester} ${schoolYear}`],
    ["Tuition Fee", "5,400.00"],
    ["Registration Fee", ""],
    ["Miscellaneous Fee", ""],
    ["Computer Lab Fee", ""],
    ["Cultural Fee", ""],
    ["CSSG Fee", ""],
    ["Class Card", ""],
    ["Research Fee", ""],
    ["Thesis/FS/Comp Proj: Oral Defense", ""],
    ["Practicum/OJT Fee", ""],
    ["TOTAL OBLIGATION", "10,700.00"],
  ];

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    ${docxParagraph("QUEZONIAN EDUCATIONAL COLLEGE, INC.", { bold: true, center: true, size: 28 })}
    ${docxParagraph("Dr. Ramon Solar Street, Zone II Poblacion, Atimonan, Quezon", { center: true, size: 18 })}
    ${docxParagraph("Tel. No. (042) 316-4129 | Email: qeciatimonan@yahoo.com.ph", { center: true, size: 18 })}
    ${docxParagraph("COLLEGIATE DEPARTMENT", { bold: true, center: true, size: 20 })}
    ${docxParagraph("CERTIFICATE OF REGISTRATION", { bold: true, center: true, size: 26 })}
    ${docxTable(studentRows)}
    ${docxParagraph("Subjects", { bold: true, size: 22 })}
    ${docxTable(subjectRows)}
    ${docxTable([
      ["Number of units earned", "18", "Remarks", profile.special_remarks || "Approved", "Learning Modality", profile.modality_name || "Face-to-face"],
      ["Student", studentName, "Signature Over Printed Name", "", "Date of Registration", registrationDate],
    ])}
    ${docxParagraph("(QECI STAFF ONLY)", { bold: true, size: 20 })}
    ${docxTable([
      ["Admission Officer", "Registrar", "Signature", "", "Date of Registration", registrationDate],
    ])}
    ${docxParagraph("IMPORTANT: Keep this portion. Present it to your instructors on the first day of classes for his/her signature. You will also be required to present this at the Office of the Student Affairs when applying for your identification card and in all your dealings in the School.", { size: 18 })}
    ${docxTable(feeRows)}
    ${docxTable([
      ["SCHOOL CASHIER", "", "FINANCE OFFICER", ""],
    ])}
    ${docxParagraph("NOTES: Please settle your account before the examination. If you have settled your account, please present your OR to our Finance Officer for your examination permit. Thank you.", { size: 18 })}
    <w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="720" w:right="720" w:bottom="720" w:left="720"/></w:sectPr>
  </w:body>
</w:document>`;
}

function createDocxBuffer(documentXml) {
  return createZip([
    {
      name: "[Content_Types].xml",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`,
    },
    {
      name: "_rels/.rels",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`,
    },
    {
      name: "word/document.xml",
      content: documentXml,
    },
  ]);
}

function buildSoftCopyAttachment({ profile = {}, appointmentDate, appointmentTime }) {
  const studentName = profile.full_name || "Student";
  const filenameName = String(studentName)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "student";
  const content = createDocxBuffer(createDocxDocumentXml({ profile, appointmentDate, appointmentTime }));

  return {
    filename: `enrollment-form-${filenameName}.docx`,
    content,
    contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
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
