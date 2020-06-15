/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Maybe, Some, None } from './Maybe';

interface ResultMatcher<T,U,E,F> {
  Ok: ((value: T) => U);
  Err: ((error: E) => F);
}

export abstract class Result<T,E> {
  readonly __tag: string

  /**
   * isOk returns true if this is an instance of `Ok` and false otherwise.
   * It is also used as a type guard allowing code like:
   *
   * ```
   * const ok: Result<number,string> = new Ok(10);
   * if (ok.isOk()) { // You can access this.value in this block safely.
   *   return ok.value;
   * }
   * ```
   *
   * Although this is not recommended (but hey I can't stop you). Instead use
   * one of the supplied methods to safely operate on the `Result`.
   */
  public isOk(): this is Ok<T,E> {
    return this.__tag === 'Ok'
  }

  /**
   * isErr returns true if this is an instance of `Err` and false otherwise.
   * It is also used as a type guard allowing code like:
   *
   * ```
   * const err: String<number, string> = new Err("Error");
   * if (err.isErr()) { // You can access the error value of the `Err` safely here.
   *   console.log(err.error);
   * }
   * ```
   *
   * Although this is not recommended (but hey I can't stop you). Instead use
   * one of the supplied methods to safely operate on the `Result`.
   */
  public isErr(): this is Err<T,E> {
    return !this.isOk()
  }

  /**
   * `match` provides Scala and Rust _like_ facilites to match on the `Result` value. This is similar
   * to the functionality of {@link Result.unwrapOr} but the value for the None branch can be computed
   * from the function (such as enclosing a value from the parent scope).
   *
   * Example:
   * ```
   * const ok: Maybe<number> = Ok(10);
   * ok.match({
   *     'Ok': (value: T) => return value * 2,
   *     'Err'; (error: E) => return error.length,
   * });
   * ```
   */
  public match<U, F>(matcher: ResultMatcher<T,U,E,F>): U | F {
    if (this.isOk()) {
      return matcher.Ok(this.value);
    } else if (this.isErr()) {
      return matcher.Err(this.error);
    }
  }

   /**
   * `contains` will return true if this `Ok` value contains the supplied value _or_ if the `Err`
   * contains the supplied value.
   *
   *
   * Example:
   * ```
   * const ok: Result<string, number> = new Ok("string");
   * some.contains("string") // true
   * some.contains("false")  // false
   *
   * const err: Result<string, number> = new Err(30);
   * err.contains(30); // true
   * ```
   */
  abstract contains(value: T | E): boolean

  /**
   * `ok` converts a `Result<T,E>` to an instance of a {@link Maybe<T>}
   */
  abstract ok(): Maybe<T>

  /**
   * `err` converts a `Result<T,E> to an instance of a {@link Maybe<E>}
   */
  abstract err(): Maybe<E>

  /**
   * `unwrap` returns the value contained in the `Ok` or throws an error.
   *
   * Example:
   * ```
   * const ok: Result<number, string> = new Ok(1);
   * ok.unwrap() // 1
   *
   * const err: Result<number, string> = new Err("Error");
   * none.unwrap() // Error thrown will be "Error".
   * ```
   *
   */
  abstract unwrap(): T

  /**
   * `unwrapOr` returns the value contained in the `Ok` or the supplied value.
   *
   * Example:
   * ```
   * const ok: Result<number, number> = new Ok(1);
   * ok.unwrapOr(2) // 1
   *
   * const err: Result<number, number> = new Err("error");
   * err.unwrapOr(2) // 2
   * ```
   *
   */
  abstract unwrapOr(value: T): T

  /**
   * `map` applies the supplied function to the enclosed value in a `Ok`. It will simply
   * pass through `Err` values.
   *
   * Example:
   * ```
   * const ok: Result<string, string> = new Ok("string");
   * ok.map((value) => value.length) // Ok(6)
   *
   * const err: Result<string, string> = new Err("Error");
   * err.map((value) => value.length) // Err("Error")
   * ```
   */
  abstract map<U>(fn: (value: T) => U): Result<U,E>

  /**
   * `mapOr` applies the supplied function to the enclosed value in a `Ok` or returns a new
   * result with the default value
   *
   * Example:
   * ```
   * const ok: Result<string, string> = new Ok("string");
   * ok.map((value) => value.length, 5) // Ok(6)
   *
   * const err: Result<string, string> = new Err("Error");
   * err.map((value) => value.length, 5) // Ok(5)
   * ```
   */
  abstract mapOr<U>(fn: (value: T) => U, def: U): Result<U,E>

  /**
   * `mapErr` applies the supplied function to the enclosed error in a `Err` leaving an `Ok` untouched.
   *
   * Example:
   * ```
   * const err: Result<string, string> = new Err("string");
   * err.mapErr((value) => `${value} and another error`) // Err("string and another error")
   *
   * const ok: Result<string, string> = new Ok("foo");
   * ok.map((value) => "new error string") // Ok("foo")
   * ```
   */
  abstract mapErr<U>(fn: (error: E) => U): Result<T,U>

  /**
   * `flatMap` applies the supplied function to the enclosed value in a `Ok`. The difference with map is
   * that the supplied function returns a Result allowing it to handle any errors with Results.
   *
   * Example:
   * ```
   * const ok: Result<string, number> = new Ok("string");
   * ok.flatMap((value) => new Ok(value.length)) // Ok(6)
   *
   * const err: Result<string, number> = new Err(42);
   * err.flapMap((value) => new Ok(10)) // Ok(10)
   * ```
   */
  abstract flatMap<U>(fn: (value: T) => Result<U,E>): Result<U,E>
}

export class Ok<T,E = never> extends Result<T,E> {
  readonly __tag = 'Ok'
  value: T

  constructor(value: T) {
    super()
    this.value = value
  }

  public contains(value: T): boolean {
    return this.value === value
  }

  public ok(): Maybe<T> {
    return new Some(this.value)
  }

  public err(): Maybe<E> {
    return new None();
  }

  public unwrap(): T {
    return this.value
  }

  public unwrapOr(_: T): T {
    return this.value;
  }

  public map<U>(fn: (value: T) => U): Result<U,E> {
    return new Ok(fn(this.value))
  }

  public mapOr<U>(fn: (value: T) => U, _: U): Result<U,E> {
    return new Ok(fn(this.value))
  }

  public mapErr<U>(_: (error: E) => U): Result<T,U> {
    return new Ok(this.value)
  }

  public flatMap<U>(fn: (value: T) => Result<U,E>): Result<U,E> {
    return fn(this.value)
  }
}

export class Err<T,E> extends Result<T,E> {
  readonly __tag = 'Err'
  readonly error: E

  constructor(error: E) {
    super()
    this.error = error;
  }

  public contains(error: E): boolean {
    return this.error === error;
  }

  public ok(): Maybe<T> {
    return new None()
  }

  public err(): Maybe<E> {
    return new Some(this.error);
  }

  public unwrap(): T {
    throw new Error(this.error.toString());
  }

  public unwrapOr(value: T): T {
    return value
  }

  public map<U>(_: (value: T) => U): Result<U,E> {
    return new Err(this.error)
  }

  public mapOr<U>(_: (value: T) => U, def: U): Result<U,E> {
    return new Ok(def)
  }

  public mapErr<U>(fn: (error: E) => U): Result<T,U> {
    return new Err(fn(this.error))
  }

  public flatMap<U>(_: (value: T) => Result<U,E>): Result<U,E> {
    return new Err(this.error)
  }
}

