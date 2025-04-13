"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { BookOpen, FileText, Download, X, BookMarked, GraduationCap, Brain } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface LearningOptionsMenuProps {
  onClose: () => void
  onSelectQuiz: () => void
  onSelectFlashcards: () => void
  onSelectSummaries: () => void
  onSelectTextbooks: () => void
  language?: "en" | "hi" | "te"
}

export function LearningOptionsMenu({
  onClose,
  onSelectQuiz,
  onSelectFlashcards,
  onSelectSummaries,
  onSelectTextbooks,
  language = "en"
}: LearningOptionsMenuProps) {
  const translations = {
    title: {
      en: "Learning Options",
      hi: "सीखने के विकल्प",
      te: "నేర్చుకోవడానికి ఎంపికలు",
    },
    quizzes: {
      en: "Quizzes",
      hi: "क्विज़",
      te: "క్విజ్‌లు",
    },
    quizzesDesc: {
      en: "Test your knowledge with interactive quizzes",
      hi: "इंटरैक्टिव क्विज़ के साथ अपने ज्ञान का परीक्षण करें",
      te: "ఇంటరాక్టివ్ క్విజ్‌లతో మీ జ్ఞానాన్ని పరీక్షించండి",
    },
    flashcards: {
      en: "Flashcards",
      hi: "फ्लैशकार्ड",
      te: "ఫ్లాష్‌కార్డ్‌లు",
    },
    flashcardsDesc: {
      en: "Review key concepts with flashcards",
      hi: "फ्लैशकार्ड के साथ महत्वपूर्ण अवधारणाओं की समीक्षा करें",
      te: "ఫ్లాష్‌కార్డ్‌లతో ముఖ్యమైన భావనలను సమీక్షించండి",
    },
    summaries: {
      en: "Summaries",
      hi: "सारांश",
      te: "సారాంశాలు",
    },
    summariesDesc: {
      en: "Read concise summaries of key topics",
      hi: "प्रमुख विषयों के संक्षिप्त सारांश पढ़ें",
      te: "ముఖ్యమైన అంశాల సంక్షిప్త సారాంశాలను చదవండి",
    },
    textbooks: {
      en: "Textbooks",
      hi: "पाठ्यपुस्तकें",
      te: "పాఠ్యపుస్తకాలు",
    },
    textbooksDesc: {
      en: "Access digital textbooks and class notes",
      hi: "डिजिटल पाठ्यपुस्तकों और कक्षा नोट्स तक पहुंचें",
      te: "డిజిటల్ పాఠ్యపుస్తకాలు మరియు తరగతి నోట్స్‌లను యాక్సెస్ చేయండి",
    },
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white dark:bg-card rounded-xl shadow-lg border border-border dark:border-border w-full max-w-md overflow-hidden"
        >
          <div className="flex items-center justify-between p-4 border-b border-border dark:border-border">
            <h2 className="text-xl font-bold flex items-center gap-2 text-foreground dark:text-foreground">
              <BookOpen className="text-primary" size={20} />
              {translations.title[language]}
            </h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X size={18} />
            </Button>
          </div>

          <div className="p-4 grid grid-cols-1 gap-4">
            <Card 
              className="cursor-pointer bg-card dark:bg-card hover:bg-accent/10 dark:hover:bg-accent/10 transition-colors"
              onClick={onSelectQuiz}
            >
              <CardContent className="p-4 flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Brain size={24} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground dark:text-foreground">{translations.quizzes[language]}</h3>
                  <p className="text-sm text-muted-foreground dark:text-muted-foreground">{translations.quizzesDesc[language]}</p>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer bg-card dark:bg-card hover:bg-accent/10 dark:hover:bg-accent/10 transition-colors"
              onClick={onSelectFlashcards}
            >
              <CardContent className="p-4 flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
                  <FileText size={24} className="text-secondary" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground dark:text-foreground">{translations.flashcards[language]}</h3>
                  <p className="text-sm text-muted-foreground dark:text-muted-foreground">{translations.flashcardsDesc[language]}</p>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer bg-card dark:bg-card hover:bg-accent/10 dark:hover:bg-accent/10 transition-colors"
              onClick={onSelectSummaries}
            >
              <CardContent className="p-4 flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-highlight/20 flex items-center justify-center flex-shrink-0">
                  <Download size={24} className="text-highlight" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground dark:text-foreground">{translations.summaries[language]}</h3>
                  <p className="text-sm text-muted-foreground dark:text-muted-foreground">{translations.summariesDesc[language]}</p>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer bg-card dark:bg-card hover:bg-accent/10 dark:hover:bg-accent/10 transition-colors"
              onClick={onSelectTextbooks}
            >
              <CardContent className="p-4 flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                  <BookMarked size={24} className="text-accent" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground dark:text-foreground">{translations.textbooks[language]}</h3>
                  <p className="text-sm text-muted-foreground dark:text-muted-foreground">{translations.textbooksDesc[language]}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
