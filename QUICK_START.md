# Quick Start Guide - axios-fluent

Get started with axios-fluent in 5 minutes.

## Installation

```bash
npm install axios-fluent
```

## Basic Usage

```typescript
import Axon from 'axios-fluent';

// Simple GET request
const response = await Axon.new().get('https://api.example.com/users');
console.log(response.data);
```

## Common Patterns

### 1. API Client with Authentication

```typescript
const api = Axon.new()
  .baseUrl('https://api.example.com')
  .bearer('your-jwt-token')
  .json()
  .timeout(10000);

// Type-safe requests
interface User {
  id: number;
  name: string;
  email: string;
}

const users = await api.get<User[]>('/users');
console.log(users.data[0].name); // TypeScript knows the type!
```

### 2. Chaining Configuration

```typescript
const client = Axon.new()
  .baseUrl('https://api.example.com')
  .bearer('token')
  .json()
  .timeout(5000)
  .setHeader('X-API-Version', '1.0');

// All requests use these settings
await client.get('/users');
await client.post('/users', { name: 'John' });
```

### 3. Different Content Types

```typescript
// JSON (most common)
const json = Axon.new().json();
await json.post('/api/data', { key: 'value' });

// Form data
const form = Axon.new().encodeUrl();
await form.post('/login', { username, password });

// File upload
const upload = Axon.new().multipart();
const formData = new FormData();
formData.append('file', fileBlob);
await upload.post('/upload', formData);
```

### 4. Query Parameters

```typescript
const api = Axon.new().baseUrl('https://api.example.com');

// Search with pagination
const results = await api
  .params({ q: 'javascript', page: 1, limit: 20 })
  .get('/search');
```

### 5. Error Handling

```typescript
try {
  const response = await Axon.new()
    .bearer('token')
    .get('https://api.example.com/users');

  console.log(response.data);
} catch (error: any) {
  if (error.response) {
    // Server responded with error
    console.error('Status:', error.response.status);
    console.error('Data:', error.response.data);
  } else if (error.request) {
    // No response received
    console.error('No response from server');
  } else {
    // Request setup error
    console.error('Error:', error.message);
  }
}
```

## Real-World Example

Here's a complete example of a GitHub API client:

```typescript
import Axon from 'axios-fluent';

class GitHubAPI {
  private client: Axon;

  constructor(token: string) {
    this.client = Axon.new()
      .baseUrl('https://api.github.com')
      .bearer(token)
      .json()
      .setHeader('Accept', 'application/vnd.github.v3+json')
      .timeout(10000);
  }

  async getUser(username: string) {
    const response = await this.client.get(`/users/${username}`);
    return response.data;
  }

  async getRepos(username: string) {
    const response = await this.client
      .params({ sort: 'updated', per_page: 100 })
      .get(`/users/${username}/repos`);
    return response.data;
  }

  async createIssue(owner: string, repo: string, title: string, body: string) {
    const response = await this.client
      .post(`/repos/${owner}/${repo}/issues`, {
        title,
        body
      });
    return response.data;
  }
}

// Usage
const github = new GitHubAPI('your-token');
const user = await github.getUser('octocat');
console.log(user.name);
```

## All HTTP Methods

```typescript
const api = Axon.new().baseUrl('https://api.example.com');

// GET
await api.get('/users');

// POST
await api.post('/users', { name: 'John' });

// PUT
await api.put('/users/1', { name: 'Jane' });

// PATCH
await api.patch('/users/1', { email: 'new@example.com' });

// DELETE
await api.delete('/users/1');

// HEAD (check if resource exists)
await api.head('/users/1');

// OPTIONS (check allowed methods)
await api.options('/users');
```

## Development vs Production

```typescript
// Production (secure by default)
const prodClient = Axon.new()
  .baseUrl('https://api.production.com');

// Development (allow self-signed certificates)
const devClient = Axon.new({ allowInsecure: true })
  .baseUrl('https://localhost:3000');
```

## Tips & Tricks

### Reuse Configurations

```typescript
// Base client
const base = Axon.new()
  .baseUrl('https://api.example.com')
  .timeout(5000);

// Authenticated client
const authed = base.bearer('token');

// Admin client with different auth
const admin = base.bearer('admin-token');
```

### Type-Safe Responses

```typescript
interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

interface User {
  id: number;
  name: string;
}

const response = await Axon.new()
  .get<ApiResponse<User>>('/api/user/1');

// Fully typed!
console.log(response.data.data.name);
console.log(response.data.success);
```

### Timeout Configuration

```typescript
// 30 second timeout for slow endpoints
const slowApi = Axon.new()
  .baseUrl('https://slow-api.com')
  .timeout(30000);

// 2 second timeout for fast responses
const fastApi = Axon.new()
  .baseUrl('https://fast-api.com')
  .timeout(2000);
```

## Next Steps

- Read the full [README.md](./README.md) for complete API documentation
- Check out [examples/](./examples/) for more use cases
- See [PUBLISHING.md](./PUBLISHING.md) if you want to contribute

## Need Help?

- File an issue: https://github.com/oharu121/axios-fluent/issues
- Read Axios docs: https://axios-http.com/

Happy coding! 🚀
