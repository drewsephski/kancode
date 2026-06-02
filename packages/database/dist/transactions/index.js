export class DatabaseUnitOfWork {
    async run(work) {
        return work();
    }
}
//# sourceMappingURL=index.js.map