"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { CheckCircle, Clock, HelpCircle, Star, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface QuizOption {
  id: string
  text: string
  isCorrect: boolean
}

interface QuizCardProps {
  question: string
  options: QuizOption[]
  timeLimit?: number // in seconds
  points: number
  onAnswer: (isCorrect: boolean) => void
  onNext?: () => void
  language?: "en" | "hi" | "te"
}

export function QuizCard({ question, options, timeLimit = 45, points, onAnswer, onNext, language = "en" }: QuizCardProps) {
  // Reset state when question changes
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [timeLeft, setTimeLeft] = useState(timeLimit)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [isActive, setIsActive] = useState(true)

  // Reset selected option when question changes and start timer
  useEffect(() => {
    setSelectedOption(null);
    setIsAnswered(false);
    setIsCorrect(null);
    setTimeLeft(timeLimit);
    setIsActive(true);
  }, [question, timeLimit])

  // Timer countdown effect - just counts down
  useEffect(() => {
    if (isAnswered || !isActive) return

    const timer = setInterval(() => {
      setTimeLeft(prev => prev <= 1 ? 0 : prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [isAnswered, isActive])

  // Handle timeout - evaluate the CURRENTLY selected option instead of defaulting to false
  useEffect(() => {
    if (timeLeft === 0 && !isAnswered && isActive) {
      setIsAnswered(true)
      setIsActive(false)
      
      let correct = false
      // If they had an option selected when time ran out, check if it's correct
      if (selectedOption && selectedOption !== 'custom') {
        const selectedOptionObj = options.find((opt) => opt.id === selectedOption)
        correct = selectedOptionObj?.isCorrect || false
      }
      
      setIsCorrect(correct)
      onAnswer(correct)
    }
  }, [timeLeft, isAnswered, isActive, onAnswer, options, selectedOption])

  const translations = {
    timeLeft: {
      en: "Time left",
      hi: "शेष समय",
      te: "మిగిలిన సమయం",
    },
    points: {
      en: "points",
      hi: "अंक",
      te: "పాయింట్లు",
    },
    checkAnswer: {
      en: "Check Answer",
      hi: "उत्तर जांचें",
      te: "సమాధానం తనిఖీ చేయండి",
    },
    nextQuestion: {
      en: "Next Question",
      hi: "अगला प्रश्न",
      te: "తదుపరి ప్రశ్న",
    },
    correct: {
      en: "Correct!",
      hi: "सही!",
      te: "సరైనది!",
    },
    incorrect: {
      en: "Incorrect",
      hi: "गलत",
      te: "తప్పు",
    },
  }

  const handleSelectOption = (optionId: string) => {
    if (isAnswered || !isActive) return
    setSelectedOption(optionId)
  }

  // State for custom answer text
  const [customAnswerText, setCustomAnswerText] = useState('')

  const handleCheckAnswer = () => {
    if (!selectedOption || isAnswered) return

    // Handle custom answer separately
    if (selectedOption === 'custom') {
      setIsCorrect(false)
      setIsAnswered(true)
      onAnswer(false)
      return
    }

    // Handle regular multiple choice options
    const selectedOptionObj = options.find((opt) => opt.id === selectedOption)
    const correct = selectedOptionObj?.isCorrect || false

    setIsCorrect(correct)
    setIsAnswered(true)
    onAnswer(correct)
  }

  return (
    <Card className="w-full max-w-2xl mx-auto overflow-hidden border-2 border-secondary/50 dark:border-secondary/40 bg-card dark:bg-card text-card-foreground dark:text-card-foreground">
      <CardHeader className="bg-secondary/10 dark:bg-secondary/20 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-secondary">
            <HelpCircle size={18} />
            <span className="text-base font-medium">Quiz Question</span>
          </CardTitle>

          <div className="flex items-center gap-2">
            <Star size={16} className="text-yellow-500 fill-yellow-500" />
            <span className="font-medium">{points}</span>
            <span className="text-xs text-foreground/70">{translations.points[language]}</span>
          </div>
        </div>

        {timeLimit > 0 && (
          <div className="mt-2">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className={`flex items-center gap-1 ${timeLeft <= 10 ? "text-red-500 font-bold" : ""}`}>
                <Clock size={12} className={`${timeLeft <= 10 ? "text-red-500 animate-pulse" : "text-foreground/70"}`} />
                <span className={timeLeft <= 10 ? "text-red-500" : "text-foreground/70"}>{translations.timeLeft[language]}:</span>
                <span className={`font-medium ${timeLeft <= 10 ? "text-red-500" : ""}`}>{timeLeft}s</span>
              </span>
              <span className={`font-medium ${timeLeft <= 10 ? "text-red-500" : ""}`}>{Math.round((timeLeft / timeLimit) * 100)}%</span>
            </div>
            <Progress 
              value={(timeLeft / timeLimit) * 100} 
              className={`h-1 ${timeLeft <= 10 ? "bg-red-200" : ""}`} 
            />
          </div>
        )}
      </CardHeader>

      <CardContent className="p-4">
        <div className="mb-6 text-lg font-medium">{question}</div>

        <div className="space-y-3 mb-6">
          {options.map((option) => (
            <motion.div
              key={option.id}
              whileHover={{ scale: isAnswered ? 1 : 1.02 }}
              whileTap={{ scale: isAnswered ? 1 : 0.98 }}
              onClick={() => handleSelectOption(option.id)}
              className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                !isAnswered
                  ? selectedOption === option.id
                    ? "border-secondary bg-secondary/5 dark:bg-secondary/10"
                    : "border-muted dark:border-muted/70 hover:border-secondary/30 dark:hover:border-secondary/40"
                  : option.isCorrect
                    ? "border-green-500 bg-green-50 dark:bg-green-900/30 dark:border-green-600"
                    : selectedOption === option.id && !option.isCorrect
                      ? "border-red-500 bg-red-50 dark:bg-red-900/30 dark:border-red-600"
                      : "border-muted dark:border-muted/70 opacity-50"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`${selectedOption === option.id ? "font-medium" : ""} text-foreground dark:text-foreground`}>{option.text}</span>

                {isAnswered && option.isCorrect && <CheckCircle size={18} className="text-green-500" />}

                {isAnswered && selectedOption === option.id && !option.isCorrect && (
                  <X size={18} className="text-red-500" />
                )}
              </div>
            </motion.div>
          ))}

          {/* Custom answer input option */}
          <motion.div
            whileHover={{ scale: isAnswered ? 1 : 1.02 }}
            whileTap={{ scale: isAnswered ? 1 : 0.98 }}
            className={`p-3 rounded-lg border-2 transition-all ${
              !isAnswered
                ? selectedOption === "custom"
                  ? "border-secondary bg-secondary/5"
                  : "border-muted hover:border-secondary/30"
                : "border-muted opacity-50"
            }`}
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">Enter your own answer:</span>
                {isAnswered && selectedOption === "custom" && (
                  <X size={18} className="text-red-500" />
                )}
              </div>
              <textarea
                className={`w-full p-2 border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary ${isAnswered || !isActive ? "opacity-50 cursor-not-allowed" : ""}`}
                rows={2}
                placeholder="Type your answer here..."
                value={customAnswerText}
                onClick={() => handleSelectOption("custom")}
                onChange={(e) => {
                  handleSelectOption("custom");
                  setCustomAnswerText(e.target.value);
                }}
                disabled={isAnswered || !isActive}
              />
            </div>
          </motion.div>
        </div>

        {isAnswered ? (
          <div className="flex flex-col items-center gap-2">
            <div className={`text-lg font-bold ${isCorrect ? "text-green-500" : "text-red-500"}`}>
              {timeLeft === 0 && !isCorrect ? "Time's Up!" : (isCorrect ? translations.correct[language] : translations.incorrect[language])}
              {isCorrect && " +" + points}
            </div>
            <Button
              className="w-full bg-secondary hover:bg-secondary/90"
              onClick={onNext}
            >
              {translations.nextQuestion[language]}
            </Button>
          </div>
        ) : (
          <Button
            onClick={handleCheckAnswer}
            disabled={!selectedOption || !isActive}
            className="w-full bg-secondary hover:bg-secondary/90 disabled:opacity-50"
          >
            {translations.checkAnswer[language]}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
