/**
 * MSW Request Handlers
 * Define mock API responses for testing
 */

import { http, HttpResponse } from 'msw';

// Mock user data
const mockUser = {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
};

const mockUsers = [
  mockUser,
  { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com' },
];

// Define request handlers
export const handlers = [
  // GET /api/users - Get all users
  http.get('https://api.example.com/api/users', () => {
    return HttpResponse.json(mockUsers, { status: 200 });
  }),

  // GET /api/users/:id - Get single user
  http.get('https://api.example.com/api/users/:id', ({ params }) => {
    const { id } = params;
    const user = mockUsers.find((u) => u.id === Number(id));

    if (user) {
      return HttpResponse.json(user, { status: 200 });
    }

    return HttpResponse.json(
      { message: 'User not found' },
      { status: 404 }
    );
  }),

  // POST /api/users - Create user
  http.post('https://api.example.com/api/users', async ({ request }) => {
    const body = await request.json() as any;
    const newUser = {
      id: 4,
      ...body,
    };

    return HttpResponse.json(newUser, { status: 201 });
  }),

  // POST /api/users/:id - Error (should use PUT/PATCH)
  http.post('https://api.example.com/api/users/:id', () => {
    return HttpResponse.json(
      { message: 'User not found' },
      { status: 404 }
    );
  }),

  // PUT /api/users/:id - Update user
  http.put('https://api.example.com/api/users/:id', async ({ params, request }) => {
    const { id } = params;
    const body = await request.json() as any;
    const user = mockUsers.find((u) => u.id === Number(id));

    if (user) {
      const updatedUser = { ...user, ...body };
      return HttpResponse.json(updatedUser, { status: 200 });
    }

    return HttpResponse.json(
      { message: 'User not found' },
      { status: 404 }
    );
  }),

  // PATCH /api/users/:id - Partial update
  http.patch('https://api.example.com/api/users/:id', async ({ params, request }) => {
    const { id } = params;
    const body = await request.json() as any;
    const user = mockUsers.find((u) => u.id === Number(id));

    if (user) {
      const updatedUser = { ...user, ...body };
      return HttpResponse.json(updatedUser, { status: 200 });
    }

    return HttpResponse.json(
      { message: 'User not found' },
      { status: 404 }
    );
  }),

  // DELETE /api/users/:id - Delete user
  http.delete('https://api.example.com/api/users/:id', ({ params }) => {
    const { id } = params;
    const user = mockUsers.find((u) => u.id === Number(id));

    if (user) {
      return HttpResponse.json(
        { message: 'User deleted' },
        { status: 200 }
      );
    }

    return HttpResponse.json(
      { message: 'User not found' },
      { status: 404 }
    );
  }),

  // HEAD /api/users/:id - Check if user exists
  http.head('https://api.example.com/api/users/:id', ({ params }) => {
    const { id } = params;
    const user = mockUsers.find((u) => u.id === Number(id));

    if (user) {
      return new HttpResponse(null, { status: 200 });
    }

    return new HttpResponse(null, { status: 404 });
  }),

  // OPTIONS /api/users - Get allowed methods
  http.options('https://api.example.com/api/users', () => {
    return new HttpResponse(null, {
      status: 204,
      headers: {
        'Allow': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      },
    });
  }),

  // Error responses for testing
  http.get('https://api.example.com/error/500', () => {
    return HttpResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }),

  http.get('https://api.example.com/error/401', () => {
    return HttpResponse.json(
      { message: 'Unauthorized' },
      { status: 401 }
    );
  }),

  http.get('https://api.example.com/error/403', () => {
    return HttpResponse.json(
      { message: 'Forbidden' },
      { status: 403 }
    );
  }),

  // Slow response for timeout testing
  http.get('https://api.example.com/slow', async () => {
    await new Promise((resolve) => setTimeout(resolve, 5000));
    return HttpResponse.json({ message: 'Slow response' });
  }),
];
