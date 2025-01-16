import {MESSAGES} from "../constants/Messages.js";

export const validateFields = (...fields) => {
    return fields.every((field) => field && field.trim() !== "");
}

export const validateEmailVerificationRequest = (userId, otp) => {
    if (!userId || !otp) {
        throw new Error(MESSAGES.MISSING_DETAILS)
    }
};