"use client"

import { useState, useRef, useEffect } from "react"
import { Smile, AlertCircle, RefreshCw } from "lucide-react"
import { WebcamAccess } from "./webcam-access"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface FaceEmotionDetectorProps {
  onEmotionDetected?: (emotionData: EmotionData) => void
  className?: string
  autoTracking?: boolean
}

export interface EmotionData {
  timestamp: number
  emotion: Emotion
  confidence: number
  fatigueScore?: number
  blinkRate?: number
  attentionScore?: number
}

export interface EmotionHistory {
  emotions: Record<Emotion, number>
  totalSamples: number
  dominantEmotion: Emotion
  fatigueScore: number
  startTime: number
  lastUpdateTime: number
}

export type Emotion = "happy" | "sad" | "angry" | "surprised" | "neutral" | "fearful" | "disgusted" | "none"

export function FaceEmotionDetector({
  onEmotionDetected,
  className = "",
  autoTracking = false,
}: FaceEmotionDetectorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDetecting, setIsDetecting] = useState(false)
  const [currentEmotion, setCurrentEmotion] = useState<Emotion>("none")
  const [confidenceScore, setConfidenceScore] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [fatigueScore, setFatigueScore] = useState(0)
  const [blinkRate, setBlinkRate] = useState(0)
  const [attentionScore, setAttentionScore] = useState(100)
  const [internalAutoTracking, setInternalAutoTracking] = useState(autoTracking)
  const [emotionHistory, setEmotionHistory] = useState<EmotionHistory>({
    emotions: {
      happy: 0,
      sad: 0,
      angry: 0,
      surprised: 0,
      neutral: 0,
      fearful: 0,
      disgusted: 0,
      none: 0
    },
    totalSamples: 0,
    dominantEmotion: "none",
    fatigueScore: 0,
    startTime: Date.now(),
    lastUpdateTime: Date.now()
  })

  const requestIdRef = useRef<number | null>(null)
  const contextRef = useRef<CanvasRenderingContext2D | null>(null)
  const faceApiLoadedRef = useRef(false)
  const lastBlinkTimeRef = useRef<number | null>(null)
  const blinkCountRef = useRef(0)
  const blinkIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const frameCountRef = useRef(0)

  // Sync with autoTracking prop and start detection if enabled
  useEffect(() => {
    setInternalAutoTracking(autoTracking)

    // If autoTracking is enabled and face-api is loaded, start detection
    if (autoTracking && faceApiLoadedRef.current && !isDetecting) {
      startEmotionDetection()
    }
  }, [autoTracking, faceApiLoadedRef.current, isDetecting])

  // Load face-api.js script dynamically
  useEffect(() => {
    if (typeof window !== 'undefined' && !faceApiLoadedRef.current) {
      setIsLoading(true)

      // Function to load script
      const loadScript = (src: string): Promise<void> => {
        return new Promise((resolve, reject) => {
          const script = document.createElement('script')
          script.src = src
          script.onload = () => resolve()
          script.onerror = () => reject(new Error(`Failed to load script: ${src}`))
          document.head.appendChild(script)
        })
      }

      // Load face-api.js and models
      const loadFaceAPI = async () => {
        try {
          // Load face-api.js script from CDN (using a more reliable source)
          await loadScript('https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js')

          // Wait for face-api to be available
          const checkFaceApi = () => {
            if ((window as any).faceapi) {
              return Promise.resolve()
            } else {
              return new Promise(resolve => setTimeout(() => resolve(checkFaceApi()), 100))
            }
          }

          await checkFaceApi()

          // Load models from CDN
          const faceapi = (window as any).faceapi
          // Load all required models from a more reliable source
          const modelUrl = 'https://justadudewhohacks.github.io/face-api.js/models';
          await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri(modelUrl),
            faceapi.nets.faceExpressionNet.loadFromUri(modelUrl),
            faceapi.nets.faceLandmark68Net.loadFromUri(modelUrl),
            faceapi.nets.ssdMobilenetv1.loadFromUri(modelUrl) // Add SSD MobileNet as a backup detector
          ])

          faceApiLoadedRef.current = true
          setIsLoading(false)
          setError(null)
        } catch (err) {
          console.error('Error loading face-api.js:', err)
          setError('Failed to load face detection models. Please refresh the page and try again.')
          setIsLoading(false)
        }
      }

      loadFaceAPI()

      // We're using CDN models, so no need to check local models directory
    }

    return () => {
      if (requestIdRef.current) {
        cancelAnimationFrame(requestIdRef.current)
      }
    }
  }, [])

  const handleStreamReady = (stream: MediaStream) => {
    setError(null)

    // Get the video track
    const videoTrack = stream.getVideoTracks()[0]

    // Get video settings
    const settings = videoTrack.getSettings()
    const width = settings.width || 640
    const height = settings.height || 480

    // Set canvas dimensions
    if (canvasRef.current) {
      canvasRef.current.width = width
      canvasRef.current.height = height
      contextRef.current = canvasRef.current.getContext('2d')
    }

    // Start emotion detection if face-api is loaded
    if (faceApiLoadedRef.current) {
      if (internalAutoTracking) {
        startEmotionDetection()

        // Start blink rate tracking
        if (blinkIntervalRef.current === null) {
          blinkIntervalRef.current = setInterval(() => {
            // Calculate blinks per minute
            const elapsedMinutes = (Date.now() - emotionHistory.startTime) / 60000
            if (elapsedMinutes > 0) {
              const blinksPerMinute = blinkCountRef.current / elapsedMinutes
              setBlinkRate(Math.min(Math.round(blinksPerMinute), 100))

              // Reset if tracking for more than 5 minutes
              if (elapsedMinutes > 5) {
                blinkCountRef.current = 0
                setEmotionHistory(prev => ({
                  ...prev,
                  startTime: Date.now()
                }))
              }
            }
          }, 10000) // Update every 10 seconds
        }
      }
    } else {
      setError('Face detection models are still loading. Please wait...')
    }
  }

  const handleStreamError = (error: Error) => {
    setError(`Camera error: ${error.message}`)
    setIsDetecting(false)
    stopEmotionDetection()
  }

  const startEmotionDetection = () => {
    if (!isDetecting && faceApiLoadedRef.current) {
      setIsDetecting(true)
      requestIdRef.current = requestAnimationFrame(detectEmotion)
    }
  }

  const stopEmotionDetection = () => {
    setIsDetecting(false)
    if (requestIdRef.current) {
      cancelAnimationFrame(requestIdRef.current)
      requestIdRef.current = null
    }

    // Clear blink tracking interval
    if (blinkIntervalRef.current) {
      clearInterval(blinkIntervalRef.current)
      blinkIntervalRef.current = null
    }
  }

  const detectEmotion = async () => {
    // Process every frame for better responsiveness
    // We used to skip frames, but now we'll process every frame for better emotion detection
    frameCountRef.current++;

    const video = document.querySelector('video')
    const context = contextRef.current
    const faceapi = (window as any).faceapi

    if (video && context && canvasRef.current && video.readyState === 4 && faceapi) {
      try {
        // Try to detect faces with TinyFaceDetector first (faster)
        let detections = await faceapi.detectAllFaces(
          video,
          new faceapi.TinyFaceDetectorOptions({
            inputSize: 416,  // Larger input size for better accuracy
            scoreThreshold: 0.2  // Even lower threshold to detect more faces
          })
        ).withFaceExpressions().withFaceLandmarks()

        // If no faces detected, try with SSD MobileNet (more accurate but slower)
        if (!detections || detections.length === 0) {
          console.log('No faces detected with TinyFaceDetector, trying SSD MobileNet...');
          detections = await faceapi.detectAllFaces(
            video,
            new faceapi.SsdMobilenetv1Options({
              minConfidence: 0.1 // Very low threshold to detect more faces
            })
          ).withFaceExpressions().withFaceLandmarks()
        }

        // Clear canvas
        context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)

        // Draw video frame
        context.drawImage(video, 0, 0, canvasRef.current.width, canvasRef.current.height)

        // Add debug information
        console.log(`Face detection result: ${detections ? detections.length : 0} faces detected`);

        if (detections && detections.length > 0) {
          // Get the first face
          const face = detections[0]
          console.log('Face detected with expressions:', face.expressions);

          // Draw face detection and landmarks
          faceapi.draw.drawDetections(canvasRef.current, [face])
          faceapi.draw.drawFaceLandmarks(canvasRef.current, [face])

          // Get expressions
          const expressions = face.expressions

          // Find the emotion with highest score
          let highestScore = 0
          let dominantEmotion: Emotion = "none"

          Object.entries(expressions).forEach(([emotion, score]) => {
            if (score > highestScore && emotion !== "neutral") {
              highestScore = score
              dominantEmotion = emotion as Emotion
            }
          })

          // If no strong emotion is detected, use neutral
          if (highestScore < 0.25 && expressions.neutral > 0.3) {
            dominantEmotion = "neutral"
            highestScore = expressions.neutral
          }

          // Update emotion history
          const newEmotionHistory = {...emotionHistory}
          newEmotionHistory.emotions[dominantEmotion]++
          newEmotionHistory.totalSamples++
          newEmotionHistory.lastUpdateTime = Date.now()

          // Calculate dominant emotion over time
          let maxCount = 0
          let historicalDominantEmotion: Emotion = "none"

          Object.entries(newEmotionHistory.emotions).forEach(([emotion, count]) => {
            if (count > maxCount && emotion !== "none") {
              maxCount = count
              historicalDominantEmotion = emotion as Emotion
            }
          })

          newEmotionHistory.dominantEmotion = historicalDominantEmotion

          // Detect blinks by checking eye landmarks
          if (face.landmarks) {
            const leftEye = face.landmarks.getLeftEye()
            const rightEye = face.landmarks.getRightEye()

            if (leftEye && rightEye) {
              // Calculate eye aspect ratio (EAR) to detect blinks
              const leftEAR = calculateEAR(leftEye)
              const rightEAR = calculateEAR(rightEye)
              const avgEAR = (leftEAR + rightEAR) / 2

              // Threshold for blink detection
              const EAR_THRESHOLD = 0.2

              // Detect blink
              const now = Date.now()
              const isBlinking = avgEAR < EAR_THRESHOLD

              if (isBlinking && (!lastBlinkTimeRef.current || now - lastBlinkTimeRef.current > 500)) {
                // Count as a blink if enough time has passed since last blink
                blinkCountRef.current++
                lastBlinkTimeRef.current = now
              }
            }
          }

          // Calculate fatigue score based on:
          // 1. Blink rate (normal is 15-20 per minute, less means dry eyes/fatigue)
          // 2. Emotion history (predominance of neutral/sad/tired expressions)
          // 3. Time spent in session

          const sessionDurationMinutes = (Date.now() - emotionHistory.startTime) / 60000
          const blinkRateScore = Math.max(0, 100 - Math.abs(blinkRate - 15) * 5) // Optimal is around 15 blinks/min

          // Calculate emotion-based fatigue (more neutral/sad = more fatigue)
          const emotionSamples = newEmotionHistory.totalSamples || 1 // Avoid division by zero
          const neutralRatio = newEmotionHistory.emotions.neutral / emotionSamples
          const sadRatio = newEmotionHistory.emotions.sad / emotionSamples
          const fearfulRatio = newEmotionHistory.emotions.fearful / emotionSamples

          const emotionFatigueScore = (neutralRatio * 50) + (sadRatio * 80) + (fearfulRatio * 70)

          // Time-based fatigue (increases with session duration)
          const timeBasedFatigue = Math.min(sessionDurationMinutes * 2, 40) // Max 40% from time

          // Calculate overall fatigue (0-100)
          const calculatedFatigueScore = Math.min(
            Math.round(timeBasedFatigue + (100 - blinkRateScore) * 0.3 + emotionFatigueScore * 0.3),
            100
          )

          // Calculate attention score (inverse of fatigue with some randomness)
          const calculatedAttentionScore = Math.max(
            Math.min(100 - calculatedFatigueScore + (Math.random() * 10 - 5), 100),
            0
          )

          // Update state
          setFatigueScore(calculatedFatigueScore)
          setAttentionScore(Math.round(calculatedAttentionScore))
          setEmotionHistory(newEmotionHistory)
          setCurrentEmotion(dominantEmotion)
          setConfidenceScore(Math.round(highestScore * 100))

          // Notify parent component
          if (onEmotionDetected) {
            onEmotionDetected({
              timestamp: Date.now(),
              emotion: dominantEmotion,
              confidence: highestScore,
              fatigueScore: calculatedFatigueScore,
              blinkRate,
              attentionScore: Math.round(calculatedAttentionScore)
            })
          }
        } else {
          // No face detected - draw a message on the canvas
          context.font = '16px Arial';
          context.fillStyle = 'red';
          context.fillText('No face detected - please position your face in view', 10, 30);

          // No face detected
          setCurrentEmotion("none")
          setConfidenceScore(0)

          // Still notify with a neutral emotion to keep the system responsive
          if (frameCountRef.current % 30 === 0) { // Only send every 30 frames to avoid flooding
            if (onEmotionDetected) {
              onEmotionDetected({
                timestamp: Date.now(),
                emotion: "neutral",
                confidence: 0.1,
                fatigueScore: 0,
                attentionScore: 50
              });
            }
          }
        }
      } catch (err) {
        console.error('Error detecting emotions:', err)
      }
    }

    // Continue detection loop
    if (isDetecting) {
      requestIdRef.current = requestAnimationFrame(detectEmotion)
    }
  }

  // Calculate Eye Aspect Ratio (EAR) to detect blinks
  const calculateEAR = (eye: {x: number, y: number}[]) => {
    // Vertical eye landmarks
    const p2_p6 = Math.sqrt(Math.pow(eye[1].x - eye[5].x, 2) + Math.pow(eye[1].y - eye[5].y, 2))
    const p3_p5 = Math.sqrt(Math.pow(eye[2].x - eye[4].x, 2) + Math.pow(eye[2].y - eye[4].y, 2))

    // Horizontal eye landmark
    const p1_p4 = Math.sqrt(Math.pow(eye[0].x - eye[3].x, 2) + Math.pow(eye[0].y - eye[3].y, 2))

    // Eye aspect ratio
    return (p2_p6 + p3_p5) / (2.0 * p1_p4)
  }

  // Get emotion icon and color
  const getEmotionIcon = (emotion: Emotion) => {
    switch (emotion) {
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
              <p className="text-sm text-center">Loading face detection models...</p>
            </div>
          ) : (
            <>
              <div className="relative">
                <WebcamAccess
                  onStreamReady={handleStreamReady}
                  onStreamError={handleStreamError}
                  width={320}
                  height={240}
                />

                <canvas
                  ref={canvasRef}
                  className="absolute top-0 left-0 z-10"
                  width={320}
                  height={240}
                />
              </div>
            </>
          )}

          {error && (
            <div className="mt-4 p-3 bg-destructive/10 text-destructive rounded-md flex items-center">
              <AlertCircle size={16} className="mr-2" />
              {error}
            </div>
          )}

          {isDetecting && (
            <div className="mt-4 w-full">
              <div className="flex justify-between mb-1">
                <span className="text-sm">Current emotion:</span>
                <span className="text-sm font-medium flex items-center">
                  {getEmotionIcon(currentEmotion)} {currentEmotion !== "none" ? currentEmotion : "No face detected"}
                </span>
              </div>

              {currentEmotion !== "none" && (
                <>
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
                      className={`h-2.5 rounded-full transition-all duration-300 ${fatigueScore > 70 ? 'bg-destructive' : fatigueScore > 40 ? 'bg-warning' : 'bg-success'}`}
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
                      className={`h-2.5 rounded-full transition-all duration-300 ${attentionScore < 30 ? 'bg-destructive' : attentionScore < 60 ? 'bg-warning' : 'bg-success'}`}
                      style={{ width: `${attentionScore}%` }}
                    />
                  </div>

                  {/* Blink Rate */}
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Blink rate:</span>
                    <span className="text-sm font-medium">{blinkRate} blinks/min</span>
                  </div>
                </>
              )}

              <div className="flex justify-between mt-4">
                <Button
                  variant={internalAutoTracking ? "default" : "outline"}
                  size="sm"
                  onClick={() => setInternalAutoTracking(!internalAutoTracking)}
                  disabled={!faceApiLoadedRef.current || isLoading}
                >
                  {internalAutoTracking ? "Auto Tracking: ON" : "Auto Tracking: OFF"}
                </Button>

                <Button
                  variant={isDetecting ? "destructive" : "secondary"}
                  size="sm"
                  onClick={isDetecting ? stopEmotionDetection : startEmotionDetection}
                  disabled={!faceApiLoadedRef.current || isLoading}
                >
                  {isDetecting ? "Stop Detection" : "Start Detection"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
