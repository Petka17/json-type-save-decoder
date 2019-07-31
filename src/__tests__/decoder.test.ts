import * as _ from "../decoder";

describe("Base case", (): void => {
  test("Base case: succeed", (done): void => {
    const res = _.succeed({}).decode({ x: 5 });

    if (res.kind === "err") {
      done.fail(`Expected Ok({}), instead got Err(${res.getError()}`);
    } else {
      expect(res.getValue()).toEqual({});
    }

    done();
  });

  test("Base case: fail", (done): void => {
    const msg = "Never decoded";
    const res = _.fail(msg).decode({ x: 5 });

    if (res.kind == "ok") {
      done.fail(`Expected Err(msg), instead got Ok(${res.getValue()}`);
    } else {
      expect(res.getError()).toEqual(msg);
    }

    done();
  });
});

describe("Primitives", (): void => {
  test("string", (done): void => {
    const str = "Some random string";
    const res = _.string.decode(str);

    if (res.kind == "err") {
      done.fail(`Expected Ok(str), instead got Err(${res.getError()}`);
    } else {
      expect(res.getValue()).toEqual(str);
    }

    done();
  });

  test("string, failed case", (done): void => {
    const notAStr = 5;
    const res = _.string.decode(notAStr);

    if (res.kind === "ok") {
      done.fail(`Expected Err(msg), instead got Ok(${res.getValue()}`);
    } else {
      expect(res.getError()).toEqual(_.getErrorMessage("string", notAStr));
    }

    done();
  });

  test("number", (done): void => {
    const num = 5.32;
    const res = _.number.decode(num);

    if (res.kind == "err") {
      done.fail(`Expected Ok(num), instead got Err(${res.getError()}`);
    } else {
      expect(res.getValue()).toEqual(num);
    }

    done();
  });

  test("number, failed case", (done): void => {
    const notANum = "4.3";
    const res = _.number.decode(notANum);

    if (res.kind === "ok") {
      done.fail(`Expected Err(msg), instead got Ok(${res.getValue()}`);
    } else {
      expect(res.getError()).toEqual(_.getErrorMessage("number", notANum));
    }

    done();
  });

  test("boolean", (done): void => {
    const bool = true;
    const res = _.boolean.decode(bool);

    if (res.kind == "err") {
      done.fail(`Expected Ok(bool), instead got Err(${res.getError()}`);
    } else {
      expect(res.getValue()).toEqual(bool);
    }

    done();
  });

  test("boolean, failed case", (done): void => {
    const notABool = "true";
    const res = _.boolean.decode(notABool);

    if (res.kind === "ok") {
      done.fail(`Expected Err(msg), instead got Ok(${res.getValue()}`);
    } else {
      expect(res.getError()).toEqual(_.getErrorMessage("boolean", notABool));
    }

    done();
  });
});

describe("Array and Record decoder", (): void => {
  test("field success case", (done): void => {
    const obj = { x: 5, y: "4", z: true };

    const res = _.succeed({})
      .assign("key", _.field("x", _.number))
      .assign("key2", _.field("y", _.string))
      .decode(obj);

    if (res.kind === "err") {
      done.fail(
        `Expected Ok({key: 5, key2: "4"}), instead got Err(${res.getError()}`
      );
    } else {
      expect(res.getValue()).toEqual({ key: obj.x, key2: obj.y });
    }

    done();
  });

  test("wrong field decoder", (done): void => {
    const obj = { x: "5", y: "4" };

    const res = _.succeed({})
      .assign("key", _.field("x", _.number))
      .decode(obj);

    if (res.kind === "ok") {
      done.fail(`Expected Err(msg), instead got Ok(${res.getValue()}`);
    } else {
      expect(res.getError()).toEqual(_.getErrorMessage("number", obj.x));
    }

    done();
  });

  test("failed base structure", (done): void => {
    const obj = { x: "5", y: "4" };
    const msg = "Previous decoder failed";

    const res = _.fail(msg)
      .assign("key", _.field("x", _.number))
      .decode(obj);

    if (res.kind === "ok") {
      done.fail(`Expected Err(msg), instead got Ok(${res.getValue()}`);
      return;
    }

    expect(res.getError()).toEqual(msg);

    done();
  });

  test("index success case", (done): void => {
    const arr = ["1", true, 5];

    const res = _.index(1, _.boolean).decode(arr);

    if (res.kind === "err") {
      done.fail(`Expected Ok(true), instead got Err(${res.getError()}`);
    } else {
      expect(res.getValue()).toEqual(true);
    }

    done();
  });

  test("array", (done): void => {
    const arr = ["1", "2", "type"];

    const res = _.array(_.string).decode(arr);

    if (res.kind === "err") {
      done.fail(`Expected Ok(${arr}), instead got Err(${res.getError()}`);
    } else {
      expect(res.getValue()).toEqual(arr);
    }

    done();
  });

  test("decode not array with array decoder", (done): void => {
    const notAnArray = { type: "2" };

    const res = _.array(_.string).decode(notAnArray);

    if (res.kind === "ok") {
      done.fail(`Expected Err(msg), instead got Ok(${res.getValue()}`);
    } else {
      expect(res.getError()).toEqual(_.getErrorMessage("array", notAnArray));
    }

    done();
  });

  test("decode inconsistent array", (done): void => {
    const inconsistentArray = ["1", 2, "type"];

    const res = _.array(_.string).decode(inconsistentArray);

    if (res.kind === "ok") {
      done.fail(`Expected Err(msg), instead got Ok(${res.getValue()}`);
    } else {
      expect(res.getError()).toEqual(
        _.getErrorMessage("string", inconsistentArray[1])
      );
    }

    done();
  });

  test("complex record", (done): void => {
    const obj = { x: 5, y: "4", z: { type: ["adv", "7"] } };

    const res = _.succeed({})
      .assign("key", _.field("x", _.number))
      .assign("key2", _.at(["z", "type", 0], _.string))
      .decode(obj);

    if (res.kind === "err") {
      done.fail(
        `Expected Ok({key: 5, key2: "adv"}), instead got Err(${res.getError()}`
      );
    } else {
      expect(res.getValue()).toEqual({ key: obj.x, key2: obj.z.type[0] });
    }

    done();
  });

  test("complex record: wrong path", (done): void => {
    const obj = { x: 5, y: "4", z: { type: ["adv", "7"] } };

    const res = _.succeed({})
      .assign("key", _.field("x", _.number))
      .assign("key2", _.at(["z", "t", 0], _.string))
      .decode(obj);

    if (res.kind === "ok") {
      done.fail(`Expected Err(msg), instead got Ok(${res.getValue()}`);
    } else {
      expect(res.getError()).toMatch(/Not existed path/);
    }

    done();
  });
});
