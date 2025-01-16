export const generateSixDigitOtp = () => {
    return String(Math.floor(100000 + Math.random() * 900000));
}