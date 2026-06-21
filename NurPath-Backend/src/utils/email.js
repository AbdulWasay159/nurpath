const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendPasswordResetEmail = async (to, name, resetUrl) => {
  await resend.emails.send({
    from: process.env.EMAIL_FROM || 'NurPath <onboarding@resend.dev>',
    to,
    subject: 'Reset your NurPath password',
    html: `
      <div style="background:#080D13;padding:40px 20px;font-family:'DM Sans',Arial,sans-serif;">
        <div style="max-width:480px;margin:0 auto;background:#0F1620;border:1px solid rgba(201,168,76,0.18);border-radius:20px;overflow:hidden;">
          <div style="background:rgba(201,168,76,0.08);padding:28px;text-align:center;border-bottom:1px solid rgba(201,168,76,0.12);">
            <div style="font-size:36px;margin-bottom:8px;">☽</div>
            <div style="color:#C9A84C;font-size:22px;font-weight:600;">NurPath</div>
          </div>
          <div style="padding:32px 28px;">
            <p style="color:#EDE8D8;font-size:15px;margin:0 0 16px;">Assalamualaikum ${name || ''},</p>
            <p style="color:#9CA8BD;font-size:14px;line-height:1.6;margin:0 0 24px;">
              We received a request to reset your NurPath password. Click the button below to choose a new one.
              This link expires in <strong style="color:#C9A84C;">1 hour</strong>.
            </p>
            <div style="text-align:center;margin:28px 0;">
              <a href="${resetUrl}" style="background:linear-gradient(135deg,#C9A84C 0%,#A8782A 100%);color:#1A1000;text-decoration:none;font-weight:600;font-size:15px;padding:14px 32px;border-radius:12px;display:inline-block;">
                Reset Password
              </a>
            </div>
            <p style="color:#3A4A60;font-size:12px;line-height:1.6;margin:24px 0 0;">
              If you didn't request this, you can safely ignore this email — your password will remain unchanged.
              If the button doesn't work, copy this link into your browser:<br/>
              <span style="color:#7A8FA8;word-break:break-all;">${resetUrl}</span>
            </p>
          </div>
        </div>
        <p style="text-align:center;color:#3A4A60;font-size:11px;margin-top:20px;">© NurPath — نور الطريق</p>
      </div>
    `,
  });
};

module.exports = { sendPasswordResetEmail };
