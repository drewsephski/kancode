export const getEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
};

export const getOptionalEnv = (name: string): string | undefined => process.env[name];

export const parseEnvInt = (name: string, fallback?: number): number => {
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

export const parseEnvBoolean = (name: string, fallback = false): boolean => {
  const value = process.env[name];
  if (value === undefined || value === "") {
    return fallback;
  }

  return value === "true" || value === "1";
};
