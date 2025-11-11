/**
 * Tests for AxonResponse class
 * Tests convenience methods: .data(), .status(), .headers(), .ok()
 */

import { describe, it, expect } from 'vitest';
import Axon from '../Axon';

describe('AxonResponse', () => {
  const client = Axon.new().baseUrl('https://api.example.com');

  describe('.data()', () => {
    it('should extract response data directly', async () => {
      const users = await client.get('/api/users').data();

      expect(users).toBeDefined();
      expect(Array.isArray(users)).toBe(true);
      expect(users).toHaveLength(3);
      expect(users[0]).toHaveProperty('id');
      expect(users[0]).toHaveProperty('name');
    });

    it('should work with generic typing', async () => {
      interface User {
        id: number;
        name: string;
        email: string;
      }

      const user = await client.get<User>('/api/users/1').data();

      expect(user.id).toBe(1);
      expect(user.name).toBe('John Doe');
      expect(user.email).toBe('john@example.com');
    });

    it('should work with POST requests', async () => {
      const newUser = {
        name: 'New User',
        email: 'new@example.com',
      };

      const created = await client.post('/api/users', newUser).data();

      expect(created).toHaveProperty('id');
      expect(created.name).toBe('New User');
      expect(created.email).toBe('new@example.com');
    });

    it('should work with PUT requests', async () => {
      const updates = { name: 'Updated Name' };
      const updated = await client.put('/api/users/1', updates).data();

      expect(updated.id).toBe(1);
      expect(updated.name).toBe('Updated Name');
    });

    it('should work with PATCH requests', async () => {
      const updates = { email: 'updated@example.com' };
      const updated = await client.patch('/api/users/1', updates).data();

      expect(updated.id).toBe(1);
      expect(updated.email).toBe('updated@example.com');
    });
  });

  describe('.status()', () => {
    it('should extract HTTP status code', async () => {
      const status = await client.get('/api/users').status();

      expect(status).toBe(200);
    });

    it('should return 201 for created resources', async () => {
      const status = await client
        .post('/api/users', { name: 'Test' })
        .status();

      expect(status).toBe(201);
    });

    it('should return 404 for not found', async () => {
      try {
        await client.get('/api/users/999').status();
      } catch (error: any) {
        expect(error.status).toBe(404);
      }
    });
  });

  describe('.headers()', () => {
    it('should extract response headers', async () => {
      const headers = await client.get('/api/users').headers();

      expect(headers).toBeDefined();
      expect(typeof headers).toBe('object');
    });

    it('should contain content-type header', async () => {
      const headers = await client.get('/api/users').headers();

      expect(headers['content-type']).toContain('application/json');
    });
  });

  describe('.ok()', () => {
    it('should return true for 2xx status codes', async () => {
      const isOk = await client.get('/api/users').ok();

      expect(isOk).toBe(true);
    });

    it('should return true for 201 Created', async () => {
      const isOk = await client
        .post('/api/users', { name: 'Test' })
        .ok();

      expect(isOk).toBe(true);
    });

    it('should return true for 204 No Content', async () => {
      const isOk = await client.options('/api/users').ok();

      expect(isOk).toBe(true);
    });

    it('should work with HEAD requests', async () => {
      const exists = await client.head('/api/users/1').ok();

      expect(exists).toBe(true);
    });

    it('should return false when HEAD returns 404', async () => {
      try {
        await client.head('/api/users/999').ok();
      } catch (error: any) {
        expect(error.status).toBe(404);
      }
    });
  });

  describe('method chaining', () => {
    it('should chain with configuration methods', async () => {
      const users = await client
        .json()
        .timeout(5000)
        .get('/api/users')
        .data();

      expect(Array.isArray(users)).toBe(true);
    });

    it('should work with bearer token', async () => {
      const users = await client
        .bearer('test-token')
        .get('/api/users')
        .data();

      expect(users).toBeDefined();
    });

    it('should work with query parameters', async () => {
      const users = await client
        .params({ page: 1, limit: 10 })
        .get('/api/users')
        .data();

      expect(users).toBeDefined();
    });
  });

  describe('Promise interface', () => {
    it('should be awaitable (backward compatible)', async () => {
      const response = await client.get('/api/users');

      expect(response).toHaveProperty('data');
      expect(response).toHaveProperty('status');
      expect(response).toHaveProperty('headers');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });

    it('should support .then()', async () => {
      const result = await client.get('/api/users').then((response) => {
        expect(response.status).toBe(200);
        return response.data;
      });

      expect(Array.isArray(result)).toBe(true);
    });

    it('should support .catch()', async () => {
      let caught = false;

      await client
        .get('/api/users/999')
        .catch((error) => {
          caught = true;
          expect(error).toBeDefined();
        });

      expect(caught).toBe(true);
    });

    it('should support .finally()', async () => {
      let finallyCalled = false;

      await client
        .get('/api/users')
        .finally(() => {
          finallyCalled = true;
        });

      expect(finallyCalled).toBe(true);
    });
  });

  describe('type safety', () => {
    it('should preserve generic types through chain', async () => {
      interface User {
        id: number;
        name: string;
        email: string;
      }

      // TypeScript should infer correct types
      const user: User = await client.get<User>('/api/users/1').data();

      expect(user.id).toBeDefined();
      expect(user.name).toBeDefined();
      expect(user.email).toBeDefined();
    });

    it('should work with array types', async () => {
      interface User {
        id: number;
        name: string;
      }

      const users: User[] = await client.get<User[]>('/api/users').data();

      expect(Array.isArray(users)).toBe(true);
      expect(users[0].id).toBeDefined();
    });
  });
});
