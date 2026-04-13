"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Smile, Frown, Meh, AlertTriangle, Eye, X, Brain, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { EmotionData } from "./real-time-emotion-detector"

interface EmotionDisplayProps {
  emotionData: EmotionData | null
  showHeader?: boolean
  showControls?: boolean
  onClose?: () => void
  language?: "en" | "hi" | "te"
  className?: string
  showEmotionHistory?: boolean
  emotionHistory?: EmotionData[]
}

export function EmotionDisplay({
  emotionData,
  showHeader = true,
  showControls = true,
  onClose,
  language = "en",
  className = "",
  showEmotionHistory = true,
  emotionHistory = []
}: EmotionDisplayProps) {
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackTimeout, setFeedbackTimeout] = useState<NodeJS.Timeout | null>(null)

  const translations = {
    title: {
      en: "Emotion Analysis",
      hi: "भावना विश्लेषण",
      te: "భావోద్వేగ విశ్లేషణ",
    },
    confidence: {
      en: "Confidence",
      hi: "विश्वास",
      te: "నమ్మకం",
    },
    attention: {
      en: "Attention",
      hi: "ध्यान",
      te: "శ్రద్ధ",
    },
    fatigue: {
      en: "Fatigue",
      hi: "थकान",
      te: "అలసట",
    },
    emotionHistory: {
      en: "Emotion History",
      hi: "भावना इतिहास",
      te: "భావోద్వేగ చరిత్ర",
    },
    feedback: {
      en: "Feedback",
      hi: "प्रतिक्रिया",
      te: "అభిప్రాయం",
    },
    close: {
      en: "Close",
      hi: "बंद करें",
      te: "మూసివేయండి",
    },
    emotionNames: {
      happy: {
        en: "Happy",
        hi: "खुश",
        te: "సంతోషంగా",
      },
      sad: {
        en: "Sad",
        hi: "उदास",
        te: "విచారంగా",
      },
      confused: {
        en: "Confused",
        hi: "भ्रमित",
        te: "గందరగోళంగా",
      },
      bored: {
        en: "Bored",
        hi: "ऊबा हुआ",
        te: "విసుగుగా",
      },
      focused: {
        en: "Focused",
        hi: "केंद्रित",
        te: "కేంద్రీకృతంగా",
      },
      unknown: {
        en: "Unknown",
        hi: "अज्ञात",
        te: "తెలియదు",
      },
    },
    feedbackMessages: {
      happy: {
        en: "Great! Your positive mood enhances learning.",
        hi: "बढ़िया! आपका सकारात्मक मूड सीखने को बढ़ाता है।",
        te: "గొప్ప! మీ సానుకూల మనస్థితి నేర్చుకోవడాన్ని మెరుగుపరుస్తుంది.",
      },
      sad: {
        en: "Taking short breaks can help improve your mood.",
        hi: "छोटे ब्रेक लेने से आपके मूड में सुधार हो सकता है।",
        te: "చిన్న విరామాలు తీసుకోవడం వల్ల మీ మనస్థితి మెరుగుపడవచ్చు.",
      },
      confused: {
        en: "Try reviewing the material again or asking for help.",
        hi: "सामग्री को फिर से देखने या मदद मांगने का प्रयास करें।",
        te: "మెటీరియల్‌ను మళ్లీ సమీక్షించడానికి లేదా సహాయం కోసం అడగడానికి ప్రయత్నించండి.",
      },
      bored: {
        en: "Try a different learning activity to re-engage.",
        hi: "फिर से जुड़ने के लिए एक अलग लर्निंग एक्टिविटी आज़माएं।",
        te: "మళ్లీ నిమగ్నం చేసుకోవడానికి వేరే నేర్చుకునే కార్యకలాపాన్ని ప్రయత్నించండి.",
      },
      focused: {
        en: "Excellent focus! You're in an optimal learning state.",
        hi: "उत्कृष्ट फोकस! आप एक इष्टतम लर्निंग स्टेट में हैं।",
        te: "అద్భుతమైన ఫోకస్! మీరు అత్యుత్తమ అభ్యాస స్థితిలో ఉన్నారు.",
      },
    },
  }

  // Show feedback when emotion changes
  useEffect(() => {
    if (emotionData && emotionData.emotion !== "unknown") {
      setShowFeedback(true)

      // Clear existing timeout
      if (feedbackTimeout) {
        clearTimeout(feedbackTimeout)
      }

      // Hide feedback after 5 seconds
      const timeout = setTimeout(() => {
        setShowFeedback(false)
      }, 5000)

      setFeedbackTimeout(timeout)
    }

    return () => {
      if (feedbackTimeout) {
        clearTimeout(feedbackTimeout)
      }
    }
  }, [emotionData?.emotion])

  // Get emotion icon and emoji with innovative animations
  const getEmotionIcon = (emotion: string, size = 24) => {
    switch (emotion) {
      case "happy":
        return (
          <div className="relative">
            <motion.div
              initial={{ rotate: 0, scale: 1 }}
              animate={{
                rotate: [0, 10, -10, 10, 0],
                scale: [1, 1.1, 1, 1.1, 1]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut"
              }}
            >
              <Smile size={size} className="text-blue-500" />
            </motion.div>
            <motion.div
              className="absolute -top-1 -right-1 text-yellow-400 text-xs"
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
                y: [0, -10, -5]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 1
              }}
            >
              ✨
            </motion.div>
          </div>
        )
      case "sad":
        return (
          <div className="relative">
            <motion.div
              initial={{ y: 0 }}
              animate={{ y: [0, 2, 0, 2, 0] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut"
              }}
            >
              <Frown size={size} className="text-purple-500" />
            </motion.div>
            <motion.div
              className="absolute -bottom-1 -right-1 text-blue-400 text-xs"
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
                y: [0, 5, 10]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 1
              }}
            >
              💧
            </motion.div>
          </div>
        )
      case "confused":
        return (
          <div className="relative">
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: [0, -5, 5, -5, 0] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut"
              }}
            >
              <AlertTriangle size={size} className="text-amber-500" />
            </motion.div>
            <motion.div
              className="absolute -top-1 -right-1 text-amber-500 text-xs"
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
                rotate: [0, 180, 360]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 1
              }}
            >
              ❓
            </motion.div>
          </div>
        )
      case "bored":
        return (
          <div className="relative">
            <motion.div
              initial={{ scale: 1 }}
              animate={{
                scale: [1, 0.95, 1, 0.95, 1],
                opacity: [1, 0.8, 1, 0.8, 1]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut"
              }}
            >
              <Meh size={size} className="text-red-500" />
            </motion.div>
            <motion.div
              className="absolute top-0 -right-1 text-gray-400 text-xs"
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatDelay: 1
              }}
            >
              💤
            </motion.div>
          </div>
        )
      case "focused":
        return (
          <div className="relative">
            <motion.div
              initial={{ scale: 1 }}
              animate={{
                scale: [1, 1.1, 1, 1.1, 1],
                filter: ["brightness(1)", "brightness(1.2)", "brightness(1)", "brightness(1.2)", "brightness(1)"]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut"
              }}
            >
              <Eye size={size} className="text-green-500" />
            </motion.div>
            <motion.div
              className="absolute -top-1 -right-1 text-green-400 text-xs"
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
                rotate: [0, 180, 360]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 1
              }}
            >
              💡
            </motion.div>
          </div>
        )
      default:
        return <Meh size={size} className="text-gray-500" />
    }
  }

  // Get emotion emoji with animation wrapper
  const getEmotionEmoji = (emotion: string, animate = true) => {
    let emoji = "";
    switch (emotion) {
      case "happy":
        emoji = "😊"
        break;
      case "sad":
        emoji = "😢"
        break;
      case "confused":
        emoji = "😕"
        break;
      case "bored":
        emoji = "😴"
        break;
      case "focused":
        emoji = "🧐"
        break;
      default:
        emoji = "😐"
        break;
    }

    if (!animate) return emoji;

    return (
      <motion.span
        initial={{ scale: 1 }}
        animate={{
          scale: emotion === "happy" ? [1, 1.2, 1, 1.2, 1] :
                 emotion === "sad" ? [1, 0.9, 1, 0.9, 1] :
                 emotion === "confused" ? [1, 1.1, 0.9, 1.1, 1] :
                 emotion === "bored" ? [1, 0.95, 1, 0.95, 1] :
                 emotion === "focused" ? [1, 1.1, 1, 1.1, 1] : [1, 1, 1]
        }}
        transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
      >
        {emoji}
      </motion.span>
    )
  }

  // Get emotion color
  const getEmotionColor = (emotion: string) => {
    switch (emotion) {
      case "happy":
        return "bg-blue-500"
      case "sad":
        return "bg-purple-500"
      case "confused":
        return "bg-amber-500"
      case "bored":
        return "bg-red-500"
      case "focused":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  // Get emotion background color
  const getEmotionBgColor = (emotion: string) => {
    switch (emotion) {
      case "happy":
        return "bg-blue-100 dark:bg-blue-900/20"
      case "sad":
        return "bg-purple-100 dark:bg-purple-900/20"
      case "confused":
        return "bg-amber-100 dark:bg-amber-900/20"
      case "bored":
        return "bg-red-100 dark:bg-red-900/20"
      case "focused":
        return "bg-green-100 dark:bg-green-900/20"
      default:
        return "bg-gray-100 dark:bg-gray-800"
    }
  }

  // Get emotion text color
  const getEmotionTextColor = (emotion: string) => {
    switch (emotion) {
      case "happy":
        return "text-blue-700 dark:text-blue-300"
      case "sad":
        return "text-purple-700 dark:text-purple-300"
      case "confused":
        return "text-amber-700 dark:text-amber-300"
      case "bored":
        return "text-red-700 dark:text-red-300"
      case "focused":
        return "text-green-700 dark:text-green-300"
      default:
        return "text-gray-700 dark:text-gray-300"
    }
  }

  if (!emotionData) {
    return null
  }

  return (
    <Card className={`bg-card dark:bg-card text-card-foreground dark:text-card-foreground ${className}`}>
      {showHeader && (
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Brain size={20} className="text-primary" />
            {translations.title[language]}
          </CardTitle>
          {showControls && onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X size={16} />
            </Button>
          )}
        </CardHeader>
      )}

      <CardContent>
        {/* Current Emotion */}
        <div className={`rounded-lg p-4 mb-4 ${getEmotionBgColor(emotionData.emotion)}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {getEmotionIcon(emotionData.emotion)}
              <span className={`font-medium ${getEmotionTextColor(emotionData.emotion)}`}>
                {emotionData.emotion !== "unknown"
                  ? (
                    <>
                      {translations.emotionNames[emotionData.emotion][language]}{" "}
                      {getEmotionEmoji(emotionData.emotion, true)}
                    </>
                  )
                  : translations.emotionNames.unknown[language]
                }
              </span>
            </div>
            <Badge variant="outline" className={getEmotionTextColor(emotionData.emotion)}>
              {Math.round(emotionData.confidence)}%
            </Badge>
          </div>

          {/* Confidence Progress */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-foreground/70 dark:text-foreground/80">
                {translations.confidence[language]}
              </span>
              <span className="text-xs font-medium">{Math.round(emotionData.confidence)}%</span>
            </div>
            <Progress
              value={emotionData.confidence}
              className="h-1.5"
              indicatorClassName={getEmotionColor(emotionData.emotion)}
            />
          </div>

          {/* Attention Score */}
          {emotionData.attentionScore !== undefined && (
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-foreground/70 dark:text-foreground/80">
                  {translations.attention[language]}
                </span>
                <span className="text-xs font-medium">{Math.round(emotionData.attentionScore)}%</span>
              </div>
              <Progress
                value={emotionData.attentionScore}
                className="h-1.5"
                indicatorClassName={
                  emotionData.attentionScore > 80 ? "bg-green-500" :
                  emotionData.attentionScore > 50 ? "bg-amber-500" :
                  "bg-red-500"
                }
              />
            </div>
          )}

          {/* Fatigue Score */}
          {emotionData.fatigueScore !== undefined && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-foreground/70 dark:text-foreground/80">
                  {translations.fatigue[language]}
                </span>
                <span className="text-xs font-medium">{Math.round(emotionData.fatigueScore)}%</span>
              </div>
              <Progress
                value={emotionData.fatigueScore}
                className="h-1.5"
                indicatorClassName={
                  emotionData.fatigueScore > 80 ? "bg-red-500" :
                  emotionData.fatigueScore > 50 ? "bg-amber-500" :
                  "bg-green-500"
                }
              />
            </div>
          )}
        </div>

        {/* Feedback */}
        <AnimatePresence>
          {showFeedback && emotionData.emotion !== "unknown" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mb-4"
            >
              <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/10 dark:bg-primary/20">
                <Sparkles size={18} className="text-primary mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium mb-1">{translations.feedback[language]}</h4>
                  <p className="text-sm text-foreground/80 dark:text-foreground/80">
                    {translations.feedbackMessages[emotionData.emotion][language]}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Emotion History */}
        {showEmotionHistory && emotionHistory.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">{translations.emotionHistory[language]}</h4>
            <div className="grid grid-cols-5 gap-1">
              {emotionHistory.slice(-5).map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`h-12 rounded-md flex flex-col items-center justify-center ${getEmotionBgColor(item.emotion)}`}
                >
                  <div className="flex flex-col items-center">
                    {getEmotionIcon(item.emotion, 16)}
                    <div className="flex items-center gap-1">
                      <span className="text-xs mt-1">
                        {Math.round(item.confidence)}%
                      </span>
                      <span className="text-sm">{getEmotionEmoji(item.emotion, false)}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </CardContent>

      {showControls && onClose && (
        <CardFooter className="pt-0">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={onClose}
          >
            {translations.close[language]}
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
