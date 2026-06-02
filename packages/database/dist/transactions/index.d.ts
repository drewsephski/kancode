import type { UnitOfWork } from "@kancode/application";
export declare class DatabaseUnitOfWork implements UnitOfWork {
    run<T>(work: () => Promise<T>): Promise<T>;
}
//# sourceMappingURL=index.d.ts.map