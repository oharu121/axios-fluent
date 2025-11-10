# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2025-11-10

### Changed
- **BREAKING**: Simplified `AxonError` to only expose 5 essential properties for cleaner error handling
- Removed `headers` property from `AxonError` (rarely needed, < 1% use cases)
- Removed `originalError` property from `AxonError` (created confusion with duplicate access patterns)

### Fixed
- Improved IDE IntelliSense import suggestions by adding `exports` field to package.json
- IDEs now correctly suggest `import from "axios-fluent"` instead of showing internal paths
- Enhanced TypeScript module resolution support
- Maintained full backward compatibility with older Node.js versions

### Technical
- Added `exports` field with ESM and CommonJS support for better module resolution
- Kept `main` field for backward compatibility with Node.js < 12.7
- Added explicit `types` field in exports for better TypeScript support

### Migration Guide

**For users who accessed `error.headers`:**
```typescript
// Before
catch (error) {
  if (error instanceof AxonError) {
    console.log(error.headers);
  }
}

// After - catch AxiosError directly
catch (error) {
  if (axios.isAxiosError(error)) {
    console.log(error.response?.headers);
  }
}
```

**For users who accessed `error.originalError`:**
```typescript
// Before
catch (error) {
  if (error instanceof AxonError) {
    console.log(error.originalError.response);
  }
}

// After - use AxonError's direct properties or catch AxiosError
catch (error) {
  if (error instanceof AxonError) {
    // Use direct properties
    console.log(error.status, error.responseData);
  }
}
```

### AxonError Now Includes (5 Essential Properties)
- `status` - HTTP status code (404, 500, etc.)
- `statusText` - Human-readable status text
- `url` - Request URL
- `method` - HTTP method (GET, POST, etc.)
- `responseData` - Error response body

## [1.1.0] - 2025-01-09

### Added
- `Axon.dev()` factory method for quick development setup with self-signed certificates
- Automatically enables `allowInsecure: true` for easier development configuration
- Provides a convenient shorthand for `Axon.new({ allowInsecure: true })`
- Includes JSDoc documentation with usage examples and security warnings

### Documentation
- Updated README with `Axon.dev()` documentation and examples
- Enhanced security section with `dev()` method usage

## [1.0.0] - 2025-01-08

### Added
- **Response convenience methods**: `.data()`, `.status()`, `.headers()`, `.ok()` for cleaner response handling
- `AxonResponse` wrapper class that makes responses awaitable while providing convenient accessor methods
- `AxonError` class with structured error information (status, statusText, responseData, url, method)
- Enhanced error handling with automatic AxiosError wrapping
- New example file `examples/response-convenience.ts` demonstrating new features

### Changed
- All HTTP methods now return `AxonResponse<T>` instead of `Promise<AxiosResponse<T>>` (backward compatible)
- HTTP methods are no longer async - they return `AxonResponse` immediately for better chainability
- Improved error messages with formatted output via `AxonError.toString()`

### Notes
- **100% backward compatible** - existing code continues to work without changes
- Awaiting response still returns full `AxiosResponse` as before
- New `.data()` method provides cleaner alternative for extracting response data

## [0.1.0] - 2025-01-07

### Added
- Initial release of Axon HTTP client
- Fluent, chainable API for building HTTP requests
- Full TypeScript support with generic typing for type-safe responses
- All HTTP methods: GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS
- Authentication helpers: `bearer()`, `basic()`
- Configuration methods: `baseUrl()`, `timeout()`
- Content-Type helpers: `json()`, `multipart()`, `encodeUrl()`, `octet()`
- Header management: `setHeader()`, `length()`, `digest()`, `range()`
- Query parameter support: `params()`
- Request transformers: `transformRequest()`
- Response type configuration: `responseType()`
- Comprehensive JSDoc documentation
- MIT License
- Example files for common use cases

### Security
- Secure by default: HTTPS certificate validation enabled
- Optional `allowInsecure` flag for development with self-signed certificates
