import { Resend } from "resend";

const fromEmail =
  process.env.RESEND_FROM_EMAIL || "SamuDate <noreply@samudate.com>";

function getResend() {
  if (!process.env.RESEND_API_KEY) {
    return null;
  }
  return new Resend(process.env.RESEND_API_KEY);
}

export async function sendVerificationEmail(email: string, token: string) {
  const resend = getResend();
  if (!resend) {
    console.warn("RESEND_API_KEY not set — skipping verification email");
    return;
  }

  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;

  await resend.emails.send({
    from: fromEmail,
    to: email,
    subject: "Verify your SamuDate email",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <h1 style="font-size: 24px; font-weight: bold; margin-bottom: 16px;">
          Verify your email
        </h1>
        <p style="color: #666; line-height: 1.6; margin-bottom: 24px;">
          Click the button below to verify your email address and complete your SamuDate registration.
        </p>
        <a
          href="${verifyUrl}"
          style="display: inline-block; background: #e07040; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;"
        >
          Verify Email
        </a>
        <p style="color: #999; font-size: 14px; margin-top: 24px;">
          This link expires in 24 hours. If you didn&apos;t create an account, you can safely ignore this email.
        </p>
      </div>
    `,
  });
}
