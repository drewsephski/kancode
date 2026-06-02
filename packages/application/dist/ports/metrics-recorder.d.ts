export interface MetricsRecorder {
    increment(metric: string, tags?: Record<string, string>): Promise<void>;
    gauge(metric: string, value: number, tags?: Record<string, string>): Promise<void>;
    timing(metric: string, ms: number, tags?: Record<string, string>): Promise<void>;
}
//# sourceMappingURL=metrics-recorder.d.ts.map