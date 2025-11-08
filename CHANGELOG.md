# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
