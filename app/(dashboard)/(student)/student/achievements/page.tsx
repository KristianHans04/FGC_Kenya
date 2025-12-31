import { useState, useEffect } from 'react'
import { 

import type { Metadata } from 'next'
import { generateMetadata } from '@/app/lib/utils/metadata'

export const metadata: Metadata = generateMetadata({
  title: 'My Achievements',
  description: 'View your achievements and progress',
  noIndex: true,
})
ct'
import { 
  Award,
  Trophy,
  Star,
  Target,
  Zap,
  Users,
  BookOpen,
  Code,
  Rocket,
  Clock,
  TrendingUp,
  Lock,
  CheckCircle,
  Filter
} from 'lucide-react'

interface Achievement {
  id: string
  title: string
  description: string
  category: 'Learning' | 'Collaboration' | 'Innovation' | 'Competition' | 'Leadership'
  icon: string
  earned: boolean
  earnedAt?: string
  progress?: {
    current: number
    total: number
  }
  points: number
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

interface AchievementStats {
  totalEarned: number
  totalAvailable: number
  totalPoints: number
  recentUnlock?: string
  categoriesCompleted: number
}

export default function StudentAchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [stats, setStats] = useState<AchievementStats>({
    totalEarned: 0,
    totalAvailable: 0,
    totalPoints: 0,
    categoriesCompleted: 0
  })
  const [loading, setLoading] = useState(true)
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | 'earned' | 'locked'>('all')

  useEffect(() => {
    fetchAchievements()
  }, [])

  const fetchAchievements = async () => {
    try {
      const response = await fetch('/api/student/achievements')
      if (response.ok) {
        const data = await response.json()
        setAchievements(data.data?.achievements || [])
        calculateStats(data.data?.achievements || [])
      }
    } catch (error) {
      console.error('Failed to fetch achievements:', error)
    } finally {
      setLoading(false)
    }
  }

  // Mock data
  const mockAchievements: Achievement[] = [
    {
      id: '1',
      title: 'First Steps',
      description: 'Complete your first training module',
      category: 'Learning',
      icon: '👣',
      earned: true,
      earnedAt: '2024-01-20',
      points: 10,
      rarity: 'common'
    },
    {
      id: '2',
      title: 'Quick Learner',
      description: 'Complete 5 modules within a week',
      category: 'Learning',
      icon: '🎯',
      earned: true,
      earnedAt: '2024-02-15',
      points: 25,
      rarity: 'rare'
    },
    {
      id: '3',
      title: 'Team Player',
      description: 'Collaborate on 10 team projects',
      category: 'Collaboration',
      icon: '🤝',
      earned: true,
      earnedAt: '2024-03-01',
      points: 30,
      rarity: 'rare',
      progress: { current: 10, total: 10 }
    },
    {
      id: '4',
      title: 'Innovation Master',
      description: 'Submit 5 innovative solutions',
      category: 'Innovation',
      icon: '💡',
      earned: false,
      points: 50,
      rarity: 'epic',
      progress: { current: 3, total: 5 }
    },
    {
      id: '5',
      title: 'Code Warrior',
      description: 'Write 1000 lines of working code',
      category: 'Innovation',
      icon: '⚔️',
      earned: false,
      points: 40,
      rarity: 'epic',
      progress: { current: 650, total: 1000 }
    },
    {
      id: '6',
      title: 'Competition Ready',
      description: 'Complete all training modules',
      category: 'Competition',
      icon: '🏆',
      earned: false,
      points: 100,
      rarity: 'legendary',
      progress: { current: 8, total: 12 }
    },
    {
      id: '7',
      title: 'Leader of Tomorrow',
      description: 'Lead your team to 3 victories',
      category: 'Leadership',
      icon: '👑',
      earned: false,
      points: 75,
      rarity: 'legendary',
      progress: { current: 1, total: 3 }
    },
    {
      id: '8',
      title: 'Knowledge Seeker',
      description: 'Read 20 learning resources',
      category: 'Learning',
      icon: '📚',
      earned: true,
      earnedAt: '2024-03-10',
      points: 20,
      rarity: 'common'
    }
  ]

  const calculateStats = (achievementsList: Achievement[]) => {
    const earned = achievementsList.filter(a => a.earned)
    const totalPoints = earned.reduce((sum, a) => sum + a.points, 0)
    
    const categories = ['Learning', 'Collaboration', 'Innovation', 'Competition', 'Leadership']
    const categoriesCompleted = categories.filter(cat => {
      const catAchievements = achievementsList.filter(a => a.category === cat)
      return catAchievements.length > 0 && catAchievements.every(a => a.earned)
    }).length

    setStats({
      totalEarned: earned.length,
      totalAvailable: achievementsList.length,
      totalPoints,
      recentUnlock: earned.sort((a, b) => 
        new Date(b.earnedAt || '').getTime() - new Date(a.earnedAt || '').getTime()
      )[0]?.title,
      categoriesCompleted
    })
  }

  const displayAchievements = achievements.length > 0 ? achievements : mockAchievements
  
  useEffect(() => {
    if (displayAchievements.length > 0) {
      calculateStats(displayAchievements)
    }
  }, [displayAchievements])

  const filteredAchievements = displayAchievements.filter(achievement => {
    const matchesCategory = filterCategory === 'all' || achievement.category === filterCategory
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'earned' && achievement.earned) ||
      (filterStatus === 'locked' && !achievement.earned)
    return matchesCategory && matchesStatus
  })

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Learning': return <BookOpen className="h-4 w-4" />
      case 'Collaboration': return <Users className="h-4 w-4" />
      case 'Innovation': return <Zap className="h-4 w-4" />
      case 'Competition': return <Trophy className="h-4 w-4" />
      case 'Leadership': return <Star className="h-4 w-4" />
      default: return <Award className="h-4 w-4" />
    }
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-800 border-gray-300'
      case 'rare': return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'epic': return 'bg-purple-100 text-purple-800 border-purple-300'
      case 'legendary': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Achievements</h1>
        <p className="text-muted-foreground">
          Track your progress and unlock rewards
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center justify-between mb-2">
            <Trophy className="h-5 w-5 text-yellow-600" />
            <span className="text-2xl font-bold">{stats.totalEarned}</span>
          </div>
          <p className="text-xs text-muted-foreground">Unlocked</p>
          <div className="mt-2 w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${(stats.totalEarned / stats.totalAvailable) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center justify-between mb-2">
            <Star className="h-5 w-5 text-blue-600" />
            <span className="text-2xl font-bold">{stats.totalPoints}</span>
          </div>
          <p className="text-xs text-muted-foreground">Total Points</p>
        </div>

        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center justify-between mb-2">
            <Target className="h-5 w-5 text-green-600" />
            <span className="text-2xl font-bold">{stats.totalAvailable}</span>
          </div>
          <p className="text-xs text-muted-foreground">Available</p>
        </div>

        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            <span className="text-2xl font-bold">
              {Math.round((stats.totalEarned / stats.totalAvailable) * 100)}%
            </span>
          </div>
          <p className="text-xs text-muted-foreground">Progress</p>
        </div>

        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center justify-between mb-2">
            <Clock className="h-5 w-5 text-orange-600" />
          </div>
          <p className="text-xs text-muted-foreground">Recent</p>
          <p className="text-xs font-medium truncate">{stats.recentUnlock || 'None'}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-lg border p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="all">All Categories</option>
            <option value="Learning">Learning</option>
            <option value="Collaboration">Collaboration</option>
            <option value="Innovation">Innovation</option>
            <option value="Competition">Competition</option>
            <option value="Leadership">Leadership</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="all">All Status</option>
            <option value="earned">Unlocked</option>
            <option value="locked">Locked</option>
          </select>

          <div className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
            <Filter className="h-4 w-4" />
            <span>Showing {filteredAchievements.length} achievements</span>
          </div>
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAchievements.map(achievement => (
          <div
            key={achievement.id}
            className={`bg-card rounded-lg border-2 p-6 transition-all ${
              achievement.earned 
                ? 'hover:shadow-md' 
                : 'opacity-60 border-dashed'
            } ${getRarityColor(achievement.rarity)}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="text-3xl">{achievement.icon}</div>
              {achievement.earned ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <Lock className="h-5 w-5 text-gray-400" />
              )}
            </div>

            <h3 className={`font-semibold mb-1 ${!achievement.earned && 'text-muted-foreground'}`}>
              {achievement.title}
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              {achievement.description}
            </p>

            <div className="flex items-center gap-2 mb-3">
              {getCategoryIcon(achievement.category)}
              <span className="text-xs">{achievement.category}</span>
              <span className="ml-auto text-xs font-medium">
                +{achievement.points} pts
              </span>
            </div>

            {achievement.progress && !achievement.earned && (
              <div className="mb-3">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span>Progress</span>
                  <span>{achievement.progress.current}/{achievement.progress.total}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ 
                      width: `${(achievement.progress.current / achievement.progress.total) * 100}%` 
                    }}
                  />
                </div>
              </div>
            )}

            {achievement.earned && achievement.earnedAt && (
              <p className="text-xs text-muted-foreground">
                Unlocked: {new Date(achievement.earnedAt).toLocaleDateString()}
              </p>
            )}

            <div className="mt-3 pt-3 border-t">
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${getRarityColor(achievement.rarity)}`}>
                {achievement?.rarity ? achievement.rarity.charAt(0).toUpperCase() + achievement.rarity.slice(1) : ''}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}