"use client"

import { useState, useEffect } from "react"
import {
  BookOpen,
  Clock,
  Globe,
  Languages,
  Loader2,
  MessageSquare,
  RefreshCw,
  Search,
  User
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion, AnimatePresence } from "framer-motion"

// Types for the mentor matching API
interface Student {
  id: string
  name: string
  emotional_state: "happy" | "neutral" | "stressed"
  subject_need: string
  available_time: string
  region: string
  language: string
  performance_level: "high" | "medium" | "low"
  behavior: "excellent" | "good" | "challenging"
  learning_style: "visual" | "auditory" | "kinesthetic"
  class: string
}

interface Mentor {
  id: string
  name: string
  avatar: string
  expertise: string[]
  available_time: string[]
  region: string[]
  language: string[]
  specialization: string[]
  experience_years: number
  teaching_style: string
  student_performance_focus: "high" | "medium" | "low"
  behavior_management: "strict" | "balanced" | "lenient"
  bio: string
}

interface MatchResult {
  student: Student
  best_match: Mentor
  alternatives: Mentor[]
}

interface MentorMatchingProps {
  studentId: string
  language?: "en" | "hi" | "te"
  onSelectMentor?: (mentorId: string) => void
}

export function MentorMatching({
  studentId,
  language = "en",
  onSelectMentor
}: MentorMatchingProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null)
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null)

  const translations = {
    title: {
      en: "AI Mentor Matching",
      hi: "AI मेंटर मैचिंग",
      te: "AI మెంటార్ మ్యాచింగ్",
    },
    description: {
      en: "Find the perfect mentor based on your needs and preferences",
      hi: "आपकी जरूरतों और प्राथमिकताओं के आधार पर सही मेंटर खोजें",
      te: "మీ అవసరాలు మరియు ప్రాధాన్యతల ఆధారంగా సరైన మెంటార్‌ను కనుగొనండి",
    },
    loading: {
      en: "Finding your perfect mentor match...",
      hi: "आपके लिए सही मेंटर खोज रहे हैं...",
      te: "మీకు సరైన మెంటార్‌ను కనుగొంటున్నాము...",
    },
    error: {
      en: "Error finding mentor matches",
      hi: "मेंटर मैच खोजने में त्रुटि",
      te: "మెంటార్ మ్యాచ్‌లను కనుగొనడంలో లోపం",
    },
    retry: {
      en: "Retry",
      hi: "पुनः प्रयास करें",
      te: "మళ్ళీ ప్రయత్నించండి",
    },
    bestMatch: {
      en: "Best Match",
      hi: "सर्वोत्तम मैच",
      te: "ఉత్తమ మ్యాచ్",
    },
    alternatives: {
      en: "Alternatives",
      hi: "विकल्प",
      te: "ప్రత్యామ్నాయాలు",
    },
    expertise: {
      en: "Expertise",
      hi: "विशेषज्ञता",
      te: "నైపుణ్యం",
    },
    availability: {
      en: "Availability",
      hi: "उपलब्धता",
      te: "అందుబాటు",
    },
    regions: {
      en: "Regions",
      hi: "क्षेत्र",
      te: "ప్రాంతాలు",
    },
    languages: {
      en: "Languages",
      hi: "भाषाएँ",
      te: "భాషలు",
    },
    selectMentor: {
      en: "Select Mentor",
      hi: "मेंटर चुनें",
      te: "మెంటార్‌ను ఎంచుకోండి",
    },
    yourNeeds: {
      en: "Your Needs",
      hi: "आपकी जरूरतें",
      te: "మీ అవసరాలు",
    },
    subject: {
      en: "Subject",
      hi: "विषय",
      te: "విషయం",
    },
    time: {
      en: "Time",
      hi: "समय",
      te: "సమయం",
    },
    region: {
      en: "Region",
      hi: "क्षेत्र",
      te: "ప్రాంతం",
    },
    emotionalState: {
      en: "Emotional State",
      hi: "भावनात्मक स्थिति",
      te: "భావోద్వేగ స్థితి",
    },
    morning: {
      en: "Morning",
      hi: "सुबह",
      te: "ఉదయం",
    },
    afternoon: {
      en: "Afternoon",
      hi: "दोपहर",
      te: "మధ్యాహ్నం",
    },
    evening: {
      en: "Evening",
      hi: "शाम",
      te: "సాయంత్రం",
    },
    night: {
      en: "Night",
      hi: "रात",
      te: "రాత్రి",
    },
    happy: {
      en: "Happy",
      hi: "खुश",
      te: "సంతోషంగా",
    },
    neutral: {
      en: "Neutral",
      hi: "तटस्थ",
      te: "తటస్థంగా",
    },
    stressed: {
      en: "Stressed",
      hi: "तनावग्रस्त",
      te: "ఒత్తిడిలో",
    },
    math: {
      en: "Mathematics",
      hi: "गणित",
      te: "గణితం",
    },
    science: {
      en: "Science",
      hi: "विज्ञान",
      te: "విజ్ఞానశాస్త్రం",
    },
    history: {
      en: "History",
      hi: "इतिहास",
      te: "చరిత్ర",
    },
    english: {
      en: "English",
      hi: "अंग्रेजी",
      te: "ఆంగ్లం",
    },
    telangana: {
      en: "Telangana",
      hi: "तेलंगाना",
      te: "తెలంగాణ",
    },
    andhra_pradesh: {
      en: "Andhra Pradesh",
      hi: "आंध्र प्रदेश",
      te: "ఆంధ్ర ప్రదేశ్",
    },
    tamil_nadu: {
      en: "Tamil Nadu",
      hi: "तमिलनाडु",
      te: "తమిళనాడు",
    },
    karnataka: {
      en: "Karnataka",
      hi: "कर्नाटक",
      te: "కర్ణాటక",
    },
    kerala: {
      en: "Kerala",
      hi: "केरल",
      te: "కేరళ",
    },
    maharashtra: {
      en: "Maharashtra",
      hi: "महाराष्ट्र",
      te: "మహారాష్ట్ర",
    },
    gujarat: {
      en: "Gujarat",
      hi: "गुजरात",
      te: "గుజరాత్",
    },
    telugu: {
      en: "Telugu",
      hi: "तेलुगु",
      te: "తెలుగు",
    },
    tamil: {
      en: "Tamil",
      hi: "तमिल",
      te: "తమిళం",
    },
    kannada: {
      en: "Kannada",
      hi: "कन्नड़",
      te: "కన్నడ",
    },
    malayalam: {
      en: "Malayalam",
      hi: "मलयालम",
      te: "మలయాళం",
    },
    hindi: {
      en: "Hindi",
      hi: "हिंदी",
      te: "హిందీ",
    },
    marathi: {
      en: "Marathi",
      hi: "मराठी",
      te: "మరాఠీ",
    },
    gujarati: {
      en: "Gujarati",
      hi: "गुजराती",
      te: "గుజరాతీ",
    }
  }

  // Function to fetch mentor matches
  const fetchMentorMatches = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Try to fetch from the API if it's available
      try {
        const response = await fetch(`/api/match-mentor/${studentId}`)
        if (response.ok) {
          const data = await response.json()
          setMatchResult(data)
          setSelectedMentor(data.best_match)
          return
        }
      } catch (apiError) {
        console.log("API not available, using mock data")
      }

      // Simulate API call with mock data
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Mock data based on student ID
      const mockData: MatchResult = {
        student: {
          id: studentId,
          name: "Rahul Singh",
          emotional_state: "stressed",
          subject_need: "math",
          available_time: "morning",
          region: "telangana",
          language: "telugu",
          performance_level: "high",
          behavior: "excellent",
          learning_style: "visual",
          class: "8A"
        },
        best_match: {
          id: "M001",
          name: "Dr. Rajesh Kumar",
          avatar: "RK",
          expertise: ["math", "science"],
          specialization: ["algebra", "calculus", "physics"],
          available_time: ["morning", "afternoon"],
          region: ["telangana", "andhra_pradesh"],
          language: ["telugu", "english"],
          experience_years: 15,
          teaching_style: "structured",
          student_performance_focus: "high",
          behavior_management: "strict",
          bio: "Dr. Kumar is a former university professor with a PhD in Mathematics. He specializes in helping high-performing students excel in competitive exams and advanced topics."
        },
        alternatives: [
          {
            id: "M004",
            name: "Dr. Meera Patel",
            avatar: "MP",
            expertise: ["math", "science", "history"],
            specialization: ["geometry", "physics", "ancient history"],
            available_time: ["morning", "evening", "night"],
            region: ["telangana", "andhra_pradesh", "karnataka"],
            language: ["telugu", "kannada", "english", "hindi"],
            experience_years: 20,
            teaching_style: "analytical",
            student_performance_focus: "high",
            behavior_management: "strict",
            bio: "Dr. Patel has extensive experience preparing students for competitive exams. She demands excellence and has a proven track record with high-performing students."
          },
          {
            id: "M002",
            name: "Priya Venkatesh",
            avatar: "PV",
            expertise: ["science", "english"],
            specialization: ["biology", "chemistry", "literature"],
            available_time: ["evening", "night"],
            region: ["tamil_nadu", "kerala"],
            language: ["tamil", "malayalam", "english"],
            experience_years: 8,
            teaching_style: "interactive",
            student_performance_focus: "medium",
            behavior_management: "balanced",
            bio: "Priya is a patient and encouraging mentor who excels at helping average students improve their grades through interactive learning methods."
          }
        ]
      }

      setMatchResult(mockData)
      setSelectedMentor(mockData.best_match)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch mentor matches on component mount
  useEffect(() => {
    if (studentId) {
      fetchMentorMatches()
    }
  }, [studentId])

  // Handle mentor selection
  const handleSelectMentor = (mentor: Mentor) => {
    setSelectedMentor(mentor)
    if (onSelectMentor) {
      onSelectMentor(mentor.id)
    }
  }

  // Translate values based on the current language
  const translateValue = (category: string, value: string) => {
    const key = value.toLowerCase()
    return translations[key as keyof typeof translations]?.[language] || value
  }

  // Render loading state
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader className="bg-primary/10 pb-2">
          <CardTitle className="flex items-center gap-2 text-primary">
            <User size={18} />
            {translations.title[language]}
          </CardTitle>
          <CardDescription>
            {translations.description[language]}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 flex flex-col items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-center text-muted-foreground">
            {translations.loading[language]}
          </p>
        </CardContent>
      </Card>
    )
  }

  // Render error state
  if (error) {
    return (
      <Card className="w-full">
        <CardHeader className="bg-destructive/10 pb-2">
          <CardTitle className="flex items-center gap-2 text-destructive">
            <User size={18} />
            {translations.error[language]}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 flex flex-col items-center justify-center h-64">
          <p className="text-center text-muted-foreground mb-4">
            {error}
          </p>
          <Button
            variant="outline"
            onClick={fetchMentorMatches}
            className="flex items-center gap-2"
          >
            <RefreshCw size={16} />
            {translations.retry[language]}
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Render match results
  if (matchResult) {
    const { student, best_match, alternatives } = matchResult

    return (
      <Card className="w-full">
        <CardHeader className="bg-primary/10 pb-2">
          <CardTitle className="flex items-center gap-2 text-primary">
            <User size={18} />
            {translations.title[language]}
          </CardTitle>
          <CardDescription>
            {translations.description[language]}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          {/* Student needs summary */}
          <div className="mb-6 p-4 bg-muted/50 rounded-lg dark:bg-muted/20">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium">{translations.yourNeeds[language]}</h3>
              <div className="text-sm font-medium">
                {student.name} - {student.class}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">{translations.subject[language]}</span>
                <span className="font-medium flex items-center gap-1">
                  <BookOpen size={14} />
                  {translateValue('subject', student.subject_need)}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">{translations.time[language]}</span>
                <span className="font-medium flex items-center gap-1">
                  <Clock size={14} />
                  {translateValue('time', student.available_time)}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">{translations.region[language]}</span>
                <span className="font-medium flex items-center gap-1">
                  <Globe size={14} />
                  {translateValue('region', student.region)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Performance:</span>
                <Badge
                  variant="outline"
                  className={`
                    ${student.performance_level === 'high' ? 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800' : ''}
                    ${student.performance_level === 'medium' ? 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800' : ''}
                    ${student.performance_level === 'low' ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800' : ''}
                  `}
                >
                  {student.performance_level.charAt(0).toUpperCase() + student.performance_level.slice(1)}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Behavior:</span>
                <Badge
                  variant="outline"
                  className={`
                    ${student.behavior === 'excellent' ? 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800' : ''}
                    ${student.behavior === 'good' ? 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800' : ''}
                    ${student.behavior === 'challenging' ? 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800' : ''}
                  `}
                >
                  {student.behavior.charAt(0).toUpperCase() + student.behavior.slice(1)}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{translations.emotionalState[language]}:</span>
                <Badge
                  variant="outline"
                  className={`
                    ${student.emotional_state === 'happy' ? 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800' : ''}
                    ${student.emotional_state === 'neutral' ? 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800' : ''}
                    ${student.emotional_state === 'stressed' ? 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800' : ''}
                  `}
                >
                  {translateValue('emotional', student.emotional_state)}
                </Badge>
              </div>
            </div>
          </div>

          {/* Mentor matches */}
          <Tabs defaultValue="best" className="w-full">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="best">{translations.bestMatch[language]}</TabsTrigger>
              <TabsTrigger value="alternatives">{translations.alternatives[language]}</TabsTrigger>
            </TabsList>

            <TabsContent value="best">
              <MentorCard
                mentor={best_match}
                isSelected={selectedMentor?.id === best_match.id}
                onSelect={() => handleSelectMentor(best_match)}
                language={language}
                translations={translations}
              />
            </TabsContent>

            <TabsContent value="alternatives">
              <div className="space-y-4">
                {alternatives.map((mentor) => (
                  <MentorCard
                    key={mentor.id}
                    mentor={mentor}
                    isSelected={selectedMentor?.id === mentor.id}
                    onSelect={() => handleSelectMentor(mentor)}
                    language={language}
                    translations={translations}
                  />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    )
  }

  // Fallback for no data
  return null
}

// Helper component to display mentor information
interface MentorCardProps {
  mentor: Mentor
  isSelected: boolean
  onSelect: () => void
  language: "en" | "hi" | "te"
  translations: any
}

function MentorCard({ mentor, isSelected, onSelect, language, translations }: MentorCardProps) {
  // Translate values based on the current language
  const translateValue = (category: string, value: string) => {
    const key = value.toLowerCase()
    return translations[key as keyof typeof translations]?.[language] || value
  }

  // Get performance level label
  const getPerformanceLevelLabel = (level: string) => {
    switch (level) {
      case "high":
        return "High Performers"
      case "medium":
        return "Average Students"
      case "low":
        return "Struggling Students"
      default:
        return level
    }
  }

  // Get behavior management style label
  const getBehaviorStyleLabel = (style: string) => {
    switch (style) {
      case "strict":
        return "Structured"
      case "balanced":
        return "Supportive"
      case "lenient":
        return "Flexible"
      default:
        return style
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`border-2 ${isSelected ? 'border-primary' : 'border-border'}`}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                {mentor.avatar}
              </div>
              <div>
                <CardTitle className="text-lg">{mentor.name}</CardTitle>
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <span>{mentor.experience_years} years experience</span>
                  <span className="inline-block w-1 h-1 rounded-full bg-muted-foreground mx-1"></span>
                  <span>{mentor.teaching_style} teaching</span>
                </div>
              </div>
            </div>
            {isSelected && (
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary">
                {translations.bestMatch[language]}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-2 space-y-4">
          {/* Bio */}
          <p className="text-sm text-muted-foreground">{mentor.bio}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Expertise */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-1">
                <BookOpen size={14} />
                {translations.expertise[language]}
              </h4>
              <div className="flex flex-wrap gap-1">
                {mentor.expertise.map((subject) => (
                  <Badge key={subject} variant="secondary" className="text-xs">
                    {translateValue('subject', subject)}
                  </Badge>
                ))}
              </div>
              <div className="mt-1">
                <h5 className="text-xs text-muted-foreground">Specialization:</h5>
                <div className="flex flex-wrap gap-1 mt-1">
                  {mentor.specialization.map((spec) => (
                    <span key={spec} className="text-xs">{spec}</span>
                  )).reduce((prev, curr, i) => [
                    ...prev,
                    <span key={`sep-${i}`} className="text-xs text-muted-foreground mx-1">•</span>,
                    curr
                  ], [] as React.ReactNode[]).slice(1)}
                </div>
              </div>
            </div>

            {/* Student Focus */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-1">
                <User size={14} />
                Student Focus
              </h4>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs">Performance Level:</span>
                  <Badge variant="outline" className="text-xs bg-primary/10 text-primary">
                    {getPerformanceLevelLabel(mentor.student_performance_focus)}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs">Teaching Approach:</span>
                  <Badge variant="outline" className="text-xs bg-secondary/10 text-secondary">
                    {getBehaviorStyleLabel(mentor.behavior_management)}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Availability */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-1">
                <Clock size={14} />
                {translations.availability[language]}
              </h4>
              <div className="flex flex-wrap gap-1">
                {mentor.available_time.map((time) => (
                  <Badge key={time} variant="outline" className="text-xs">
                    {translateValue('time', time)}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Languages */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-1">
                <Languages size={14} />
                {translations.languages[language]}
              </h4>
              <div className="flex flex-wrap gap-1">
                {mentor.language.map((lang) => (
                  <Badge key={lang} variant="outline" className="text-xs bg-muted/50">
                    {translateValue('language', lang)}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="pt-2">
          <Button
            className={`w-full ${isSelected ? 'bg-primary/90 hover:bg-primary' : ''}`}
            onClick={onSelect}
            disabled={isSelected}
          >
            {isSelected ? (
              <Check size={16} className="mr-2" />
            ) : (
              <User size={16} className="mr-2" />
            )}
            {isSelected ? 'Selected' : translations.selectMentor[language]}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
