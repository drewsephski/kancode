export interface AppConfig {
    databaseUrl: string | undefined;
    supabaseUrl: string | undefined;
    supabaseServiceRoleKey: string | undefined;
    triggerSecretKey: string | undefined;
}
export declare const loadAppConfig: () => AppConfig;
export declare const requireDatabaseUrl: () => string;
//# sourceMappingURL=index.d.ts.map