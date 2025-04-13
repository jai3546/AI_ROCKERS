"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Medal, Trophy, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface LeaderboardEntry {
  id: string
  name: string
  avatar?: string
  points: number
  rank: number
}

interface LeaderboardProps {
  entries: LeaderboardEntry[]
  currentUserId: string
  language?: "en" | "hi" | "te"
}

export function Leaderboard({ entries, currentUserId, language = "en" }: LeaderboardProps) {
  const [selectedTab, setSelectedTab] = useState("class")

  const translations = {
    leaderboard: {
      en: "Leaderboard",
      hi: "लीडरबोर्ड",
      te: "లీడర్‌బోర్డ్",
    },
    class: {
      en: "Class",
      hi: "कक्षा",
      te: "తరగతి",
    },
    school: {
      en: "School",
      hi: "स्कूल",
      te: "స్కూల్",
    },
    points: {
      en: "points",
      hi: "अंक",
      te: "పాయింట్లు",
    },
    rank: {
      en: "Rank",
      hi: "रैंक",
      te: "ర్యాంక్",
    },
    viewAll: {
      en: "View All",
      hi: "सभी देखें",
      te: "అన్నీ చూడండి",
    },
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy size={16} className="text-yellow-500" />
    if (rank === 2) return <Medal size={16} className="text-gray-400" />
    if (rank === 3) return <Medal size={16} className="text-amber-700" />
    return <span className="text-xs font-medium w-4 text-center">{rank}</span>
  }

  return (
    <div className="bg-white dark:bg-card rounded-xl shadow-md border border-border dark:border-border overflow-hidden">
      <div className="bg-secondary/10 dark:bg-secondary/20 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-secondary" />
            <h3 className="font-bold text-secondary">{translations.leaderboard[language]}</h3>
          </div>

          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-auto">
            <TabsList className="h-8 bg-white/50">
              <TabsTrigger value="class" className="text-xs h-6 px-3">
                {translations.class[language]}
              </TabsTrigger>
              <TabsTrigger value="school" className="text-xs h-6 px-3">
                {translations.school[language]}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-2"
          >
            {entries.slice(0, 5).map((entry) => (
              <div
                key={entry.id}
                className={`flex items-center p-2 rounded-lg ${
                  entry.id === currentUserId ? "bg-secondary/10 dark:bg-secondary/20 border border-secondary/30 dark:border-secondary/40" : "hover:bg-muted/50 dark:hover:bg-muted/30"
                }`}
              >
                <div className="w-8 h-8 flex items-center justify-center">{getRankIcon(entry.rank)}</div>

                <div className="flex items-center flex-1 gap-3">
                  <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center">
                    {entry.avatar ? (
                      <img
                        src={entry.avatar || "/placeholder.svg"}
                        alt={entry.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-xs font-bold">{entry.name.substring(0, 2).toUpperCase()}</span>
                    )}
                  </div>

                  <span className={`font-medium ${entry.id === currentUserId ? "text-secondary dark:text-secondary" : "text-foreground dark:text-foreground"}`}>
                    {entry.name}
                  </span>
                </div>

                <div className="font-bold text-sm text-foreground dark:text-foreground">
                  {entry.points}{" "}
                  <span className="text-xs font-normal text-foreground/70 dark:text-foreground/80">{translations.points[language]}</span>
                </div>
              </div>
            ))}

            <Button variant="ghost" size="sm" className="w-full text-secondary mt-2">
              {translations.viewAll[language]}
            </Button>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
