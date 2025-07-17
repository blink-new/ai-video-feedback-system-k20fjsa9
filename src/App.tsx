import { useState, useEffect } from 'react'
import { blink } from './blink/client'
import { DashboardPage } from './pages/DashboardPage'
import { UploadPage } from './pages/UploadPage'
import { AnalysisPage } from './pages/AnalysisPage'
import { HistoryPage } from './pages/HistoryPage'
import { ComparisonPage } from './pages/ComparisonPage'
import { Sidebar } from './components/layout/Sidebar'
import { Header } from './components/layout/Header'
import { LoadingScreen } from './components/ui/LoadingScreen'

export type PageType = 'dashboard' | 'upload' | 'analysis' | 'history' | 'comparison'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard')
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null)
  const [referenceVideoId, setReferenceVideoId] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  const handleVideoAnalyzed = (videoId: string, refVideoId?: string) => {
    setSelectedVideoId(videoId)
    setReferenceVideoId(refVideoId || null)
    
    // If there's a reference video, go to comparison page, otherwise analysis page
    if (refVideoId) {
      setCurrentPage('comparison')
    } else {
      setCurrentPage('analysis')
    }
  }

  const handleCompareVideos = (studentVideoId: string, teacherVideoId: string) => {
    setSelectedVideoId(studentVideoId)
    setReferenceVideoId(teacherVideoId)
    setCurrentPage('comparison')
  }

  if (loading) {
    return <LoadingScreen />
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md mx-auto px-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-foreground">Dance AI Coach</h1>
            <p className="text-muted-foreground text-lg">
              AI-powered dance analysis and feedback system
            </p>
          </div>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Upload your dance videos and get instant AI feedback on technique, rhythm, and performance
            </p>
            <button
              onClick={() => blink.auth.login()}
              className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Sign In to Get Started
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
      
      <div className="flex-1 flex flex-col">
        <Header user={user} />
        
        <main className="flex-1 overflow-auto">
          {currentPage === 'dashboard' && (
            <DashboardPage onNavigate={setCurrentPage} />
          )}
          {currentPage === 'upload' && (
            <UploadPage onVideoAnalyzed={handleVideoAnalyzed} />
          )}
          {currentPage === 'analysis' && selectedVideoId && (
            <AnalysisPage 
              videoId={selectedVideoId} 
              onCompareVideos={handleCompareVideos}
            />
          )}
          {currentPage === 'history' && (
            <HistoryPage onVideoSelect={(id) => {
              setSelectedVideoId(id)
              setCurrentPage('analysis')
            }} />
          )}
          {currentPage === 'comparison' && selectedVideoId && referenceVideoId && (
            <ComparisonPage 
              studentVideoId={selectedVideoId} 
              teacherVideoId={referenceVideoId} 
            />
          )}
        </main>
      </div>
    </div>
  )
}

export default App