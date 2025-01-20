import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';

export const createToken = (userId) => {
    return jwt.sign({id: userId}, process.env.JWT_SECRET, {expiresIn: '7d'});
}

export const verifyToken = (token, jwtSecret) => {
    return jwt.verify(token, jwtSecret);
}

export const comparePasswords = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
}

export const hashPassword = async (password) => {
    return await bcrypt.hash(password, 10);
}