import nodemailer from 'nodemailer';
import { ENV } from '../config/env';

export const sendPasswordResetEmail = async (
  email: string,
  resetToken: string,
  userName: string
): Promise<{ success: boolean; resetUrl: string }> => {
  const resetUrl = `${ENV.CLIENT_URL}/reset-password?token=${resetToken}`;

  
  console.log(`PASSWORD RESET REQUEST For: ${email} (${userName})`);
  console.log(`Reset URL: ${resetUrl}`);
  console.log(`Reset Token: ${resetToken}`);
  

  if (!ENV.EMAIL_HOST || !ENV.EMAIL_USER || !ENV.EMAIL_PASS) {
    return { success: true, resetUrl };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: ENV.EMAIL_HOST,
      port: ENV.EMAIL_PORT,
      secure: ENV.EMAIL_PORT === 465,
      auth: {
        user: ENV.EMAIL_USER,
        pass: ENV.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: ENV.EMAIL_FROM,
      to: email,
      subject: 'Reset Your Password - Task Management',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #09090b; color: #f4f4f5; border-radius: 16px; border: 1px solid #27272a;">
          <h2 style="color: #6366f1; margin-top: 0;">Task Management</h2>
          <p style="font-size: 16px; color: #e4e4e7;">Hi ${userName},</p>
          <p style="font-size: 14px; line-height: 1.6; color: #a1a1aa;">
            You requested to reset your password. Click the button below to set a new password. This link is valid for 1 hour.
          </p>
          <div style="margin: 28px 0; text-align: center;">
            <a href="${resetUrl}" style="background: #4f46e5; color: #ffffff; text-decoration: none; padding: 12px 28px; font-weight: 600; border-radius: 10px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p style="font-size: 12px; color: #71717a;">
            If you did not request a password reset, you can safely ignore this email.
          </p>
          <p style="font-size: 12px; color: #52525b; border-top: 1px solid #27272a; padding-top: 16px; word-break: break-all;">
            Direct link: <a href="${resetUrl}" style="color: #818cf8;">${resetUrl}</a>
          </p>
        </div>
      `,
    });

    return { success: true, resetUrl };
  } catch (error) {
    console.error('Error sending password reset email via SMTP:', error);
    return { success: true, resetUrl };
  }
};
