import { createTransport } from "nodemailer";

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

/**
 * Generic mail sender. `html` is sent as-is, so escape any dynamic values
 * (see `escapeHtml`) before interpolating them into it.
 */
export const sendEmail = async (
  to: string,
  subject: string,
  text: string,
  html?: string,
) => {
  const config = useRuntimeConfig();

  const transporter = createTransport({
    auth: {
      pass: config.mailPass,
      user: config.mailUser,
    },
    host: config.mailHost,
    port: Number(config.mailPort),
  });

  await transporter.sendMail({
    from: config.mailFrom,
    html,
    subject,
    text,
    to,
  });
};

/**
 * Builds the absolute verification link from EMAIL_VERIFICATION_DOMAIN.
 * Throws if the domain is not configured as an absolute URL.
 */
export const buildVerificationLink = (rawToken: string) => {
  const config = useRuntimeConfig();

  let url: URL;

  try {
    url = new URL("/verify-email", config.emailVerificationDomain);
  } catch {
    throw new Error(
      "NUXT_EMAIL_VERIFICATION_DOMAIN must be an absolute URL, e.g. https://app.example.com",
    );
  }

  url.searchParams.set("token", rawToken);

  return url.toString();
};

export const sendVerificationEmail = async (to: string, link: string) => {
  const safeLink = escapeHtml(link);

  const html = `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8">
      <meta http-equiv="x-ua-compatible" content="ie=edge">
      <title>Email Confirmation</title>
      <style>
        body {
          background-color: #e9ecef;
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
        }
        table {
          border-collapse: collapse;
          width: 100%;
          max-width: 600px;
          margin: auto;
          background: #ffffff;
          border-top: 3px solid #d4dadf;
        }
        h2 {
          font-size: 32px;
          font-weight: 700;
          text-align: center;
          padding: 36px 24px 0;
        }
        p {
          font-size: 16px;
          line-height: 24px;
          padding: 24px;
          text-align: center;
        }
        .button-container {
          text-align: center;
          padding: 12px;
        }
        .button {
          background-color: #1a82e2;
          color: #ffffff;
          padding: 16px 36px;
          text-decoration: none;
          display: inline-block;
          border-radius: 6px;
          font-size: 16px;
        }
      </style>
    </head>
    <body>
      <table>
        <tr>
          <td>
            <h2>Confirm Your Email Address</h2>
            <p>Please verify your email address by clicking the button below.</p>
            <div class="button-container">
              <a href="${safeLink}" class="button" target="_blank">Verify My Email</a>
            </div>
            <p>If the button does not work, please use the following link to verify your email:</p>
            <p><a href="${safeLink}">${safeLink}</a></p>
            <p>If you did not request this, please ignore this email.</p>
          </td>
        </tr>
      </table>
    </body>
  </html>
  `;

  await sendEmail(
    to,
    "Verify Your Email Address",
    `Verify your email address: ${link}`,
    html,
  );
};

export { escapeHtml };
