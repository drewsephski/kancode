export interface WorkerJob<TPayload = unknown> {
  id: string;
  type: string;
  payload: TPayload;
}
