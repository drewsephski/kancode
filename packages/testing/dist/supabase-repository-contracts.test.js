import test from "node:test";
import { requestRepositoryTests, workspaceRepositoryTests, workflowRepositoryTests, workflowRunRepositoryTests, taskRepositoryTests, assignmentRepositoryTests, executionSessionRepositoryTests, } from "@kancode/testing";
import { getSupabaseClient } from "@kancode/database";
import { SupabaseRequestRepository, SupabaseWorkspaceRepository, SupabaseWorkflowRepository, SupabaseWorkflowRunRepository, SupabaseTaskRepository, SupabaseAssignmentRepository, SupabaseExecutionSessionRepository, } from "@kancode/database";
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseKey) {
    console.log("Skipping Supabase repository contract tests: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY not set");
    process.exit(0);
}
const supabase = getSupabaseClient();
test("SupabaseRequestRepository", async (t) => {
    const repo = new SupabaseRequestRepository(supabase);
    const tests = requestRepositoryTests(() => repo);
    for (const [name, fn] of Object.entries(tests)) {
        await t.test(name, fn);
    }
});
test("SupabaseWorkspaceRepository", async (t) => {
    const repo = new SupabaseWorkspaceRepository(supabase);
    const tests = workspaceRepositoryTests(() => repo);
    for (const [name, fn] of Object.entries(tests)) {
        await t.test(name, fn);
    }
});
test("SupabaseWorkflowRepository", async (t) => {
    const repo = new SupabaseWorkflowRepository(supabase);
    const tests = workflowRepositoryTests(() => repo);
    for (const [name, fn] of Object.entries(tests)) {
        await t.test(name, fn);
    }
});
test("SupabaseWorkflowRunRepository", async (t) => {
    const repo = new SupabaseWorkflowRunRepository(supabase);
    const tests = workflowRunRepositoryTests(() => repo);
    for (const [name, fn] of Object.entries(tests)) {
        await t.test(name, fn);
    }
});
test("SupabaseTaskRepository", async (t) => {
    const repo = new SupabaseTaskRepository(supabase);
    const tests = taskRepositoryTests(() => repo);
    for (const [name, fn] of Object.entries(tests)) {
        await t.test(name, fn);
    }
});
test("SupabaseAssignmentRepository", async (t) => {
    const repo = new SupabaseAssignmentRepository(supabase);
    const tests = assignmentRepositoryTests(() => repo);
    for (const [name, fn] of Object.entries(tests)) {
        await t.test(name, fn);
    }
});
test("SupabaseExecutionSessionRepository", async (t) => {
    const repo = new SupabaseExecutionSessionRepository(supabase);
    const tests = executionSessionRepositoryTests(() => repo);
    for (const [name, fn] of Object.entries(tests)) {
        await t.test(name, fn);
    }
});
//# sourceMappingURL=supabase-repository-contracts.test.js.map