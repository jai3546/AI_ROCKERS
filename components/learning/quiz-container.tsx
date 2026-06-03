"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  CheckCircle, Download, FileText, Star, Sparkles, ArrowLeft, 
  BookOpen, MessageSquare, Send, ChevronRight, GraduationCap, 
  Globe, Compass, Cpu, Layers, BookMarked, User, Loader2 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
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
  topic: string
}

interface DiscussionMessage {
  id: string
  author: string
  role: "student" | "tutor"
  avatar: string
  text: string
  timestamp: string
}

interface QuizContainerProps {
  questions: QuizQuestion[]
  language?: "en" | "hi" | "te"
  onComplete: (score: number, totalPoints: number, percentageScore: number) => void
  onClose: () => void
  syllabus?: "AP" | "Telangana" | "CBSE" | "General"
  subject?: string
  defaultShowAiGenerator?: boolean
  defaultAiTopic?: string
}

// Subject config for UI aesthetics
const SUBJECTS_CONFIG = {
  "Science": {
    icon: Globe,
    color: "text-blue-500",
    gradient: "from-blue-500/20 via-cyan-500/10 to-transparent",
    border: "border-blue-500/30 hover:border-blue-500",
    description: "Explore biology, physics, chemistry and the mysteries of our natural world."
  },
  "Math": {
    icon: Compass,
    color: "text-purple-500",
    gradient: "from-purple-500/20 via-indigo-500/10 to-transparent",
    border: "border-purple-500/30 hover:border-purple-500",
    description: "Solve puzzles in geometry, algebra, and numerical concepts."
  },
  "Social Studies": {
    icon: Layers,
    color: "text-amber-500",
    gradient: "from-amber-500/20 via-orange-500/10 to-transparent",
    border: "border-amber-500/30 hover:border-amber-500",
    description: "Learn about geography, historical events, cultural traditions and rivers."
  },
  "English": {
    icon: BookMarked,
    color: "text-emerald-500",
    gradient: "from-emerald-500/20 via-teal-500/10 to-transparent",
    border: "border-emerald-500/30 hover:border-emerald-500",
    description: "Read classics, explore grammar, and write creative literature."
  },
  "Computer Science": {
    icon: Cpu,
    color: "text-pink-500",
    gradient: "from-pink-500/20 via-rose-500/10 to-transparent",
    border: "border-pink-500/30 hover:border-pink-500",
    description: "Discover hardware architectures and learn coding concepts."
  }
}

// Mock initial discussions
const INITIAL_DISCUSSIONS: { [key: string]: DiscussionMessage[] } = {
  "Photosynthesis": [
    {
      id: "m1",
      author: "Rajesh Kumar",
      role: "student",
      avatar: "👨‍🎓",
      text: "Is it possible for photosynthesis to happen under artificial LED lights?",
      timestamp: "2 hours ago"
    },
    {
      id: "m2",
      author: "AI Tutor",
      role: "tutor",
      avatar: "🤖",
      text: "Yes, Rajesh! Photosynthesis can occur under artificial lights, provided they emit the correct wavelengths (specifically red and blue light) that chlorophyll absorbs. LED grow lights are actually very popular for this!",
      timestamp: "2 hours ago"
    },
    {
      id: "m3",
      author: "Priya Patel",
      role: "student",
      avatar: "👩‍🎓",
      text: "Why do leaves turn yellow in autumn if they have chlorophyll?",
      timestamp: "1 hour ago"
    },
    {
      id: "m4",
      author: "AI Tutor",
      role: "tutor",
      avatar: "🤖",
      text: "Great question, Priya! In autumn, because of shorter days and cooler temperatures, plants stop producing chlorophyll. As the green chlorophyll breaks down, other pigments like carotenoids (which are yellow/orange) that were hidden become visible!",
      timestamp: "45 mins ago"
    }
  ],
  "Space & Astronomy": [
    {
      id: "sa1",
      author: "Kiran Sharma",
      role: "student",
      avatar: "👨‍🎓",
      text: "Why is Mars called the Red Planet?",
      timestamp: "3 hours ago"
    },
    {
      id: "sa2",
      author: "AI Tutor",
      role: "tutor",
      avatar: "🤖",
      text: "Mars has a lot of iron oxide on its surface, which we commonly call rust. This rusty dust is everywhere and gives Mars its iconic reddish-orange glow!",
      timestamp: "3 hours ago"
    }
  ],
  "Human Anatomy": [
    {
      id: "ha1",
      author: "Ananya Reddy",
      role: "student",
      avatar: "👩‍🎓",
      text: "Is skin really an organ?",
      timestamp: "4 hours ago"
    },
    {
      id: "ha2",
      author: "AI Tutor",
      role: "tutor",
      avatar: "🤖",
      text: "Absolutely, Ananya! In fact, the skin is the largest organ in the human body. It protects us from bacteria, regulates our body temperature, and lets us feel touch.",
      timestamp: "3 hours ago"
    }
  ],
  "Geometry": [
    {
      id: "g1",
      author: "Amit Sen",
      role: "student",
      avatar: "👨‍🎓",
      text: "Where does the number Pi (3.14) come from?",
      timestamp: "1 day ago"
    },
    {
      id: "g2",
      author: "AI Tutor",
      role: "tutor",
      avatar: "🤖",
      text: "Pi (π) is the ratio of any circle's circumference (distance around) to its diameter (distance across). No matter how big or small the circle, if you divide the circumference by the diameter, you will always get approximately 3.14159!",
      timestamp: "1 day ago"
    }
  ],
  "Chemistry": [
    {
      id: "c1",
      author: "Rohan Das",
      role: "student",
      avatar: "👨‍🎓",
      text: "Why is water called the universal solvent?",
      timestamp: "5 hours ago"
    },
    {
      id: "c2",
      author: "AI Tutor",
      role: "tutor",
      avatar: "🤖",
      text: "Because of its polar molecular structure, water can dissolve more substances than any other liquid! This makes it extremely important for chemistry, geology, and supporting biological life.",
      timestamp: "4 hours ago"
    }
  ]
}

export function QuizContainer({
  questions,
  language = "en",
  onComplete,
  onClose,
  syllabus = "General",
  subject,
  defaultShowAiGenerator = false,
  defaultAiTopic = ""
}: QuizContainerProps) {
  const [selectedSubject, setSelectedSubject] = useState<string | undefined>(subject)
  const [selectedTopic, setSelectedTopic] = useState<string | undefined>(undefined)
  const [viewMode, setViewMode] = useState<"select" | "quiz" | "discussion">("select")
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [answers, setAnswers] = useState<{ [key: string]: boolean }>({})
  const [quizComplete, setQuizComplete] = useState(false)
  const [filteredQuestions, setFilteredQuestions] = useState<QuizQuestion[]>([])
  const [showAiGenerator, setShowAiGenerator] = useState(defaultShowAiGenerator)
  const [isAiActive, setIsAiActive] = useState(false)

  // Explicit state update helpers that reset AI mode when browsing static quizzes
  const selectSubject = (subj: string | undefined) => {
    setSelectedSubject(subj)
    setIsAiActive(false)
  }

  const selectTopic = (topic: string | undefined) => {
    setSelectedTopic(topic)
    setIsAiActive(false)
  }

  // Discussion state
  const [discussions, setDiscussions] = useState<{ [key: string]: DiscussionMessage[] }>(INITIAL_DISCUSSIONS)
  const [newComment, setNewComment] = useState("")
  const [isTutorTyping, setIsTutorTyping] = useState(false)
  const discussionEndRef = useRef<HTMLDivElement>(null)

  // Extract unique subjects from questions
  const availableSubjects = Array.from(new Set(questions.map(q => q.subject)))

  // Extract unique topics for the selected subject
  const getTopicsForSubject = (subj: string) => {
    return Array.from(
      new Set(
        questions
          .filter(q => q.subject === subj && (q.syllabus === syllabus || q.syllabus === "General"))
          .map(q => q.topic)
      )
    )
  }

  // Filter questions dynamically based on selected subject and topic
  useEffect(() => {
    if (isAiActive) return

    if (!selectedSubject) {
      setFilteredQuestions([])
      return
    }

    let filtered = questions.filter(
      q => q.subject === selectedSubject && (q.syllabus === syllabus || q.syllabus === "General")
    )

    if (selectedTopic) {
      filtered = filtered.filter(q => q.topic === selectedTopic)
    }

    setFilteredQuestions(filtered)
  }, [questions, syllabus, selectedSubject, selectedTopic, isAiActive])

  // Scroll discussion to bottom when a message is added
  useEffect(() => {
    if (viewMode === "discussion") {
      discussionEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [discussions, viewMode])

  const currentQuestion = filteredQuestions[currentQuestionIndex]
  const totalQuestions = filteredQuestions.length
  const progress = totalQuestions > 0 ? ((currentQuestionIndex + 1) / totalQuestions) * 100 : 0

  const totalPoints = filteredQuestions.reduce((sum, q) => sum + q.points, 0)
  const earnedPoints = Object.entries(answers).reduce((sum, [id, correct]) => {
    if (correct) {
      const question = filteredQuestions.find(q => q.id === id)
      return sum + (question?.points || 0)
    }
    return sum
  }, 0)

  const translations = {
    quizProgress: { en: "Question", hi: "प्रश्न", te: "ప్రశ్న" },
    of: { en: "of", hi: "का", te: "యొక్క" },
    score: { en: "Score", hi: "स्कोर", te: "స్కోర్" },
    points: { en: "points", hi: "अंक", te: "పాయింట్లు" },
    quizComplete: { en: "Quiz Complete!", hi: "क्विज़ पूरा हुआ!", te: "క్విజ్ పూర్తయింది!" },
    yourScore: { en: "Your Score", hi: "आपका स्कोर", te: "మీ స్కోర్" },
    downloadResults: { en: "Download Results", hi: "परिणाम डाउनलोड करें", te: "ఫలితాలను డౌన్‌లోడ్ చేయండి" },
    tryAgain: { en: "Try Again", hi: "फिर से प्रयास करें", te: "మళ్ళీ ప్రయత్నించండి" },
    close: { en: "Close", hi: "बंद करें", te: "మూసివేయండి" },
    downloadSummary: { en: "Download Summary", hi: "सारांश डाउनलोड करें", te: "సారాంశాన్ని డౌన్‌లోడ్ చేయండి" }
  }

  const handleAnswer = (isCorrect: boolean) => {
    if (currentQuestion) {
      if (isCorrect) {
        setScore(score + currentQuestion.points)
      }

      setAnswers({
        ...answers,
        [currentQuestion.id]: isCorrect
      })

      setTimeout(() => {
        if (currentQuestionIndex < filteredQuestions.length - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1)
        } else {
          setQuizComplete(true)
          const percentageScore = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0
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
      const percentageScore = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0
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
    const summary = `
Quiz Results
===========
Subject: ${selectedSubject}
Topic: ${selectedTopic || "All Topics"}
Syllabus: ${syllabus}
Date: ${new Date().toLocaleDateString()}
Score: ${earnedPoints}/${totalPoints} points
Percentage: ${totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0}%

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

    const blob = new Blob([summary], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `quiz-results-${selectedSubject}-${selectedTopic || 'all'}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleDownloadSummary = () => {
    const summary = `
Study Summary - ${syllabus} Syllabus
=======================
Subject: ${selectedSubject}
Topic: ${selectedTopic || "All Topics"}
Date: ${new Date().toLocaleDateString()}

Key Concepts:
${filteredQuestions.map((q, index) => {
  const correctOption = q.options.find(opt => opt.isCorrect)
  return `
${index + 1}. ${q.question}
   Answer: ${correctOption?.text || 'N/A'}
   Subject: ${q.subject}
   Topic: ${q.topic}
`
}).join('')}
    `.trim()

    const blob = new Blob([summary], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `study-summary-${selectedSubject}-${selectedTopic || 'all'}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleAiQuestionsGenerated = (newQuestions: QuizQuestion[]) => {
    setFilteredQuestions([...newQuestions])
    setIsAiActive(true)
    if (newQuestions.length > 0) {
      setSelectedSubject(newQuestions[0].subject)
      setSelectedTopic(newQuestions[0].topic) // Directly set so selectTopic wrapper doesn't reset isAiActive
    }
    setShowAiGenerator(false)
    setViewMode("quiz")
    setCurrentQuestionIndex(0)
    setScore(0)
    setAnswers({})
    setQuizComplete(false)
  }

  // Handle posting a discussion comment
  const handlePostComment = () => {
    if (!newComment.trim() || !selectedTopic) return

    const topicMsgKey = selectedTopic

    const studentMsg: DiscussionMessage = {
      id: `msg-${Date.now()}`,
      author: "You",
      role: "student",
      avatar: "👨‍🎓",
      text: newComment,
      timestamp: "Just now"
    }

    // Add user message
    setDiscussions(prev => ({
      ...prev,
      [topicMsgKey]: [...(prev[topicMsgKey] || []), studentMsg]
    }))

    const tempComment = newComment
    setNewComment("")

    // Simulate AI Tutor typing and responding
    setIsTutorTyping(true)
    setTimeout(() => {
      let responseText = `That's a very interesting question about ${selectedTopic}! Let's examine this in more detail. Generally, this concept is connected to how variables interact under the ${syllabus} curriculum.`

      // Smart responsive mock answers
      const lowerComment = tempComment.toLowerCase()
      if (selectedTopic === "Photosynthesis") {
        if (lowerComment.includes("oxygen") || lowerComment.includes("produce")) {
          responseText = "Great question! Plants produce oxygen during the light-dependent reactions of photosynthesis. They split water molecules (photolysis) to extract electrons, releasing oxygen as a byproduct."
        } else if (lowerComment.includes("dark") || lowerComment.includes("night")) {
          responseText = "Interesting! Plants don't perform the light-dependent stage at night, but they can run the light-independent stage (Calvin Cycle) in the dark as long as they have stored ATP and NADPH from the daytime."
        }
      } else if (selectedTopic === "Space & Astronomy") {
        if (lowerComment.includes("moon")) {
          responseText = "Excellent point! Moons are natural satellites that orbit planets. Jupiter has the most moons (95 confirmed!), while Earth has just one."
        }
      } else if (selectedTopic === "Geometry") {
        if (lowerComment.includes("triangle")) {
          responseText = "Perfect topic! The interior angles of any triangle always add up to exactly 180 degrees, which is a fundamental rule in Euclidean geometry."
        }
      }

      const tutorMsg: DiscussionMessage = {
        id: `msg-tutor-${Date.now()}`,
        author: "AI Tutor",
        role: "tutor",
        avatar: "🤖",
        text: responseText,
        timestamp: "Just now"
      }

      setDiscussions(prev => ({
        ...prev,
        [topicMsgKey]: [...(prev[topicMsgKey] || []), tutorMsg]
      }))
      setIsTutorTyping(false)
    }, 1500)
  }

  // Topic navigation helper
  const navigateToTopic = (direction: "next" | "prev") => {
    if (!selectedSubject) return
    const topics = getTopicsForSubject(selectedSubject)
    if (topics.length <= 1) return

    const currentIndex = selectedTopic ? topics.indexOf(selectedTopic) : -1
    let newIndex = 0

    if (direction === "next") {
      newIndex = currentIndex < topics.length - 1 ? currentIndex + 1 : 0
    } else {
      newIndex = currentIndex > 0 ? currentIndex - 1 : topics.length - 1
    }

    setSelectedTopic(topics[newIndex])
    setIsAiActive(false)
    setViewMode("select") // Go back to topic dashboard
    handleTryAgain()
  }

  // Render AI Quiz generator screen
  if (showAiGenerator) {
    return (
      <div className="w-full max-w-2xl mx-auto p-2">
        <div className="mb-4 flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAiGenerator(false)}
            className="flex items-center gap-1"
          >
            <ArrowLeft size={16} />
            Back to Explorer
          </Button>
        </div>

        <AiQuizGenerator
          onQuestionsGenerated={handleAiQuestionsGenerated}
          language={language}
          defaultSyllabus={syllabus}
          defaultSubject={selectedSubject}
          defaultCustomSubject={defaultAiTopic}
        />
      </div>
    )
  }

  // Render Subject Selection Screen
  if (!selectedSubject) {
    return (
      <div className="w-full max-w-2xl mx-auto space-y-6 py-4 px-2">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary via-secondary to-indigo-600 bg-clip-text text-transparent">
            Choose Your Learning subject
          </h2>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Select a subject to explore its chapters, challenge yourself with tests, or join discussions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {availableSubjects.map((subj) => {
            const config = SUBJECTS_CONFIG[subj as keyof typeof SUBJECTS_CONFIG] || {
              icon: BookOpen,
              color: "text-foreground",
              gradient: "from-gray-500/10 to-transparent",
              border: "border-border hover:border-gray-500",
              description: "Explore chapters, quizzes, and learning discussions."
            }
            const IconComponent = config.icon

            return (
              <motion.div
                key={subj}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  selectSubject(subj)
                  setSelectedTopic(undefined)
                  setViewMode("select")
                }}
                className="cursor-pointer"
              >
                <Card className={`overflow-hidden border-2 h-full transition-all duration-300 shadow-sm hover:shadow-md bg-gradient-to-br ${config.gradient} ${config.border}`}>
                  <CardContent className="p-5 flex flex-col justify-between h-full gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl bg-background flex items-center justify-center shadow-sm ${config.color}`}>
                        <IconComponent size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-foreground">{subj}</h3>
                        <p className="text-xs text-muted-foreground">{getTopicsForSubject(subj).length} topics available</p>
                      </div>
                    </div>
                    <p className="text-sm text-foreground/80 leading-relaxed font-light">{config.description}</p>
                    <div className="flex items-center text-xs font-semibold text-primary mt-2">
                      Browse Topics <ChevronRight size={14} className="ml-1" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* Generate with AI option */}
        <div className="mt-6 pt-4 border-t border-border animate-fade-in">
          <Card className="border-2 border-dashed border-purple-500/30 bg-gradient-to-br from-purple-500/5 via-indigo-500/5 to-transparent dark:from-purple-950/10 dark:via-indigo-950/5 dark:to-transparent shadow-sm">
            <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1 text-left">
                <h4 className="font-bold text-md flex items-center gap-1.5 text-foreground">
                  <Sparkles size={16} className="text-purple-600 dark:text-purple-400 animate-pulse" />
                  Generate custom Quiz with Gemini AI
                </h4>
                <p className="text-xs text-muted-foreground max-w-md font-light">
                  Can't find your subject or want to practice a specific topic? Create custom multiple-choice questions instantly.
                </p>
              </div>
              <Button
                onClick={() => setShowAiGenerator(true)}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border border-indigo-500/20 shrink-0"
              >
                Start AI Quiz Generator
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Render Topic Selection List for Selected Subject
  if (selectedSubject && !selectedTopic) {
    const topics = getTopicsForSubject(selectedSubject)

    return (
      <div className="w-full max-w-2xl mx-auto space-y-6 py-4 px-2">
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5 font-medium">
            <span 
              onClick={() => selectSubject(undefined)} 
              className="hover:text-primary cursor-pointer transition-colors"
            >
              Subjects
            </span>
            <ChevronRight size={14} />
            <span className="text-foreground font-semibold">{selectedSubject}</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => selectSubject(undefined)}
            className="text-xs flex items-center gap-1"
          >
            <ArrowLeft size={12} />
            Back to Subjects
          </Button>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold flex items-center gap-2 text-foreground">
            {selectedSubject} Topics
          </h2>
          <p className="text-sm text-muted-foreground">
            Select a topic to start an interactive quiz or study details in the discussion board.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {topics.map((topic) => {
            const topicQuestionsCount = questions.filter(
              q => q.subject === selectedSubject && q.topic === topic && (q.syllabus === syllabus || q.syllabus === "General")
            ).length

            return (
              <Card 
                key={topic} 
                className="overflow-hidden border border-border shadow-sm hover:shadow-md transition-all bg-card hover:bg-accent/5"
              >
                <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="font-bold text-lg text-foreground">{topic}</h3>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium">
                      <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full">{topicQuestionsCount} Questions</span>
                      <span>•</span>
                      <span>Estimated {topicQuestionsCount * 1.5} mins</span>
                      <span>•</span>
                      <span>+{topicQuestionsCount * 20} XP</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 shrink-0">
                    <Button 
                      size="sm" 
                      onClick={() => {
                        selectTopic(topic)
                        setViewMode("quiz")
                        handleTryAgain()
                      }}
                      className="bg-secondary hover:bg-secondary/90 flex items-center gap-1"
                    >
                      <Star size={14} />
                      Start Quiz
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        selectTopic(topic)
                        setViewMode("discussion")
                      }}
                      className="flex items-center gap-1"
                    >
                      <MessageSquare size={14} />
                      Discussion
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* AI Generator Option */}
        <div className="pt-4 border-t border-border">
          <Card className="bg-gradient-to-r from-indigo-500/10 to-primary/10 border-indigo-500/20">
            <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="font-bold text-md flex items-center gap-1.5 text-foreground">
                  <Sparkles size={16} className="text-primary animate-pulse" />
                  Need a customized test?
                </h4>
                <p className="text-xs text-muted-foreground max-w-md">
                  Let our AI generate a dynamic set of questions tailored directly to your syllabus and selected topics.
                </p>
              </div>
              <Button
                onClick={() => setShowAiGenerator(true)}
                className="bg-primary hover:bg-primary/90 text-sm py-2"
              >
                Generate AI Quiz
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Render Topic Discussion View
  if (selectedSubject && selectedTopic && viewMode === "discussion") {
    const topicMsgKey = selectedTopic
    const messageList = discussions[topicMsgKey] || []

    return (
      <div className="w-full max-w-2xl mx-auto space-y-4 py-2 px-1 flex flex-col h-[520px]">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pb-2 border-b border-border">
          <div className="flex items-center gap-1">
            <span 
              onClick={() => selectSubject(undefined)} 
              className="hover:text-primary cursor-pointer"
            >
              Subjects
            </span>
            <ChevronRight size={10} />
            <span 
              onClick={() => selectTopic(undefined)} 
              className="hover:text-primary cursor-pointer"
            >
              {selectedSubject}
            </span>
            <ChevronRight size={10} />
            <span className="text-foreground font-semibold">{selectedTopic}</span>
            <ChevronRight size={10} />
            <span>Discussion</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => selectTopic(undefined)}
            className="text-xs h-7 px-2"
          >
            <ArrowLeft size={12} className="mr-1" />
            Back to Topics
          </Button>
        </div>

        {/* Topic Title */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground">
              {selectedTopic} Classroom Q&A
            </h2>
            <p className="text-xs text-muted-foreground">
              Ask and discuss concepts with the AI tutor and classmates.
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => setViewMode("quiz")}
            className="bg-secondary hover:bg-secondary/90 text-xs flex items-center gap-1.5 h-8"
          >
            <Star size={12} />
            Take Quiz
          </Button>
        </div>

        {/* Message Thread Panel */}
        <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-card/40 border border-border rounded-xl p-4 space-y-4 shadow-inner min-h-[300px]">
          {messageList.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
              <MessageSquare size={36} className="mb-2 opacity-50 text-primary" />
              <p className="text-sm font-semibold">No discussions yet</p>
              <p className="text-xs">Be the first to ask a question about {selectedTopic}!</p>
            </div>
          ) : (
            messageList.map((msg) => {
              const isTutor = msg.role === "tutor"
              return (
                <div 
                  key={msg.id} 
                  className={`flex gap-3 max-w-[85%] ${isTutor ? "mr-auto" : "ml-auto flex-row-reverse"}`}
                >
                  <div className="w-8 h-8 rounded-full bg-white border border-border flex items-center justify-center text-sm shadow-sm shrink-0">
                    {msg.avatar}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium px-1">
                      <span>{msg.author}</span>
                      {isTutor && (
                        <span className="bg-primary/20 text-primary text-[10px] px-1 py-0.2 rounded font-bold flex items-center gap-0.5">
                          <Sparkles size={8} /> Verified
                        </span>
                      )}
                      <span>•</span>
                      <span>{msg.timestamp}</span>
                    </div>
                    <div className={`p-3 rounded-2xl text-sm leading-relaxed border shadow-sm ${
                      isTutor 
                        ? "bg-white dark:bg-card border-border text-foreground" 
                        : "bg-indigo-600 border-indigo-700 text-white rounded-tr-none"
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                </div>
              )
            })
          )}

          {isTutorTyping && (
            <div className="flex gap-3 mr-auto max-w-[80%]">
              <div className="w-8 h-8 rounded-full bg-white border border-border flex items-center justify-center text-sm shadow-sm shrink-0">
                🤖
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground font-medium px-1">AI Tutor is typing...</div>
                <div className="bg-white dark:bg-card border border-border p-3 rounded-2xl flex items-center justify-center shadow-sm">
                  <Loader2 size={16} className="animate-spin text-primary" />
                </div>
              </div>
            </div>
          )}
          <div ref={discussionEndRef} />
        </div>

        {/* Input box */}
        <div className="flex gap-2 pt-1">
          <Input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={`Ask a question about ${selectedTopic}...`}
            onKeyDown={(e) => {
              if (e.key === "Enter") handlePostComment()
            }}
            className="flex-1 rounded-xl"
            disabled={isTutorTyping}
          />
          <Button 
            onClick={handlePostComment} 
            className="rounded-xl px-4"
            disabled={isTutorTyping || !newComment.trim()}
          >
            <Send size={16} />
          </Button>
        </div>
      </div>
    )
  }

  // Render Active Quiz Run View
  if (selectedSubject && selectedTopic && viewMode === "quiz") {
    // If complete
    if (quizComplete) {
      const percentageScore = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0
      
      return (
        <Card className="w-full max-w-2xl mx-auto bg-card dark:bg-card text-card-foreground">
          <CardHeader className="bg-secondary/10 text-center pb-4">
            <CardTitle className="flex items-center justify-center gap-2 text-secondary">
              <CheckCircle size={24} />
              {translations.quizComplete[language]}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="text-center">
              <h3 className="text-md font-medium text-muted-foreground mb-1">
                Topic: {selectedTopic} ({selectedSubject})
              </h3>
              <div className="text-4xl font-bold mb-4 mt-2">
                {earnedPoints}/{totalPoints} <span className="text-lg font-normal">{translations.points[language]}</span>
              </div>
              <Progress value={percentageScore} className="h-2 mb-4" />
              <p className="text-sm font-semibold mb-6">
                Your Score: {percentageScore}% {percentageScore >= 50 ? (percentageScore >= 70 ? '🎉 Great Job!' : '👍 Keep studying!') : 'Nice try! Keep studying to master this topic.'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="flex items-center gap-2 justify-center"
                onClick={handleDownloadResults}
              >
                <Download size={16} />
                {translations.downloadResults[language]}
              </Button>

              <Button
                variant="outline"
                className="flex items-center gap-2 justify-center"
                onClick={handleDownloadSummary}
              >
                <FileText size={16} />
                {translations.downloadSummary[language]}
              </Button>
            </div>

            {/* Navigation controls after quiz completion */}
            <div className="pt-4 border-t border-border flex flex-col sm:flex-row gap-3 justify-between items-center text-sm">
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigateToTopic("prev")}
                >
                  Previous Topic
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigateToTopic("next")}
                >
                  Next Topic
                </Button>
              </div>

              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  onClick={handleTryAgain}
                  className="flex-1 sm:flex-none text-xs"
                >
                  {translations.tryAgain[language]}
                </Button>
                <Button
                  onClick={() => selectTopic(undefined)}
                  className="bg-secondary hover:bg-secondary/90 flex-1 sm:flex-none text-xs"
                >
                  Back to Topics
                </Button>
              </div>
            </div>

            <Button
              variant="ghost"
              className="w-full text-xs text-muted-foreground mt-2"
              onClick={onClose}
            >
              Close Assessment
            </Button>
          </CardContent>
        </Card>
      )
    }

    // Running quiz
    return (
      <div className="w-full max-w-2xl mx-auto space-y-4">
        {/* Breadcrumb Navigation during Quiz */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pb-2 border-b border-border">
          <div className="flex items-center gap-1 font-medium">
            <span 
              onClick={() => selectSubject(undefined)} 
              className="hover:text-primary cursor-pointer"
            >
              Subjects
            </span>
            <ChevronRight size={10} />
            <span 
              onClick={() => selectTopic(undefined)} 
              className="hover:text-primary cursor-pointer"
            >
              {selectedSubject}
            </span>
            <ChevronRight size={10} />
            <span className="text-foreground font-semibold">{selectedTopic}</span>
            <ChevronRight size={10} />
            <span>Quiz</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => selectTopic(undefined)}
            className="text-xs h-7 px-2"
          >
            <ArrowLeft size={12} className="mr-1" />
            Exit Quiz
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Star size={18} className="text-secondary" />
            <span className="font-semibold text-sm">
              {translations.quizProgress[language]} {currentQuestionIndex + 1} {translations.of[language]} {totalQuestions}
            </span>
          </div>
          <div className="flex items-center gap-4 justify-between sm:justify-end w-full sm:w-auto">
            <div className="text-xs font-semibold text-muted-foreground">
              {translations.score[language]}: <span className="text-foreground font-bold">{score}</span> {translations.points[language]}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1 h-8 text-xs shrink-0"
              onClick={() => setShowAiGenerator(true)}
            >
              <Sparkles size={12} />
              AI Quiz
            </Button>
          </div>
        </div>

        <Progress value={progress} className="h-1.5" />

        {currentQuestion ? (
          <QuizCard
            question={currentQuestion.question}
            options={currentQuestion.options}
            timeLimit={45}
            points={currentQuestion.points}
            onAnswer={handleAnswer}
            onNext={handleNextQuestion}
            language={language}
          />
        ) : (
          <Card className="text-center p-8 bg-card border border-border">
            <CardContent className="space-y-4">
              <BookOpen size={48} className="mx-auto text-muted-foreground opacity-50" />
              <h3 className="font-bold text-lg">No general questions found</h3>
              <p className="text-sm text-muted-foreground">
                We couldn't find any questions matching this topic for the "{syllabus}" syllabus. Try changing the syllabus in the dashboard.
              </p>
              <Button onClick={() => selectTopic(undefined)}>
                Choose Another Topic
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  return null
}
