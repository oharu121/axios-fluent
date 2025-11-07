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
  } catch (error: any) {
    if (error.response) {
      // Server responded with error status
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      console.error('Headers:', error.response.headers);
    } else if (error.request) {
      // Request made but no response
      console.error('No response received');
      console.error('Request:', error.request);
    } else {
      // Error setting up request
      console.error('Error:', error.message);
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
      } catch (error: any) {
        const isLastAttempt = attempt === maxRetries - 1;

        if (isLastAttempt) {
          throw error;
        }

        // Check if error is retryable
        const isRetryable =
          !error.response ||
          error.response.status >= 500 ||
          error.response.status === 429;

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
  } catch (error: any) {
    console.error('All retries failed:', error.message);
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
  } catch (error: any) {
    if (error.code === 'ECONNABORTED') {
      console.error('Request timed out');
    } else {
      console.error('Error:', error.message);
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
  } catch (error: any) {
    if (error.code === 'ENOTFOUND') {
      console.error('Network error: Host not found');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('Network error: Connection refused');
    } else {
      console.error('Network error:', error.message);
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
  } catch (error: any) {
    if (error.response?.status === 400) {
      console.error('Validation error:', error.response.data);
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
