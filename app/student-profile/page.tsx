"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft, BookOpen, TrendingUp } from "lucide-react"
import { RouteGuard } from "@/components/auth/route-guard"
import { StudentProfileCard } from "@/components/student/student-profile-card"
import { AppBottomNav, AppSidebar } from "@/components/layout/app-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useLogout } from "@/hooks/use-logout"

export default function StudentProfilePage() {
  const router = useRouter()
  const { requestLogout, LogoutConfirmDialog } = useLogout()

  return (
    <>
      <RouteGuard allowedRoles={["student"]}>
        {(user) => (
          <main className="min-h-screen bg-background pb-20">
            <AppSidebar user={user} onLogout={requestLogout} />
          <div className="page-container space-y-6 py-6 pb-20 md:pl-20">
            <Button variant="ghost" className="gap-2" onClick={() => router.push("/student-dashboard")}>
              <ArrowLeft className="h-4 w-4" />
              Back to dashboard
            </Button>

            <StudentProfileCard />

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Learning progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <p>Track quizzes, flashcards, and tutor sessions from your dashboard.</p>
                  <Button variant="outline" size="sm" onClick={() => router.push("/session-history")}>
                    View session history
                  </Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <BookOpen className="h-5 w-5 text-secondary" />
                    Study resources
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <p>Access textbooks, mind maps, and AI-generated summaries.</p>
                  <Button variant="outline" size="sm" onClick={() => router.push("/learning-brain")}>
                    Open learning brain
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
          <AppBottomNav />
        </main>
        )}
      </RouteGuard>
      <LogoutConfirmDialog />
    </>
  )
}
