import * as Result from "../result";

test("create result-ok", (done): void => {
  const result: Result.Result<any, number> = Result.ok(5);

  if (result.kind === "err") {
    done.fail(`Expected Ok(5), instead received Err(${result.getError()})`);
  } else {
    expect(result.getValue()).toEqual(5);
  }

  done();
});

test("create result-err", (done): void => {
  const msg = "some error";
  const result: Result.Result<string, any> = Result.err(msg);

  if (result.kind === "ok") {
    done.fail(`Expected Err(msg), received Ok(${result.getValue()})`);
  } else {
    expect(result.getError()).toEqual(msg);
  }

  done();
});

test("map result-ok", (done): void => {
  const result: Result.Result<any, number> = Result.ok(4).map(
    (x): number => x + 1
  );

  if (result.kind === "err") {
    done.fail(`Expected Ok(5), instead received Err(${result.getError()})`);
  } else {
    expect(result.getValue()).toEqual(5);
  }

  done();
});

test("map result-err", (done): void => {
  const msg = "some error";
  const result: Result.Result<string, number> = Result.err<string, number>(
    msg
  ).map((x): number => x + 1);

  if (result.kind === "ok") {
    done.fail(`Expected Err(msg), received Ok(${result.getValue()})`);
  } else {
    expect(result.getError()).toEqual(msg);
  }

  done();
});

test("mapError result-ok", (done): void => {
  const result: Result.Result<string, number> = Result.ok<string, number>(
    5
  ).mapError((err: string): string => err.toUpperCase());

  if (result.kind === "err") {
    done.fail(`Expected Ok(5), instead received Err(${result.getError()})`);
  } else {
    expect(result.getValue()).toEqual(5);
  }

  done();
});

test("mapError result-err", (done): void => {
  const msg = "some error";
  const result: Result.Result<string, number> = Result.err<string, number>(
    msg
  ).mapError((err: string): string => err.toUpperCase());

  if (result.kind === "ok") {
    done.fail(`Expected Err(msg), received Ok(${result.getValue()})`);
  } else {
    expect(result.getError()).toEqual(msg.toUpperCase());
  }

  done();
});

test("flatMap result-ok", (done): void => {
  const result: Result.Result<any, number> = Result.ok(4).flatMap(
    (x): Result.Result<string, number> => Result.ok(x + 1)
  );

  if (result.kind === "err") {
    done.fail(`Expected Ok(5), instead received Err(${result.getError()})`);
  } else {
    expect(result.getValue()).toEqual(5);
  }

  done();
});

test("flatMap result-err", (done): void => {
  const msg = "some error";
  const result: Result.Result<string, number> = Result.err<string, number>(
    msg
  ).flatMap((x): Result.Result<string, number> => Result.ok(x + 1));

  if (result.kind === "ok") {
    done.fail(`Expected Err(msg), received Ok(${result.getValue()})`);
  } else {
    expect(result.getError()).toEqual(msg);
  }

  done();
});

test("apply result-ok", (done): void => {
  const result: Result.Result<any, number> = Result.ok<
    any,
    (_: number) => number
  >((x: number): number => x + 1).ap(Result.ok(4));

  if (result.kind === "err") {
    done.fail(`Expected Ok(5), instead received Err(${result.getError()})`);
  } else {
    expect(result.getValue()).toEqual(5);
  }

  done();
});

test("apply not a function result-ok", (done): void => {
  try {
    Result.ok<any, number>(1).ap(Result.ok("1"));
  } catch (e) {
    expect(e.message).toEqual("'ap' can only be applied to functions");
  }

  done();
});

test("apply error to result-ok", (done): void => {
  const msg = "some error";
  const result: Result.Result<any, number> = Result.ok<
    any,
    (_: number) => number
  >((x: number): number => x + 1).ap(Result.err(msg));

  if (result.kind === "ok") {
    done.fail(`Expected Err(msg), received Ok(${result.getValue()})`);
  } else {
    expect(result.getError()).toEqual(msg);
  }

  done();
});

test("apply result-err", (done): void => {
  const msg = "some error";
  const result: Result.Result<any, number> = Result.err<
    string,
    (_: number) => number
  >(msg).ap(Result.ok("1"));

  if (result.kind === "ok") {
    done.fail(`Expected Err(msg), received Ok(${result.getValue()})`);
  } else {
    expect(result.getError()).toEqual(msg);
  }

  done();
});

test("withDeafult result-ok", (done): void => {
  const result: Result.Result<any, number> = Result.ok(5);

  if (result.kind === "err") {
    done.fail(`Expected Ok(5), instead received Err(${result.getError()})`);
  } else {
    expect(result.withDefault(0)).toEqual(5);
  }

  done();
});

test("withDeafult result-err", (done): void => {
  const msg = "some error";
  const result: Result.Result<string, number> = Result.err<string, number>(msg);

  if (result.kind === "ok") {
    done.fail(`Expected Err(msg), received Ok(${result.getValue()})`);
  } else {
    expect(result.withDefault(0)).toEqual(0);
  }

  done();
});
