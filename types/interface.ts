import { BadgeCategory, BadgeType, Emotion, EmotionType } from "@/types/types"

export interface AchievementBadgeProps {
  type: BadgeType
  category: BadgeCategory
  name: string
  description: string
  xpReward: number
  isUnlocked: boolean
  subject?: string
  onClick?: () => void
}

export interface MotionData {
  inFrame: boolean
  confidence: number
  timestamp: Date
  message?: string
  gesture?: string
  focusScore?: number
  posture?: 'good' | 'slouching' | 'tooClose' | 'tooFar' | 'unknown'
  attentionMap?: number
  movementLevel?: 'low' | 'medium' | 'high'
  motionScore?: number
  direction?: "left" | "right" | "up" | "down" | "none"
  personDetected?: boolean
}

export interface MotionDetectorProps {
  onMotionDetected?: (data: MotionData) => void
  autoTracking?: boolean
  className?: string
  language?: 'en' | 'hi' | 'te'
  compact?: boolean
}

export interface MotionTrackerProps {
  onMotionDetected?: (motionData: MotionData2) => void
  className?: string
}

export interface MotionData2 {
  timestamp: number
  motionScore: number
  direction: "left" | "right" | "up" | "down" | "none"
  personDetected: boolean
}

export interface DemoEmotionDetectorProps {
  onEmotionDetected?: (emotionData: EmotionData) => void
  className?: string
  autoTracking?: boolean
}

export interface EmotionData {
  timestamp: number
  emotion: EmotionType
  confidence: number
  fatigueScore?: number
  attentionScore?: number
  message?: string
  faceDetected?: boolean
  lightingQuality?: "good" | "poor" | "unknown"
}

export interface SimpleFaceDetectorProps {
  onEmotionDetected?: (emotionData: EmotionData) => void
  className?: string
  autoTracking?: boolean
}


export interface ImprovedEmotionDetectorProps {
  onEmotionDetected?: (data: EmotionData) => void
  autoTracking?: boolean
  showControls?: boolean
  language?: "en" | "hi" | "te"
  className?: string
  showCamera?: boolean
}
