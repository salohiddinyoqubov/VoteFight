'use client'

import { useState } from 'react'
import { PlusIcon } from '@heroicons/react/24/outline'
import { Header } from '@/components/layout/Header'
import { TrendingSection } from '@/components/sections/TrendingSection'
import { PersonalizedSection } from '@/components/sections/PersonalizedSection'
import { CategorySection } from '@/components/sections/CategorySection'
import { QuickPicksSection } from '@/components/sections/QuickPicksSection'
import { CreateBattleModal } from '@/components/modals/CreateBattleModal'

export function HomePage() {
  const [createModalOpen, setCreateModalOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to VoteFight
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Create battles, vote on your favorites, and see what the community thinks!
          </p>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Create Battle
          </button>
        </div>

        {/* Trending Section */}
        <TrendingSection
          title="🔥 Trending Now"
          subtitle="The most popular battles right now"
          icon="🔥"
          type="global"
        />

        {/* Personalized Section */}
        <PersonalizedSection
          title="📱 Made for You"
          subtitle="Battles we think you'll love"
          icon="📱"
          type="personalized"
        />

        {/* Category Sections */}
        <CategorySection
          title="🎯 Technology"
          subtitle="Tech battles and comparisons"
          icon="🎯"
          type="category"
          category="technology"
        />

        <CategorySection
          title="🍕 Food & Drinks"
          subtitle="Food battles and taste tests"
          icon="🍕"
          type="category"
          category="food"
        />

        <CategorySection
          title="🎬 Entertainment"
          subtitle="Movies, shows, and entertainment battles"
          icon="🎬"
          type="category"
          category="entertainment"
        />

        {/* Quick Picks Section */}
        <QuickPicksSection
          title="⚡ Quick Picks"
          subtitle="Fast voting battles"
          icon="⚡"
          type="quick-picks"
        />
      </div>

      {/* Create Battle Modal */}
      <CreateBattleModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />
    </div>
  )
}