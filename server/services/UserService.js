import userModel from "../models/UserModel.js";
import {hashPassword} from "../utils/PasswordUtils.js";

export const findUserByEmail = async (email) => {
     return userModel.findOne({email});
}

export const createUser = async (name, email, password) => {
    const hashedPassword = await hashPassword(password);
    const user = new userModel({name, email, password: hashedPassword});
    return await user.save();
}

export const findUserById = async (userId) => {
    return userModel.findById(userId);
}

export const updateUserOtp = async (userId, otp, expiryTime) => {
    return userModel.findByIdAndUpdate(
        userId,
        {verifyOtp: otp, verifyOtpExpiredAt: expiryTime},
        {new: true}
    );
}