import * as Maybe from "../maybe";
import { maybeToResult, resultToMaybe } from "../nat";
import * as Result from "../result";

test("result-ok to maybe", (done): void => {
  const result: Result.Result<any, number> = Result.ok(5);

  const maybe: Maybe.Maybe<number> = resultToMaybe(result);

  if (maybe.kind === "nothing") {
    done.fail("Expected Just(5), instead received Nothing");
  } else {
    expect(maybe.getValue()).toEqual(5);
  }

  done();
});

test("result-err to maybe", (done): void => {
  const result: Result.Result<any, number> = Result.err("some error");

  const maybe: Maybe.Maybe<number> = resultToMaybe(result);

  if (maybe.kind === "just") {
    done.fail(`Expected Nothing, instead received Just(${maybe.getValue()})`);
  }

  done();
});

test("maybe-just to result", (done): void => {
  const maybe: Maybe.Maybe<number> = Maybe.just(5);

  const result: Result.Result<string, number> = maybeToResult(
    "some error",
    maybe
  );

  if (result.kind === "err") {
    done.fail(`Expected Ok(5), instead received Err(${result.getError()})`);
  } else {
    expect(result.getValue()).toEqual(5);
  }

  done();
});

test("maybe-nothing to result", (done): void => {
  const maybe: Maybe.Maybe<number> = Maybe.nothing<number>();

  const msg = "some error";
  const result: Result.Result<string, number> = maybeToResult(msg, maybe);

  if (result.kind === "ok") {
    done.fail(`Expected Err(msg), received Ok(${result.getValue()})`);
  } else {
    expect(result.getError()).toEqual(msg);
  }

  done();
});
