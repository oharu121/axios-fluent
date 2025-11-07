import axios, {
  AxiosRequestConfig,
  AxiosResponse,
  AxiosInstance,
  AxiosRequestTransformer,
  ResponseType,
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
   * @returns Promise with typed Axios response
   *
   * @example
   * ```typescript
   * const response = await client.get<User>('/api/user/123');
   * console.log(response.data.name);
   * ```
   */
  public async get<T = any>(url: string): Promise<AxiosResponse<T>> {
    const res = await this.instance.get<T>(url, this.config);
    return res;
  }

  /**
   * Performs an HTTP POST request
   *
   * @template T - Expected response data type
   * @param url - The URL to request
   * @param payload - Optional request body
   * @returns Promise with typed Axios response
   */
  public async post<T = any>(
    url: string,
    payload?: any
  ): Promise<AxiosResponse<T>> {
    return await this.instance.post<T>(url, payload, this.config);
  }

  /**
   * Performs an HTTP PUT request
   *
   * @template T - Expected response data type
   * @param url - The URL to request
   * @param payload - Optional request body
   * @returns Promise with typed Axios response
   */
  public async put<T = any>(url: string, payload?: any): Promise<AxiosResponse<T>> {
    return await this.instance.put<T>(url, payload, this.config);
  }

  /**
   * Performs an HTTP PATCH request
   *
   * @template T - Expected response data type
   * @param url - The URL to request
   * @param payload - Optional request body
   * @returns Promise with typed Axios response
   */
  public async patch<T = any>(url: string, payload?: any): Promise<AxiosResponse<T>> {
    return await this.instance.patch<T>(url, payload, this.config);
  }

  /**
   * Performs an HTTP DELETE request
   *
   * @template T - Expected response data type
   * @param url - The URL to request
   * @param payload - Optional request body
   * @returns Promise with typed Axios response
   */
  public async delete<T = any>(
    url: string,
    payload?: any
  ): Promise<AxiosResponse<T>> {
    return await this.instance.delete<T>(url, { data: payload, ...this.config });
  }

  /**
   * Performs an HTTP HEAD request
   *
   * @template T - Expected response data type
   * @param url - The URL to request
   * @returns Promise with typed Axios response
   */
  public async head<T = any>(url: string): Promise<AxiosResponse<T>> {
    return await this.instance.head<T>(url, this.config);
  }

  /**
   * Performs an HTTP OPTIONS request
   *
   * @template T - Expected response data type
   * @param url - The URL to request
   * @returns Promise with typed Axios response
   */
  public async options<T = any>(url: string): Promise<AxiosResponse<T>> {
    return await this.instance.options<T>(url, this.config);
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
