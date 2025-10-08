// Mock data for VoteFight frontend development

export const mockUsers = [
  {
    id: '1',
    username: 'testuser',
    email: 'test@example.com',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    bio: 'VoteFight enthusiast and battle creator',
    battles_count: 15,
    followers_count: 120,
    following_count: 89,
    total_votes_received: 2500,
    created_at: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    username: 'battlemaster',
    email: 'battle@example.com',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    bio: 'Creating epic battles since 2024',
    battles_count: 32,
    followers_count: 450,
    following_count: 120,
    total_votes_received: 8900,
    created_at: '2024-01-10T08:15:00Z'
  }
]

export const mockBattles = [
  {
    id: '1',
    title: 'iPhone vs Samsung',
    description: 'Which smartphone is better for daily use?',
    category: 'technology',
    total_votes: 1250,
    elements: [
      {
        id: '1',
        name: 'iPhone',
        media_type: 'text' as const,
        vote_count: 750,
        percentage: 60
      },
      {
        id: '2',
        name: 'Samsung',
        media_type: 'text' as const,
        vote_count: 500,
        percentage: 40
      }
    ],
    creator: mockUsers[0],
    created_at: '2024-01-20T14:30:00Z',
    is_active: true,
    trending_score: 85.5,
    user_voted: false,
    user_vote_element: null,
    engagement_stats: {
      total_votes: 1250,
      likes: 45,
      shares: 12,
      comments: 8,
      views: 2500
    }
  },
  {
    id: '2',
    title: 'Coca-Cola vs Pepsi',
    description: 'The ultimate cola battle!',
    category: 'food',
    total_votes: 890,
    elements: [
      {
        id: '3',
        name: 'Coca-Cola',
        media_type: 'text' as const,
        vote_count: 534,
        percentage: 60
      },
      {
        id: '4',
        name: 'Pepsi',
        media_type: 'text' as const,
        vote_count: 356,
        percentage: 40
      }
    ],
    creator: mockUsers[1],
    created_at: '2024-01-19T16:45:00Z',
    is_active: true,
    trending_score: 72.3,
    user_voted: true,
    user_vote_element: '3',
    engagement_stats: {
      total_votes: 890,
      likes: 32,
      shares: 18,
      comments: 15,
      views: 1800
    }
  },
  {
    id: '3',
    title: 'Netflix vs Disney+',
    description: 'Which streaming service do you prefer?',
    category: 'entertainment',
    total_votes: 2100,
    elements: [
      {
        id: '5',
        name: 'Netflix',
        media_type: 'text' as const,
        vote_count: 1260,
        percentage: 60
      },
      {
        id: '6',
        name: 'Disney+',
        media_type: 'text' as const,
        vote_count: 840,
        percentage: 40
      }
    ],
    creator: mockUsers[0],
    created_at: '2024-01-18T12:20:00Z',
    is_active: true,
    trending_score: 91.2,
    user_voted: false,
    user_vote_element: null,
    engagement_stats: {
      total_votes: 2100,
      likes: 78,
      shares: 25,
      comments: 22,
      views: 4200
    }
  },
  {
    id: '4',
    title: 'Pizza vs Burger',
    description: 'What\'s your favorite fast food?',
    category: 'food',
    total_votes: 650,
    elements: [
      {
        id: '7',
        name: 'Pizza',
        media_type: 'text' as const,
        vote_count: 390,
        percentage: 60
      },
      {
        id: '8',
        name: 'Burger',
        media_type: 'text' as const,
        vote_count: 260,
        percentage: 40
      }
    ],
    creator: mockUsers[1],
    created_at: '2024-01-17T09:15:00Z',
    is_active: true,
    trending_score: 58.7,
    user_voted: true,
    user_vote_element: '7',
    engagement_stats: {
      total_votes: 650,
      likes: 28,
      shares: 9,
      comments: 12,
      views: 1300
    }
  },
  {
    id: '5',
    title: 'Tesla vs BMW',
    description: 'Electric vs Luxury - which car would you choose?',
    category: 'technology',
    total_votes: 1800,
    elements: [
      {
        id: '9',
        name: 'Tesla',
        media_type: 'text' as const,
        vote_count: 1080,
        percentage: 60
      },
      {
        id: '10',
        name: 'BMW',
        media_type: 'text' as const,
        vote_count: 720,
        percentage: 40
      }
    ],
    creator: mockUsers[0],
    created_at: '2024-01-16T11:30:00Z',
    is_active: true,
    trending_score: 88.9,
    user_voted: false,
    user_vote_element: null,
    engagement_stats: {
      total_votes: 1800,
      likes: 65,
      shares: 20,
      comments: 18,
      views: 3600
    }
  }
]

export const mockTrendingBattles = [
  mockBattles[2], // Netflix vs Disney+
  mockBattles[0], // iPhone vs Samsung
  mockBattles[4], // Tesla vs BMW
  mockBattles[1], // Coca-Cola vs Pepsi
  mockBattles[3]  // Pizza vs Burger
]

export const mockPersonalizedBattles = [
  mockBattles[0], // iPhone vs Samsung
  mockBattles[2], // Netflix vs Disney+
  mockBattles[4]  // Tesla vs BMW
]

export const mockCategoryBattles = {
  technology: [mockBattles[0], mockBattles[4]], // iPhone vs Samsung, Tesla vs BMW
  food: [mockBattles[1], mockBattles[3]], // Coca-Cola vs Pepsi, Pizza vs Burger
  entertainment: [mockBattles[2]] // Netflix vs Disney+
}

export const mockQuickPicksBattles = [
  mockBattles[3], // Pizza vs Burger
  mockBattles[1], // Coca-Cola vs Pepsi
  mockBattles[0]  // iPhone vs Samsung
]

export const mockUserBattles = {
  testuser: [mockBattles[0], mockBattles[2], mockBattles[4]], // iPhone, Netflix, Tesla
  battlemaster: [mockBattles[1], mockBattles[3]] // Coca-Cola, Pizza
}

export const mockCategories = [
  { id: 'technology', name: 'Technology', icon: '🎯', count: 45 },
  { id: 'food', name: 'Food & Drinks', icon: '🍕', count: 32 },
  { id: 'entertainment', name: 'Entertainment', icon: '🎬', count: 28 },
  { id: 'sports', name: 'Sports', icon: '⚽', count: 15 },
  { id: 'lifestyle', name: 'Lifestyle', icon: '🏠', count: 22 },
  { id: 'other', name: 'Other', icon: '📝', count: 18 }
]

export const mockLanguages = [
  { code: 'uz', name: 'O\'zbekcha', flag: '🇺🇿' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'en', name: 'English', flag: '🇺🇸' }
]

export const mockNotifications = [
  {
    id: '1',
    type: 'vote_received',
    title: 'New vote received!',
    message: 'Someone voted on your "iPhone vs Samsung" battle',
    read: false,
    created_at: '2024-01-20T15:30:00Z'
  },
  {
    id: '2',
    type: 'battle_trending',
    title: 'Your battle is trending!',
    message: 'iPhone vs Samsung is now in the top 10 trending battles',
    read: false,
    created_at: '2024-01-20T14:15:00Z'
  },
  {
    id: '3',
    type: 'user_followed',
    title: 'New follower',
    message: 'battlemaster started following you',
    read: true,
    created_at: '2024-01-20T12:45:00Z'
  }
]

// Helper functions for mock data
export const getMockBattleById = (id: string) => {
  return mockBattles.find(battle => battle.id === id)
}

export const getMockUserByUsername = (username: string) => {
  return mockUsers.find(user => user.username === username)
}

export const getMockBattlesByCategory = (category: string) => {
  return mockBattles.filter(battle => battle.category === category)
}

export const getMockUserBattles = (username: string) => {
  return mockUserBattles[username] || []
}

export const getMockTrendingBattles = () => {
  return mockTrendingBattles
}

export const getMockPersonalizedBattles = () => {
  return mockPersonalizedBattles
}

export const getMockQuickPicksBattles = () => {
  return mockQuickPicksBattles
}
