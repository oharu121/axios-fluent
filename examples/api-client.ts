import Axon from '../Axon';

/**
 * API Client Example
 *
 * This example shows how to create a reusable API client
 * with authentication and base configuration
 */

interface User {
  id: number;
  name: string;
  email: string;
}

interface Post {
  id: number;
  userId: number;
  title: string;
  body: string;
}

class ApiClient {
  private client: Axon;

  constructor(baseUrl: string, token?: string) {
    this.client = Axon.new()
      .baseUrl(baseUrl)
      .json()
      .timeout(10000);

    if (token) {
      this.client = this.client.bearer(token);
    }
  }

  // User endpoints
  async getUser(id: number): Promise<User> {
    const response = await this.client.get<User>(`/users/${id}`);
    return response.data;
  }

  async listUsers(): Promise<User[]> {
    const response = await this.client.get<User[]>('/users');
    return response.data;
  }

  async createUser(user: Partial<User>): Promise<User> {
    const response = await this.client.post<User>('/users', user);
    return response.data;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    const response = await this.client.put<User>(`/users/${id}`, updates);
    return response.data;
  }

  async deleteUser(id: number): Promise<void> {
    await this.client.delete(`/users/${id}`);
  }

  // Post endpoints
  async getPost(id: number): Promise<Post> {
    const response = await this.client.get<Post>(`/posts/${id}`);
    return response.data;
  }

  async getUserPosts(userId: number): Promise<Post[]> {
    const response = await this.client
      .params({ userId })
      .get<Post[]>('/posts');
    return response.data;
  }

  async createPost(post: Partial<Post>): Promise<Post> {
    const response = await this.client.post<Post>('/posts', post);
    return response.data;
  }
}

// Usage example
async function runExample() {
  const api = new ApiClient('https://jsonplaceholder.typicode.com');

  try {
    // Fetch a user
    const user = await api.getUser(1);
    console.log('User:', user);

    // Get user's posts
    const posts = await api.getUserPosts(1);
    console.log(`User has ${posts.length} posts`);

    // Create a new post
    const newPost = await api.createPost({
      userId: 1,
      title: 'My New Post',
      body: 'This is the post content'
    });
    console.log('Created post:', newPost);

  } catch (error: any) {
    console.error('API Error:', error.message);
  }
}

// Run the example
runExample();
