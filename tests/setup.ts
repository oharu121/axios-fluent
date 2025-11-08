/**
 * Test setup file
 * Configures MSW (Mock Service Worker) to intercept HTTP requests in tests
 */

import { beforeAll, afterEach, afterAll } from 'vitest';
import { setupServer } from 'msw/node';
import { handlers } from './mocks/handlers';

// Create MSW server with request handlers
export const server = setupServer(...handlers);

// Start server before all tests
beforeAll(() => {
  server.listen({
    onUnhandledRequest: 'warn', // Warn on requests not handled by MSW
  });
});

// Reset handlers after each test
afterEach(() => {
  server.resetHandlers();
});

// Clean up after all tests
afterAll(() => {
  server.close();
});
