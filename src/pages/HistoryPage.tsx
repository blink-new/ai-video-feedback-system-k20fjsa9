import { useState, useEffect } from 'react'
import { Search, Filter, Video, User, BookOpen, Calendar, Award, Eye } from 'lucide-react'
import { blink } from '../blink/client'

interface HistoryPageProps {
  onVideoSelect: (videoId: string) => void
}

interface VideoRecord {
  id: string
  title: string
  videoType: 'teacher' | 'student'
  studentName?: string
  danceStyle: string
  overallScore: number
  status: string
  createdAt: string
}

export function HistoryPage({ onVideoSelect }: HistoryPageProps) {
  const [videos, setVideos] = useState<VideoRecord[]>([])
  const [filteredVideos, setFilteredVideos] = useState<VideoRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'teacher' | 'student'>('all')
  const [sortBy, setSortBy] = useState<'date' | 'score' | 'name'>('date')

  useEffect(() => {
    loadVideoHistory()
  }, [])

  useEffect(() => {
    filterAndSortVideos()
  }, [videos, searchTerm, filterType, sortBy])

  const loadVideoHistory = async () => {
    try {
      const user = await blink.auth.me()
      const videoData = await blink.db.danceVideos.list({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' }
      })

      setVideos(videoData as VideoRecord[])
    } catch (error) {
      console.error('Failed to load video history:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortVideos = () => {
    let filtered = videos.filter(video => {
      const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (video.studentName && video.studentName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                           video.danceStyle.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesFilter = filterType === 'all' || video.videoType === filterType
      
      return matchesSearch && matchesFilter
    })

    // Sort videos
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'score':
          return (b.overallScore || 0) - (a.overallScore || 0)
        case 'name':
          return a.title.localeCompare(b.title)
        case 'date':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })

    setFilteredVideos(filtered)
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100'
    if (score >= 80) return 'text-blue-600 bg-blue-100'
    if (score >= 70) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-12 bg-muted rounded"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Video History</h1>
        <p className="text-muted-foreground">
          View and manage your analyzed dance videos
        </p>
      </div>

      {/* Search and Filters */}
      <div className="feedback-card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search videos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as 'all' | 'teacher' | 'student')}
            className="px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">All Videos</option>
            <option value="teacher">Teacher Demos</option>
            <option value="student">Student Videos</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'score' | 'name')}
            className="px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="date">Sort by Date</option>
            <option value="score">Sort by Score</option>
            <option value="name">Sort by Name</option>
          </select>

          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Filter className="w-4 h-4" />
            <span>{filteredVideos.length} videos</span>
          </div>
        </div>
      </div>

      {/* Video Grid */}
      {filteredVideos.length === 0 ? (
        <div className="feedback-card text-center py-12">
          <Video className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {videos.length === 0 ? 'No videos yet' : 'No videos match your search'}
          </h3>
          <p className="text-muted-foreground">
            {videos.length === 0 
              ? 'Upload your first dance video to get started'
              : 'Try adjusting your search or filters'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((video) => (
            <div key={video.id} className="feedback-card hover:shadow-lg transition-shadow cursor-pointer group">
              <div className="space-y-4">
                {/* Video Thumbnail */}
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center relative overflow-hidden">
                  <Video className="w-12 h-12 text-muted-foreground" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <button
                      onClick={() => onVideoSelect(video.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity bg-primary text-primary-foreground p-3 rounded-full"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Video Info */}
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-foreground truncate">{video.title}</h3>
                    <div className="flex items-center space-x-2 mt-1 text-sm text-muted-foreground">
                      {video.videoType === 'teacher' ? (
                        <BookOpen className="w-4 h-4" />
                      ) : (
                        <User className="w-4 h-4" />
                      )}
                      <span>
                        {video.videoType === 'teacher' ? 'Teacher Demo' : video.studentName}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                    </div>
                    
                    {video.status === 'completed' && (
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(video.overallScore || 0)}`}>
                        {video.overallScore || 0}%
                      </div>
                    )}
                  </div>

                  {video.danceStyle && (
                    <div className="text-sm text-muted-foreground">
                      Style: {video.danceStyle}
                    </div>
                  )}

                  <button
                    onClick={() => onVideoSelect(video.id)}
                    className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                  >
                    View Analysis
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats Summary */}
      {videos.length > 0 && (
        <div className="feedback-card">
          <h3 className="text-lg font-semibold text-foreground mb-4">Summary Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{videos.length}</div>
              <div className="text-sm text-muted-foreground">Total Videos</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {videos.filter(v => v.videoType === 'teacher').length}
              </div>
              <div className="text-sm text-muted-foreground">Teacher Demos</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {videos.filter(v => v.videoType === 'student').length}
              </div>
              <div className="text-sm text-muted-foreground">Student Videos</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">
                {videos.length > 0 
                  ? Math.round(videos.reduce((sum, v) => sum + (v.overallScore || 0), 0) / videos.length)
                  : 0
                }%
              </div>
              <div className="text-sm text-muted-foreground">Avg Score</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}