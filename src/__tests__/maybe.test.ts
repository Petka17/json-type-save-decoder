import * as Maybe from "../maybe";

test("create maybe-just", (done): void => {
  const maybe: Maybe.Maybe<number> = Maybe.just(5);

  if (maybe.kind === "nothing") {
    done.fail("Expected Just(5), instead received Nothing");
  } else {
    expect(maybe.getValue()).toEqual(5);
  }

  done();
});

test("create maybe-nothing", (done): void => {
  const maybe: Maybe.Maybe<number> = Maybe.nothing();

  if (maybe.kind === "just") {
    done.fail(`Expected Nothing, instead received Just(${maybe.getValue()})`);
  }

  done();
});

test("mapping just", (done): void => {
  const maybe: Maybe.Maybe<number> = Maybe.just("Test").map(
    (x: string): number => x.length
  );

  if (maybe.kind === "nothing") {
    done.fail("Expected Just(4), instead received Nothing");
  } else {
    expect(maybe.getValue()).toEqual(4);
  }

  done();
});

test("mapping nothing", (done): void => {
  const maybe = Maybe.nothing<string>().map((x: string): number => x.length);

  if (maybe.kind === "just") {
    done.fail(`Expected Nothing, instead received Just(${maybe.getValue()})`);
  }

  done();
});

test("flat mapping just", (done): void => {
  const maybe: Maybe.Maybe<number> = Maybe.just("Test").flatMap(
    (x: string): Maybe.Maybe<number> => Maybe.just(x.length)
  );

  if (maybe.kind === "nothing") {
    done.fail("Expected Just(4), instead received Nothing");
  } else {
    expect(maybe.getValue()).toEqual(4);
  }

  done();
});

test("flat mapping nothing", (done): void => {
  const maybe = Maybe.nothing<string>().flatMap(
    (x: string): Maybe.Maybe<number> => Maybe.just(x.length)
  );

  if (maybe.kind === "just") {
    done.fail(`Expected Nothing, instead received Just(${maybe.getValue()})`);
  }

  done();
});

test("withDefault just", (done): void => {
  const maybe: Maybe.Maybe<number> = Maybe.just(5);

  if (maybe.kind === "nothing") {
    done.fail("Expected Just(4), instead received Nothing");
  } else {
    expect(maybe.withDefault(0)).toEqual(5);
  }

  done();
});

test("withDefault nothing", (done): void => {
  const maybe = Maybe.nothing<number>();

  if (maybe.kind === "just") {
    done.fail(`Expected Nothing, instead received Just(${maybe.getValue()})`);
  } else {
    expect(maybe.withDefault(0)).toEqual(0);
  }

  done();
});

test("fromNullable", (done): void => {
  const maybe: Maybe.Maybe<number> = Maybe.fromNullable(5);

  if (maybe.kind === "nothing") {
    done.fail("Expected Just(5), instead received Nothing");
  } else {
    expect(maybe.getValue()).toEqual(5);
  }

  done();
});

test("fromNullable null", (done): void => {
  const maybe: Maybe.Maybe<number> = Maybe.fromNullable<number>(null);

  if (maybe.kind === "just") {
    done.fail(`Expected Nothing, instead received Just(${maybe.getValue()})`);
  }

  done();
});
