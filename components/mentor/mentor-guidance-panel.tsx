"use client"

import { useState } from "react"
import { MessageSquare, Send, Target } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import type { AssignedStudent } from "@/services/mentor-assignment-service"

interface MentorGuidancePanelProps {
  student: AssignedStudent | null
}

const GUIDANCE_TIPS: Record<string, string[]> = {
  high: [
    "Challenge with advanced practice problems.",
    "Encourage peer tutoring opportunities.",
    "Set stretch goals for the next topic.",
  ],
  medium: [
    "Review fundamentals before new concepts.",
    "Use short quizzes to reinforce learning.",
    "Schedule a 15-minute check-in this week.",
  ],
  low: [
    "Break topics into smaller steps.",
    "Celebrate small wins to build confidence.",
    "Suggest shorter study sessions with breaks.",
  ],
}

export function MentorGuidancePanel({ student }: MentorGuidancePanelProps) {
  const [note, setNote] = useState("")
  const [sent, setSent] = useState(false)

  if (!student) {
    return (
      <Card className="h-full">
        <CardContent className="flex h-64 items-center justify-center text-muted-foreground">
          Select a student to view guidance options
        </CardContent>
      </Card>
    )
  }

  const tips = GUIDANCE_TIPS[student.performanceLevel ?? "medium"]

  const handleSend = () => {
    if (!note.trim()) return
    setSent(true)
    setNote("")
    setTimeout(() => setSent(false), 2500)
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Guidance for {student.name}
        </CardTitle>
        <CardDescription>
          Personalized recommendations based on performance and subject needs
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <p className="mb-2 text-sm font-medium">Suggested actions</p>
          <ul className="space-y-2">
            {tips.map((tip) => (
              <li key={tip} className="rounded-lg bg-muted/50 px-3 py-2 text-sm text-foreground">
                {tip}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-2 flex items-center gap-2 text-sm font-medium">
            <MessageSquare className="h-4 w-4" />
            Send encouragement
          </p>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={`Write a note for ${student.name}...`}
            rows={4}
          />
          <Button className="mt-3" onClick={handleSend} disabled={!note.trim()}>
            <Send className="mr-2 h-4 w-4" />
            {sent ? "Sent!" : "Send guidance"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
