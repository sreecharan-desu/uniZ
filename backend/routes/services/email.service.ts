import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

if (!EMAIL_USER || !EMAIL_PASS) {
  console.warn("EMAIL_USER or EMAIL_PASS environment variables are not set. Email functionality may not work.");
}

export const sendEmail = async (email: string, subject: string, body: string) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: EMAIL_USER,
    to: email,
    subject,
    html: body,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return { info, success: true };
  } catch (error) {
    console.error("Error sending email:", error);
    return { info: "Error sending email !!", success: false };
  }
};
