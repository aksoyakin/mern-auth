import userModel from "../models/UserModel.js";
import {hashPassword} from "../utils/PasswordUtils.js";
import {MESSAGES} from "../constants/Messages.js";

export const findUserByEmail = async (email) => {
     return userModel.findOne({email});
}

export const createUser = async (name, email, password) => {
    const hashedPassword = await hashPassword(password);
    const user = new userModel({name, email, password: hashedPassword});
    return await user.save();
}

export const findUserById = async (userId) => {
    const user = await userModel.findById(userId);
    if (!user) {
        throw new Error(MESSAGES.USER_NOT_FOUND);
    }
    return user;
};

export const updateUserOtp = async (userId, otp, expiryTime) => {
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