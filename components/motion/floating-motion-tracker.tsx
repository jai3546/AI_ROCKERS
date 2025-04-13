"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X, MinusCircle, Maximize2, Minimize2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ReliableMotionDetector, type MotionData } from './reliable-motion-detector'

interface FloatingMotionTrackerProps {
  onClose: () => void
  onMotionDetected?: (data: MotionData) => void
  language?: 'en' | 'hi' | 'te'
  autoTracking?: boolean
}

const translations = {
  title: {
    en: "Motion Tracking",
    hi: "गति ट्रैकिंग",
    te: "మోషన్ ట్రాకింగ్",
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
  outOfFrame: {
    en: "You are out of frame!",
    hi: "आप फ्रेम से बाहर हैं!",
    te: "మీరు ఫ్రేమ్ నుండి బయటకు వెళ్లారు!",
  },
  returnToFrame: {
    en: "Please return to the frame",
    hi: "कृपया फ्रेम में वापस आएं",
    te: "దయచేసి ఫ్రేమ్‌కి తిరిగి రండి",
  },
}

export function FloatingMotionTracker({
  onClose,
  onMotionDetected,
  language = "en",
  autoTracking = true,
}: FloatingMotionTrackerProps) {
  const [minimized, setMinimized] = useState(false)
  const [outOfFrameTime, setOutOfFrameTime] = useState<number | null>(null)
  const [showWarning, setShowWarning] = useState(false)
  const [lastMotionData, setLastMotionData] = useState<MotionData | null>(null)

  // Initialize with default data
  useEffect(() => {
    // Set initial state
    setLastMotionData({
      inFrame: true,
      confidence: 90,
      timestamp: new Date(),
      message: "Please stay in frame"
    })
  }, [])

  // Handle motion detection
  const handleMotionDetected = (data: MotionData) => {
    setLastMotionData(data)

    // Track time out of frame
    if (!data.inFrame) {
      if (outOfFrameTime === null) {
        setOutOfFrameTime(Date.now())
      }

      // Show warning after 3 seconds out of frame
      if (outOfFrameTime && Date.now() - outOfFrameTime > 3000) {
        setShowWarning(true)
      }
    } else {
      setOutOfFrameTime(null)
      setShowWarning(false)
    }

    // Pass data to parent component
    if (onMotionDetected) {
      onMotionDetected(data)
    }
  }

  // Toggle minimized state
  const toggleMinimized = () => {
    setMinimized(prev => !prev)
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <AnimatePresence>
        {showWarning && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            className="mb-2 p-3 bg-destructive text-destructive-foreground dark:bg-destructive/90 dark:text-destructive-foreground rounded-lg shadow-lg flex items-center gap-2"
          >
            <AlertTriangle size={16} />
            <div className="flex-1">
              <p className="font-medium text-sm">{translations.outOfFrame[language]}</p>
              <p className="text-xs opacity-90">{translations.returnToFrame[language]}</p>
            </div>
            <Button
              variant="destructive"
              size="icon"
              className="h-6 w-6 bg-destructive-foreground/20 hover:bg-destructive-foreground/30 text-destructive-foreground"
              onClick={() => setShowWarning(false)}
            >
              <X size={12} />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.2 }}
        className="shadow-xl rounded-lg overflow-hidden border border-border dark:border-border"
      >
        <div className="bg-primary/10 dark:bg-primary/20 text-card-foreground dark:text-card-foreground p-3 flex items-center justify-between border-b border-border">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${lastMotionData?.inFrame ? 'bg-green-500 animate-pulse' : 'bg-red-500 animate-pulse'}`}></div>
            {translations.title[language]}
          </h3>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-foreground dark:text-foreground hover:bg-muted dark:hover:bg-muted"
              onClick={toggleMinimized}
              title={minimized ? translations.maximize[language] : translations.minimize[language]}
            >
              {minimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-foreground dark:text-foreground hover:bg-muted dark:hover:bg-muted"
              onClick={onClose}
            >
              <X size={14} />
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {!minimized && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <ReliableMotionDetector
                onMotionDetected={handleMotionDetected}
                autoTracking={autoTracking}
                language={language}
                compact={true}
                className="border-0 shadow-none"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {minimized && lastMotionData && (
          <div className="p-2 flex items-center gap-2 bg-card dark:bg-card">
            <div className={`w-3 h-3 rounded-full ${lastMotionData.inFrame ? 'bg-green-500' : 'bg-amber-500'}`} />
            <span className="text-xs">
              {lastMotionData.inFrame ?
                `${translations.title[language]}: ${Math.round(lastMotionData.confidence)}%` :
                translations.outOfFrame[language]
              }
            </span>
          </div>
        )}
      </motion.div>
    </div>
  )
}
