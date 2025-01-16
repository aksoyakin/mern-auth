import {createUser, findUserByEmail} from "./UserService.js";
import {MESSAGES} from "../constants/Messages.js";
import {createToken} from "../utils/TokenUtils.js";

export const registerUser = async (name, email, password) => {
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
        throw new Error(MESSAGES.USER_EXISTS);
    }
    const user = await createUser(name, email, password);
    const token = createToken(user._id);
    return {user, token};
}