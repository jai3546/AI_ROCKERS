"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, BookOpen, GraduationCap, Info, Loader2, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { VoiceCommand } from "@/components/voice-command"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { useRouter } from "next/navigation"

// Demo credentials for different classes
const demoCredentials = {
  "Class 6": [
    { id: "demo-6-1", name: "Arjun Kumar", role: "student", avatar: "👦🏽" },
    { id: "demo-6-2", name: "Priya Singh", role: "student", avatar: "👧🏽" },
  ],
  "Class 7": [
    { id: "demo-7-1", name: "Rahul Sharma", role: "student", avatar: "👦🏽" },
    { id: "demo-7-2", name: "Ananya Patel", role: "student", avatar: "👧🏽" },
  ],
  "Class 8": [
    { id: "demo-8-1", name: "Vikram Reddy", role: "student", avatar: "👦🏽" },
    { id: "demo-8-2", name: "Meera Gupta", role: "student", avatar: "👧🏽" },
  ],
  "Class 9": [
    { id: "demo-9-1", name: "Aditya Verma", role: "student", avatar: "👦🏽" },
    { id: "demo-9-2", name: "Sneha Desai", role: "student", avatar: "👧🏽" },
  ],
  "Class 10": [
    { id: "demo-10-1", name: "Rohan Malhotra", role: "student", avatar: "👦🏽" },
    { id: "demo-10-2", name: "Neha Kapoor", role: "student", avatar: "👧🏽" },
  ],
  "Class 11": [
    { id: "demo-11-1", name: "Karthik Iyer", role: "student", avatar: "👦🏽" },
    { id: "demo-11-2", name: "Divya Nair", role: "student", avatar: "👧🏽" },
  ],
  "Class 12": [
    { id: "demo-12-1", name: "Aryan Choudhury", role: "student", avatar: "👦🏽" },
    { id: "demo-12-2", name: "Riya Mehta", role: "student", avatar: "👧🏽" },
  ],
}

export default function StudentLoginPage() {
  const router = useRouter()
  const [schoolCode, setSchoolCode] = useState("")
  const [studentId, setStudentId] = useState("")
  const [language, setLanguage] = useState<"en" | "hi" | "te">(() => {
    // Check if we're in the browser and get stored language or default to "en"
    if (typeof window !== "undefined") {
      const storedLanguage = localStorage.getItem("preferredLanguage") as "en" | "hi" | "te" | null
      return storedLanguage || "en"
    }
    return "en"
  })
  const [activeTab, setActiveTab] = useState<"login" | "demo">("login")
  const [selectedClass, setSelectedClass] = useState<string>("")
  const [selectedUser, setSelectedUser] = useState<string>("")
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)

  const translations = {
    title: {
      en: "Student Login",
      hi: "छात्र लॉगिन",
      te: "విద్యార్థి లాగిన్",
    },
    schoolCode: {
      en: "School Code",
      hi: "स्कूल कोड",
      te: "స్కూల్ కోడ్",
    },
    studentId: {
      en: "Student ID",
      hi: "छात्र आईडी",
      te: "విద్యార్థి ఐడి",
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
    regularLogin: {
      en: "Regular Login",
      hi: "नियमित लॉगिन",
      te: "నియమిత లాగిన్",
    },
    demoLogin: {
      en: "Demo Login",
      hi: "डेमो लॉगिन",
      te: "డెమో లాగిన్",
    },
    selectClass: {
      en: "Select Class",
      hi: "कक्षा चुनें",
      te: "తరగతిని ఎంచుకోండి",
    },
    selectStudent: {
      en: "Select Student",
      hi: "छात्र चुनें",
      te: "విద్యార్థిని ఎంచుకోండి",
    },
    continue: {
      en: "Continue to Dashboard",
      hi: "डैशबोर्ड पर जारी रखें",
      te: "డాష్‌బోర్డ్‌కి కొనసాగించండి",
    },
    loggingIn: {
      en: "Logging in...",
      hi: "लॉग इन हो रहा है...",
      te: "లాగిన్ అవుతోంది...",
    },
    voiceCommands: {
      en: ["Login", "Use demo", "Go back"],
      hi: ["लॉगिन", "डेमो उपयोग करें", "वापस जाएं"],
      te: ["లాగిన్", "డెమో ఉపయోగించండి", "వెనుకకు వెళ్ళండి"],
    },
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoggingIn(true)
    setLoginError(null)

    // Validate inputs
    if (!schoolCode.trim() || !studentId.trim()) {
      setLoginError("Please enter both School Code and Student ID")
      setIsLoggingIn(false)
      return
    }

    // Simulate login delay
    setTimeout(() => {
      try {
        // Check if there are any stored students in localStorage
        const storedStudentsStr = localStorage.getItem("managedStudents")
        let foundStudent = null

        if (storedStudentsStr) {
          const storedStudents = JSON.parse(storedStudentsStr)

          // Find student with matching credentials
          foundStudent = storedStudents.find(
            (s: any) => s.schoolCode === schoolCode && s.studentId === studentId
          )
        }

        // If we found a matching student, log them in
        if (foundStudent) {
          localStorage.setItem("demoUser", JSON.stringify({
            id: foundStudent.id,
            name: foundStudent.name,
            class: foundStudent.class,
            role: "student",
            avatar: "👨‍🎓",
            isDemo: false
          }))

          // Navigate to student dashboard
          router.push("/student-dashboard")
        } else {
          // For demo purposes, allow login with any credentials
          localStorage.setItem("demoUser", JSON.stringify({
            id: studentId,
            name: "Student User",
            class: "Class 10",
            role: "student",
            avatar: "👨‍🎓",
            isDemo: true
          }))

          // Navigate to student dashboard
          router.push("/student-dashboard")
        }
      } catch (error) {
        console.error("Login error:", error)
        setLoginError("An error occurred during login. Please try again.")
        setIsLoggingIn(false)
      }
    }, 1000)
  }

  const handleDemoLogin = async () => {
    if (!selectedClass || !selectedUser) {
      setLoginError("Please select both class and user")
      return
    }

    setIsLoggingIn(true)
    setLoginError(null)

    try {
      // Simulate login delay
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Get user details
      const userClass = selectedClass as keyof typeof demoCredentials
      const user = demoCredentials[userClass].find(u => u.id === selectedUser)

      if (!user) {
        throw new Error("Invalid user selection")
      }

      // Store user info in localStorage
      localStorage.setItem("demoUser", JSON.stringify({
        id: user.id,
        name: user.name,
        class: selectedClass,
        role: user.role,
        avatar: user.avatar,
        isDemo: true
      }))

      // Navigate to student dashboard
      router.push("/student-dashboard")
    } catch (err) {
      console.error("Login error:", err)
      setLoginError("Failed to log in. Please try again.")
    } finally {
      setIsLoggingIn(false)
    }
  }

  const handleVoiceCommand = (command: string) => {
    const lowerCommand = command.toLowerCase()

    // Handle login command
    if (lowerCommand.includes("login") || lowerCommand.includes("लॉगिन") || lowerCommand.includes("లాగిన్")) {
      if (activeTab === "login") {
        handleLogin(new Event("submit") as any)
      } else if (selectedClass && selectedUser) {
        handleDemoLogin()
      }
    }

    // Handle demo login command
    if (lowerCommand.includes("demo") || lowerCommand.includes("डेमो") || lowerCommand.includes("డెమో")) {
      setActiveTab("demo")
      // If we already have selections, try to login
      if (selectedClass && selectedUser) {
        handleDemoLogin()
      }
    }

    // Handle back command
    if (lowerCommand.includes("back") || lowerCommand.includes("वापस") || lowerCommand.includes("వెనుకకు")) {
      router.push("/")
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-secondary/20 via-background to-primary/20">
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
            <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center mb-4">
              <BookOpen size={32} className="text-secondary" />
            </div>
            <h1 className="text-2xl font-bold text-center text-foreground dark:text-foreground">{translations.title[language]}</h1>
          </div>

          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "login" | "demo")} className="w-full">
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value="login">{translations.regularLogin[language]}</TabsTrigger>
              <TabsTrigger value="demo">{translations.demoLogin[language]}</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-6">
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Info size={16} className="text-secondary" />
                    <label htmlFor="schoolCode" className="text-sm font-medium">
                      {translations.schoolCode[language]}
                    </label>
                  </div>
                  <Input
                    id="schoolCode"
                    value={schoolCode}
                    onChange={(e) => setSchoolCode(e.target.value)}
                    className="h-14 text-lg"
                    placeholder="SCHOOL123"
                    disabled={isLoggingIn}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Info size={16} className="text-secondary" />
                    <label htmlFor="studentId" className="text-sm font-medium">
                      {translations.studentId[language]}
                    </label>
                  </div>
                  <Input
                    id="studentId"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="h-14 text-lg"
                    placeholder="STUDENT001"
                    disabled={isLoggingIn}
                  />
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    className="w-full h-14 text-lg bg-primary hover:bg-primary/90"
                    disabled={isLoggingIn}
                  >
                    {isLoggingIn ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        {translations.loggingIn[language]}
                      </>
                    ) : (
                      translations.login[language]
                    )}
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="demo" className="space-y-6">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="class">{translations.selectClass[language]}</Label>
                  <Select
                    value={selectedClass}
                    onValueChange={(value) => {
                      setSelectedClass(value)
                      setSelectedUser("")
                    }}
                    disabled={isLoggingIn}
                  >
                    <SelectTrigger id="class" className="h-14 text-lg">
                      <SelectValue placeholder={translations.selectClass[language]} />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(demoCredentials).map((className) => (
                        <SelectItem key={className} value={className}>
                          {className}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedClass && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="user">{translations.selectStudent[language]}</Label>
                    <div className="grid grid-cols-1 gap-2">
                      {demoCredentials[selectedClass as keyof typeof demoCredentials].map((user) => (
                        <Button
                          key={user.id}
                          type="button"
                          variant={selectedUser === user.id ? "default" : "outline"}
                          className="justify-start h-auto py-3 px-4"
                          onClick={() => setSelectedUser(user.id)}
                          disabled={isLoggingIn}
                        >
                          <div className="flex items-center gap-3">
                            <div className="text-2xl">{user.avatar}</div>
                            <div className="text-left">
                              <div className="font-medium text-foreground dark:text-foreground">{user.name}</div>
                              <div className="text-xs text-muted-foreground dark:text-muted-foreground capitalize">{user.role}</div>
                            </div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </motion.div>
                )}

                <div className="pt-2">
                  <Button
                    className="w-full h-14 text-lg"
                    onClick={handleDemoLogin}
                    disabled={!selectedClass || !selectedUser || isLoggingIn}
                  >
                    {isLoggingIn ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        {translations.loggingIn[language]}
                      </>
                    ) : (
                      <>
                        {translations.continue[language]}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {loginError && (
            <div className="mt-4 p-3 bg-destructive/10 text-destructive rounded-md text-sm">
              {loginError}
            </div>
          )}
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
