import { Result } from './result';

describe('Result', () => {
  describe('ok', () => {
    it('should create a successful result', () => {
      const result = Result.ok('value');
      expect(result.isSuccess).toBe(true);
      expect(result.isFailure).toBe(false);
      expect(result.value).toBe('value');
    });

    it('should hold complex objects', () => {
      const obj = { id: '1', name: 'test' };
      const result = Result.ok(obj);
      expect(result.value).toEqual(obj);
    });

    it('should hold arrays', () => {
      const arr = [1, 2, 3];
      const result = Result.ok(arr);
      expect(result.value).toEqual(arr);
    });

    it('should hold null as a valid value', () => {
      const result = Result.ok(null);
      expect(result.isSuccess).toBe(true);
      expect(result.value).toBeNull();
    });
  });

  describe('fail', () => {
    it('should create a failed result', () => {
      const result = Result.fail('error message');
      expect(result.isSuccess).toBe(false);
      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('error message');
    });

    it('should throw when accessing value on failure', () => {
      const result = Result.fail('error');
      expect(() => result.value).toThrow('Cannot get value of a failed result');
    });

    it('should throw when accessing error on success', () => {
      const result = Result.ok('value');
      expect(() => result.error).toThrow(
        'Cannot get error of a successful result',
      );
    });
  });

  describe('map', () => {
    it('should transform value on success', () => {
      const result = Result.ok(5).map((x) => x * 2);
      expect(result.isSuccess).toBe(true);
      expect(result.value).toBe(10);
    });

    it('should not transform on failure', () => {
      const result = Result.fail<number>('error').map((x) => x * 2);
      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('error');
    });

    it('should chain multiple maps', () => {
      const result = Result.ok(2)
        .map((x) => x + 3)
        .map((x) => x * 10);
      expect(result.value).toBe(50);
    });
  });

  describe('flatMap', () => {
    it('should chain successful results', () => {
      const result = Result.ok(5).flatMap((x) => Result.ok(x * 2));
      expect(result.isSuccess).toBe(true);
      expect(result.value).toBe(10);
    });

    it('should short-circuit on failure', () => {
      const result = Result.ok(5).flatMap(() => Result.fail<number>('failed'));
      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('failed');
    });

    it('should not execute fn on failed result', () => {
      const fn = jest.fn(() => Result.ok(10));
      Result.fail<number>('error').flatMap(fn);
      expect(fn).not.toHaveBeenCalled();
    });
  });

  describe('mapError', () => {
    it('should transform error on failure', () => {
      const result = Result.fail<number>('err').mapError((e) => `mapped: ${e}`);
      expect(result.error).toBe('mapped: err');
    });

    it('should not transform on success', () => {
      const result = Result.ok<number>(5).mapError((e) => `mapped: ${e}`);
      expect(result.isSuccess).toBe(true);
      expect(result.value).toBe(5);
    });
  });

  describe('fold', () => {
    it('should call onSuccess for successful result', () => {
      const result = Result.ok(5).fold(
        (v) => `success: ${v}`,
        (e) => `failure: ${e}`,
      );
      expect(result).toBe('success: 5');
    });

    it('should call onFailure for failed result', () => {
      const result = Result.fail<number>('err').fold(
        (v) => `success: ${v}`,
        (e) => `failure: ${e}`,
      );
      expect(result).toBe('failure: err');
    });
  });
});
