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
    let smtpHost = host;

    try {
      const [ipv4Host] = await dns.promises.resolve4(host);
      smtpHost = ipv4Host || host;
    } catch {
      const lookupResult = await dns.promises.lookup(host, { family: 4 });
      smtpHost = lookupResult?.address || host;
    }

    const nodemailerModule = await import("nodemailer");
    const nodemailer = nodemailerModule.default || nodemailerModule;
    const portsToTry = Array.from(new Set([
      port,
      ...(host === "smtp.gmail.com" && port !== 465 ? [465] : []),
    ]));
    const errors = [];

    for (const smtpPort of portsToTry) {
      try {
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: smtpPort,
          family: 4,
          secure: smtpPort === 465,
          connectionTimeout: Number(process.env.SMTP_CONNECTION_TIMEOUT_MS || 8000),
          greetingTimeout: Number(process.env.SMTP_GREETING_TIMEOUT_MS || 8000),
          socketTimeout: Number(process.env.SMTP_SOCKET_TIMEOUT_MS || 10000),
          requireTLS: smtpPort === 587,
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
          message: `Email sent successfully via SMTP port ${smtpPort}.`,
        };
      } catch (error) {
        errors.push(`port ${smtpPort}: ${error.message || "Failed to send email."}`);
      }
    }

    return {
      success: false,
      status: "failed",
      message: `SMTP delivery failed after ${portsToTry.length} attempt(s): ${errors.join(" | ")}. If this is hosted on Railway, outbound SMTP to Gmail may be blocked or timing out from the deployment network.`,
    };
  } catch (error) {
    return {
      success: false,
      status: "failed",
      message: error.message || "Failed to send email.",
    };
  }
}
