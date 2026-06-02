import { randomUUID } from "node:crypto";
export class UUIDGenerator {
    next() {
        return randomUUID();
    }
}
export const createId = (value) => value;
//# sourceMappingURL=ids.js.map