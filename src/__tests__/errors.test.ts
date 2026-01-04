/**
 * Error Handling and Response Tests
 */

import { 
  AppError, 
  ValidationError, 
  NotFoundError, 
  RateLimitError, 
  UnauthorizedError,
  isAppError,
  getErrorMessage,
  getErrorStatusCode,
} from '../lib/errors';

describe('Custom Error Classes', () => {
  describe('AppError', () => {
    test('creates error with default status code', () => {
      const error = new AppError('Something went wrong');
      expect(error.message).toBe('Something went wrong');
      expect(error.statusCode).toBe(500);
      expect(error.name).toBe('AppError');
    });

    test('creates error with custom status code', () => {
      const error = new AppError('Bad request', 400, 'BAD_REQUEST');
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('BAD_REQUEST');
    });
  });

  describe('ValidationError', () => {
    test('has correct status code and code', () => {
      const error = new ValidationError('Validation failed');
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.name).toBe('ValidationError');
    });

    test('includes field errors', () => {
      const error = new ValidationError('Validation failed', {
        email: ['Invalid email'],
        password: ['Too short', 'Must contain number'],
      });
      expect(error.errors).toEqual({
        email: ['Invalid email'],
        password: ['Too short', 'Must contain number'],
      });
    });
  });

  describe('NotFoundError', () => {
    test('formats message correctly', () => {
      const error = new NotFoundError('Product');
      expect(error.message).toBe('Product not found');
      expect(error.statusCode).toBe(404);
      expect(error.code).toBe('NOT_FOUND');
    });
  });

  describe('RateLimitError', () => {
    test('has correct status code', () => {
      const error = new RateLimitError();
      expect(error.message).toBe('Too many requests. Please try again later.');
      expect(error.statusCode).toBe(429);
      expect(error.code).toBe('RATE_LIMIT');
    });
  });

  describe('UnauthorizedError', () => {
    test('has default message', () => {
      const error = new UnauthorizedError();
      expect(error.message).toBe('Unauthorized');
      expect(error.statusCode).toBe(401);
    });

    test('accepts custom message', () => {
      const error = new UnauthorizedError('Invalid token');
      expect(error.message).toBe('Invalid token');
    });
  });
});

describe('Error Helper Functions', () => {
  describe('isAppError', () => {
    test('returns true for AppError instances', () => {
      expect(isAppError(new AppError('test'))).toBe(true);
      expect(isAppError(new ValidationError('test'))).toBe(true);
      expect(isAppError(new NotFoundError('test'))).toBe(true);
    });

    test('returns false for non-AppError', () => {
      expect(isAppError(new Error('test'))).toBe(false);
      expect(isAppError('error string')).toBe(false);
      expect(isAppError(null)).toBe(false);
      expect(isAppError(undefined)).toBe(false);
    });
  });

  describe('getErrorMessage', () => {
    test('extracts message from Error', () => {
      expect(getErrorMessage(new Error('test message'))).toBe('test message');
    });

    test('returns default for non-Error', () => {
      expect(getErrorMessage('string error')).toBe('An unexpected error occurred');
      expect(getErrorMessage(null)).toBe('An unexpected error occurred');
      expect(getErrorMessage(123)).toBe('An unexpected error occurred');
    });
  });

  describe('getErrorStatusCode', () => {
    test('extracts status from AppError', () => {
      expect(getErrorStatusCode(new ValidationError('test'))).toBe(400);
      expect(getErrorStatusCode(new NotFoundError('test'))).toBe(404);
      expect(getErrorStatusCode(new RateLimitError())).toBe(429);
    });

    test('returns 500 for non-AppError', () => {
      expect(getErrorStatusCode(new Error('test'))).toBe(500);
      expect(getErrorStatusCode('string')).toBe(500);
    });
  });
});
