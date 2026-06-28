"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Clock, Brain, Smile, TrendingUp, X, BookOpen } from "lucide-react"

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
const EMOTION_EMOJIS: Record<string, string> = {
  focused: "🎯",
  happy: "😊",
  confused: "😕",
  bored: "😴",
  sad: "😔",
  excited: "🤩",
  unknown: "😐",
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
    try {
      const stored = localStorage.getItem("studySessions")
      if (stored) {
        const parsed = JSON.parse(stored)
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
<<<<<<< HEAD
    <div className="bg-background/40 backdrop-blur-sm rounded-xl w-full max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-border/40">
        <h2 className="text-2xl font-bold flex items-center gap-2">
=======
    <div className="bg-background rounded-xl max-h-[85vh] overflow-y-auto w-full max-w-4xl px-8 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="flex items-center gap-2 text-3xl font-bold">
>>>>>>> ae321b2 (Refine study session history and flashcard UI)
          <TrendingUp size={22} className="text-primary" />
          Study Session Performance
        </h2>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-accent/50">
            <X size={18} />
          </Button>
        )}
      </div>

      {/* Main Responsive Grid Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* PRIMARY COLUMN: Recent Sessions (Left on Desktop, Bottom on Mobile via HTML source order or ordering) */}
        <div className="lg:col-span-7 space-y-4 order-2 lg:order-1">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
              Recent Sessions Log
            </h3>
            <Badge variant="secondary" className="text-xs font-normal">
              {sessions.length} recorded entries
            </Badge>
          </div>
          
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
            {sessions.map((session) => (
              <Card key={session.id} className="border border-border/40 bg-card/60 transition-all hover:bg-card hover:shadow-md">
                <CardContent className="py-4 px-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-3 h-3 rounded-full shadow-sm animate-pulse"
                      style={{ backgroundColor: EMOTION_COLORS[session.dominantEmotion] ?? "#d1d5db" }}
                    />
                    <div>
                      <p className="font-semibold text-sm">{session.date} Session</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {session.duration} mins dedicated · {session.activitiesCompleted} interactive learning metrics
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="capitalize text-xs px-2.5 py-0.5 font-medium">
                      {session.dominantEmotion}
                    </Badge>
                    <span className="text-sm font-bold text-primary bg-primary/10 px-2 py-1 rounded">
                      {session.focusScore}%
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

<<<<<<< HEAD
        {/* SECONDARY COLUMN: Summary & Weekly Insights (Right on Desktop, Top on Mobile) */}
        <div className="lg:col-span-5 space-y-6 order-1 lg:order-2">
          
          {/* Summary Cards */}
          <div>
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">
              Performance Totals
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <Card className="border border-primary/20 bg-card/30">
                <CardContent className="pt-4 pb-3 text-center px-1">
                  <Clock size={20} className="mx-auto text-primary mb-1.5" />
                  <p className="text-xl font-extrabold tracking-tight">{totalMinutes}</p>
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mt-0.5">Total Mins</p>
                </CardContent>
              </Card>
              <Card className="border border-secondary/20 bg-card/30">
                <CardContent className="pt-4 pb-3 text-center px-1">
                  <Brain size={20} className="mx-auto text-secondary mb-1.5" />
                  <p className="text-xl font-extrabold tracking-tight">{avgFocus}%</p>
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mt-0.5">Avg Focus</p>
                </CardContent>
              </Card>
              <Card className="border border-accent/20 bg-card/30">
                <CardContent className="pt-4 pb-3 text-center px-1">
                  <Smile size={20} className="mx-auto text-accent mb-1.5" />
                  <p className="text-xl font-extrabold tracking-tight">{totalActivities}</p>
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mt-0.5">Tasks Done</p>
                </CardContent>
              </Card>
            </div>
          </div>
=======
      {/* Focus Trend Chart */}
      <Card className="mb-8 border border-border shadow-sm rounded-xl">
        <CardHeader className="px-6 pt-5 pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-foreground">
            <TrendingUp size={14} className="text-primary" />
            Weekly Learning Analytics
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-2 pt-4">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData}
             margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(156,163,175,0.15)" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(value: number) => [`${value}%`, "Focus Score"]}
              />
              <Line
                type="monotone"
                dataKey="focus"
                stroke="#6366f1"
                strokeWidth={2.5}
                dot={{ fill: "#6366f1", r: 5}}
                activeDot={{ r: 6, stroke: "#ffffff", strokeWidth: 2,}}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
>>>>>>> ae321b2 (Refine study session history and flashcard UI)

      {/* Session List */}
      <div className="space-y-4">
        <h3 className="font-semibold text-sm uppercase tracking-wider">
          Recent Sessions
        </h3>
        {sessions.map((session) => (
          <Card className="rounded-xl mb-6 border border-border/60 shadow-md transition-shadow duration-300 hover:-translate-y-1 hover:shadow-lg">
            <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: EMOTION_COLORS[session.dominantEmotion] ?? "#d1d5db" }}
                />
                <div>
                  <p className="font-medium text-sm">{session.date}</p>
                  <div className="flex flex-wrap gap-3 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                    <Clock size={12} />
                     {session.duration} min
                    </span>

                    <span className="flex items-center gap-1">
                    <BookOpen size={12} />
                      {session.activitiesCompleted} activities
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="capitalize text-xs flex items-center gap-1">
                <span>{EMOTION_EMOJIS[session.dominantEmotion] || "😐"}</span>
                  {session.dominantEmotion}
                </Badge>
                 <div className="w-24">
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full"
                          style={{ width: `${session.focusScore}%` }}
                    />
                  </div>
                    <p className="text-xs font-semibold text-right mt-1">
                    {session.focusScore}%
                    </p>
                 </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

          {/* Focus Trend Chart */}
          <Card className="border border-border/60 bg-card/40 backdrop-blur-md shadow-sm">
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <TrendingUp size={14} className="text-indigo-500" />
                Weekly Learning Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(156, 163, 175, 0.15)" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "var(--background)", borderColor: "var(--border)", borderRadius: "8px" }}
                    labelStyle={{ fontWeight: 'bold', color: 'var(--foreground)' }}
                    formatter={(value: number) => [`${value}%`, "Focus Level"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="focus"
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    dot={{ fill: "#6366f1", r: 4 }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
        </div>

      </div>
    </div>
  )
}