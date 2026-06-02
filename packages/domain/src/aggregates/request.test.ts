import assert from "node:assert/strict";
import test from "node:test";

import { Request } from "./request.js";
import { DomainError } from "../errors/domain-error.js";

test("request lifecycle transitions", () => {
  const request = Request.submit({
    id: "request_1",
    workspaceId: "workspace_1",
    requestText: "Build Stripe subscriptions",
  });

  assert.equal(request.status, "submitted");
  assert.equal(request.version, 1);

  request.requestClarification();
  assert.equal(request.status, "clarification_needed");
  assert.equal(request.version, 2);

  request.markReadyForPlanning();
  assert.equal(request.status, "ready_for_planning");
  assert.equal(request.version, 3);

  request.markPlanned();
  assert.equal(request.status, "planned");
  assert.equal(request.version, 4);

  request.complete();
  assert.equal(request.status, "completed");
  assert.equal(request.version, 5);

  assert.throws(
    () => request.cancel("too late"),
    (error) => error instanceof DomainError,
  );
});

test("request cannot move to clarification from a non-submitted state", () => {
  const request = Request.submit({
    id: "request_2",
    workspaceId: "workspace_1",
    requestText: "Add billing",
  });

  request.markReadyForPlanning();

  assert.throws(
    () => request.requestClarification(),
    (error) => error instanceof DomainError,
  );
});
