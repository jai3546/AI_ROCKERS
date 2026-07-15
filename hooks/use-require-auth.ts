"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { assertRouteAccess, getDashboardForRole } from "@/lib/auth/session"
import type { UserRole, VidyaiSession } from "@/lib/auth/types"
import { useAuthSession } from "@/hooks/use-auth-session"

export function useRequireAuth(allowedRoles: UserRole[]) {
  const router = useRouter()
  const pathname = usePathname()
  const { session, isReady } = useAuthSession()
  const [user, setUser] = useState<VidyaiSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isReady) return

    if (!session) {
      setUser(null)
      setIsLoading(true)
      const { redirectTo } = assertRouteAccess(pathname)
      router.replace(redirectTo ?? "/student-login")
      return
    }

    if (!allowedRoles.includes(session.role)) {
      setUser(null)
      setIsLoading(true)
      router.replace(getDashboardForRole(session.role))
      return
    }

    setUser(session)
    setIsLoading(false)
  }, [allowedRoles, isReady, pathname, router, session])

  return { user, isLoading }
}
