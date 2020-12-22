import { Maybe, none, None, some, Some } from '../src/Maybe';

describe("Some functions", () => {
  it("isSome should return true", () => {
    const some: Maybe<string> = new Some("string");
    expect(some.isSome()).toBe(true);
  });

  it("isNone should return false", () => {
    const some: Maybe<number> = new Some(1.0);
    expect(some.isNone()).toBe(false);
  });

  it("match on Some result should return result of Some branch", () => {
    const some: Maybe<number> = new Some(4);
    const match = some.match({
      'Some': (num) => num ** 2,
      'None': () => 10,
    });

    expect(match).toBe(16);
  });

  it("contains should return true when the value is contained in the Some value", () => {
    const some: Maybe<string> = new Some("foo");
    expect(some.contains("foo")).toBe(true);
  });

  it("contains should return false when the value is not contained in the Some value", () => {
    const some: Maybe<string> = new Some("foo");
    expect(some.contains("bar")).toBe(false);
  });

  it("unwrap should return the contained value when called on Some value", () => {
    const some: Maybe<string> = new Some("cow");
    expect(some.unwrap()).toBe("cow");
  });

  it("unwrapOr should returned the contained value when called on a Some value", () => {
    const some: Maybe<number> = new Some(42);
    expect(some.unwrapOr(117)).toBe(42);
  })

  it("map should map the contained value given the function when called on a Some value", () => {
    const some: Maybe<number> = new Some(2);
    const mapped = some.map((val) => val * 2);
    expect(mapped.isSome()).toBe(true);
    expect(mapped.unwrap()).toBe(4);
  });

  it("mapOr should map the contained value given the function when called on a Some value", () => {
    const some: Maybe<number> = new Some(4);
    const mapped = some.mapOr((val) => val * 2, 10);
    expect(mapped.isSome()).toBe(true);
    expect(mapped.unwrap()).toBe(8);
  });

  it("flatMap should map the contained value given the function when called on a Some value", () => {
    const some: Maybe<string> = new Some("string");
    const mapped = some.flatMap((val) => new Some(val.length))
    expect(mapped.isSome()).toBe(true);
    expect(mapped.unwrap()).toBe(6);
  });

  it("should be able to use convenience function some", () => {
    const s = some("some string");
    expect(s.isSome()).toBe(true)
    expect(s.unwrap()).toBe("some string");
  });
});

describe("None functions", () => {
  it("isSome should return false", () => {
    const none: Maybe<string> = new None();
    expect(none.isSome()).toBe(false);
  });

  it("isNone should return true", () => {
    const none: Maybe<number> = new None();
    expect(none.isNone()).toBe(true);
  });

  it("match on None result should return result of None branch", () => {
    const none: Maybe<number> = new None();
    const match = none.match({
      'Some': (num) => num ** 2,
      'None': () => 10,
    });

    expect(match).toBe(10);
  });

  it("contains should return false when called on a None value", () => {
    const none: Maybe<string> = new None();
    expect(none.contains("baz")).toBe(false);
  });

  it("unwrap should throw an error when called on a None value", () => {
    const none: Maybe<number> = new None();
    expect(() => none.unwrap()).toThrowError();
  });

  it("unwrapOr should return the default value when called on a None value", () => {
    const none: Maybe<string> = new None();
    expect(none.unwrapOr("default")).toBe("default");
  });

  it("map should return a None value when called on a None value", () => {
      const none: Maybe<string> = new None();
      const mapped = none.map((value) => value.length)
      expect(mapped.isNone()).toBe(true);
    });

  it("calling map on successive None values should return None", () => {
    const none: Maybe<number> = new None();
    const fn = (value: number) => { return value * 2};
    expect(none.map(fn).map(fn).map(fn).isNone()).toBe(true);
  });

  it("mapOr should return the default value when called on a None value", () => {
    const none: Maybe<string> = new None();
    const fn = (value: string) => { return value.length };
    const mapped = none.mapOr(fn, 10)
    expect(mapped.unwrap()).toBe(10);
  });

  it("flatMap should return None when called on a None value", () => {
    const none: Maybe<string> = new None();
    const mapped = none.flatMap((value) => new Some(value.length))
    expect(mapped.isNone()).toBe(true);
  });

  it("should be able to use convenience function none", () => {
    const n = none();
    expect(n.isNone()).toBe(true)
  });
})
