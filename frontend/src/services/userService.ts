import { apiClient } from '@/services/apiClient'
import { mockApiClient } from '@/services/mockApiClient'
import { User, LoginRequest, RegisterRequest } from '@/types/api'

// Use mock client for development
const client = process.env.NODE_ENV === 'development' ? mockApiClient : apiClient

export const userService = {
  // Login
  async login(data: LoginRequest): Promise<{ user: User; token: string }> {
    const response = await client.post('/auth/login/', data)
    return response.data
  },

  // Register
  async register(data: RegisterRequest): Promise<{ user: User; token: string }> {
    const response = await client.post('/auth/register/', data)
    return response.data
  },

  // Get user profile
  async getUserProfile(username: string): Promise<User> {
    const response = await client.get(`/users/${username}/`)
    return response.data
  },

  // Get user battles
  async getUserBattles(username: string): Promise<any[]> {
    const response = await client.get(`/users/${username}/battles/`)
    return response.data
  },

  // Update profile
  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await client.put('/users/me/', data)
    return response.data
  },

  // Follow user
  async followUser(username: string): Promise<void> {
    await client.post(`/users/${username}/follow/`)
  },

  // Unfollow user
  async unfollowUser(username: string): Promise<void> {
    await client.delete(`/users/${username}/follow/`)
  }
}
