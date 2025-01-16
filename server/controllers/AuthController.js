import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "../models/UserModel.js";
import transporter from "../config/NodeMailer.js";
import {EMAIL_VERIFY_TEMPLATE, PASSWORD_RESET_TEMPLATE} from "../config/EmailTemplates.js";
import {validateFields} from "../utils/ValidationUtils.js";
import {MESSAGES} from "../constants/Messages.js";
import {registerUser} from "../services/AuthService.js";
import {setCookie} from "../utils/CookieUtils.js";
import {sendWelcomeEmail} from "../services/MailService.js";

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
    if (!email || !password) {
        return res.json({success: false, message: 'Email and password are required!'});
    }
    try {
        const user = await userModel.findOne({email});
        if(!user){
            return res.json({success: false, message: 'User does not exist or invalid email!'})
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.json({success: false, message: 'Invalid password!'})
        }
        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: '7d'});

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        })
        return res.json({success: true, message: 'User logged in successfully!'})
    } catch (error) {
        return res.json({success: false, message: error.message});
    }
}

export const logout = async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        });
        return res.json({success: true, message: 'User logged out successfully'})
    } catch (error) {
        return res.json({success: false, message: error.message});
    }
}

export const sendVerifyOtp = async (req, res) => {
    try {
        const {userId} = req.body;
        const user = await userModel.findById(userId);
        if (user.isAccountVerified) {
            return res.json({success: false, message: 'Account already verified.'})
        }
        const otp = String(Math.floor(100000 + Math.random () * 900000));
        user.verifyOtp = otp;
        user.verifyOtpExpiredAt = Date.now() + 24 * 60 * 60 * 1000;
        await user.save();
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: "Account Verification OTP",
            //text: `Your OTP is ${otp}. Verify your account using this OTP.`,
            html: EMAIL_VERIFY_TEMPLATE.replace("{{otp}}", otp).replace("{{email}}", user.email),
        }
        await transporter.sendMail(mailOptions);

        res.json({success: true, message: 'Verification OTP sent on email.'})
    } catch (error) {
       res.json({success: false, message: 'Verify Otp!'})
    }
}

// verify email using otp
export const verifyEmail = async (req, res) => {
    const {userId, otp} = req.body;

    if (!userId || !otp) {
        return res.json({success: false, message: 'Missing details!'})
    }

    try {
        const user = await userModel.findById(userId);
        if (!user) {
            return res.json({success: false, message: 'User not found!'})
        }
        if (user.verifyOtp === "" || user.verifyOtp !== otp){
            return res.json({success: false, message: 'Invalid verification otp!'})
        }
        if (user.verifyOtpExpiredAt < Date.now()) {
            return res.json({success: false, message: 'OTP Expired!'})
        }
        user.isAccountVerified = true;
        user.verifyOtp = "";
        user.verifyOtpExpiredAt = 0;

        await user.save();
        return res.json({success: true, message: 'Email verified successfully.'})

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