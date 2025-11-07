# axios-fluent

A fluent, type-safe HTTP client wrapper around Axios with method chaining.

## Features

- Fluent, chainable API for building HTTP requests
- Full TypeScript support with generic typing
- Immutable configuration pattern
- All HTTP methods (GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS)
- Built-in authentication helpers (Bearer, Basic)
- Content-Type helpers
- Request/response transformers
- Secure by default (HTTPS certificate validation enabled)

## Installation

```bash
npm install axios-fluent
```

## Quick Start

```typescript
import Axon from 'axios-fluent';

// Create a client
const client = Axon.new();

// Make a simple GET request
const response = await client.get('https://api.example.com/users');
console.log(response.data);

// Chain configuration methods
const response = await client
  .baseUrl('https://api.example.com')
  .bearer('your-jwt-token')
  .json()
  .timeout(5000)
  .get<User[]>('/users');
```

## API Reference

### Factory Method

#### `Axon.new(options?: Options): Axon`

Creates a new Axon instance.

**Options:**
- `allowInsecure?: boolean` - Allow self-signed certificates (default: `false`)

```typescript
// Secure by default (production)
const client = Axon.new();

// Allow self-signed certificates (development only)
const devClient = Axon.new({ allowInsecure: true });
```

### HTTP Methods

All HTTP methods support generic typing for type-safe responses.

#### `get<T>(url: string): Promise<AxiosResponse<T>>`

```typescript
interface User {
  id: number;
  name: string;
}

const response = await client.get<User>('/api/user/123');
console.log(response.data.name); // Type-safe access
```

#### `post<T>(url: string, payload?: any): Promise<AxiosResponse<T>>`

```typescript
const newUser = { name: 'John Doe', email: 'john@example.com' };
const response = await client.post<User>('/api/users', newUser);
```

#### `put<T>(url: string, payload?: any): Promise<AxiosResponse<T>>`

```typescript
const updates = { name: 'Jane Doe' };
await client.put('/api/user/123', updates);
```

#### `patch<T>(url: string, payload?: any): Promise<AxiosResponse<T>>`

```typescript
await client.patch('/api/user/123', { email: 'new@example.com' });
```

#### `delete<T>(url: string, payload?: any): Promise<AxiosResponse<T>>`

```typescript
await client.delete('/api/user/123');
```

#### `head<T>(url: string): Promise<AxiosResponse<T>>`

```typescript
const response = await client.head('/api/resource');
console.log(response.headers);
```

#### `options<T>(url: string): Promise<AxiosResponse<T>>`

```typescript
const response = await client.options('/api/resource');
```

### Configuration Methods

All configuration methods return a new Axon instance, making them chainable.

#### `baseUrl(url: string): Axon`

Sets the base URL for all requests.

```typescript
const client = Axon.new().baseUrl('https://api.example.com');
await client.get('/users'); // Requests https://api.example.com/users
```

#### `timeout(ms: number): Axon`

Sets request timeout in milliseconds.

```typescript
const client = Axon.new().timeout(5000); // 5 second timeout
```

### Authentication

#### `bearer(token: string): Axon`

Sets Bearer token authentication.

```typescript
const client = Axon.new()
  .bearer('your-jwt-token')
  .get('/api/protected');
```

#### `basic(token: string): Axon`

Sets Basic authentication.

```typescript
const credentials = btoa('username:password');
const client = Axon.new().basic(credentials);
```

### Headers

#### `setHeader(key: string, value: string): Axon`

Sets a custom header.

```typescript
const client = Axon.new()
  .setHeader('X-API-Key', 'secret')
  .setHeader('X-Custom-Header', 'value');
```

### Content-Type Helpers

#### `json(): Axon`

Sets `Content-Type: application/json`.

```typescript
const client = Axon.new().json();
```

#### `multipart(): Axon`

Sets `Content-Type: multipart/form-data`.

```typescript
const formData = new FormData();
formData.append('file', fileBlob);

const client = Axon.new().multipart();
await client.post('/upload', formData);
```

#### `encodeUrl(): Axon`

Sets `Content-Type: application/x-www-form-urlencoded`.

```typescript
const client = Axon.new().encodeUrl();
```

#### `octet(): Axon`

Sets `Content-Type: application/octet-stream`.

```typescript
const client = Axon.new().octet();
```

### Query Parameters

#### `params(params: object): Axon`

Sets query parameters.

```typescript
const client = Axon.new().params({ page: 1, limit: 10 });
await client.get('/api/users'); // Requests /api/users?page=1&limit=10
```

### Advanced Configuration

#### `length(contentLength: number): Axon`

Sets the `Content-Length` header.

```typescript
const client = Axon.new().length(1024);
```

#### `digest(digest: string): Axon`

Sets the `Digest` header for content integrity.

```typescript
const client = Axon.new().digest('sha256-hash');
```

#### `range(offset: number, end: number, fileSize: number): Axon`

Sets the `Content-Range` header for partial uploads.

```typescript
const client = Axon.new().range(0, 1024, 10240);
```

#### `transformRequest(transformers: AxiosRequestTransformer | AxiosRequestTransformer[]): Axon`

Sets custom request transformers.

```typescript
const client = Axon.new().transformRequest((data, headers) => {
  // Transform request data
  return data;
});
```

#### `responseType(responseType: ResponseType): Axon`

Sets the expected response type.

```typescript
const client = Axon.new().responseType('blob');
const response = await client.get('/download/file.pdf');
```

## Examples

### Basic API Client

```typescript
import Axon from 'axon';

const api = Axon.new()
  .baseUrl('https://api.example.com')
  .bearer('your-jwt-token')
  .json()
  .timeout(10000);

// Fetch users
const users = await api.get<User[]>('/users');

// Create a new user
const newUser = await api.post<User>('/users', {
  name: 'John Doe',
  email: 'john@example.com'
});

// Update user
await api.put(`/users/${newUser.data.id}`, {
  name: 'Jane Doe'
});

// Delete user
await api.delete(`/users/${newUser.data.id}`);
```

### File Upload

```typescript
import Axon from 'axon';
import FormData from 'form-data';

const formData = new FormData();
formData.append('file', fileBlob);
formData.append('name', 'document.pdf');

const response = await Axon.new()
  .baseUrl('https://api.example.com')
  .bearer('token')
  .multipart()
  .post('/upload', formData);
```

### Download File

```typescript
import Axon from 'axon';
import fs from 'fs';

const response = await Axon.new()
  .responseType('blob')
  .get('https://example.com/file.pdf');

fs.writeFileSync('file.pdf', response.data);
```

### Error Handling

```typescript
import Axon from 'axon';

try {
  const response = await Axon.new()
    .bearer('token')
    .get('https://api.example.com/users');

  console.log(response.data);
} catch (error) {
  if (error.response) {
    // Server responded with error status
    console.error('Error:', error.response.status, error.response.data);
  } else if (error.request) {
    // Request made but no response
    console.error('No response received');
  } else {
    // Error setting up request
    console.error('Error:', error.message);
  }
}
```

### Pagination

```typescript
import Axon from 'axon';

async function fetchAllUsers() {
  const client = Axon.new()
    .baseUrl('https://api.example.com')
    .bearer('token');

  let page = 1;
  let allUsers = [];

  while (true) {
    const response = await client
      .params({ page, limit: 100 })
      .get<{ users: User[], hasMore: boolean }>('/users');

    allUsers.push(...response.data.users);

    if (!response.data.hasMore) break;
    page++;
  }

  return allUsers;
}
```

## Security

### HTTPS Certificate Validation

By default, Axon validates HTTPS certificates. This is the recommended behavior for production environments.

```typescript
// Secure by default
const client = Axon.new();
```

### Self-Signed Certificates (Development Only)

Only use `allowInsecure: true` in development or testing environments with self-signed certificates.

```typescript
// Development only - NOT for production
const devClient = Axon.new({ allowInsecure: true });
```

This disables SSL certificate verification and makes your application vulnerable to man-in-the-middle attacks.

## TypeScript

Axon is written in TypeScript and provides full type definitions.

```typescript
interface ApiResponse<T> {
  data: T;
  message: string;
}

interface User {
  id: number;
  name: string;
  email: string;
}

const response = await Axon.new()
  .get<ApiResponse<User>>('/api/user/123');

// Fully typed response
console.log(response.data.data.name); // TypeScript knows the shape
```

## License

MIT

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## Support

If you encounter any issues, please file a bug report on the GitHub repository.
