import { useState, useEffect } from 'react'
import { Play, Download, ArrowLeft, User, BookOpen, Clock, Award } from 'lucide-react'
import { blink } from '../blink/client'

interface AnalysisPageProps {
  videoId: string
}

interface VideoData {
  id: string
  title: string
  videoUrl: string
  videoType: 'teacher' | 'student'
  studentName?: string
  danceStyle: string
  notes: string
  status: string
  analysisText: string
  techniqueScore: number
  rhythmScore: number
  expressionScore: number
  overallScore: number
  feedback: string
  createdAt: string
  analyzedAt: string
}

export function AnalysisPage({ videoId }: AnalysisPageProps) {
  const [video, setVideo] = useState<VideoData | null>(null)
  const [feedback, setFeedback] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadVideoAnalysis()
  }, [videoId]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadVideoAnalysis = async () => {
    try {
      const videoData = await blink.db.danceVideos.list({
        where: { id: videoId },
        limit: 1
      })

      if (videoData.length > 0) {
        const video = videoData[0] as VideoData
        setVideo(video)
        
        if (video.feedback) {
          try {
            setFeedback(JSON.parse(video.feedback))
          } catch (e) {
            console.error('Failed to parse feedback:', e)
          }
        }
      }
    } catch (error) {
      console.error('Failed to load video analysis:', error)
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 80) return 'text-blue-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBg = (score: number) => {
    if (score >= 90) return 'bg-green-100'
    if (score >= 80) return 'bg-blue-100'
    if (score >= 70) return 'bg-yellow-100'
    return 'bg-red-100'
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-64 bg-muted rounded-lg"></div>
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!video) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Video not found</p>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => window.history.back()}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground">{video.title}</h1>
          <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              {video.videoType === 'teacher' ? (
                <BookOpen className="w-4 h-4" />
              ) : (
                <User className="w-4 h-4" />
              )}
              <span>
                {video.videoType === 'teacher' ? 'Teacher Demo' : `Student: ${video.studentName}`}
              </span>
            </div>
            {video.danceStyle && (
              <span>Style: {video.danceStyle}</span>
            )}
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{new Date(video.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Video Player and Overall Score */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="feedback-card">
            <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
              <video
                src={video.videoUrl}
                controls
                className="w-full h-full object-contain"
                poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23000'/%3E%3Ctext x='200' y='150' text-anchor='middle' fill='%23fff' font-size='20'%3EClick to play%3C/text%3E%3C/svg%3E"
              />
              <div className="absolute top-4 right-4">
                <button className="bg-black/50 text-white p-2 rounded-lg hover:bg-black/70 transition-colors">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Overall Score */}
          <div className="feedback-card text-center">
            <h3 className="text-lg font-semibold text-foreground mb-4">Overall Score</h3>
            <div className={`score-circle ${getScoreBg(video.overallScore)} mx-auto mb-4`}>
              <span className={`text-2xl font-bold ${getScoreColor(video.overallScore)}`}>
                {video.overallScore}%
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {video.overallScore >= 90 ? 'Excellent performance!' :
               video.overallScore >= 80 ? 'Great work!' :
               video.overallScore >= 70 ? 'Good effort!' :
               'Keep practicing!'}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="feedback-card">
            <h3 className="text-lg font-semibold text-foreground mb-4">Actions</h3>
            <div className="space-y-3">
              <button className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
                Generate Report
              </button>
              <button className="w-full bg-muted text-foreground px-4 py-2 rounded-lg hover:bg-muted/80 transition-colors">
                Share Feedback
              </button>
              <button className="w-full bg-muted text-foreground px-4 py-2 rounded-lg hover:bg-muted/80 transition-colors">
                Compare Progress
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Score Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="feedback-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Technique</h3>
            <span className={`text-2xl font-bold ${getScoreColor(video.techniqueScore)}`}>
              {video.techniqueScore}%
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 mb-3">
            <div
              className={`h-2 rounded-full ${
                video.techniqueScore >= 90 ? 'bg-green-500' :
                video.techniqueScore >= 80 ? 'bg-blue-500' :
                video.techniqueScore >= 70 ? 'bg-yellow-500' :
                'bg-red-500'
              }`}
              style={{ width: `${video.techniqueScore}%` }}
            ></div>
          </div>
          <p className="text-sm text-muted-foreground">
            Posture, alignment, and form assessment
          </p>
        </div>

        <div className="feedback-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Rhythm</h3>
            <span className={`text-2xl font-bold ${getScoreColor(video.rhythmScore)}`}>
              {video.rhythmScore}%
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 mb-3">
            <div
              className={`h-2 rounded-full ${
                video.rhythmScore >= 90 ? 'bg-green-500' :
                video.rhythmScore >= 80 ? 'bg-blue-500' :
                video.rhythmScore >= 70 ? 'bg-yellow-500' :
                'bg-red-500'
              }`}
              style={{ width: `${video.rhythmScore}%` }}
            ></div>
          </div>
          <p className="text-sm text-muted-foreground">
            Beat accuracy and musical synchronization
          </p>
        </div>

        <div className="feedback-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Expression</h3>
            <span className={`text-2xl font-bold ${getScoreColor(video.expressionScore)}`}>
              {video.expressionScore}%
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 mb-3">
            <div
              className={`h-2 rounded-full ${
                video.expressionScore >= 90 ? 'bg-green-500' :
                video.expressionScore >= 80 ? 'bg-blue-500' :
                video.expressionScore >= 70 ? 'bg-yellow-500' :
                'bg-red-500'
              }`}
              style={{ width: `${video.expressionScore}%` }}
            ></div>
          </div>
          <p className="text-sm text-muted-foreground">
            Fluidity, emotion, and artistic interpretation
          </p>
        </div>
      </div>

      {/* Detailed Feedback */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {feedback?.strengths && (
          <div className="feedback-card">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
              <Award className="w-5 h-5 text-green-600" />
              <span>Strengths</span>
            </h3>
            <ul className="space-y-2">
              {feedback.strengths.map((strength: string, index: number) => (
                <li key={index} className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-foreground">{strength}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {feedback?.improvements && (
          <div className="feedback-card">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              <span>Areas for Improvement</span>
            </h3>
            <ul className="space-y-2">
              {feedback.improvements.map((improvement: string, index: number) => (
                <li key={index} className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-foreground">{improvement}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Recommendations */}
      {feedback?.recommendations && (
        <div className="feedback-card">
          <h3 className="text-lg font-semibold text-foreground mb-4">Recommendations</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {feedback.recommendations.map((rec: string, index: number) => (
              <div key={index} className="p-4 bg-muted rounded-lg">
                <p className="text-foreground">{rec}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Analysis Text */}
      <div className="feedback-card">
        <h3 className="text-lg font-semibold text-foreground mb-4">Detailed Analysis</h3>
        <div className="prose prose-sm max-w-none">
          <p className="text-foreground whitespace-pre-wrap">{video.analysisText}</p>
        </div>
      </div>

      {/* Additional Notes */}
      {video.notes && (
        <div className="feedback-card">
          <h3 className="text-lg font-semibold text-foreground mb-4">Additional Notes</h3>
          <p className="text-foreground">{video.notes}</p>
        </div>
      )}
    </div>
  )
}