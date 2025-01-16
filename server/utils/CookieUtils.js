export const setCookie = (res, token) => {
    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "production",
        sameSite: process.env.NODE_ENV !== "production" ? "none" : "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000
    })
}

export const clearCookie = async (res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "production",
        sameSite: process.env.NODE_ENV !== "production" ? "none" : "strict",
    });
}