"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { CheckCircle, Download, FileText, Star, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { QuizCard } from "./quiz-card"
import { AiQuizGenerator } from "./ai-quiz-generator"

interface QuizOption {
  id: string
  text: string
  isCorrect: boolean
}

interface QuizQuestion {
  id: string
  question: string
  options: QuizOption[]
  points: number
  subject: string
  syllabus: "AP" | "Telangana" | "CBSE" | "General"
}

interface QuizContainerProps {
  questions: QuizQuestion[]
  language?: "en" | "hi" | "te"
  onComplete: (score: number, totalPoints: number, percentageScore: number) => void
  onClose: () => void
  syllabus?: "AP" | "Telangana" | "CBSE" | "General"
  subject?: string
}

export function QuizContainer({
  questions,
  language = "en",
  onComplete,
  onClose,
  syllabus = "General",
  subject
}: QuizContainerProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [answers, setAnswers] = useState<{ [key: string]: boolean }>({})
  const [quizComplete, setQuizComplete] = useState(false)
  const [filteredQuestions, setFilteredQuestions] = useState<QuizQuestion[]>([])
  const [showAiGenerator, setShowAiGenerator] = useState(false)
  const [selectedSubject, setSelectedSubject] = useState<string | undefined>(subject)

  // Filter questions based on syllabus and subject
  useEffect(() => {
    let filtered = questions.filter(q => q.syllabus === syllabus || q.syllabus === "General")

    // Further filter by subject if specified
    if (selectedSubject) {
      filtered = filtered.filter(q => q.subject === selectedSubject)
    }

    setFilteredQuestions(filtered.length > 0 ? filtered : questions)
  }, [questions, syllabus, selectedSubject])

  const currentQuestion = filteredQuestions[currentQuestionIndex]
  const totalQuestions = filteredQuestions.length
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100

  const totalPoints = filteredQuestions.reduce((sum, q) => sum + q.points, 0)
  const earnedPoints = Object.entries(answers).reduce((sum, [id, correct]) => {
    if (correct) {
      const question = filteredQuestions.find(q => q.id === id)
      return sum + (question?.points || 0)
    }
    return sum
  }, 0)

  const translations = {
    quizProgress: {
      en: "Question",
      hi: "प्रश्न",
      te: "ప్రశ్న",
    },
    of: {
      en: "of",
      hi: "का",
      te: "యొక్క",
    },
    score: {
      en: "Score",
      hi: "स्कोर",
      te: "స్కోర్",
    },
    points: {
      en: "points",
      hi: "अंक",
      te: "పాయింట్లు",
    },
    quizComplete: {
      en: "Quiz Complete!",
      hi: "क्विज़ पूरा हुआ!",
      te: "క్విజ్ పూర్తయింది!",
    },
    yourScore: {
      en: "Your Score",
      hi: "आपका स्कोर",
      te: "మీ స్కోర్",
    },
    downloadResults: {
      en: "Download Results",
      hi: "परिणाम डाउनलोड करें",
      te: "ఫలితాలను డౌన్‌లోడ్ చేయండి",
    },
    tryAgain: {
      en: "Try Again",
      hi: "फिर से प्रयास करें",
      te: "మళ్ళీ ప్రయత్నించండి",
    },
    close: {
      en: "Close",
      hi: "बंद करें",
      te: "మూసివేయండి",
    },
    downloadSummary: {
      en: "Download Summary",
      hi: "सारांश डाउनलोड करें",
      te: "సారాంశాన్ని డౌన్‌లోడ్ చేయండి",
    }
  }

  const handleAnswer = (isCorrect: boolean) => {
    if (currentQuestion) {
      // Update score
      if (isCorrect) {
        setScore(score + currentQuestion.points)
      }

      // Record answer
      setAnswers({
        ...answers,
        [currentQuestion.id]: isCorrect
      })

      // Wait a moment before moving to next question
      setTimeout(() => {
        if (currentQuestionIndex < filteredQuestions.length - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1)
        } else {
          setQuizComplete(true)
          const percentageScore = Math.round((earnedPoints / totalPoints) * 100)
          onComplete(earnedPoints, totalPoints, percentageScore)
        }
      }, 1500)
    }
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < filteredQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      setQuizComplete(true)
      const percentageScore = Math.round((earnedPoints / totalPoints) * 100)
      onComplete(earnedPoints, totalPoints, percentageScore)
    }
  }

  const handleTryAgain = () => {
    setCurrentQuestionIndex(0)
    setScore(0)
    setAnswers({})
    setQuizComplete(false)
  }

  const handleDownloadResults = () => {
    // Create a summary of the quiz results
    const summary = `
Quiz Results
===========
Date: ${new Date().toLocaleDateString()}
Score: ${earnedPoints}/${totalPoints} points
Percentage: ${Math.round((earnedPoints / totalPoints) * 100)}%

Questions:
${filteredQuestions.map((q, index) => {
  const isCorrect = answers[q.id] || false
  return `
${index + 1}. ${q.question}
   Correct: ${isCorrect ? 'Yes' : 'No'}
   Points: ${isCorrect ? q.points : 0}/${q.points}
`
}).join('')}
    `.trim()

    // Create a blob and download link
    const blob = new Blob([summary], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'quiz-results.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleDownloadSummary = () => {
    // Create a summary of the quiz content for study
    const summary = `
Study Summary - ${syllabus} Syllabus
=======================
Date: ${new Date().toLocaleDateString()}

Key Concepts:
${filteredQuestions.map((q, index) => {
  const correctOption = q.options.find(opt => opt.isCorrect)
  return `
${index + 1}. ${q.question}
   Answer: ${correctOption?.text || 'N/A'}
   Subject: ${q.subject}
`
}).join('')}
    `.trim()

    // Create a blob and download link
    const blob = new Blob([summary], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'study-summary.pdf'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Handle AI-generated questions
  const handleAiQuestionsGenerated = (newQuestions: QuizQuestion[]) => {
    // Add the new questions to the filtered questions
    setFilteredQuestions([...newQuestions])
    setShowAiGenerator(false)
    // Reset quiz state
    setCurrentQuestionIndex(0)
    setScore(0)
    setAnswers({})
    setQuizComplete(false)
  }

  // Show AI generator instead of questions
  if (showAiGenerator) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="mb-4 flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAiGenerator(false)}
          >
            Back to Quiz
          </Button>
        </div>

        <AiQuizGenerator
          onQuestionsGenerated={handleAiQuestionsGenerated}
          language={language}
          defaultSyllabus={syllabus}
        />
      </div>
    )
  }

  if (quizComplete) {
    return (
      <Card className="w-full max-w-2xl mx-auto bg-card dark:bg-card text-card-foreground dark:text-card-foreground">
        <CardHeader className="bg-secondary/10 dark:bg-secondary/20 text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <CheckCircle size={24} className="text-secondary" />
            {translations.quizComplete[language]}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-medium mb-2">{translations.yourScore[language]}</h3>
            <div className="text-4xl font-bold mb-4">
              {earnedPoints}/{totalPoints} <span className="text-lg font-normal">{translations.points[language]}</span>
            </div>
            <Progress value={(earnedPoints / totalPoints) * 100} className="h-2 mb-4" />
            <p className="text-sm text-muted-foreground mb-6">
              {Math.round((earnedPoints / totalPoints) * 100)}% {earnedPoints === totalPoints ? '🎉' : ''}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={handleDownloadResults}
            >
              <Download size={16} />
              {translations.downloadResults[language]}
            </Button>

            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={handleDownloadSummary}
            >
              <FileText size={16} />
              {translations.downloadSummary[language]}
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
            <Button
              variant="outline"
              onClick={handleTryAgain}
            >
              {translations.tryAgain[language]}
            </Button>

            <Button
              className="bg-secondary hover:bg-secondary/90"
              onClick={onClose}
            >
              {translations.close[language]}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Star size={18} className="text-secondary" />
          <span className="font-medium">
            {translations.quizProgress[language]} {currentQuestionIndex + 1} {translations.of[language]} {totalQuestions}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-sm font-medium">
            {translations.score[language]}: {score} {translations.points[language]}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
            onClick={() => setShowAiGenerator(true)}
          >
            <Sparkles size={14} />
            AI Quiz
          </Button>
        </div>
      </div>

      <Progress value={progress} className="h-1.5 mb-6" />

      {currentQuestion && (
        <QuizCard
          question={currentQuestion.question}
          options={currentQuestion.options}
          timeLimit={45}
          points={currentQuestion.points}
          onAnswer={handleAnswer}
          onNext={handleNextQuestion}
          language={language}
        />
      )}
    </div>
  )
}
