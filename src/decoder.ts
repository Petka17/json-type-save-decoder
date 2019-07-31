import * as Result from "./result";

type DecoderFn<A> = (thing: any) => Result.Result<string, A>;

export class Decoder<A> {
  public constructor(private fn: DecoderFn<A>) {}

  public decode(value: any): Result.Result<string, A> {
    return this.fn(value);
  }

  public map<B>(fn: (_: A) => B): Decoder<B> {
    return new Decoder<B>(
      (value: any): Result.Result<string, B> => this.decode(value).map(fn)
    );
  }

  public flatMap<B>(fn: (_: A) => Decoder<B>): Decoder<B> {
    return new Decoder<B>(
      (value: any): Result.Result<string, B> =>
        this.decode(value).flatMap(
          (decoded: A): Result.Result<string, B> => fn(decoded).decode(value)
        )
    );
  }

  public assign<B>(
    key: string,
    other: Decoder<B>
  ): Decoder<A & { [key in string]: B }> {
    type ResultObject = A & { [key in string]: B };

    return this.flatMap(
      (decoded: A): Decoder<ResultObject> =>
        other.map(
          (b: B): ResultObject => ({
            ...decoded,
            [key]: b
          })
        )
    );
  }
}

//--- BASE CASES ---
export const succeed = <A>(value: A): Decoder<A> =>
  new Decoder((_): Result.Result<string, A> => Result.ok(value));

export const fail = <A>(message: string): Decoder<A> =>
  new Decoder((_): Result.Result<string, A> => Result.err(message));

//--- PRIMITIVES ---
export const string: Decoder<string> = new Decoder(
  (value: any): Result.Result<string, string> => {
    if (typeof value === "string") return Result.ok(value);

    return Result.err(getErrorMessage("string", value));
  }
);

export const number: Decoder<number> = new Decoder(
  (value: any): Result.Result<string, number> => {
    if (typeof value === "number") return Result.ok(value);

    return Result.err(getErrorMessage("number", value));
  }
);

export const boolean: Decoder<boolean> = new Decoder(
  (value: any): Result.Result<string, boolean> => {
    if (typeof value === "boolean") return Result.ok(value);

    return Result.err(getErrorMessage("boolean", value));
  }
);
// TODO: Add booleanExt: "true"/"false", "Y"/"N", 0/1...
// TODO: Date decoder

//--- ARRAY and OBJECT PRIMITIVES ---
export const field = <A>(fieldName: string, decoder: Decoder<A>): Decoder<A> =>
  new Decoder(
    (value: Record<string, any>): Result.Result<string, A> =>
      decoder.decode(value[fieldName])
  );

export const index = <A>(index: number, decoder: Decoder<A>): Decoder<A> =>
  new Decoder(
    (value: Record<string, any>): Result.Result<string, A> =>
      decoder.decode(value[index])
  );

type stringOrNumber = string | number;
export const at = <A>(
  keys: stringOrNumber[],
  decoder: Decoder<A>
): Decoder<A> =>
  new Decoder(
    (value: any): Result.Result<string, A> => {
      const valueAtPath: Result.Result<string, any> = Result.tryCatch((): any =>
        keys.reduce((acc: any, key: stringOrNumber): any => acc[key], value)
      );

      return valueAtPath.kind === "ok"
        ? decoder.decode(valueAtPath.getValue())
        : Result.err(
            `Not existed path ${keys} in ${stringify(
              value
            )}.\n${valueAtPath.getError()}`
          );
    }
  );

//--- DATA STRUCTURES ---
export const array = <A>(decoder: Decoder<A>): Decoder<A[]> =>
  new Decoder(
    (value: any): Result.Result<string, A[]> => {
      if (!(value instanceof Array)) {
        return Result.err(getErrorMessage("array", value));
      }

      let result: Result.Result<string, A[]> = Result.ok([]);
      let item: Result.Result<string, A>;

      for (let i = 0; i < value.length; i++) {
        item = decoder.decode(value[i]);

        if (item.kind === "ok") {
          const v = item.getValue();
          result = result.map((list: A[]): A[] => list.concat(v));
        } else {
          return Result.err(item.getError());
        }
      }

      return result;
    }
  );

//--- INCONSISTENT STRUCTURES ---
// oneOf : List (Decoder a) -> Decoder a
// maybe : Decoder a -> Decoder (Maybe a)

/**
 * Utilities
 */

export const getErrorMessage = (expected: string, value: any): string =>
  `I expected to find a **${expected.toUpperCase()}** but instead I found ${stringify(
    value
  )}`;

const stringify = (value: any): string => JSON.stringify(value, null); // cyclicalReferenceReplacer());

// /*
//  * Based on this code: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Cyclic_object_value
//  */
// const cyclicalReferenceReplacer = (): any => {
//   const seen = new WeakSet();
//   return (_: string, value: any): string => {
//     if (typeof value === "object" && value !== null) {
//       if (seen.has(value)) {
//         return "[Cyclical Reference]";
//       }
//       seen.add(value);
//     }
//     return value;
//   };
// };
