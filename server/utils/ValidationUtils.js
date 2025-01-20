import {MESSAGES} from "../constants/Messages.js";

export const validateFields = (...fields) => {
    return fields.every((field) => field && field.trim() !== "");
};

export const validateEmailVerificationRequest = (userId, otp) => {
    if (!userId || !otp) {
        throw new Error(MESSAGES.MISSING_DETAILS)
    }
};

export const validateVerifyAccountOtp = (user, otp) => {
    if (!user.verifyOtp || user.verifyOtp !== otp) {
        throw new Error(MESSAGES.OTP_INVALID);
    }
    if (user.verifyOtpExpiredAt < Date.now()) {
        throw new Error(MESSAGES.OTP_EXPIRED);
    }
};

export const validateResetOtpRequest = (email) => {
    if (!email) {
        throw new Error(MESSAGES.EMAIL_REQUIRED);
    }
};

export const validateResetPasswordRequest = (email, otp, newPassword) => {
    if (!email || !otp || !newPassword) {
        throw new Error(MESSAGES.MISSING_DETAILS)
    }
};

export const validateResetOtp = (user, otp) => {
    if (!user.resetOtp || user.resetOtp !== otp) {
        throw new Error(MESSAGES.OTP_INVALID);
    }
    if (user.resetOtpExpiredAt < Date.now()) {
        throw new Error(MESSAGES.OTP_EXPIRED);
    }
};