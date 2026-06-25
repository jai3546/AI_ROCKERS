"use client"

import { ArrowRight, BookOpen, Clock, Layers } from "lucide-react"
import { motion } from "framer-motion"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export interface ContinueLearningTopic {
  title: string
  subject: string
  progress: number
  lastPracticed?: string
}

interface ContinueLearningProps {
  topic: ContinueLearningTopic
  onContinue: () => void
}

function formatLastPracticed(lastPracticed?: string) {
  if (!lastPracticed) return "Recently studied"

  const practicedDate = new Date(lastPracticed)
  if (Number.isNaN(practicedDate.getTime())) return "Recently studied"

  const diffMs = Date.now() - practicedDate.getTime()
  const diffDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)))

  if (diffDays === 0) return "Studied today"
  if (diffDays === 1) return "Studied yesterday"

  return `Studied ${diffDays} days ago`
}

export function ContinueLearning({ topic, onContinue }: ContinueLearningProps) {
  const progress = Math.min(100, Math.max(0, Math.round(topic.progress)))

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.15 }}
    >
      <Card className="border border-border/80 bg-card shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <BookOpen size={22} />
              </div>

              <div className="min-w-0 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-sm font-semibold text-foreground/70">Continue Learning</h2>
                  <Badge variant="outline" className="gap-1 rounded-full px-2 py-0.5 text-[11px]">
                    <Layers size={12} />
                    {topic.subject}
                  </Badge>
                </div>

                <div>
                  <h3 className="truncate text-xl font-bold text-foreground">{topic.title}</h3>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock size={13} />
                    {formatLastPracticed(topic.lastPracticed)}
                  </p>
                </div>

                <div className="max-w-xl space-y-1.5">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium text-foreground/80">Progress</span>
                    <span className="font-semibold text-primary">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2 bg-primary/10" />
                </div>
              </div>
            </div>

            <Button className="w-full gap-2 md:w-auto md:shrink-0" onClick={onContinue}>
              Continue Learning
              <ArrowRight size={16} />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
