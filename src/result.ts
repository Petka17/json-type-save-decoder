//--- TYPE and CONSTRUCTORS
export type Result<E, A> = Ok<E, A> | Err<E, A>;

interface IResult<E, A> {
  kind: "ok" | "err";
  map<B>(fn: (_: A) => B): Result<E, B>;
  mapError<X>(fn: (_: E) => X): Result<X, A>;
  flatMap<B>(fn: (_: A) => Result<E, B>): Result<E, B>;
  ap<B, C>(other: Result<E, B>): Result<E, C>;
}

class Ok<E, A> implements IResult<E, A> {
  public readonly kind = "ok";

  public constructor(private value: A) {}

  public getValue(): A {
    return this.value;
  }

  public map<B>(fn: (_: A) => B): Result<E, B> {
    return ok(fn(this.value));
  }

  public mapError<X>(_: (_: E) => X): Result<X, A> {
    return ok(this.value);
  }

  public flatMap<B>(fn: (_: A) => Result<E, B>): Result<E, B> {
    return fn(this.value);
  }

  public ap<B, C>(other: Result<E, B>): Result<E, C> {
    type MapFn = (_: B) => C;

    function typeGuard(fn: any): fn is MapFn {
      if (fn instanceof Function) return true;
      return false;
    }

    if (!typeGuard(this.value)) {
      throw new TypeError(`'ap' can only be applied to functions`);
    }

    if (other.kind === "err") return err(other.getError());

    return other.map(this.value);
  }

  public withDefault(_: A): A {
    return this.getValue();
  }
}

class Err<E, A> implements IResult<E, A> {
  public readonly kind = "err";

  public constructor(private error: E) {}

  public getError(): E {
    return this.error;
  }

  public map<B>(_: (_: A) => B): Result<E, B> {
    return err(this.error);
  }

  public mapError<X>(fn: (_: E) => X): Result<X, A> {
    return err(fn(this.error));
  }

  public flatMap<B>(_: (_: A) => Result<E, B>): Result<E, B> {
    return err(this.error);
  }

  public ap<B, C>(_: Result<E, B>): Result<E, C> {
    return err(this.error);
  }

  public withDefault<A>(defaultValue: A): A {
    return defaultValue;
  }
}

//--- HELPER FUNCTIONS
export const ok = <E, A>(value: A): Result<E, A> => new Ok<E, A>(value);
export const err = <E, A>(error: E): Result<E, A> => new Err<E, A>(error);

//--- UTILITIS ---
export const tryCatch = <A>(fn: () => A): Result<string, A> => {
  try {
    return ok(fn());
  } catch (e) {
    return err(e.message);
  }
};
