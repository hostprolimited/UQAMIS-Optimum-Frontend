export function setInputsError(errors, form) {
    if (Array.isArray(errors)) {
        errors.forEach((err) => {
            form.setError(err.field, {
                type: "manual",
                message: err.error,
            });
        });
    }
}

export const formatPadTime = (time: string) => {
    const [hour, minute] = time.split(":").map(Number);
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
};