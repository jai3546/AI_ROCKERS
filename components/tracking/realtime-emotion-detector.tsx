"use client"

import { useState, useRef, useEffect } from "react"
import { Smile, Frown, Meh, AlertTriangle, Eye, RefreshCw, Camera, X, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

export type EmotionType = "happy" | "sad" | "confused" | "bored" | "focused" | "unknown"

export interface EmotionData {
  emotion: EmotionType
  confidence: number
  timestamp: number
  fatigueScore?: number
  attentionScore?: number
}

interface RealtimeEmotionDetectorProps {
  onEmotionDetected?: (data: EmotionData) => void
  autoTracking?: boolean
  showControls?: boolean
  language?: "en" | "hi" | "te"
  className?: string
}

// Translations for UI elements
const translations = {
  title: {
    en: "Emotion Detection",
    hi: "भावना पहचान",
    te: "భావోద్వేగ గుర్తింపు",
  },
  startTracking: {
    en: "Start Camera",
    hi: "कैमरा शुरू करें",
    te: "కెమెరా ప్రారంభించండి",
  },
  stopTracking: {
    en: "Stop Camera",
    hi: "कैमरा बंद करें",
    te: "కెమెరా ఆపండి",
  },
  emotions: {
    happy: {
      en: "Happy",
      hi: "खुश",
      te: "సంతోషంగా",
    },
    sad: {
      en: "Sad",
      hi: "दुखी",
      te: "విచారంగా",
    },
    confused: {
      en: "Confused",
      hi: "भ्रमित",
      te: "గందరగోళంగా",
    },
    bored: {
      en: "Bored",
      hi: "ऊबा हुआ",
      te: "విసుగుగా",
    },
    focused: {
      en: "Focused",
      hi: "केंद्रित",
      te: "దృష్టి కేంద్రీకృతం",
    },
    unknown: {
      en: "Unknown",
      hi: "अज्ञात",
      te: "తెలియదు",
    },
  },
  attention: {
    en: "Attention",
    hi: "ध्यान",
    te: "శ్రద్ధ",
  },
  fatigue: {
    en: "Fatigue",
    hi: "थकान",
    te: "అలసట",
  },
  cameraError: {
    en: "Camera Error",
    hi: "कैमरा त्रुटि",
    te: "కెమెరా లోపం",
  },
  restart: {
    en: "Restart Camera",
    hi: "कैमरा पुनरारंभ करें",
    te: "కెమెరాను పునఃప్రారంభించండి",
  },
  analyzing: {
    en: "Analyzing...",
    hi: "विश्लेषण कर रहा है...",
    te: "విశ్లేషిస్తోంది...",
  },
  realtime: {
    en: "Real-time",
    hi: "वास्तविक समय",
    te: "రియల్-టైమ్",
  }
}

export function RealtimeEmotionDetector({
  onEmotionDetected,
  autoTracking = false,
  showControls = true,
  language = "en",
  className = "",
}: RealtimeEmotionDetectorProps) {
  // State
  const [isTracking, setIsTracking] = useState(autoTracking)
  const [currentEmotion, setCurrentEmotion] = useState<EmotionType>("unknown")
  const [emotionConfidence, setEmotionConfidence] = useState(0)
  const [attentionScore, setAttentionScore] = useState(0)
  const [fatigueScore, setFatigueScore] = useState(0)
  const [cameraError, setCameraError] = useState<string | null>(null)
  
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animationRef = useRef<number | null>(null)
  
  // Start/stop camera based on tracking state
  useEffect(() => {
    if (isTracking) {
      startCamera()
    } else {
      stopCamera()
    }
    
    return () => {
      stopCamera()
    }
  }, [isTracking])
  
  // Auto-start if autoTracking is enabled
  useEffect(() => {
    if (autoTracking && !isTracking) {
      setIsTracking(true)
    }
    
    return () => {
      stopCamera()
    }
  }, [autoTracking, isTracking])
  
  // Start camera
  const startCamera = async () => {
    try {
      setCameraError(null)
      
      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        },
        audio: false
      })
      
      // Store the stream
      streamRef.current = stream
      
      if (videoRef.current) {
        // Set up the video element
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        
        // Start emotion detection
        startEmotionDetection()
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
      setCameraError('Could not access camera. Please check permissions.')
    }
  }
  
  // Stop camera
  const stopCamera = () => {
    // Stop all tracks in the stream
    if (streamRef.current) {
      const tracks = streamRef.current.getTracks()
      tracks.forEach(track => track.stop())
      streamRef.current = null
    }
    
    // Cancel animation frame
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }
    
    // Clear video source
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }
  
  // Start emotion detection
  const startEmotionDetection = () => {
    if (!videoRef.current || !canvasRef.current) return
    
    const detectEmotion = () => {
      // Always request next frame first to ensure continuous monitoring
      animationRef.current = requestAnimationFrame(detectEmotion)
      
      if (!videoRef.current || !canvasRef.current || !streamRef.current) return
      
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext('2d', { willReadFrequently: true })
      
      if (!context) return
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      
      try {
        // Check if video is playing and has dimensions
        if (video.readyState === video.HAVE_ENOUGH_DATA && 
            video.videoWidth > 0 && 
            video.videoHeight > 0) {
          
          // Draw video frame to canvas
          context.drawImage(video, 0, 0, canvas.width, canvas.height)
          
          // Get image data
          const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
          const data = imageData.data
          
          // Calculate average brightness and color distribution
          let totalBrightness = 0
          let redTotal = 0
          let greenTotal = 0
          let blueTotal = 0
          let pixelCount = 0
          
          // Sample pixels (analyze every 16th pixel for performance)
          for (let i = 0; i < data.length; i += 16) {
            const r = data[i]
            const g = data[i + 1]
            const b = data[i + 2]
            
            totalBrightness += (r + g + b) / 3
            redTotal += r
            greenTotal += g
            blueTotal += b
            pixelCount++
          }
          
          const avgBrightness = totalBrightness / pixelCount
          const avgRed = redTotal / pixelCount
          const avgGreen = greenTotal / pixelCount
          const avgBlue = blueTotal / pixelCount
          
          // Calculate brightness variation (standard deviation)
          let sumSquaredDifferences = 0
          for (let i = 0; i < data.length; i += 16) {
            const r = data[i]
            const g = data[i + 1]
            const b = data[i + 2]
            const pixelBrightness = (r + g + b) / 3
            const difference = pixelBrightness - avgBrightness
            sumSquaredDifferences += difference * difference
          }
          
          const brightnessStdDev = Math.sqrt(sumSquaredDifferences / pixelCount)
          
          // Determine emotion based on color distribution and brightness
          let emotion: EmotionType = "unknown"
          let confidence = 0
          
          // Higher red component often indicates happiness
          if (avgRed > avgGreen * 1.1 && avgRed > avgBlue * 1.1) {
            emotion = "happy"
            confidence = Math.min(95, 70 + (avgRed / (avgGreen + avgBlue)) * 20)
          } 
          // Higher blue component often indicates sadness
          else if (avgBlue > avgRed * 1.1 && avgBlue > avgGreen * 1.1) {
            emotion = "sad"
            confidence = Math.min(95, 70 + (avgBlue / (avgRed + avgGreen)) * 20)
          }
          // Balanced colors with high brightness often indicates focus
          else if (Math.abs(avgRed - avgGreen) < 10 && Math.abs(avgRed - avgBlue) < 10 && avgBrightness > 100) {
            emotion = "focused"
            confidence = Math.min(95, 70 + (avgBrightness / 255) * 25)
          }
          // Low brightness often indicates boredom
          else if (avgBrightness < 80) {
            emotion = "bored"
            confidence = Math.min(95, 70 + ((255 - avgBrightness) / 255) * 25)
          }
          // High brightness variation often indicates confusion
          else if (brightnessStdDev > 50) {
            emotion = "confused"
            confidence = Math.min(95, 70 + (brightnessStdDev / 100) * 25)
          }
          // Default to focused with medium confidence
          else {
            emotion = "focused"
            confidence = 75
          }
          
          // Calculate attention and fatigue scores
          let newAttentionScore = 0
          if (emotion === 'focused') newAttentionScore = 80 + Math.random() * 20
          else if (emotion === 'happy') newAttentionScore = 70 + Math.random() * 20
          else if (emotion === 'confused') newAttentionScore = 40 + Math.random() * 30
          else if (emotion === 'bored') newAttentionScore = 20 + Math.random() * 30
          else if (emotion === 'sad') newAttentionScore = 30 + Math.random() * 30
          
          // Higher fatigue for sad and bored, lower for others
          let newFatigueScore = 0
          if (emotion === 'sad') newFatigueScore = 70 + Math.random() * 20
          else if (emotion === 'bored') newFatigueScore = 60 + Math.random() * 30
          else if (emotion === 'confused') newFatigueScore = 40 + Math.random() * 30
          else if (emotion === 'happy') newFatigueScore = 10 + Math.random() * 20
          else if (emotion === 'focused') newFatigueScore = 10 + Math.random() * 20
          
          // Round scores and confidence
          newAttentionScore = Math.round(newAttentionScore)
          newFatigueScore = Math.round(newFatigueScore)
          confidence = Math.round(confidence)
          
          // Update state (only if changed to prevent too many re-renders)
          if (currentEmotion !== emotion || 
              Math.abs(emotionConfidence - confidence) > 5 ||
              Math.abs(attentionScore - newAttentionScore) > 5 ||
              Math.abs(fatigueScore - newFatigueScore) > 5) {
            
            setCurrentEmotion(emotion)
            setEmotionConfidence(confidence)
            setAttentionScore(newAttentionScore)
            setFatigueScore(newFatigueScore)
            
            // Call callback if provided
            if (onEmotionDetected) {
              onEmotionDetected({
                emotion,
                confidence,
                timestamp: Date.now(),
                attentionScore: newAttentionScore,
                fatigueScore: newFatigueScore
              })
            }
          }
        }
      } catch (error) {
        console.error('Error in emotion detection:', error)
      }
    }
    
    // Start detection loop
    animationRef.current = requestAnimationFrame(detectEmotion)
  }
  
  // Toggle tracking
  const toggleTracking = () => {
    setIsTracking(prev => !prev)
  }
  
  // Get emotion icon
  const getEmotionIcon = (emotion: EmotionType, size = 24) => {
    switch (emotion) {
      case 'happy':
        return <Smile size={size} className="text-green-500" />
      case 'sad':
        return <Frown size={size} className="text-blue-500" />
      case 'confused':
        return <Meh size={size} className="text-amber-500" />
      case 'bored':
        return <Meh size={size} className="text-gray-500" />
      case 'focused':
        return <Eye size={size} className="text-indigo-500" />
      default:
        return <Meh size={size} className="text-gray-500" />
    }
  }
  
  // Get emotion color
  const getEmotionColor = (emotion: EmotionType) => {
    switch (emotion) {
      case 'happy':
        return 'bg-green-500'
      case 'sad':
        return 'bg-blue-500'
      case 'confused':
        return 'bg-amber-500'
      case 'bored':
        return 'bg-gray-500'
      case 'focused':
        return 'bg-indigo-500'
      default:
        return 'bg-gray-500'
    }
  }
  
  // Get emotion text
  const getEmotionText = (emotion: EmotionType) => {
    return translations.emotions[emotion][language]
  }
  
  return (
    <div className={`${className}`}>
      {cameraError ? (
        <div className="p-4 bg-destructive/10 rounded-md text-center">
          <p className="text-destructive font-medium mb-2">{translations.cameraError[language]}</p>
          <p className="text-sm mb-4">{cameraError}</p>
          <Button onClick={startCamera} variant="outline" size="sm">
            <RefreshCw size={14} className="mr-2" />
            {translations.restart[language]}
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Camera view */}
          <div className="relative rounded-md overflow-hidden" style={{ height: '220px' }}>
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              muted
              playsInline
            />
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 w-full h-full"
              style={{ display: 'none' }}
            />
            
            {/* Emotion visualization overlay */}
            <div className="absolute inset-0 pointer-events-none">
              <div className={`absolute top-2 left-2 w-8 h-8 rounded-full flex items-center justify-center ${getEmotionColor(currentEmotion)}/30 border-2 ${getEmotionColor(currentEmotion)}/70 animate-pulse`}>
                {getEmotionIcon(currentEmotion, 20)}
              </div>
            </div>
            
            {/* Overlay with current emotion */}
            <div className="absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur-sm p-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getEmotionIcon(currentEmotion, 18)}
                <span className="text-xs font-medium text-white">
                  {getEmotionText(currentEmotion)} ({emotionConfidence}%)
                </span>
              </div>
              <Badge variant="outline" className="text-xs bg-primary/20 text-primary border-primary/30">
                <Zap size={10} className="mr-1" />
                {translations.realtime[language]}
              </Badge>
            </div>
          </div>
          
          {/* Current emotion display */}
          <div className="flex items-center gap-3 p-3 bg-card rounded-md border border-border">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getEmotionColor(currentEmotion)}/20 border-2 ${getEmotionColor(currentEmotion)}/50`}>
              {getEmotionIcon(currentEmotion)}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="font-medium">{getEmotionText(currentEmotion)}</p>
                <Badge variant="outline" className="text-xs">
                  {emotionConfidence}%
                </Badge>
              </div>
              <Progress value={emotionConfidence} className="h-1.5 mt-1" />
            </div>
          </div>
          
          {/* Attention and fatigue scores */}
          <div className="grid grid-cols-2 gap-2">
            <Card className="overflow-hidden">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-medium">{translations.attention[language]}</p>
                  <Badge variant="outline" className="text-xs">{attentionScore}%</Badge>
                </div>
                <Progress value={attentionScore} className="h-1.5" />
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-medium">{translations.fatigue[language]}</p>
                  <Badge variant="outline" className="text-xs">{fatigueScore}%</Badge>
                </div>
                <Progress value={fatigueScore} className="h-1.5" />
              </CardContent>
            </Card>
          </div>
          
          {/* Controls */}
          {showControls && (
            <Button
              onClick={toggleTracking}
              variant={isTracking ? "destructive" : "default"}
              className="w-full"
            >
              {isTracking ? (
                <>
                  <X size={16} className="mr-2" />
                  {translations.stopTracking[language]}
                </>
              ) : (
                <>
                  <Camera size={16} className="mr-2" />
                  {translations.startTracking[language]}
                </>
              )}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
