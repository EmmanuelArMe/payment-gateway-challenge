/**
 * Railway Oriented Programming - Result type
 * Allows chaining operations that can succeed or fail
 */

export class Result<T, E = string> {
  private constructor(
    private readonly _isSuccess: boolean,
    private readonly _value?: T,
    private readonly _error?: E,
  ) {}

  get isSuccess(): boolean {
    return this._isSuccess;
  }

  get isFailure(): boolean {
    return !this._isSuccess;
  }

  get value(): T {
    if (!this._isSuccess) {
      throw new Error('Cannot get value of a failed result');
    }
    return this._value as T;
  }

  get error(): E {
    if (this._isSuccess) {
      throw new Error('Cannot get error of a successful result');
    }
    return this._error as E;
  }

  static ok<T, E = string>(value: T): Result<T, E> {
    return new Result<T, E>(true, value, undefined);
  }

  static fail<T, E = string>(error: E): Result<T, E> {
    return new Result<T, E>(false, undefined, error);
  }

  map<U>(fn: (value: T) => U): Result<U, E> {
    if (this._isSuccess) {
      return Result.ok<U, E>(fn(this._value as T));
    }
    return Result.fail<U, E>(this._error as E);
  }

  flatMap<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
    if (this._isSuccess) {
      return fn(this._value as T);
    }
    return Result.fail<U, E>(this._error as E);
  }

  mapError<F>(fn: (error: E) => F): Result<T, F> {
    if (this._isSuccess) {
      return Result.ok<T, F>(this._value as T);
    }
    return Result.fail<T, F>(fn(this._error as E));
  }

  fold<U>(onSuccess: (value: T) => U, onFailure: (error: E) => U): U {
    if (this._isSuccess) {
      return onSuccess(this._value as T);
    }
    return onFailure(this._error as E);
  }
}
