import { User, LogOut } from 'lucide-react'
import { blink } from '../../blink/client'

interface HeaderProps {
  user: any
}

export function Header({ user }: HeaderProps) {
  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Dance Video Analysis</h2>
          <p className="text-sm text-muted-foreground">
            AI-powered feedback for dance teachers and students
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-primary-foreground" />
            </div>
            <div className="text-sm">
              <p className="font-medium text-foreground">{user.email}</p>
              <p className="text-muted-foreground">Dance Instructor</p>
            </div>
          </div>
          
          <button
            onClick={() => blink.auth.logout()}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  )
}