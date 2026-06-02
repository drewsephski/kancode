export declare abstract class ValueObject<TProps extends Record<string, unknown> = Record<string, unknown>> {
    protected readonly props: TProps;
    protected constructor(props: TProps);
    equals(other: ValueObject<TProps>): boolean;
    toJSON(): TProps;
}
//# sourceMappingURL=value-object.d.ts.map