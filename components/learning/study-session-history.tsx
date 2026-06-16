"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Clock, Brain, Smile, TrendingUp, X } from "lucide-react"

interface SessionRecord {
  id: string
  date: string
  duration: number
  dominantEmotion: string
  focusScore: number
  activitiesCompleted: number
}

const EMOTION_COLORS: Record<string, string> = {
  focused:   "#22c55e",
  happy:     "#f59e0b",
  confused:  "#ef4444",
  bored:     "#9ca3af",
  sad:       "#6b7280",
  excited:   "#8b5cf6",
  unknown:   "#d1d5db",
}

const SAMPLE_SESSIONS: SessionRecord[] = [
  { id: "1", date: "Mon", duration: 45, dominantEmotion: "focused",  focusScore: 82, activitiesCompleted: 3 },
  { id: "2", date: "Tue", duration: 30, dominantEmotion: "happy",    focusScore: 75, activitiesCompleted: 2 },
  { id: "3", date: "Wed", duration: 60, dominantEmotion: "focused",  focusScore: 90, activitiesCompleted: 4 },
  { id: "4", date: "Thu", duration: 20, dominantEmotion: "bored",    focusScore: 55, activitiesCompleted: 1 },
  { id: "5", date: "Fri", duration: 50, dominantEmotion: "excited",  focusScore: 88, activitiesCompleted: 5 },
  { id: "6", date: "Sat", duration: 35, dominantEmotion: "confused", focusScore: 60, activitiesCompleted: 2 },
  { id: "7", date: "Sun", duration: 40, dominantEmotion: "focused",  focusScore: 85, activitiesCompleted: 3 },
]

interface StudySessionHistoryProps {
  onClose?: () => void
  language?: "en" | "hi" | "te"
}

export function StudySessionHistory({ onClose, language = "en" }: StudySessionHistoryProps) {
  const [sessions, setSessions] = useState<SessionRecord[]>([])

  useEffect(() => {
    // Load from localStorage or use sample data
    try {
      const stored = localStorage.getItem("studySessions")
      if (stored) {
        const parsed = JSON.parse(stored)
        // Validate the parsed data structure
        if (Array.isArray(parsed) && parsed.every(session => 
          session && 
          typeof session.id === 'string' &&
          typeof session.date === 'string' &&
          typeof session.duration === 'number' &&
          typeof session.dominantEmotion === 'string' &&
          typeof session.focusScore === 'number' &&
          typeof session.activitiesCompleted === 'number'
        )) {
          setSessions(parsed)
        } else {
          console.warn("Invalid session data structure in localStorage, using sample data")
          setSessions(SAMPLE_SESSIONS)
        }
      } else {
        setSessions(SAMPLE_SESSIONS)
      }
    } catch (error) {
      console.error("Failed to load study sessions from localStorage:", error)
      setSessions(SAMPLE_SESSIONS)
    }
  }, [])

  const totalMinutes  = sessions.reduce((sum, s) => sum + s.duration, 0)
  const avgFocus      = sessions.length
    ? Math.round(sessions.reduce((sum, s) => sum + s.focusScore, 0) / sessions.length)
    : 0
  const totalActivities = sessions.reduce((sum, s) => sum + s.activitiesCompleted, 0)

  const chartData = sessions.map(s => ({
    day:   s.date,
    focus: s.focusScore,
    mins:  s.duration,
  }))

  return (
    <div className="bg-background p-4 rounded-xl max-h-[85vh] overflow-y-auto w-full max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <TrendingUp size={22} className="text-primary" />
          Study Session History
        </h2>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X size={18} />
          </Button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Card className="border border-primary/20">
          <CardContent className="pt-4 text-center">
            <Clock size={20} className="mx-auto text-primary mb-1" />
            <p className="text-2xl font-bold">{totalMinutes}</p>
            <p className="text-xs text-muted-foreground">Total Minutes</p>
          </CardContent>
        </Card>
        <Card className="border border-secondary/20">
          <CardContent className="pt-4 text-center">
            <Brain size={20} className="mx-auto text-secondary mb-1" />
            <p className="text-2xl font-bold">{avgFocus}%</p>
            <p className="text-xs text-muted-foreground">Avg Focus</p>
          </CardContent>
        </Card>
        <Card className="border border-accent/20">
          <CardContent className="pt-4 text-center">
            <Smile size={20} className="mx-auto text-accent mb-1" />
            <p className="text-2xl font-bold">{totalActivities}</p>
            <p className="text-xs text-muted-foreground">Activities Done</p>
          </CardContent>
        </Card>
      </div>

      {/* Focus Trend Chart */}
      <Card className="mb-6 border border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Weekly Focus Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value: number) => [`${value}%`, "Focus Score"]}
              />
              <Line
                type="monotone"
                dataKey="focus"
                stroke="#6366f1"
                strokeWidth={2}
                dot={{ fill: "#6366f1", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Session List */}
      <div className="space-y-3">
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
          Recent Sessions
        </h3>
        {sessions.map((session) => (
          <Card key={session.id} className="border border-border/50">
            <CardContent className="py-3 px-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: EMOTION_COLORS[session.dominantEmotion] ?? "#d1d5db" }}
                />
                <div>
                  <p className="font-medium text-sm">{session.date}</p>
                  <p className="text-xs text-muted-foreground">
                    {session.duration} min · {session.activitiesCompleted} activities
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="capitalize text-xs">
                  {session.dominantEmotion}
                </Badge>
                <span className="text-sm font-bold text-primary">
                  {session.focusScore}%
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}