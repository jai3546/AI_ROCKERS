"use client"

import { useState, useRef, useEffect } from "react"
import { Camera, CameraOff, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface WebcamAccessProps {
  onStreamReady?: (stream: MediaStream) => void
  onStreamError?: (error: Error) => void
  width?: number
  height?: number
  className?: string
}

export function WebcamAccess({
  onStreamReady,
  onStreamError,
  width = 640,
  height = 480,
  className = "",
}: WebcamAccessProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isAccessGranted, setIsAccessGranted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const startWebcam = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Stop any existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }

      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: width },
          height: { ideal: height },
          facingMode: "user"
        },
        audio: false
      })

      // Save stream reference
      streamRef.current = stream

      // Set video source
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }

      setIsAccessGranted(true)
      setError(null)

      // Notify parent component
      if (onStreamReady) {
        onStreamReady(stream)
      }
    } catch (err) {
      console.error("Error accessing webcam:", err)
      setIsAccessGranted(false)
      setError(err instanceof Error ? err.message : "Failed to access webcam")

      // Notify parent component
      if (onStreamError && err instanceof Error) {
        onStreamError(err)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null
    }

    setIsAccessGranted(false)
  }

  // Auto-start webcam on mount and clean up on unmount
  useEffect(() => {
    // Auto-start webcam when component mounts
    startWebcam()

    // Clean up on unmount
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="relative rounded-lg overflow-hidden bg-black/10 mb-2">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full ${isAccessGranted ? "opacity-100" : "opacity-0"}`}
          style={{ width, height }}
        />

        {!isAccessGranted && !isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted">
            <Camera size={48} className="text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground mb-4">Camera access required</p>
            <Button onClick={startWebcam} variant="secondary">
              Enable Camera
            </Button>
          </div>
        )}

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <RefreshCw size={32} className="text-primary animate-spin" />
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-destructive/10 p-4">
            <CameraOff size={32} className="text-destructive mb-2" />
            <p className="text-sm text-destructive text-center mb-2">{error}</p>
            <Button onClick={startWebcam} variant="destructive" size="sm">
              Try Again
            </Button>
          </div>
        )}
      </div>

      {isAccessGranted && (
        <Button variant="outline" size="sm" onClick={stopWebcam} className="mt-2">
          <CameraOff size={16} className="mr-2" />
          Disable Camera
        </Button>
      )}
    </div>
  )
}
