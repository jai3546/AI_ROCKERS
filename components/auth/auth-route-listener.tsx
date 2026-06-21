"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { assertRouteAccess } from "@/lib/auth/session"
import { useAuthSession } from "@/hooks/use-auth-session"

export function AuthRouteListener() {
  const pathname = usePathname()
  const router = useRouter()
  const { session, isReady } = useAuthSession()

  useEffect(() => {
    if (!isReady) return

    const { allowed, redirectTo } = assertRouteAccess(pathname)
    if (!allowed && redirectTo) {
      router.replace(redirectTo)
    }
  }, [isReady, pathname, router, session])

  return null
}
