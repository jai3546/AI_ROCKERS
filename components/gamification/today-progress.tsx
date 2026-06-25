"use client"

import { motion } from "framer-motion"
import { Clock, Goal, FileText, Star, TrendingUp } from "lucide-react"
import type { DailyProgressStats } from "@/services/daily-progress-service"

interface TodayProgressProps {
  stats: DailyProgressStats
  language?: "en" | "hi" | "te"
}

export function TodayProgress({ stats, language = "en" }: TodayProgressProps) {
  const translations = {
    title: {
      en: "Today's Progress",
      hi: "आज की प्रगति",
      te: "నేటి పురోగతి",
    },
    studyTime: {
      en: (minutes: number) => `${minutes} min studied`,
      hi: (minutes: number) => `${minutes} मिनट अध्ययन`,
      te: (minutes: number) => `${minutes} నిమి చదువు`,
    },
    quizzesCompleted: {
      en: (count: number) =>
        `${count} ${count === 1 ? "quiz" : "quizzes"} completed`,
      hi: (count: number) => `${count} क्विज़ पूर्ण`,
      te: (count: number) => `${count} క్విజ్‌లు పూర్తి`,
    },
    flashcardsReviewed: {
      en: (count: number) => `${count} flashcards reviewed`,
      hi: (count: number) => `${count} फ्लैशकार्ड समीक्षित`,
      te: (count: number) => `${count} ఫ్లాష్‌కార్డ్‌లు`,
    },
    xpEarned: {
      en: (xp: number) => `+${xp} XP earned`,
      hi: (xp: number) => `+${xp} XP अर्जित`,
      te: (xp: number) => `+${xp} XP సంపాదించారు`,
    },
  }

  const items = [
    {
      icon: Clock,
      label: translations.studyTime[language](stats.studyTimeMinutes),
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      icon: Goal,
      label: translations.quizzesCompleted[language](stats.quizzesCompleted),
      color: "text-secondary",
      bg: "bg-secondary/10",
    },
    {
      icon: FileText,
      label: translations.flashcardsReviewed[language](stats.flashcardsReviewed),
      color: "text-accent",
      bg: "bg-accent/10",
    },
    {
      icon: Star,
      label: translations.xpEarned[language](stats.xpEarned),
      color: "text-yellow-500",
      bg: "bg-yellow-500/10",
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="w-full rounded-xl border border-border bg-white dark:bg-card shadow-md p-3"
    >
      <h2 className="text-sm font-semibold text-foreground/70 mb-2 flex items-center gap-2">
        <TrendingUp size={16} className="text-primary" />
        {translations.title[language]}
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        {items.map(({ icon: Icon, label, color, bg }) => (
          <div
            key={label}
            className="flex items-center gap-2 rounded-lg border border-border/50 bg-muted/30 px-3 py-2"
          >
            <div className={`rounded-full p-1.5 ${bg}`}>
              <Icon size={14} className={color} />
            </div>
            <p className="text-sm font-medium text-foreground leading-tight">{label}</p>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
