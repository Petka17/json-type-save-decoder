/*
 * Code from: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Cyclic_object_value
 */

import "weakset";

export const stringify = (value: any): string =>
  JSON.stringify(value, cyclicalReferenceReplacer(), 2);

const cyclicalReferenceReplacer = (): any => {
  const seen = new WeakSet();
  return (_: string, value: any): string => {
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) {
        return "[Cyclical Reference]";
      }
      seen.add(value);
    }
    return value;
  };
};
