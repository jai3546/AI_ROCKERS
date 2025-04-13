"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Calendar, Clock, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

interface DailyChallengeProps {
  title: string
  description: string
  xpReward: number
  timeLeft: string
  progress: number
  language?: "en" | "hi" | "te"
  onStart?: () => void
}

export function DailyChallenge({
  title,
  description,
  xpReward,
  timeLeft,
  progress,
  language = "en",
  onStart,
}: DailyChallengeProps) {
  const [isHovered, setIsHovered] = useState(false)

  const translations = {
    dailyChallenge: {
      en: "Daily Challenge",
      hi: "दैनिक चुनौती",
      te: "రోజువారీ ఛాలెంజ్",
    },
    timeLeft: {
      en: "Time left",
      hi: "शेष समय",
      te: "మిగిలిన సమయం",
    },
    startChallenge: {
      en: "Start Challenge",
      hi: "चुनौती शुरू करें",
      te: "ఛాలెంజ్ ప్రారంభించండి",
    },
    continueChallenge: {
      en: "Continue",
      hi: "जारी रखें",
      te: "కొనసాగించండి",
    },
    xpReward: {
      en: "XP Reward",
      hi: "XP इनाम",
      te: "XP రివార్డ్",
    },
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative overflow-hidden rounded-xl border-2 border-accent dark:border-accent/70 bg-white dark:bg-card p-4 shadow-md"
    >
      <div className="absolute top-0 right-0 bg-accent text-accent-foreground px-3 py-1 text-xs font-medium rounded-bl-lg">
        {translations.dailyChallenge[language]}
      </div>

      <div className="pt-6">
        <div className="flex items-start gap-3">
          <div className="rounded-full p-2 bg-accent/20 text-accent">
            <Calendar size={24} />
          </div>

          <div className="flex-1">
            <h3 className="font-bold text-lg">{title}</h3>
            <p className="text-sm text-foreground/70 mt-1">{description}</p>

            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-1 text-sm">
                <Star size={16} className="text-yellow-500 fill-yellow-500" />
                <span className="font-medium">+{xpReward}</span>
                <span className="text-foreground/70">{translations.xpReward[language]}</span>
              </div>

              <div className="flex items-center gap-1 text-sm">
                <Clock size={16} className="text-foreground/70" />
                <span className="text-foreground/70">{translations.timeLeft[language]}:</span>
                <span className="font-medium">{timeLeft}</span>
              </div>
            </div>

            {progress > 0 && (
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-foreground/70">Progress</span>
                  <span className="font-medium">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            <Button onClick={onStart} className="w-full mt-4 bg-accent hover:bg-accent/90">
              {progress > 0 ? translations.continueChallenge[language] : translations.startChallenge[language]}
            </Button>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <motion.div
        initial={{ opacity: 0.2 }}
        animate={{ opacity: isHovered ? 0.3 : 0.1 }}
        className="absolute -right-8 -bottom-8 bg-accent w-24 h-24 rounded-full"
      />
    </motion.div>
  )
}
