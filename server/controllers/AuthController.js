import {
    validateEmailVerificationRequest,
    validateFields, validateVerifyAccountOtp, validateResetOtp,
    validateResetOtpRequest,
    validateResetPasswordRequest
} from "../utils/ValidationUtils.js";
import {MESSAGES} from "../constants/Messages.js";
import {loginUser, registerUser, generateVerificationOtp} from "../services/AuthService.js";
import {clearCookie, setCookie} from "../utils/CookieUtils.js";
import {sendAccountVerificationEmail, sendPasswordResetEmail, sendWelcomeEmail} from "../services/MailService.js";
import {
    findUserByEmail,
    findUserById,
    markUserAsVerified, updateUserNewPassword,
    updateUserResetPasswordOtp
} from "../services/UserService.js";

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
        validateVerifyAccountOtp(user, otp);
        await markUserAsVerified(user);
        res.json({success: true, message: MESSAGES.EMAIL_VERIFIED});
    } catch (error) {
        return res.json({success: false, message: error.message});
    }
}

export const isAuthenticated = async (req, res) => {
    try {
        return res.json({success: true})
    } catch (error) {
        res.json({success: false, message: error.message});
    }
}

export const sendResetPasswordOtp = async (req, res) => {
    const {email} = req.body;
    try {
        validateResetOtpRequest(email);
        const user = await findUserByEmail(email);
        const otp = await updateUserResetPasswordOtp(user);
        await sendPasswordResetEmail(email, otp);
        res.json({success: true, message: MESSAGES.OTP_SENT});
    } catch (error) {
        res.json({success: false, message: error.message});
    }
}

export const resetPassword = async (req, res) => {
    const {email, otp, newPassword} = req.body;
    try {
        validateResetPasswordRequest(email, otp, newPassword);
        const user = await findUserByEmail(email);
        validateResetOtp(user, otp)
        await updateUserNewPassword(user, newPassword);
        res.json({success: true, message: MESSAGES.PASSWORD_RESET_SUCCESS});
    } catch (error) {
        res.json({success: false, message: error.message});
    }
}
