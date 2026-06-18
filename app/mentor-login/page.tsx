"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Info, Loader2, Users } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { VoiceCommand } from "@/components/voice-command"
import { setSession } from "@/lib/auth/session"
import type { VidyaiSession } from "@/lib/auth/types"

const demoMentors = [
  { id: "M001", name: "Dr. Rajesh Kumar", avatar: "👨🏽‍🏫", expertise: "Math & Science" },
  { id: "M002", name: "Priya Venkatesh", avatar: "👩🏽‍🏫", expertise: "Science & English" },
  { id: "M003", name: "Arun Sharma", avatar: "👨🏽‍💼", expertise: "History & English" },
]

export default function MentorLoginPage() {
  const router = useRouter()
  const [mentorId, setMentorId] = useState("")
  const [pin, setPin] = useState("")
  const [selectedDemo, setSelectedDemo] = useState("")
  const [activeTab, setActiveTab] = useState<"login" | "demo">("login")
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [language, setLanguage] = useState<"en" | "hi" | "te">("en")

  useEffect(() => {
    const storedLanguage = localStorage.getItem("preferredLanguage") as "en" | "hi" | "te" | null
    if (storedLanguage) setLanguage(storedLanguage)
  }, [])

  const completeLogin = (session: VidyaiSession) => {
    setSession(session)
    router.push("/mentor-dashboard")
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoggingIn(true)
    setError(null)

    setTimeout(() => {
      if (!mentorId.trim() || !pin.trim()) {
        setError("Please enter mentor ID and PIN")
        setIsLoggingIn(false)
        return
      }

      completeLogin({
        id: mentorId.trim(),
        name: "Mentor",
        role: "mentor",
        avatar: "🎓",
        isDemo: false,
      })
    }, 800)
  }

  const handleDemoLogin = () => {
    const mentor = demoMentors.find((m) => m.id === selectedDemo)
    if (!mentor) {
      setError("Please select a demo mentor")
      return
    }

    setIsLoggingIn(true)
    setTimeout(() => {
      completeLogin({
        id: mentor.id,
        name: mentor.name,
        role: "mentor",
        avatar: mentor.avatar,
        isDemo: true,
        bio: mentor.expertise,
      })
    }, 600)
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-accent/20 via-background to-primary/20 px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Link href="/" className="mb-8 inline-flex items-center gap-2 text-foreground/70 hover:text-foreground">
          <ArrowLeft size={16} />
          <span>Back</span>
        </Link>

        <div className="rounded-2xl border border-border bg-card p-8 shadow-lg">
          <div className="mb-6 flex flex-col items-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/20">
              <Users size={32} className="text-accent" />
            </div>
            <h1 className="text-2xl font-bold">Mentor Login</h1>
            <p className="mt-1 text-center text-sm text-muted-foreground">
              Access your assigned students and guidance tools
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "login" | "demo")}>
            <TabsList className="mb-6 grid grid-cols-2">
              <TabsTrigger value="login">Regular Login</TabsTrigger>
              <TabsTrigger value="demo">Demo Login</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Info size={16} className="text-accent" />
                    <Label htmlFor="mentorId">Mentor ID</Label>
                  </div>
                  <Input
                    id="mentorId"
                    value={mentorId}
                    onChange={(e) => setMentorId(e.target.value)}
                    placeholder="M001"
                    disabled={isLoggingIn}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pin">PIN</Label>
                  <Input
                    id="pin"
                    type="password"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="••••"
                    disabled={isLoggingIn}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoggingIn}>
                  {isLoggingIn ? <Loader2 className="h-5 w-5 animate-spin" /> : "Login"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="demo" className="space-y-4">
              <div className="space-y-2">
                <Label>Select demo mentor</Label>
                <Select value={selectedDemo} onValueChange={setSelectedDemo} disabled={isLoggingIn}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a mentor" />
                  </SelectTrigger>
                  <SelectContent>
                    {demoMentors.map((mentor) => (
                      <SelectItem key={mentor.id} value={mentor.id}>
                        {mentor.name} — {mentor.expertise}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full" onClick={handleDemoLogin} disabled={!selectedDemo || isLoggingIn}>
                {isLoggingIn ? <Loader2 className="h-5 w-5 animate-spin" /> : "Continue to Dashboard"}
              </Button>
            </TabsContent>
          </Tabs>

          {error && (
            <div className="mt-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
          )}
        </div>
      </motion.div>

      <VoiceCommand
        onCommand={(cmd) => {
          if (cmd.toLowerCase().includes("back")) router.push("/")
        }}
        language={language}
        availableCommands={["Go back"]}
        hideCommands
      />
    </main>
  )
}
