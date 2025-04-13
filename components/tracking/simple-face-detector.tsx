"use client"

import { useState, useRef, useEffect } from "react"
import { Smile, AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface SimpleFaceDetectorProps {
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

export function SimpleFaceDetector({
  onEmotionDetected,
  className = "",
  autoTracking = false,
}: SimpleFaceDetectorProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDetecting, setIsDetecting] = useState(false)
  const [currentEmotion, setCurrentEmotion] = useState<Emotion>("neutral")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [faceDetected, setFaceDetected] = useState(false)
  const [confidenceScore, setConfidenceScore] = useState(50)
  const [fatigueScore, setFatigueScore] = useState(30)
  const [attentionScore, setAttentionScore] = useState(70)
  
  // Emotion rotation for demo purposes
  const emotions: Emotion[] = ["happy", "neutral", "sad", "angry", "surprised", "fearful", "disgusted"]
  const emotionTimerRef = useRef<NodeJS.Timeout | null>(null)
  const frameCountRef = useRef(0)
  
  // Start face detection
  useEffect(() => {
    if (autoTracking) {
      startCamera()
    }
    
    return () => {
      stopCamera()
      if (emotionTimerRef.current) {
        clearInterval(emotionTimerRef.current)
      }
    }
  }, [autoTracking])
  
  const startCamera = async () => {
    try {
      setIsLoading(true)
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user"
        } 
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play()
            setIsLoading(false)
            setIsDetecting(true)
            startEmotionSimulation()
          }
        }
      }
    } catch (err) {
      console.error("Error accessing camera:", err)
      setError("Could not access camera. Please check permissions.")
      setIsLoading(false)
    }
  }
  
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      const tracks = stream.getTracks()
      tracks.forEach(track => track.stop())
      videoRef.current.srcObject = null
    }
    setIsDetecting(false)
  }
  
  const startEmotionSimulation = () => {
    // For demo purposes, we'll simulate emotion detection
    // In a real app, this would use a face detection library
    
    // Simulate face detection (always detected in this demo)
    setFaceDetected(true)
    
    // Simulate changing emotions every 5-10 seconds
    emotionTimerRef.current = setInterval(() => {
      // Randomly select an emotion
      const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)]
      setCurrentEmotion(randomEmotion)
      
      // Random confidence between 60-100%
      const newConfidence = Math.floor(Math.random() * 40) + 60
      setConfidenceScore(newConfidence)
      
      // Random fatigue score that increases over time
      const timeFactor = Math.min(1, frameCountRef.current / 1000) // Increases over time
      const baseFatigue = Math.floor(Math.random() * 30) + 20
      const newFatigue = Math.min(95, baseFatigue + (timeFactor * 30))
      setFatigueScore(Math.round(newFatigue))
      
      // Random attention score that decreases over time
      const baseAttention = Math.floor(Math.random() * 30) + 60
      const newAttention = Math.max(20, baseAttention - (timeFactor * 30))
      setAttentionScore(Math.round(newAttention))
      
      frameCountRef.current += 1
      
      // Notify parent component
      if (onEmotionDetected) {
        onEmotionDetected({
          timestamp: Date.now(),
          emotion: randomEmotion,
          confidence: newConfidence / 100,
          fatigueScore: Math.round(newFatigue),
          attentionScore: Math.round(newAttention)
        })
      }
    }, 5000) // Change emotion every 5 seconds
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
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-[240px] w-[320px] bg-muted rounded-lg">
              <RefreshCw size={32} className="text-primary animate-spin mb-2" />
              <p className="text-sm text-center">Starting camera...</p>
            </div>
          ) : (
            <div className="relative">
              <video
                ref={videoRef}
                width={320}
                height={240}
                className="rounded-lg"
                muted
                playsInline
              />
              <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 z-10"
                width={320}
                height={240}
              />
              
              {/* Overlay emotion icon */}
              {isDetecting && faceDetected && (
                <div className="absolute bottom-2 right-2 bg-white/80 rounded-full p-2 text-2xl">
                  {getEmotionIcon()}
                </div>
              )}
            </div>
          )}
          
          {error && (
            <div className="mt-4 p-3 bg-destructive/10 text-destructive rounded-md flex items-center">
              <AlertCircle size={16} className="mr-2" />
              {error}
            </div>
          )}
          
          {isDetecting && faceDetected && (
            <div className="mt-4 w-full">
              <div className="flex justify-between mb-1">
                <span className="text-sm">Current emotion:</span>
                <span className="text-sm font-medium flex items-center">
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
            </div>
          )}
          
          {!autoTracking && (
            <div className="mt-4 flex gap-2">
              {!isDetecting ? (
                <Button onClick={startCamera} className="w-full">
                  Start Detection
                </Button>
              ) : (
                <Button onClick={stopCamera} variant="outline" className="w-full">
                  Stop Detection
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
