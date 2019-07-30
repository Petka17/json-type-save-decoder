import { Maybe } from "./maybe";
import * as M from "./maybe";

//--- TYPE and CONSTRUCTORS ---
export type Result<E, A> = Ok<A> | Err<E>;

class Ok<A> {
  public readonly kind = "ok";

  constructor(private value: A) {}

  public getValue(): A {
    return this.value;
  }

  public toString(): string {
    return `Ok(${this.value})`;
  }
}

class Err<E> {
  public readonly kind = "err";

  constructor(private error: E) {}

  public getError(): E {
    return this.error;
  }

  public toString(): string {
    return `Err(${this.error})`;
  }
}

//--- HELPER FUNCTIONS ---
export const ok = <E, A>(value: A): Result<E, A> => new Ok<A>(value);
export const err = <E, A>(error: E): Result<E, A> => new Err(error);

//--- MAPPING ---
export const map = <E, A, B>(
  fn: (_: A) => B,
  result: Result<E, A>
): Result<E, B> => (result.kind === "ok" ? ok(fn(result.getValue())) : result);

export const andThen = <E, A, B>(
  fn: (_: A) => Result<E, B>,
  result: Result<E, A>
): Result<E, B> => (result.kind === "ok" ? fn(result.getValue()) : result);

export const mapError = <E, X, A>(
  fn: (_: E) => X,
  result: Result<E, A>
): Result<X, A> => (result.kind === "ok" ? result : err(fn(result.getError())));

//---
export const tryCatch = <A>(fn: () => A): Result<string, A> => {
  try {
    return ok(fn());
  } catch (e) {
    return err(e.message);
  }
};

//--- COMBINE RESULTS---
export const assign = <E, A extends Object, B>(
  fieldName: string,
  other: Result<E, B>,
  result: Result<E, A>
): Result<E, A & { [k in string]: B }> =>
  result.kind === "err"
    ? result
    : other.kind === "ok"
    ? ok({
        ...result.getValue(),
        [fieldName]: other.getValue()
      })
    : other;

export const push = <E, A extends B[], B>(
  other: Result<E, B>,
  result: Result<E, A>
): Result<E, B[]> =>
  result.kind === "err"
    ? result
    : other.kind === "ok"
    ? ok([...result.getValue(), other.getValue()])
    : other;

//--- FOLDING ---
export const withDefault = <E, A>(defaultValue: A, result: Result<E, A>): A =>
  result.kind === "ok" ? result.getValue() : defaultValue;

//--- TRANSFORM ---
export const toMaybe = <E, A>(result: Result<E, A>): Maybe<A> =>
  result.kind == "ok" ? M.just(result.getValue()) : M.nothing();

export const fromMaybe = <E, A>(error: E, maybe: Maybe<A>): Result<E, A> =>
  maybe.kind === "just" ? ok(maybe.getValue()) : err(error);
