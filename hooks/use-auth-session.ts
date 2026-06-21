"use client"

import { useCallback, useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { getSession, subscribeToSessionChanges } from "@/lib/auth/session"
import type { VidyaiSession } from "@/lib/auth/types"

export function useAuthSession() {
  const pathname = usePathname()
  const [session, setSession] = useState<VidyaiSession | null>(null)
  const [isReady, setIsReady] = useState(false)

  const refresh = useCallback(() => {
    setSession(getSession())
    setIsReady(true)
  }, [])

  useEffect(() => {
    refresh()
    return subscribeToSessionChanges(refresh)
  }, [refresh, pathname])

  return { session, isReady, refresh }
}
