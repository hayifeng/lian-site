import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
  code?: string;
}

export const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Log error with timestamp and request info
  const timestamp = new Date().toISOString();
  const errorLog = {
    timestamp,
    statusCode,
    message,
    code: err.code,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  };

  // Console output for development
  if (statusCode >= 500) {
    console.error(`[ERROR] ${timestamp}:`, errorLog);
  } else {
    console.warn(`[WARN] ${timestamp}:`, errorLog);
  }

  // Send response
  res.status(statusCode).json({
    success: false,
    error: {
      message,
      code: err.code,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
};

// Not found handler
export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      message: `Route ${req.method} ${req.path} not found`,
      code: 'ROUTE_NOT_FOUND',
    },
  });
};

export const createError = (
  message: string,
  statusCode: number = 500,
  code?: string
): AppError => {
  const error: AppError = new Error(message);
  error.statusCode = statusCode;
  error.isOperational = true;
  error.code = code;
  return error;
};
