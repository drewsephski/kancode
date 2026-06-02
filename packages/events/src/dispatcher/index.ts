export interface EventDispatcher {
  dispatchPending(): Promise<void>;
}
