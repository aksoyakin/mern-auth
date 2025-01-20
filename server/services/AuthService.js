import {createUser, findUserByEmail, findUserById, updateUserVerifyOtp} from "./UserService.js";
import {MESSAGES} from "../constants/Messages.js";
import {comparePasswords, createToken} from "../utils/AuthUtils.js";

export const registerUser = async (name, email, password) => {
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
        throw new Error(MESSAGES.USER_EXISTS);
    }
    const user = await createUser(name, email, password);
    const token = createToken(user._id);
    return {user, token};
}

export const loginUser = async (email, password) => {
    const existingUser = await findUserByEmail(email);
    if (!existingUser || !(await comparePasswords(password, existingUser.password))) {
        throw new Error(MESSAGES.INVALID_CREDENTIALS);
    }
    const token = createToken(existingUser._id);
    return {existingUser, token};
}

export const generateExpiryTime = (hours = 24) => {
    return Date.now() + hours * 60 * 60 * 1000;
}
export const generateSixDigitOtp = () => {
    return String(Math.floor(100000 + Math.random() * 900000));
}
export const generateVerificationOtp = async (userId) => {
    const user = await findUserById(userId);
    if (user.isAccountVerified) {throw new Error (MESSAGES.ALREADY_VERIFIED)}
    const otp = generateSixDigitOtp();
    const expiryTime = generateExpiryTime(24);
    await updateUserVerifyOtp(userId, otp, expiryTime);
    return otp;
}
