import * as r from "../result";

test("should ", () => {
  const x = r.ok(5);
  const y = r.map((t: number) => t + 1, x);
  expect(y.kind).toBe("ok");
  expect(r.withDefault(0, y)).toBe(6);
});
