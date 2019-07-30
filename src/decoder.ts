import * as _ from "ramda";

import { err, ok, Result } from "./result";
import * as R from "./result";

type DecoderFn<A> = (thing: any) => Result<string, A>;

export class Decoder<A> {
  constructor(private fn: DecoderFn<A>) {}

  public assign<K extends string, B>(
    key: K,
    other: Decoder<B> | ((a: A) => Decoder<B>)
  ): Decoder<A & { [k in K]: B }> {
    return andThen(
      a =>
        map(
          b => ({
            ...Object(a),
            [key.toString()]: b
          }),
          other instanceof Decoder ? other : other(a)
        ),
      this
    );
  }

  public decode(value: any) {
    return this.fn(value);
  }
}

//--- Mapping ---
export const map = <A, B>(fn: (_: A) => B, decoder: Decoder<A>): Decoder<B> =>
  new Decoder(
    (value: any): Result<string, B> => R.map(fn, decoder.decode(value))
  );

export const andThen = <A, B>(
  fn: (_: A) => Decoder<B>,
  decoder: Decoder<A>
): Decoder<B> =>
  new Decoder(
    (value: any): Result<string, B> =>
      R.andThen(a => fn(a).decode(value), decoder.decode(value))
  );

//--- COMBINE ---
export const assign = <K extends string, B, A>(
  key: K,
  other: Decoder<B> | ((a: A) => Decoder<B>)
) => (decoder: Decoder<A>): Decoder<A & { [k in K]: B }> => {
  return andThen(
    a =>
      map(
        b => ({
          ...Object(a),
          [key.toString()]: b
        }),
        other instanceof Decoder ? other : other(a)
      ),
    decoder
  );
};

//--- PRIMITIVES ---
export const string: Decoder<string> = new Decoder(
  (value: any): Result<string, string> => {
    if (typeof value === "string") return R.ok(value);

    return R.err(getErrorMessage("string", value));
  }
);

export const boolean: Decoder<boolean> = new Decoder(
  (value: any): Result<string, boolean> => {
    if (typeof value === "boolean") return R.ok(value);

    return R.err(getErrorMessage("boolean", value));
  }
);
// TODO: Add booleanExt: "true"/"false", "Y"/"N", 0/1...

export const number: Decoder<number> = new Decoder(
  (value: any): Result<string, number> => {
    if (typeof value === "number") return R.ok(value);

    return R.err(getErrorMessage("number", value));
  }
);
// TODO: Date decoder

//--- DATA STRUCTURES ---
// nullable : Decoder a -> Decoder (Maybe a)
// array : Decoder a -> Decoder (Array a)
export const array = <A>(decoder: Decoder<A>): Decoder<A[]> =>
  new Decoder(value => {
    if (!(value instanceof Array)) {
      return err(getErrorMessage("array", value));
    }

    let result: Result<string, A[]> = ok([]);
    let item: Result<string, A>;

    for (let i = 0; i < value.length; i++) {
      // item = decodeAny(decoder, value[i])
      // if (item.kind === "err") {
      // }
      // result = R.map(list => list.concat(item))
    }

    return result;
  });

// dict : Decoder a -> Decoder (Dict String a)
// keyValuePairs : Decoder a -> Decoder (List ( String, a ))
// oneOrMore : (a -> List a -> value) -> Decoder a -> Decoder value

//--- OBJECT PRIMITIVES ---
// field : String -> Decoder a -> Decoder a
export const field = <A>(fieldName: string, decoder: Decoder<A>): Decoder<A> =>
  new Decoder(value => {
    Object.hasOwnProperty(fieldName);
    let v: any;

    try {
      v = value[fieldName];
    } catch (e) {
      return err(`Can't get value of the field: ${e.message}`);
    }

    return decoder.decode(v);
  });
// at : List String -> Decoder a -> Decoder a
// index : Int -> Decoder a -> Decoder a

//--- INCONSISTENT STRUCTURES ---
// maybe : Decoder a -> Decoder (Maybe a)
// oneOf : List (Decoder a) -> Decoder a

//--- RUN DECODERS ---
export const decodeAny = <A>(
  decoder: Decoder<A>,
  value: any
): Result<string, A> => {
  return decoder.decode(value);
};

//--- Folding ---
export const succeed = <A>(value: A) => new Decoder(_ => R.ok(value));
export const fail = <A>(message: string): Decoder<A> =>
  new Decoder(_ => R.err(message));

/**
 * Utilities
 */

const getErrorMessage = (expected: string, value: any) =>
  `I expected to find a ${expected} but instead I found ${stringify(value)}`;

const stringify = (value: any): string =>
  JSON.stringify(value, cyclicalReferenceReplacer());

/*
 * Based on this code: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Cyclic_object_value
 */
const cyclicalReferenceReplacer = () => {
  const seen = new WeakSet();
  return (_: string, value: any) => {
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) {
        return "[Cyclical Reference]";
      }
      seen.add(value);
    }
    return value;
  };
};

//---------------------------------
console.log(decodeAny(field("x", number), undefined));
console.log(
  decodeAny(
    succeed({})
      .assign("t", field("x", number))
      .assign("h", field("y", boolean)),
    { x: 5, y: true }
  )
);

const dd = _.compose(
  assign("t", field("x", number)),
  assign("h", field("y", boolean))
);
console.log(dd.decode({ x: 5, y: true }));
// console.log(ok("r"));
