export type UserRole = "student" | "school" | "mentor"

export interface VidyaiSession {
  id: string
  name: string
  role: UserRole
  avatar: string
  isDemo: boolean
  class?: string
  schoolCode?: string
  email?: string
  bio?: string
}

export const SESSION_STORAGE_KEY = "vidyai_session"
export const LEGACY_SESSION_KEY = "demoUser"
