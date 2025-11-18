# axios-fluent

[![npm version](https://badge.fury.io/js/axios-fluent.svg)](https://badge.fury.io/js/axios-fluent)
![License](https://img.shields.io/npm/l/axios-fluent)
![Types](https://img.shields.io/npm/types/axios-fluent)
![NPM Downloads](https://img.shields.io/npm/dw/axios-fluent)
![Last Commit](https://img.shields.io/github/last-commit/oharu121/axios-fluent)
![Coverage](https://codecov.io/gh/oharu121/axios-fluent/branch/main/graph/badge.svg)
![CI Status](https://github.com/oharu121/axios-fluent/actions/workflows/ci.yml/badge.svg)
![GitHub Stars](https://img.shields.io/github/stars/oharu121/axios-fluent?style=social)

A fluent, type-safe HTTP client wrapper around Axios with method chaining.

## Features

- Fluent, chainable API for building HTTP requests
- Full TypeScript support with generic typing
- Immutable configuration pattern
- All HTTP methods (GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS)
- **Convenient response extraction** - `.data()`, `.status()`, `.headers()`, `.ok()` methods
- **Enhanced error handling** - Clear, structured error information with `AxonError`
- Built-in authentication helpers (Bearer, Basic)
- Content-Type helpers
- Request/response transformers
- Secure by default (HTTPS certificate validation enabled)

## Installation

```bash
npm install axios-fluent
```

## Importing

```typescript
// Default export (recommended)
import Axon from "axios-fluent";

// Named export (alternative)
import { Axon } from "axios-fluent";

// With error class
import Axon, { AxonError } from "axios-fluent";
```

## Quick Start

```typescript
import Axon from "axios-fluent";

// Create a client
const client = Axon.new();

// Make a simple GET request (backward compatible)
const response = await client.get("https://api.example.com/users");
console.log(response.data);

// Or use .data() for cleaner code (new!)
const users = await client.get<User[]>("https://api.example.com/users").data();

// Chain configuration methods
const users = await client
  .baseUrl("https://api.example.com")
  .bearer("your-jwt-token")
  .json()
  .timeout(5000)
  .get<User[]>("/users")
  .data(); // Extract data directly!
```

## API Reference

### Factory Methods

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

#### `Axon.dev(): Axon`

Creates a new Axon instance for development with `allowInsecure: true` enabled by default.

```typescript
// Quick development setup - allows self-signed certificates
const client = Axon.dev();

// Equivalent to:
const client = Axon.new({ allowInsecure: true });
```

**⚠️ Warning:** Only use in development/testing environments. This disables SSL certificate verification.

### HTTP Methods

All HTTP methods return an `AxonResponse` wrapper that:
- Is awaitable (backward compatible - returns full `AxiosResponse`)
- Provides convenient methods: `.data()`, `.status()`, `.headers()`, `.ok()`
- Supports full TypeScript generic typing

#### `get<T>(url: string): AxonResponse<T>`

```typescript
interface User {
  id: number;
  name: string;
}

// Backward compatible - get full response
const response = await client.get<User>("/api/user/123");
console.log(response.data.name); // Type-safe access

// New - get data directly (recommended)
const user = await client.get<User>("/api/user/123").data();
console.log(user.name); // Cleaner code!

// Get just the status code
const status = await client.get("/api/user/123").status(); // 200

// Check if request succeeded
const isOk = await client.get("/api/user/123").ok(); // true
```

#### `post<T>(url: string, payload?: any): Promise<AxiosResponse<T>>`

```typescript
const newUser = { name: "John Doe", email: "john@example.com" };
const response = await client.post<User>("/api/users", newUser);
```

#### `put<T>(url: string, payload?: any): Promise<AxiosResponse<T>>`

```typescript
const updates = { name: "Jane Doe" };
await client.put("/api/user/123", updates);
```

#### `patch<T>(url: string, payload?: any): Promise<AxiosResponse<T>>`

```typescript
await client.patch("/api/user/123", { email: "new@example.com" });
```

#### `delete<T>(url: string, payload?: any): Promise<AxiosResponse<T>>`

```typescript
await client.delete("/api/user/123");
```

#### `head<T>(url: string): Promise<AxiosResponse<T>>`

```typescript
const response = await client.head("/api/resource");
console.log(response.headers);
```

#### `options<T>(url: string): Promise<AxiosResponse<T>>`

```typescript
const response = await client.options("/api/resource");
```

### Response Convenience Methods

All HTTP methods return an `AxonResponse` wrapper with these convenient methods:

#### `.data(): Promise<T>`

Extracts only the response data, discarding status, headers, etc.

```typescript
// Instead of:
const response = await client.get<User[]>('/users');
const users = response.data;

// You can now do:
const users = await client.get<User[]>('/users').data();
```

#### `.status(): Promise<number>`

Extracts only the HTTP status code.

```typescript
const statusCode = await client.get('/users').status();
console.log(statusCode); // 200
```

#### `.headers(): Promise<any>`

Extracts only the response headers.

```typescript
const headers = await client.get('/users').headers();
console.log(headers['content-type']);
```

#### `.ok(): Promise<boolean>`

Checks if the response status is in the 2xx range (success).

```typescript
const isSuccessful = await client.delete('/users/123').ok();
if (isSuccessful) {
  console.log('User deleted successfully');
}
```

### Enhanced Error Handling

Errors are automatically wrapped in `AxonError` with 5 essential properties for debugging:

```typescript
import Axon, { AxonError } from 'axios-fluent';

try {
  await client.get('/api/users').data();
} catch (error) {
  if (error instanceof AxonError) {
    // 5 essential properties for error handling
    console.log('Status:', error.status);           // 404
    console.log('Status Text:', error.statusText);  // 'Not Found'
    console.log('URL:', error.url);                 // '/api/users'
    console.log('Method:', error.method);           // 'GET'
    console.log('Response:', error.responseData);   // Error body

    // Formatted error message
    console.log(error.toString());
    // AxonError: Request failed with status code 404
    //   Request: GET /api/users
    //   Status: 404 Not Found
    //   Response: {"message":"Users not found"}
  }
}
```

**AxonError Properties:**
- `status` - HTTP status code (404, 500, etc.)
- `statusText` - Human-readable status text
- `url` - Request URL
- `method` - HTTP method (GET, POST, etc.)
- `responseData` - Error response body

### Configuration Methods

All configuration methods return a new Axon instance, making them chainable.

#### `baseUrl(url: string): Axon`

Sets the base URL for all requests.

```typescript
const client = Axon.new().baseUrl("https://api.example.com");
await client.get("/users"); // Requests https://api.example.com/users
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
const client = Axon.new().bearer("your-jwt-token").get("/api/protected");
```

#### `basic(token: string): Axon`

Sets Basic authentication.

```typescript
const credentials = btoa("username:password");
const client = Axon.new().basic(credentials);
```

### Headers

#### `setHeader(key: string, value: string): Axon`

Sets a custom header.

```typescript
const client = Axon.new()
  .setHeader("X-API-Key", "secret")
  .setHeader("X-Custom-Header", "value");
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
formData.append("file", fileBlob);

const client = Axon.new().multipart();
await client.post("/upload", formData);
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
await client.get("/api/users"); // Requests /api/users?page=1&limit=10
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
const client = Axon.new().digest("sha256-hash");
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
const client = Axon.new().responseType("blob");
const response = await client.get("/download/file.pdf");
```

## Examples

### Basic API Client

```typescript
import Axon from "axios-fluent";

const api = Axon.new()
  .baseUrl("https://api.example.com")
  .bearer("your-jwt-token")
  .json()
  .timeout(10000);

// Fetch users - using .data() for cleaner code
const users = await api.get<User[]>("/users").data();

// Create a new user
const newUser = await api.post<User>("/users", {
  name: "John Doe",
  email: "john@example.com",
}).data();

// Update user
await api.put(`/users/${newUser.id}`, {
  name: "Jane Doe",
});

// Delete user and check if successful
const deleted = await api.delete(`/users/${newUser.id}`).ok();
console.log('Deleted:', deleted);
```

### File Upload

```typescript
import Axon from "axios-fluent";
import FormData from "form-data";

const formData = new FormData();
formData.append("file", fileBlob);
formData.append("name", "document.pdf");

const response = await Axon.new()
  .baseUrl("https://api.example.com")
  .bearer("token")
  .multipart()
  .post("/upload", formData);
```

### Download File

```typescript
import Axon from "axios-fluent";
import fs from "fs";

const response = await Axon.new()
  .responseType("blob")
  .get("https://example.com/file.pdf");

fs.writeFileSync("file.pdf", response.data);
```

### Error Handling

```typescript
import Axon, { AxonError } from "axios-fluent";

try {
  const users = await Axon.new()
    .bearer("token")
    .get("https://api.example.com/users")
    .data();

  console.log(users);
} catch (error) {
  // AxonError provides convenient access to error details
  if (error instanceof AxonError) {
    console.error("Status:", error.status);        // 404
    console.error("URL:", error.url);              // https://api.example.com/users
    console.error("Method:", error.method);        // GET
    console.error("Response:", error.responseData);// Error body

    // Formatted error message with all details
    console.error(error.toString());

    // Handle specific status codes
    if (error.status === 401) {
      console.log("Unauthorized - refresh token");
    } else if (error.status >= 500) {
      console.log("Server error - retry later");
    }
  }
}
```

### Pagination

```typescript
import Axon from "axios-fluent";

async function fetchAllUsers() {
  const client = Axon.new().baseUrl("https://api.example.com").bearer("token");

  let page = 1;
  let allUsers = [];

  while (true) {
    // Use .data() for cleaner code
    const response = await client
      .params({ page, limit: 100 })
      .get<{ users: User[]; hasMore: boolean }>("/users")
      .data();

    allUsers.push(...response.users);

    if (!response.hasMore) break;
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

For development or testing environments with self-signed certificates, use the `dev()` factory method:

```typescript
// Development only - NOT for production
const devClient = Axon.dev();

// Or use the explicit option
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

const response = await Axon.new().get<ApiResponse<User>>("/api/user/123");

// Fully typed response
console.log(response.data.data.name); // TypeScript knows the shape
```

## License

MIT

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## Support

If you encounter any issues, please file a bug report on the GitHub repository.
