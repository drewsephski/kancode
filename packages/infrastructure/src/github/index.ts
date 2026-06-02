export interface GitProvider {
  createBranch(input: {
    repository: string;
    baseSha: string;
    branchName: string;
  }): Promise<{ branchSha: string }>;

  createPullRequest(input: {
    repository: string;
    branchName: string;
    title: string;
    body: string;
  }): Promise<{ pullRequestNumber: number; pullRequestUrl: string }>;
}
