import { z } from "zod";
export const createPullRequestContractSchema = z.object({
    repository: z.string(),
    branchName: z.string(),
    title: z.string(),
    body: z.string(),
});
//# sourceMappingURL=index.js.map