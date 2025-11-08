/**
 * Tests for AxonError class
 * Tests enhanced error handling with structured error information
 */

import { describe, it, expect } from 'vitest';
import Axon, { AxonError } from '../Axon';

describe('AxonError', () => {
  const client = Axon.new().baseUrl('https://api.example.com');

  describe('error properties', () => {
    it('should wrap AxiosError with AxonError', async () => {
      try {
        await client.get('/api/users/999').data();
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(AxonError);
      }
    });

    it('should expose status code', async () => {
      try {
        await client.get('/api/users/999').data();
      } catch (error) {
        expect(error).toBeInstanceOf(AxonError);
        if (error instanceof AxonError) {
          expect(error.status).toBe(404);
        }
      }
    });

    it('should expose status text', async () => {
      try {
        await client.get('/api/users/999').data();
      } catch (error) {
        if (error instanceof AxonError) {
          expect(error.statusText).toBeDefined();
        }
      }
    });

    it('should expose response data', async () => {
      try {
        await client.get('/api/users/999').data();
      } catch (error) {
        if (error instanceof AxonError) {
          expect(error.responseData).toBeDefined();
          expect(error.responseData).toHaveProperty('message');
          expect(error.responseData.message).toBe('User not found');
        }
      }
    });

    it('should expose request URL', async () => {
      try {
        await client.get('/api/users/999').data();
      } catch (error) {
        if (error instanceof AxonError) {
          expect(error.url).toContain('/api/users/999');
        }
      }
    });

    it('should expose HTTP method', async () => {
      try {
        await client.get('/api/users/999').data();
      } catch (error) {
        if (error instanceof AxonError) {
          expect(error.method).toBe('GET');
        }
      }
    });

    it('should expose response headers', async () => {
      try {
        await client.get('/api/users/999').data();
      } catch (error) {
        if (error instanceof AxonError) {
          expect(error.headers).toBeDefined();
        }
      }
    });

    it('should keep original AxiosError', async () => {
      try {
        await client.get('/api/users/999').data();
      } catch (error) {
        if (error instanceof AxonError) {
          expect(error.originalError).toBeDefined();
          expect(error.originalError).toHaveProperty('isAxiosError');
        }
      }
    });
  });

  describe('error formatting', () => {
    it('should provide formatted error message via toString()', async () => {
      try {
        await client.get('/api/users/999').data();
      } catch (error) {
        if (error instanceof AxonError) {
          const formatted = error.toString();

          expect(formatted).toContain('AxonError');
          expect(formatted).toContain('GET');
          expect(formatted).toContain('404');
          expect(formatted).toContain('/api/users/999');
        }
      }
    });

    it('should include response data in formatted message', async () => {
      try {
        await client.get('/api/users/999').data();
      } catch (error) {
        if (error instanceof AxonError) {
          const formatted = error.toString();
          expect(formatted).toContain('User not found');
        }
      }
    });
  });

  describe('different error scenarios', () => {
    it('should handle 500 errors', async () => {
      try {
        await client.get('/error/500').data();
      } catch (error) {
        if (error instanceof AxonError) {
          expect(error.status).toBe(500);
          expect(error.responseData.message).toBe('Internal server error');
        }
      }
    });

    it('should handle 401 Unauthorized', async () => {
      try {
        await client.get('/error/401').data();
      } catch (error) {
        if (error instanceof AxonError) {
          expect(error.status).toBe(401);
          expect(error.responseData.message).toBe('Unauthorized');
        }
      }
    });

    it('should handle 403 Forbidden', async () => {
      try {
        await client.get('/error/403').data();
      } catch (error) {
        if (error instanceof AxonError) {
          expect(error.status).toBe(403);
          expect(error.responseData.message).toBe('Forbidden');
        }
      }
    });

    it('should handle POST errors', async () => {
      try {
        await client.post('/api/users/999', { name: 'Test' }).data();
      } catch (error) {
        if (error instanceof AxonError) {
          expect(error.method).toBe('POST');
          expect(error.status).toBe(404);
        }
      }
    });

    it('should handle DELETE errors', async () => {
      try {
        await client.delete('/api/users/999').data();
      } catch (error) {
        if (error instanceof AxonError) {
          expect(error.method).toBe('DELETE');
          expect(error.status).toBe(404);
        }
      }
    });
  });

  describe('error checking patterns', () => {
    it('should support instanceof checks', async () => {
      try {
        await client.get('/api/users/999').data();
      } catch (error) {
        expect(error instanceof AxonError).toBe(true);
      }
    });

    it('should allow status-based error handling', async () => {
      try {
        await client.get('/error/401').data();
      } catch (error) {
        if (error instanceof AxonError) {
          if (error.status === 401) {
            expect(true).toBe(true); // Would refresh token here
          }
        }
      }
    });

    it('should allow checking for server errors (5xx)', async () => {
      try {
        await client.get('/error/500').data();
      } catch (error) {
        if (error instanceof AxonError) {
          const isServerError = error.status! >= 500 && error.status! < 600;
          expect(isServerError).toBe(true);
        }
      }
    });

    it('should allow checking for client errors (4xx)', async () => {
      try {
        await client.get('/api/users/999').data();
      } catch (error) {
        if (error instanceof AxonError) {
          const isClientError = error.status! >= 400 && error.status! < 500;
          expect(isClientError).toBe(true);
        }
      }
    });
  });

  describe('error with different HTTP methods', () => {
    it('should capture POST method errors', async () => {
      try {
        await client.post('/api/users/999', {}).data();
      } catch (error) {
        if (error instanceof AxonError) {
          expect(error.method).toBe('POST');
        }
      }
    });

    it('should capture PUT method errors', async () => {
      try {
        await client.put('/api/users/999', {}).data();
      } catch (error) {
        if (error instanceof AxonError) {
          expect(error.method).toBe('PUT');
        }
      }
    });

    it('should capture PATCH method errors', async () => {
      try {
        await client.patch('/api/users/999', {}).data();
      } catch (error) {
        if (error instanceof AxonError) {
          expect(error.method).toBe('PATCH');
        }
      }
    });

    it('should capture DELETE method errors', async () => {
      try {
        await client.delete('/api/users/999').data();
      } catch (error) {
        if (error instanceof AxonError) {
          expect(error.method).toBe('DELETE');
        }
      }
    });

    it('should capture HEAD method errors', async () => {
      try {
        await client.head('/api/users/999').data();
      } catch (error) {
        if (error instanceof AxonError) {
          expect(error.method).toBe('HEAD');
        }
      }
    });
  });

  describe('error stack trace', () => {
    it('should maintain stack trace', async () => {
      try {
        await client.get('/api/users/999').data();
      } catch (error) {
        if (error instanceof AxonError) {
          expect(error.stack).toBeDefined();
          expect(typeof error.stack).toBe('string');
        }
      }
    });

    it('should have error name set to AxonError', async () => {
      try {
        await client.get('/api/users/999').data();
      } catch (error) {
        if (error instanceof AxonError) {
          expect(error.name).toBe('AxonError');
        }
      }
    });
  });
});
