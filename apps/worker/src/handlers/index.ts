export interface JobHandler<TJob = unknown, TResult = void> {
  handle(job: TJob): Promise<TResult>;
}
