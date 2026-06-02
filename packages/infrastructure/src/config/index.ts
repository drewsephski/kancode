import { getEnv } from "@kancode/shared";

export interface AppConfig {
  databaseUrl: string | undefined;
  supabaseUrl: string | undefined;
  supabaseServiceRoleKey: string | undefined;
  triggerSecretKey: string | undefined;
}

export const loadAppConfig = (): AppConfig => ({
  databaseUrl: process.env.DATABASE_URL,
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  triggerSecretKey: process.env.TRIGGER_SECRET_KEY,
});

export const requireDatabaseUrl = (): string => getEnv("DATABASE_URL");
