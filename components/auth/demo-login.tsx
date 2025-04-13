"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowRight, BookOpen, Loader2, LockKeyhole, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

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
  "Teacher": [
    { id: "demo-t-1", name: "Mr. Rajesh Kumar", role: "teacher", avatar: "👨🏽‍🏫" },
    { id: "demo-t-2", name: "Mrs. Sunita Sharma", role: "teacher", avatar: "👩🏽‍🏫" },
  ],
}

export function DemoLogin() {
  const router = useRouter()
  const [selectedClass, setSelectedClass] = useState<string>("")
  const [selectedUser, setSelectedUser] = useState<string>("")
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async () => {
    if (!selectedClass || !selectedUser) {
      setError("Please select both class and user")
      return
    }

    setIsLoggingIn(true)
    setError(null)

    try {
      // Simulate login delay
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Get user details
      const userClass = selectedClass as keyof typeof demoCredentials
      const user = demoCredentials[userClass].find(u => u.id === selectedUser)

      if (!user) {
        throw new Error("Invalid user selection")
      }

      // Store user info in localStorage (in a real app, this would be handled by a proper auth system)
      localStorage.setItem("demoUser", JSON.stringify({
        id: user.id,
        name: user.name,
        class: selectedClass,
        role: user.role,
        avatar: user.avatar,
        isDemo: true
      }))

      // Redirect based on role
      if (user.role === "teacher") {
        router.push("/teacher-dashboard")
      } else {
        router.push("/student-dashboard")
      }
    } catch (err) {
      console.error("Login error:", err)
      setError("Failed to log in. Please try again.")
    } finally {
      setIsLoggingIn(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <LockKeyhole className="h-6 w-6 text-primary" />
          Demo Login
        </CardTitle>
        <CardDescription>
          Select a class and user to access the demo account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="class">Select Class</Label>
          <Select
            value={selectedClass}
            onValueChange={(value) => {
              setSelectedClass(value)
              setSelectedUser("")
            }}
          >
            <SelectTrigger id="class">
              <SelectValue placeholder="Select a class" />
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
            <Label htmlFor="user">Select User</Label>
            <div className="grid grid-cols-1 gap-2">
              {demoCredentials[selectedClass as keyof typeof demoCredentials].map((user) => (
                <Button
                  key={user.id}
                  variant={selectedUser === user.id ? "default" : "outline"}
                  className="justify-start h-auto py-3 px-4"
                  onClick={() => setSelectedUser(user.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{user.avatar}</div>
                    <div className="text-left">
                      <div className="font-medium">{user.name}</div>
                      <div className="text-xs text-muted-foreground capitalize">{user.role}</div>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </motion.div>
        )}

        {error && (
          <div className="text-sm text-destructive">{error}</div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={handleLogin}
          disabled={!selectedClass || !selectedUser || isLoggingIn}
        >
          {isLoggingIn ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Logging in...
            </>
          ) : (
            <>
              Continue to Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
