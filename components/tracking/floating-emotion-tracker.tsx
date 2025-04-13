"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Smile, Frown, Meh, AlertTriangle, Eye, X, Maximize2, Minimize2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EmotionData } from "./real-time-emotion-detector"
import { EmotionDisplay } from "./emotion-display"

interface FloatingEmotionTrackerProps {
  lastEmotionData: EmotionData | null
  onClose: () => void
  language?: "en" | "hi" | "te"
}

export function FloatingEmotionTracker({
  lastEmotionData,
  onClose,
  language = "en"
}: FloatingEmotionTrackerProps) {
  const [minimized, setMinimized] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [emotionHistory, setEmotionHistory] = useState<EmotionData[]>([])
  
  const translations = {
    title: {
      en: "Emotion Tracker",
      hi: "भावना ट्रैकर",
      te: "భావోద్వేగ ట్రాకర్",
    },
    minimize: {
      en: "Minimize",
      hi: "छोटा करें",
      te: "చిన్నదిగా చేయండి",
    },
    maximize: {
      en: "Maximize",
      hi: "बड़ा करें",
      te: "పెద్దదిగా చేయండి",
    },
    close: {
      en: "Close",
      hi: "बंद करें",
      te: "మూసివేయండి",
    },
    unknown: {
      en: "Unknown",
      hi: "अज्ञात",
      te: "తెలియదు",
    },
    outOfFrame: {
      en: "Out of frame",
      hi: "फ्रेम से बाहर",
      te: "ఫ్రేమ్ నుండి బయట",
    },
  }

  // Update emotion history when new emotion data is received
  useEffect(() => {
    if (lastEmotionData && lastEmotionData.emotion !== "unknown") {
      setEmotionHistory(prev => {
        const newHistory = [...prev, lastEmotionData]
        // Keep only the last 10 emotions
        return newHistory.slice(-10)
      })
    }
  }, [lastEmotionData])

  // Toggle minimized state
  const toggleMinimized = () => {
    setMinimized(!minimized)
  }

  // Get emotion icon
  const getEmotionIcon = (emotion: string, size = 24) => {
    switch (emotion) {
      case "happy":
        return <Smile size={size} className="text-blue-500" />
      case "sad":
        return <Frown size={size} className="text-purple-500" />
      case "confused":
        return <AlertTriangle size={size} className="text-amber-500" />
      case "bored":
        return <Meh size={size} className="text-red-500" />
      case "focused":
        return <Eye size={size} className="text-green-500" />
      default:
        return <Meh size={size} className="text-gray-500" />
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.2 }}
      className="fixed bottom-20 right-4 z-50"
      drag
      dragConstraints={{ left: -300, right: 300, top: -300, bottom: 100 }}
      dragElastic={0.1}
      dragMomentum={false}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={() => setIsDragging(false)}
      style={{ x: position.x, y: position.y }}
      onDragTransitionEnd={() => {
        setPosition({
          x: position.x,
          y: position.y
        })
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.2 }}
        className="shadow-xl rounded-lg overflow-hidden border border-border dark:border-border"
      >
        <div className="bg-card text-card-foreground dark:bg-card dark:text-card-foreground p-2 flex items-center justify-between">
          <h3 className="text-sm font-medium">{translations.title[language]}</h3>
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 text-foreground dark:text-foreground hover:bg-muted dark:hover:bg-muted" 
              onClick={toggleMinimized}
              title={minimized ? translations.maximize[language] : translations.minimize[language]}
            >
              {minimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 text-foreground dark:text-foreground hover:bg-muted dark:hover:bg-muted" 
              onClick={onClose}
            >
              <X size={14} />
            </Button>
          </div>
        </div>
        
        {minimized ? (
          <div className="p-2 flex items-center gap-2 bg-card dark:bg-card">
            <div className={`w-3 h-3 rounded-full ${lastEmotionData?.faceDetected ? 'bg-green-500' : 'bg-amber-500'}`} />
            <span className="text-xs">
              {lastEmotionData?.faceDetected ? 
                `${lastEmotionData.emotion !== "unknown" ? lastEmotionData.emotion : translations.unknown[language]}: ${Math.round(lastEmotionData.confidence)}%` : 
                translations.outOfFrame[language]
              }
            </span>
          </div>
        ) : (
          <div className="w-72">
            <EmotionDisplay 
              emotionData={lastEmotionData} 
              showHeader={false}
              showControls={false}
              language={language}
              showEmotionHistory={true}
              emotionHistory={emotionHistory}
            />
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
