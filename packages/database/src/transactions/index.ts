import type { UnitOfWork } from "@kancode/application";

export class DatabaseUnitOfWork implements UnitOfWork {
  async run<T>(work: () => Promise<T>): Promise<T> {
    return work();
  }
}
