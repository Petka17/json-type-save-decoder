import { Decoder } from "../decoder";

const { field, string } = Decoder;

interface ListNode {
  value: number;
  next: ListNode | null;
}

test("Correct error on cyclical objects", (done): void => {
  const list: ListNode = { value: 5, next: { value: 2, next: null } };
  if (list.next) list.next.next = list;

  const result = field("value", string).decode(list);

  if (result.kind == "ok") {
    done.fail(`Expected Err(msg), instead got Ok(${result.getValue()}`);
  } else {
    expect(result.getError()).toMatch("[Cyclical Reference]");
  }

  done();
});
