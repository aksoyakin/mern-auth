import express from "express";
import userTokenMiddleware from "../middleware/UserTokenMiddleware.js";
import {getUserData} from "../controllers/UserController.js";

const userRouter = express.Router();
userRouter.get("/data", userTokenMiddleware, getUserData);

export default userRouter;