//--- TYPE and CONSTRUCTORS ---
export type Maybe<A> = Just<A> | Nothing;

class Just<A> {
  public readonly kind = "just";

  constructor(private value: A) {}

  public getValue(): A {
    return this.value;
  }
}

class Nothing {
  public readonly kind = "nothing";
}

//--- HELPER FUNCTIONS ---
export const just = <A>(value: A): Maybe<A> => new Just<A>(value);
export const nothing = <A>(): Maybe<A> => new Nothing();

//--- MAPPING ---
export const map = <A, B>(fn: (_: A) => B, maybe: Maybe<A>): Maybe<B> => {
  switch (maybe.kind) {
    case "just":
      return new Just(fn(maybe.getValue()));

    case "nothing":
      return maybe;
  }
};

export const andThen = <A, B>(
  fn: (_: A) => Maybe<B>,
  maybe: Maybe<A>
): Maybe<B> => {
  if (maybe instanceof Just) {
    return fn(maybe.getValue());
  }

  return maybe;
};

//--- FOLDING ---
export const withDefault = <A>(defaultValue: A, maybe: Maybe<A>): A =>
  maybe.kind === "just" ? maybe.getValue() : defaultValue;

//--- Utilities ---
export const fromNullable = <A>(x: A): Maybe<A> =>
  x === null ? nothing() : just(x);
