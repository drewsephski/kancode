import assert from "node:assert/strict";
import type { DomainEvent } from "@kancode/domain";
import type { DomainEventStore, OutboxRepository, IdempotencyStore } from "@kancode/application";

// ── DomainEventStore ────────────────────────────────────────────────────

export function eventStoreContracts(createStore: () => DomainEventStore) {
  const makeEvent = (type: string, version: number, aggregateId: string): DomainEvent => ({
    type,
    occurredAt: new Date("2025-01-01T00:00:00.000Z"),
    payload: { workspaceId: aggregateId },
    version,
  });

  return {
    async "append stores events and getAll retrieves them in order"() {
      const store = createStore();
      const e1 = makeEvent("test.created", 1, "agg-1");
      const e2 = makeEvent("test.updated", 2, "agg-1");

      await store.append([e1, e2]);
      const all = await store.getAll();

      assert.equal(all.length, 2);
      assert.equal(all[0]!.type, "test.created");
      assert.equal(all[0]!.version, 1);
      assert.equal(all[1]!.type, "test.updated");
      assert.equal(all[1]!.version, 2);
    },

    async "append with empty array is a no-op"() {
      const store = createStore();
      await store.append([]);
      assert.equal((await store.getAll()).length, 0);
    },

    async "multiple appends accumulate events"() {
      const store = createStore();
      await store.append([makeEvent("first", 1, "agg-1")]);
      await store.append([makeEvent("second", 1, "agg-2")]);
      assert.equal((await store.getAll()).length, 2);
    },
  };
}

// ── OutboxRepository ────────────────────────────────────────────────────

export function outboxRepositoryContracts(createRepo: () => OutboxRepository) {
  const makeRecord = (id: string) => ({
    id,
    workspaceId: "ws-1",
    event: {
      type: "test.event",
      occurredAt: new Date("2025-01-01T00:00:00.000Z"),
      payload: {},
      version: 1,
    } as DomainEvent,
    status: "pending" as const,
  });

  return {
    async "enqueue adds pending records"() {
      const repo = createRepo();
      await repo.enqueue([makeRecord("outbox-1")]);
      const pending = await repo.getPending();
      assert.equal(pending.length, 1);
      assert.equal(pending[0]!.id, "outbox-1");
      assert.equal(pending[0]!.status, "pending");
    },

    async "markDispatched updates status"() {
      const repo = createRepo();
      await repo.enqueue([makeRecord("outbox-1")]);
      await repo.markDispatched(["outbox-1"]);
      const pending = await repo.getPending();
      assert.equal(pending.length, 0);
    },

    async "enqueue with empty array is a no-op"() {
      const repo = createRepo();
      await repo.enqueue([]);
      assert.equal((await repo.getPending()).length, 0);
    },
  };
}

// ── IdempotencyStore ────────────────────────────────────────────────────

export function idempotencyStoreContracts(createStore: () => IdempotencyStore) {
  return {
    async "has returns false for unknown keys"() {
      const store = createStore();
      assert.equal(await store.has("unknown"), false);
    },

    async "set followed by get returns stored value"() {
      const store = createStore();
      await store.set("key-1", { result: "ok" });
      const value = await store.get<{ result: string }>("key-1");
      assert.deepEqual(value, { result: "ok" });
    },

    async "get returns null for unset keys"() {
      const store = createStore();
      assert.equal(await store.get("nonexistent"), null);
    },

    async "has returns true after set"() {
      const store = createStore();
      await store.set("key-1", "value");
      assert.equal(await store.has("key-1"), true);
    },

    async "overwriting a key replaces its value"() {
      const store = createStore();
      await store.set("key-1", "first");
      await store.set("key-1", "second");
      const value = await store.get<string>("key-1");
      assert.equal(value, "second");
    },
  };
}
