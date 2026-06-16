"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Globe } from "lucide-react"

interface LanguageSelectorProps {
  onLanguageChange: (language: "en" | "hi" | "te") => void
  initialLanguage?: "en" | "hi" | "te"
  label?: string
}

export function LanguageSelector({ onLanguageChange, initialLanguage = "en", label = "Language" }: LanguageSelectorProps) {
  const [language, setLanguage] = useState<"en" | "hi" | "te">(initialLanguage)

  const handleLanguageChange = (newLanguage: "en" | "hi" | "te") => {
    setLanguage(newLanguage)
    onLanguageChange(newLanguage)

    // Store the selected language in localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("preferredLanguage", newLanguage)
    }
  }

  const languages = [
    { code: "en", name: "English" },
    { code: "hi", name: "हिंदी" },
    { code: "te", name: "తెలుగు" },
  ]

  return (
    <div className="flex items-center gap-3">
      <div className="hidden items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground sm:flex">
        <Globe size={16} className="text-secondary" />
        <span>{label}</span>
      </div>

      <div className="flex items-center gap-1.5 rounded-full border border-border/60 bg-background/80 p-1 shadow-sm backdrop-blur dark:bg-card/70">
        {languages.map((lang) => (
          <motion.button
            key={lang.code}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleLanguageChange(lang.code as "en" | "hi" | "te")}
            className={`min-w-[4.4rem] rounded-full px-3.5 py-2 text-sm font-semibold transition-all duration-200 ${
              language === lang.code
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                : "text-foreground/80 hover:bg-muted/80 hover:text-foreground"
            }`}
          >
            {lang.name}
          </motion.button>
        ))}
      </div>
    </div>
  )
}
