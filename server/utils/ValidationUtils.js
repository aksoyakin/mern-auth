export const validateFields = (...fields) => {
    return fields.every((field) => field && field.trim() !== "");
}