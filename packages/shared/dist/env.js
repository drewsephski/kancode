export const getEnv = (name) => {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing environment variable: ${name}`);
    }
    return value;
};
export const getOptionalEnv = (name) => process.env[name];
export const parseEnvInt = (name, fallback) => {
    const value = process.env[name];
    if (value === undefined || value === "") {
        if (fallback !== undefined) {
            return fallback;
        }
        throw new Error(`Missing environment variable: ${name}`);
    }
    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed)) {
        throw new Error(`Environment variable ${name} must be an integer`);
    }
    return parsed;
};
export const parseEnvBoolean = (name, fallback = false) => {
    const value = process.env[name];
    if (value === undefined || value === "") {
        return fallback;
    }
    return value === "true" || value === "1";
};
//# sourceMappingURL=env.js.map