// interface PasswordResetEmail {
//   email: string;
//   name: string;
//   resetUrl: string;
// }

// export async function sendPasswordResetEmail(message: PasswordResetEmail) {
//   /*
//    * Development transport.
//    *
//    * Replace this with the
//    * production email provider
//    * before deployment.
//    */
//   console.log('\n================================');

//   console.log('DEVSANGAM PASSWORD RESET');

//   console.log('To:', message.email);

//   console.log('User:', message.name);

//   console.log('Reset URL:', message.resetUrl);

//   console.log('================================\n');
// }
import nodemailer, { type Transporter } from 'nodemailer';

interface PasswordResetEmailInput {
  email: string;
  name: string;
  resetUrl: string;
}

let transporter: Transporter | null = null;

function getTransporter() {
  if (transporter) {
    return transporter;
  }

  const user = process.env.GMAIL_USER;

  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    throw new Error('Gmail email configuration is incomplete.');
  }

  transporter = nodemailer.createTransport({
    service: 'gmail',

    auth: {
      user,
      pass,
    },
  });

  return transporter;
}

export async function verifyEmailTransport() {
  const mailer = getTransporter();

  await mailer.verify();
}

export async function sendPasswordResetEmail({
  email,
  name,
  resetUrl,
}: PasswordResetEmailInput) {
  const mailer = getTransporter();

  const gmailUser = process.env.GMAIL_USER;

  if (!gmailUser) {
    throw new Error('GMAIL_USER is not configured.');
  }

  const fromName = process.env.EMAIL_FROM_NAME ?? 'DevSangam';

  const subject = 'Reset your DevSangam password';

  const text = `
Namaste ${name},

We received a request to reset your DevSangam password.

Reset your password using this link:

${resetUrl}

This link expires in 15 minutes.

If you did not request this password reset, you can safely ignore this email.

DevSangam
Chant. Connect. Transform.
  `.trim();

  const html = `
<!doctype html>

<html>
  <body
    style="
      margin: 0;
      padding: 0;
      background: #0c0d12;
      font-family: Arial, sans-serif;
      color: #f8fafc;
    "
  >
    <table
      width="100%"
      cellspacing="0"
      cellpadding="0"
      style="
        background: #0c0d12;
        padding: 40px 16px;
      "
    >
      <tr>
        <td align="center">

          <table
            width="100%"
            cellspacing="0"
            cellpadding="0"
            style="
              max-width: 560px;
              background: #161922;
              border: 1px solid #2e3648;
              border-radius: 18px;
            "
          >
            <tr>
              <td
                style="
                  padding: 38px 32px;
                  text-align: center;
                "
              >

                <div
                  style="
                    margin-bottom: 8px;
                    color: #f59e0b;
                    font-size: 36px;
                  "
                >
                  ॐ
                </div>

                <div
                  style="
                    color: #e5c07b;
                    font-size: 28px;
                    font-weight: 600;
                  "
                >
                  DevSangam
                </div>

                <div
                  style="
                    margin-top: 7px;
                    color: #d4af37;
                    font-size: 12px;
                  "
                >
                  Chant. Connect. Transform.
                </div>

                <div
                  style="
                    height: 1px;
                    margin: 28px 0;
                    background: #2e3648;
                  "
                ></div>

                <h1
                  style="
                    margin: 0;
                    color: #f8fafc;
                    font-size: 22px;
                  "
                >
                  Reset your password
                </h1>

                <p
                  style="
                    margin: 20px 0 0;
                    color: #94a3b8;
                    font-size: 14px;
                    line-height: 1.7;
                  "
                >
                  Namaste ${name},
                  <br /><br />

                  We received a request
                  to reset the password
                  for your DevSangam
                  account.
                </p>

                <div
                  style="
                    margin: 30px 0;
                  "
                >
                  <a
                    href="${resetUrl}"
                    style="
                      display: inline-block;
                      padding: 14px 28px;
                      border-radius: 8px;
                      background: #f59e0b;
                      color: #0c0d12;
                      font-size: 14px;
                      font-weight: 700;
                      text-decoration: none;
                    "
                  >
                    Reset Password
                  </a>
                </div>

                <p
                  style="
                    color: #94a3b8;
                    font-size: 13px;
                    line-height: 1.7;
                  "
                >
                  This link expires in
                  15 minutes.
                </p>

                <p
                  style="
                    color: #64748b;
                    font-size: 12px;
                    line-height: 1.7;
                  "
                >
                  If you didn't request
                  this password reset,
                  you can safely ignore
                  this email.
                </p>

              </td>
            </tr>
          </table>

        </td>
      </tr>
    </table>
  </body>
</html>
  `.trim();

  const info = await mailer.sendMail({
    from: {
      name: fromName,

      address: gmailUser,
    },

    to: email,

    subject,

    text,

    html,
  });

  console.log(`✓ Password reset email sent: ${info.messageId}`);
}
