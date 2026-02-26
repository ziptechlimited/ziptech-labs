import nodemailer, { Transporter } from 'nodemailer';
import { config } from '../config/env';

let transporter: Transporter | null = null;

export const getTransporter = (): Transporter => {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: config.SMTP_HOST,
    port: config.SMTP_PORT,
    secure: config.SMTP_PORT === 465,
    auth: {
      user: config.SMTP_USER,
      pass: config.SMTP_PASS,
    },
  });
  return transporter;
};

export const sendVerificationEmail = async (to: string, token: string): Promise<void> => {
  const verifyUrl = `${config.APP_BASE_URL}/api/auth/verify?token=${encodeURIComponent(token)}`;
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
      <h2 style="color:#111827;">Verify your email</h2>
      <p>Thanks for joining Ziptech Labs! Please confirm your email address to activate your account.</p>
      <p>
        <a href="${verifyUrl}" 
           style="display:inline-block;padding:12px 20px;background:#2563EB;color:#fff;text-decoration:none;border-radius:6px;">
          Verify Email
        </a>
      </p>
      <p>If the button does not work, copy and paste this URL into your browser:</p>
      <p style="word-break:break-all;color:#2563EB">${verifyUrl}</p>
      <p>This link will expire in 24 hours.</p>
    </div>
  `;
  const transporter = getTransporter();
  await transporter.sendMail({
    from: config.EMAIL_FROM,
    to,
    subject: 'Verify your email',
    html,
  });
};

