import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();
console.log({
  host: process.env.EMAIL_SERVICE_HOST,
  user: process.env.EMAIL_SERVICE_USER,
  pass: process.env.EMAIL_SERVICE_PASSWORD,
});
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVICE_HOST,
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_SERVICE_USER,
    pass: process.env.EMAIL_SERVICE_PASSWORD,
  },
});

/**
 * Send email to client
 * @param {Object} options
 * @param {string} options.to
 * @param {string} options.subject
 * @param {string} options.html
 */
export const sendEmail = async ({ to, customerName, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: `Scents By Jojo <${process.env.EMAIL_SERVICE_USER}>`,
      to,
      subject,
      html,
    });
    console.log("Email sent:", info.messageId);
    console.log(info);
  } catch (err) {
    console.error("Failed to send email:", err);
    throw new Error(err?.message || "Failed to send email");
  }
};
