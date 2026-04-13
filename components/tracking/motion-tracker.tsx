"use client"

import { useState, useRef, useEffect } from "react"
import { Activity, AlertCircle, Mic, MicOff, Volume2 } from "lucide-react"
import { WebcamAccess } from "./webcam-access"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface MotionTrackerProps {
  onMotionDetected?: (motionData: MotionData) => void
  className?: string
}

export interface MotionData {
  timestamp: number
  motionScore: number
  direction: "left" | "right" | "up" | "down" | "none"
  personDetected: boolean
}

export function MotionTracker({
  onMotionDetected,
  className = "",
}: MotionTrackerProps) {
  // Core refs
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const prevFrameRef = useRef<ImageData | null>(null)
  const animationRef = useRef<number | null>(null)

  // State
  const [isTracking, setIsTracking] = useState(false)
  const [motionScore, setMotionScore] = useState(0)
  const [motionDirection, setMotionDirection] = useState<"left" | "right" | "up" | "down" | "none">("none")
  const [personDetected, setPersonDetected] = useState(true) // Default to true for better UX
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string>("")

  // Voice navigation state
  const [isListening, setIsListening] = useState(false)
  const [voiceCommand, setVoiceCommand] = useState<string>("")
  const recognitionRef = useRef<any>(null)

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = false
      recognitionRef.current.lang = 'en-US'

      recognitionRef.current.onresult = (event: any) => {
        const command = event.results[event.results.length - 1][0].transcript.trim().toLowerCase()
        setVoiceCommand(command)
        processVoiceCommand(command)
      }

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        if (event.error === 'no-speech') {
          // Restart if no speech detected
          if (isListening) {
            recognitionRef.current.stop()
            setTimeout(() => {
              if (isListening) recognitionRef.current.start()
            }, 100)
          }
        }
      }

      recognitionRef.current.onend = () => {
        // Restart if still supposed to be listening
        if (isListening) {
          recognitionRef.current.start()
        }
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [isListening])

  // Process voice commands
  const processVoiceCommand = (command: string) => {
    console.log('Voice command received:', command)

    // Simple command processing
    if (command.includes('start') || command.includes('begin')) {
      startMotionDetection()
      speakFeedback('Starting motion detection')
    } else if (command.includes('stop') || command.includes('end')) {
      stopMotionDetection()
      speakFeedback('Stopping motion detection')
    } else if (command.includes('status') || command.includes('update')) {
      const status = personDetected ? 'Person detected' : 'No person detected'
      speakFeedback(`${status} with motion level at ${motionScore.toFixed(0)} percent`)
    }
  }

  // Text-to-speech feedback
  const speakFeedback = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 1.0
      utterance.pitch = 1.0
      window.speechSynthesis.speak(utterance)
    }
  }

  // Toggle voice recognition
  const toggleVoiceRecognition = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      setIsListening(false)
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.start()
      }
      setIsListening(true)
      speakFeedback('Voice commands activated')
    }
  }

  // Handle successful webcam stream
  const handleStreamReady = (stream: MediaStream) => {
    console.log("Webcam stream ready")
    setError(null)

    try {
      // Find the video element
      videoRef.current = document.querySelector('video')

      if (!videoRef.current) {
        throw new Error("Video element not found")
      }

      // Set up canvas for processing
      if (canvasRef.current) {
        // Use a smaller size for better performance
        canvasRef.current.width = 320
        canvasRef.current.height = 240

        const context = canvasRef.current.getContext('2d')
        if (!context) {
          throw new Error("Could not get canvas context")
        }
      } else {
        throw new Error("Canvas element not found")
      }

      // Start motion detection
      setIsTracking(true)
      startMotionDetection()
    } catch (err) {
      console.error("Error setting up motion detection:", err)
      setError(`Setup error: ${err instanceof Error ? err.message : "Unknown error"}`)
    }
  }

  // Handle webcam errors
  const handleStreamError = (error: Error) => {
    console.error("Camera error:", error)
    setError(`Camera error: ${error.message}`)
    setIsTracking(false)
    stopMotionDetection()

    // Auto-recovery
    setTimeout(() => {
      console.log("Attempting to restart camera...")
      setError("Camera disconnected. Attempting to reconnect...")
      startMotionDetection()
    }, 3000)
  }

  // Start motion detection
  const startMotionDetection = () => {
    if (!isTracking) {
      console.log("Starting motion detection")
      setIsTracking(true)
      prevFrameRef.current = null

      // Start detection loop
      detectMotion()
    }
  }

  // Stop motion detection
  const stopMotionDetection = () => {
    console.log("Stopping motion detection")
    setIsTracking(false)
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }
    prevFrameRef.current = null
  }

  // Main motion detection function - completely rewritten for simplicity and reliability
  const detectMotion = () => {
    const video = videoRef.current
    const canvas = canvasRef.current

    if (video && canvas && video.readyState === 4) {
      try {
        const context = canvas.getContext('2d')
        if (!context) return

        // Draw current video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height)

        // Get current frame data
        const currentFrame = context.getImageData(0, 0, canvas.width, canvas.height)

        // If we have a previous frame, compare them
        if (prevFrameRef.current) {
          // Simple pixel difference calculation
          const { diffPercentage, direction } = calculateDifference(prevFrameRef.current, currentFrame)

          // Update motion score with smoothing
          setMotionScore(prev => Math.round(prev * 0.7 + diffPercentage * 0.3))

          // Update debug info
          setDebugInfo(`Motion: ${diffPercentage.toFixed(1)}%, Direction: ${direction}`)

          // Update direction if significant motion
          if (diffPercentage > 5) {
            setMotionDirection(direction)
          }

          // Very simple person detection logic
          if (diffPercentage > 1.0) {
            // Any significant motion means a person is present
            if (!personDetected) {
              console.log(`Person detected with motion: ${diffPercentage.toFixed(1)}%`)
              setPersonDetected(true)

              // Notify parent component
              if (onMotionDetected) {
                onMotionDetected({
                  timestamp: Date.now(),
                  motionScore: diffPercentage,
                  direction,
                  personDetected: true
                })
              }
            }
          } else if (diffPercentage < 0.5 && personDetected) {
            // Very little motion means no person is present
            console.log(`No person detected with motion: ${diffPercentage.toFixed(1)}%`)
            setPersonDetected(false)

            // Notify parent component
            if (onMotionDetected) {
              onMotionDetected({
                timestamp: Date.now(),
                motionScore: diffPercentage,
                direction: "none",
                personDetected: false
              })
            }
          }
        }

        // Save current frame for next comparison
        prevFrameRef.current = currentFrame

      } catch (err) {
        console.error("Error in motion detection:", err)
      }
    }

    // Continue detection loop if tracking is active
    if (isTracking) {
      animationRef.current = requestAnimationFrame(detectMotion)
    }
  }

  // Simple frame difference calculation
  const calculateDifference = (prev: ImageData, curr: ImageData): {
    diffPercentage: number,
    direction: "left" | "right" | "up" | "down" | "none"
  } => {
    const width = curr.width
    const height = curr.height
    const data1 = prev.data
    const data2 = curr.data

    let diffCount = 0
    let leftDiff = 0
    let rightDiff = 0
    let topDiff = 0
    let bottomDiff = 0

    // Center coordinates
    const centerX = Math.floor(width / 2)
    const centerY = Math.floor(height / 2)

    // Skip pixels for performance (check every 4th pixel)
    const skipPixels = 4
    const pixelsChecked = Math.ceil((width * height) / (skipPixels * skipPixels))

    // Compare pixels
    for (let y = 0; y < height; y += skipPixels) {
      for (let x = 0; x < width; x += skipPixels) {
        const i = (y * width + x) * 4

        // Calculate difference in RGB values
        const rDiff = Math.abs(data1[i] - data2[i])
        const gDiff = Math.abs(data1[i + 1] - data2[i + 1])
        const bDiff = Math.abs(data1[i + 2] - data2[i + 2])

        // Use a weighted difference (human eyes are more sensitive to green)
        const diff = (rDiff * 0.3) + (gDiff * 0.6) + (bDiff * 0.1)

        // If pixel has changed significantly
        if (diff > 15) {
          diffCount++

          // Track direction of movement
          if (x < centerX) leftDiff++
          if (x > centerX) rightDiff++
          if (y < centerY) topDiff++
          if (y > centerY) bottomDiff++
        }
      }
    }

    // Calculate percentage of pixels that changed
    const diffPercentage = (diffCount / pixelsChecked) * 100

    // Determine direction of movement
    let direction: "left" | "right" | "up" | "down" | "none" = "none"

    const horizontalDiff = Math.abs(leftDiff - rightDiff)
    const verticalDiff = Math.abs(topDiff - bottomDiff)

    if (horizontalDiff > verticalDiff && horizontalDiff > 5) {
      direction = leftDiff > rightDiff ? "left" : "right"
    } else if (verticalDiff > 5) {
      direction = topDiff > bottomDiff ? "up" : "down"
    }

    return { diffPercentage, direction }
  }



  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardHeader className="bg-primary/10 pb-2">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary">
            <Activity size={18} />
            Motion Tracker
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className={`rounded-full ${isListening ? 'bg-green-100 text-green-700' : ''}`}
              onClick={toggleVoiceRecognition}
              title="Toggle voice commands"
            >
              {isListening ? <Mic size={18} /> : <MicOff size={18} />}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-4">
        <div className="flex flex-col items-center">
          <WebcamAccess
            onStreamReady={handleStreamReady}
            onStreamError={handleStreamError}
            width={320}
            height={240}
          />

          <canvas
            ref={canvasRef}
            className="hidden" // Hidden canvas for processing
          />

          {error && (
            <div className="mt-4 p-3 bg-destructive/10 text-destructive rounded-md flex items-center">
              <AlertCircle size={16} className="mr-2" />
              {error}
            </div>
          )}

          {isListening && voiceCommand && (
            <div className="mt-4 p-2 bg-blue-50 border border-blue-200 rounded-md text-blue-700 text-sm flex items-center">
              <Volume2 size={16} className="mr-2" />
              Voice command: "{voiceCommand}"
            </div>
          )}

          {isTracking && (
            <div className="mt-4 w-full">
              {/* FIXED: Improved Motion Status Panel */}
              <div className={`p-3 rounded-lg border mb-4 ${personDetected ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
                <h3 className="text-sm font-semibold mb-2 flex items-center">
                  <Activity size={14} className="mr-1" />
                  Motion Status {personDetected ? '(Active)' : '(Inactive)'}
                </h3>

                <div className="space-y-3">
                  {/* Motion Level with improved visual feedback */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs font-medium">Motion Level:</span>
                      <span className="text-xs font-bold">{motionScore.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-white/50 rounded-full h-2.5 shadow-inner">
                      <div
                        className={`h-2.5 rounded-full transition-all duration-300 ${
                          motionScore > 50 ? 'bg-green-500' :
                          motionScore > 20 ? 'bg-blue-500' :
                          motionScore > 8 ? 'bg-amber-500' : 'bg-red-400'
                        }`}
                        style={{ width: `${motionScore}%` }}
                      />
                    </div>
                    <div className="mt-1 text-xs text-slate-500 italic">
                      {motionScore > 50 ? 'High activity detected' :
                       motionScore > 20 ? 'Moderate activity detected' :
                       motionScore > 8 ? 'Low activity detected' : 'Minimal activity'}
                    </div>
                  </div>

                  {/* Person Detection Status with improved visual feedback */}
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium">Person Status:</span>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${personDetected ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-red-100 text-red-800 border border-red-300'}`}>
                      {personDetected ? 'Present' : 'Not Detected'}
                    </span>
                  </div>

                  {/* Movement Direction with improved visual feedback */}
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium">Movement:</span>
                    <span className={`text-xs font-medium capitalize px-2 py-1 rounded-full ${
                      motionDirection === 'none' ? 'bg-slate-100 text-slate-600' :
                      'bg-blue-100 text-blue-800 border border-blue-300'
                    }`}>
                      {motionDirection === 'none' ? 'No Movement' :
                       motionDirection === 'left' ? '← Left' :
                       motionDirection === 'right' ? '→ Right' :
                       motionDirection === 'up' ? '↑ Up' :
                       '↓ Down'}
                    </span>
                  </div>
                </div>
              </div>

              {/* FIXED: Improved Warning Message */}
              {!personDetected && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md mb-4 text-sm text-red-800 flex items-center">
                  <div className="bg-red-100 p-1.5 rounded-full mr-2 flex-shrink-0">
                    <AlertCircle size={16} className="text-red-600" />
                  </div>
                  <div>
                    <p className="font-semibold">Motion tracking paused</p>
                    <p className="text-xs mt-0.5">Please move or adjust your position to continue tracking.</p>
                  </div>
                </div>
              )}

              <div className="flex justify-between mt-4">
                <Button
                  variant={isTracking ? "destructive" : "secondary"}
                  size="sm"
                  onClick={isTracking ? stopMotionDetection : startMotionDetection}
                >
                  {isTracking ? "Stop Tracking" : "Start Tracking"}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleVoiceRecognition}
                  className={isListening ? 'border-green-500 text-green-700' : ''}
                >
                  {isListening ? "Disable Voice Commands" : "Enable Voice Commands"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
