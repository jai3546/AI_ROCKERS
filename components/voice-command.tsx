"use client"

import { useState, useEffect, useRef } from "react"
import { Mic, MicOff, Volume2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface VoiceCommandProps {
  onCommand?: (command: string) => void
  language?: "en" | "hi" | "te"
  availableCommands?: string[]
  hideCommands?: boolean
}

// Define a type for the SpeechRecognition object
interface IWindow extends Window {
  webkitSpeechRecognition: any
  SpeechRecognition: any
}

export function VoiceCommand({ onCommand, language = "en", availableCommands = [], hideCommands = false }: VoiceCommandProps) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [confidence, setConfidence] = useState(0)
  const [animationState, setAnimationState] = useState<"idle" | "listening" | "processing" | "success" | "error">(
    "idle",
  )
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const recognitionRef = useRef<any>(null)

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const windowWithSpeech = window as unknown as IWindow
      const SpeechRecognition = windowWithSpeech.SpeechRecognition || windowWithSpeech.webkitSpeechRecognition

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition()
        recognition.continuous = false
        recognition.interimResults = false
        recognition.maxAlternatives = 1

        // Set language based on prop
        switch(language) {
          case "hi":
            recognition.lang = "hi-IN"
            break
          case "te":
            recognition.lang = "te-IN"
            break
          default:
            recognition.lang = "en-US"
        }

        recognition.onstart = () => {
          setIsListening(true)
          setAnimationState("listening")
        }

        recognition.onresult = (event: any) => {
          setAnimationState("processing")
          const result = event.results[0][0]
          const resultTranscript = result.transcript
          const resultConfidence = Math.floor(result.confidence * 100)

          setTranscript(resultTranscript)
          setConfidence(resultConfidence)
          setAnimationState("success")

          // Process command
          if (onCommand) {
            onCommand(resultTranscript)
          }

          // Play success sound
          const audio = new Audio("/success-chime.mp3")
          audio.volume = 0.5
          audio.play().catch((e) => console.log("Audio play failed:", e))

          // Reset after a delay
          timeoutRef.current = setTimeout(() => {
            setIsListening(false)
            setAnimationState("idle")
            setTranscript("")
          }, 2000)
        }

        recognition.onerror = (event: any) => {
          console.error("Speech recognition error", event.error)
          setAnimationState("error")

          // Reset after a delay
          timeoutRef.current = setTimeout(() => {
            setIsListening(false)
            setAnimationState("idle")
            setTranscript("")
          }, 2000)
        }

        recognition.onend = () => {
          if (animationState === "listening") {
            setAnimationState("idle")
            setIsListening(false)
          }
        }

        recognitionRef.current = recognition
      } else {
        console.error("Speech recognition not supported in this browser")
      }
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort()
        } catch (e) {
          console.error("Error stopping speech recognition", e)
        }
      }

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [language, onCommand])

  // Toggle listening state
  const toggleListening = () => {
    if (isListening) {
      // Stop listening
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort()
        } catch (e) {
          console.error("Error stopping speech recognition", e)
        }
      }
      setIsListening(false)
      setAnimationState("idle")
      setTranscript("")
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    } else {
      // Start listening
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start()
        } catch (e) {
          console.error("Error starting speech recognition", e)
          // Fallback to mock if real recognition fails
          mockRecognition()
        }
      } else {
        // Fallback to mock if real recognition is not available
        mockRecognition()
      }
    }
  }

  // Mock recognition as fallback
  const mockRecognition = () => {
    setIsListening(true)
    setAnimationState("listening")

    timeoutRef.current = setTimeout(() => {
      setAnimationState("processing")

      // Generate random confidence level (70-100%)
      const randomConfidence = Math.floor(Math.random() * 30) + 70
      setConfidence(randomConfidence)

      setTimeout(() => {
        const mockCommands =
          availableCommands.length > 0
            ? availableCommands[Math.floor(Math.random() * availableCommands.length)]
            : {
                en: "Start learning",
                hi: "सीखना शुरू करें",
                te: "నేర్చుకోవడం ప్రారంభించండి",
              }[language]

        setTranscript(typeof mockCommands === "string" ? mockCommands : "")
        setAnimationState("success")

        // Process command
        if (onCommand) {
          onCommand(typeof mockCommands === "string" ? mockCommands : "")
        }

        // Play success sound
        const audio = new Audio("/success-chime.mp3")
        audio.volume = 0.5
        audio.play().catch((e) => console.log("Audio play failed:", e))

        // Reset after a delay
        timeoutRef.current = setTimeout(() => {
          setIsListening(false)
          setAnimationState("idle")
          setTranscript("")
        }, 2000)
      }, 1000)
    }, 1500)
  }

  return (
    <>
      <button
        onClick={toggleListening}
        className={`microphone-button ${animationState !== "idle" ? "listening" : ""}`}
        aria-label={isListening ? "Stop listening" : "Start listening"}
      >
        {animationState === "processing" ? (
          <div className="animate-spin h-6 w-6 border-2 border-primary-foreground rounded-full border-t-transparent" />
        ) : animationState === "success" ? (
          <Volume2 size={24} />
        ) : isListening ? (
          <MicOff size={24} />
        ) : (
          <Mic size={24} />
        )}

        {/* Pulse animation when listening */}
        {animationState === "listening" && (
          <span className="absolute w-full h-full rounded-full bg-primary/20 animate-pulse-ring" />
        )}

        {/* Success animation */}
        {animationState === "success" && (
          <span className="absolute w-full h-full rounded-full bg-green-500/20 animate-pulse-ring" />
        )}
      </button>

      {/* Available commands */}
      <AnimatePresence>
        {!hideCommands && availableCommands.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 right-6 z-40 flex flex-col gap-2 max-w-xs"
          >
            {availableCommands.map((command, index) => (
              <motion.div
                key={index}
                className="voice-command voice-command-transparent"
                whileHover={{ scale: 1.05, opacity: 1 }}
                whileTap={{ scale: 0.95, opacity: 1 }}
                onClick={() => {
                  if (onCommand) onCommand(command)
                  setTranscript(command)
                  setAnimationState("success")
                  setTimeout(() => {
                    setAnimationState("idle")
                    setTranscript("")
                  }, 2000)
                }}
              >
                <Mic size={16} className="voice-command-icon" />
                <span>Say "{command}"</span>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transcript display with confidence */}
      <AnimatePresence>
        {transcript && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground font-medium"
          >
            <div className="flex flex-col items-center">
              <span>{transcript}</span>
              {confidence > 0 && (
                <div className="w-full bg-secondary-foreground/20 h-1 mt-2 rounded-full overflow-hidden">
                  <div className="bg-secondary-foreground h-full rounded-full" style={{ width: `${confidence}%` }} />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
