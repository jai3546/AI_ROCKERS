"use client"

import { useState, useRef, useEffect } from "react"
import { Smile, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface DemoEmotionDetectorProps {
  onEmotionDetected?: (emotionData: EmotionData) => void
  className?: string
  autoTracking?: boolean
}

export interface EmotionData {
  timestamp: number
  emotion: Emotion
  confidence: number
  fatigueScore?: number
  attentionScore?: number
}

export type Emotion = "happy" | "sad" | "angry" | "surprised" | "neutral" | "fearful" | "disgusted" | "none"

export function DemoEmotionDetector({
  onEmotionDetected,
  className = "",
  autoTracking = false,
}: DemoEmotionDetectorProps) {
  const [isActive, setIsActive] = useState(autoTracking)
  const [currentEmotion, setCurrentEmotion] = useState<Emotion>("neutral")
  const [confidenceScore, setConfidenceScore] = useState(75)
  const [fatigueScore, setFatigueScore] = useState(30)
  const [attentionScore, setAttentionScore] = useState(70)

  // Emotion rotation for demo purposes
  const emotions: Emotion[] = ["happy", "neutral", "sad", "angry", "surprised", "fearful", "disgusted"]
  const emotionTimerRef = useRef<NodeJS.Timeout | null>(null)
  const sessionStartTimeRef = useRef(Date.now())

  // Start emotion simulation when component mounts or autoTracking changes
  useEffect(() => {
    if (autoTracking) {
      startEmotionSimulation()
      setIsActive(true)
    } else {
      stopEmotionSimulation()
      setIsActive(false)
    }

    return () => {
      stopEmotionSimulation()
    }
  }, [autoTracking])

  const startEmotionSimulation = () => {
    // Reset session start time
    sessionStartTimeRef.current = Date.now()

    // Immediately send first emotion - use happy for better visibility
    const initialEmotion = "happy"
    setCurrentEmotion(initialEmotion)
    notifyEmotionChange(initialEmotion, 0.9, 20, 90)

    // Start emotion rotation
    emotionTimerRef.current = setInterval(() => {
      // Calculate session duration in minutes
      const sessionDurationMinutes = (Date.now() - sessionStartTimeRef.current) / 60000

      // Randomly select an emotion with higher probability for neutral and happy
      let randomEmotion: Emotion
      const rand = Math.random()
      if (rand < 0.4) {
        randomEmotion = "neutral"
      } else if (rand < 0.7) {
        randomEmotion = "happy"
      } else {
        // Random from other emotions
        const otherEmotions = emotions.filter(e => e !== "neutral" && e !== "happy")
        randomEmotion = otherEmotions[Math.floor(Math.random() * otherEmotions.length)]
      }

      setCurrentEmotion(randomEmotion)

      // Random confidence between 60-95%
      const newConfidence = Math.floor(Math.random() * 35) + 60
      setConfidenceScore(newConfidence)

      // Fatigue increases over time
      const baseFatigue = 20
      const timeFactor = Math.min(1, sessionDurationMinutes / 30) // Increases over 30 minutes
      const newFatigue = Math.min(95, baseFatigue + (timeFactor * 60))
      setFatigueScore(Math.round(newFatigue))

      // Attention decreases over time
      const baseAttention = 90
      const newAttention = Math.max(30, baseAttention - (timeFactor * 50))
      setAttentionScore(Math.round(newAttention))

      // Notify parent component
      notifyEmotionChange(
        randomEmotion,
        newConfidence / 100,
        Math.round(newFatigue),
        Math.round(newAttention)
      )
    }, 4000) // Change emotion every 4 seconds for more responsiveness
  }

  const stopEmotionSimulation = () => {
    if (emotionTimerRef.current) {
      clearInterval(emotionTimerRef.current)
      emotionTimerRef.current = null
    }
  }

  const notifyEmotionChange = (
    emotion: Emotion,
    confidence: number,
    fatigue: number,
    attention: number
  ) => {
    if (onEmotionDetected) {
      onEmotionDetected({
        timestamp: Date.now(),
        emotion: emotion,
        confidence: confidence,
        fatigueScore: fatigue,
        attentionScore: attention
      })
    }
  }

  const handleToggle = () => {
    if (isActive) {
      stopEmotionSimulation()
      setIsActive(false)
    } else {
      startEmotionSimulation()
      setIsActive(true)
    }
  }

  // Get emotion icon
  const getEmotionIcon = () => {
    switch (currentEmotion) {
      case "happy":
        return "😊"
      case "sad":
        return "😢"
      case "angry":
        return "😠"
      case "surprised":
        return "😲"
      case "fearful":
        return "😨"
      case "disgusted":
        return "🤢"
      case "neutral":
        return "😐"
      default:
        return "❓"
    }
  }

  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardHeader className="bg-primary/10 pb-2">
        <CardTitle className="flex items-center gap-2 text-primary">
          <Smile size={18} />
          Emotion Detector
        </CardTitle>
      </CardHeader>

      <CardContent className="p-4">
        <div className="flex flex-col items-center">
          <div className="bg-gray-100 rounded-lg w-full aspect-video flex flex-col items-center justify-center mb-4">
            <div className="text-6xl animate-pulse">
              {getEmotionIcon()}
            </div>
            <p className="text-sm text-gray-500 mt-2">Emotion detection active</p>
            <p className="text-xs text-gray-400">No camera access required</p>
          </div>

          {isActive && (
            <div className="w-full">
              <div className="flex justify-between mb-1">
                <span className="text-sm">Current emotion:</span>
                <span className="text-sm font-medium flex items-center gap-1">
                  {getEmotionIcon()} {currentEmotion}
                </span>
              </div>

              <div className="flex justify-between mb-1">
                <span className="text-sm">Confidence:</span>
                <span className="text-sm font-medium">{confidenceScore}%</span>
              </div>

              <div className="w-full bg-muted rounded-full h-2.5 mb-4">
                <div
                  className="bg-primary h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${confidenceScore}%` }}
                />
              </div>

              {/* Fatigue Score */}
              <div className="flex justify-between mb-1">
                <span className="text-sm">Fatigue level:</span>
                <span className="text-sm font-medium">{fatigueScore}%</span>
              </div>

              <div className="w-full bg-muted rounded-full h-2.5 mb-4">
                <div
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    fatigueScore > 70 ? 'bg-destructive' : fatigueScore > 40 ? 'bg-amber-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${fatigueScore}%` }}
                />
              </div>

              {/* Attention Score */}
              <div className="flex justify-between mb-1">
                <span className="text-sm">Attention level:</span>
                <span className="text-sm font-medium">{attentionScore}%</span>
              </div>

              <div className="w-full bg-muted rounded-full h-2.5 mb-4">
                <div
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    attentionScore < 30 ? 'bg-destructive' : attentionScore < 60 ? 'bg-amber-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${attentionScore}%` }}
                />
              </div>

              <div className="text-xs text-muted-foreground mt-2">
                {currentEmotion === 'sad' && "You seem sad. Would you like some encouragement?"}
                {currentEmotion === 'angry' && "You appear frustrated. Need help with something?"}
                {currentEmotion === 'fearful' && "You seem anxious. Let's break things down."}
                {currentEmotion === 'happy' && "You're in a great mood! Perfect time for learning."}
                {currentEmotion === 'neutral' && "You seem focused and ready to learn."}
              </div>
            </div>
          )}

          {!autoTracking && (
            <Button
              onClick={handleToggle}
              variant={isActive ? "outline" : "default"}
              className="mt-4 w-full"
            >
              {isActive ? "Stop Emotion Detection" : "Start Emotion Detection"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
