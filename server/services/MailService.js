import transporter from "../config/NodeMailer.js";

export const sendEmail = async ({to, subject, html, text}) => {
    try {
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to,
            subject,
            html,
            text,
        }
        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${to}.`)
    } catch (error) {
        console.error(`Failed to send email to ${to}:`, error);
        throw new Error("Failed to send email");
    }
}

export const sendWelcomeEmail = async (email) => {
    const mailSubject = "Welcome to Our Website!"
    const welcomeText = `Welcome to our website. Your account has been created with this email ${email}. Enjoy!`
    await sendEmail({
        to: email,
        subject: mailSubject,
        text: welcomeText,
    })
}