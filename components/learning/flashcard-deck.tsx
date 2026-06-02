"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Download, FileText, X, Sparkles, Filter, BookOpen, ArrowLeft, Globe, Compass, Layers, BookMarked } from "lucide-react"
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
  subject?: string
  defaultShowAiGenerator?: boolean
  defaultAiTopic?: string
}

const SUBJECTS_CONFIG = {
  "Science": {
    icon: Globe,
    color: "text-blue-500",
    gradient: "from-blue-500/20 via-cyan-500/10 to-transparent",
    border: "border-blue-500/30 hover:border-blue-500",
    description: "Review biological processes, physical laws, and chemistry basics."
  },
  "Math": {
    icon: Compass,
    color: "text-purple-500",
    gradient: "from-purple-500/20 via-indigo-500/10 to-transparent",
    border: "border-purple-500/30 hover:border-purple-500",
    description: "Review geometry definitions, formulas, and math properties."
  },
  "Social Studies": {
    icon: Layers,
    color: "text-amber-500",
    gradient: "from-amber-500/20 via-orange-500/10 to-transparent",
    border: "border-amber-500/30 hover:border-amber-500",
    description: "Study key historical dates, geographical facts, and culture."
  },
  "English": {
    icon: BookMarked,
    color: "text-emerald-500",
    gradient: "from-emerald-500/20 via-teal-500/10 to-transparent",
    border: "border-emerald-500/30 hover:border-emerald-500",
    description: "Learn grammar definitions, parts of speech, and vocabulary."
  }
}

export function FlashcardDeck({
  cards,
  onClose,
  onFlashcardsGenerated, // Optional prop in case parent wants to listen, but local state manages rendering
  language = "en",
  syllabus = "General",
  subject = "all",
  defaultShowAiGenerator = false,
  defaultAiTopic = ""
}: FlashcardDeckProps & { onFlashcardsGenerated?: (cards: Flashcard[]) => void }) {
  const [allCardsList, setAllCardsList] = useState<Flashcard[]>(cards)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [filteredCards, setFilteredCards] = useState<Flashcard[]>([])
  const [selectedSubject, setSelectedSubject] = useState<string>(subject)
  const [showSubjectSelect, setShowSubjectSelect] = useState<boolean>(subject === "all")
  const [showAIGenerator, setShowAIGenerator] = useState(defaultShowAiGenerator)

  // Sync state if cards prop changes
  useEffect(() => {
    setAllCardsList(cards)
  }, [cards])

  // Sync selectedSubject if subject prop changes
  useEffect(() => {
    setSelectedSubject(subject)
    setShowSubjectSelect(subject === "all")
  }, [subject])

  // Filter cards based on syllabus and subject
  useEffect(() => {
    let filtered = allCardsList.filter(card => card.syllabus === syllabus || card.syllabus === "General")

    // Further filter by subject if a specific subject is selected
    if (selectedSubject !== "all") {
      filtered = filtered.filter(card => card.subject === selectedSubject)
    }

    setFilteredCards(filtered.length > 0 ? filtered : allCardsList)
    // Reset current index when filters change
    setCurrentIndex(0)
    setFlipped(false)
  }, [allCardsList, syllabus, selectedSubject])

  // Get unique subjects from the cards
  const subjects = Array.from(new Set(allCardsList
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
    download: {
      en: "Download",
      hi: "डाउनलोड",
      te: "డౌన్‌లోడ్",
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
    // Add the new flashcards to the local list of all cards
    setAllCardsList(prev => [...newFlashcards, ...prev])
    
    // Set the selected subject of the deck to the subject of the new flashcards
    if (newFlashcards.length > 0) {
      setSelectedSubject(newFlashcards[0].subject)
      setShowSubjectSelect(false)
    }
    
    setShowAIGenerator(false)
    setCurrentIndex(0)
    setFlipped(false)

    if (onFlashcardsGenerated) {
      onFlashcardsGenerated(newFlashcards)
    }
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

  if (showSubjectSelect) {
    return (
      <div className="w-full max-w-2xl mx-auto space-y-6 py-4 px-2">
        <div className="flex items-center justify-between animate-fade-in">
          <h2 className="text-xl font-bold flex items-center gap-2 text-foreground">
            <FileText className="text-primary" size={20} />
            Choose Subject for Flashcards
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X size={18} />
          </Button>
        </div>
        <p className="text-muted-foreground text-sm">
          Select a subject to browse and practice its flashcards.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {subjects.map((subj) => {
            const config = SUBJECTS_CONFIG[subj as keyof typeof SUBJECTS_CONFIG] || {
              icon: BookOpen,
              color: "text-foreground",
              gradient: "from-gray-500/10 to-transparent",
              border: "border-border hover:border-gray-500",
              description: "Browse subject flashcards."
            }
            const IconComponent = config.icon
            const cardCount = allCardsList.filter(
              c => c.subject === subj && (c.syllabus === syllabus || c.syllabus === "General")
            ).length

            return (
              <motion.div
                key={subj}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setSelectedSubject(subj)
                  setShowSubjectSelect(false)
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
                        <p className="text-xs text-muted-foreground">{cardCount} cards available</p>
                      </div>
                    </div>
                    <p className="text-sm text-foreground/80 leading-relaxed font-light">{config.description}</p>
                    <div className="flex items-center text-xs font-semibold text-primary mt-2">
                      Start Practice <ChevronRight size={14} className="ml-1" />
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
                  Generate custom Flashcards with Gemini AI
                </h4>
                <p className="text-xs text-muted-foreground max-w-md font-light">
                  Can't find your subject or want to practice a specific topic? Create custom flashcards instantly.
                </p>
              </div>
              <Button
                onClick={() => {
                  setShowAIGenerator(true)
                  setShowSubjectSelect(false)
                }}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border border-indigo-500/20 shrink-0"
              >
                Start AI Flashcard Generator
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (allCardsList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p>No flashcards available.</p>
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
            <Button variant="ghost" size="icon" onClick={() => {
              setShowAIGenerator(false)
              if (selectedSubject === "all") {
                setShowSubjectSelect(true)
              }
            }}>
              <X size={18} />
            </Button>
          </div>

          <AIFlashcardGenerator
            onFlashcardsGenerated={handleAIFlashcardsGenerated}
            syllabus={syllabus}
            defaultSubject={selectedSubject === "all" ? "" : selectedSubject}
            defaultCustomSubject={defaultAiTopic}
          />
        </div>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex flex-wrap items-center gap-2">
              {subject === "all" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSubjectSelect(true)}
                  className="h-8 text-xs flex items-center gap-1 hover:bg-muted"
                >
                  <ArrowLeft size={12} />
                  Subjects
                </Button>
              )}
              <span className="font-medium text-sm">
                {translations.card[language]} {currentIndex + 1} {translations.of[language]} {filteredCards.length}
              </span>
              {currentCard && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                  {currentCard.subject}
                </Badge>
              )}
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-2 max-sm:w-full">
              <div className="sm:hidden"></div>
              <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
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
                className="flex items-center gap-1 text-xs sm:text-sm"
                onClick={handleDownloadCards}
              >
                <Download size={14} />
                <span className="hidden sm:inline">{translations.downloadCards[language]}</span>
                <span className="sm:hidden">{translations.download[language]}</span>
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
