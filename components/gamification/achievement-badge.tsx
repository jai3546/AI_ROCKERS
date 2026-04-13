"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Award, Star, Trophy, Medal, Target, Brain, BookOpen, CheckCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export type BadgeType =
  | "bronze"
  | "silver"
  | "gold"
  | "platinum"
  | "diamond"
  | "master"
  | "grandmaster"
  | "locked"

export type BadgeCategory =
  | "quiz"
  | "flashcard"
  | "streak"
  | "tutor"
  | "subject"

interface AchievementBadgeProps {
  type: BadgeType
  category: BadgeCategory
  name: string
  description: string
  xpReward: number
  isUnlocked: boolean
  subject?: string
  onClick?: () => void
}

export function AchievementBadge({
  type,
  category,
  name,
  description,
  xpReward,
  isUnlocked,
  subject,
  onClick
}: AchievementBadgeProps) {
  const [isHovered, setIsHovered] = useState(false)

  // Badge colors based on type
  const getBadgeColors = () => {
    if (!isUnlocked) return { bg: "bg-gray-200 dark:bg-gray-700", border: "border-gray-300 dark:border-gray-600", text: "text-gray-400 dark:text-gray-400" }

    switch (type) {
      case "bronze":
        return { bg: "bg-amber-700/20 dark:bg-amber-900/30", border: "border-amber-700 dark:border-amber-600", text: "text-amber-700 dark:text-amber-500" }
      case "silver":
        return { bg: "bg-gray-400/20 dark:bg-gray-500/30", border: "border-gray-400 dark:border-gray-400", text: "text-gray-500 dark:text-gray-300" }
      case "gold":
        return { bg: "bg-yellow-500/20 dark:bg-yellow-600/30", border: "border-yellow-500 dark:border-yellow-500", text: "text-yellow-600 dark:text-yellow-400" }
      case "platinum":
        return { bg: "bg-cyan-500/20 dark:bg-cyan-700/30", border: "border-cyan-500 dark:border-cyan-600", text: "text-cyan-600 dark:text-cyan-400" }
      case "diamond":
        return { bg: "bg-blue-500/20 dark:bg-blue-700/30", border: "border-blue-500 dark:border-blue-600", text: "text-blue-600 dark:text-blue-400" }
      case "master":
        return { bg: "bg-purple-500/20 dark:bg-purple-700/30", border: "border-purple-500 dark:border-purple-600", text: "text-purple-600 dark:text-purple-400" }
      case "grandmaster":
        return { bg: "bg-red-500/20 dark:bg-red-700/30", border: "border-red-500 dark:border-red-600", text: "text-red-600 dark:text-red-400" }
      default:
        return { bg: "bg-gray-200 dark:bg-gray-700", border: "border-gray-300 dark:border-gray-600", text: "text-gray-400 dark:text-gray-400" }
    }
  }

  // Badge icon based on category
  const getBadgeIcon = () => {
    switch (category) {
      case "quiz":
        return <CheckCircle size={24} />
      case "flashcard":
        return <BookOpen size={24} />
      case "streak":
        return <Target size={24} />
      case "tutor":
        return <Brain size={24} />
      case "subject":
        return <Medal size={24} />
      default:
        return <Award size={24} />
    }
  }

  // Badge label based on type
  const getBadgeLabel = () => {
    if (!isUnlocked) return "Locked"
    return type.charAt(0).toUpperCase() + type.slice(1)
  }

  const { bg, border, text } = getBadgeColors()

  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.95 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
      className={`relative flex flex-col items-center ${isUnlocked ? "cursor-pointer" : "cursor-default"}`}
    >
      <div
        className={`w-16 h-16 rounded-full ${bg} ${border} border-2 flex items-center justify-center mb-2 relative overflow-hidden`}
      >
        <div className={`${text}`}>
          {getBadgeIcon()}
        </div>

        {/* Shine effect on hover */}
        {isUnlocked && isHovered && (
          <motion.div
            className="absolute inset-0 bg-white opacity-0"
            animate={{
              opacity: [0, 0.5, 0],
              left: ["-100%", "100%", "100%"]
            }}
            transition={{ duration: 1, ease: "easeInOut" }}
          />
        )}
      </div>

      <div className="text-center">
        <Badge
          variant={isUnlocked ? "default" : "outline"}
          className={`mb-1 ${isUnlocked ? "" : "opacity-50"} ${text} ${bg} border-0`}
        >
          {getBadgeLabel()}
        </Badge>
        <h4 className={`text-sm font-medium ${isUnlocked ? "" : "text-gray-400"}`}>{name}</h4>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute z-10 bottom-full mb-2 w-48 p-2 bg-white dark:bg-card rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 text-left"
          >
            <p className="text-xs text-gray-600 dark:text-gray-300 mb-1">{description}</p>
            {subject && <p className="text-xs font-medium text-primary">Subject: {subject}</p>}
            <div className="flex items-center mt-1 text-xs text-yellow-600 dark:text-yellow-400">
              <Star size={12} className="mr-1 fill-yellow-500" />
              +{xpReward} XP
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
