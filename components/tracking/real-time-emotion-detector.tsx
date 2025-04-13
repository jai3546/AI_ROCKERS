"use client"

import { useState, useRef, useEffect } from "react"
import { Smile, Frown, Meh, AlertTriangle, Eye, RefreshCw, Camera, CameraOff, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

interface RealTimeEmotionDetectorProps {
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

export function RealTimeEmotionDetector({
  onEmotionDetected,
  className = "",
  autoTracking = false,
}: RealTimeEmotionDetectorProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDetecting, setIsDetecting] = useState(false)
  const [currentEmotion, setCurrentEmotion] = useState<Emotion>("neutral")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [cameraActive, setCameraActive] = useState(false)
  const [confidenceScore, setConfidenceScore] = useState(50)
  const [fatigueScore, setFatigueScore] = useState(30)
  const [attentionScore, setAttentionScore] = useState(70)
  const [faceDetected, setFaceDetected] = useState(false)

  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const frameCountRef = useRef(0)
  const sessionStartTimeRef = useRef(Date.now())

  // Start detection when component mounts or autoTracking changes
  useEffect(() => {
    if (autoTracking) {
      // Start with simulated emotions by default for reliability
      startSimulatedEmotions()

      // We no longer try to start the camera automatically
      // This prevents the camera permission popup from appearing unexpectedly
    }

    return () => {
      stopCamera()
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current)
      }
    }
  }, [autoTracking])

  const startCamera = async () => {
    try {
      setIsLoading(true)
      setError(null)

      console.log("Requesting camera access...")

      // First try with minimal constraints
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        })

        console.log("Camera access granted with minimal constraints")
        setupVideoStream(stream)
      } catch (err) {
        console.warn("Failed with minimal constraints, trying with specific constraints:", err)

        // If that fails, try with more specific constraints
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 320 }, // Reduced size for better performance
            height: { ideal: 240 },
            facingMode: "user"
          },
          audio: false
        })

        console.log("Camera access granted with specific constraints")
        setupVideoStream(stream)
      }
    } catch (err) {
      console.error("Error accessing camera:", err)
      setError(`Could not access camera: ${err.message || 'Unknown error'}. Please check permissions.`)
      setIsLoading(false)

      // Fall back to simulated emotions if camera access fails
      startSimulatedEmotions()
    }
  }

  // Helper function to set up video stream
  const setupVideoStream = (stream: MediaStream) => {
    if (!videoRef.current) return

    console.log("Setting up video element with stream")
    videoRef.current.srcObject = stream

    // Add event listeners for debugging
    videoRef.current.addEventListener('loadeddata', () => {
      console.log("Video data loaded")
    })

    videoRef.current.addEventListener('error', (e) => {
      console.error("Video element error:", e)
    })

    // Set up metadata loaded handler
    videoRef.current.onloadedmetadata = () => {
      console.log("Video metadata loaded, starting playback")
      if (!videoRef.current) return

      // Set muted and playsinline attributes to help with autoplay
      videoRef.current.muted = true
      videoRef.current.setAttribute('playsinline', 'true')

      // Force play with catch for browsers that require user interaction
      const playPromise = videoRef.current.play()

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log("Video playback started successfully")
            setIsLoading(false)
            setIsDetecting(true)
            setCameraActive(true)
            startEmotionDetection()
          })
          .catch(err => {
            console.error("Error starting video playback:", err)
            setError("Could not start video playback. Please try again or click the Start Camera button.")
            setIsLoading(false)
            // Fall back to simulated emotions
            startSimulatedEmotions()
          })
      } else {
        // For browsers where play() doesn't return a promise
        console.log("Play doesn't return a promise, assuming playback started")
        setIsLoading(false)
        setIsDetecting(true)
        setCameraActive(true)
        startEmotionDetection()
      }
    }
  }

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      const tracks = stream.getTracks()
      tracks.forEach(track => track.stop())
      videoRef.current.srcObject = null
    }

    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current)
      detectionIntervalRef.current = null
    }

    setIsDetecting(false)
    setCameraActive(false)
  }

  const startEmotionDetection = () => {
    // Reset session start time
    sessionStartTimeRef.current = Date.now()

    // Load face-api.js dynamically
    const loadFaceAPI = async () => {
      try {
        console.log("Starting to load face-api.js...")

        // Check if face-api is already loaded
        if (!(window as any).faceapi) {
          console.log("face-api.js not loaded yet, loading script...")
          // Load face-api.js script from a reliable CDN
          await loadScript('https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js')
          console.log("face-api.js script loaded successfully")
        } else {
          console.log("face-api.js already loaded")
        }

        // Check if faceapi is available
        if (!(window as any).faceapi) {
          throw new Error("face-api.js failed to initialize properly")
        }

        const faceapi = (window as any).faceapi
        console.log("Loading face-api.js models...")

        // Load models from a reliable source
        const modelUrl = 'https://justadudewhohacks.github.io/face-api.js/models'
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(modelUrl),
          faceapi.nets.faceExpressionNet.loadFromUri(modelUrl),
          faceapi.nets.faceLandmark68Net.loadFromUri(modelUrl)
        ])

        console.log("All face-api.js models loaded successfully")

        // Start detection loop
        detectEmotions()
      } catch (err) {
        console.error("Error loading face-api:", err)
        setError("Could not load emotion detection models. Falling back to simulated emotions.")
        startSimulatedEmotions()
      }
    }

    loadFaceAPI()
  }

  const detectEmotions = async () => {
    if (!videoRef.current || !canvasRef.current || !isDetecting) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const faceapi = (window as any).faceapi

    if (!faceapi) {
      console.error("Face API not loaded")
      return
    }

    try {
      // Check if video is playing and has dimensions
      if (video.readyState !== 4 || video.videoWidth === 0 || video.videoHeight === 0) {
        console.log("Video not ready yet, waiting...")
        requestAnimationFrame(detectEmotions)
        return
      }

      console.log(`Video dimensions: ${video.videoWidth}x${video.videoHeight}, readyState: ${video.readyState}`)

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      // Get canvas context
      const context = canvas.getContext('2d')
      if (!context) {
        console.error("Could not get canvas context")
        return
      }

      // Clear previous drawings
      context.clearRect(0, 0, canvas.width, canvas.height)

      // Draw video frame to canvas for debugging
      context.drawImage(video, 0, 0, canvas.width, canvas.height)

      console.log("Detecting faces...")

      // Detect faces with expressions
      const detections = await faceapi.detectAllFaces(
        video,
        new faceapi.TinyFaceDetectorOptions({
          inputSize: 416,
          scoreThreshold: 0.3
        })
      ).withFaceExpressions()

      console.log(`Detected ${detections ? detections.length : 0} faces`)

      if (detections && detections.length > 0) {
        // Face detected
        setFaceDetected(true)

        // Get the first face
        const face = detections[0]

        // Draw detection results
        faceapi.draw.drawDetections(canvas, [face])

        // Process emotions
        const expressions = face.expressions
        console.log("Detected expressions:", expressions)

        let dominantEmotion: Emotion = "neutral"
        let highestScore = 0

        // Find the dominant emotion
        for (const [emotion, score] of Object.entries(expressions)) {
          if (score > highestScore && emotion !== "neutral") {
            highestScore = score
            dominantEmotion = emotion as Emotion
          }
        }

        // If no strong emotion is detected, use neutral
        if (highestScore < 0.3 && expressions.neutral > 0.5) {
          dominantEmotion = "neutral"
          highestScore = expressions.neutral
        }

        console.log(`Dominant emotion: ${dominantEmotion}, score: ${highestScore}`)

        // Update state with debouncing to avoid flickering
        if (dominantEmotion !== currentEmotion || Math.abs(Math.round(highestScore * 100) - confidenceScore) > 10) {
          setCurrentEmotion(dominantEmotion)
          setConfidenceScore(Math.round(highestScore * 100))
        }

        // Calculate session duration in minutes
        const sessionDurationMinutes = (Date.now() - sessionStartTimeRef.current) / 60000

        // Fatigue increases over time
        const baseFatigue = 20
        const timeFactor = Math.min(1, sessionDurationMinutes / 30) // Increases over 30 minutes
        const newFatigue = Math.min(95, baseFatigue + (timeFactor * 60))
        setFatigueScore(Math.round(newFatigue))

        // Attention varies based on emotion
        let attentionModifier = 0
        if (dominantEmotion === "happy") attentionModifier = 10
        if (dominantEmotion === "surprised") attentionModifier = 5
        if (dominantEmotion === "sad") attentionModifier = -10
        if (dominantEmotion === "angry") attentionModifier = -15
        if (dominantEmotion === "fearful") attentionModifier = -5

        const baseAttention = 90
        const newAttention = Math.max(30, Math.min(100, baseAttention - (timeFactor * 40) + attentionModifier))
        setAttentionScore(Math.round(newAttention))

        // Notify parent component
        if (onEmotionDetected) {
          onEmotionDetected({
            timestamp: Date.now(),
            emotion: dominantEmotion,
            confidence: highestScore,
            fatigueScore: Math.round(newFatigue),
            attentionScore: Math.round(newAttention)
          })
        }
      } else {
        // No face detected
        setFaceDetected(false)

        // Draw message on canvas
        context.font = '20px Arial'
        context.fillStyle = 'red'
        context.fillText('No face detected - please position your face in view', 10, 50)

        // Draw a helpful face outline to guide the user
        context.strokeStyle = 'rgba(255, 255, 255, 0.5)'
        context.lineWidth = 2
        const centerX = canvas.width / 2
        const centerY = canvas.height / 2
        const ovalWidth = canvas.width * 0.4
        const ovalHeight = canvas.height * 0.6

        // Draw oval for face
        context.beginPath()
        context.ellipse(centerX, centerY, ovalWidth / 2, ovalHeight / 2, 0, 0, 2 * Math.PI)
        context.stroke()
      }

      // Request next frame
      if (isDetecting) {
        requestAnimationFrame(detectEmotions)
      }
    } catch (err) {
      console.error("Error in emotion detection:", err)

      // Draw error message on canvas
      if (canvasRef.current) {
        const context = canvasRef.current.getContext('2d')
        if (context) {
          context.font = '16px Arial'
          context.fillStyle = 'red'
          context.fillText('Error detecting emotions - trying again...', 10, 30)
        }
      }

      // Try again on next frame
      if (isDetecting) {
        requestAnimationFrame(detectEmotions)
      } else {
        // Fall back to simulated emotions if detection fails and we're not detecting anymore
        if (!detectionIntervalRef.current) {
          startSimulatedEmotions()
        }
      }
    }
  }

  const startSimulatedEmotions = () => {
    // Clear any existing interval
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current)
      detectionIntervalRef.current = null
    }

    // Stop camera if it's running
    stopCamera()

    // If real detection fails, simulate emotions
    console.log("Starting simulated emotions")

    // Reset session start time
    sessionStartTimeRef.current = Date.now()

    // Set initial state immediately
    setIsLoading(false)
    setIsDetecting(true)
    setCameraActive(false) // Camera is not active in simulation mode
    setFaceDetected(true) // Pretend face is detected
    setCurrentEmotion("happy") // Start with happy
    setConfidenceScore(85) // High confidence
    setFatigueScore(20) // Low fatigue initially
    setAttentionScore(90) // High attention initially

    // Notify parent immediately
    if (onEmotionDetected) {
      onEmotionDetected({
        timestamp: Date.now(),
        emotion: "happy",
        confidence: 0.85,
        fatigueScore: 20,
        attentionScore: 90
      })
    }

    // Emotions to cycle through
    const emotions: Emotion[] = ["happy", "neutral", "sad", "angry", "surprised", "fearful", "disgusted"]

    // Start interval to change emotions
    detectionIntervalRef.current = setInterval(() => {
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
      if (onEmotionDetected) {
        onEmotionDetected({
          timestamp: Date.now(),
          emotion: randomEmotion,
          confidence: newConfidence / 100,
          fatigueScore: Math.round(newFatigue),
          attentionScore: Math.round(newAttention)
        })
      }
    }, 4000) // Change emotion every 4 seconds
  }

  // Helper function to load scripts
  const loadScript = (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = src
      script.onload = () => resolve()
      script.onerror = (err) => reject(err)
      document.head.appendChild(script)
    })
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

  const handleToggleCamera = () => {
    if (cameraActive) {
      stopCamera()
    } else {
      startCamera()
    }
  }

  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardHeader className="bg-primary/10 pb-2">
        <CardTitle className="flex items-center justify-between text-primary">
          <div className="flex items-center gap-2">
            <Smile size={18} />
            Emotion Detector
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleToggleCamera}
          >
            {cameraActive ? <CameraOff size={16} /> : <Camera size={16} />}
          </Button>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-4">
        <div className="flex flex-col items-center">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-[240px] w-full bg-muted rounded-lg">
              <RefreshCw size={32} className="text-primary animate-spin mb-2" />
              <p className="text-sm text-center font-medium">Starting camera...</p>
              <p className="text-xs text-center mt-2 max-w-[80%]">Please allow camera access when prompted</p>
              <div className="flex flex-col gap-2 mt-4 w-full max-w-[80%]">
                <Button
                  variant="primary"
                  size="sm"
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                  onClick={() => {
                    // Use simulated emotions instead
                    setIsLoading(false)
                    startSimulatedEmotions()
                  }}
                >
                  Use Simulated Emotions
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Reset and try again
                    setIsLoading(false)
                    setTimeout(() => startCamera(), 500)
                  }}
                >
                  Retry Camera Access
                </Button>
              </div>
            </div>
          ) : (
            <>
              {!cameraActive && isDetecting ? (
                // Simulated emotions view
                <div className="w-full aspect-video rounded-lg overflow-hidden bg-gradient-to-b from-blue-50 to-indigo-100 flex flex-col items-center justify-center">
                  <div className="text-6xl animate-pulse mb-2">
                    {getEmotionIcon()}
                  </div>
                  <p className="text-sm font-medium">Using simulated emotions</p>
                  <p className="text-xs text-gray-500 mt-1">No camera access required</p>

                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={startCamera}
                  >
                    Try Real Camera
                  </Button>
                </div>
              ) : (
                // Real camera view
                <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black">
                  <video
                    ref={videoRef}
                    className="absolute inset-0 w-full h-full object-cover"
                    muted
                    playsInline
                  />
                  <canvas
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full"
                  />

                  {!cameraActive && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/80">
                      <Camera size={40} className="text-white mb-2" />
                      <p className="text-white text-sm">Camera is off</p>
                      <div className="flex gap-2 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-white/20 text-white border-white/40 hover:bg-white/30"
                          onClick={startCamera}
                        >
                          Start Camera
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                          onClick={startSimulatedEmotions}
                        >
                          Use Simulation
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Overlay emotion icon */}
                  {isDetecting && faceDetected && (
                    <div className="absolute bottom-2 right-2 bg-white/80 rounded-full p-2 text-2xl">
                      {getEmotionIcon()}
                    </div>
                  )}
                </div>
              )}
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

          {!autoTracking && !isDetecting && !isLoading && (
            <Button
              onClick={startCamera}
              className="mt-4 w-full"
            >
              Start Emotion Detection
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
