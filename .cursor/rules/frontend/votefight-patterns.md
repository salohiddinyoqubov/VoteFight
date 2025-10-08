---
description: VoteFight-Specific Frontend Patterns and Components
globs: ["frontend/src/components/**/*.tsx", "frontend/src/features/**/*.tsx", "frontend/src/app/**/*.tsx"]
alwaysApply: true
---

# VoteFight-Specific Frontend Patterns

## VoteFight Component Architecture

### 1. Battle System Components

#### BattleCard Component
```tsx
// components/battles/BattleCard.tsx
interface BattleCardProps {
  battle: Battle
  onVote?: (battleId: string, elementId: string) => void
  onLike?: (battleId: string) => void
  onShare?: (battleId: string) => void
  variant?: 'default' | 'compact' | 'detailed'
  showVoting?: boolean
}

export function BattleCard({ 
  battle, 
  onVote, 
  onLike, 
  onShare, 
  variant = 'default',
  showVoting = true 
}: BattleCardProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [isVoting, setIsVoting] = useState(false)
  
  const handleVote = async (elementId: string) => {
    if (!onVote || isVoting) return
    
    setIsVoting(true)
    try {
      await onVote(battle.id, elementId)
    } finally {
      setIsVoting(false)
    }
  }
  
  return (
    <div className={cn(
      "bg-white rounded-lg shadow-md overflow-hidden",
      {
        "p-4": variant === 'compact',
        "p-6": variant === 'default',
        "p-8": variant === 'detailed'
      }
    )}>
      {/* Battle header */}
      <div className="flex items-center justify-between mb-4">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          {battle.category}
        </span>
        <span className="text-sm text-gray-500">
          {formatDistanceToNow(new Date(battle.created_at))} ago
        </span>
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
        {battle.title}
      </h3>
      
      {variant !== 'compact' && (
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {battle.description}
        </p>
      )}
      
      {/* Battle elements */}
      <div className="space-y-3 mb-4">
        {battle.elements.map((element, index) => (
          <div key={element.id} className="relative">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-900">
                {element.name}
              </span>
              <span className="text-sm text-gray-500">
                {element.percentage}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={cn(
                  "h-2 rounded-full transition-all duration-500",
                  {
                    "bg-red-500": index === 0,
                    "bg-blue-500": index === 1,
                    "bg-green-500": index === 2,
                    "bg-yellow-500": index === 3,
                  }
                )}
                style={{ width: `${element.percentage}%` }}
              />
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {element.vote_count} votes
            </div>
          </div>
        ))}
      </div>
      
      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => onLike?.(battle.id)}
            className="flex items-center text-sm text-gray-500 hover:text-red-500 transition-colors"
          >
            <HeartIcon className="h-4 w-4 mr-1" />
            Like
          </button>
          
          <button
            onClick={() => onShare?.(battle.id)}
            className="flex items-center text-sm text-gray-500 hover:text-green-500 transition-colors"
          >
            <ShareIcon className="h-4 w-4 mr-1" />
            Share
          </button>
        </div>
        
        {showVoting && (
          <Link
            href={`/battles/${battle.id}`}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Vote Now
          </Link>
        )}
      </div>
    </div>
  )
}
```

#### BattleDetail Component
```tsx
// components/battles/BattleDetail.tsx
export function BattleDetail({ battleId }: { battleId: string }) {
  const { data: battle, isLoading, error } = useBattle(battleId)
  const voteMutation = useVoteBattle()
  const { user } = useAuth()
  
  if (isLoading) return <BattleDetailSkeleton />
  if (error) return <BattleError error={error} />
  if (!battle) return <BattleNotFound />
  
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Battle header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            {battle.category}
          </span>
          <span className="text-sm text-gray-500">
            {formatDistanceToNow(new Date(battle.created_at))} ago
          </span>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {battle.title}
        </h1>
        
        <p className="text-gray-600 mb-6">
          {battle.description}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-500">
            <span>by @{battle.creator.username}</span>
            <span className="mx-2">•</span>
            <span>{battle.total_votes} votes</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="flex items-center text-sm text-gray-500 hover:text-red-500 transition-colors">
              <HeartIcon className="h-4 w-4 mr-1" />
              Like
            </button>
            
            <button className="flex items-center text-sm text-gray-500 hover:text-blue-500 transition-colors">
              <ChatBubbleLeftIcon className="h-4 w-4 mr-1" />
              Comment
            </button>
            
            <button className="flex items-center text-sm text-gray-500 hover:text-green-500 transition-colors">
              <ShareIcon className="h-4 w-4 mr-1" />
              Share
            </button>
          </div>
        </div>
      </div>
      
      {/* Voting section */}
      {battle.is_active && !battle.user_voted && (
        <VotingSection 
          battle={battle} 
          onVote={(elementId) => voteMutation.mutate({ battle_id: battle.id, element_id: elementId })}
          isVoting={voteMutation.isPending}
        />
      )}
      
      {/* Results section */}
      <ResultsSection battle={battle} />
    </div>
  )
}
```

### 2. Trending System Components

#### TrendingSection Component
```tsx
// components/sections/TrendingSection.tsx
interface TrendingSectionProps {
  title: string
  subtitle: string
  icon: ReactNode
  type: 'global' | 'personalized' | 'category' | 'quick-picks'
  category?: string
}

export function TrendingSection({ 
  title, 
  subtitle, 
  icon, 
  type, 
  category 
}: TrendingSectionProps) {
  const { data: battles, isLoading, error } = useTrendingBattles(type, category)
  
  if (isLoading) return <TrendingSectionSkeleton />
  if (error) return <TrendingSectionError error={error} />
  if (!battles?.length) return <TrendingSectionEmpty />
  
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
```

### 3. User Profile System

#### UserProfile Component
```tsx
// components/users/UserProfile.tsx
export function UserProfile({ username }: { username: string }) {
  const { data: user, isLoading } = useUserProfile(username)
  const { data: battles } = useUserBattles(username)
  const { user: currentUser } = useAuth()
  const [activeTab, setActiveTab] = useState<'battles' | 'following' | 'followers'>('battles')
  
  if (isLoading) return <UserProfileSkeleton />
  if (!user) return <UserNotFound />
  
  const isOwnProfile = currentUser?.username === username
  
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-start space-x-6">
          <div className="flex-shrink-0">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.username}
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <span className="text-2xl font-bold text-gray-500">
                  {user.username.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">@{user.username}</h1>
                <p className="text-gray-600">Member since {format(new Date(user.created_at), 'MMMM yyyy')}</p>
              </div>
              
              {!isOwnProfile && (
                <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                  Follow
                </button>
              )}
            </div>
            
            {user.bio && (
              <p className="text-gray-700 mb-4">{user.bio}</p>
            )}
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{user.battles_count}</div>
                <div className="text-sm text-gray-500">Battles</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{user.followers_count}</div>
                <div className="text-sm text-gray-500">Followers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{user.following_count}</div>
                <div className="text-sm text-gray-500">Following</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{user.total_votes_received}</div>
                <div className="text-sm text-gray-500">Votes Received</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Profile tabs */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'battles', label: 'Battles', count: user.battles_count },
              { id: 'following', label: 'Following', count: user.following_count },
              { id: 'followers', label: 'Followers', count: user.followers_count }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "py-4 px-1 border-b-2 font-medium text-sm",
                  activeTab === tab.id
                    ? "border-red-500 text-red-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </nav>
        </div>
        
        <div className="p-6">
          {activeTab === 'battles' && (
            <UserBattlesList battles={battles} />
          )}
          {activeTab === 'following' && (
            <UserFollowingList username={username} />
          )}
          {activeTab === 'followers' && (
            <UserFollowersList username={username} />
          )}
        </div>
      </div>
    </div>
  )
}
```

### 4. Media Components

#### RichMediaElement Component
```tsx
// components/media/RichMediaElement.tsx
interface RichMediaElementProps {
  mediaType: 'text' | 'image' | 'audio' | 'video' | 'document'
  mediaUrl?: string
  name: string
  className?: string
}

export function RichMediaElement({ 
  mediaType, 
  mediaUrl, 
  name, 
  className = '' 
}: RichMediaElementProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioRef = useRef<HTMLAudioElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  
  const togglePlay = () => {
    if (mediaType === 'audio' && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    } else if (mediaType === 'video' && videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }
  
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }
  
  const renderMedia = () => {
    switch (mediaType) {
      case 'text':
        return (
          <div className="p-6 text-center">
            <h3 className="text-xl font-semibold text-gray-900">{name}</h3>
          </div>
        )
        
      case 'image':
        return (
          <div className="relative">
            {mediaUrl ? (
              <img
                src={mediaUrl}
                alt={name}
                className="w-full h-64 object-cover rounded-lg"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            ) : (
              <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-500">No image available</span>
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-3 rounded-b-lg">
              <h3 className="font-semibold">{name}</h3>
            </div>
          </div>
        )
        
      case 'audio':
        return (
          <div className="p-4">
            <div className="flex items-center space-x-4 mb-4">
              <button
                onClick={togglePlay}
                className="w-12 h-12 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center transition-colors"
              >
                {isPlaying ? (
                  <PauseIcon className="h-6 w-6" />
                ) : (
                  <PlayIcon className="h-6 w-6 ml-1" />
                )}
              </button>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{name}</h3>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <VolumeUpIcon className="h-4 w-4" />
                  <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
                </div>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-red-600 h-2 rounded-full transition-all duration-300"
                style={{ width: duration ? `${(currentTime / duration) * 100}%` : '0%' }}
              />
            </div>
            <audio
              ref={audioRef}
              src={mediaUrl}
              onEnded={() => setIsPlaying(false)}
              preload="metadata"
            />
          </div>
        )
        
      case 'video':
        return (
          <div className="relative">
            <video
              ref={videoRef}
              src={mediaUrl}
              className="w-full h-64 object-cover rounded-lg"
              onEnded={() => setIsPlaying(false)}
              preload="metadata"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                onClick={togglePlay}
                className="w-16 h-16 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full flex items-center justify-center transition-all"
              >
                {isPlaying ? (
                  <PauseIcon className="h-8 w-8" />
                ) : (
                  <PlayIcon className="h-8 w-8 ml-1" />
                )}
              </button>
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-3 rounded-b-lg">
              <h3 className="font-semibold">{name}</h3>
              <div className="text-sm text-gray-300">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>
          </div>
        )
        
      case 'document':
        return (
          <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📄</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{name}</h3>
              <p className="text-sm text-gray-500 mb-4">Document Preview</p>
              {mediaUrl ? (
                <a
                  href={mediaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                >
                  View Document
                </a>
              ) : (
                <span className="text-gray-400">No document available</span>
              )}
            </div>
          </div>
        )
        
      default:
        return (
          <div className="p-6 text-center">
            <h3 className="text-xl font-semibold text-gray-900">{name}</h3>
            <p className="text-gray-500">Unsupported media type</p>
          </div>
        )
    }
  }
  
  return (
    <div className={cn("bg-white rounded-lg shadow-md overflow-hidden", className)}>
      {renderMedia()}
    </div>
  )
}
```

### 5. Form Components

#### CreateBattleModal Component
```tsx
// components/modals/CreateBattleModal.tsx
export function CreateBattleModal({ isOpen, onClose }: CreateBattleModalProps) {
  const form = useForm<CreateBattleForm>({
    resolver: zodResolver(CreateBattleSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      elements: [
        { name: '', media_type: 'text' },
        { name: '', media_type: 'text' }
      ]
    }
  })
  
  const createBattleMutation = useCreateBattle()
  const { setCreateBattleModalOpen } = useUIStore()
  
  const onSubmit = (data: CreateBattleForm) => {
    createBattleMutation.mutate(data, {
      onSuccess: () => {
        form.reset()
        setCreateBattleModalOpen(false)
      }
    })
  }
  
  const addElement = () => {
    const currentElements = form.getValues('elements')
    if (currentElements.length < 10) {
      form.setValue('elements', [
        ...currentElements,
        { name: '', media_type: 'text' }
      ])
    }
  }
  
  const removeElement = (index: number) => {
    const currentElements = form.getValues('elements')
    if (currentElements.length > 2) {
      form.setValue('elements', currentElements.filter((_, i) => i !== index))
    }
  }
  
  return (
    <Transition appear show={isOpen} as="div">
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as="div"
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>
        
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as="div"
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-6">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    Create New Battle
                  </Dialog.Title>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-600"
                    onClick={onClose}
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
                
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Form fields */}
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                      Battle Title (Optional)
                    </label>
                    <input
                      {...form.register('title')}
                      type="text"
                      id="title"
                      placeholder="Auto-generated if empty (e.g., 'Coca-Cola vs Pepsi, vote')"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                    />
                    {form.formState.errors.title && (
                      <p className="mt-1 text-sm text-red-600">{form.formState.errors.title.message}</p>
                    )}
                  </div>
                  
                  {/* Elements */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <label className="block text-sm font-medium text-gray-700">
                        Battle Elements ({form.watch('elements').length}/10)
                      </label>
                      {form.watch('elements').length < 10 && (
                        <button
                          type="button"
                          onClick={addElement}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          <PlusIcon className="h-4 w-4 mr-1" />
                          Add Element
                        </button>
                      )}
                    </div>
                    
                    <div className="space-y-4">
                      {form.watch('elements').map((element, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                          <span className="text-sm font-medium text-gray-500 w-8">
                            {index + 1}.
                          </span>
                          <input
                            {...form.register(`elements.${index}.name`)}
                            type="text"
                            placeholder={`Element ${index + 1} name`}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                          />
                          <select
                            {...form.register(`elements.${index}.media_type`)}
                            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                          >
                            <option value="text">Text</option>
                            <option value="image">Image</option>
                            <option value="audio">Audio</option>
                            <option value="video">Video</option>
                            <option value="document">Document</option>
                          </select>
                          {form.watch('elements').length > 2 && (
                            <button
                              type="button"
                              onClick={() => removeElement(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    {form.formState.errors.elements && (
                      <p className="mt-1 text-sm text-red-600">{form.formState.errors.elements.message}</p>
                    )}
                  </div>
                  
                  {/* Submit button */}
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={createBattleMutation.isPending}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {createBattleMutation.isPending ? 'Creating...' : 'Create Battle'}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
```

### 6. VoteFight-Specific Hooks

#### useBattleVoting Hook
```tsx
// hooks/useBattleVoting.ts
export function useBattleVoting() {
  const queryClient = useQueryClient()
  const { addVote, hasVoted } = useBattleStore()
  
  return useMutation({
    mutationFn: async ({ battleId, elementId }: { battleId: string; elementId: string }) => {
      const response = await apiClient.post(`/battles/${battleId}/vote/`, {
        element_id: elementId
      })
      return response.data
    },
    onMutate: async ({ battleId, elementId }) => {
      // Check if already voted
      if (hasVoted(battleId)) {
        throw new Error('You have already voted in this battle')
      }
      
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['battles', battleId] })
      
      // Snapshot previous value
      const previousBattle = queryClient.getQueryData(['battles', battleId])
      
      // Optimistically update
      queryClient.setQueryData(['battles', battleId], (old: Battle) => {
        if (!old) return old
        
        return {
          ...old,
          elements: old.elements.map(element => 
            element.id === elementId
              ? { ...element, vote_count: element.vote_count + 1 }
              : element
          ),
          total_votes: old.total_votes + 1,
          user_voted: true,
          user_vote_element: elementId
        }
      })
      
      return { previousBattle }
    },
    onError: (err, { battleId }, context) => {
      // Rollback on error
      if (context?.previousBattle) {
        queryClient.setQueryData(['battles', battleId], context.previousBattle)
      }
    },
    onSuccess: (_, { battleId, elementId }) => {
      // Add to recent votes
      addVote(battleId, elementId)
    },
    onSettled: (_, __, { battleId }) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['battles', battleId] })
    },
  })
}
```

### 7. VoteFight Constants

#### Battle Categories
```ts
// constants/battleCategories.ts
export const BATTLE_CATEGORIES = {
  TECHNOLOGY: 'technology',
  FOOD: 'food',
  ENTERTAINMENT: 'entertainment',
  SPORTS: 'sports',
  LIFESTYLE: 'lifestyle',
  OTHER: 'other'
} as const

export const CATEGORY_LABELS = {
  [BATTLE_CATEGORIES.TECHNOLOGY]: 'Technology',
  [BATTLE_CATEGORIES.FOOD]: 'Food & Drinks',
  [BATTLE_CATEGORIES.ENTERTAINMENT]: 'Entertainment',
  [BATTLE_CATEGORIES.SPORTS]: 'Sports',
  [BATTLE_CATEGORIES.LIFESTYLE]: 'Lifestyle',
  [BATTLE_CATEGORIES.OTHER]: 'Other'
} as const

export const CATEGORY_ICONS = {
  [BATTLE_CATEGORIES.TECHNOLOGY]: '🎯',
  [BATTLE_CATEGORIES.FOOD]: '🍕',
  [BATTLE_CATEGORIES.ENTERTAINMENT]: '🎬',
  [BATTLE_CATEGORIES.SPORTS]: '⚽',
  [BATTLE_CATEGORIES.LIFESTYLE]: '🏠',
  [BATTLE_CATEGORIES.OTHER]: '📝'
} as const
```

#### Media Types
```ts
// constants/mediaTypes.ts
export const MEDIA_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  AUDIO: 'audio',
  VIDEO: 'video',
  DOCUMENT: 'document'
} as const

export const MEDIA_TYPE_LABELS = {
  [MEDIA_TYPES.TEXT]: 'Text',
  [MEDIA_TYPES.IMAGE]: 'Image',
  [MEDIA_TYPES.AUDIO]: 'Audio',
  [MEDIA_TYPES.VIDEO]: 'Video',
  [MEDIA_TYPES.DOCUMENT]: 'Document'
} as const

export const MEDIA_TYPE_ICONS = {
  [MEDIA_TYPES.TEXT]: '📝',
  [MEDIA_TYPES.IMAGE]: '🖼️',
  [MEDIA_TYPES.AUDIO]: '🎵',
  [MEDIA_TYPES.VIDEO]: '🎥',
  [MEDIA_TYPES.DOCUMENT]: '📄'
} as const
```

### 8. VoteFight Utilities

#### Formatting Utilities
```ts
// utils/formatting.ts
import { format, formatDistanceToNow } from 'date-fns'

export function formatVoteCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`
  }
  return count.toString()
}

export function formatBattleTitle(title: string, elements: string[]): string {
  if (title) return title
  if (elements.length >= 2) {
    return `${elements[0]} vs ${elements[1]}${elements.length > 2 ? ` +${elements.length - 2} more` : ''}, vote`
  }
  return 'Battle'
}

export function formatTrendingScore(score: number): string {
  return score.toFixed(1)
}

export function formatUserStats(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`
  }
  return count.toString()
}
```

---

**Remember**: VoteFight components should be focused on the voting experience, support rich media, and provide excellent user interaction patterns for battle creation and voting.
