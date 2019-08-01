import { Decoder, getErrorMessage } from "../decoder";

describe("Base case", (): void => {
  test("succeed", (done): void => {
    const result = Decoder.succeed({}).decode({ x: 5 });

    if (result.kind === "err") {
      done.fail(`Expected Ok({}), instead got Err(${result.getError()}`);
    } else {
      expect(result.getValue()).toEqual({});
    }

    done();
  });

  test("fail", (done): void => {
    const msg = "Never decoded";
    const result = Decoder.fail(msg).decode({ x: 5 });

    if (result.kind == "ok") {
      done.fail(`Expected Err(msg), instead got Ok(${result.getValue()}`);
    } else {
      expect(result.getError()).toEqual(msg);
    }

    done();
  });
});

describe("Primitives", (): void => {
  test("string", (done): void => {
    const str = "Some random string";
    const result = Decoder.string.decode(str);

    if (result.kind == "err") {
      done.fail(`Expected Ok(str), instead got Err(${result.getError()}`);
    } else {
      expect(result.getValue()).toEqual(str);
    }

    done();
  });

  test("string, failed case", (done): void => {
    const notAStr = 5;
    const result = Decoder.string.decode(notAStr);

    if (result.kind === "ok") {
      done.fail(`Expected Err(msg), instead got Ok(${result.getValue()}`);
    } else {
      expect(result.getError()).toEqual(getErrorMessage("string", notAStr));
    }

    done();
  });

  test("number", (done): void => {
    const num = 5.32;
    const result = Decoder.number.decode(num);

    if (result.kind == "err") {
      done.fail(`Expected Ok(num), instead got Err(${result.getError()}`);
    } else {
      expect(result.getValue()).toEqual(num);
    }

    done();
  });

  test("number, failed case", (done): void => {
    const notANum = "4.3";
    const result = Decoder.number.decode(notANum);

    if (result.kind === "ok") {
      done.fail(`Expected Err(msg), instead got Ok(${result.getValue()}`);
    } else {
      expect(result.getError()).toEqual(getErrorMessage("number", notANum));
    }

    done();
  });

  test("boolean", (done): void => {
    const bool = true;
    const result = Decoder.boolean.decode(bool);

    if (result.kind == "err") {
      done.fail(`Expected Ok(bool), instead got Err(${result.getError()}`);
    } else {
      expect(result.getValue()).toEqual(bool);
    }

    done();
  });

  test("boolean, failed case", (done): void => {
    const notABool = "true";
    const result = Decoder.boolean.decode(notABool);

    if (result.kind === "ok") {
      done.fail(`Expected Err(msg), instead got Ok(${result.getValue()}`);
    } else {
      expect(result.getError()).toEqual(getErrorMessage("boolean", notABool));
    }

    done();
  });
});

describe("Array and Record decoder", (): void => {
  test("field success case", (done): void => {
    const obj = { x: 5, y: "4", z: true };

    const result = Decoder.succeed({})
      .assign("key", Decoder.field("x", Decoder.number))
      .assign("key2", Decoder.field("y", Decoder.string))
      .decode(obj);

    if (result.kind === "err") {
      done.fail(
        `Expected Ok({key: 5, key2: "4"}), instead got Err(${result.getError()}`
      );
    } else {
      expect(result.getValue()).toEqual({ key: obj.x, key2: obj.y });
    }

    done();
  });

  test("wrong field decoder", (done): void => {
    const obj = { x: "5", y: "4" };

    const result = Decoder.succeed({})
      .assign("key", Decoder.field("x", Decoder.number))
      .decode(obj);

    if (result.kind === "ok") {
      done.fail(`Expected Err(msg), instead got Ok(${result.getValue()}`);
    } else {
      expect(result.getError()).toMatch(getErrorMessage("number", obj.x));
    }

    done();
  });

  test("failed base structure", (done): void => {
    const obj = { x: "5", y: "4" };
    const msg = "Previous decoder failed";

    const result = Decoder.fail(msg)
      .assign("key", Decoder.field("x", Decoder.number))
      .decode(obj);

    if (result.kind === "ok") {
      done.fail(`Expected Err(msg), instead got Ok(${result.getValue()}`);
      return;
    }

    expect(result.getError()).toEqual(msg);

    done();
  });

  test("index success case", (done): void => {
    const arr = ["1", true, 5];

    const result = Decoder.index(1, Decoder.boolean).decode(arr);

    if (result.kind === "err") {
      done.fail(`Expected Ok(true), instead got Err(${result.getError()}`);
    } else {
      expect(result.getValue()).toEqual(true);
    }

    done();
  });

  test("array", (done): void => {
    const arr = ["1", "2", "type"];

    const result = Decoder.array(Decoder.string).decode(arr);

    if (result.kind === "err") {
      done.fail(`Expected Ok(${arr}), instead got Err(${result.getError()}`);
    } else {
      expect(result.getValue()).toEqual(arr);
    }

    done();
  });

  test("decode not array with array decoder", (done): void => {
    const notAnArray = { type: "2" };

    const result = Decoder.array(Decoder.string).decode(notAnArray);

    if (result.kind === "ok") {
      done.fail(`Expected Err(msg), instead got Ok(${result.getValue()}`);
    } else {
      expect(result.getError()).toEqual(getErrorMessage("array", notAnArray));
    }

    done();
  });

  test("decode inconsistent array", (done): void => {
    const inconsistentArray = ["1", 2, "type"];

    const result = Decoder.array(Decoder.string).decode(inconsistentArray);

    if (result.kind === "ok") {
      done.fail(`Expected Err(msg), instead got Ok(${result.getValue()}`);
    } else {
      expect(result.getError()).toEqual(
        getErrorMessage("string", inconsistentArray[1])
      );
    }

    done();
  });

  test("complex record", (done): void => {
    const obj = { x: 5, y: "4", z: { type: ["adv", "7"] } };

    const result = Decoder.succeed({})
      .assign("key", Decoder.field("x", Decoder.number))
      .assign("key2", Decoder.at(["z", "type", 0], Decoder.string))
      .decode(obj);

    if (result.kind === "err") {
      done.fail(
        `Expected Ok({key: 5, key2: "adv"}), instead got Err(${result.getError()}`
      );
    } else {
      expect(result.getValue()).toEqual({ key: obj.x, key2: obj.z.type[0] });
    }

    done();
  });

  test("complex record: wrong path", (done): void => {
    const obj = { x: 5, y: "4", z: { type: ["adv", "7"] } };

    const result = Decoder.succeed({})
      .assign("key", Decoder.field("x", Decoder.number))
      .assign("key2", Decoder.at(["z", "t", 0], Decoder.string))
      .decode(obj);

    if (result.kind === "ok") {
      done.fail(`Expected Err(msg), instead got Ok(${result.getValue()}`);
    } else {
      expect(result.getError()).toMatch(/Not existed path/);
    }

    done();
  });
});
