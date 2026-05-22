const nodemailer = require("nodemailer");

// Gracefully disabled if SMTP credentials are not configured
const isConfigured = !!(process.env.SMTP_USER && process.env.SMTP_PASS);

const transporter = isConfigured
    ? nodemailer.createTransport({
          service: "gmail",
          auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS, // Gmail App Password (not your real password)
          },
      })
    : null;

async function sendMail({ to, subject, html }) {
    if (!transporter) return; // silently skip if not configured
    try {
        await transporter.sendMail({
            from: `"Tindahan 🛖" <${process.env.SMTP_USER}>`,
            to,
            subject,
            html,
        });
    } catch (err) {
        console.error("Mail error:", err.message);
    }
}

module.exports = { sendMail };
