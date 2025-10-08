import { useState, useEffect } from 'react'
import { userService } from '@/services/userService'
import { User, LoginRequest, RegisterRequest } from '@/types/api'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const checkAuth = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('auth_token')
      if (token) {
        // In a real app, you'd verify the token with the backend
        // For now, we'll use mock data
        const mockUser = {
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
        }
        setUser(mockUser)
      } else {
        setUser(null)
      }
      setError(null)
    } catch (err: any) {
      setError(err.message || 'Failed to check authentication')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkAuth()
  }, [])

  const login = async (data: LoginRequest) => {
    try {
      setLoading(true)
      const response = await userService.login(data)
      localStorage.setItem('auth_token', response.token)
      setUser(response.user)
      setError(null)
      return response
    } catch (err: any) {
      setError(err.message || 'Login failed')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const register = async (data: RegisterRequest) => {
    try {
      setLoading(true)
      const response = await userService.register(data)
      localStorage.setItem('auth_token', response.token)
      setUser(response.user)
      setError(null)
      return response
    } catch (err: any) {
      setError(err.message || 'Registration failed')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('auth_token')
    setUser(null)
    setError(null)
  }

  const updateProfile = async (data: Partial<User>) => {
    try {
      setLoading(true)
      const updatedUser = await userService.updateProfile(data)
      setUser(updatedUser)
      setError(null)
      return updatedUser
    } catch (err: any) {
      setError(err.message || 'Failed to update profile')
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateProfile
  }
}
