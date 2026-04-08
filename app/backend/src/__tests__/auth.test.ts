import { describe, it, expect } from 'vitest';
import { createError, AppError } from '../middleware/errorHandler.js';

describe('Error Handler Middleware', () => {
  describe('createError', () => {
    it('should create an error with status code', () => {
      const error = createError('Test error', 400);

      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(400);
      expect(error.isOperational).toBe(true);
    });

    it('should create an error with default status code 500', () => {
      const error = createError('Server error');

      expect(error.statusCode).toBe(500);
    });

    it('should create an error with code', () => {
      const error = createError('Not found', 404, 'RESOURCE_NOT_FOUND');

      expect(error.code).toBe('RESOURCE_NOT_FOUND');
    });
  });

  describe('AppError interface', () => {
    it('should support custom properties', () => {
      const error: AppError = {
        name: 'CustomError',
        message: 'Custom error message',
        statusCode: 422,
        isOperational: true,
        code: 'CUSTOM_CODE',
      };

      expect(error.statusCode).toBe(422);
      expect(error.code).toBe('CUSTOM_CODE');
    });
  });
});
