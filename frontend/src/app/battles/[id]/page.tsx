import { Metadata } from 'next'
import { BattleDetailPage } from '@/components/pages/BattleDetailPage'

interface BattlePageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: BattlePageProps): Promise<Metadata> {
  // TODO: Fetch battle data for SEO
  return {
    title: `Battle - VoteFight`,
    description: 'Vote on this battle and see real-time results',
  }
}

export default function BattlePage({ params }: BattlePageProps) {
  return <BattleDetailPage battleId={params.id} />
}
