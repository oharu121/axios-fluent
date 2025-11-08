/**
 * Backward Compatibility Tests
 * Ensures v0.2.0 is 100% compatible with v0.1.0 usage patterns
 */

import { describe, it, expect } from 'vitest';
import Axon from '../Axon';

describe('Backward Compatibility', () => {
  const client = Axon.new().baseUrl('https://api.example.com');

  describe('v0.1.0 await pattern', () => {
    it('should work with direct await (returns AxiosResponse)', async () => {
      const response = await client.get('/api/users');

      // v0.1.0 pattern - accessing response.data
      expect(response).toHaveProperty('data');
      expect(response).toHaveProperty('status');
      expect(response).toHaveProperty('headers');
      expect(response).toHaveProperty('config');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });

    it('should preserve AxiosResponse structure', async () => {
      const response = await client.get('/api/users/1');

      // All AxiosResponse properties should be present
      expect(response.data).toBeDefined();
      expect(response.status).toBeDefined();
      expect(response.statusText).toBeDefined();
      expect(response.headers).toBeDefined();
      expect(response.config).toBeDefined();
    });

    it('should work with POST', async () => {
      const newUser = { name: 'Test', email: 'test@example.com' };
      const response = await client.post('/api/users', newUser);

      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('id');
    });

    it('should work with PUT', async () => {
      const updates = { name: 'Updated' };
      const response = await client.put('/api/users/1', updates);

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('id');
    });

    it('should work with DELETE', async () => {
      const response = await client.delete('/api/users/1');

      expect(response.status).toBe(200);
    });
  });

  describe('v0.1.0 then/catch pattern', () => {
    it('should work with .then()', async () => {
      const result = await client.get('/api/users').then((response) => {
        expect(response.status).toBe(200);
        return response.data;
      });

      expect(Array.isArray(result)).toBe(true);
    });

    it('should work with .catch()', async () => {
      let errorCaught = false;

      await client.get('/api/users/999').catch((error) => {
        errorCaught = true;
        expect(error).toBeDefined();
      });

      expect(errorCaught).toBe(true);
    });

    it('should work with .finally()', async () => {
      let finallyCalled = false;

      await client.get('/api/users').finally(() => {
        finallyCalled = true;
      });

      expect(finallyCalled).toBe(true);
    });

    it('should chain then/catch/finally', async () => {
      let finallyCalled = false;

      const result = await client
        .get('/api/users')
        .then((response) => response.data)
        .catch((error) => [])
        .finally(() => {
          finallyCalled = true;
        });

      expect(result).toBeDefined();
      expect(finallyCalled).toBe(true);
    });
  });

  describe('v0.1.0 configuration methods', () => {
    it('should work with baseUrl', async () => {
      const response = await client.baseUrl('https://api.example.com').get('/api/users');

      expect(response.status).toBe(200);
    });

    it('should work with bearer token', async () => {
      const response = await client.bearer('token').get('/api/users');

      expect(response.status).toBe(200);
    });

    it('should work with json()', async () => {
      const response = await client.json().get('/api/users');

      expect(response.status).toBe(200);
    });

    it('should work with timeout', async () => {
      const response = await client.timeout(5000).get('/api/users');

      expect(response.status).toBe(200);
    });

    it('should work with params', async () => {
      const response = await client
        .params({ page: 1, limit: 10 })
        .get('/api/users');

      expect(response.status).toBe(200);
    });

    it('should work with setHeader', async () => {
      const response = await client
        .setHeader('X-Custom', 'value')
        .get('/api/users');

      expect(response.status).toBe(200);
    });
  });

  describe('v0.1.0 generic typing', () => {
    it('should work with typed GET', async () => {
      interface User {
        id: number;
        name: string;
        email: string;
      }

      const response = await client.get<User>('/api/users/1');

      // TypeScript should know response.data is User
      expect(response.data.id).toBeDefined();
      expect(response.data.name).toBeDefined();
      expect(response.data.email).toBeDefined();
    });

    it('should work with typed POST', async () => {
      interface User {
        id: number;
        name: string;
      }

      const response = await client.post<User>('/api/users', {
        name: 'Test',
      });

      expect(response.data.id).toBeDefined();
      expect(response.data.name).toBe('Test');
    });
  });

  describe('v0.1.0 error handling', () => {
    it('should catch errors in traditional way', async () => {
      try {
        await client.get('/api/users/999');
        expect.fail('Should have thrown');
      } catch (error: any) {
        // v0.1.0 code checking error.response
        expect(error).toBeDefined();
        expect(error.status).toBeDefined(); // Now AxonError
      }
    });

    it('should work with catch() method', async () => {
      const result = await client
        .get('/api/users/999')
        .catch((error) => {
          expect(error).toBeDefined();
          return { data: [], status: 200, statusText: 'OK', headers: {}, config: {} };
        });

      expect(result).toBeDefined();
    });
  });

  describe('Mixed usage (v0.1.0 + v0.2.0)', () => {
    it('should allow mixing old and new patterns', async () => {
      // Old pattern
      const response1 = await client.get('/api/users');
      const users1 = response1.data;

      // New pattern
      const users2 = await client.get('/api/users').data();

      // Both should work and return same data
      expect(users1).toEqual(users2);
    });

    it('should work in same codebase', async () => {
      // Old style
      const oldStyleResponse = await client.get('/api/users/1');
      const oldStyleUser = oldStyleResponse.data;

      // New style
      const newStyleUser = await client.get('/api/users/1').data();

      // Should be equivalent
      expect(oldStyleUser).toEqual(newStyleUser);
    });

    it('should allow gradual migration', async () => {
      const api = client.baseUrl('https://api.example.com').bearer('token');

      // Team member A uses old style
      const response = await api.get('/api/users');
      const usersOldWay = response.data;

      // Team member B uses new style
      const usersNewWay = await api.get('/api/users').data();

      // Both work
      expect(usersOldWay).toEqual(usersNewWay);
    });
  });

  describe('Return type compatibility', () => {
    it('should return Promise-like object', async () => {
      const responsePromise = client.get('/api/users');

      // Should have Promise methods
      expect(responsePromise.then).toBeDefined();
      expect(responsePromise.catch).toBeDefined();
      expect(responsePromise.finally).toBeDefined();

      // Should have convenience methods
      expect(responsePromise.data).toBeDefined();
      expect(responsePromise.status).toBeDefined();
      expect(responsePromise.headers).toBeDefined();
      expect(responsePromise.ok).toBeDefined();
    });

    it('should be awaitable like v0.1.0', async () => {
      // v0.1.0: const response = await client.get(...)
      const response = await client.get('/api/users');

      // Should return full AxiosResponse
      expect(response).toHaveProperty('data');
      expect(response).toHaveProperty('status');
    });
  });

  describe('Factory method compatibility', () => {
    it('should work with Axon.new()', () => {
      const instance = Axon.new();
      expect(instance).toBeDefined();
    });

    it('should work with allowInsecure option', () => {
      const instance = Axon.new({ allowInsecure: true });
      expect(instance).toBeDefined();
    });

    it('should work with default options', () => {
      const instance = Axon.new();
      expect(instance).toBeDefined();
    });
  });
});
