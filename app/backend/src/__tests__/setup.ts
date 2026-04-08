import { vi } from 'vitest';

// Mock environment variables
process.env.JWT_SECRET = 'test-secret-key';
process.env.JWT_EXPIRES_IN = '1h';
process.env.DATABASE_URL = 'file:./test.db';
process.env.NODE_ENV = 'test';

// Increase timeout for integration tests
vi.setConfig({ testTimeout: 10000 });
