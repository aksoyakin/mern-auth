import express from "express";
import {
    isAuthenticated,
    login,
    logout,
    register, resetPassword,
    sendResetOtp,
    sendVerifyOtp,
    verifyEmail
} from "../controllers/AuthController.js";
import userAuth from "../middleware/UserAuth.js";

const authRouter = express.Router();
authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/logout', logout);
authRouter.post('/send-verify-otp', userAuth, sendVerifyOtp);
authRouter.post('/verify-account', userAuth, verifyEmail);
authRouter.post('/is-auth', userAuth, isAuthenticated);
authRouter.post('/send-reset-otp', sendResetOtp);
authRouter.post('/reset-password', resetPassword);

export default authRouter;