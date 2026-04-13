"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Info, School } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { VoiceCommand } from "@/components/voice-command"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function SchoolLoginPage() {
  const router = useRouter()
  const [schoolCode, setSchoolCode] = useState("")
  const [adminPin, setAdminPin] = useState("")
  const [language, setLanguage] = useState<"en" | "hi" | "te">(() => {
    // Check if we're in the browser and get stored language or default to "en"
    if (typeof window !== "undefined") {
      const storedLanguage = localStorage.getItem("preferredLanguage") as "en" | "hi" | "te" | null
      return storedLanguage || "en"
    }
    return "en"
  })

  const translations = {
    title: {
      en: "School Portal Login",
      hi: "स्कूल पोर्टल लॉगिन",
      te: "స్కూల్ పోర్టల్ లాగిన్",
    },
    schoolCode: {
      en: "School Code",
      hi: "स्कूल कोड",
      te: "స్కూల్ కోడ్",
    },
    adminPin: {
      en: "Admin PIN",
      hi: "एडमिन पिन",
      te: "అడ్మిన్ పిన్",
    },
    login: {
      en: "Login",
      hi: "लॉगिन",
      te: "లాగిన్",
    },
    demo: {
      en: "Use Demo Login",
      hi: "डेमो लॉगिन का उपयोग करें",
      te: "డెమో లాగిన్ ఉపయోగించండి",
    },
    back: {
      en: "Back",
      hi: "वापस",
      te: "వెనుకకు",
    },
    voiceCommands: {
      en: ["Login", "Use demo", "Go back"],
      hi: ["लॉगिन", "डेमो उपयोग करें", "वापस जाएं"],
      te: ["లాగిన్", "డెమో ఉపయోగించండి", "వెనుకకు వెళ్ళండి"],
    },
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // For demo purposes, navigate to admin dashboard
    router.push("/admin-dashboard")
  }

  const handleDemoLogin = () => {
    setSchoolCode("ADMIN123")
    setAdminPin("1234")
    // Auto login after a short delay
    setTimeout(() => {
      router.push("/admin-dashboard")
    }, 500)
  }

  const handleVoiceCommand = (command: string) => {
    const lowerCommand = command.toLowerCase()

    // Handle login command
    if (lowerCommand.includes("login") || lowerCommand.includes("लॉगिन") || lowerCommand.includes("లాగిన్")) {
      handleLogin(new Event("submit") as any)
    }

    // Handle demo login command
    if (lowerCommand.includes("demo") || lowerCommand.includes("डेमो") || lowerCommand.includes("డెమో")) {
      handleDemoLogin()
    }

    // Handle back command
    if (lowerCommand.includes("back") || lowerCommand.includes("वापस") || lowerCommand.includes("వెనుకకు")) {
      router.push("/")
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-highlight/20 via-background to-secondary/20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Link href="/" className="inline-flex items-center gap-2 text-foreground/70 hover:text-foreground mb-8">
          <ArrowLeft size={16} />
          <span>{translations.back[language]}</span>
        </Link>

        <div className="bg-white dark:bg-card rounded-2xl shadow-lg p-8 border border-border dark:border-border">
          <div className="flex flex-col items-center mb-6">
            <div className="w-16 h-16 rounded-full bg-highlight/20 flex items-center justify-center mb-4">
              <School size={32} className="text-highlight" />
            </div>
            <h1 className="text-2xl font-bold text-center text-foreground dark:text-foreground">{translations.title[language]}</h1>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Info size={16} className="text-highlight" />
                <label htmlFor="schoolCode" className="text-sm font-medium text-foreground dark:text-foreground">
                  {translations.schoolCode[language]}
                </label>
              </div>
              <Input
                id="schoolCode"
                value={schoolCode}
                onChange={(e) => setSchoolCode(e.target.value)}
                className="h-14 text-lg"
                placeholder="ADMIN123"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Info size={16} className="text-highlight" />
                <label htmlFor="adminPin" className="text-sm font-medium text-foreground dark:text-foreground">
                  {translations.adminPin[language]}
                </label>
              </div>
              <Input
                id="adminPin"
                type="password"
                value={adminPin}
                onChange={(e) => setAdminPin(e.target.value)}
                className="h-14 text-lg"
                placeholder="••••"
              />
            </div>

            <div className="pt-2 space-y-4">
              <Button type="submit" className="w-full h-14 text-lg bg-highlight hover:bg-highlight/90">
                {translations.login[language]}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleDemoLogin}
                className="w-full h-14 text-lg border-highlight text-highlight hover:bg-highlight/10"
              >
                {translations.demo[language]}
              </Button>
            </div>
          </form>
        </div>
      </motion.div>

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
