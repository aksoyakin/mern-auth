import {verifyToken} from "../utils/AuthUtils.js";
import {MESSAGES} from "../constants/Messages.js";

const userTokenMiddleware = async (req, res, next) => {
    const {token} = req.cookies;
    if (!token) {
        return res.status(401).json({ success: false, error: MESSAGES.NOT_AUTHORIZED });
    }
    try {
        const tokenDecode = verifyToken(token, process.env.JWT_SECRET);
        if (tokenDecode.id) {
            req.body.userId = tokenDecode.id;
        } else {
            return res.json({success: false, error: MESSAGES.NOT_AUTHORIZED});
        }
        next();
    } catch (error) {
        res.json({success: false, error: MESSAGES.NOT_AUTHORIZED});
    }
}

export default userTokenMiddleware;