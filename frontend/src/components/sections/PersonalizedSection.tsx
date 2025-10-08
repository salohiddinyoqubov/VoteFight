'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { TrendingSectionProps } from '@/types/api'
import { BattleCard } from '@/components/battles/BattleCard'
import { usePersonalizedBattles } from '@/hooks/useBattles'

export function PersonalizedSection({ 
  title, 
  subtitle, 
  icon, 
  type, 
  category 
}: TrendingSectionProps) {
  const { battles, loading, error } = usePersonalizedBattles()
  
  if (loading) {
    return (
      <section className="mb-12">
        <div className="flex items-center mb-6">
          <div className="flex items-center text-red-600 mr-3">
            {icon}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            <p className="text-gray-600">{subtitle}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 rounded-lg h-48"></div>
            </div>
          ))}
        </div>
      </section>
    )
  }
  
  if (error) {
    return (
      <section className="mb-12">
        <div className="flex items-center mb-6">
          <div className="flex items-center text-red-600 mr-3">
            {icon}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            <p className="text-gray-600">{subtitle}</p>
          </div>
        </div>
        
        <div className="text-center py-8">
          <p className="text-red-600">Failed to load personalized battles</p>
        </div>
      </section>
    )
  }
  
  if (!battles?.length) {
    return (
      <section className="mb-12">
        <div className="flex items-center mb-6">
          <div className="flex items-center text-red-600 mr-3">
            {icon}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            <p className="text-gray-600">{subtitle}</p>
          </div>
        </div>
        
        <div className="text-center py-8">
          <p className="text-gray-500">No personalized battles available</p>
        </div>
      </section>
    )
  }
  
  return (
    <section className="mb-12">
      <div className="flex items-center mb-6">
        <div className="flex items-center text-red-600 mr-3">
          {icon}
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <p className="text-gray-600">{subtitle}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {battles.map((battle) => (
          <BattleCard key={battle.id} battle={battle} />
        ))}
      </div>
      
      <div className="mt-6 text-center">
        <Link 
          href={`/trending/${type}${category ? `/${category}` : ''}`}
          className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          View All {title}
        </Link>
      </div>
    </section>
  )
}