"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Award, Filter } from "lucide-react"
import { AchievementBadge, BadgeType, BadgeCategory } from "./achievement-badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface BadgeData {
  id: string
  type: BadgeType
  category: BadgeCategory
  name: string
  description: string
  xpReward: number
  isUnlocked: boolean
  subject?: string
}

interface BadgeCollectionProps {
  badges: BadgeData[]
  onBadgeClick: (badge: BadgeData) => void
  language?: "en" | "hi" | "te"
}

export function BadgeCollection({ badges, onBadgeClick, language = "en" }: BadgeCollectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  const translations = {
    badgeCollection: {
      en: "Badge Collection",
      hi: "बैज संग्रह",
      te: "బ్యాడ్జ్ సేకరణ",
    },
    all: {
      en: "All",
      hi: "सभी",
      te: "అన్నీ",
    },
    quiz: {
      en: "Quiz",
      hi: "क्विज़",
      te: "క్విజ్",
    },
    flashcard: {
      en: "Flashcard",
      hi: "फ्लैशकार्ड",
      te: "ఫ్లాష్‌కార్డ్",
    },
    streak: {
      en: "Streak",
      hi: "स्ट्रीक",
      te: "స్ట్రీక్",
    },
    tutor: {
      en: "Tutor",
      hi: "ट्यूटर",
      te: "ట్యూటర్",
    },
    subject: {
      en: "Subject",
      hi: "विषय",
      te: "విషయం",
    },
  }

  const filteredBadges = selectedCategory === "all"
    ? badges
    : badges.filter(badge => badge.category === selectedCategory)

  return (
    <div className="bg-white dark:bg-card rounded-xl shadow-md border border-border dark:border-border overflow-hidden">
      <div className="bg-primary/10 dark:bg-primary/20 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award size={18} className="text-primary" />
            <h3 className="font-bold text-primary">{translations.badgeCollection[language]}</h3>
          </div>

          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-auto">
            <TabsList className="h-8 bg-white/50 dark:bg-background/50">
              <TabsTrigger value="all" className="text-xs h-6 px-3 text-foreground dark:text-foreground">
                {translations.all[language]}
              </TabsTrigger>
              <TabsTrigger value="quiz" className="text-xs h-6 px-3 text-foreground dark:text-foreground">
                {translations.quiz[language]}
              </TabsTrigger>
              <TabsTrigger value="flashcard" className="text-xs h-6 px-3 text-foreground dark:text-foreground">
                {translations.flashcard[language]}
              </TabsTrigger>
              <TabsTrigger value="subject" className="text-xs h-6 px-3 text-foreground dark:text-foreground">
                {translations.subject[language]}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="p-4">
        <motion.div
          layout
          className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4"
        >
          {filteredBadges.map((badge) => (
            <motion.div
              key={badge.id}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              <AchievementBadge
                type={badge.type}
                category={badge.category}
                name={badge.name}
                description={badge.description}
                xpReward={badge.xpReward}
                isUnlocked={badge.isUnlocked}
                subject={badge.subject}
                onClick={() => badge.isUnlocked && onBadgeClick(badge)}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
