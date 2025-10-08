import { Metadata } from 'next'
import { HomePage } from '@/components/pages/HomePage'

export const metadata: Metadata = {
  title: 'VoteFight - Social Voting Platform',
  description: 'Create voting battles and let the community decide the winner. Join the ultimate social voting experience.',
}

export default function Home() {
  return <HomePage />
}