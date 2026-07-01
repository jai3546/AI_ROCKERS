"use client"

import { BookOpen, Clock, TrendingUp, User } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { AssignedStudent } from "@/services/mentor-assignment-service"

interface MentorStudentListProps {
  students: AssignedStudent[]
  selectedId?: string
  onSelect: (student: AssignedStudent) => void
}

function formatLastActive(timestamp?: number) {
  if (!timestamp) return "No recent activity"
  const hours = Math.floor((Date.now() - timestamp) / 3600000)
  if (hours < 1) return "Active recently"
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export function MentorStudentList({ students, selectedId, onSelect }: MentorStudentListProps) {
  if (students.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          No students assigned yet. Students appear here after mentor matching.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {students.map((student) => (
        <button
          key={student.id}
          type="button"
          onClick={() => onSelect(student)}
          className={`w-full rounded-xl border p-4 text-left transition-colors ${
            selectedId === student.id
              ? "border-primary bg-primary/5"
              : "border-border hover:bg-muted/50"
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">{student.name}</p>
                <p className="text-sm text-muted-foreground">{student.class}</p>
              </div>
            </div>
            {student.performanceLevel && (
              <Badge variant={student.performanceLevel === "low" ? "destructive" : "secondary"}>
                {student.performanceLevel}
              </Badge>
            )}
          </div>
          <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
            {student.subjectNeed && (
              <span className="flex items-center gap-1">
                <BookOpen className="h-3.5 w-3.5" />
                {student.subjectNeed}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {formatLastActive(student.lastActiveAt)}
            </span>
            <span className="flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5" />
              ID: {student.id}
            </span>
          </div>
        </button>
      ))}
    </div>
  )
}
