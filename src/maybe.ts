//--- TYPE and CONSTRUCTORS
export type Maybe<A> = Just<A> | Nothing<A>;

interface IMaybe<A> {
  kind: "just" | "nothing";
  map<B>(fn: (_: A) => B): Maybe<B>;
  flatMap<B>(fn: (_: A) => Maybe<B>): Maybe<B>;
  withDefault(_: A): A;
}

class Just<A> implements IMaybe<A> {
  public readonly kind = "just";

  public constructor(private value: A) {}

  public getValue(): A {
    return this.value;
  }

  public map<B>(fn: (_: A) => B): Maybe<B> {
    return just(fn(this.value));
  }

  public flatMap<B>(fn: (_: A) => Maybe<B>): Maybe<B> {
    return fn(this.value);
  }

  public withDefault(_: A): A {
    return this.getValue();
  }
}

class Nothing<A> implements IMaybe<A> {
  public readonly kind = "nothing";

  public map<B>(_: (_: A) => B): Maybe<B> {
    return nothing();
  }

  public flatMap<B>(_: (_: A) => Maybe<B>): Maybe<B> {
    return nothing();
  }

  public withDefault(defaultValue: A): A {
    return defaultValue;
  }
}

//--- HELPER FUNCTIONS ---
export const just = <A>(value: A): Maybe<A> => new Just<A>(value);
export const nothing = <A>(): Maybe<A> => new Nothing();

//--- UTILITIES ---
export const fromNullable = <A>(x: A | null): Maybe<A> =>
  x === null ? nothing() : just(x);
