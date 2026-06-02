import assert from "node:assert/strict";
export function workflowRunProcessRepositoryContracts(createRepo) {
    const makeProcess = (id) => ({
        id,
        workflowRunId: `run-${id}`,
        workspaceId: "ws-1",
        state: "pending",
        revision: 1,
        createdAt: new Date("2025-01-01T00:00:00.000Z"),
        updatedAt: new Date("2025-01-01T00:00:00.000Z"),
    });
    return {
        async "save and getById round-trip"() {
            const repo = createRepo();
            const p = makeProcess("proc-1");
            await repo.save(p);
            const loaded = await repo.getById("proc-1");
            assert.ok(loaded);
            assert.equal(loaded.id, "proc-1");
            assert.equal(loaded.state, "pending");
            assert.equal(loaded.revision, 1);
        },
        async "getById returns null for non-existent"() {
            const repo = createRepo();
            assert.equal(await repo.getById("nonexistent"), null);
        },
        async "getByWorkflowRunId returns the correct process"() {
            const repo = createRepo();
            await repo.save(makeProcess("proc-1"));
            await repo.save(makeProcess("proc-2"));
            const loaded = await repo.getByWorkflowRunId("run-proc-1");
            assert.ok(loaded);
            assert.equal(loaded.id, "proc-1");
        },
        async "save updates existing process"() {
            const repo = createRepo();
            const p = makeProcess("proc-1");
            await repo.save(p);
            p.state = "completed";
            p.revision = 2;
            await repo.save(p);
            const loaded = await repo.getById("proc-1");
            assert.ok(loaded);
            assert.equal(loaded.state, "completed");
            assert.equal(loaded.revision, 2);
        },
    };
}
//# sourceMappingURL=process-contracts.js.map