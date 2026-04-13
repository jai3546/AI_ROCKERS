"use client"

import { useState, useEffect } from "react"
import { Smile, Frown, Meh, AlertTriangle, Activity, Brain } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { type EmotionState } from "@/services/gemini-api"

interface EmotionStatusIndicatorProps {
  emotionState?: EmotionState
  className?: string
}

export function EmotionStatusIndicator({
  emotionState,
  className = ""
}: EmotionStatusIndicatorProps) {
  const [visible, setVisible] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  // Show indicator when emotion state changes
  useEffect(() => {
    if (emotionState) {
      setVisible(true)
      // Keep visible longer and don't auto-hide for important emotions
      const isImportantEmotion = ['sad', 'angry', 'fearful'].includes(emotionState.emotion);

      // Auto-hide after longer time if not interacted with (except for important emotions)
      if (!isImportantEmotion) {
        const timer = setTimeout(() => {
          if (!showDetails) {
            setVisible(false)
          }
        }, 20000) // Increased from 10s to 20s

        return () => clearTimeout(timer)
      }
    }
  }, [emotionState, showDetails])

  if (!emotionState || !visible) return null

  // Get emotion icon
  const getEmotionIcon = () => {
    switch (emotionState.emotion) {
      case 'happy':
        return <Smile className="text-green-500" />
      case 'sad':
        return <Frown className="text-blue-500" />
      case 'angry':
        return <Frown className="text-red-500" />
      case 'fearful':
        return <AlertTriangle className="text-amber-500" />
      case 'surprised':
        return <Smile className="text-purple-500" />
      case 'disgusted':
        return <Frown className="text-orange-500" />
      default:
        return <Meh className="text-gray-500" />
    }
  }

  // Get emotion color
  const getEmotionColor = () => {
    switch (emotionState.emotion) {
      case 'happy':
        return 'border-l-green-500'
      case 'sad':
        return 'border-l-blue-500'
      case 'angry':
        return 'border-l-red-500'
      case 'fearful':
        return 'border-l-amber-500'
      case 'surprised':
        return 'border-l-purple-500'
      case 'disgusted':
        return 'border-l-orange-500'
      default:
        return 'border-l-gray-500'
    }
  }

  // Get fatigue level text
  const getFatigueLevel = () => {
    const score = emotionState.fatigueScore || 0
    if (score > 75) return 'High'
    if (score > 50) return 'Moderate'
    if (score > 25) return 'Low'
    return 'None'
  }

  // Get attention level text
  const getAttentionLevel = () => {
    const score = emotionState.attentionScore || 100
    if (score > 75) return 'High'
    if (score > 50) return 'Moderate'
    if (score > 25) return 'Low'
    return 'Very Low'
  }

  return (
    <AnimatePresence mode="wait">
      {visible && (
        <motion.div
          key="emotion-indicator"
          initial={{ opacity: 0, x: 50 }}
          animate={{
            opacity: 1,
            x: 0,
            transition: {
              type: "spring",
              stiffness: 300,
              damping: 20
            }
          }}
          exit={{ opacity: 0, x: 50 }}
          className={`fixed top-20 right-4 z-40 ${className}`}
        >
        <Card
          className={`w-64 shadow-lg border-l-4 cursor-pointer overflow-hidden ${getEmotionColor()} animate-pulse`}
          onClick={() => setShowDetails(!showDetails)}
        >
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getEmotionIcon()}
                <span className="font-medium capitalize">{emotionState.emotion}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>

            <AnimatePresence>
              {showDetails && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-3 space-y-2 overflow-hidden"
                >
                  {emotionState.fatigueScore !== undefined && (
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center gap-1 text-xs">
                          <Activity size={12} />
                          <span>Fatigue Level: {getFatigueLevel()}</span>
                        </div>
                        <span className="text-xs">{emotionState.fatigueScore}%</span>
                      </div>
                      <Progress
                        value={emotionState.fatigueScore}
                        className="h-1.5"
                        indicatorClassName={emotionState.fatigueScore > 70 ? 'bg-red-500' :
                                           emotionState.fatigueScore > 40 ? 'bg-amber-500' : 'bg-green-500'}
                      />
                    </div>
                  )}

                  {emotionState.attentionScore !== undefined && (
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center gap-1 text-xs">
                          <Brain size={12} />
                          <span>Attention Level: {getAttentionLevel()}</span>
                        </div>
                        <span className="text-xs">{emotionState.attentionScore}%</span>
                      </div>
                      <Progress
                        value={emotionState.attentionScore}
                        className="h-1.5"
                        indicatorClassName={emotionState.attentionScore < 30 ? 'bg-red-500' :
                                           emotionState.attentionScore < 60 ? 'bg-amber-500' : 'bg-green-500'}
                      />
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground mt-2">
                    {emotionState.emotion === 'sad' && "You seem sad. Would you like some encouragement?"}
                    {emotionState.emotion === 'angry' && "You appear frustrated. Need help with something?"}
                    {emotionState.emotion === 'fearful' && "You seem anxious. Let's break things down."}
                    {emotionState.emotion === 'happy' && "You're in a great mood! Perfect time for learning."}
                    {emotionState.emotion === 'neutral' && "You seem focused and ready to learn."}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
      )}
    </AnimatePresence>
  )
}
