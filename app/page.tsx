"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowRight, BookOpen, GraduationCap, School, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { ReviewsSection } from "@/components/reviews/reviews-section"
import { Button } from "@/components/ui/button"
import { LanguageSelector } from "@/components/language-selector"
import { VoiceCommand } from "@/components/voice-command"
import Link from "next/link"

export default function LandingPage() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [language, setLanguage] = useState<"en" | "hi" | "te">(() => {
    // Check if we're in the browser and get stored language or default to "en"
    if (typeof window !== "undefined") {
      const storedLanguage = localStorage.getItem("preferredLanguage") as "en" | "hi" | "te" | null
      return storedLanguage || "en"
    }
    return "en"
  })

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLanguageChange = (newLanguage: "en" | "hi" | "te") => {
    setLanguage(newLanguage)
    // Store the selected language in localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("preferredLanguage", newLanguage)
    }
  }

  const translations = {
    title: {
      en: "VidyAI++",
      hi: "विद्या AI++",
      te: "విద్య AI++",
    },
    subtitle: {
      en: "Voice-First Learning for Everyone",
      hi: "सभी के लिए आवाज-पहले सीखना",
      te: "అందరికీ వాయిస్-ఫస్ట్ లెర్నింగ్",
    },
    studentLogin: {
      en: "Student Login",
      hi: "छात्र लॉगिन",
      te: "విద్యార్థి లాగిన్",
    },
    schoolLogin: {
      en: "School Portal",
      hi: "स्कूल पोर्टल",
      te: "స్కూల్ పోర్టల్",
    },
    demoLogin: {
      en: "Try Demo",
      hi: "डेमो आज़माएं",
      te: "డెమో ప్రయత్నించండి",
    },
    voiceCommands: {
      en: ["Student login", "School portal", "Try demo"],
      hi: ["छात्र लॉगिन", "स्कूल पोर्टल", "डेमो आज़माएं"],
      te: ["విద్యార్థి లాగిన్", "స్కూల్ పోర్టల్", "డెమో ప్రయత్నించండి"],
    },
  }

  const handleVoiceCommand = (command: string) => {
    // Handle voice commands based on language
    const studentCommands = [
      translations.studentLogin.en.toLowerCase(),
      translations.studentLogin.hi.toLowerCase(),
      translations.studentLogin.te.toLowerCase(),
    ]

    const schoolCommands = [
      translations.schoolLogin.en.toLowerCase(),
      translations.schoolLogin.hi.toLowerCase(),
      translations.schoolLogin.te.toLowerCase(),
    ]

    const demoCommands = [
      translations.demoLogin.en.toLowerCase(),
      translations.demoLogin.hi.toLowerCase(),
      translations.demoLogin.te.toLowerCase(),
    ]

    const lowerCommand = command.toLowerCase()

    if (studentCommands.includes(lowerCommand)) {
      window.location.href = "/student-login"
    } else if (schoolCommands.includes(lowerCommand)) {
      window.location.href = "/school-login"
    } else if (demoCommands.includes(lowerCommand)) {
      window.location.href = "/student-login"
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-accent/20 via-background to-highlight/20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-3xl flex flex-col items-center gap-8 text-center"
      >
        {/* Logo and Title */}
        <div className="flex flex-col items-center gap-2">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-4xl font-bold mb-4"
          >
            V+
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            {translations.title[language]}
          </h1>
          <p className="text-xl md:text-2xl text-foreground/80 mt-2">{translations.subtitle[language]}</p>
        </div>

        {/* Language Selector and Theme Toggle */}
        <div className="flex items-center gap-4">
          <LanguageSelector onLanguageChange={handleLanguageChange} initialLanguage={language} />
          {mounted && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-full"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              <span className="sr-only">Toggle theme</span>
            </Button>
          )}
        </div>

        {/* Login Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mt-8">
          <Link href="/student-login" passHref>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-white dark:bg-card text-foreground dark:text-foreground shadow-lg border border-border dark:border-border cursor-pointer"
            >
              <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center">
                <BookOpen size={32} className="text-secondary" />
              </div>
              <h2 className="text-xl font-bold">{translations.studentLogin[language]}</h2>
              <Button className="mt-2 bg-secondary hover:bg-secondary/90">
                <ArrowRight className="mr-2 h-4 w-4" /> {translations.studentLogin[language]}
              </Button>
            </motion.div>
          </Link>

          <Link href="/school-login" passHref>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-white dark:bg-card text-foreground dark:text-foreground shadow-lg border border-border dark:border-border cursor-pointer"
            >
              <div className="w-16 h-16 rounded-full bg-highlight/20 flex items-center justify-center">
                <School size={32} className="text-highlight" />
              </div>
              <h2 className="text-xl font-bold">{translations.schoolLogin[language]}</h2>
              <Button className="mt-2 bg-highlight hover:bg-highlight/90">
                <ArrowRight className="mr-2 h-4 w-4" /> {translations.schoolLogin[language]}
              </Button>
            </motion.div>
          </Link>
        </div>


      </motion.div>

      {/* Reviews Section */}
      <ReviewsSection
        title={language === "en" ? "What Our Users Say" : language === "hi" ? "हमारे उपयोगकर्ता क्या कहते हैं" : "మా వినియోగదారులు ఏమి చెబుతున్నారు"}
        subtitle={language === "en" ? "Read reviews from students, teachers, and parents" : language === "hi" ? "छात्रों, शिक्षकों और अभिभावकों की समीक्षाएँ पढ़ें" : "విద్యార్థులు, ఉపాధ్యాయులు మరియు తల్లిదండ్రుల నుండి సమీక్షలను చదవండి"}
        language={language}
      />

      {/* Voice Command Component */}
      <VoiceCommand
        onCommand={handleVoiceCommand}
        language={language}
        availableCommands={translations.voiceCommands[language]}
        hideCommands={true}
      />
    </main>
  )
}
