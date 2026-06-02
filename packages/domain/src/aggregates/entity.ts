export abstract class Entity<TId extends string = string> {
  constructor(public readonly id: TId) {}
}
