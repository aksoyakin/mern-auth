import {createUser, findUserByEmail, findUserById, updateUserOtp} from "./UserService.js";
import {MESSAGES} from "../constants/Messages.js";
import {comparePasswords, createToken} from "../utils/TokenUtils.js";
import {generateExpiryTime, generateSixDigitOtp} from "./OtpService.js";

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

export const generateVerificationOtp = async (userId) => {
    const user = await findUserById(userId);
    if (!user) {throw new Error (MESSAGES.USER_NOT_FOUND)}
    if (user.isAccountVerified) {throw new Error (MESSAGES.ALREADY_VERIFIED)}
    const otp = generateSixDigitOtp();
    const expiryTime = generateExpiryTime(24);
    await updateUserOtp(userId, otp, expiryTime);
    return otp;
}
