import {MESSAGES} from "../constants/Messages.js";

export const generateSixDigitOtp = () => {
    return String(Math.floor(100000 + Math.random() * 900000));
}

export const generateExpiryTime = (hours = 24) => {
    return Date.now() + hours * 60 * 60 * 1000;
}

export const validateOtp = (user, otp) => {
    if (!user.verifyOtp || user.verifyOtp !== otp) {
        throw new Error(MESSAGES.OTP_INVALID);
    }
    if (user.verifyOtpExpiredAt < Date.now()) {
        throw new Error(MESSAGES.OTP_EXPIRED);
    }
};