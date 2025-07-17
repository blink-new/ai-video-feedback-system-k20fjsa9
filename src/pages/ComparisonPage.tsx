import { useState, useEffect } from 'react'
import { Play, ArrowLeft, User, BookOpen, Clock, Award, TrendingUp, Target, Lightbulb } from 'lucide-react'
import { blink } from '../blink/client'

interface ComparisonPageProps {
  studentVideoId: string
  teacherVideoId: string
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

interface ComparisonResult {
  overallGap: number
  techniqueGap: number
  rhythmGap: number
  expressionGap: number
  keyDifferences: string[]
  specificImprovements: string[]
  practiceRecommendations: string[]
  progressAreas: string[]
}

export function ComparisonPage({ studentVideoId, teacherVideoId }: ComparisonPageProps) {
  const [studentVideo, setStudentVideo] = useState<VideoData | null>(null)
  const [teacherVideo, setTeacherVideo] = useState<VideoData | null>(null)
  const [comparison, setComparison] = useState<ComparisonResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)

  useEffect(() => {
    loadVideosAndCompare()
  }, [studentVideoId, teacherVideoId]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadVideosAndCompare = async () => {
    try {
      const user = await blink.auth.me()
      
      // Load videos from localStorage
      const storedVideos = localStorage.getItem(`video_analyses_${user.id}`)
      const videos = storedVideos ? JSON.parse(storedVideos) : []
      
      const student = videos.find((v: any) => v.id === studentVideoId)
      const teacher = videos.find((v: any) => v.id === teacherVideoId)

      if (student && teacher) {
        setStudentVideo(student as VideoData)
        setTeacherVideo(teacher as VideoData)
        
        // Generate comparison analysis
        await generateComparison(student, teacher)
      }
    } catch (error) {
      console.error('Failed to load videos:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateComparison = async (student: VideoData, teacher: VideoData) => {
    setAnalyzing(true)
    
    try {
      // Create detailed comparison prompt for AI
      const comparisonPrompt = `Compare this student's ${student.danceStyle} dance performance with the teacher's demonstration. 

Student Performance:
- Name: ${student.studentName}
- Technique Score: ${student.techniqueScore}%
- Rhythm Score: ${student.rhythmScore}%
- Expression Score: ${student.expressionScore}%
- Overall Score: ${student.overallScore}%

Teacher Demonstration:
- Technique Score: ${teacher.techniqueScore}%
- Rhythm Score: ${teacher.rhythmScore}%
- Expression Score: ${teacher.expressionScore}%
- Overall Score: ${teacher.overallScore}%

Dance Style: ${student.danceStyle}

Please provide a detailed comparison focusing on:
1. Key differences between student and teacher performance
2. Specific areas where student needs improvement
3. Targeted practice recommendations for ${student.danceStyle}
4. Progressive learning steps to bridge the gap
5. Cultural and technical aspects specific to ${student.danceStyle}

Format the response with clear sections for differences, improvements, and recommendations.`

      const { text: comparisonText } = await blink.ai.generateText({
        prompt: comparisonPrompt,
        maxTokens: 1200
      })

      // Calculate performance gaps
      const overallGap = teacher.overallScore - student.overallScore
      const techniqueGap = teacher.techniqueScore - student.techniqueScore
      const rhythmGap = teacher.rhythmScore - student.rhythmScore
      const expressionGap = teacher.expressionScore - student.expressionScore

      // Generate structured comparison result
      const comparisonResult: ComparisonResult = {
        overallGap,
        techniqueGap,
        rhythmGap,
        expressionGap,
        keyDifferences: generateKeyDifferences(student, teacher),
        specificImprovements: generateSpecificImprovements(student.danceStyle, overallGap),
        practiceRecommendations: generatePracticeRecommendations(student.danceStyle),
        progressAreas: generateProgressAreas(techniqueGap, rhythmGap, expressionGap)
      }

      setComparison(comparisonResult)
    } catch (error) {
      console.error('Failed to generate comparison:', error)
    } finally {
      setAnalyzing(false)
    }
  }

  const generateKeyDifferences = (student: VideoData, teacher: VideoData): string[] => {
    const differences = []
    
    if (teacher.techniqueScore - student.techniqueScore > 10) {
      differences.push('Significant technique gap in posture and form execution')
    }
    if (teacher.rhythmScore - student.rhythmScore > 10) {
      differences.push('Timing and rhythm synchronization needs improvement')
    }
    if (teacher.expressionScore - student.expressionScore > 10) {
      differences.push('Emotional expression and artistic interpretation can be enhanced')
    }
    
    differences.push('Teacher demonstrates more refined movement quality')
    differences.push('Student shows good foundation but needs refinement')
    
    return differences
  }

  const generateSpecificImprovements = (danceStyle: string, gap: number): string[] => {
    const improvements = []
    
    if (danceStyle === 'bharatanatyam') {
      improvements.push('Focus on precise aramandi (half-sitting position)')
      improvements.push('Improve hasta mudras (hand gestures) clarity')
      improvements.push('Work on facial expressions (abhinaya)')
      improvements.push('Strengthen leg positions and stability')
    } else if (danceStyle === 'kathak') {
      improvements.push('Practice chakkars (spins) with better balance')
      improvements.push('Improve tatkaar (footwork) precision')
      improvements.push('Work on bhava (emotional expression)')
      improvements.push('Enhance rhythm coordination with tabla')
    } else {
      improvements.push('Focus on core technique fundamentals')
      improvements.push('Improve movement flow and transitions')
      improvements.push('Work on musical interpretation')
      improvements.push('Enhance performance presence')
    }
    
    if (gap > 20) {
      improvements.push('Consider additional practice sessions')
      improvements.push('Focus on basic positions before complex movements')
    }
    
    return improvements
  }

  const generatePracticeRecommendations = (danceStyle: string): string[] => {
    if (danceStyle === 'bharatanatyam') {
      return [
        'Daily practice of basic adavus (steps)',
        'Mirror work for posture correction',
        'Strengthen leg muscles with specific exercises',
        'Practice mudras with storytelling',
        'Work with live music for better rhythm'
      ]
    } else if (danceStyle === 'kathak') {
      return [
        'Practice tatkaar daily for 15-20 minutes',
        'Work on balance exercises for chakkars',
        'Study different gharana styles',
        'Practice with tabla accompaniment',
        'Focus on bhava through storytelling'
      ]
    } else {
      return [
        'Daily technique practice sessions',
        'Video recording for self-assessment',
        'Work with qualified instructor',
        'Focus on flexibility and strength',
        'Regular performance practice'
      ]
    }
  }

  const generateProgressAreas = (techniqueGap: number, rhythmGap: number, expressionGap: number): string[] => {
    const areas = []
    
    if (techniqueGap > rhythmGap && techniqueGap > expressionGap) {
      areas.push('Technique is the primary focus area')
    } else if (rhythmGap > techniqueGap && rhythmGap > expressionGap) {
      areas.push('Rhythm and timing need immediate attention')
    } else if (expressionGap > techniqueGap && expressionGap > rhythmGap) {
      areas.push('Artistic expression requires development')
    }
    
    areas.push('Consistent practice will show improvement')
    areas.push('Focus on one area at a time for better results')
    
    return areas
  }

  const getGapColor = (gap: number) => {
    if (gap <= 5) return 'text-green-600'
    if (gap <= 15) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getGapBg = (gap: number) => {
    if (gap <= 5) return 'bg-green-100'
    if (gap <= 15) return 'bg-yellow-100'
    return 'bg-red-100'
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-2 gap-6">
            <div className="h-64 bg-muted rounded-lg"></div>
            <div className="h-64 bg-muted rounded-lg"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!studentVideo || !teacherVideo) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Videos not found for comparison</p>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => window.history.back()}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground">Video Comparison</h1>
          <p className="text-muted-foreground mt-1">
            Comparing {studentVideo.studentName}'s performance with teacher demonstration
          </p>
        </div>
      </div>

      {/* Video Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Student Video */}
        <div className="feedback-card">
          <div className="flex items-center space-x-2 mb-4">
            <User className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-foreground">Student Performance</h3>
          </div>
          <div className="aspect-video bg-black rounded-lg overflow-hidden mb-4">
            <video
              src={studentVideo.videoUrl}
              controls
              className="w-full h-full object-contain"
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Student:</span>
              <span className="text-sm font-medium">{studentVideo.studentName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Overall Score:</span>
              <span className="text-sm font-bold text-blue-600">{studentVideo.overallScore}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Dance Style:</span>
              <span className="text-sm font-medium capitalize">{studentVideo.danceStyle}</span>
            </div>
          </div>
        </div>

        {/* Teacher Video */}
        <div className="feedback-card">
          <div className="flex items-center space-x-2 mb-4">
            <BookOpen className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold text-foreground">Teacher Demonstration</h3>
          </div>
          <div className="aspect-video bg-black rounded-lg overflow-hidden mb-4">
            <video
              src={teacherVideo.videoUrl}
              controls
              className="w-full h-full object-contain"
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Type:</span>
              <span className="text-sm font-medium">Teacher Demo</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Overall Score:</span>
              <span className="text-sm font-bold text-green-600">{teacherVideo.overallScore}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Dance Style:</span>
              <span className="text-sm font-medium capitalize">{teacherVideo.danceStyle}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Gap Analysis */}
      {comparison && (
        <>
          <div className="feedback-card">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <span>Performance Gap Analysis</span>
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className={`p-4 rounded-lg ${getGapBg(comparison.overallGap)}`}>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">Overall Gap</p>
                  <p className={`text-2xl font-bold ${getGapColor(comparison.overallGap)}`}>
                    {comparison.overallGap}%
                  </p>
                </div>
              </div>
              <div className={`p-4 rounded-lg ${getGapBg(comparison.techniqueGap)}`}>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">Technique Gap</p>
                  <p className={`text-2xl font-bold ${getGapColor(comparison.techniqueGap)}`}>
                    {comparison.techniqueGap}%
                  </p>
                </div>
              </div>
              <div className={`p-4 rounded-lg ${getGapBg(comparison.rhythmGap)}`}>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">Rhythm Gap</p>
                  <p className={`text-2xl font-bold ${getGapColor(comparison.rhythmGap)}`}>
                    {comparison.rhythmGap}%
                  </p>
                </div>
              </div>
              <div className={`p-4 rounded-lg ${getGapBg(comparison.expressionGap)}`}>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">Expression Gap</p>
                  <p className={`text-2xl font-bold ${getGapColor(comparison.expressionGap)}`}>
                    {comparison.expressionGap}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Key Differences */}
          <div className="feedback-card">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
              <Target className="w-5 h-5 text-red-600" />
              <span>Key Differences</span>
            </h3>
            <ul className="space-y-2">
              {comparison.keyDifferences.map((difference, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-foreground">{difference}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Improvement Areas and Recommendations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="feedback-card">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
                <Award className="w-5 h-5 text-yellow-600" />
                <span>Specific Improvements</span>
              </h3>
              <ul className="space-y-2">
                {comparison.specificImprovements.map((improvement, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-foreground">{improvement}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="feedback-card">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
                <Lightbulb className="w-5 h-5 text-blue-600" />
                <span>Practice Recommendations</span>
              </h3>
              <ul className="space-y-2">
                {comparison.practiceRecommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-foreground">{recommendation}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Progress Areas */}
          <div className="feedback-card">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
              <Clock className="w-5 h-5 text-purple-600" />
              <span>Focus Areas for Progress</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {comparison.progressAreas.map((area, index) => (
                <div key={index} className="p-4 bg-muted rounded-lg">
                  <p className="text-foreground">{area}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {analyzing && (
        <div className="feedback-card text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Generating detailed comparison analysis...</p>
        </div>
      )}
    </div>
  )
}