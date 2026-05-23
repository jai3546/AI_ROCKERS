"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Award, Star, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import confetti from "canvas-confetti"

interface RewardPopupProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description: string
  xpAmount: number
  language?: "en" | "hi" | "te"
}

export function RewardPopup({ isOpen, onClose, title, description, xpAmount, language = "en" }: RewardPopupProps) {
  const [showConfetti, setShowConfetti] = useState(false)

  const translations = {
    congratulations: {
      en: "Congratulations!",
      hi: "बधाई हो!",
      te: "అభినందనలు!",
    },
    youEarned: {
      en: "You earned",
      hi: "आपने अर्जित किया",
      te: "మీరు సంపాదించారు",
    },
    xpPoints: {
      en: "XP Points",
      hi: "XP अंक",
      te: "XP పాయింట్లు",
    },
    claim: {
      en: "Claim Reward",
      hi: "इनाम प्राप्त करें",
      te: "రివార్డ్ క్లెయిమ్ చేయండి",
    },
  }

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true)

      // Trigger confetti
      const duration = 3000
      const end = Date.now() + duration

      const runConfetti = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ["#f72585", "#4895ef", "#4cc9f0"],
        })

        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ["#f72585", "#4895ef", "#4cc9f0"],
        })

        if (Date.now() < end) {
          requestAnimationFrame(runConfetti)
        }
      }

      runConfetti()
    }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="relative bg-white rounded-xl shadow-lg max-w-md w-full overflow-hidden"
          >
            <Button variant="ghost" size="icon" className="absolute right-2 top-2 z-10" onClick={onClose}>
              <X size={18} />
            </Button>

            <div className="bg-gradient-to-r from-primary to-highlight p-6 text-white text-center">
              <h2 className="text-2xl font-bold">{translations.congratulations[language]}</h2>
              <p className="text-white/80 mt-1">{title}</p>
            </div>

            <div className="p-6 flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center -mt-16 border-4 border-white shadow-md">
                <Award size={40} className="text-primary" />
              </div>

              <div className="mt-4 text-center">
                <p className="text-foreground/70">{description}</p>

                <div className="flex items-center justify-center gap-2 mt-6 mb-4">
                  <span className="text-foreground/70">{translations.youEarned[language]}</span>
                  <div className="flex items-center gap-1 text-xl font-bold">
                    <Star size={20} className="text-yellow-500 fill-yellow-500" />
                    <span>{xpAmount}</span>
                  </div>
                  <span className="text-foreground/70">{translations.xpPoints[language]}</span>
                </div>

                <Button className="w-full mt-4 bg-primary hover:bg-primary/90" onClick={onClose}>
                  {translations.claim[language]}
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
