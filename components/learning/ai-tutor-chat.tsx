"use client"

import type React from "react"
import { motion } from "framer-motion"
import { ArrowUp, Bot, Lightbulb, Mic, Send, User, BookOpen, Brain, Atom, Eye, Headphones, Activity, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChatbotIcon } from "@/components/chatbot-icon"
import { MentorMatching } from "@/components/learning/mentor-matching"
import { getGeminiResponse, type Subject, type EmotionState } from "@/services/gemini-api"
import { LearningStyleProfile, initialLearningStyleProfile, updateLearningStyleProfile, type LearningStyle } from "@/services/learning-style-service"
import { detectConceptFromText } from "@/services/concept-tagging-service"
import { LearningMemoryService } from "@/services/learning-memory-service"
import { useState, useRef, useEffect } from "react"

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

function MessageContent({ content }: { content: string }) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const mermaidBlocks = el.querySelectorAll('.mermaid-block')
    if (mermaidBlocks.length === 0) return

    import('mermaid').then((m) => {
      m.default.initialize({ startOnLoad: false, theme: 'neutral' })
      mermaidBlocks.forEach(async (block) => {
        const code = block.getAttribute('data-code') || ''
        const id = 'mermaid-' + Math.random().toString(36).substr(2, 9)
        try {
          const { svg } = await m.default.render(id, code)
          block.innerHTML = svg
        } catch {
          block.innerHTML = `<pre>${code}</pre>`
        }
      })
    })
  }, [content])

  const parts = content.split(/(```mermaid[\s\S]*?```)/g)
  return (
    <div ref={containerRef} className="text-sm space-y-2">
      {parts.map((part, i) => {
        if (part.startsWith('```mermaid')) {
          const code = part.replace(/```mermaid\n?/, '').replace(/```$/, '').trim()
          return <div key={i} className="mermaid-block w-full overflow-x-auto" data-code={code} />
        }
        return <p key={i} className="whitespace-pre-wrap">{part}</p>
      })}
    </div>
  )
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
    askQuestion: { en: "Ask a question...", hi: "प्रश्न पूछें...", te: "ప్రశ్న అడగండి..." },
    chatTab: { en: "AI Chat", hi: "AI चैट", te: "AI చాట్" },
    mentorTab: { en: "Find Mentor", hi: "मेंटर खोजें", te: "మెంటార్ కనుగొనండి" },
    send: { en: "Send", hi: "भेजें", te: "పంపండి" },
    suggestions: {
      en: ["Explain photosynthesis", "Help with math problem", "What is gravity?", "Translate to Hindi"],
      hi: ["प्रकाश संश्लेषण समझाएं", "गणित समस्या में मदद करें", "गुरुत्वाकर्षण क्या है?", "अंग्रेजी में अनुवाद करें"],
      te: ["కిరణజన్య సంయోగక్రియను వివరించండి", "గణిత సమస్యతో సహాయం చేయండి", "గురుత్వాకర్షణ అంటే ఏమిటి?", "ఇంగ్లీషులోకి అనువదించండి"],
    },
  }

  function getWelcomeMessage(lang: string) {
    switch (lang) {
      case "hi": return "नमस्ते! मैं आपका AI ट्यूटर हूँ। आज मैं आपकी किस विषय में मदद कर सकता हूँ?"
      case "te": return "హలో! నేను మీ AI ట్యూటర్ని. నేను ఈరోజు మీకు ఎలా సహాయం చేయగలను?"
      default: return "Hello! I'm your AI tutor. How can I help you learn today?"
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    if (emotionState) setCurrentEmotionState(emotionState)
  }, [emotionState])

  useEffect(() => {
    if (learningStyle) setCurrentLearningStyle(learningStyle)
  }, [learningStyle])

  // Explicit User Option Overrides
  const handleManualStyleOverride = (style: LearningStyle) => {
    const forcedProfile: LearningStyleProfile = {
      primaryStyle: style,
      secondaryStyle: "unknown",
      visualScore: style === "visual" ? 100 : 0,
      auditoryScore: style === "auditory" ? 100 : 0,
      kinestheticScore: style === "kinesthetic" ? 100 : 0,
      lastUpdated: new Date()
    }
    setCurrentLearningStyle(forcedProfile)
    if (onLearningStyleUpdate) {
      onLearningStyleUpdate(forcedProfile)
    }
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsTyping(true)

    let updatedLearningStyle = currentLearningStyle

    // Only update automatically via text parser if user hasn't hardcoded a specific style choice
    if (currentLearningStyle.visualScore !== 100 && currentLearningStyle.auditoryScore !== 100 && currentLearningStyle.kinestheticScore !== 100) {
      updatedLearningStyle = updateLearningStyleProfile(currentLearningStyle, {
        textInteractions: 1,
        videoInteractions: userMessage.content.toLowerCase().match(/(video|see|show)/) ? 1 : 0,
        audioInteractions: userMessage.content.toLowerCase().match(/(audio|hear|listen)/) ? 1 : 0,
        practicalInteractions: userMessage.content.toLowerCase().match(/(practice|try|do)/) ? 1 : 0
      })
      setCurrentLearningStyle(updatedLearningStyle)
      if (onLearningStyleUpdate) {
        onLearningStyleUpdate(updatedLearningStyle)
      }
    }

    let detectedConceptId = ""
    let personalizationInstructions = ""
    const detectedConcept = detectConceptFromText(userMessage.content)
    
    if (detectedConcept) {
      detectedConceptId = detectedConcept.id
      const graph = LearningMemoryService.getConceptGraph(studentId)
      const node = graph.find(n => n.id === detectedConceptId)
      
      if (node) {
        if (node.mastery < 50) {
          personalizationInstructions = `[PERSONALIZATION INFO: The student has LOW mastery (${node.mastery}%) in this topic. Provide an extremely simple, basic explanation with extra examples, broken down step-by-step.]`
        } else if (node.mastery > 75) {
          personalizationInstructions = `[PERSONALIZATION INFO: The student has HIGH mastery (${node.mastery}%) in this topic. Provide an advanced explanation with deep insights and challenge them with a tough question.]`
        } else {
          personalizationInstructions = `[PERSONALIZATION INFO: The student has MODERATE mastery (${node.mastery}%) in this topic. Reinforce their understanding and check for clarity.]`
        }
      }

      LearningMemoryService.recordActivity(studentId, detectedConceptId, {
        activityType: "tutor",
        confusionDetected: currentEmotionState?.emotion === "confused",
        engagement: 80
      })
    }

    try {
      const finalPrompt = personalizationInstructions 
        ? `${personalizationInstructions}\n\n${userMessage.content}` 
        : userMessage.content

      const response = await getGeminiResponse(
        finalPrompt,
        currentSubject,
        language,
        updatedLearningStyle,
        currentEmotionState
      )

      const botMessage: Message = {
        id: Date.now().toString(),
        content: response.text,
        sender: "bot",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, botMessage])
    } catch (error) {
      console.error('Error getting AI response:', error)
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
    setTimeout(() => { handleSendMessage() }, 100)
  }

  const toggleVoiceInput = () => {
    setIsListening(!isListening)
    if (!isListening) {
      setTimeout(() => {
        const randomSuggestion = translations.suggestions[language][Math.floor(Math.random() * translations.suggestions[language].length)]
        setInputValue(randomSuggestion)
        setIsListening(false)
      }, 2000)
    }
  }

  return (
    <div className="flex flex-col h-full max-h-[600px] bg-white dark:bg-card rounded-xl border border-border dark:border-border shadow-md overflow-hidden">
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
          {/* Main Top Header Area */}
          <div className="bg-primary/10 p-4 flex items-center justify-between border-b">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <ChatbotIcon className="w-8 h-8" />
                <div>
                  <h3 className="font-bold text-primary leading-tight">AI Tutor</h3>
                  
                  {/* Status Indicator Bar */}
                  <div className="flex gap-1.5 mt-1 flex-wrap">
                    {currentLearningStyle.primaryStyle !== 'unknown' && (
                      <div
                        className="flex items-center gap-1 bg-secondary/20 px-2 py-0.5 rounded-full text-[11px] font-medium cursor-pointer"
                        onClick={() => setShowLearningStyleInfo(!showLearningStyleInfo)}
                      >
                        {currentLearningStyle.primaryStyle === 'visual' && <Eye size={11} />}
                        {currentLearningStyle.primaryStyle === 'auditory' && <Headphones size={11} />}
                        {currentLearningStyle.primaryStyle === 'kinesthetic' && <Activity size={11} />}
                        <span className="capitalize">{currentLearningStyle.primaryStyle} mode</span>
                      </div>
                    )}

                    {currentEmotionState && (
                      <div className="flex items-center gap-1 bg-primary/20 px-2 py-0.5 rounded-full text-[11px] font-medium">
                        <span className="capitalize">{currentEmotionState.emotion}</span>
                        {currentEmotionState.fatigueScore !== undefined && currentEmotionState.fatigueScore > 50 && (
                          <span className="text-destructive font-semibold">• Fatigue</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Subject Selectors */}
              <div className="flex gap-1 mt-1">
                <Button
                  variant={currentSubject === "math" ? "secondary" : "ghost"}
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => setCurrentSubject("math")}
                >
                  <Brain size={14} className="mr-1" />
                  Math
                </Button>
                <Button
                  variant={currentSubject === "science" ? "secondary" : "ghost"}
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => setCurrentSubject("science")}
                >
                  <Atom size={14} className="mr-1" />
                  Science
                </Button>
                <Button
                  variant={currentSubject === "general" ? "secondary" : "ghost"}
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => setCurrentSubject("general")}
                >
                  <BookOpen size={14} className="mr-1" />
                  General
                </Button>
              </div>
            </div>

            {/* Right Side Stack: Manual Learning Mode Trigger Controls */}
            <div className="flex flex-col gap-1 pl-3 border-l border-primary/20">
              <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5 text-center block">
                Learning Mode
              </span>
              
              <Button
                variant={currentLearningStyle.primaryStyle === 'visual' ? 'default' : 'outline'}
                size="sm"
                className="h-7 text-xs w-28 justify-start gap-1.5 px-2"
                onClick={() => handleManualStyleOverride('visual')}
              >
                <Eye size={12} />
                Visual
              </Button>

              <Button
                variant={currentLearningStyle.primaryStyle === 'auditory' ? 'default' : 'outline'}
                size="sm"
                className="h-7 text-xs w-28 justify-start gap-1.5 px-2"
                onClick={() => handleManualStyleOverride('auditory')}
              >
                <Headphones size={12} />
                Auditory
              </Button>

              <Button
                variant={currentLearningStyle.primaryStyle === 'kinesthetic' ? 'default' : 'outline'}
                size="sm"
                className="h-7 text-xs w-28 justify-start gap-1.5 px-2"
                onClick={() => handleManualStyleOverride('kinesthetic')}
              >
                <Activity size={12} />
                Kinesthetic
              </Button>
            </div>
          </div>

          {/* Profiler Metrics Card */}
          {showLearningStyleInfo && (
            <div className="m-3 p-2.5 bg-secondary/10 dark:bg-secondary/20 rounded-md text-xs text-foreground animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="font-semibold mb-1.5">Live Trait Distribution</div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Eye size={12} /> <span>Visual: {Math.round(currentLearningStyle.visualScore)}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1 mt-1">
                    <div className="bg-blue-500 h-1 rounded-full" style={{ width: `${currentLearningStyle.visualScore}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Headphones size={12} /> <span>Auditory: {Math.round(currentLearningStyle.auditoryScore)}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1 mt-1">
                    <div className="bg-purple-500 h-1 rounded-full" style={{ width: `${currentLearningStyle.auditoryScore}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Activity size={12} /> <span>Kinesthetic: {Math.round(currentLearningStyle.kinestheticScore)}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1 mt-1">
                    <div className="bg-green-500 h-1 rounded-full" style={{ width: `${currentLearningStyle.kinestheticScore}%` }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Interactive Chat Canvas */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`flex gap-2 max-w-[80%] ${message.sender === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.sender === "user" ? "bg-secondary/20" : "bg-primary/20"}`}>
                    {message.sender === "user" ? <User size={16} className="text-secondary" /> : <Bot size={16} className="text-primary" />}
                  </div>

                  <div className={`p-3 rounded-lg ${message.sender === "user" ? "bg-secondary text-secondary-foreground" : "bg-muted text-foreground"}`}>
                    <MessageContent content={message.content} />
                    <div className="text-[10px] opacity-60 mt-1 text-right">
                      {new Intl.DateTimeFormat(language === "en" ? "en-US" : language === "hi" ? "hi-IN" : "te-IN", {
                        hour: "2-digit", minute: "2-digit",
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
                      {[0, 0.2, 0.4].map((delay, index) => (
                        <motion.div
                          key={index}
                          className="w-1.5 h-1.5 bg-foreground/50 rounded-full"
                          animate={{ y: [0, -4, 0] }}
                          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 0.8, delay }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Context Suggestions Panel */}
          {messages.length < 3 && (
            <div className="px-4 py-2 border-t border-border bg-muted/20">
              <p className="text-[11px] text-foreground/70 mb-1.5 flex items-center gap-1">
                <Lightbulb size={12} className="text-yellow-500" /> Try asking:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {translations.suggestions[language].map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="text-xs h-7 bg-background text-muted-foreground border-border hover:bg-muted"
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Workspace Footer Inputs */}
          <div className="p-3 border-t border-border flex items-center gap-2 bg-background">
            <Button
              variant="ghost"
              size="icon"
              className={`rounded-full h-9 w-9 flex-shrink-0 ${isListening ? "bg-destructive/10 text-destructive animate-pulse" : ""}`}
              onClick={toggleVoiceInput}
            >
              <Mic size={18} />
            </Button>

            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={translations.askQuestion[language]}
              className="flex-1 h-9 text-sm"
            />

            <Button
              variant="ghost"
              size="icon"
              className="rounded-full h-9 w-9 text-primary flex-shrink-0"
              onClick={handleSendMessage}
              disabled={!inputValue.trim()}
            >
              <Send size={18} />
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="mentor" className="flex-1 overflow-hidden">
          <div className="p-4 h-full overflow-y-auto">
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
