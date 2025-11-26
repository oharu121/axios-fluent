import axios, {
  AxiosRequestConfig,
  AxiosResponse,
  AxiosInstance,
  AxiosRequestTransformer,
  ResponseType,
  AxiosError,
} from "axios";
import https from "https";

/**
 * Options for creating a new Axon instance
 */
interface Options {
  /**
   * Allow insecure HTTPS connections (self-signed certificates)
   * @default false
   * @warning Only use in development/testing environments
   */
  allowInsecure?: boolean;
}

/**
 * Enhanced error class with convenient property access
 * Wraps AxiosError to provide clearer error information
 */
export class AxonError extends Error {
  public readonly status?: number;
  public readonly statusText?: string;
  public readonly responseData?: unknown;
  public readonly url?: string;
  public readonly method?: string;

  constructor(error: AxiosError) {
    super(error.message);
    this.name = 'AxonError';

    if (error.response) {
      // Server responded with error status
      this.status = error.response.status;
      this.statusText = error.response.statusText;
      this.responseData = error.response.data;
    }

    if (error.config) {
      this.url = error.config.url;
      this.method = error.config.method?.toUpperCase();
    }

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AxonError);
    }
  }

  /**
   * Returns a formatted error message with all available details
   */
  public toString(): string {
    const parts = [`AxonError: ${this.message}`];

    if (this.method && this.url) {
      parts.push(`  Request: ${this.method} ${this.url}`);
    }

    if (this.status) {
      parts.push(`  Status: ${this.status} ${this.statusText || ''}`);
    }

    if (this.responseData) {
      parts.push(`  Response: ${JSON.stringify(this.responseData)}`);
    }

    return parts.join('\n');
  }
}

/**
 * Wrapper around Axios response that provides convenient accessor methods
 * Implements Promise interface to maintain backward compatibility
 */
export class AxonResponse<T = unknown> implements PromiseLike<AxiosResponse<T>> {
  private responsePromise: Promise<AxiosResponse<T>>;

  constructor(promise: Promise<AxiosResponse<T>>) {
    this.responsePromise = promise.catch(error => {
      // Wrap AxiosError in AxonError for better error messages
      if (axios.isAxiosError(error)) {
        throw new AxonError(error);
      }
      throw error;
    });
  }

  /**
   * Makes AxonResponse awaitable - returns full AxiosResponse
   * This maintains backward compatibility with existing code
   */
  then<TResult1 = AxiosResponse<T>, TResult2 = never>(
    onfulfilled?: ((value: AxiosResponse<T>) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    return this.responsePromise.then(onfulfilled, onrejected);
  }

  /**
   * Promise catch method for error handling
   */
  catch<TResult = never>(
    onrejected?: ((reason: unknown) => TResult | PromiseLike<TResult>) | null
  ): Promise<AxiosResponse<T> | TResult> {
    return this.responsePromise.catch(onrejected);
  }

  /**
   * Promise finally method
   */
  finally(onfinally?: (() => void) | null): Promise<AxiosResponse<T>> {
    return this.responsePromise.finally(onfinally);
  }

  /**
   * Extracts only the response data, discarding status, headers, etc.
   *
   * @returns Promise resolving to just the data (T)
   *
   * @example
   * ```typescript
   * // Instead of:
   * const response = await client.get<User[]>('/users');
   * const users = response.data;
   *
   * // You can now do:
   * const users = await client.get<User[]>('/users').data();
   * ```
   */
  async data(): Promise<T> {
    const response = await this.responsePromise;
    return response.data;
  }

  /**
   * Extracts only the HTTP status code
   *
   * @returns Promise resolving to status code
   *
   * @example
   * ```typescript
   * const statusCode = await client.get('/users').status();
   * console.log(statusCode); // 200
   * ```
   */
  async status(): Promise<number> {
    const response = await this.responsePromise;
    return response.status;
  }

  /**
   * Extracts only the response headers
   *
   * @returns Promise resolving to headers object
   *
   * @example
   * ```typescript
   * const headers = await client.get('/users').headers();
   * console.log(headers['content-type']);
   * ```
   */
  async headers(): Promise<Record<string, unknown>> {
    const response = await this.responsePromise;
    return response.headers;
  }

  /**
   * Checks if response status is in 2xx range (success)
   *
   * @returns Promise resolving to boolean
   *
   * @example
   * ```typescript
   * const isOk = await client.get('/users').ok();
   * if (isOk) {
   *   console.log('Request succeeded');
   * }
   * ```
   */
  async ok(): Promise<boolean> {
    const response = await this.responsePromise;
    return response.status >= 200 && response.status < 300;
  }
}

/**
 * Axon - A fluent HTTP client wrapper around Axios
 *
 * Provides a chainable API for building HTTP requests with type-safe responses.
 *
 * @example
 * ```typescript
 * const client = Axon.new();
 * const response = await client
 *   .bearer('token')
 *   .json()
 *   .get<User>('/api/user');
 * ```
 */
class Axon {
  private instance = axios.create();
  private config: AxiosRequestConfig = {};

  /**
   * Factory method to create a new Axon instance
   *
   * @param options - Configuration options
   * @returns A new Axon instance
   *
   * @example
   * ```typescript
   * // Secure by default
   * const client = Axon.new();
   *
   * // Allow self-signed certificates (dev only)
   * const devClient = Axon.new({ allowInsecure: true });
   * ```
   */
  public static new(options: Options = { allowInsecure: false }) {
    const config: AxiosRequestConfig = {};

    if (options?.allowInsecure) {
      config.httpsAgent = new https.Agent({
        rejectUnauthorized: false, // Ignore self-signed certificate errors
      });
    }

    return new Axon(config);
  }

  /**
   * Factory method to create a new Axon instance for development
   * Automatically enables allowInsecure mode for working with self-signed certificates
   *
   * @returns A new Axon instance with insecure mode enabled
   *
   * @example
   * ```typescript
   * // Quick development setup - allows self-signed certificates
   * const client = Axon.dev();
   *
   * // Equivalent to:
   * const client = Axon.new({ allowInsecure: true });
   * ```
   *
   * @warning Only use in development/testing environments
   */
  public static dev() {
    return Axon.new({ allowInsecure: true });
  }

  /**
   * Creates a new Axon instance
   *
   * @param config - Axios request configuration
   * @param instance - Optional Axios instance to use
   */
  constructor(config: AxiosRequestConfig = {}, instance?: AxiosInstance) {
    this.config = config;
    this.instance = instance || axios.create();
  }

  /**
   * Performs an HTTP GET request
   *
   * @template T - Expected response data type
   * @param url - The URL to request
   * @returns AxonResponse wrapper (awaitable, with convenience methods)
   *
   * @example
   * ```typescript
   * // Get full response (backward compatible)
   * const response = await client.get<User>('/api/user/123');
   * console.log(response.data.name);
   *
   * // Get just the data (new convenience method)
   * const user = await client.get<User>('/api/user/123').data();
   * console.log(user.name);
   *
   * // Get just the status code
   * const status = await client.get('/api/user/123').status();
   * ```
   */
  public get<T = unknown>(url: string): AxonResponse<T> {
    return new AxonResponse(this.instance.get<T>(url, this.config));
  }

  /**
   * Performs an HTTP POST request
   *
   * @template T - Expected response data type
   * @param url - The URL to request
   * @param payload - Optional request body
   * @returns AxonResponse wrapper (awaitable, with convenience methods)
   */
  public post<T = unknown>(url: string, payload?: unknown): AxonResponse<T> {
    return new AxonResponse(this.instance.post<T>(url, payload, this.config));
  }

  /**
   * Performs an HTTP PUT request
   *
   * @template T - Expected response data type
   * @param url - The URL to request
   * @param payload - Optional request body
   * @returns AxonResponse wrapper (awaitable, with convenience methods)
   */
  public put<T = unknown>(url: string, payload?: unknown): AxonResponse<T> {
    return new AxonResponse(this.instance.put<T>(url, payload, this.config));
  }

  /**
   * Performs an HTTP PATCH request
   *
   * @template T - Expected response data type
   * @param url - The URL to request
   * @param payload - Optional request body
   * @returns AxonResponse wrapper (awaitable, with convenience methods)
   */
  public patch<T = unknown>(url: string, payload?: unknown): AxonResponse<T> {
    return new AxonResponse(this.instance.patch<T>(url, payload, this.config));
  }

  /**
   * Performs an HTTP DELETE request
   *
   * @template T - Expected response data type
   * @param url - The URL to request
   * @param payload - Optional request body
   * @returns AxonResponse wrapper (awaitable, with convenience methods)
   */
  public delete<T = unknown>(url: string, payload?: unknown): AxonResponse<T> {
    return new AxonResponse(
      this.instance.delete<T>(url, { data: payload, ...this.config })
    );
  }

  /**
   * Performs an HTTP HEAD request
   *
   * @template T - Expected response data type
   * @param url - The URL to request
   * @returns AxonResponse wrapper (awaitable, with convenience methods)
   */
  public head<T = unknown>(url: string): AxonResponse<T> {
    return new AxonResponse(this.instance.head<T>(url, this.config));
  }

  /**
   * Performs an HTTP OPTIONS request
   *
   * @template T - Expected response data type
   * @param url - The URL to request
   * @returns AxonResponse wrapper (awaitable, with convenience methods)
   */
  public options<T = unknown>(url: string): AxonResponse<T> {
    return new AxonResponse(this.instance.options<T>(url, this.config));
  }

  /**
   * Sets a custom header
   *
   * @param key - Header name
   * @param value - Header value
   * @returns New Axon instance with updated configuration
   *
   * @example
   * ```typescript
   * const client = Axon.new().setHeader('X-API-Key', 'secret');
   * ```
   */
  public setHeader(key: string, value: string) {
    const newConfig = {
      ...this.config,
      headers: { ...this.config.headers, [key]: value },
    };

    return new Axon(newConfig, this.instance);
  }

  /**
   * Sets query parameters
   *
   * @param params - Query parameters object
   * @returns New Axon instance with updated configuration
   *
   * @example
   * ```typescript
   * const client = Axon.new().params({ page: 1, limit: 10 });
   * ```
   */
  public params(params: object) {
    const newConfig = {
      ...this.config,
      params,
    };

    return new Axon(newConfig, this.instance);
  }

  /**
   * Sets Basic authentication
   *
   * @param token - Base64 encoded credentials
   * @returns New Axon instance with updated configuration
   *
   * @example
   * ```typescript
   * const client = Axon.new().basic(btoa('username:password'));
   * ```
   */
  public basic(token: string) {
    const newConfig = {
      ...this.config,
      headers: { ...this.config.headers, Authorization: `Basic ${token}` },
    };

    return new Axon(newConfig, this.instance);
  }

  /**
   * Sets Bearer token authentication
   *
   * @param token - Bearer token
   * @returns New Axon instance with updated configuration
   *
   * @example
   * ```typescript
   * const client = Axon.new().bearer('your-jwt-token');
   * ```
   */
  public bearer(token: string): Axon {
    const newConfig = {
      ...this.config,
      headers: { ...this.config.headers, Authorization: `Bearer ${token}` },
    };

    return new Axon(newConfig, this.instance);
  }

  /**
   * Sets Content-Type to application/x-www-form-urlencoded
   *
   * @returns New Axon instance with updated configuration
   */
  public encodeUrl() {
    const newConfig = {
      ...this.config,
      headers: {
        ...this.config.headers,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    };

    return new Axon(newConfig, this.instance);
  }

  /**
   * Sets Content-Type to application/octet-stream
   *
   * @returns New Axon instance with updated configuration
   */
  public octet() {
    const newConfig = {
      ...this.config,
      headers: {
        ...this.config.headers,
        "Content-Type": "application/octet-stream",
      },
    };

    return new Axon(newConfig, this.instance);
  }

  /**
   * Sets Content-Length header
   *
   * @param contentLength - Content length in bytes
   * @returns New Axon instance with updated configuration
   */
  public length(contentLength: number) {
    const newConfig = {
      ...this.config,
      headers: {
        ...this.config.headers,
        "Content-Length": contentLength,
      },
    };

    return new Axon(newConfig, this.instance);
  }

  /**
   * Sets Digest header for content integrity
   *
   * @param digest - SHA digest value
   * @returns New Axon instance with updated configuration
   */
  public digest(digest: string) {
    const newConfig = {
      ...this.config,
      headers: { ...this.config.headers, Digest: `sha=${digest}` },
    };

    return new Axon(newConfig, this.instance);
  }

  /**
   * Sets Content-Range header for partial uploads
   *
   * @param offset - Start byte position
   * @param end - End byte position (exclusive)
   * @param fileSize - Total file size in bytes
   * @returns New Axon instance with updated configuration
   */
  public range(offset: number, end: number, fileSize: number) {
    const newConfig = {
      ...this.config,
      headers: {
        ...this.config.headers,
        "Content-Range": `bytes ${offset}-${end - 1}/${fileSize}`,
      },
    };

    return new Axon(newConfig, this.instance);
  }

  /**
   * Sets custom request transformers
   *
   * @param transformers - Axios request transformer(s)
   * @returns New Axon instance with updated configuration
   */
  public transformRequest(
    transformers: AxiosRequestTransformer | AxiosRequestTransformer[]
  ) {
    const newConfig = {
      ...this.config,
      transformRequest: transformers,
    };

    return new Axon(newConfig, this.instance);
  }

  /**
   * Sets the response type
   *
   * @param responseType - Expected response type (json, blob, arraybuffer, etc.)
   * @returns New Axon instance with updated configuration
   */
  public responseType(responseType: ResponseType) {
    const newConfig = {
      ...this.config,
      responseType,
    };

    return new Axon(newConfig, this.instance);
  }

  /**
   * Sets the base URL for all requests
   *
   * @param url - Base URL (e.g., 'https://api.example.com')
   * @returns New Axon instance with updated configuration
   *
   * @example
   * ```typescript
   * const client = Axon.new().baseUrl('https://api.example.com');
   * await client.get('/users'); // Requests https://api.example.com/users
   * ```
   */
  public baseUrl(url: string) {
    const newConfig = {
      ...this.config,
      baseURL: url,
    };

    return new Axon(newConfig, this.instance);
  }

  /**
   * Sets request timeout in milliseconds
   *
   * @param ms - Timeout in milliseconds
   * @returns New Axon instance with updated configuration
   *
   * @example
   * ```typescript
   * const client = Axon.new().timeout(5000); // 5 second timeout
   * ```
   */
  public timeout(ms: number) {
    const newConfig = {
      ...this.config,
      timeout: ms,
    };

    return new Axon(newConfig, this.instance);
  }

  /**
   * Sets Content-Type to application/json
   *
   * @returns New Axon instance with updated configuration
   */
  public json() {
    const newConfig = {
      ...this.config,
      headers: {
        ...this.config.headers,
        "Content-Type": "application/json",
      },
    };

    return new Axon(newConfig, this.instance);
  }

  /**
   * Sets Content-Type to multipart/form-data
   *
   * @returns New Axon instance with updated configuration
   */
  public multipart() {
    const newConfig = {
      ...this.config,
      headers: {
        ...this.config.headers,
        "Content-Type": "multipart/form-data",
      },
    };

    return new Axon(newConfig, this.instance);
  }
}

export default Axon;
