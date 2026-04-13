"use client"

import React, { useRef, useState, useEffect } from 'react'
import { AlertTriangle, CheckCircle, Camera, CameraOff, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

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
  poorLighting: {
    en: "Poor lighting detected",
    hi: "खराब रोशनी का पता चला",
    te: "తక్కువ కాంతి కనుగొనబడింది",
  },
  poorLightingMessage: {
    en: "Please improve lighting for better detection",
    hi: "बेहतर पहचान के लिए रोशनी में सुधार करें",
    te: "మెరుగైన గుర్తింపు కోసం లైటింగ్‌ను మెరుగుపరచండి",
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
  browserNotSupported: {
    en: "Your browser does not support camera access. Please try a different browser like Chrome or Firefox.",
    hi: "आपका ब्राउज़र कैमरा एक्सेस का समर्थन नहीं करता है। कृपया Chrome या Firefox जैसे किसी अलग ब्राउज़र का उपयोग करें।",
    te: "మీ బ్రౌజర్ కెమెరా యాక్సెస్‌ను సపోర్ట్ చేయదు. దయచేసి Chrome లేదా Firefox వంటి వేరే బ్రౌజర్‌ను ప్రయత్నించండి.",
  },
  troubleshootingSteps: {
    en: "Troubleshooting Steps:",
    hi: "समस्या निवारण के चरण:",
    te: "సమస్య పరిష్కార చర్యలు:",
  },
}

export function AccurateMotionDetector({
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
  const faceDetectorRef = useRef<any>(null)
  const faceApiLoadedRef = useRef<boolean>(false)

  // State
  const [isTracking, setIsTracking] = useState(autoTracking)
  const [inFrame, setInFrame] = useState(false)
  const [confidence, setConfidence] = useState(0)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [lightingWarning, setLightingWarning] = useState(false)
  const [showControls] = useState(true)
  const [isInitializing, setIsInitializing] = useState(true)

  // Detection state persistence
  const lastDetectionsRef = useRef<{time: number, detected: boolean, confidence: number}[]>([])
  const detectionThresholdRef = useRef(2) // Number of consecutive detections needed to change state (lowered for more sensitivity)

  // Load face detection API
  const loadFaceDetection = async () => {
    try {
      // First try to load face-api.js if it's not already loaded
      if (!(window as any).faceapi && !faceApiLoadedRef.current) {
        // Check if the script is already loaded
        const existingScript = document.querySelector('script[src*="face-api.min.js"]');
        if (!existingScript) {
          // Load face-api.js script
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js';
          script.async = true;

          // Create a promise to wait for script to load
          const scriptLoadPromise = new Promise<void>((resolve, reject) => {
            script.onload = () => {
              console.log('face-api.js loaded successfully');
              faceApiLoadedRef.current = true;
              resolve();
            };
            script.onerror = () => {
              console.error('Failed to load face-api.js');
              reject(new Error('Failed to load face-api.js'));
            };
          });

          // Add script to document
          document.head.appendChild(script);

          // Wait for script to load
          await scriptLoadPromise;
        } else {
          console.log('face-api.js already loaded');
          faceApiLoadedRef.current = true;
        }
      }

      // Wait for face-api to be available
      if ((window as any).faceapi) {
        const faceapi = (window as any).faceapi;

        // Load models
        const modelUrl = 'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights';
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(modelUrl),
          faceapi.nets.faceLandmark68Net.loadFromUri(modelUrl),
        ]);

        console.log('face-api.js models loaded successfully');
        faceDetectorRef.current = new faceapi.TinyFaceDetector();
      } else {
        // Fallback to native FaceDetector API if available
        if ('FaceDetector' in window) {
          faceDetectorRef.current = new (window as any).FaceDetector({
            fastMode: true,
            maxDetectedFaces: 1
          });
          console.log("Native FaceDetector API loaded");
        } else {
          console.log("No face detection API available, using fallback detection");
        }
      }
    } catch (error) {
      console.error("Error loading face detection:", error);
    } finally {
      setIsInitializing(false);
    }
  }

  // Initialize face detection when component mounts
  useEffect(() => {
    loadFaceDetection();

    return () => {
      // Cleanup
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }
  }, []);

  // Start/stop camera based on tracking state
  useEffect(() => {
    if (isTracking) {
      // Add a small delay to ensure DOM is ready
      setTimeout(() => {
        startCamera();
      }, 100);
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    }
  }, [isTracking]);

  // Global cleanup on component unmount
  useEffect(() => {
    // Auto-start if autoTracking is enabled
    if (autoTracking && !isTracking) {
      setIsTracking(true);
    }

    return () => {
      // Ensure everything is properly cleaned up
      if (streamRef.current) {
        const tracks = streamRef.current.getTracks();
        tracks.forEach(track => {
          try {
            track.stop();
          } catch (e) {
            console.error('Error stopping track:', e);
          }
        });
        streamRef.current = null;
      }

      if (animationRef.current) {
        try {
          cancelAnimationFrame(animationRef.current);
        } catch (e) {
          console.error('Error canceling animation frame:', e);
        }
        animationRef.current = 0;
      }

      // Reset state
      setIsTracking(false);
      setInFrame(false);
      setConfidence(0);
      setLightingWarning(false);

      // Clear video source
      if (videoRef.current) {
        try {
          videoRef.current.srcObject = null;
        } catch (e) {
          console.error('Error clearing video source:', e);
        }
      }
    }
  }, [autoTracking]);

  // Start camera
  const startCamera = async () => {
    try {
      setCameraError(null);

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(translations.browserNotSupported[language]);
      }

      let stream = null;

      // First try to get the camera with ideal settings
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 640 },
            height: { ideal: 480 }
          },
          audio: false
        });
      } catch (initialError) {
        console.warn('Failed with ideal settings, trying fallback:', initialError);

        // Check for specific error types
        if (initialError.name === 'NotFoundError' || initialError.name === 'DevicesNotFoundError') {
          throw new Error('No camera detected. Please connect a camera and try again.');
        } else if (initialError.name === 'NotAllowedError' || initialError.name === 'PermissionDeniedError') {
          throw new Error('Camera access denied. Please allow camera access in your browser settings.');
        } else if (initialError.name === 'NotReadableError' || initialError.name === 'TrackStartError') {
          throw new Error('Camera is in use by another application. Please close other applications that might be using your camera.');
        }

        // Try with any video settings as a last resort
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
          });
        } catch (fallbackError) {
          console.error('Fallback camera access failed:', fallbackError);
          throw new Error('Could not access your camera. Please check your camera connection and browser permissions.');
        }
      }

      // Store the stream
      streamRef.current = stream;

      if (!videoRef.current) {
        throw new Error('Video element not found. Please refresh the page.');
      }

      // Set up the video element
      videoRef.current.srcObject = streamRef.current;

      // Add event listener for when video can play
      videoRef.current.onloadedmetadata = () => {
        if (videoRef.current) {
          videoRef.current.play().catch(e => {
            console.error('Error playing video:', e);
            setCameraError('Error playing video stream. Please refresh the page and try again.');
          });
        }
      };

      // Also try to play immediately
      try {
        await videoRef.current.play();
      } catch (playError) {
        console.warn('Immediate play failed, waiting for metadata:', playError);
        // We'll try again in the onloadedmetadata handler
      }

      // Start motion detection
      startMotionDetection();

      // Reset state
      setInFrame(false);
      setConfidence(0);
      setLightingWarning(false);
    } catch (error) {
      console.error('Error accessing camera:', error);

      // Provide a user-friendly error message
      let errorMessage = 'Could not access camera.';

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      setCameraError(errorMessage);
      setIsTracking(false);
    }
  };

  // Stop camera
  const stopCamera = () => {
    // Stop all tracks in the stream
    if (streamRef.current) {
      const tracks = streamRef.current.getTracks();
      tracks.forEach(track => track.stop());
      streamRef.current = null;
    }

    // Cancel animation frame
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = 0;
    }

    // Reset state
    setInFrame(false);
    setConfidence(0);
    setLightingWarning(false);
  };

  // Restart camera
  const restartCamera = () => {
    stopCamera();
    setTimeout(() => {
      startCamera();
    }, 1000);
  };

  // Start motion detection
  const startMotionDetection = () => {
    if (!videoRef.current || !canvasRef.current) return;

    console.log('Starting motion detection loop');

    const detectMotion = async () => {
      // Always request the next frame first to ensure continuous monitoring
      animationRef.current = requestAnimationFrame(detectMotion);

      if (!videoRef.current || !canvasRef.current || !streamRef.current) {
        return;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d', { willReadFrequently: true });

      if (!context) {
        console.error('Could not get canvas context');
        return;
      }

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Clear the canvas
      context.clearRect(0, 0, canvas.width, canvas.height);

      try {
        // Check if video is playing and has dimensions
        if (video.readyState === video.HAVE_ENOUGH_DATA &&
            video.videoWidth > 0 &&
            video.videoHeight > 0) {

          let faceDetected = false;
          let faceConfidence = 0;
          let detectionMessage = '';

          // Draw video frame to canvas for analysis
          context.drawImage(video, 0, 0, canvas.width, canvas.height);

          // Check lighting conditions
          const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;

          // Calculate average brightness
          let totalBrightness = 0;
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            // Calculate brightness using perceived luminance formula
            const brightness = (0.299 * r + 0.587 * g + 0.114 * b);
            totalBrightness += brightness;
          }

          const avgBrightness = totalBrightness / (data.length / 4);

          // Check if lighting is too dark
          if (avgBrightness < 40) {
            setLightingWarning(true);
            detectionMessage = translations.poorLightingMessage[language];
          } else {
            setLightingWarning(false);
          }

          // Use face-api.js if available
          if ((window as any).faceapi && faceApiLoadedRef.current) {
            try {
              const faceapi = (window as any).faceapi;

              // Use a very low threshold for better detection
              const detections = await faceapi.detectAllFaces(
                video,
                new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.1 })
              );

              console.log('Face API detections:', detections ? detections.length : 0,
                detections && detections.length > 0 ? `score: ${detections[0].score}` : '');

              if (detections && detections.length > 0) {
                faceDetected = true;
                // Get confidence from the detection
                faceConfidence = Math.round(detections[0].score * 100);

                // Draw face detection rectangle
                const detection = detections[0];
                const box = detection.box;

                context.strokeStyle = '#4ade80'; // Green color
                context.lineWidth = 2;
                context.strokeRect(box.x, box.y, box.width, box.height);

                // Add text label
                context.fillStyle = '#4ade80';
                context.font = '12px sans-serif';
                context.fillText(`Face: ${faceConfidence}%`, box.x, box.y - 5);
              } else {
                faceDetected = false;
                faceConfidence = 0;
              }
            } catch (faceError) {
              console.error('Face detection error:', faceError);
              // Fall back to native FaceDetector API or pixel-based detection
              faceDetected = false;
              faceConfidence = 0;
            }
          }
          // Use native FaceDetector API if available
          else if (faceDetectorRef.current && 'FaceDetector' in window) {
            try {
              const faces = await faceDetectorRef.current.detect(video);

              if (faces && faces.length > 0) {
                faceDetected = true;
                faceConfidence = 90; // High confidence with face detection API

                // Draw face detection rectangle
                const face = faces[0];
                const { top, left, width, height } = face.boundingBox;

                context.strokeStyle = '#4ade80'; // Green color
                context.lineWidth = 2;
                context.strokeRect(left, top, width, height);
              } else {
                faceDetected = false;
                faceConfidence = 0;
              }
            } catch (faceError) {
              console.error('Face detection error:', faceError);
              // Fall back to pixel-based detection
              faceDetected = false;
              faceConfidence = 0;
            }
          } else {
            // Fallback to pixel-based detection
            // This is less accurate but works when face detection APIs are not available
            console.log('Using fallback pixel-based detection');

            // Calculate brightness variation (standard deviation)
            let sumSquaredDifferences = 0;
            let pixelCount = 0;

            // Sample pixels (analyze every 4th pixel for performance)
            for (let i = 0; i < data.length; i += 16) {
              const r = data[i];
              const g = data[i + 1];
              const b = data[i + 2];
              const pixelBrightness = (0.299 * r + 0.587 * g + 0.114 * b);
              const difference = pixelBrightness - avgBrightness;
              sumSquaredDifferences += difference * difference;
              pixelCount++;
            }

            const brightnessStdDev = Math.sqrt(sumSquaredDifferences / pixelCount);

            console.log('Brightness analysis:', {
              avgBrightness,
              brightnessStdDev,
              pixelCount
            });

            // Detect face based on brightness variation
            // Higher variation usually indicates a face is present (more features)
            // Very low threshold for better detection
            if (brightnessStdDev > 20 && avgBrightness > 20) {
              faceDetected = true;
              faceConfidence = Math.min(80, Math.round(brightnessStdDev / 1.5));

              // Draw a generic face detection rectangle in the center
              const centerX = canvas.width / 2;
              const centerY = canvas.height / 2;
              const width = canvas.width / 3;
              const height = canvas.height / 2;

              context.strokeStyle = '#4ade80'; // Green color
              context.lineWidth = 2;
              context.strokeRect(centerX - width/2, centerY - height/2, width, height);

              // Add text label
              context.fillStyle = '#4ade80';
              context.font = '12px sans-serif';
              context.fillText(`Detected: ${faceConfidence}%`, centerX - width/2, centerY - height/2 - 5);
            } else {
              faceDetected = false;
              faceConfidence = 0;

              // Add text label for debugging
              context.fillStyle = '#ef4444';
              context.font = '12px sans-serif';
              context.fillText(`No face detected (StdDev: ${Math.round(brightnessStdDev)}, Brightness: ${Math.round(avgBrightness)})`, 10, 20);
            }
          }

          // Add current detection to history
          const currentTime = Date.now();
          lastDetectionsRef.current.push({
            time: currentTime,
            detected: faceDetected,
            confidence: faceConfidence
          });

          // Keep only recent detections (last 2 seconds)
          lastDetectionsRef.current = lastDetectionsRef.current.filter(
            d => currentTime - d.time < 2000
          );

          // Calculate detection state based on history
          const recentDetections = lastDetectionsRef.current;
          const detectionCount = recentDetections.filter(d => d.detected).length;
          const nonDetectionCount = recentDetections.length - detectionCount;

          // Determine if person is in frame based on recent history
          // Need multiple consecutive detections to change state
          let stableInFrame = inFrame; // Start with current state

          // Bias toward detecting faces - require fewer positive detections than negative ones
          if (detectionCount >= detectionThresholdRef.current) {
            // Multiple detections = person is in frame
            stableInFrame = true;
          } else if (nonDetectionCount >= detectionThresholdRef.current + 1) { // Require more non-detections
            // Multiple non-detections = person is not in frame
            stableInFrame = false;
          }

          // If we have any detections and current state is out of frame, be more lenient
          if (!stableInFrame && detectionCount > 0) {
            // Even a single detection can flip state to in-frame if we're currently out of frame
            // This makes the detector more responsive to people entering the frame
            stableInFrame = true;
          }

          // Calculate average confidence from positive detections
          let avgConfidence = faceConfidence;
          if (detectionCount > 0) {
            const totalConfidence = recentDetections
              .filter(d => d.detected)
              .reduce((sum, d) => sum + d.confidence, 0);
            avgConfidence = Math.round(totalConfidence / detectionCount);
          }

          // Log detection state
          console.log(`Detection state: ${stableInFrame ? 'IN FRAME' : 'OUT OF FRAME'} (${detectionCount}/${recentDetections.length} positive detections, avg confidence: ${avgConfidence}%)`);

          // Update state
          setInFrame(stableInFrame);
          setConfidence(avgConfidence);

          // Call callback if provided
          if (onMotionDetected) {
            onMotionDetected({
              inFrame: stableInFrame,
              confidence: avgConfidence,
              timestamp: new Date(),
              message: detectionMessage || (stableInFrame ? translations.stayInFrame[language] : translations.returnToFrame[language])
            });
          }
        }
      } catch (error) {
        console.error('Error in motion detection:', error);
      }
    };

    // Start detection loop
    animationRef.current = requestAnimationFrame(detectMotion);
    console.log('Motion detection loop started');
  };

  // Toggle tracking
  const toggleTracking = () => {
    setIsTracking(prev => !prev);
  };

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
          <div className="relative" style={{ minHeight: '320px', maxHeight: '320px', overflow: 'hidden' }}>
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-destructive/10 dark:bg-destructive/20 rounded-md border border-destructive/30 dark:border-destructive/40">
              <AlertTriangle size={40} className="text-destructive mb-4" />
              <h3 className="text-lg font-bold text-destructive mb-2">{translations.cameraError[language]}</h3>
              <p className="text-center mb-4">{cameraError}</p>

              <div className="space-y-4 w-full max-w-md">
                <Alert variant="destructive" className="py-2">
                  <AlertTitle>{translations.troubleshootingSteps[language]}</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
                      <li>Make sure your camera is connected and working</li>
                      <li>Check if another application is using your camera</li>
                      <li>Allow camera access in your browser settings</li>
                      <li>Try refreshing the page</li>
                    </ul>
                  </AlertDescription>
                </Alert>

                <Button
                  onClick={restartCamera}
                  className="w-full"
                  variant="default"
                >
                  <RefreshCw size={16} className="mr-2" />
                  {translations.restart[language]}
                </Button>
              </div>
            </div>
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

            {/* Low lighting warning */}
            {lightingWarning && (
              <div className="absolute top-14 right-2 z-10 flex items-center gap-2 bg-amber-500/90 dark:bg-amber-600/90 text-white dark:text-white backdrop-blur-sm rounded-md px-3 py-2 shadow-md animate-pulse">
                <AlertTriangle size={16} />
                <div>
                  <span className="text-sm font-medium block">
                    {translations.poorLighting[language]}
                  </span>
                  <span className="text-xs block">
                    {translations.poorLightingMessage[language]}
                  </span>
                </div>
              </div>
            )}

            {/* Initializing message */}
            {isInitializing && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 dark:bg-background/80 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-sm font-medium">Initializing camera...</p>
                </div>
              </div>
            )}

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
  );
}
