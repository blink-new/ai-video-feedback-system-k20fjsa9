import { useState, useEffect } from 'react'
import { Upload, BarChart3, Clock, TrendingUp, Users, Award } from 'lucide-react'
import { blink } from '../blink/client'
import type { PageType } from '../App'

interface DashboardProps {
  onNavigate: (page: PageType) => void
}

export function DashboardPage({ onNavigate }: DashboardProps) {
  const [stats, setStats] = useState({
    totalVideos: 0,
    avgScore: 0,
    recentAnalyses: 0,
    studentsHelped: 0
  })
  const [recentVideos, setRecentVideos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const user = await blink.auth.me()
      
      // Load recent videos from localStorage as fallback
      const storedVideos = localStorage.getItem(`dance_videos_${user.id}`)
      const videos = storedVideos ? JSON.parse(storedVideos) : []

      setRecentVideos(videos)
      
      // Calculate stats
      const totalVideos = videos.length
      const avgScore = videos.length > 0 
        ? videos.reduce((sum: number, video: any) => sum + (video.overallScore || 0), 0) / videos.length
        : 0
      
      setStats({
        totalVideos,
        avgScore: Math.round(avgScore),
        recentAnalyses: videos.filter((v: any) => {
          const createdAt = new Date(v.createdAt)
          const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          return createdAt > weekAgo
        }).length,
        studentsHelped: new Set(videos.map((v: any) => v.studentName).filter(Boolean)).size
      })
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
      // Set empty state on error
      setStats({
        totalVideos: 0,
        avgScore: 0,
        recentAnalyses: 0,
        studentsHelped: 0
      })
      setRecentVideos([])
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Total Videos Analyzed',
      value: stats.totalVideos,
      icon: BarChart3,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Average Score',
      value: `${stats.avgScore}%`,
      icon: Award,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'This Week',
      value: stats.recentAnalyses,
      icon: Clock,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Students Helped',
      value: stats.studentsHelped,
      icon: Users,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ]

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your dance analysis dashboard. Track progress and analyze performance.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="feedback-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="feedback-card">
          <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button
              onClick={() => onNavigate('upload')}
              className="w-full flex items-center space-x-3 p-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Upload className="w-5 h-5" />
              <span className="font-medium">Upload New Dance Video</span>
            </button>
            
            <button
              onClick={() => onNavigate('history')}
              className="w-full flex items-center space-x-3 p-4 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors"
            >
              <BarChart3 className="w-5 h-5" />
              <span className="font-medium">View Analysis History</span>
            </button>
          </div>
        </div>

        {/* Recent Videos */}
        <div className="feedback-card">
          <h3 className="text-lg font-semibold text-foreground mb-4">Recent Analyses</h3>
          {recentVideos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No videos analyzed yet</p>
              <p className="text-sm">Upload your first dance video to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentVideos.slice(0, 3).map((video: any) => (
                <div key={video.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">{video.title || 'Untitled Video'}</p>
                    <p className="text-sm text-muted-foreground">
                      {video.studentName ? `Student: ${video.studentName}` : 'Teacher Demo'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">{video.overallScore || 0}%</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(video.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Dance Analysis Features */}
      <div className="feedback-card">
        <h3 className="text-lg font-semibold text-foreground mb-4">AI Analysis Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-muted rounded-lg">
            <TrendingUp className="w-8 h-8 text-primary mx-auto mb-2" />
            <h4 className="font-medium text-foreground">Technique Analysis</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Posture, alignment, and form assessment
            </p>
          </div>
          
          <div className="text-center p-4 bg-muted rounded-lg">
            <Clock className="w-8 h-8 text-accent mx-auto mb-2" />
            <h4 className="font-medium text-foreground">Rhythm & Timing</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Beat accuracy and musical synchronization
            </p>
          </div>
          
          <div className="text-center p-4 bg-muted rounded-lg">
            <Award className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <h4 className="font-medium text-foreground">Movement Quality</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Fluidity, expression, and energy levels
            </p>
          </div>
          
          <div className="text-center p-4 bg-muted rounded-lg">
            <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <h4 className="font-medium text-foreground">Progress Tracking</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Student improvement over time
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}