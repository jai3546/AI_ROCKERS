"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Globe } from "lucide-react"

interface LanguageSelectorProps {
  onLanguageChange: (language: "en" | "hi" | "pa") => void
  initialLanguage?: "en" | "hi" | "pa"
}

export function LanguageSelector({ onLanguageChange, initialLanguage = "en" }: LanguageSelectorProps) {
  const [language, setLanguage] = useState<"en" | "hi" | "pa">(initialLanguage)

  const handleLanguageChange = (newLanguage: "en" | "hi" | "pa") => {
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
    { code: "pa", name: "ਪੰਜਾਬੀ" },
  ]

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-2 text-lg font-medium">
        <Globe size={24} className="text-secondary" />
        <span>Select Language</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {languages.map((lang) => (
          <motion.button
            key={lang.code}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleLanguageChange(lang.code as "en" | "hi" | "pa")}
            className={`language-button ${
              language === lang.code ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
            }`}
          >
            {lang.name}
          </motion.button>
        ))}
      </div>
    </div>
  )
}
