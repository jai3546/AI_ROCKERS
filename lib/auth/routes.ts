import type { UserRole } from "./types"

export const PUBLIC_ROUTES = [
  "/",
  "/student-login",
  "/school-login",
  "/mentor-login",
  "/demo-login",
] as const

export const ROLE_ROUTES: Record<UserRole, readonly string[]> = {
  student: ["/student-dashboard", "/learning-brain", "/session-history", "/student-profile"],
  school: ["/admin-dashboard"],
  mentor: ["/mentor-dashboard"],
}

export const LOGIN_ROUTES: Record<UserRole, string> = {
  student: "/student-login",
  school: "/school-login",
  mentor: "/mentor-login",
}

export const DASHBOARD_ROUTES: Record<UserRole, string> = {
  student: "/student-dashboard",
  school: "/admin-dashboard",
  mentor: "/mentor-dashboard",
}

export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )
}

export function isRouteAllowedForRole(pathname: string, role: UserRole): boolean {
  if (isPublicRoute(pathname)) return true
  return ROLE_ROUTES[role].some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )
}

export function getLoginRouteForPath(pathname: string): string {
  if (pathname.startsWith("/admin-dashboard")) return LOGIN_ROUTES.school
  if (pathname.startsWith("/mentor")) return LOGIN_ROUTES.mentor
  return LOGIN_ROUTES.student
}
