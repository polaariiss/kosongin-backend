import nodemailer from 'nodemailer';
import { Resend } from 'resend';

const isDev = process.env.NODE_ENV === 'development';

// ==============================
// Setup transporter sesuai env
// ==============================
const getTransporter = async () => {
  if (isDev) {
    // Ethereal: auto generate akun testing
    const testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }
};

// ==============================
// Fungsi kirim email
// ==============================
export const sendResetPasswordEmail = async (
  toEmail: string,
  resetToken: string,
) => {
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  const html = `
    <h2>Reset Password</h2>
    <p>Klik link berikut untuk mereset password kamu:</p>
    <a href="${resetLink}">${resetLink}</a>
    <p>Link ini berlaku selama <strong>1 jam</strong>.</p>
    <p>Jika kamu tidak merasa meminta reset password, abaikan email ini.</p>
  `;

  if (isDev) {
    // Kirim via Ethereal (tidak benar-benar terkirim, tapi bisa dipreview)
    const transporter = await getTransporter();
    const info = await transporter!.sendMail({
      from: '"App Name" <no-reply@app.com>',
      to: toEmail,
      subject: 'Reset Password',
      html,
    });

    // Log URL preview emailnya di terminal
    console.log('📧 Preview email:', nodemailer.getTestMessageUrl(info));
  } else {
    // Kirim via Resend (production)
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: 'App Name <no-reply@domainmu.com>',
      to: toEmail,
      subject: 'Reset Password',
      html,
    });
  }
};
