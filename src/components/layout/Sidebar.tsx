import { Home, Upload, BarChart3, History, Music } from 'lucide-react'
import type { PageType } from '../../App'

interface SidebarProps {
  currentPage: PageType
  onPageChange: (page: PageType) => void
}

export function Sidebar({ currentPage, onPageChange }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard' as PageType, label: 'Dashboard', icon: Home },
    { id: 'upload' as PageType, label: 'Upload Video', icon: Upload },
    { id: 'history' as PageType, label: 'History', icon: History },
  ]

  return (
    <div className="w-64 bg-card border-r border-border flex flex-col">
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 dance-gradient rounded-lg flex items-center justify-center">
            <Music className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-foreground">Dance AI</h1>
            <p className="text-sm text-muted-foreground">Coach</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = currentPage === item.id
          
          return (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          )
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <div className="bg-muted rounded-lg p-4 space-y-2">
          <h3 className="font-medium text-sm text-foreground">Dance Analysis Features</h3>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Technique Assessment</li>
            <li>• Rhythm & Timing</li>
            <li>• Movement Quality</li>
            <li>• Student Progress</li>
          </ul>
        </div>
      </div>
    </div>
  )
}