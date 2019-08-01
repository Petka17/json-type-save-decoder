import { Result, ok, err, tryCatch } from "./result";
import { stringify } from "./utils";

type DecoderFn<A> = (thing: any) => Result<string, A>;

type stringOrNumber = string | number;
export class Decoder<A> {
  public constructor(private fn: DecoderFn<A>) {}

  public decode(value: any): Result<string, A> {
    return this.fn(value);
  }

  public map<B>(fn: (_: A) => B): Decoder<B> {
    return new Decoder<B>(
      (value: any): Result<string, B> => this.decode(value).map(fn)
    );
  }

  public flatMap<B>(fn: (_: A) => Decoder<B>): Decoder<B> {
    return new Decoder<B>(
      (value: any): Result<string, B> =>
        this.decode(value).flatMap(
          (decoded: A): Result<string, B> => fn(decoded).decode(value)
        )
    );
  }

  public assign<B>(
    key: string,
    other: Decoder<B>
  ): Decoder<A & { [key in string]: B }> {
    type ResultObject = A & { [key in string]: B };

    return this.flatMap(
      (decoded: A): Decoder<ResultObject> =>
        other.map(
          (b: B): ResultObject => ({
            ...decoded,
            [key]: b
          })
        )
    );
  }

  //--- BASE CASES ---
  public static succeed = <A>(value: A): Decoder<A> =>
    new Decoder((_): Result<string, A> => ok(value));

  public static fail = <A>(message: string): Decoder<A> =>
    new Decoder((_): Result<string, A> => err(message));

  //--- PRIMITIVES ---
  public static string: Decoder<string> = new Decoder(
    (value: any): Result<string, string> => {
      if (typeof value === "string") return ok(value);

      return err(getErrorMessage("string", value));
    }
  );

  public static number: Decoder<number> = new Decoder(
    (value: any): Result<string, number> => {
      if (typeof value === "number") return ok(value);

      return err(getErrorMessage("number", value));
    }
  );

  public static boolean: Decoder<boolean> = new Decoder(
    (value: any): Result<string, boolean> => {
      if (typeof value === "boolean") return ok(value);

      return err(getErrorMessage("boolean", value));
    }
  );
  // TODO: Add booleanExt: "true"/"false", "Y"/"N", 0/1...
  // TODO: Date decoder

  //--- ARRAY and OBJECT PRIMITIVES ---
  public static field = <A>(
    fieldName: string,
    decoder: Decoder<A>
  ): Decoder<A> =>
    new Decoder(
      (value: Record<string, any>): Result<string, A> =>
        decoder
          .decode(value[fieldName])
          .mapError(
            (e: string): string =>
              `There is an error in the field [${name}] of ${stringify(
                value
              )}: ${e}`
          )
    );

  public static index = <A>(index: number, decoder: Decoder<A>): Decoder<A> =>
    new Decoder(
      (value: Record<string, any>): Result<string, A> =>
        decoder.decode(value[index])
    );

  public static at = <A>(
    keys: stringOrNumber[],
    decoder: Decoder<A>
  ): Decoder<A> =>
    new Decoder(
      (value: any): Result<string, A> => {
        const valueAtPath: Result<string, any> = tryCatch((): any =>
          keys.reduce((acc: any, key: stringOrNumber): any => acc[key], value)
        );

        return valueAtPath.kind === "ok"
          ? decoder.decode(valueAtPath.getValue())
          : err(
              `Not existed path ${keys} in ${stringify(
                value
              )}.\n${valueAtPath.getError()}`
            );
      }
    );

  //--- DATA STRUCTURES ---
  public static array = <A>(decoder: Decoder<A>): Decoder<A[]> =>
    new Decoder(
      (value: any): Result<string, A[]> => {
        if (!(value instanceof Array)) {
          return err(getErrorMessage("array", value));
        }

        let result: Result<string, A[]> = ok([]);
        let item: Result<string, A>;

        for (let i = 0; i < value.length; i++) {
          item = decoder.decode(value[i]);

          if (item.kind === "ok") {
            const v = item.getValue();
            result = result.map((list: A[]): A[] => list.concat(v));
          } else {
            return err(item.getError());
          }
        }

        return result;
      }
    );

  //--- INCONSISTENT STRUCTURES ---
  // maybe : Decoder a -> Decoder (Maybe a)
  // nullable:
  // oneOf : List (Decoder a) -> Decoder a
}

export const getErrorMessage = (expected: string, value: any): string =>
  `I expected to find a **${expected.toUpperCase()}** but instead I found ${stringify(
    value
  )}`;
