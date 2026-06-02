import type { SupabaseClient } from "@supabase/supabase-js";
import type { RequestRepository } from "@kancode/application";
import type { Request } from "@kancode/domain";
import { requestToRow, rowToRequest } from "../mappers/request.js";

export class SupabaseRequestRepository implements RequestRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async getById(id: string): Promise<Request | null> {
    const { data, error } = await this.supabase
      .from("requests")
      .select("*")
      .eq("id", id)
      .single();

    if (error?.code === "PGRST116") return null;
    if (error) throw error;
    return rowToRequest(data);
  }

  async save(request: Request): Promise<void> {
    const row = requestToRow(request);
    const { error } = await this.supabase.from("requests").upsert(row);
    if (error) throw error;
  }
}
