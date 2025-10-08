// Mock API client for development
import { 
  mockBattles, 
  mockUsers, 
  mockTrendingBattles, 
  mockPersonalizedBattles, 
  mockQuickPicksBattles,
  mockUserBattles,
  getMockBattleById,
  getMockUserByUsername,
  getMockBattlesByCategory
} from '@/mocks/data'

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const mockApiClient = {
  get: async (url: string, config?: any) => {
    await delay(300) // Simulate network delay
    
    // Handle different endpoints
    if (url.includes('/battles/') && !url.includes('/battles/') + '/') {
      // Get all battles
      const params = config?.params || {}
      let battles = [...mockBattles]
      
      // Apply filters
      if (params.category) {
        battles = battles.filter(battle => battle.category === params.category)
      }
      
      if (params.trending) {
        battles = mockTrendingBattles
      }
      
      if (params.personalized) {
        battles = mockPersonalizedBattles
      }
      
      if (params.quick_picks) {
        battles = mockQuickPicksBattles
      }
      
      return {
        data: {
          success: true,
          data: battles,
          meta: {
            pagination: {
              page: 1,
              per_page: 20,
              total: battles.length,
              pages: Math.ceil(battles.length / 20)
            }
          }
        }
      }
    }
    
    if (url.includes('/battles/') && url.split('/').length > 2) {
      // Get single battle
      const battleId = url.split('/').pop()
      const battle = getMockBattleById(battleId!)
      
      if (!battle) {
        throw new Error('Battle not found')
      }
      
      return {
        data: {
          success: true,
          data: battle
        }
      }
    }
    
    if (url.includes('/users/') && !url.includes('/users/') + '/') {
      // Get all users
      return {
        data: {
          success: true,
          data: mockUsers
        }
      }
    }
    
    if (url.includes('/users/') && url.split('/').length > 2) {
      // Get single user
      const username = url.split('/').pop()
      const user = getMockUserByUsername(username!)
      
      if (!user) {
        throw new Error('User not found')
      }
      
      return {
        data: {
          success: true,
          data: user
        }
      }
    }
    
    if (url.includes('/trending/')) {
      return {
        data: {
          success: true,
          data: mockTrendingBattles
        }
      }
    }
    
    if (url.includes('/personalized/')) {
      return {
        data: {
          success: true,
          data: mockPersonalizedBattles
        }
      }
    }
    
    if (url.includes('/quick-picks/')) {
      return {
        data: {
          success: true,
          data: mockQuickPicksBattles
        }
      }
    }
    
    // Default response
    return {
      data: {
        success: true,
        data: []
      }
    }
  },
  
  post: async (url: string, data: any) => {
    await delay(200) // Simulate network delay
    
    if (url.includes('/auth/login/')) {
      return {
        data: {
          success: true,
          data: {
            user: mockUsers[0],
            token: 'mock-jwt-token'
          }
        }
      }
    }
    
    if (url.includes('/auth/register/')) {
      return {
        data: {
          success: true,
          data: {
            user: mockUsers[0],
            token: 'mock-jwt-token'
          }
        }
      }
    }
    
    if (url.includes('/battles/') && url.includes('/vote/')) {
      return {
        data: {
          success: true,
          message: 'Vote submitted successfully'
        }
      }
    }
    
    if (url.includes('/battles/') && url.includes('/like/')) {
      return {
        data: {
          success: true,
          message: 'Battle liked successfully'
        }
      }
    }
    
    if (url.includes('/battles/') && url.includes('/share/')) {
      return {
        data: {
          success: true,
          message: 'Battle shared successfully'
        }
      }
    }
    
    if (url.includes('/battles/') && !url.includes('/vote/') && !url.includes('/like/') && !url.includes('/share/')) {
      // Create battle
      const newBattle = {
        id: Math.random().toString(36).substr(2, 9),
        ...data,
        creator: mockUsers[0],
        created_at: new Date().toISOString(),
        is_active: true,
        trending_score: 0,
        total_votes: 0,
        user_voted: false,
        user_vote_element: null,
        engagement_stats: {
          total_votes: 0,
          likes: 0,
          shares: 0,
          comments: 0,
          views: 0
        }
      }
      
      return {
        data: {
          success: true,
          data: newBattle
        }
      }
    }
    
    // Default success response
    return {
      data: {
        success: true,
        message: 'Operation completed successfully'
      }
    }
  },
  
  put: async (url: string, data: any) => {
    await delay(200)
    
    return {
      data: {
        success: true,
        data: data
      }
    }
  },
  
  delete: async (url: string) => {
    await delay(200)
    
    return {
      data: {
        success: true,
        message: 'Deleted successfully'
      }
    }
  }
}
