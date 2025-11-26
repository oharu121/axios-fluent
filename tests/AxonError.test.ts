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

    it('should NOT expose headers (removed property)', async () => {
      try {
        await client.get('/api/users/999').data();
      } catch (error) {
        if (error instanceof AxonError) {
          // @ts-expect-error - headers should not exist
          expect(error.headers).toBeUndefined();
        }
      }
    });

    it('should NOT expose originalError (removed property)', async () => {
      try {
        await client.get('/api/users/999').data();
      } catch (error) {
        if (error instanceof AxonError) {
          // @ts-expect-error - originalError should not exist
          expect(error.originalError).toBeUndefined();
        }
      }
    });

    it('should only expose the 5 essential properties', async () => {
      try {
        await client.get('/api/users/999').data();
      } catch (error) {
        if (error instanceof AxonError) {
          // Essential 5 properties
          expect(error.status).toBeDefined();
          expect(error.statusText).toBeDefined();
          expect(error.url).toBeDefined();
          expect(error.method).toBeDefined();
          expect(error.responseData).toBeDefined();

          // Should not have removed properties
          // @ts-expect-error - headers property was removed
          expect(error.headers).toBeUndefined();
          // @ts-expect-error - originalError property was removed
          expect(error.originalError).toBeUndefined();
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

    it('should pass through non-AxiosError errors', async () => {
      // Create a client with a custom axios instance that throws a non-AxiosError
      const customAxios: any = {
        get: () => Promise.reject(new Error('Custom non-Axios error')),
        post: () => Promise.reject(new Error('Custom non-Axios error')),
        put: () => Promise.reject(new Error('Custom non-Axios error')),
        patch: () => Promise.reject(new Error('Custom non-Axios error')),
        delete: () => Promise.reject(new Error('Custom non-Axios error')),
        head: () => Promise.reject(new Error('Custom non-Axios error')),
        options: () => Promise.reject(new Error('Custom non-Axios error')),
      };

      // @ts-expect-error - Testing with custom instance
      const clientWithCustomAxios = new Axon({}, customAxios);

      try {
        await clientWithCustomAxios.get('/test').data();
        expect.fail('Should have thrown an error');
      } catch (error) {
        // Should NOT be wrapped in AxonError since it's not an AxiosError
        expect(error).not.toBeInstanceOf(AxonError);
        expect(error).toBeInstanceOf(Error);
        if (error instanceof Error) {
          expect(error.message).toBe('Custom non-Axios error');
        }
      }
    });
  });

  describe('simplified error interface (5 essential properties)', () => {
    it('should provide all 5 essential properties for typical error handling', async () => {
      try {
        await client.get('/api/users/999').data();
        expect.fail('Should have thrown an error');
      } catch (error) {
        if (error instanceof AxonError) {
          // All 5 essential properties should be defined
          expect(error.status).toBe(404);
          expect(error.statusText).toBeDefined();
          expect(error.url).toContain('/api/users/999');
          expect(error.method).toBe('GET');
          expect(error.responseData).toEqual({ message: 'User not found' });
        }
      }
    });

    it('should support typical error logging pattern', async () => {
      try {
        await client.post('/api/users/999', { name: 'Test' }).data();
        expect.fail('Should have thrown an error');
      } catch (error) {
        if (error instanceof AxonError) {
          // This is what users typically need for logging
          const logMessage = `${error.method} ${error.url} failed with ${error.status} ${error.statusText}`;
          expect(logMessage).toContain('POST');
          expect(logMessage).toContain('/api/users/999');
          expect(logMessage).toContain('404');

          // Response data for details
          expect(error.responseData).toBeDefined();
        }
      }
    });

    it('should have clean property access without confusion', async () => {
      try {
        await client.get('/error/500').data();
        expect.fail('Should have thrown an error');
      } catch (error) {
        if (error instanceof AxonError) {
          // Clean, direct access to properties
          const status = error.status;           // number | undefined
          const statusText = error.statusText;   // string | undefined
          const url = error.url;                 // string | undefined
          const method = error.method;           // string | undefined
          const data = error.responseData;       // any

          expect(status).toBe(500);
          expect(statusText).toBeDefined();
          expect(url).toBeDefined();
          expect(method).toBe('GET');
          expect(data).toEqual({ message: 'Internal server error' });
        }
      }
    });

    it('should work with destructuring pattern', async () => {
      try {
        await client.get('/error/401').data();
        expect.fail('Should have thrown an error');
      } catch (error) {
        if (error instanceof AxonError) {
          // Users can destructure the 5 properties
          const { status, statusText, url, method, responseData } = error;

          expect(status).toBe(401);
          expect(statusText).toBeDefined();
          expect(url).toBeDefined();
          expect(method).toBe('GET');
          expect(responseData).toEqual({ message: 'Unauthorized' });
        }
      }
    });

    it('should support conditional error handling based on status', async () => {
      try {
        await client.get('/error/403').data();
        expect.fail('Should have thrown an error');
      } catch (error) {
        if (error instanceof AxonError) {
          // Common pattern: handle different status codes
          if (error.status === 401) {
            // Refresh token
            expect(false).toBe(true);
          } else if (error.status === 403) {
            // Permission denied
            expect(true).toBe(true);
          } else if (error.status && error.status >= 500) {
            // Server error
            expect(false).toBe(true);
          }
        }
      }
    });

    it('should provide clean error object for logging services', async () => {
      try {
        await client.delete('/api/users/999').data();
        expect.fail('Should have thrown an error');
      } catch (error) {
        if (error instanceof AxonError) {
          // Create clean error object for logging service
          const errorLog = {
            status: error.status,
            statusText: error.statusText,
            url: error.url,
            method: error.method,
            responseData: error.responseData,
            message: error.message,
          };

          expect(errorLog.status).toBe(404);
          expect(errorLog.method).toBe('DELETE');
          expect(errorLog.url).toContain('/api/users/999');
          expect(errorLog.responseData).toBeDefined();
        }
      }
    });

    it('should not have deprecated properties', async () => {
      try {
        await client.get('/api/users/999').data();
        expect.fail('Should have thrown an error');
      } catch (error) {
        if (error instanceof AxonError) {
          // Verify removed properties don't exist
          const errorObj = error as any;

          // These should be undefined (removed)
          expect(errorObj.headers).toBeUndefined();
          expect(errorObj.originalError).toBeUndefined();

          // Only these 5 + inherited Error properties should exist
          const ownProps = Object.getOwnPropertyNames(error);
          const expectedProps = ['status', 'statusText', 'responseData', 'url', 'method'];

          // Check that our 5 properties are present
          expectedProps.forEach(prop => {
            expect(ownProps).toContain(prop);
          });

          // Check that removed properties are not present
          expect(ownProps).not.toContain('headers');
          expect(ownProps).not.toContain('originalError');
        }
      }
    });

    it('should provide all necessary info for error messages', async () => {
      try {
        await client.put('/api/users/999', { name: 'Updated' }).data();
        expect.fail('Should have thrown an error');
      } catch (error) {
        if (error instanceof AxonError) {
          // Example: Create user-friendly error message
          let userMessage = `Request failed`;

          if (error.status === 404) {
            userMessage = 'Resource not found';
          } else if (error.status === 401) {
            userMessage = 'Please log in again';
          } else if (error.status && error.status >= 500) {
            userMessage = 'Server error, please try again later';
          }

          // All info needed for debugging
          expect(error.method).toBe('PUT');
          expect(error.url).toContain('/api/users/999');
          expect(error.status).toBe(404);
          expect(error.responseData).toBeDefined();
          expect(userMessage).toBe('Resource not found');
        }
      }
    });
  });
});
