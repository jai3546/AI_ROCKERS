"use client"

import { StudySessionHistory } from "@/components/learning/study-session-history"
import { useRouter } from "next/navigation"

export default function SessionHistoryPage() {
  const router = useRouter()

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <StudySessionHistory
        onClose={() => router.push("/student-dashboard")}
        language="en"
      />
    </main>
  )
}