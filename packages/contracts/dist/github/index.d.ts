import { z } from "zod";
export interface CreatePullRequestContract {
    repository: string;
    branchName: string;
    title: string;
    body: string;
}
export declare const createPullRequestContractSchema: z.ZodObject<{
    repository: z.ZodString;
    branchName: z.ZodString;
    title: z.ZodString;
    body: z.ZodString;
}, "strip", z.ZodTypeAny, {
    title: string;
    repository: string;
    branchName: string;
    body: string;
}, {
    title: string;
    repository: string;
    branchName: string;
    body: string;
}>;
//# sourceMappingURL=index.d.ts.map