const isPlainObject = (value) => typeof value === "object" && value !== null && !Array.isArray(value);
const deepEqual = (left, right) => {
    if (Object.is(left, right)) {
        return true;
    }
    if (Array.isArray(left) && Array.isArray(right)) {
        if (left.length !== right.length) {
            return false;
        }
        return left.every((item, index) => deepEqual(item, right[index]));
    }
    if (isPlainObject(left) && isPlainObject(right)) {
        const leftKeys = Object.keys(left);
        const rightKeys = Object.keys(right);
        if (leftKeys.length !== rightKeys.length) {
            return false;
        }
        return leftKeys.every((key) => Object.hasOwn(right, key) && deepEqual(left[key], right[key]));
    }
    return false;
};
export class ValueObject {
    props;
    constructor(props) {
        this.props = props;
    }
    equals(other) {
        return deepEqual(this.props, other.props);
    }
    toJSON() {
        return { ...this.props };
    }
}
//# sourceMappingURL=value-object.js.map