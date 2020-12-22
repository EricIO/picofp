import { Result, Ok, Err, ok, err } from '../src/Result';

describe("Ok functions", () => {
  it("isOk should return true", () => {
    const ok: Result<string, never> = new Ok("string");
    expect(ok.isOk()).toBe(true);
  });

  it("isErr should return false", () => {
    const ok: Result<number, never> = new Ok(1.0);
    expect(ok.isErr()).toBe(false);
  });

  it("match on Ok result should return result of Ok branch", () => {
    const ok: Result<number, string> = new Ok(2);
    const match = ok.match({
      'Ok': (num) => num ** 2,
      'Err': (err) => err.length
    });

    expect(match).toBe(4);
  });

  it("contains should return true when the value is contained in the Ok value", () => {
    const ok: Result<string, never> = new Ok("foo");
    expect(ok.contains("foo")).toBe(true);
  });

  it("contains should return false when the value is not contained in the Ok value", () => {
    const ok: Result<string, never> = new Ok("foo");
    expect(ok.contains("bar")).toBe(false);
  });

  it("unwrap should return the contained value when called on Ok value", () => {
    const ok: Result<string, never> = new Ok("cow");
    expect(ok.unwrap()).toBe("cow");
  });

  it("unwrapOr should returned the contained value when called on a Ok value", () => {
    const ok: Result<number, never> = new Ok(42);
    expect(ok.unwrapOr(117)).toBe(42);
  })

  it("map should map the contained value given the function when called on a Ok value", () => {
    const ok: Result<number, string> = new Ok(2);
    const mapped = ok.map((val) => val * 2);
    expect(mapped.isOk()).toBe(true);
    expect(mapped.unwrap()).toBe(4);
  });

  it("mapOr should map the contained value given the function when called on a Ok value", () => {
    const ok: Result<number, string> = new Ok(4);
    const mapped = ok.mapOr((val) => val * 2, 10);
    expect(mapped.isOk()).toBe(true);
    expect(mapped.unwrap()).toBe(8);
  });

  it("flatMap should map the contained value given the function when called on a Ok value", () => {
    const ok: Result<string, number> = new Ok("string");
    const mapped = ok.flatMap((val) => new Ok(val.length))
    expect(mapped.isOk()).toBe(true);
    expect(mapped.unwrap()).toBe(6);
  });

  it("should be able to use the convenience function ok", () => {
    const res = ok("test")
    expect(res.isOk()).toBe(true);
    expect(res.unwrap()).toBe("test");
  });
});

describe("Err functions", () => {
  it("isOk should return false", () => {
    const err: Result<string, string> = new Err("An error occurred");
    expect(err.isOk()).toBe(false);
  });

  it("isErr should return true", () => {
    const err: Result<number, number> = new Err(42);
    expect(err.isErr()).toBe(true);
  });

  it("match on Err result should return result of Err branch", () => {
    const err: Result<number, string> = new Err("Cow");
    const match = err.match({
      'Ok': (num) => num ** 2,
      'Err': (err) => err.length
    });

    expect(match).toBe(3);
  });

  it("contains should return false when called on a Err value", () => {
    const err: Result<string, string> = new Err("haz error");
    expect(err.contains("baz")).toBe(false);
  });

  it("unwrap should throw an error when called on a Err value", () => {
    const err: Result<number, string> = new Err("Unwrap called on error result");
    expect(() => err.unwrap()).toThrowError("Unwrap called on error result");
  });

  it("unwrapOr should return the default value when called on a Err value", () => {
    const err: Result<string, string> = new Err("Default");
    expect(err.unwrapOr("default")).toBe("default");
  });

  it("map should return a Err value when called on a Err value", () => {
      const err: Result<string, string> = new Err("string");
      const mapped = err.map((value) => value.length)
      expect(mapped.isErr()).toBe(true);
  });

  it("calling map on successive Err values should return err", () => {
    const err: Result<number, string> = new Err("Error");
    const fn = (value: number) => { return value * 2};
    expect(err.map(fn).map(fn).map(fn).isErr()).toBe(true);
  });

  it("mapOr should return the default value when called on a err value", () => {
    const err: Result<string, string> = new Err("Default");
    const fn = (value: string) => { return value };
    const mapped = err.mapOr(fn, "foo")
    expect(mapped.unwrap()).toBe("foo");
  });

  it("flatMap should return Err when called on a Err value", () => {
    const err: Result<string, string> = new Err("Error");
    const mapped = err.flatMap((value) => new Ok(value))
    expect(mapped.isErr()).toBe(true);
    if (mapped.isErr()) {
      expect(mapped.error).toBe("Error");
    }
  });

  it("should be able to use the convenience function err", () => {
    const res = err("error")
    expect(res.isErr()).toBe(true);
    if (res.isErr()) expect(res.error).toBe("error");
  });
})
