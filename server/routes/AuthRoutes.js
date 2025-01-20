import express from "express";
import {
    isAuthenticated,
    login,
    logout,
    register, resetPassword,
    sendResetPasswordOtp,
    sendVerificationOtp,
    verifyEmail
} from "../controllers/AuthController.js";
import userTokenMiddleware from "../middleware/UserTokenMiddleware.js";

const authRouter = express.Router();
authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/logout', logout);
authRouter.post('/send-verify-otp', userTokenMiddleware, sendVerificationOtp);
authRouter.post('/verify-account', userTokenMiddleware, verifyEmail);
authRouter.get('/is-auth', userTokenMiddleware, isAuthenticated);
authRouter.post('/send-reset-otp', sendResetPasswordOtp);
authRouter.post('/reset-password', resetPassword);

export default authRouter;