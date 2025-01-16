import {createUser, findUserByEmail} from "./UserService.js";
import {MESSAGES} from "../constants/Messages.js";
import {comparePasswords, createToken} from "../utils/TokenUtils.js";

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