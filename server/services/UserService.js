import userModel from "../models/UserModel.js";
import {hashPassword} from "../utils/AuthUtils.js";
import {MESSAGES} from "../constants/Messages.js";

import {generateExpiryTime, generateSixDigitOtp} from "./AuthService.js";

export const findUserByEmail = async (email) => {
    const user = await userModel.findOne({email});
/*    if (!user) {
        throw new Error(MESSAGES.USER_NOT_FOUND);
    }*/
    return user;
}

export const findUserById = async (userId) => {
    const user = await userModel.findById(userId);
    if (!user) {
        throw new Error(MESSAGES.USER_NOT_FOUND);
    }
    return user;
};

export const createUser = async (name, email, password) => {
    const hashedPassword = await hashPassword(password);
    const user = new userModel({name, email, password: hashedPassword});
    return await user.save();
}

export const updateUserVerifyOtp = async (userId, otp, expiryTime) => {
    return userModel.findByIdAndUpdate(
        userId,
        {verifyOtp: otp, verifyOtpExpiredAt: expiryTime},
        {new: true}
    );
}

export const markUserAsVerified = async (user) => {
    user.isAccountVerified = true;
    user.verifyOtp = "";
    user.verifyOtpExpiredAt = 0;
    await user.save();
};

export const updateUserResetPasswordOtp = async (user) => {
    const otp = generateSixDigitOtp();
    user.resetOtp = otp;
    user.resetOtpExpiredAt = generateExpiryTime(1);
    await user.save();
    return otp;
}

export const updateUserNewPassword = async(user, newPassword) => {
    const hashedPassword = await hashPassword(newPassword);
    user.password = hashedPassword;
    user.resetOtp = "";
    user.resetOtpExpiredAt = 0;
    await user.save();
}