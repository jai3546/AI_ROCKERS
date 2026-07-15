import {
  DASHBOARD_ROUTES,
  getLoginRouteForPath,
  isRouteAllowedForRole,
} from "./routes"
import {
  LEGACY_SESSION_KEY,
  SESSION_STORAGE_KEY,
  type UserRole,
  type VidyaiSession,
} from "./types"

const SESSION_CHANGE_EVENT = "vidyai:session-change"

function notifySessionChange(): void {
  if (typeof window === "undefined") return
  window.dispatchEvent(new Event(SESSION_CHANGE_EVENT))
}

function normalizeRole(role: string): UserRole {
  if (role === "school" || role === "admin") return "school"
  if (role === "mentor" || role === "teacher") return "mentor"
  return "student"
}

function parseSession(raw: string): VidyaiSession | null {
  try {
    const parsed = JSON.parse(raw) as Partial<VidyaiSession> & { role?: string }
    if (!parsed.id || !parsed.name || !parsed.role) return null

    return {
      id: parsed.id,
      name: parsed.name,
      role: normalizeRole(parsed.role),
      avatar: parsed.avatar ?? "👤",
      isDemo: parsed.isDemo ?? false,
      class: parsed.class,
      schoolCode: parsed.schoolCode,
      email: parsed.email,
      bio: parsed.bio,
    }
  } catch {
    return null
  }
}

export function getSession(): VidyaiSession | null {
  if (typeof window === "undefined") return null

  const current = localStorage.getItem(SESSION_STORAGE_KEY)
  if (current) {
    const session = parseSession(current)
    if (session) return session
  }

  const legacy = localStorage.getItem(LEGACY_SESSION_KEY)
  if (legacy) {
    const session = parseSession(legacy)
    if (session) {
      setSession(session)
      return session
    }
  }

  return null
}

export function setSession(session: VidyaiSession): void {
  if (typeof window === "undefined") return
  const normalized: VidyaiSession = { ...session, role: normalizeRole(session.role) }
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(normalized))
  localStorage.removeItem(LEGACY_SESSION_KEY)
  notifySessionChange()
}

export function clearSession(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(SESSION_STORAGE_KEY)
  localStorage.removeItem(LEGACY_SESSION_KEY)
  notifySessionChange()
}

export function subscribeToSessionChanges(listener: () => void): () => void {
  if (typeof window === "undefined") return () => {}

  const onSessionChange = () => listener()
  const onPageShow = (event: PageTransitionEvent) => {
    if (event.persisted) listener()
  }
  const onVisibilityChange = () => {
    if (document.visibilityState === "visible") listener()
  }

  window.addEventListener(SESSION_CHANGE_EVENT, onSessionChange)
  window.addEventListener("pageshow", onPageShow)
  document.addEventListener("visibilitychange", onVisibilityChange)

  return () => {
    window.removeEventListener(SESSION_CHANGE_EVENT, onSessionChange)
    window.removeEventListener("pageshow", onPageShow)
    document.removeEventListener("visibilitychange", onVisibilityChange)
  }
}

export function getDashboardForRole(role: UserRole): string {
  return DASHBOARD_ROUTES[role]
}

export function assertRouteAccess(pathname: string): {
  allowed: boolean
  redirectTo: string | null
} {
  const session = getSession()

  if (!session) {
    return { allowed: false, redirectTo: getLoginRouteForPath(pathname) }
  }

  if (!isRouteAllowedForRole(pathname, session.role)) {
    return { allowed: false, redirectTo: getDashboardForRole(session.role) }
  }

  return { allowed: true, redirectTo: null }
}
