import { domainEventToRow, rowToDomainEvent } from "../mappers/event.js";
export class SupabaseEventStore {
    supabase;
    constructor(supabase) {
        this.supabase = supabase;
    }
    async append(events) {
        if (events.length === 0)
            return;
        const rows = events.map((event) => {
            const aggregateId = extractAggregateId(event);
            return domainEventToRow(aggregateId, event);
        });
        const { error } = await this.supabase.from("domain_events").insert(rows);
        if (error)
            throw error;
    }
    async getByAggregateId(aggregateId) {
        const { data, error } = await this.supabase
            .from("domain_events")
            .select("*")
            .eq("aggregate_id", aggregateId)
            .order("version", { ascending: true });
        if (error)
            throw error;
        return (data ?? []).map(rowToDomainEvent);
    }
    async getAll() {
        const { data, error } = await this.supabase
            .from("domain_events")
            .select("*")
            .order("id", { ascending: true });
        if (error)
            throw error;
        return (data ?? []).map(rowToDomainEvent);
    }
}
function extractAggregateId(event) {
    const payload = event.payload;
    // Each event carries its aggregate ID in the payload
    return (payload.workspaceId ??
        payload.requestId ??
        payload.workflowId ??
        payload.workflowRunId ??
        payload.taskId ??
        payload.assignmentId ??
        payload.executionSessionId ??
        "unknown");
}
//# sourceMappingURL=event-store.js.map