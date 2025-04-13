"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, ArrowRight, Bookmark, Check, Repeat, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface FlashcardProps {
  front: string
  back: string
  currentIndex: number
  totalCards: number
  onNext: () => void
  onPrevious: () => void
  onMarkKnown: () => void
  onMarkUnknown: () => void
  onSave: () => void
  language?: "en" | "hi" | "te"
}

export function Flashcard({
  front,
  back,
  currentIndex,
  totalCards,
  onNext,
  onPrevious,
  onMarkKnown,
  onMarkUnknown,
  onSave,
  language = "en",
}: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false)

  const translations = {
    card: {
      en: "Card",
      hi: "कार्ड",
      te: "కార్డు",
    },
    of: {
      en: "of",
      hi: "का",
      te: "యొక్క",
    },
    tapToFlip: {
      en: "Tap to flip",
      hi: "फ्लिप करने के लिए टैप करें",
      te: "ఫ్లిప్ చేయడానికి నొక్కండి",
    },
    iKnowThis: {
      en: "I know this",
      hi: "मुझे यह पता है",
      te: "నాకు తెలుసు",
    },
    stillLearning: {
      en: "Still learning",
      hi: "अभी भी सीख रहा हूँ",
      te: "ఇంకా నేర్చుకుంటున్నాను",
    },
    saveForLater: {
      en: "Save for later",
      hi: "बाद के लिए सहेजें",
      te: "తర్వాత కోసం సేవ్ చేయండి",
    },
  }

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-foreground/70">
          {translations.card[language]} {currentIndex + 1} {translations.of[language]} {totalCards}
        </div>
        <Progress value={((currentIndex + 1) / totalCards) * 100} className="w-1/2 h-2" />
      </div>

      <motion.div
        className="perspective-1000 relative w-full h-64 cursor-pointer"
        onClick={handleFlip}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <motion.div
          className="absolute w-full h-full"
          initial={false}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 300, damping: 20 }}
          style={{ backfaceVisibility: "hidden" }}
        >
          <Card className="w-full h-full flex flex-col items-center justify-center p-6 border-2 border-primary/50 shadow-md">
            <div className="text-xl font-medium text-center">{front}</div>
            <div className="absolute bottom-2 text-xs text-foreground/50 flex items-center gap-1">
              <Repeat size={12} />
              {translations.tapToFlip[language]}
            </div>
          </Card>
        </motion.div>

        <motion.div
          className="absolute w-full h-full"
          initial={{ rotateY: 180 }}
          animate={{ rotateY: isFlipped ? 360 : 180 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 300, damping: 20 }}
          style={{ backfaceVisibility: "hidden" }}
        >
          <Card className="w-full h-full flex flex-col items-center justify-center p-6 border-2 border-secondary/50 shadow-md bg-secondary/5">
            <div className="text-xl font-medium text-center">{back}</div>
            <div className="absolute bottom-2 text-xs text-foreground/50 flex items-center gap-1">
              <Repeat size={12} />
              {translations.tapToFlip[language]}
            </div>
          </Card>
        </motion.div>
      </motion.div>

      <div className="flex items-center justify-between mt-4">
        <Button
          variant="outline"
          size="icon"
          onClick={onPrevious}
          disabled={currentIndex === 0}
          className="rounded-full"
        >
          <ArrowLeft size={18} />
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onMarkKnown}
            className="border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700 flex items-center gap-1"
          >
            <Check size={16} />
            <span className="hidden sm:inline">{translations.iKnowThis[language]}</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onMarkUnknown}
            className="border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center gap-1"
          >
            <X size={16} />
            <span className="hidden sm:inline">{translations.stillLearning[language]}</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onSave}
            className="border-accent text-accent hover:bg-accent/10 hover:text-accent flex items-center gap-1"
          >
            <Bookmark size={16} />
            <span className="hidden sm:inline">{translations.saveForLater[language]}</span>
          </Button>
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={onNext}
          disabled={currentIndex === totalCards - 1}
          className="rounded-full"
        >
          <ArrowRight size={18} />
        </Button>
      </div>
    </div>
  )
}
