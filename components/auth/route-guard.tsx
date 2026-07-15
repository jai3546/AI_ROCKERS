"use client"

import type { ReactNode } from "react"
import { useRequireAuth } from "@/hooks/use-require-auth"
import type { UserRole } from "@/lib/auth/types"

interface RouteGuardProps {
  allowedRoles: UserRole[]
  children: (user: NonNullable<ReturnType<typeof useRequireAuth>["user"]>) => ReactNode
  fallback?: ReactNode
}

export function RouteGuard({ allowedRoles, children, fallback }: RouteGuardProps) {
  const { user, isLoading } = useRequireAuth(allowedRoles)

  if (isLoading || !user) {
    return (
      fallback ?? (
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
        </div>
      )
    )
  }

  return <>{children(user)}</>
}
