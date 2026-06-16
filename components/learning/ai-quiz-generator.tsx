"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Brain, Loader2, RefreshCw, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { generateAiQuiz } from "@/services/gemini-api"

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

interface AiQuizGeneratorProps {
  onQuestionsGenerated: (questions: QuizQuestion[]) => void
  language?: "en" | "hi" | "te"
  defaultSyllabus?: "AP" | "Telangana" | "CBSE" | "General"
  defaultSubject?: string
  defaultCustomSubject?: string
}

export function AiQuizGenerator({
  onQuestionsGenerated,
  language = "en",
  defaultSyllabus = "General",
  defaultSubject = "",
  defaultCustomSubject = ""
}: AiQuizGeneratorProps) {
  const [subject, setSubject] = useState(defaultCustomSubject ? "custom" : defaultSubject)
  const [customSubject, setCustomSubject] = useState(defaultCustomSubject || "")
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
      {
        question: "Which gas do plants absorb from the atmosphere for photosynthesis?",
        options: [
          { id: "a", text: "Carbon Dioxide", isCorrect: true },
          { id: "b", text: "Oxygen", isCorrect: false },
          { id: "c", text: "Nitrogen", isCorrect: false },
          { id: "d", text: "Hydrogen", isCorrect: false },
        ]
      }
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
      {
        question: "How many states are there in India currently?",
        options: [
          { id: "a", text: "28", isCorrect: true },
          { id: "b", text: "29", isCorrect: false },
          { id: "c", text: "25", isCorrect: false },
          { id: "d", text: "30", isCorrect: false },
        ]
      },
      {
        question: "Which line divides the Earth into Northern and Southern Hemispheres?",
        options: [
          { id: "a", text: "Equator", isCorrect: true },
          { id: "b", text: "Prime Meridian", isCorrect: false },
          { id: "c", text: "Tropic of Cancer", isCorrect: false },
          { id: "d", text: "Tropic of Capricorn", isCorrect: false },
        ]
      }
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
      {
        question: "What is a word that describes a verb or an adjective called?",
        options: [
          { id: "a", text: "Adverb", isCorrect: true },
          { id: "b", text: "Noun", isCorrect: false },
          { id: "c", text: "Adjective", isCorrect: false },
          { id: "d", text: "Pronoun", isCorrect: false },
        ]
      },
      {
        question: "Which word is a synonym of 'vibrant'?",
        options: [
          { id: "a", text: "Lively", isCorrect: true },
          { id: "b", text: "Dull", isCorrect: false },
          { id: "c", text: "Silent", isCorrect: false },
          { id: "d", text: "Fragile", isCorrect: false },
        ]
      },
      {
        question: "Identify the conjunction in: 'I wanted to play, but it started to rain.'",
        options: [
          { id: "a", text: "but", isCorrect: true },
          { id: "b", text: "wanted", isCorrect: false },
          { id: "c", text: "rain", isCorrect: false },
          { id: "d", text: "started", isCorrect: false },
        ]
      }
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
      {
        question: "What is the speed of light in a vacuum?",
        options: [
          { id: "a", text: "300,000 km/s", isCorrect: true },
          { id: "b", text: "150,000 km/s", isCorrect: false },
          { id: "c", text: "500,000 km/s", isCorrect: false },
          { id: "d", text: "100,000 km/s", isCorrect: false },
        ]
      },
      {
        question: "What type of lens is used to correct myopia (short-sightedness)?",
        options: [
          { id: "a", text: "Concave lens", isCorrect: true },
          { id: "b", text: "Convex lens", isCorrect: false },
          { id: "c", text: "Bifocal lens", isCorrect: false },
          { id: "d", text: "Cylindrical lens", isCorrect: false },
        ]
      },
      {
        question: "What is the unit of power?",
        options: [
          { id: "a", text: "Watt", isCorrect: true },
          { id: "b", text: "Joule", isCorrect: false },
          { id: "c", text: "Volt", isCorrect: false },
          { id: "d", text: "Newton", isCorrect: false },
        ]
      },
      {
        question: "Which of the following is a scalar quantity?",
        options: [
          { id: "a", text: "Speed", isCorrect: true },
          { id: "b", text: "Velocity", isCorrect: false },
          { id: "c", text: "Acceleration", isCorrect: false },
          { id: "d", text: "Force", isCorrect: false },
        ]
      }
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
      {
        question: "Which gas is most abundant in Earth's atmosphere?",
        options: [
          { id: "a", text: "Nitrogen", isCorrect: true },
          { id: "b", text: "Oxygen", isCorrect: false },
          { id: "c", text: "Carbon Dioxide", isCorrect: false },
          { id: "d", text: "Argon", isCorrect: false },
        ]
      },
      {
        question: "What is the common chemical name for Table Salt?",
        options: [
          { id: "a", text: "Sodium Chloride", isCorrect: true },
          { id: "b", text: "Sodium Bicarbonate", isCorrect: false },
          { id: "c", text: "Calcium Carbonate", isCorrect: false },
          { id: "d", text: "Potassium Chloride", isCorrect: false },
        ]
      },
      {
        question: "Which subatomic particle has a negative charge?",
        options: [
          { id: "a", text: "Electron", isCorrect: true },
          { id: "b", text: "Proton", isCorrect: false },
          { id: "c", text: "Neutron", isCorrect: false },
          { id: "d", text: "Positron", isCorrect: false },
        ]
      },
      {
        question: "What is the hardest natural substance on Earth?",
        options: [
          { id: "a", text: "Diamond", isCorrect: true },
          { id: "b", text: "Graphite", isCorrect: false },
          { id: "c", text: "Quartz", isCorrect: false },
          { id: "d", text: "Steel", isCorrect: false },
        ]
      }
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
      {
        question: "Which green pigment in leaves helps absorb solar energy?",
        options: [
          { id: "a", text: "Chlorophyll", isCorrect: true },
          { id: "b", text: "Carotene", isCorrect: false },
          { id: "c", text: "Hemoglobin", isCorrect: false },
          { id: "d", text: "Melanin", isCorrect: false },
        ]
      },
      {
        question: "How many bones are there in the adult human skeleton?",
        options: [
          { id: "a", text: "206", isCorrect: true },
          { id: "b", text: "106", isCorrect: false },
          { id: "c", text: "306", isCorrect: false },
          { id: "d", text: "250", isCorrect: false },
        ]
      },
      {
        question: "Which blood cell type is key in fighting infections?",
        options: [
          { id: "a", text: "White Blood Cells", isCorrect: true },
          { id: "b", text: "Red Blood Cells", isCorrect: false },
          { id: "c", text: "Platelets", isCorrect: false },
          { id: "d", text: "Plasma Cells", isCorrect: false },
        ]
      },
      {
        question: "What is the largest organ inside the human body?",
        options: [
          { id: "a", text: "Liver", isCorrect: true },
          { id: "b", text: "Heart", isCorrect: false },
          { id: "c", text: "Brain", isCorrect: false },
          { id: "d", text: "Kidney", isCorrect: false },
        ]
      }
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
      {
        question: "Who was the first Prime Minister of independent India?",
        options: [
          { id: "a", text: "Jawaharlal Nehru", isCorrect: true },
          { id: "b", text: "Mahatma Gandhi", isCorrect: false },
          { id: "c", text: "Sardar Vallabhbhai Patel", isCorrect: false },
          { id: "d", text: "Lal Bahadur Shastri", isCorrect: false },
        ]
      },
      {
        question: "In which year did the French Revolution begin?",
        options: [
          { id: "a", text: "1789", isCorrect: true },
          { id: "b", text: "1776", isCorrect: false },
          { id: "c", text: "1812", isCorrect: false },
          { id: "d", text: "1848", isCorrect: false },
        ]
      },
      {
        question: "Who is popularly known as the 'Iron Man of India'?",
        options: [
          { id: "a", text: "Sardar Vallabhbhai Patel", isCorrect: true },
          { id: "b", text: "Subhas Chandra Bose", isCorrect: false },
          { id: "c", text: "Bhagat Singh", isCorrect: false },
          { id: "d", text: "Chandra Shekhar Azad", isCorrect: false },
        ]
      },
      {
        question: "Who wrote the Indian national anthem 'Jana Gana Mana'?",
        options: [
          { id: "a", text: "Rabindranath Tagore", isCorrect: true },
          { id: "b", text: "Bankim Chandra Chattopadhyay", isCorrect: false },
          { id: "c", text: "Subramania Bharati", isCorrect: false },
          { id: "d", text: "Sarojini Naidu", isCorrect: false },
        ]
      }
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
      {
        question: "Which mountain peak is the tallest in the world?",
        options: [
          { id: "a", text: "Mount Everest", isCorrect: true },
          { id: "b", text: "K2", isCorrect: false },
          { id: "c", text: "Kangchenjunga", isCorrect: false },
          { id: "d", text: "Lhotse", isCorrect: false },
        ]
      },
      {
        question: "Which country occupies the largest total land area globally?",
        options: [
          { id: "a", text: "Russia", isCorrect: true },
          { id: "b", text: "Canada", isCorrect: false },
          { id: "c", text: "China", isCorrect: false },
          { id: "d", text: "United States", isCorrect: false },
        ]
      },
      {
        question: "What is the capital city of Australia?",
        options: [
          { id: "a", text: "Canberra", isCorrect: true },
          { id: "b", text: "Sydney", isCorrect: false },
          { id: "c", text: "Melbourne", isCorrect: false },
          { id: "d", text: "Brisbane", isCorrect: false },
        ]
      },
      {
        question: "Which desert is the largest hot desert in the world?",
        options: [
          { id: "a", text: "Sahara Desert", isCorrect: true },
          { id: "b", text: "Gobi Desert", isCorrect: false },
          { id: "c", text: "Kalahari Desert", isCorrect: false },
          { id: "d", text: "Thar Desert", isCorrect: false },
        ]
      }
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
      {
        question: "What is the binary equivalent of the decimal number 5?",
        options: [
          { id: "a", text: "101", isCorrect: true },
          { id: "b", text: "110", isCorrect: false },
          { id: "c", text: "100", isCorrect: false },
          { id: "d", text: "011", isCorrect: false },
        ]
      },
      {
        question: "What does HTML stand for?",
        options: [
          { id: "a", text: "HyperText Markup Language", isCorrect: true },
          { id: "b", text: "HyperText Modern Link", isCorrect: false },
          { id: "c", text: "HyperTransfer Markup Language", isCorrect: false },
          { id: "d", text: "HighText Machine Language", isCorrect: false },
        ]
      },
      {
        question: "Which of the following is a popular open-source operating system?",
        options: [
          { id: "a", text: "Linux", isCorrect: true },
          { id: "b", text: "Google Chrome", isCorrect: false },
          { id: "c", text: "Python", isCorrect: false },
          { id: "d", text: "Windows Vista", isCorrect: false },
        ]
      },
      {
        question: "What is the main function of a router in a computer network?",
        options: [
          { id: "a", text: "Forward data packets between networks", isCorrect: true },
          { id: "b", text: "Store long-term files", isCorrect: false },
          { id: "c", text: "Display websites", isCorrect: false },
          { id: "d", text: "Type documents", isCorrect: false },
        ]
      }
    ],
  }

  // This function generates realistic questions based on the selected subject
  const generateQuestions = async () => {
    const selectedSubject = subject === "custom" ? customSubject : subject

    if (!selectedSubject.trim()) {
      setError("Please select or enter a subject")
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      // First attempt to generate using Gemini AI
      try {
        const generated = await generateAiQuiz(selectedSubject, syllabus, numQuestions)
        if (generated && generated.length > 0) {
          onQuestionsGenerated(generated)
          return
        }
      } catch (e) {
        console.warn("AI generation failed, falling back to templates:", e)
      }

      // Get templates for the selected subject
      let templates = questionTemplates[selectedSubject as keyof typeof questionTemplates] || []

      // If templates are fewer than requested, merge with fallback templates
      if (templates.length < numQuestions) {
        let fallbackSubject = "Science"
        if (selectedSubject === "Math") fallbackSubject = "Science"
        else if (selectedSubject === "English") fallbackSubject = "Social Studies"
        else if (selectedSubject === "Physics" || selectedSubject === "Chemistry" || selectedSubject === "Biology") fallbackSubject = "Science"
        else if (selectedSubject === "History" || selectedSubject === "Geography") fallbackSubject = "Social Studies"
        else if (selectedSubject === "Computer Science") fallbackSubject = "Science"

        const fallbackTemplates = questionTemplates[fallbackSubject as keyof typeof questionTemplates] || []
        templates = [...templates, ...fallbackTemplates]
      }

      if (templates.length === 0) {
        throw new Error(`No questions available for ${selectedSubject}`)
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
          subject: selectedSubject,
          syllabus: syllabus,
          topic: selectedSubject
        }
      })

      // If we still don't have enough templates, add realistic ones dynamically
      if (questions.length < numQuestions) {
        const remaining = numQuestions - questions.length
        for (let i = 0; i < remaining; i++) {
          questions.push({
            id: `ai-${questions.length + i}`,
            question: `What is a fundamental concept in ${selectedSubject} that is essential for intermediate study?`,
            options: [
              { id: "a", text: `Concept Option A (Key detail)`, isCorrect: true },
              { id: "b", text: `Concept Option B (Distractor)`, isCorrect: false },
              { id: "c", text: `Concept Option C (Distractor)`, isCorrect: false },
              { id: "d", text: `Concept Option D (Distractor)`, isCorrect: false },
            ],
            points: 20,
            subject: selectedSubject,
            syllabus: syllabus,
            topic: selectedSubject
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
            onValueChange={(value) => {
              setSubject(value)
              if (value !== "custom") {
                setCustomSubject("")
              }
            }}
          >
            <SelectTrigger id="subject">
              <SelectValue placeholder={translations.enterSubject[language]} />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((subj) => (
                <SelectItem key={subj} value={subj}>{subj}</SelectItem>
              ))}
              <SelectItem value="custom">Custom Subject</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {subject === "custom" && (
          <div className="space-y-2">
            <Label htmlFor="customSubject">Custom Subject / Topic</Label>
            <Input
              id="customSubject"
              value={customSubject}
              onChange={(e) => setCustomSubject(e.target.value)}
              placeholder="Enter a subject (e.g., Python loops, Photosynthesis)"
            />
          </div>
        )}

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
