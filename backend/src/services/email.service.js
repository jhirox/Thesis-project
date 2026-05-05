import dns from "node:dns";

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
    dns.setDefaultResultOrder("ipv4first");
    const [ipv4Host] = await dns.promises.resolve4(host);
    const smtpHost = ipv4Host || host;

    const nodemailerModule = await import("nodemailer");
    const nodemailer = nodemailerModule.default || nodemailerModule;

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port,
      family: 4,
      secure: port === 465,
      connectionTimeout: Number(process.env.SMTP_CONNECTION_TIMEOUT_MS || 8000),
      greetingTimeout: Number(process.env.SMTP_GREETING_TIMEOUT_MS || 8000),
      socketTimeout: Number(process.env.SMTP_SOCKET_TIMEOUT_MS || 10000),
      requireTLS: port === 587,
      tls: {
        servername: host,
      },
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
