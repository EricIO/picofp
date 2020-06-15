/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * `MaybeMatcher` is a private class used for enabling some type of
 * rust/scala like matching. See the documentation for {@link Maybe.match}
 * for usage.
 */
interface MaybeMatcher<T,U,V> {
  Some: (some: T) => U;
  None: () => V;
}

/**
 * `Maybe` is an abstract class implementing the common Maybe/Option types
 * found in many functional (and other) languages. It is commonly used for
 * error handling to not have to deal with exceptions of null checking but
 * you don't want to pass any information about the error.
 *
 * An option is either something that contains a value, or a `Some`, or it
 * does not contain a value, a `None`.
 */
export abstract class Maybe<T> {
  readonly __tag: string;

  /**
   * isSome returns true if this is an instance of `Some` and false otherwise.
   * It is also used as a type guard allowing code like:
   *
   * ```
   * const some: Maybe<number> = new Some(10);
   * if (some.isOk()) { // You can access this.value in this block safely.
   *   return some.value;
   * }
   * ```
   *
   * Although this is not recommended (but hey I can't stop you). Instead use
   * one of the supplied methods to safely operate on the `Maybe`.
   */
  public isSome(): this is Some<T> {
    return this.__tag === 'Some';
  }

  /**
   * isNone returns true if this is an instance of `None` and false otherwise.
   * It is also used as a type guard allowing code like:
   *
   * ```
   * const none: Maybe<number> = new None();
   * if (some.isNone()) { // You can access well.. nothing in this block, but it is safe to do so.
   *   console.log("wat");
   * }
   * ```
   *
   * Although this is not recommended (but hey I can't stop you). Instead use
   * one of the supplied methods to safely operate on the `Maybe`.
   */
  public isNone(): this is None {
    return !this.isSome()
  }

  /**
   * `match` provides Scala and Rust _like_ facilites to match on the `Maybe` value. This is similar
   * to the functionality of {@link Maybe.unwrapOr} but the value for the None branch can be computed
   * from the function (such as enclosing a value from the parent scope).
   *
   * Example:
   * ```
   * const some: Maybe<number> = Some(10);
   * some.match({
   *     'Some': (value: T) => return value * 2,
   *     'None'; () => return 2,
   * });
   * ```
   */
  public match<U,V>(matcher: MaybeMatcher<T,U,V>): U | V {
    if (this.isSome()) {
      return matcher.Some(this.value);
    } else {
      return matcher.None();
    }
  }

  /**
   * `contains` will return true if this `Some` value contains the supplied value. In all other cases
   * it will return false.
   *
   *
   * Example:
   * ```
   * const some: Maybe<string> = new Some("string");
   * some.contains("string") // true
   * some.contains("false")  // false
   * (new None()).contains("anything") // false
   * ```
   */
  abstract contains(value: T): boolean

  /**
   * `unwrap` returns the value contained in the `Some` or throws an error.
   *
   * Example:
   * ```
   * const some: Maybe<number> = new Some(1);
   * some.unwrap() // 1
   * const none: Maybe<number> = new None();
   * none.unwrap() // Error thrown.
   * ```
   *
   */
  abstract unwrap(): T

  /**
   * `unwrapOr` returns the value contained in the `Some` or the supplied value.
   *
   * Example:
   * ```
   * const some: Maybe<number> = new Some(1);
   * some.unwrapOr(2) // 1
   * const none: Maybe<number> = new None();
   * none.unwrapOr(2) // 2
   * ```
   *
   */
  abstract unwrapOr(value: T): T

  /**
   * `map` applies the supplied function to the enclosed value in a `Some`. It will simply
   * pass through `None` values.
   *
   * Example:
   * ```
   * const some: Maybe<string> = new Some("string");
   * some.map((value) => value.length) // Some(6)
   *
   * const none: Maybe<string> = new None();
   * some.map((value) => value.length) // None
   * ```
   */
  abstract map<U>(fn: (value: T) => U): Maybe<U>

  /**
   * `mapOr` applies the supplied function to the enclosed value in a `Some` otherwise it will
   * return the supplied default.
   *
   * Example:
   * ```
   * const some: Maybe<string> = new Some("string");
   * some.map((value) => value.length, 10) // Some(6)
   *
   * const none: Maybe<string> = new None();
   * some.map((value) => value.length, 10) // Some(10)
   * ```
   */
  abstract mapOr<U>(fn: (value: T) => U, def: U): Maybe<U>

  /**
   * `flatMap` applies the supplied function to the enclosed value in a `Some`. The difference with
   * map is that the supplied function returns a Maybe allowing it to handle any errors with Maybes.
   *
   * Example:
   * ```
   * const some: Maybe<string> = new Some("string");
   * some.flatMap((value) => new Some(value.length)) // Some(6)
   *
   * const none: Maybe<string> = new None();
   * some.map((value) => new Some(10)) // Some(10)
   * ```
   */
  abstract flatMap<U>(fn: (value: T) => Maybe<U>): Maybe<U>
}

export class Some<T> extends Maybe<T> {
  readonly __tag = 'Some';
  readonly value: T

  constructor(value: T) {
    super()
    this.value = value
  }

  public contains(value: T): boolean {
    return this.value === value
  }

  public unwrap(): T {
    return this.value
  }

  public unwrapOr(_: T): T {
    return this.value
  }

  public map<U>(fn: (value: T) => U): Maybe<U> {
    return new Some(fn(this.value))
  }

  public mapOr<U>(fn: (value: T) => U, _: U): Maybe<U> {
    return new Some(fn(this.value))
  }

  public flatMap<U>(fn: (value: T) => Maybe<U>): Maybe<U> {
    return fn(this.value)
  }
}

export class None<T=never> extends Maybe<T> {
  readonly __tag = 'None';

  public contains(_: T): boolean {
    return false
  }

  public unwrap(): T{
    throw new Error("Unwrap called on None value");
  }

  public unwrapOr(def: T): T {
    return def
  }

  public map<U>(_: (value: T) => U): Maybe<U> {
    return new None()
  }

  public mapOr<U>(_: (value: T) => U, def: U): Maybe<U> {
    return new Some(def)
  }

  public flatMap<U>(_: (value: T) => Maybe<U>): Maybe<U> {
    return new None()
  }
}
