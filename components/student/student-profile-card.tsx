"use client"

import { useEffect, useState } from "react"
import { Save, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getSession, setSession } from "@/lib/auth/session"
import type { VidyaiSession } from "@/lib/auth/types"

export function StudentProfileCard() {
  const [profile, setProfile] = useState<VidyaiSession | null>(null)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const session = getSession()
    if (session) {
      setProfile(session)
      setName(session.name)
      setEmail(session.email ?? "")
    }
  }, [])

  const handleSave = () => {
    if (!profile) return
    const updated: VidyaiSession = {
      ...profile,
      name: name.trim() || profile.name,
      email: email.trim() || undefined,
    }
    setSession(updated)
    setProfile(updated)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (!profile) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          My Profile
        </CardTitle>
        <CardDescription>Manage your account details and learning identity</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-3xl">
            {profile.avatar}
          </div>
          <div>
            <p className="font-semibold text-foreground">{profile.name}</p>
            <p className="text-sm text-muted-foreground">{profile.class ?? "Student"}</p>
            <p className="text-xs text-muted-foreground">ID: {profile.id}</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="profile-name">Display name</Label>
            <Input
              id="profile-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-email">Email (optional)</Label>
            <Input
              id="profile-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@school.edu"
            />
          </div>
        </div>

        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          {saved ? "Saved" : "Save profile"}
        </Button>
      </CardContent>
    </Card>
  )
}
