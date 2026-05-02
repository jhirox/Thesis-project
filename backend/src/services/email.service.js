export async function sendEmail({ to, subject, text, html }) {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || user;

  if (!host || !user || !pass || !from) {
    return {
      success: false,
      status: "skipped",
      message: "SMTP is not configured.",
    };
  }

  try {
    const nodemailerModule = await import("nodemailer");
    const nodemailer = nodemailerModule.default || nodemailerModule;

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
    });

    await transporter.sendMail({
      from,
      to,
      subject,
      text,
      html,
    });

    return {
      success: true,
      status: "sent",
      message: "Email sent successfully.",
    };
  } catch (error) {
    return {
      success: false,
      status: "failed",
      message: error.message || "Failed to send email.",
    };
  }
}
