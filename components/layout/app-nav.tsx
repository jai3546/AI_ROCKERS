"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Home, BookOpen, FileText, Download, MessageSquare, Brain, Trophy, LogOut, TrendingUp, BookOpen as Learn } from "lucide-react"

interface AppNavProps {
  user?: { avatar?: string } | null
  onLogout: () => void
  onOpenQuiz?: () => void
  onOpenFlashcards?: () => void
  onOpenSummaries?: () => void
  onOpenAiTutor?: () => void
}

export function AppSidebar({ user, onLogout, onOpenQuiz, onOpenFlashcards, onOpenSummaries, onOpenAiTutor }: AppNavProps) {
  const router = useRouter()

  return (
    <div className="fixed left-0 top-0 bottom-0 w-16 bg-white dark:bg-card border-r border-border shadow-md hidden md:flex flex-col items-center py-6 gap-6 z-20">
      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
        {user?.avatar ? <div className="text-xl">{user.avatar}</div> : <BookOpen size={20} className="text-primary" />}
      </div>

      <div className="flex-1 flex flex-col items-center gap-4 mt-8">
        <Button variant="ghost" size="icon" className="text-primary" onClick={() => router.push("/student-dashboard")}>
          <Home size={20} />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onOpenQuiz ? onOpenQuiz() : router.push("/student-dashboard")}>
          <Learn size={20} />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onOpenFlashcards ? onOpenFlashcards() : router.push("/student-dashboard")}>
          <FileText size={20} />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onOpenSummaries ? onOpenSummaries() : router.push("/student-dashboard")}>
          <Download size={20} />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onOpenAiTutor ? onOpenAiTutor() : router.push("/student-dashboard")}>
          <MessageSquare size={20} />
        </Button>
        <Button variant="ghost" size="icon" className="text-indigo-600 dark:text-indigo-400" onClick={() => router.push("/learning-brain")}>
          <Brain size={20} />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => router.push("/student-dashboard#achievements-section")}>
          <Trophy size={20} />
        </Button>
      </div>

      <Button variant="ghost" size="icon" onClick={onLogout}>
        <LogOut size={20} />
      </Button>
    </div>
  )
}

export function AppBottomNav({ onOpenAiTutor }: { onOpenAiTutor?: () => void }) {
  const router = useRouter()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-card border-t border-border shadow-lg flex justify-around items-center h-16 md:hidden z-30 px-2">
      <Button variant="ghost" className="flex flex-col items-center gap-1 h-auto py-2 flex-1" onClick={() => router.push("/student-dashboard")}>
        <Home size={20} />
        <span className="text-xs">Home</span>
      </Button>
      <Button variant="ghost" className="flex flex-col items-center gap-1 h-auto py-2 flex-1" onClick={() => router.push("/student-dashboard")}>
        <BookOpen size={20} />
        <span className="text-xs">Learn</span>
      </Button>
      <Button variant="ghost" className="flex flex-col items-center gap-1 h-auto py-2 flex-1 text-indigo-600 dark:text-indigo-400" onClick={() => router.push("/learning-brain")}>
        <Brain size={20} />
        <span className="text-xs">Brain</span>
      </Button>
      <Button variant="ghost" className="flex flex-col items-center gap-1 h-auto py-2 flex-1" onClick={() => onOpenAiTutor ? onOpenAiTutor() : router.push("/student-dashboard")}>
        <MessageSquare size={20} />
        <span className="text-xs">Chat</span>
      </Button>
      <Button variant="ghost" className="flex flex-col items-center gap-1 h-auto py-2 flex-1" onClick={() => router.push("/session-history")}>
        <TrendingUp size={20} />
        <span className="text-xs">History</span>
      </Button>
    </nav>
  )
}