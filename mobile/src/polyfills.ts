// Polyfills for older JavaScript runtimes
// These methods are part of ES2023 and require Node.js 20+ or polyfills

// Array.prototype.toReversed() - ES2023
if (!Array.prototype.toReversed) {
  Array.prototype.toReversed = function<T>(this: T[]): T[] {
    return [...this].reverse();
  };
}

// Array.prototype.toSorted() - ES2023
if (!Array.prototype.toSorted) {
  Array.prototype.toSorted = function<T>(
    this: T[],
    compareFn?: (a: T, b: T) => number
  ): T[] {
    return [...this].sort(compareFn);
  };
}

// Array.prototype.toSpliced() - ES2023
if (!Array.prototype.toSpliced) {
  Array.prototype.toSpliced = function<T>(
    this: T[],
    start: number,
    deleteCount?: number,
    ...items: T[]
  ): T[] {
    const copy = [...this];
    copy.splice(start, deleteCount ?? 0, ...items);
    return copy;
  };
}

// Array.prototype.with() - ES2023
if (!Array.prototype.with) {
  Array.prototype.with = function<T>(this: T[], index: number, value: T): T[] {
    const copy = [...this];
    copy[index] = value;
    return copy;
  };
}
