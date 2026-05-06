import dns from "node:dns";

function getEmailProviderConfig() {
  const resendApiKey = process.env.RESEND_API_KEY;
  const resendFrom = process.env.RESEND_FROM;
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || user;

  return {
    resendConfigured: Boolean(resendApiKey && resendFrom),
    resendApiKey,
    resendFrom,
    smtpConfigured: Boolean(host && user && pass && from),
    host,
    user,
    pass,
    from,
  };
}

export function isEmailDeliveryConfigured() {
  const config = getEmailProviderConfig();
  return config.resendConfigured || config.smtpConfigured;
}

async function sendWithResend({ to, subject, text, html, config }) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: config.resendFrom,
      to,
      subject,
      text,
      html,
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = data?.message || data?.error?.message || response.statusText || "Resend delivery failed.";
    throw new Error(message);
  }

  return {
    success: true,
    status: "sent",
    message: `Email sent successfully via Resend${data?.id ? ` (${data.id})` : ""}.`,
  };
}

export async function sendEmail({ to, subject, text, html }) {
  const config = getEmailProviderConfig();
  const host = config.host;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = config.user;
  const pass = config.pass;
  const from = config.from;

  if (config.resendApiKey && !config.resendFrom) {
    return {
      success: false,
      status: "skipped",
      message: "Resend is missing RESEND_FROM.",
    };
  }

  if (config.resendConfigured) {
    try {
      return await sendWithResend({ to, subject, text, html, config });
    } catch (error) {
      return {
        success: false,
        status: "failed",
        message: error.message || "Resend delivery failed.",
      };
    }
  }

  if (!config.smtpConfigured) {
    return {
      success: false,
      status: "skipped",
      message: "Email delivery is not configured.",
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
