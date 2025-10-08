import { Metadata } from 'next'
import { UserProfilePage } from '@/components/pages/UserProfilePage'

interface UserProfilePageProps {
  params: {
    username: string
  }
}

export async function generateMetadata({ params }: UserProfilePageProps): Promise<Metadata> {
  return {
    title: `@${params.username} - VoteFight`,
    description: `View ${params.username}'s profile and battles on VoteFight`,
  }
}

export default function UserProfile({ params }: UserProfilePageProps) {
  return <UserProfilePage username={params.username} />
}
