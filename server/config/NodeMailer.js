import nodemailer from 'nodemailer';

/*
 * Apple Icloud
const transporter = nodemailer.createTransport({
    host: 'smtp.mail.me.com',
    port: 587,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});
*/

// Hostinger Mail
const transporter = nodemailer.createTransport({
    host: 'smtp.hostinger.com',
    port: 465,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

export default transporter;