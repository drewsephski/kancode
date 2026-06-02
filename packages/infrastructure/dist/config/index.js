import { getEnv } from "@kancode/shared";
export const loadAppConfig = () => ({
    databaseUrl: process.env.DATABASE_URL,
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    triggerSecretKey: process.env.TRIGGER_SECRET_KEY,
});
export const requireDatabaseUrl = () => getEnv("DATABASE_URL");
//# sourceMappingURL=index.js.map