export const generateSixDigitOtp = () => {
    return String(Math.floor(100000 + Math.random() * 900000));
}

export const generateExpiryTime = (hours = 24) => {
    return Date.now() + hours * 60 * 60 * 1000;
}

export const isOtpExpired = (expiryTime) => {
    return Date.now() > expiryTime;
};

