import { useState, useEffect } from 'react'
import { battleService } from '@/services/battleService'
import { Battle, BattleFilters } from '@/types/api'

export function useBattles(filters: BattleFilters = {}) {
  const [battles, setBattles] = useState<Battle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBattles = async () => {
    try {
      setLoading(true)
      const data = await battleService.getBattles(filters)
      setBattles(data)
      setError(null)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch battles')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBattles()
    
    // 5-minute polling for updates
    const interval = setInterval(fetchBattles, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [JSON.stringify(filters)])

  return { battles, loading, error, refetch: fetchBattles }
}

export function useBattle(id: string) {
  const [battle, setBattle] = useState<Battle | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBattle = async () => {
    try {
      setLoading(true)
      const data = await battleService.getBattle(id)
      setBattle(data)
      setError(null)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch battle')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      fetchBattle()
      
      // 5-minute polling for updates
      const interval = setInterval(fetchBattle, 5 * 60 * 1000)
      return () => clearInterval(interval)
    }
  }, [id])

  return { battle, loading, error, refetch: fetchBattle }
}

export function useTrendingBattles() {
  const [battles, setBattles] = useState<Battle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTrending = async () => {
    try {
      setLoading(true)
      const data = await battleService.getTrendingBattles()
      setBattles(data)
      setError(null)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch trending battles')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTrending()
    
    // 5-minute polling for trending updates
    const interval = setInterval(fetchTrending, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  return { battles, loading, error, refetch: fetchTrending }
}

export function usePersonalizedBattles() {
  const [battles, setBattles] = useState<Battle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPersonalized = async () => {
    try {
      setLoading(true)
      const data = await battleService.getPersonalizedBattles()
      setBattles(data)
      setError(null)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch personalized battles')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPersonalized()
    
    // 5-minute polling for personalized updates
    const interval = setInterval(fetchPersonalized, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  return { battles, loading, error, refetch: fetchPersonalized }
}

export function useQuickPicksBattles() {
  const [battles, setBattles] = useState<Battle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchQuickPicks = async () => {
    try {
      setLoading(true)
      const data = await battleService.getQuickPicksBattles()
      setBattles(data)
      setError(null)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch quick picks battles')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQuickPicks()
    
    // 5-minute polling for quick picks updates
    const interval = setInterval(fetchQuickPicks, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  return { battles, loading, error, refetch: fetchQuickPicks }
}

export function useBattlesByCategory(category: string) {
  const [battles, setBattles] = useState<Battle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCategoryBattles = async () => {
    try {
      setLoading(true)
      const data = await battleService.getBattlesByCategory(category)
      setBattles(data)
      setError(null)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch category battles')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (category) {
      fetchCategoryBattles()
      
      // 5-minute polling for category updates
      const interval = setInterval(fetchCategoryBattles, 5 * 60 * 1000)
      return () => clearInterval(interval)
    }
  }, [category])

  return { battles, loading, error, refetch: fetchCategoryBattles }
}
