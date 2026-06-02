import { AggregateEventCollection } from "./aggregate-event-collection.js";
export class AggregateRoot {
    id;
    _version;
    #events = new AggregateEventCollection();
    constructor(id, _version = 0) {
        this.id = id;
        this._version = _version;
    }
    get version() {
        return this._version;
    }
    recordEvent(event) {
        const version = this._version + 1;
        this._version = version;
        this.#events.add({
            ...event,
            version,
        });
    }
    pullEvents() {
        return this.#events.pull();
    }
}
//# sourceMappingURL=aggregate-root.js.map