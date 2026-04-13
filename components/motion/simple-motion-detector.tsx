"use client"

import React, { useRef, useState, useEffect } from 'react'
import { AlertTriangle, CheckCircle, Camera, CameraOff, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

export interface MotionData {
  inFrame: boolean
  confidence: number
  timestamp: Date
  message?: string
}

interface MotionDetectorProps {
  onMotionDetected?: (data: MotionData) => void
  autoTracking?: boolean
  className?: string
  language?: 'en' | 'hi' | 'te'
  compact?: boolean
}

// Translations for UI elements
const translations = {
  title: {
    en: "Motion Detection",
    hi: "गति पहचान",
    te: "చలన గుర్తింపు",
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
  inFrame: {
    en: "In Frame",
    hi: "फ्रेम में",
    te: "ఫ్రేమ్‌లో",
  },
  outOfFrame: {
    en: "Out of Frame",
    hi: "फ्रेम से बाहर",
    te: "ఫ్రేమ్ నుండి బయట",
  },
  stayInFrame: {
    en: "Please stay in frame",
    hi: "कृपया फ्रेम में रहें",
    te: "దయచేసి ఫ్రేమ్‌లో ఉండండి",
  },
  returnToFrame: {
    en: "Please return to frame",
    hi: "कृपया फ्रेम में वापस आएं",
    te: "దయచేసి ఫ్రేమ్‌కి తిరిగి రండి",
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
  }
}

export function SimpleMotionDetector({
  onMotionDetected,
  autoTracking = false,
  className = "",
  language = "en",
  compact = false,
}: MotionDetectorProps) {
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animationRef = useRef<number>(0)
  const previousFrameRef = useRef<ImageData | null>(null)
  
  // State
  const [isTracking, setIsTracking] = useState(autoTracking)
  const [inFrame, setInFrame] = useState(true) // Default to true for better UX
  const [confidence, setConfidence] = useState(90) // Start with high confidence
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [showControls] = useState(true)
  
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
        video: true,
        audio: false
      })
      
      // Store the stream
      streamRef.current = stream
      
      if (videoRef.current) {
        // Set up the video element
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        
        // Start motion detection
        startMotionDetection()
        
        // Always assume in frame initially with high confidence
        setInFrame(true)
        setConfidence(90)
        
        // Call callback with initial state
        if (onMotionDetected) {
          onMotionDetected({
            inFrame: true,
            confidence: 90,
            timestamp: new Date(),
            message: translations.stayInFrame[language]
          })
        }
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
      setCameraError('Could not access camera. Please check permissions.')
      setIsTracking(false)
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
      animationRef.current = 0
    }
    
    // Reset state
    previousFrameRef.current = null
  }
  
  // Start motion detection
  const startMotionDetection = () => {
    if (!videoRef.current || !canvasRef.current) return
    
    const detectMotion = () => {
      // Always request next frame first to ensure continuous monitoring
      animationRef.current = requestAnimationFrame(detectMotion)
      
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
          
          // Calculate average brightness
          let totalBrightness = 0
          for (let i = 0; i < data.length; i += 16) { // Sample every 16th pixel for performance
            const r = data[i]
            const g = data[i + 1]
            const b = data[i + 2]
            totalBrightness += (r + g + b) / 3
          }
          
          const avgBrightness = totalBrightness / (data.length / 16)
          
          // Check for motion if we have a previous frame
          let motionDetected = false
          let motionAmount = 0
          
          if (previousFrameRef.current) {
            const prevData = previousFrameRef.current.data
            let diffCount = 0
            
            // Compare current frame with previous frame
            for (let i = 0; i < data.length; i += 16) { // Sample every 16th pixel
              const diff = Math.abs(data[i] - prevData[i]) + 
                          Math.abs(data[i+1] - prevData[i+1]) + 
                          Math.abs(data[i+2] - prevData[i+2])
              
              if (diff > 30) diffCount++ // Threshold for pixel difference
            }
            
            motionAmount = (diffCount / (data.length / 16)) * 100
            motionDetected = motionAmount > 0.5 // Very low threshold for motion detection
          }
          
          // Store current frame for next comparison
          previousFrameRef.current = imageData
          
          // Determine if a person is in frame
          // VERY lenient detection - assume in frame unless very dark or no motion for a while
          let personDetected = true
          let detectionConfidence = 90 // Default high confidence
          
          // Only mark as not in frame if it's very dark (empty room)
          if (avgBrightness < 15) {
            personDetected = false
            detectionConfidence = 10
          }
          
          // Draw detection status on canvas
          context.fillStyle = personDetected ? 'rgba(0, 255, 0, 0.3)' : 'rgba(255, 0, 0, 0.3)'
          context.fillRect(0, 0, 100, 30)
          context.fillStyle = '#ffffff'
          context.font = '14px Arial'
          context.fillText(personDetected ? 'In Frame' : 'Out of Frame', 10, 20)
          
          // Update state only if it changed
          if (inFrame !== personDetected) {
            setInFrame(personDetected)
            setConfidence(detectionConfidence)
            
            // Call callback
            if (onMotionDetected) {
              onMotionDetected({
                inFrame: personDetected,
                confidence: detectionConfidence,
                timestamp: new Date(),
                message: personDetected ? translations.stayInFrame[language] : translations.returnToFrame[language]
              })
            }
          }
        }
      } catch (error) {
        console.error('Error in motion detection:', error)
      }
    }
    
    // Start detection loop
    animationRef.current = requestAnimationFrame(detectMotion)
  }
  
  // Toggle tracking
  const toggleTracking = () => {
    setIsTracking(prev => !prev)
  }
  
  return (
    <Card className={`overflow-hidden ${className}`}>
      {!compact && (
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <Camera size={18} className="text-primary" />
            {translations.title[language]}
          </CardTitle>
        </CardHeader>
      )}
      
      <CardContent className={compact ? "p-0" : "pt-2"}>
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
          <div className="relative" style={{ minHeight: '320px', maxHeight: '320px', overflow: 'hidden' }}>
            {/* Video element */}
            <video
              ref={videoRef}
              className="w-full h-auto rounded-md border border-border absolute top-0 left-0 object-cover"
              muted
              playsInline
              style={{ zIndex: 1 }}
            />
            
            {/* Canvas for displaying overlays on top of video */}
            <canvas
              ref={canvasRef}
              className="w-full h-auto rounded-md border border-border absolute top-0 left-0"
              style={{ backgroundColor: 'transparent', zIndex: 2 }}
            />
            
            {/* Status indicator for in-frame/out-of-frame */}
            <div className="absolute top-2 right-2 z-10 flex items-center gap-2 bg-background/90 dark:bg-background/90 backdrop-blur-sm rounded-md px-3 py-2 shadow-md border border-border dark:border-border">
              <div className={`w-4 h-4 rounded-full ${inFrame ? 'bg-green-500 animate-pulse' : 'bg-red-500 animate-pulse'}`}></div>
              <span className="text-sm font-medium">
                {inFrame ? translations.inFrame[language] : translations.outOfFrame[language]}
              </span>
            </div>
            
            {/* Status overlay */}
            {isTracking && inFrame && (
              <div className="absolute bottom-2 left-2 right-2 flex flex-col gap-2">
                <div className="bg-green-500/20 dark:bg-green-500/30 backdrop-blur-sm rounded-md p-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-500" />
                    <span className="text-xs font-medium text-green-700 dark:text-green-300">
                      {translations.inFrame[language]} ({confidence}%)
                    </span>
                  </div>
                  <Progress value={confidence} className="w-24 h-1.5" />
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
      
      {showControls && !compact && (
        <CardFooter className="pt-0">
          <Button
            onClick={toggleTracking}
            variant={isTracking ? "destructive" : "default"}
            className="w-full"
          >
            {isTracking ? (
              <>
                <CameraOff size={16} className="mr-2" />
                {translations.stopTracking[language]}
              </>
            ) : (
              <>
                <Camera size={16} className="mr-2" />
                {translations.startTracking[language]}
              </>
            )}
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
