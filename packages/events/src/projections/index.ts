export interface Projection<TEvent = unknown> {
  apply(event: TEvent): Promise<void>;
}
