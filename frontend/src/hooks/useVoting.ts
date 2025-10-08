import { useState } from 'react'
import { battleService } from '@/services/battleService'
import { VoteRequest } from '@/types/api'
import { toast } from 'react-hot-toast'

export function useVoting() {
  const [isVoting, setIsVoting] = useState(false)

  const voteBattle = async (data: VoteRequest) => {
    try {
      setIsVoting(true)
      await battleService.voteBattle(data)
      toast.success('Vote submitted successfully!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit vote')
      throw error
    } finally {
      setIsVoting(false)
    }
  }

  const likeBattle = async (battleId: string) => {
    try {
      await battleService.likeBattle(battleId)
      toast.success('Battle liked!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to like battle')
      throw error
    }
  }

  const shareBattle = async (battleId: string) => {
    try {
      await battleService.shareBattle(battleId)
      toast.success('Battle shared!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to share battle')
      throw error
    }
  }

  return {
    isVoting,
    voteBattle,
    likeBattle,
    shareBattle
  }
}
