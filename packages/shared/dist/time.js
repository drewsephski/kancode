export class SystemClock {
    now() {
        return new Date();
    }
}
export const epochClock = {
    now: () => new Date(0),
};
//# sourceMappingURL=time.js.map