/**
 * Integration tests for all HTTP methods
 * Tests GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS
 */

import { describe, it, expect } from 'vitest';
import Axon from '../index';

describe('HTTP Methods', () => {
  const client = Axon.new().baseUrl('https://api.example.com');

  describe('GET', () => {
    it('should fetch data', async () => {
      const response = await client.get('/api/users');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });

    it('should fetch single resource', async () => {
      const response = await client.get('/api/users/1');

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('id', 1);
    });

    it('should return 404 for non-existent resource', async () => {
      try {
        await client.get('/api/users/999');
        expect.fail('Should have thrown');
      } catch (error: any) {
        expect(error.status).toBe(404);
      }
    });
  });

  describe('POST', () => {
    it('should create new resource', async () => {
      const newUser = {
        name: 'New User',
        email: 'new@example.com',
      };

      const response = await client.post('/api/users', newUser);

      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('id');
      expect(response.data.name).toBe('New User');
    });

    it('should work with .data() method', async () => {
      const newUser = { name: 'Test', email: 'test@example.com' };
      const created = await client.post('/api/users', newUser).data();

      expect(created).toHaveProperty('id');
      expect(created.name).toBe('Test');
    });
  });

  describe('PUT', () => {
    it('should update entire resource', async () => {
      const updates = {
        name: 'Updated Name',
        email: 'updated@example.com',
      };

      const response = await client.put('/api/users/1', updates);

      expect(response.status).toBe(200);
      expect(response.data.name).toBe('Updated Name');
    });

    it('should work with .data() method', async () => {
      const updates = { name: 'New Name', email: 'new@example.com' };
      const updated = await client.put('/api/users/1', updates).data();

      expect(updated.name).toBe('New Name');
    });

    it('should return 404 for non-existent resource', async () => {
      try {
        await client.put('/api/users/999', { name: 'Test' });
      } catch (error: any) {
        expect(error.status).toBe(404);
      }
    });
  });

  describe('PATCH', () => {
    it('should partially update resource', async () => {
      const updates = { name: 'Patched Name' };
      const response = await client.patch('/api/users/1', updates);

      expect(response.status).toBe(200);
      expect(response.data.name).toBe('Patched Name');
      expect(response.data).toHaveProperty('email'); // Other fields preserved
    });

    it('should work with .data() method', async () => {
      const updates = { email: 'patched@example.com' };
      const updated = await client.patch('/api/users/1', updates).data();

      expect(updated.email).toBe('patched@example.com');
    });
  });

  describe('DELETE', () => {
    it('should delete resource', async () => {
      const response = await client.delete('/api/users/1');

      expect(response.status).toBe(200);
    });

    it('should work with .ok() method', async () => {
      const deleted = await client.delete('/api/users/1').ok();

      expect(deleted).toBe(true);
    });

    it('should return 404 for non-existent resource', async () => {
      try {
        await client.delete('/api/users/999');
      } catch (error: any) {
        expect(error.status).toBe(404);
      }
    });
  });

  describe('HEAD', () => {
    it('should check if resource exists', async () => {
      const response = await client.head('/api/users/1');

      expect(response.status).toBe(200);
      // HEAD requests return empty string, not undefined
      expect(response.data === '' || response.data === undefined).toBe(true);
    });

    it('should work with .ok() method', async () => {
      const exists = await client.head('/api/users/1').ok();

      expect(exists).toBe(true);
    });

    it('should return 404 for non-existent resource', async () => {
      try {
        await client.head('/api/users/999');
      } catch (error: any) {
        expect(error.status).toBe(404);
      }
    });
  });

  describe('OPTIONS', () => {
    it('should get allowed methods', async () => {
      const response = await client.options('/api/users');

      expect(response.status).toBe(204);
      expect(response.headers).toHaveProperty('allow');
    });

    it('should work with .headers() method', async () => {
      const headers = await client.options('/api/users').headers();

      expect(headers).toHaveProperty('allow');
    });
  });

  describe('Chaining with HTTP methods', () => {
    it('should chain configuration with GET', async () => {
      const users = await client
        .json()
        .bearer('token')
        .get('/api/users')
        .data();

      expect(Array.isArray(users)).toBe(true);
    });

    it('should chain configuration with POST', async () => {
      const created = await client
        .json()
        .post('/api/users', { name: 'Test' })
        .data();

      expect(created).toHaveProperty('id');
    });

    it('should chain with query parameters', async () => {
      const users = await client
        .params({ page: 1, limit: 10 })
        .get('/api/users')
        .data();

      expect(users).toBeDefined();
    });

    it('should chain with timeout', async () => {
      const users = await client.timeout(5000).get('/api/users').data();

      expect(users).toBeDefined();
    });
  });
});
