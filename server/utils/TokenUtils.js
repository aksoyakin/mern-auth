import jwt from 'jsonwebtoken';
import bcrypt from "bcryptjs";

export const createToken = async (userId) => {
    return jwt.sign({id: userId}, process.env.JWT_SECRET, {expiresIn: '7d'});
}

export const comparePasswords = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
}