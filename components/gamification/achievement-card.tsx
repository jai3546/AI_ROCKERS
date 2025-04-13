"use client"

import type React from "react"

import { motion } from "framer-motion"
import { Award, Lock } from "lucide-react"

interface AchievementCardProps {
  title: string
  description: string
  icon: React.ReactNode
  isUnlocked: boolean
  progress?: number
  maxProgress?: number
  xpReward: number
  onClick?: () => void
}

export function AchievementCard({
  title,
  description,
  icon,
  isUnlocked,
  progress = 0,
  maxProgress = 1,
  xpReward,
  onClick,
}: AchievementCardProps) {
  const progressPercentage = Math.min((progress / maxProgress) * 100, 100)

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative overflow-hidden rounded-lg border ${
        isUnlocked ? "border-secondary dark:border-secondary/70" : "border-muted dark:border-muted/70"
      } bg-white dark:bg-card text-foreground dark:text-foreground p-4 shadow-sm transition-all duration-200 cursor-pointer`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`rounded-full p-2 ${
            isUnlocked ? "bg-secondary/20 text-secondary" : "bg-muted text-foreground/40"
          }`}
        >
          {icon}
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className={`font-medium ${isUnlocked ? "text-foreground dark:text-foreground" : "text-foreground/60 dark:text-foreground/50"}`}>{title}</h3>
            {!isUnlocked && <Lock size={14} className="text-foreground/40" />}
          </div>
          <p className="text-xs text-foreground/60 dark:text-foreground/50 mt-1">{description}</p>

          {maxProgress > 1 && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className={isUnlocked ? "text-foreground dark:text-foreground" : "text-foreground/60 dark:text-foreground/50"}>
                  {progress} / {maxProgress}
                </span>
                <span className="text-primary font-medium">+{xpReward} XP</span>
              </div>
              <div className="w-full h-2 bg-muted dark:bg-muted/70 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${isUnlocked ? "bg-secondary" : "bg-secondary/30"}`}
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {isUnlocked && (
        <div className="absolute -right-8 -top-8 bg-secondary/10 w-16 h-16 rounded-full flex items-center justify-center">
          <Award size={16} className="text-secondary translate-x-4 translate-y-4" />
        </div>
      )}
    </motion.div>
  )
}
