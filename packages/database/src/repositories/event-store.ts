import type { SupabaseClient } from "@supabase/supabase-js";
import type { DomainEvent } from "@kancode/domain";
import type { DomainEventStore } from "@kancode/application";
import { domainEventToRow, rowToDomainEvent } from "../mappers/event.js";

export class SupabaseEventStore implements DomainEventStore {
  constructor(private readonly supabase: SupabaseClient) {}

  async append(events: DomainEvent[]): Promise<void> {
    if (events.length === 0) return;

    const rows = events.map((event) => {
      const aggregateId = extractAggregateId(event);
      return domainEventToRow(aggregateId, event);
    });

    const { error } = await this.supabase.from("domain_events").insert(rows);
    if (error) throw error;
  }

  async getByAggregateId(aggregateId: string): Promise<DomainEvent[]> {
    const { data, error } = await this.supabase
      .from("domain_events")
      .select("*")
      .eq("aggregate_id", aggregateId)
      .order("version", { ascending: true });

    if (error) throw error;
    return (data ?? []).map(rowToDomainEvent);
  }

  async getAll(): Promise<DomainEvent[]> {
    const { data, error } = await this.supabase
      .from("domain_events")
      .select("*")
      .order("id", { ascending: true });

    if (error) throw error;
    return (data ?? []).map(rowToDomainEvent);
  }
}

function extractAggregateId(event: DomainEvent): string {
  const payload = event.payload as Record<string, unknown>;
  // Each event carries its aggregate ID in the payload
  return (
    (payload.workspaceId as string) ??
    (payload.requestId as string) ??
    (payload.workflowId as string) ??
    (payload.workflowRunId as string) ??
    (payload.taskId as string) ??
    (payload.assignmentId as string) ??
    (payload.executionSessionId as string) ??
    "unknown"
  );
}
