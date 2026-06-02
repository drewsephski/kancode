export interface JobHandler<TJob = unknown, TResult = void> {
    handle(job: TJob): Promise<TResult>;
}
//# sourceMappingURL=index.d.ts.map