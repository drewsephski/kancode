import { z } from "zod";

export interface CreatePullRequestContract {
  repository: string;
  branchName: string;
  title: string;
  body: string;
}

export const createPullRequestContractSchema = z.object({
  repository: z.string(),
  branchName: z.string(),
  title: z.string(),
  body: z.string(),
});
