import nodemailer from "nodemailer";
// import dotenv from dotenv;

export const sendMail = async(to , subject, text)=>{
const transporter = nodemailer.createTransport({
     service: "gmail",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
})
await transporter.sendMail({
        from: process.env.MAIL_USER,
    to,
    subject,
    text,
})
}