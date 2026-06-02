import type { BridgeAck, BridgeMessageEnvelope } from "@kancode/contracts";

export interface BridgeTransport {
  send<TType extends string, TPayload>(
    message: BridgeMessageEnvelope<TType, TPayload>,
  ): Promise<BridgeAck>;
  onMessage(handler: (message: unknown) => Promise<void>): void;
}

export { TriggerBridgeCommandPublisher } from "./bridge-command-publisher.js";
