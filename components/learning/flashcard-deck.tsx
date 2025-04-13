"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Download, FileText, X, Sparkles, Filter, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AIFlashcardGenerator } from "./ai-flashcard-generator"
import { updateSchoolPortal } from "@/services/school-portal-service"

export interface Flashcard {
  id: string
  front: string
  back: string
  subject: string
  syllabus: "AP" | "Telangana" | "CBSE" | "General"
}

interface FlashcardDeckProps {
  cards: Flashcard[]
  onClose: () => void
  language?: "en" | "hi" | "te"
  syllabus?: "AP" | "Telangana" | "CBSE" | "General"
}

export function FlashcardDeck({
  cards,
  onClose,
  language = "en",
  syllabus = "General"
}: FlashcardDeckProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [filteredCards, setFilteredCards] = useState<Flashcard[]>([])
  const [selectedSubject, setSelectedSubject] = useState<string>("all")
  const [showAIGenerator, setShowAIGenerator] = useState(false)

  // Filter cards based on syllabus and subject
  useEffect(() => {
    let filtered = cards.filter(card => card.syllabus === syllabus || card.syllabus === "General")

    // Further filter by subject if a specific subject is selected
    if (selectedSubject !== "all") {
      filtered = filtered.filter(card => card.subject === selectedSubject)
    }

    setFilteredCards(filtered.length > 0 ? filtered : cards)
    // Reset current index when filters change
    setCurrentIndex(0)
    setFlipped(false)
  }, [cards, syllabus, selectedSubject])

  // Get unique subjects from the cards
  const subjects = Array.from(new Set(cards
    .filter(card => card.syllabus === syllabus || card.syllabus === "General")
    .map(card => card.subject)))

  const currentCard = filteredCards[currentIndex]
  const progress = ((currentIndex + 1) / filteredCards.length) * 100

  const translations = {
    card: {
      en: "Card",
      hi: "कार्ड",
      te: "కార్డు",
    },
    of: {
      en: "of",
      hi: "का",
      te: "యొక్క",
    },
    tapToFlip: {
      en: "Tap to flip",
      hi: "फ्लिप करने के लिए टैप करें",
      te: "ఫ్లిప్ చేయడానికి నొక్కండి",
    },
    downloadCards: {
      en: "Download Cards",
      hi: "कार्ड डाउनलोड करें",
      te: "కార్డులను డౌన్‌లోడ్ చేయండి",
    },
    close: {
      en: "Close",
      hi: "बंद करें",
      te: "మూసివేయండి",
    },
    allSubjects: {
      en: "All Subjects",
      hi: "सभी विषय",
      te: "అన్ని విషయాలు",
    },
    filterBySubject: {
      en: "Filter by Subject",
      hi: "विषय के अनुसार फ़िल्टर करें",
      te: "విషయం ద్వారా ఫిల్టర్ చేయండి",
    },
    generateAI: {
      en: "Generate AI Flashcards",
      hi: "AI फ्लैशकार्ड जनरेट करें",
      te: "AI ఫ్లాష్‌కార్డ్‌లను రూపొందించండి",
    },
    subject: {
      en: "Subject",
      hi: "विषय",
      te: "విషయం",
    }
  }

  // Handle AI-generated flashcards
  const handleAIFlashcardsGenerated = (newFlashcards: Flashcard[]) => {
    // Add the new flashcards to the filtered cards
    setFilteredCards([...newFlashcards, ...filteredCards])
    setShowAIGenerator(false)

    // Reset to show the first new card
    setCurrentIndex(0)
    setFlipped(false)
  }

  const handleNext = async () => {
    if (currentIndex < filteredCards.length - 1) {
      setFlipped(false)
      setTimeout(() => {
        setCurrentIndex(currentIndex + 1)
      }, 200)
    } else if (currentIndex === filteredCards.length - 1) {
      // This is the last card, update the school portal
      try {
        const portalResponse = await updateSchoolPortal({
          studentId: "current-user", // In a real app, this would be the actual student ID
          activityType: 'flashcard',
          activityDetails: {
            subject: currentCard.subject,
            cardsReviewed: filteredCards.length,
            completed: true,
            timestamp: Date.now()
          }
        });

        console.log('School portal updated for flashcard completion:', portalResponse);

        // You could show a reward popup or update XP here
        // This would typically be handled by the parent component
      } catch (error) {
        console.error('Failed to update school portal:', error);
      }
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setFlipped(false)
      setTimeout(() => {
        setCurrentIndex(currentIndex - 1)
      }, 200)
    }
  }

  const handleFlip = () => {
    setFlipped(!flipped)
  }

  const handleDownloadCards = () => {
    // Create a summary of the flashcards
    const summary = `
Flashcards - ${syllabus} Syllabus
=======================
Date: ${new Date().toLocaleDateString()}

${filteredCards.map((card, index) => {
  return `
Card ${index + 1}:
Front: ${card.front}
Back: ${card.back}
Subject: ${card.subject}
`
}).join('')}
    `.trim()

    // Create a blob and download link
    const blob = new Blob([summary], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'flashcards.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (!currentCard) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p>No flashcards available for this syllabus.</p>
        <Button onClick={onClose} className="mt-4">
          {translations.close[language]}
        </Button>
      </div>
    )
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {showAIGenerator ? (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Sparkles size={18} className="text-primary" />
              {translations.generateAI[language]}
            </h3>
            <Button variant="ghost" size="icon" onClick={() => setShowAIGenerator(false)}>
              <X size={18} />
            </Button>
          </div>

          <AIFlashcardGenerator
            onFlashcardsGenerated={handleAIFlashcardsGenerated}
            syllabus={syllabus}
          />
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="font-medium">
                {translations.card[language]} {currentIndex + 1} {translations.of[language]} {filteredCards.length}
              </span>
              {currentCard && (
                <Badge variant="outline" className="ml-2">
                  {currentCard.subject}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X size={18} />
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div className="flex-1 mr-2">
              <Select
                value={selectedSubject}
                onValueChange={setSelectedSubject}
              >
                <SelectTrigger className="h-8">
                  <SelectValue placeholder={translations.filterBySubject[language]} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{translations.allSubjects[language]}</SelectItem>
                  {subjects.map(subject => (
                    <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              onClick={() => setShowAIGenerator(true)}
            >
              <Sparkles size={14} className="mr-1" />
              AI
            </Button>
          </div>

          <Progress value={progress} className="h-1.5 mb-6" />
        </>
      )}

      {!showAIGenerator && filteredCards.length > 0 && (
        <>
          <div className="relative mb-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex + (flipped ? "-flipped" : "")}
                initial={{ rotateY: flipped ? -90 : 0, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: flipped ? 0 : 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="w-full"
              >
                <Card
                  className="w-full aspect-[4/3] cursor-pointer"
                  onClick={handleFlip}
                >
                  <CardContent className="flex flex-col items-center justify-center h-full p-6 text-center">
                    <div className="text-xl font-medium mb-4">
                      {flipped ? currentCard.back : currentCard.front}
                    </div>
                    <div className="text-xs text-muted-foreground mt-auto">
                      {translations.tapToFlip[language]}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
            >
              <ChevronLeft size={18} />
            </Button>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                onClick={handleDownloadCards}
              >
                <Download size={14} />
                {translations.downloadCards[language]}
              </Button>
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={handleNext}
              disabled={currentIndex === filteredCards.length - 1}
            >
              <ChevronRight size={18} />
            </Button>
          </div>
        </>
      )}

      {!showAIGenerator && filteredCards.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No flashcards found</h3>
          <p className="text-sm text-muted-foreground mb-6">There are no flashcards available for the selected subject.</p>
          <Button onClick={() => setShowAIGenerator(true)}>
            <Sparkles className="mr-2 h-4 w-4" />
            Generate AI Flashcards
          </Button>
        </div>
      )}
    </div>
  )
}
