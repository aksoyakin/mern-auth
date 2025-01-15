import express from "express";
import cors from "cors";
import 'dotenv/config';
import cookieParser from "cookie-parser";
import connectDB from "./config/MongoDB.js";
import authRouter from "./routes/AuthRoutes.js";
import userRouter from "./routes/UserRoutes.js";

const app = express();
const port = process.env.PORT || 4000;
connectDB();

app.use(express.json());
app.use(cookieParser());
app.use(cors({credentials: true}));

// API Endpoints
app.get("/", (req, res) => {
    res.send("API Working successfully...");
    app.use('/api/auth', authRouter );
    app.use('/api/user', userRouter);
})

app.listen(port, () => {
    console.log(`Server started on PORT: ${port}`);
});
