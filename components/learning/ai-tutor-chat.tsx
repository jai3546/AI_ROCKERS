"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowUp, Bot, Lightbulb, Mic, Send, User, BookOpen, Brain, Atom, Eye, Headphones, Activity, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChatbotIcon } from "@/components/chatbot-icon"
import { MentorMatching } from "@/components/learning/mentor-matching"
import { getGeminiResponse, getMockGeminiResponse, type Subject, type EmotionState } from "@/services/gemini-api"
import { LearningStyleProfile, initialLearningStyleProfile, updateLearningStyleProfile } from "@/services/learning-style-service"

interface Message {
  id: string
  content: string
  sender: "user" | "bot"
  timestamp: Date
}

interface AiTutorChatProps {
  language?: "en" | "hi" | "te"
  onClose?: () => void
  subject?: Subject
  emotionState?: EmotionState
  learningStyle?: LearningStyleProfile
  onLearningStyleUpdate?: (profile: LearningStyleProfile) => void
  studentId?: string
}

export function AiTutorChat({
  language = "en",
  onClose,
  subject = "general",
  emotionState,
  learningStyle = initialLearningStyleProfile,
  onLearningStyleUpdate,
  studentId = "S001"
}: AiTutorChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: getWelcomeMessage(language),
      sender: "bot",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [currentSubject, setCurrentSubject] = useState<Subject>(subject)
  const [currentLearningStyle, setCurrentLearningStyle] = useState<LearningStyleProfile>(learningStyle)
  const [currentEmotionState, setCurrentEmotionState] = useState<EmotionState | undefined>(emotionState)
  const [showLearningStyleInfo, setShowLearningStyleInfo] = useState(false)
  const [activeTab, setActiveTab] = useState<"chat" | "mentor">("chat")
  const [selectedMentorId, setSelectedMentorId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const translations = {
    askQuestion: {
      en: "Ask a question...",
      hi: "प्रश्न पूछें...",
      te: "ప్రశ్న అడగండి...",
    },
    chatTab: {
      en: "AI Chat",
      hi: "AI चैट",
      te: "AI చాట్",
    },
    mentorTab: {
      en: "Find Mentor",
      hi: "मेंटर खोजें",
      te: "మెంటార్ కనుగొనండి",
    },
    send: {
      en: "Send",
      hi: "भेजें",
      te: "పంపండి",
    },
    suggestions: {
      en: ["Explain photosynthesis", "Help with math problem", "What is gravity?", "Translate to Hindi"],
      hi: ["प्रकाश संश्लेषण समझाएं", "गणित समस्या में मदद करें", "गुरुत्वाकर्षण क्या है?", "अंग्रेजी में अनुवाद करें"],
      te: ["కిరణజన్య సంయోగక్రియను వివరించండి", "గణిత సమస్యతో సహాయం చేయండి", "గురుత్వాకర్షణ అంటే ఏమిటి?", "ఇంగ్లీషులోకి అనువదించండి"],
    },
  }

  function getWelcomeMessage(lang: string) {
    switch (lang) {
      case "hi":
        return "नमस्ते! मैं आपका AI ट्यूटर हूँ। आज मैं आपकी किस विषय में मदद कर सकता हूँ?"
      case "te":
        return "హలో! నేను మీ AI ట్యూటర్ని. నేను ఈరోజు మీకు ఎలా సహాయం చేయగలను?"
      default:
        return "Hello! I'm your AI tutor. How can I help you learn today?"
    }
  }

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Update emotion state when prop changes
  useEffect(() => {
    if (emotionState) {
      setCurrentEmotionState(emotionState)
    }
  }, [emotionState])

  // Update learning style when prop changes
  useEffect(() => {
    if (learningStyle) {
      setCurrentLearningStyle(learningStyle)
    }
  }, [learningStyle])

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsTyping(true)

    // Update learning style based on interaction
    const updatedLearningStyle = updateLearningStyleProfile(currentLearningStyle, {
      textInteractions: 1,
      // Detect if the message contains indicators of learning style preference
      videoInteractions: userMessage.content.toLowerCase().includes('video') ||
                        userMessage.content.toLowerCase().includes('see') ||
                        userMessage.content.toLowerCase().includes('show') ? 1 : 0,
      audioInteractions: userMessage.content.toLowerCase().includes('audio') ||
                         userMessage.content.toLowerCase().includes('hear') ||
                         userMessage.content.toLowerCase().includes('listen') ? 1 : 0,
      practicalInteractions: userMessage.content.toLowerCase().includes('practice') ||
                             userMessage.content.toLowerCase().includes('try') ||
                             userMessage.content.toLowerCase().includes('do') ? 1 : 0
    })

    setCurrentLearningStyle(updatedLearningStyle)

    // Notify parent component of learning style update
    if (onLearningStyleUpdate) {
      onLearningStyleUpdate(updatedLearningStyle)
    }

    try {
      // Try to get response from Gemini API
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY
      let response

      if (apiKey && apiKey !== 'your-api-key-here') {
        // Use the real API if key is available
        response = await getGeminiResponse(
          userMessage.content,
          currentSubject,
          language,
          currentLearningStyle,
          currentEmotionState
        )
      } else {
        // Fall back to mock responses if no API key
        response = getMockGeminiResponse(
          userMessage.content,
          currentSubject,
          language,
          currentLearningStyle,
          currentEmotionState
        )
      }

      // Create bot message from response
      const botMessage: Message = {
        id: Date.now().toString(),
        content: response.text,
        sender: "bot",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, botMessage])
    } catch (error) {
      console.error('Error getting AI response:', error)

      // Fallback message on error
      const errorMessage: Message = {
        id: Date.now().toString(),
        content: language === 'en'
          ? "I'm sorry, I couldn't process your request right now. Please try again later."
          : language === 'hi'
          ? "मुझे खेद है, मैं अभी आपके अनुरोध को प्रोसेस नहीं कर सका। कृपया बाद में पुनः प्रयास करें।"
          : "క్షమించండి, నేను ప్రస్తుతం మీ అభ్యర్థనను ప్రాసెస్ చేయలేకపోయాను. దయచేసి తర్వాత మళ్లీ ప్రయత్నించండి.",
        sender: "bot",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion)
    setTimeout(() => {
      handleSendMessage()
    }, 100)
  }

  const toggleVoiceInput = () => {
    setIsListening(!isListening)

    if (!isListening) {
      // Simulate voice recognition
      setTimeout(() => {
        const randomSuggestion =
          translations.suggestions[language][Math.floor(Math.random() * translations.suggestions[language].length)]
        setInputValue(randomSuggestion)
        setIsListening(false)
      }, 2000)
    }
  }

  return (
    <div className="flex flex-col h-full max-h-[600px] bg-white dark:bg-card rounded-xl border border-border dark:border-border shadow-md overflow-hidden">
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "chat" | "mentor")} className="flex flex-col h-full overflow-hidden">
        <div className="border-b border-border">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="chat" className="flex items-center gap-1">
              <Bot size={16} />
              {translations.chatTab[language]}
            </TabsTrigger>
            <TabsTrigger value="mentor" className="flex items-center gap-1">
              <Users size={16} />
              {translations.mentorTab[language]}
            </TabsTrigger>
          </TabsList>
        </div>
      <TabsContent value="chat" className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-primary/10 p-4 flex flex-col border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ChatbotIcon className="w-8 h-8" />
            <h3 className="font-bold text-primary">AI Tutor</h3>

            {/* Learning Style Indicator */}
            {currentLearningStyle.primaryStyle !== 'unknown' && (
              <div
                className="flex items-center gap-1 bg-secondary/20 px-2 py-0.5 rounded-full text-xs cursor-pointer"
                onClick={() => setShowLearningStyleInfo(!showLearningStyleInfo)}
              >
                {currentLearningStyle.primaryStyle === 'visual' && <Eye size={12} />}
                {currentLearningStyle.primaryStyle === 'auditory' && <Headphones size={12} />}
                {currentLearningStyle.primaryStyle === 'kinesthetic' && <Activity size={12} />}
                <span className="capitalize">{currentLearningStyle.primaryStyle} learner</span>
              </div>
            )}

            {/* Emotion Indicator */}
            {currentEmotionState && (
              <div className="flex items-center gap-1 bg-primary/20 px-2 py-0.5 rounded-full text-xs">
                <span className="capitalize">{currentEmotionState.emotion}</span>
                {currentEmotionState.fatigueScore !== undefined && currentEmotionState.fatigueScore > 50 && (
                  <span className="text-warning-500">• Fatigue: {currentEmotionState.fatigueScore}%</span>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose} className="h-8 px-2">
                <ArrowUp size={16} />
              </Button>
            )}
          </div>
        </div>

        {/* Learning Style Info Panel */}
        {showLearningStyleInfo && (
          <div className="mt-2 p-2 bg-secondary/10 dark:bg-secondary/20 rounded-md text-xs text-foreground dark:text-foreground">
            <div className="font-medium mb-1">Your Learning Profile</div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <div className="flex items-center gap-1">
                  <Eye size={12} />
                  <span>Visual: {Math.round(currentLearningStyle.visualScore)}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5 mt-1">
                  <div
                    className="bg-blue-500 h-1.5 rounded-full"
                    style={{ width: `${currentLearningStyle.visualScore}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <Headphones size={12} />
                  <span>Auditory: {Math.round(currentLearningStyle.auditoryScore)}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5 mt-1">
                  <div
                    className="bg-purple-500 h-1.5 rounded-full"
                    style={{ width: `${currentLearningStyle.auditoryScore}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <Activity size={12} />
                  <span>Kinesthetic: {Math.round(currentLearningStyle.kinestheticScore)}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5 mt-1">
                  <div
                    className="bg-green-500 h-1.5 rounded-full"
                    style={{ width: `${currentLearningStyle.kinestheticScore}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="text-xs mt-1 text-muted-foreground">
              Content is being personalized to your learning style.
            </div>
          </div>
        )}

        {/* Subject selector */}
        <div className="flex gap-1 mt-2">
          <Button
            variant={currentSubject === "math" ? "secondary" : "ghost"}
            size="sm"
            className="h-8 px-2"
            onClick={() => setCurrentSubject("math")}
          >
            <Brain size={16} className="mr-1" />
            Math
          </Button>
          <Button
            variant={currentSubject === "science" ? "secondary" : "ghost"}
            size="sm"
            className="h-8 px-2"
            onClick={() => setCurrentSubject("science")}
          >
            <Atom size={16} className="mr-1" />
            Science
          </Button>
          <Button
            variant={currentSubject === "general" ? "secondary" : "ghost"}
            size="sm"
            className="h-8 px-2"
            onClick={() => setCurrentSubject("general")}
          >
            <BookOpen size={16} className="mr-1" />
            General
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`flex gap-2 max-w-[80%] ${message.sender === "user" ? "flex-row-reverse" : "flex-row"}`}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.sender === "user" ? "bg-secondary/20" : "bg-primary/20"
                }`}
              >
                {message.sender === "user" ? (
                  <User size={16} className="text-secondary" />
                ) : (
                  <Bot size={16} className="text-primary" />
                )}
              </div>

              <div
                className={`p-3 rounded-lg ${
                  message.sender === "user" ? "bg-secondary text-secondary-foreground dark:bg-secondary dark:text-secondary-foreground" : "bg-muted dark:bg-muted/70 text-foreground dark:text-foreground"
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <div className="text-xs opacity-70 mt-1 text-right">
                  {new Intl.DateTimeFormat(language === "en" ? "en-US" : language === "hi" ? "hi-IN" : "te-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  }).format(message.timestamp)}
                </div>
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="flex gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <Bot size={16} className="text-primary" />
              </div>

              <div className="p-3 rounded-lg bg-muted flex items-center">
                <div className="flex space-x-1">
                  <motion.div
                    className="w-2 h-2 bg-foreground/50 rounded-full"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Number.POSITIVE_INFINITY, duration: 0.8, delay: 0 }}
                  />
                  <motion.div
                    className="w-2 h-2 bg-foreground/50 rounded-full"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Number.POSITIVE_INFINITY, duration: 0.8, delay: 0.2 }}
                  />
                  <motion.div
                    className="w-2 h-2 bg-foreground/50 rounded-full"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Number.POSITIVE_INFINITY, duration: 0.8, delay: 0.4 }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {messages.length < 3 && (
        <div className="px-4 py-2 border-t border-border">
          <p className="text-xs text-foreground/70 mb-2 flex items-center gap-1">
            <Lightbulb size={12} className="text-yellow-500" />
            Try asking:
          </p>
          <div className="flex flex-wrap gap-2">
            {translations.suggestions[language].map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleSuggestionClick(suggestion)}
                className="text-xs h-7 bg-muted/50 border-muted-foreground/20"
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="p-3 border-t border-border flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className={`rounded-full h-9 w-9 ${isListening ? "bg-red-100 text-red-500 animate-pulse" : ""}`}
          onClick={toggleVoiceInput}
        >
          <Mic size={18} />
        </Button>

        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={translations.askQuestion[language]}
          className="flex-1"
        />

        <Button
          variant="ghost"
          size="icon"
          className="rounded-full h-9 w-9 text-primary"
          onClick={handleSendMessage}
          disabled={!inputValue.trim()}
        >
          <Send size={18} />
        </Button>
      </div>
      </TabsContent>

      <TabsContent value="mentor" className="flex-1 overflow-hidden">
        <div className="p-4">
          <MentorMatching
            studentId={studentId}
            language={language}
            onSelectMentor={(mentorId) => setSelectedMentorId(mentorId)}
          />
        </div>
      </TabsContent>
      </Tabs>
    </div>
  )
}
