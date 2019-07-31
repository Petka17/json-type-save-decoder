import { just, Maybe, nothing } from "./maybe";
import { err, ok, Result } from "./result";

export const resultToMaybe = <E, A>(result: Result<E, A>): Maybe<A> =>
  result.kind == "ok" ? just(result.getValue()) : nothing();

export const maybeToResult = <E, A>(error: E, maybe: Maybe<A>): Result<E, A> =>
  maybe.kind === "just" ? ok(maybe.getValue()) : err(error);
