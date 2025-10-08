import { apiClient } from '@/services/apiClient'
import { mockApiClient } from '@/services/mockApiClient'
import { Battle, CreateBattleRequest, VoteRequest } from '@/types/api'

// Use mock client for development
const client = process.env.NODE_ENV === 'development' ? mockApiClient : apiClient

export const battleService = {
  // Get all battles
  async getBattles(filters?: any): Promise<Battle[]> {
    const response = await client.get('/battles/', { params: filters })
    return response.data
  },

  // Get single battle
  async getBattle(id: string): Promise<Battle> {
    const response = await client.get(`/battles/${id}/`)
    return response.data
  },

  // Create battle
  async createBattle(data: CreateBattleRequest): Promise<Battle> {
    const response = await client.post('/battles/', data)
    return response.data
  },

  // Vote on battle
  async voteBattle(data: VoteRequest): Promise<void> {
    await client.post(`/battles/${data.battle_id}/vote/`, data)
  },

  // Like battle
  async likeBattle(id: string): Promise<void> {
    await client.post(`/battles/${id}/like/`)
  },

  // Share battle
  async shareBattle(id: string): Promise<void> {
    await client.post(`/battles/${id}/share/`)
  },

  // Get trending battles
  async getTrendingBattles(): Promise<Battle[]> {
    const response = await client.get('/trending/')
    return response.data
  },

  // Get personalized battles
  async getPersonalizedBattles(): Promise<Battle[]> {
    const response = await client.get('/personalized/')
    return response.data
  },

  // Get quick picks battles
  async getQuickPicksBattles(): Promise<Battle[]> {
    const response = await client.get('/quick-picks/')
    return response.data
  },

  // Get battles by category
  async getBattlesByCategory(category: string): Promise<Battle[]> {
    const response = await client.get('/battles/', { params: { category } })
    return response.data
  }
}
