/**
 * Example: Using AxonResponse convenience methods
 *
 * This demonstrates the new .data(), .status(), .headers(), and .ok() methods
 * that make it easier to extract specific parts of the response.
 */

import Axon, { AxonError } from '../Axon';

interface User {
  id: number;
  name: string;
  email: string;
}

interface ApiResponse<T> {
  data: T;
  message: string;
}

async function examples() {
  const client = Axon.new().baseUrl('https://jsonplaceholder.typicode.com');

  // Example 1: Using .data() for cleaner code
  console.log('=== Example 1: Extract data directly ===');

  // Old way (still works - backward compatible)
  const response = await client.get<User>('/users/1');
  console.log('Old way:', response.data);

  // New way - much cleaner!
  const user = await client.get<User>('/users/1').data();
  console.log('New way:', user);

  // Example 2: Get just the status code
  console.log('\n=== Example 2: Get status code ===');
  const statusCode = await client.get('/users/1').status();
  console.log('Status:', statusCode); // 200

  // Example 3: Get just the headers
  console.log('\n=== Example 3: Get headers ===');
  const headers = await client.get('/users/1').headers();
  console.log('Content-Type:', headers['content-type']);

  // Example 4: Check if request was successful
  console.log('\n=== Example 4: Check success with .ok() ===');
  const isOk = await client.get('/users/1').ok();
  console.log('Request successful?', isOk); // true

  // Example 5: Combining with other methods
  console.log('\n=== Example 5: Fluent chaining ===');
  const users = await client
    .json()
    .timeout(5000)
    .get<User[]>('/users')
    .data(); // Get array of users directly

  console.log(`Fetched ${users.length} users`);

  // Example 6: Error handling with AxonError
  console.log('\n=== Example 6: Enhanced error handling ===');
  try {
    await client.get('/users/999999').data();
  } catch (error) {
    if (error instanceof AxonError) {
      // AxonError provides easy access to error details
      console.log('Error status:', error.status);
      console.log('Error URL:', error.url);
      console.log('Error method:', error.method);
      console.log('Error response:', error.responseData);
      console.log('\nFormatted error:\n', error.toString());
    }
  }

  // Example 7: Practical use case - API wrapper
  console.log('\n=== Example 7: Building an API client ===');

  class UserService {
    private client = Axon.new()
      .baseUrl('https://jsonplaceholder.typicode.com')
      .json()
      .timeout(10000);

    // Clean, simple methods using .data()
    async getUser(id: number): Promise<User> {
      return this.client.get<User>(`/users/${id}`).data();
    }

    async getAllUsers(): Promise<User[]> {
      return this.client.get<User[]>('/users').data();
    }

    async createUser(user: Partial<User>): Promise<User> {
      return this.client.post<User>('/users', user).data();
    }

    async updateUser(id: number, updates: Partial<User>): Promise<User> {
      return this.client.put<User>(`/users/${id}`, updates).data();
    }

    async deleteUser(id: number): Promise<boolean> {
      // Use .ok() to check if deletion was successful
      return this.client.delete(`/users/${id}`).ok();
    }

    async checkUserExists(id: number): Promise<boolean> {
      try {
        const status = await this.client.head(`/users/${id}`).status();
        return status === 200;
      } catch {
        return false;
      }
    }
  }

  const userService = new UserService();

  // Notice how clean the usage is - no need to extract .data manually
  const firstUser = await userService.getUser(1);
  console.log('User from service:', firstUser.name);

  const allUsers = await userService.getAllUsers();
  console.log(`Total users: ${allUsers.length}`);

  const exists = await userService.checkUserExists(1);
  console.log('User 1 exists?', exists);

  // Example 8: Multiple convenience methods
  console.log('\n=== Example 8: Conditional logic with .ok() ===');

  async function fetchUserSafely(id: number): Promise<User | null> {
    const response = client.get<User>(`/users/${id}`);

    // Check if request succeeded before extracting data
    if (await response.ok()) {
      return response.data();
    }
    return null;
  }

  const maybeUser = await fetchUserSafely(1);
  console.log('Safely fetched user:', maybeUser?.name);

  // Example 9: Parallel requests with .data()
  console.log('\n=== Example 9: Parallel requests ===');

  const [user1, user2, user3] = await Promise.all([
    client.get<User>('/users/1').data(),
    client.get<User>('/users/2').data(),
    client.get<User>('/users/3').data(),
  ]);

  console.log('Fetched users in parallel:', [user1.name, user2.name, user3.name]);

  // Example 10: Error handling best practices
  console.log('\n=== Example 10: Comprehensive error handling ===');

  async function robustFetch<T>(url: string): Promise<T | null> {
    try {
      return await client.get<T>(url).data();
    } catch (error) {
      if (error instanceof AxonError) {
        if (error.status === 404) {
          console.log('Resource not found');
        } else if (error.status && error.status >= 500) {
          console.log('Server error:', error.statusText);
        } else if (!error.status) {
          console.log('Network error - no response received');
        }

        // Log full error details for debugging
        console.error(error.toString());
      }
      return null;
    }
  }

  await robustFetch<User>('/invalid-endpoint');
}

// Run examples
examples().catch(console.error);
