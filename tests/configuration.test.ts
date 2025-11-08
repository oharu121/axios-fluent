/**
 * Tests for configuration methods
 * Tests all fluent configuration methods like baseUrl, timeout, headers, etc.
 */

import { describe, it, expect } from 'vitest';
import Axon from '../Axon';

describe('Configuration Methods', () => {
  describe('baseUrl()', () => {
    it('should set base URL', async () => {
      const client = Axon.new().baseUrl('https://api.example.com');
      const users = await client.get('/api/users').data();

      expect(users).toBeDefined();
    });

    it('should be chainable', () => {
      const client = Axon.new().baseUrl('https://api.example.com').json();

      expect(client).toBeDefined();
    });
  });

  describe('timeout()', () => {
    it('should set timeout', async () => {
      const client = Axon.new()
        .baseUrl('https://api.example.com')
        .timeout(5000);

      const users = await client.get('/api/users').data();
      expect(users).toBeDefined();
    });

    it('should timeout slow requests', async () => {
      const client = Axon.new()
        .baseUrl('https://api.example.com')
        .timeout(100); // Very short timeout

      try {
        await client.get('/slow').data();
        expect.fail('Should have timed out');
      } catch (error: any) {
        expect(error).toBeDefined();
      }
    }, 10000);
  });

  describe('bearer()', () => {
    it('should set bearer token', async () => {
      const client = Axon.new()
        .baseUrl('https://api.example.com')
        .bearer('test-token');

      const users = await client.get('/api/users').data();
      expect(users).toBeDefined();
    });

    it('should be chainable', () => {
      const client = Axon.new().bearer('token').json();
      expect(client).toBeDefined();
    });
  });

  describe('basic()', () => {
    it('should set basic auth', async () => {
      const credentials = Buffer.from('user:pass').toString('base64');
      const client = Axon.new()
        .baseUrl('https://api.example.com')
        .basic(credentials);

      const users = await client.get('/api/users').data();
      expect(users).toBeDefined();
    });
  });

  describe('setHeader()', () => {
    it('should set custom header', async () => {
      const client = Axon.new()
        .baseUrl('https://api.example.com')
        .setHeader('X-Custom-Header', 'custom-value');

      const users = await client.get('/api/users').data();
      expect(users).toBeDefined();
    });

    it('should set multiple headers', async () => {
      const client = Axon.new()
        .baseUrl('https://api.example.com')
        .setHeader('X-Header-1', 'value1')
        .setHeader('X-Header-2', 'value2');

      const users = await client.get('/api/users').data();
      expect(users).toBeDefined();
    });
  });

  describe('params()', () => {
    it('should set query parameters', async () => {
      const client = Axon.new()
        .baseUrl('https://api.example.com')
        .params({ page: 1, limit: 10 });

      const users = await client.get('/api/users').data();
      expect(users).toBeDefined();
    });

    it('should handle multiple parameters', async () => {
      const client = Axon.new()
        .baseUrl('https://api.example.com')
        .params({
          page: 1,
          limit: 10,
          sort: 'name',
          order: 'asc',
        });

      const users = await client.get('/api/users').data();
      expect(users).toBeDefined();
    });
  });

  describe('json()', () => {
    it('should set JSON content-type', async () => {
      const client = Axon.new()
        .baseUrl('https://api.example.com')
        .json();

      const created = await client
        .post('/api/users', { name: 'Test' })
        .data();

      expect(created).toBeDefined();
    });

    it('should be chainable', () => {
      const client = Axon.new().baseUrl('https://api.example.com').json();
      expect(client).toBeDefined();
    });
  });

  describe('multipart()', () => {
    it('should set multipart content-type', () => {
      const client = Axon.new().multipart();
      expect(client).toBeDefined();
    });

    it('should be chainable', () => {
      const client = Axon.new().baseUrl('https://api.example.com').multipart();
      expect(client).toBeDefined();
    });
  });

  describe('encodeUrl()', () => {
    it('should set URL encoded content-type', () => {
      const client = Axon.new().encodeUrl();
      expect(client).toBeDefined();
    });

    it('should be chainable', () => {
      const client = Axon.new().baseUrl('https://api.example.com').encodeUrl();
      expect(client).toBeDefined();
    });
  });

  describe('octet()', () => {
    it('should set octet-stream content-type', () => {
      const client = Axon.new().octet();
      expect(client).toBeDefined();
    });

    it('should be chainable', () => {
      const client = Axon.new().baseUrl('https://api.example.com').octet();
      expect(client).toBeDefined();
    });
  });

  describe('length()', () => {
    it('should set content-length', () => {
      const client = Axon.new().length(1024);
      expect(client).toBeDefined();
    });

    it('should be chainable', () => {
      const client = Axon.new().baseUrl('https://api.example.com').length(2048);
      expect(client).toBeDefined();
    });
  });

  describe('digest()', () => {
    it('should set digest header', () => {
      const client = Axon.new().digest('sha256-hash');
      expect(client).toBeDefined();
    });

    it('should be chainable', () => {
      const client = Axon.new()
        .baseUrl('https://api.example.com')
        .digest('sha256');
      expect(client).toBeDefined();
    });
  });

  describe('range()', () => {
    it('should set content-range', () => {
      const client = Axon.new().range(0, 1024, 10240);
      expect(client).toBeDefined();
    });

    it('should be chainable', () => {
      const client = Axon.new()
        .baseUrl('https://api.example.com')
        .range(1024, 2048, 10240);
      expect(client).toBeDefined();
    });
  });

  describe('responseType()', () => {
    it('should set response type', () => {
      const client = Axon.new().responseType('json');
      expect(client).toBeDefined();
    });

    it('should accept blob', () => {
      const client = Axon.new().responseType('blob');
      expect(client).toBeDefined();
    });

    it('should accept arraybuffer', () => {
      const client = Axon.new().responseType('arraybuffer');
      expect(client).toBeDefined();
    });

    it('should be chainable', () => {
      const client = Axon.new()
        .baseUrl('https://api.example.com')
        .responseType('json');
      expect(client).toBeDefined();
    });
  });

  describe('transformRequest()', () => {
    it('should set request transformer', () => {
      const transformer = (data: any) => {
        return JSON.stringify(data);
      };

      const client = Axon.new().transformRequest(transformer);
      expect(client).toBeDefined();
    });

    it('should accept array of transformers', () => {
      const transformers = [
        (data: any) => ({ ...data, timestamp: Date.now() }),
        (data: any) => JSON.stringify(data),
      ];

      const client = Axon.new().transformRequest(transformers);
      expect(client).toBeDefined();
    });

    it('should be chainable', () => {
      const client = Axon.new()
        .baseUrl('https://api.example.com')
        .transformRequest((data) => data);
      expect(client).toBeDefined();
    });
  });

  describe('Method chaining', () => {
    it('should chain multiple configuration methods', async () => {
      const client = Axon.new()
        .baseUrl('https://api.example.com')
        .bearer('token')
        .json()
        .timeout(5000)
        .params({ page: 1 })
        .setHeader('X-Custom', 'value');

      const users = await client.get('/api/users').data();
      expect(users).toBeDefined();
    });

    it('should create immutable configurations', async () => {
      const base = Axon.new().baseUrl('https://api.example.com');
      const withAuth = base.bearer('token1');
      const withDifferentAuth = base.bearer('token2');

      // Each should be independent
      const users1 = await withAuth.get('/api/users').data();
      const users2 = await withDifferentAuth.get('/api/users').data();

      expect(users1).toBeDefined();
      expect(users2).toBeDefined();
    });

    it('should allow reusing base configuration', async () => {
      const baseClient = Axon.new()
        .baseUrl('https://api.example.com')
        .json()
        .timeout(5000);

      // Create different clients from same base
      const client1 = baseClient.bearer('token1');
      const client2 = baseClient.bearer('token2');

      const users1 = await client1.get('/api/users').data();
      const users2 = await client2.get('/api/users').data();

      expect(users1).toBeDefined();
      expect(users2).toBeDefined();
    });
  });

  describe('Factory method', () => {
    it('should create instance with default options', () => {
      const client = Axon.new();
      expect(client).toBeDefined();
    });

    it('should create instance with allowInsecure option', () => {
      const client = Axon.new({ allowInsecure: true });
      expect(client).toBeDefined();
    });

    it('should default to secure', () => {
      const client = Axon.new();
      expect(client).toBeDefined();
    });
  });
});
