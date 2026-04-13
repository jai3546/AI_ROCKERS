"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Brain, Loader2, RefreshCw, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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

interface AiQuizGeneratorProps {
  onQuestionsGenerated: (questions: QuizQuestion[]) => void
  language?: "en" | "hi" | "te"
  defaultSyllabus?: "AP" | "Telangana" | "CBSE" | "General"
}

export function AiQuizGenerator({
  onQuestionsGenerated,
  language = "en",
  defaultSyllabus = "General"
}: AiQuizGeneratorProps) {
  const [subject, setSubject] = useState("")
  const [numQuestions, setNumQuestions] = useState(5)
  const [syllabus, setSyllabus] = useState<"AP" | "Telangana" | "CBSE" | "General">(defaultSyllabus)

  // Predefined subjects
  const subjects = [
    "Math",
    "Science",
    "Social Studies",
    "English",
    "Physics",
    "Chemistry",
    "Biology",
    "History",
    "Geography",
    "Computer Science"
  ]
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const translations = {
    generateQuiz: {
      en: "Generate Quiz",
      hi: "क्विज़ बनाएं",
      te: "క్విజ్ తయారు చేయండి",
    },
    subject: {
      en: "Subject",
      hi: "विषय",
      te: "విషయం",
    },
    numQuestions: {
      en: "Number of Questions",
      hi: "प्रश्नों की संख्या",
      te: "ప్రశ్నల సంఖ్య",
    },
    syllabus: {
      en: "Syllabus",
      hi: "पाठ्यक्रम",
      te: "సిలబస్",
    },
    generating: {
      en: "Generating questions...",
      hi: "प्रश्न बना रहे हैं...",
      te: "ప్రశ్నలు తయారు చేస్తున్నాము...",
    },
    enterSubject: {
      en: "Enter a subject (e.g., Science, Math, History)",
      hi: "एक विषय दर्ज करें (जैसे, विज्ञान, गणित, इतिहास)",
      te: "ఒక విషయాన్ని నమోదు చేయండి (ఉదా., విజ్ఞానం, గణితం, చరిత్ర)",
    },
  }

  // Subject-specific question templates
  const questionTemplates = {
    "Math": [
      {
        question: "What is the value of π (pi) to two decimal places?",
        options: [
          { id: "a", text: "3.14", isCorrect: true },
          { id: "b", text: "3.41", isCorrect: false },
          { id: "c", text: "3.12", isCorrect: false },
          { id: "d", text: "3.16", isCorrect: false },
        ]
      },
      {
        question: "What is the formula for the area of a circle?",
        options: [
          { id: "a", text: "πr²", isCorrect: true },
          { id: "b", text: "2πr", isCorrect: false },
          { id: "c", text: "πd", isCorrect: false },
          { id: "d", text: "r²π/2", isCorrect: false },
        ]
      },
      {
        question: "What is the Pythagorean theorem?",
        options: [
          { id: "a", text: "a² + b² = c²", isCorrect: true },
          { id: "b", text: "a + b = c", isCorrect: false },
          { id: "c", text: "a² - b² = c²", isCorrect: false },
          { id: "d", text: "a × b = c", isCorrect: false },
        ]
      },
      {
        question: "What is the formula for calculating the volume of a sphere?",
        options: [
          { id: "a", text: "(4/3)πr³", isCorrect: true },
          { id: "b", text: "πr²", isCorrect: false },
          { id: "c", text: "2πr", isCorrect: false },
          { id: "d", text: "πr³", isCorrect: false },
        ]
      },
      {
        question: "What is the sum of angles in a triangle?",
        options: [
          { id: "a", text: "180 degrees", isCorrect: true },
          { id: "b", text: "90 degrees", isCorrect: false },
          { id: "c", text: "360 degrees", isCorrect: false },
          { id: "d", text: "270 degrees", isCorrect: false },
        ]
      },
      {
        question: "What is the value of x in the equation 2x + 5 = 15?",
        options: [
          { id: "a", text: "5", isCorrect: true },
          { id: "b", text: "10", isCorrect: false },
          { id: "c", text: "7", isCorrect: false },
          { id: "d", text: "3", isCorrect: false },
        ]
      },
    ],
    "Science": [
      {
        question: "What is the process by which plants make their own food using sunlight?",
        options: [
          { id: "a", text: "Photosynthesis", isCorrect: true },
          { id: "b", text: "Respiration", isCorrect: false },
          { id: "c", text: "Transpiration", isCorrect: false },
          { id: "d", text: "Germination", isCorrect: false },
        ]
      },
      {
        question: "Which planet is known as the Red Planet?",
        options: [
          { id: "a", text: "Mars", isCorrect: true },
          { id: "b", text: "Venus", isCorrect: false },
          { id: "c", text: "Jupiter", isCorrect: false },
          { id: "d", text: "Saturn", isCorrect: false },
        ]
      },
      {
        question: "What is the chemical formula for water?",
        options: [
          { id: "a", text: "H₂O", isCorrect: true },
          { id: "b", text: "CO₂", isCorrect: false },
          { id: "c", text: "O₂", isCorrect: false },
          { id: "d", text: "NaCl", isCorrect: false },
        ]
      },
      {
        question: "What is the largest organ in the human body?",
        options: [
          { id: "a", text: "Skin", isCorrect: true },
          { id: "b", text: "Liver", isCorrect: false },
          { id: "c", text: "Heart", isCorrect: false },
          { id: "d", text: "Brain", isCorrect: false },
        ]
      },
      {
        question: "What is the unit of force in the International System of Units (SI)?",
        options: [
          { id: "a", text: "Newton", isCorrect: true },
          { id: "b", text: "Joule", isCorrect: false },
          { id: "c", text: "Watt", isCorrect: false },
          { id: "d", text: "Pascal", isCorrect: false },
        ]
      },
    ],
    "Social Studies": [
      {
        question: "Who was the first President of the United States?",
        options: [
          { id: "a", text: "George Washington", isCorrect: true },
          { id: "b", text: "Thomas Jefferson", isCorrect: false },
          { id: "c", text: "Abraham Lincoln", isCorrect: false },
          { id: "d", text: "John Adams", isCorrect: false },
        ]
      },
      {
        question: "What is the capital of India?",
        options: [
          { id: "a", text: "New Delhi", isCorrect: true },
          { id: "b", text: "Mumbai", isCorrect: false },
          { id: "c", text: "Kolkata", isCorrect: false },
          { id: "d", text: "Chennai", isCorrect: false },
        ]
      },
      {
        question: "Which of these countries is not in Europe?",
        options: [
          { id: "a", text: "Egypt", isCorrect: true },
          { id: "b", text: "Spain", isCorrect: false },
          { id: "c", text: "Italy", isCorrect: false },
          { id: "d", text: "Germany", isCorrect: false },
        ]
      },
      {
        question: "When did World War II end?",
        options: [
          { id: "a", text: "1945", isCorrect: true },
          { id: "b", text: "1939", isCorrect: false },
          { id: "c", text: "1918", isCorrect: false },
          { id: "d", text: "1950", isCorrect: false },
        ]
      },
    ],
    "English": [
      {
        question: "Who wrote 'Romeo and Juliet'?",
        options: [
          { id: "a", text: "William Shakespeare", isCorrect: true },
          { id: "b", text: "Charles Dickens", isCorrect: false },
          { id: "c", text: "Jane Austen", isCorrect: false },
          { id: "d", text: "Mark Twain", isCorrect: false },
        ]
      },
      {
        question: "What is the past tense of 'go'?",
        options: [
          { id: "a", text: "Went", isCorrect: true },
          { id: "b", text: "Gone", isCorrect: false },
          { id: "c", text: "Going", isCorrect: false },
          { id: "d", text: "Goed", isCorrect: false },
        ]
      },
      {
        question: "Which of these is a noun?",
        options: [
          { id: "a", text: "Book", isCorrect: true },
          { id: "b", text: "Run", isCorrect: false },
          { id: "c", text: "Beautiful", isCorrect: false },
          { id: "d", text: "Quickly", isCorrect: false },
        ]
      },
    ],
    "Physics": [
      {
        question: "What is Newton's First Law of Motion?",
        options: [
          { id: "a", text: "An object at rest stays at rest, and an object in motion stays in motion unless acted upon by an external force", isCorrect: true },
          { id: "b", text: "Force equals mass times acceleration", isCorrect: false },
          { id: "c", text: "For every action, there is an equal and opposite reaction", isCorrect: false },
          { id: "d", text: "Energy cannot be created or destroyed", isCorrect: false },
        ]
      },
      {
        question: "What is the SI unit of electric current?",
        options: [
          { id: "a", text: "Ampere", isCorrect: true },
          { id: "b", text: "Volt", isCorrect: false },
          { id: "c", text: "Ohm", isCorrect: false },
          { id: "d", text: "Watt", isCorrect: false },
        ]
      },
    ],
    "Chemistry": [
      {
        question: "What is the chemical symbol for gold?",
        options: [
          { id: "a", text: "Au", isCorrect: true },
          { id: "b", text: "Ag", isCorrect: false },
          { id: "c", text: "Fe", isCorrect: false },
          { id: "d", text: "Cu", isCorrect: false },
        ]
      },
      {
        question: "What is the pH of a neutral solution?",
        options: [
          { id: "a", text: "7", isCorrect: true },
          { id: "b", text: "0", isCorrect: false },
          { id: "c", text: "14", isCorrect: false },
          { id: "d", text: "1", isCorrect: false },
        ]
      },
    ],
    "Biology": [
      {
        question: "What is the powerhouse of the cell?",
        options: [
          { id: "a", text: "Mitochondria", isCorrect: true },
          { id: "b", text: "Nucleus", isCorrect: false },
          { id: "c", text: "Ribosome", isCorrect: false },
          { id: "d", text: "Golgi apparatus", isCorrect: false },
        ]
      },
      {
        question: "What is the process by which cells divide?",
        options: [
          { id: "a", text: "Mitosis", isCorrect: true },
          { id: "b", text: "Photosynthesis", isCorrect: false },
          { id: "c", text: "Respiration", isCorrect: false },
          { id: "d", text: "Digestion", isCorrect: false },
        ]
      },
    ],
    "History": [
      {
        question: "In which year did Christopher Columbus first reach the Americas?",
        options: [
          { id: "a", text: "1492", isCorrect: true },
          { id: "b", text: "1776", isCorrect: false },
          { id: "c", text: "1066", isCorrect: false },
          { id: "d", text: "1215", isCorrect: false },
        ]
      },
      {
        question: "Who was the first Emperor of China?",
        options: [
          { id: "a", text: "Qin Shi Huang", isCorrect: true },
          { id: "b", text: "Mao Zedong", isCorrect: false },
          { id: "c", text: "Genghis Khan", isCorrect: false },
          { id: "d", text: "Sun Yat-sen", isCorrect: false },
        ]
      },
    ],
    "Geography": [
      {
        question: "What is the largest ocean on Earth?",
        options: [
          { id: "a", text: "Pacific Ocean", isCorrect: true },
          { id: "b", text: "Atlantic Ocean", isCorrect: false },
          { id: "c", text: "Indian Ocean", isCorrect: false },
          { id: "d", text: "Arctic Ocean", isCorrect: false },
        ]
      },
      {
        question: "Which is the longest river in the world?",
        options: [
          { id: "a", text: "Nile", isCorrect: true },
          { id: "b", text: "Amazon", isCorrect: false },
          { id: "c", text: "Mississippi", isCorrect: false },
          { id: "d", text: "Yangtze", isCorrect: false },
        ]
      },
    ],
    "Computer Science": [
      {
        question: "What does CPU stand for?",
        options: [
          { id: "a", text: "Central Processing Unit", isCorrect: true },
          { id: "b", text: "Computer Personal Unit", isCorrect: false },
          { id: "c", text: "Central Program Utility", isCorrect: false },
          { id: "d", text: "Control Processing Unit", isCorrect: false },
        ]
      },
      {
        question: "Which programming language is known as the 'mother of all languages'?",
        options: [
          { id: "a", text: "C", isCorrect: true },
          { id: "b", text: "Java", isCorrect: false },
          { id: "c", text: "Python", isCorrect: false },
          { id: "d", text: "JavaScript", isCorrect: false },
        ]
      },
    ],
  }

  // This function generates realistic questions based on the selected subject
  const generateQuestions = async () => {
    if (!subject.trim()) {
      setError("Please select a subject")
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Get templates for the selected subject
      const templates = questionTemplates[subject as keyof typeof questionTemplates] || []

      if (templates.length === 0) {
        throw new Error(`No questions available for ${subject}`)
      }

      // Select random questions from the templates
      const selectedTemplates = [...templates]
        .sort(() => 0.5 - Math.random()) // Shuffle the array
        .slice(0, Math.min(numQuestions, templates.length))

      // Generate questions based on the selected templates
      const questions: QuizQuestion[] = selectedTemplates.map((template, index) => {
        return {
          id: `ai-${index}`,
          question: template.question,
          options: template.options,
          points: 20,
          subject: subject,
          syllabus: syllabus
        }
      })

      // If we don't have enough templates, add some generic ones
      if (questions.length < numQuestions) {
        const remaining = numQuestions - questions.length
        for (let i = 0; i < remaining; i++) {
          questions.push({
            id: `ai-${questions.length + i}`,
            question: `${subject} question ${questions.length + i + 1}?`,
            options: [
              { id: "a", text: `Answer option A`, isCorrect: true },
              { id: "b", text: `Answer option B`, isCorrect: false },
              { id: "c", text: `Answer option C`, isCorrect: false },
              { id: "d", text: `Answer option D`, isCorrect: false },
            ],
            points: 20,
            subject: subject,
            syllabus: syllabus
          })
        }
      }

      onQuestionsGenerated(questions)
    } catch (err) {
      setError("Failed to generate questions. Please try again.")
      console.error(err)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="bg-primary/10 pb-4">
        <CardTitle className="flex items-center gap-2 text-primary">
          <Sparkles size={20} />
          <span>AI Quiz Generator</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="subject">{translations.subject[language]}</Label>
          <Select
            value={subject}
            onValueChange={setSubject}
          >
            <SelectTrigger id="subject">
              <SelectValue placeholder={translations.enterSubject[language]} />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((subj) => (
                <SelectItem key={subj} value={subj}>{subj}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="numQuestions">{translations.numQuestions[language]}</Label>
            <Select
              value={numQuestions.toString()}
              onValueChange={(value) => setNumQuestions(parseInt(value))}
            >
              <SelectTrigger id="numQuestions">
                <SelectValue placeholder="5" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3</SelectItem>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="syllabus">{translations.syllabus[language]}</Label>
            <Select
              value={syllabus}
              onValueChange={(value) => setSyllabus(value as "AP" | "Telangana" | "CBSE" | "General")}
            >
              <SelectTrigger id="syllabus">
                <SelectValue placeholder="General" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="General">General</SelectItem>
                <SelectItem value="AP">AP</SelectItem>
                <SelectItem value="Telangana">Telangana</SelectItem>
                <SelectItem value="CBSE">CBSE</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {error && (
          <div className="text-sm text-red-500 mt-2">{error}</div>
        )}

        <Button
          className="w-full mt-4"
          onClick={generateQuestions}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <Loader2 size={16} className="mr-2 animate-spin" />
              {translations.generating[language]}
            </>
          ) : (
            <>
              <Brain size={16} className="mr-2" />
              {translations.generateQuiz[language]}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
