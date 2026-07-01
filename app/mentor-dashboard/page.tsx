"use client"

import { useState } from "react"
import { BarChart3, LogOut, Target, Users } from "lucide-react"
import { RouteGuard } from "@/components/auth/route-guard"
import { MentorGuidancePanel } from "@/components/mentor/mentor-guidance-panel"
import { MentorStudentList } from "@/components/mentor/mentor-student-list"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useLogout } from "@/hooks/use-logout"
import {
  getMentorStats,
  getMentorStudents,
  type AssignedStudent,
} from "@/services/mentor-assignment-service"

export default function MentorDashboardPage() {
  const { requestLogout, LogoutConfirmDialog } = useLogout()

  return (
    <>
      <RouteGuard allowedRoles={["mentor"]}>
        {(user) => (
          <MentorDashboardContent
            userId={user.id}
            userName={user.name}
            onLogout={requestLogout}
          />
        )}
      </RouteGuard>
      <LogoutConfirmDialog />
    </>
  )
}

function MentorDashboardContent({
  userId,
  userName,
  onLogout,
}: {
  userId: string
  userName: string
  onLogout: () => void
}) {
  const [selectedStudent, setSelectedStudent] = useState<AssignedStudent | null>(null)
  const students = getMentorStudents(userId)
  const stats = getMentorStats(userId)

  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-card shadow-sm">
        <div className="page-container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/20">
              <Target className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Mentor Portal</p>
              <p className="text-lg font-bold">Welcome, {userName}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onLogout}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <div className="page-container space-y-8 py-6">
        <section>
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
            <BarChart3 className="h-5 w-5 text-accent" />
            Overview
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Assigned students</p>
                <p className="text-3xl font-bold">{stats.totalStudents}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Active this week</p>
                <p className="text-3xl font-bold">{stats.activeThisWeek}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Need attention</p>
                <p className="text-3xl font-bold">{stats.needsAttention}</p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div>
            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
              <Users className="h-5 w-5 text-primary" />
              Assigned Students
            </h2>
            <MentorStudentList
              students={students}
              selectedId={selectedStudent?.id}
              onSelect={setSelectedStudent}
            />
          </div>
          <MentorGuidancePanel student={selectedStudent ?? students[0] ?? null} />
        </section>
      </div>
    </main>
  )
}
