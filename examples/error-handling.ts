import Axon from '../Axon';
import { AxiosError } from 'axios';

/**
 * Error Handling Example
 *
 * This example demonstrates proper error handling patterns with Axon
 */

interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}

async function basicErrorHandling() {
  console.log('=== Basic Error Handling ===');

  const client = Axon.new()
    .baseUrl('https://jsonplaceholder.typicode.com')
    .json();

  try {
    // Try to fetch a non-existent resource
    await client.get('/users/99999');
  } catch (error: unknown) {
    const axiosError = error as { response?: { status: number; data: unknown; headers: unknown }; request?: unknown; message?: string };
    if (axiosError.response) {
      // Server responded with error status
      console.error('Status:', axiosError.response.status);
      console.error('Data:', axiosError.response.data);
      console.error('Headers:', axiosError.response.headers);
    } else if (axiosError.request) {
      // Request made but no response
      console.error('No response received');
      console.error('Request:', axiosError.request);
    } else {
      // Error setting up request
      console.error('Error:', axiosError.message);
    }
  }
}

async function typedErrorHandling() {
  console.log('\n=== Typed Error Handling ===');

  const client = Axon.new()
    .baseUrl('https://api.example.com')
    .bearer('invalid-token')
    .json();

  try {
    await client.get('/protected/resource');
  } catch (error) {
    if (error instanceof Error) {
      const axiosError = error as AxiosError<ApiError>;

      if (axiosError.response) {
        // Type-safe error handling
        const apiError = axiosError.response.data;
        console.error(`API Error: ${apiError.message} (${apiError.statusCode})`);

        // Handle specific status codes
        switch (axiosError.response.status) {
          case 401:
            console.log('Unauthorized - please login');
            break;
          case 403:
            console.log('Forbidden - insufficient permissions');
            break;
          case 404:
            console.log('Resource not found');
            break;
          case 500:
            console.log('Server error - please try again later');
            break;
          default:
            console.log('An error occurred');
        }
      }
    }
  }
}

async function retryWithExponentialBackoff() {
  console.log('\n=== Retry with Exponential Backoff ===');

  async function makeRequestWithRetry<T>(
    requestFn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await requestFn();
      } catch (error: unknown) {
        const isLastAttempt = attempt === maxRetries - 1;

        if (isLastAttempt) {
          throw error;
        }

        // Check if error is retryable
        const axiosError = error as { response?: { status: number } };
        const isRetryable =
          !axiosError.response ||
          axiosError.response.status >= 500 ||
          axiosError.response.status === 429;

        if (!isRetryable) {
          throw error;
        }

        // Calculate delay with exponential backoff
        const delay = baseDelay * Math.pow(2, attempt);
        console.log(`Attempt ${attempt + 1} failed, retrying in ${delay}ms...`);

        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw new Error('Max retries exceeded');
  }

  const client = Axon.new()
    .baseUrl('https://api.example.com')
    .json()
    .timeout(5000);

  try {
    const result = await makeRequestWithRetry(() =>
      client.get('/unstable-endpoint')
    );
    console.log('Success:', result);
  } catch (error: unknown) {
    console.error('All retries failed:', (error as Error).message);
  }
}

async function timeoutHandling() {
  console.log('\n=== Timeout Handling ===');

  const client = Axon.new()
    .baseUrl('https://httpbin.org')
    .timeout(2000); // 2 second timeout

  try {
    // This endpoint delays for 5 seconds
    await client.get('/delay/5');
  } catch (error: unknown) {
    const axiosError = error as { code?: string; message?: string };
    if (axiosError.code === 'ECONNABORTED') {
      console.error('Request timed out');
    } else {
      console.error('Error:', axiosError.message);
    }
  }
}

async function networkErrorHandling() {
  console.log('\n=== Network Error Handling ===');

  const client = Axon.new()
    .baseUrl('https://invalid-domain-that-does-not-exist-12345.com')
    .json();

  try {
    await client.get('/api/data');
  } catch (error: unknown) {
    const axiosError = error as { code?: string; message?: string };
    if (axiosError.code === 'ENOTFOUND') {
      console.error('Network error: Host not found');
    } else if (axiosError.code === 'ECONNREFUSED') {
      console.error('Network error: Connection refused');
    } else {
      console.error('Network error:', axiosError.message);
    }
  }
}

async function validationErrorHandling() {
  console.log('\n=== Validation Error Handling ===');

  const client = Axon.new()
    .baseUrl('https://jsonplaceholder.typicode.com')
    .json();

  try {
    // Try to create a user with invalid data
    await client.post('/users', {
      // Missing required fields
      invalidField: 'value'
    });
  } catch (error: unknown) {
    const axiosError = error as { response?: { status: number; data: unknown } };
    if (axiosError.response?.status === 400) {
      console.error('Validation error:', axiosError.response.data);
      // Handle validation errors from server
    }
  }
}

// Run all examples
async function runExamples() {
  await basicErrorHandling();
  await typedErrorHandling();
  await retryWithExponentialBackoff();
  await timeoutHandling();
  await networkErrorHandling();
  await validationErrorHandling();
}

runExamples();
