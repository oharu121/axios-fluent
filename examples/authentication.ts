import Axon from '../Axon';

/**
 * Authentication Example
 *
 * This example demonstrates different authentication methods
 */

interface AuthResponse {
  token: string;
  user: {
    id: number;
    username: string;
  };
}

interface ProtectedResource {
  id: number;
  data: string;
}

async function bearerTokenExample() {
  console.log('=== Bearer Token Authentication ===');

  // Simulate getting a JWT token
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

  const client = Axon.new()
    .baseUrl('https://api.example.com')
    .bearer(token)
    .json();

  try {
    const response = await client.get<ProtectedResource>('/protected/resource');
    console.log('Protected resource:', response.data);
  } catch (error: unknown) {
    console.error('Bearer auth error:', (error as Error).message);
  }
}

async function basicAuthExample() {
  console.log('\n=== Basic Authentication ===');

  // Basic auth requires base64 encoded credentials
  const username = 'user';
  const password = 'pass';
  const credentials = Buffer.from(`${username}:${password}`).toString('base64');

  const client = Axon.new()
    .baseUrl('https://api.example.com')
    .basic(credentials)
    .json();

  try {
    const response = await client.get('/protected/resource');
    console.log('Protected resource:', response.data);
  } catch (error: unknown) {
    console.error('Basic auth error:', (error as Error).message);
  }
}

async function apiKeyExample() {
  console.log('\n=== API Key Authentication ===');

  const client = Axon.new()
    .baseUrl('https://api.example.com')
    .setHeader('X-API-Key', 'your-api-key-here')
    .json();

  try {
    const response = await client.get('/protected/resource');
    console.log('Protected resource:', response.data);
  } catch (error: unknown) {
    console.error('API key error:', (error as Error).message);
  }
}

async function refreshTokenExample() {
  console.log('\n=== Refresh Token Flow ===');

  let accessToken = 'initial-access-token';
  const refreshToken = 'refresh-token';

  // Create a function to refresh the token
  async function refreshAccessToken(): Promise<string> {
    const authClient = Axon.new()
      .baseUrl('https://api.example.com')
      .json();

    const response = await authClient.post<AuthResponse>('/auth/refresh', {
      refreshToken
    });

    return response.data.token;
  }

  // Create client with initial token
  let client = Axon.new()
    .baseUrl('https://api.example.com')
    .bearer(accessToken)
    .json();

  try {
    // Try to make a request
    const response = await client.get('/protected/resource');
    console.log('Success:', response.data);
  } catch (error: unknown) {
    // If token expired, refresh and retry
    const axiosError = error as { response?: { status: number } };
    if (axiosError.response?.status === 401) {
      console.log('Token expired, refreshing...');
      accessToken = await refreshAccessToken();

      // Create new client with fresh token
      client = client.bearer(accessToken);

      // Retry the request
      const response = await client.get('/protected/resource');
      console.log('Success after refresh:', response.data);
    }
  }
}

async function multiHeaderAuthExample() {
  console.log('\n=== Multiple Headers Authentication ===');

  const client = Axon.new()
    .baseUrl('https://api.example.com')
    .setHeader('X-API-Key', 'your-api-key')
    .setHeader('X-Client-ID', 'client-123')
    .setHeader('X-Request-ID', globalThis.crypto.randomUUID())
    .json();

  try {
    const response = await client.get('/protected/resource');
    console.log('Protected resource:', response.data);
  } catch (error: unknown) {
    console.error('Multi-header auth error:', (error as Error).message);
  }
}

// Run examples
async function runExamples() {
  await bearerTokenExample();
  await basicAuthExample();
  await apiKeyExample();
  await refreshTokenExample();
  await multiHeaderAuthExample();
}

runExamples();
