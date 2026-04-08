import { Request, Response, NextFunction } from 'express';

// Extend Express Request to include startTime
declare global {
  namespace Express {
    interface Request {
      startTime?: number;
      requestId?: string;
    }
  }
}

// Generate simple request ID
const generateRequestId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

// Request logging middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  // Add request ID and start time
  req.requestId = generateRequestId();
  req.startTime = Date.now();

  const { method, path, requestId } = req;

  // Log incoming request
  console.log(`[${new Date().toISOString()}] --> ${method} ${path} [${requestId}]`);

  // Capture response finish
  res.on('finish', () => {
    const duration = req.startTime ? Date.now() - req.startTime : 0;
    const { statusCode } = res;

    // Colorize status code
    const statusColor = statusCode >= 500 ? '\x1b[31m' : // Red
                        statusCode >= 400 ? '\x1b[33m' : // Yellow
                        statusCode >= 300 ? '\x1b[36m' : // Cyan
                        '\x1b[32m'; // Green
    const reset = '\x1b[0m';

    console.log(
      `${statusColor}[${new Date().toISOString()}] <-- ${method} ${path} ${statusCode} ${duration}ms [${requestId}]${reset}`
    );
  });

  next();
};

// Performance monitoring middleware
export const performanceMonitor = (req: Request, res: Response, next: NextFunction) => {
  const start = process.hrtime.bigint();

  res.on('finish', () => {
    const end = process.hrtime.bigint();
    const durationMs = Number(end - start) / 1_000_000;

    // Log slow requests (> 1 second)
    if (durationMs > 1000) {
      console.warn(
        `[PERFORMANCE] Slow request: ${req.method} ${req.path} took ${durationMs.toFixed(2)}ms`
      );
    }
  });

  next();
};
