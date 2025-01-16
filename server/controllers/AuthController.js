import bcrypt from "bcryptjs";
import userModel from "../models/UserModel.js";
import transporter from "../config/NodeMailer.js";
import {PASSWORD_RESET_TEMPLATE} from "../config/EmailTemplates.js";
import {validateEmailVerificationRequest, validateFields} from "../utils/ValidationUtils.js";
import {MESSAGES} from "../constants/Messages.js";
import {loginUser, registerUser, generateVerificationOtp} from "../services/AuthService.js";
import {clearCookie, setCookie} from "../utils/CookieUtils.js";
import {sendAccountVerificationEmail, sendWelcomeEmail} from "../services/MailService.js";
import {findUserById, markUserAsVerified} from "../services/UserService.js";
import {validateOtp} from "../services/OtpService.js";

export const register = async (req, res) => {
    const {name, email, password} = req.body;
    if (!validateFields(name, email, password)) {
        return res.status(400).json({success: false, message: MESSAGES.MISSING_DETAILS});
    }
    try {
        const {token} = await registerUser(name, email, password);
        setCookie(res, token);
        await sendWelcomeEmail(email);
        res.status(201).json({success: true, message: MESSAGES.REGISTRATION_SUCCESS});
    } catch (error) {
        res.json({success: false, message: error.message});
    }
}

export const login = async (req, res) => {
    const {email, password} = req.body;
    if (!validateFields(email, password)) {
        return res.status(400).json({success: false, message: MESSAGES.MISSING_DETAILS});
    }
    try {
        const {token} = await loginUser(email, password);
        setCookie(res, token);
        res.status(200).json({success: true, message: MESSAGES.LOGIN_SUCCESS});
    } catch (error) {
        res.json({success: false, message: error.message});
    }
}

export const logout = async (req, res) => {
    try {
        await clearCookie(res);
        return res.status(200).json({success: true, message: MESSAGES.LOGOUT_SUCCESS});
    } catch (error) {
        return res.json({success: false, message: error.message});
    }
}

export const sendVerificationOtp = async (req, res) => {
    try {
        const {userId} = req.body;
        const otp = await generateVerificationOtp(userId);
        const user = await findUserById(userId);
        await sendAccountVerificationEmail(user.email, otp);
        return res.status(200).json({
            success: true,
            message: MESSAGES.OTP_SENT
        });
    } catch (error) {
        return res.json({success: false, message: error.message});
    }
}

export const verifyEmail = async (req, res) => {
    const {userId, otp} = req.body;
    try {
        validateEmailVerificationRequest(userId, otp);
        const user = await findUserById(userId);
        validateOtp(user, otp);
        await markUserAsVerified(user);
        res.json({success: true, message: MESSAGES.EMAIL_VERIFIED});
    } catch (error) {
        return res.json({success: false, message: error.message});
    }
}

// check if user is authenticated
export const isAuthenticated = async (req, res) => {
    try {
        return res.json({success: true})
    } catch (error) {
        res.json({success: false, message: error.message});
    }
}

// send password reset otp
export const sendResetOtp = async (req, res) => {
    const {email} = req.body;

    if (!email) {
        return res.json({success: false, message: 'Email is required!'})
    }

    try {
        const user = await userModel.findOne({email});
        if(!user){
            return res.json({success: false, message: 'User not found!'})
        }
        const otp = String(Math.floor(100000 + Math.random () * 900000));

        user.resetOtp = otp;
        user.resetOtpExpiredAt = Date.now() + 15 * 60 * 1000 //15 minutes

        await user.save();

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: "RESET OTP",
            //text: `Your OTP for resetting your password is ${otp} use this OTP to proceed with resetting your password.`,
            html: PASSWORD_RESET_TEMPLATE.replace("{{otp}}", otp).replace("{{email}}", user.email),
        }
        await transporter.sendMail(mailOptions)
        return res.json({success: true, message: 'OTP sent to your email.'})

    } catch (error) {
        return res.json({success: false, message: error.message});
    }
}

// reset user password
export const resetPassword = async (req, res) => {
    const {email, otp, newPassword} = req.body;
    if (!email || !otp || !newPassword) {
        return res.json({success: false, message: 'Email, OTP and new password are required!'})
    }

    try {
        const user = await userModel.findOne({email});

        if (!user) {
            return res.json({success: false, message: 'User not found!'})
        }

        if(user.resetOtp === "" || user.resetOtp !== otp){
            return res.json({success: false, message: "Invalid OTP"});
        }

        if(user.resetOtpExpiredAt < Date.now()) {
            return res.json({success: false, message: 'OTP Expired!'})
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;
        user.resetOtp = "";
        user.resetOtpExpiredAt = 0;

        await user.save();

        return res.json({success: true, message: "Password has been reset successfully."})
    } catch (error) {
        return res.json({success: false, message: error.message});
    }
}