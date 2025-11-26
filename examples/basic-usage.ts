import Axon from '../Axon';

/**
 * Basic Usage Example
 *
 * This example demonstrates basic HTTP operations using Axon
 */

interface User {
  id: number;
  name: string;
  email: string;
}

async function basicExample() {
  // Create a client
  const client = Axon.new();

  try {
    // Simple GET request
    const response = await client.get<User>('https://jsonplaceholder.typicode.com/users/1');
    console.log('User:', response.data);

    // POST request with payload
    const newUser: Partial<User> = {
      name: 'John Doe',
      email: 'john@example.com'
    };

    const createResponse = await client
      .json()
      .post<User>('https://jsonplaceholder.typicode.com/users', newUser);
    console.log('Created:', createResponse.data);

    // PUT request to update
    const updates: Partial<User> = {
      name: 'Jane Doe'
    };

    await client
      .json()
      .put('https://jsonplaceholder.typicode.com/users/1', updates);
    console.log('Updated successfully');

    // DELETE request
    await client.delete('https://jsonplaceholder.typicode.com/users/1');
    console.log('Deleted successfully');

  } catch (error: unknown) {
    console.error('Error:', (error as Error).message);
  }
}

// Run the example
basicExample();
