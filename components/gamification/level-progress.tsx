"use client"
import { motion } from "framer-motion"
import { Trophy, Star } from "lucide-react"

interface LevelProgressProps {
  level: number
  currentXP: number
  requiredXP: number
  language?: "en" | "hi" | "te"
}

export function LevelProgress({ level, currentXP, requiredXP, language = "en" }: LevelProgressProps) {
  const progress = Math.min((currentXP / requiredXP) * 100, 100)

  const translations = {
    level: {
      en: "Level",
      hi: "स्तर",
      te: "లెవల్",
    },
    xpToNextLevel: {
      en: "XP to next level",
      hi: "अगले स्तर तक XP",
      te: "తదుపరి స్థాయికి XP",
    },
  }

  return (
    <div className="w-full bg-white dark:bg-card rounded-xl shadow-md p-4 border border-border dark:border-border">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <Trophy size={20} className="text-primary" />
          </div>
          <div>
            <p className="text-sm text-foreground/70 dark:text-foreground/80">{translations.level[language]}</p>
            <p className="text-xl font-bold text-foreground dark:text-foreground">{level}</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Star size={16} className="text-yellow-500 fill-yellow-500" />
          <span className="font-bold text-foreground dark:text-foreground">{currentXP}</span>
          <span className="text-foreground/70 dark:text-foreground/80">/ {requiredXP}</span>
        </div>
      </div>

      <div className="w-full h-4 bg-muted dark:bg-muted/70 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-primary to-secondary"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>

      <div className="mt-2 text-xs text-right text-foreground/70">
        {translations.xpToNextLevel[language]}: {requiredXP - currentXP}
      </div>
    </div>
  )
}
