import type { Course } from "@/types/course"
import { CourseSchema } from "@/types/course"

const STORAGE_KEY = "vidyai_generated_courses"

function isBrowser(): boolean {
  return typeof window !== "undefined"
}

export function getAllCourses(): Course[] {
  if (!isBrowser()) return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .map((item) => {
        const result = CourseSchema.safeParse(item)
        return result.success ? result.data : null
      })
      .filter((c): c is Course => c !== null)
  } catch {
    return []
  }
}

export function getCourseById(id: string): Course | null {
  return getAllCourses().find((c) => c.id === id) ?? null
}

export function saveCourse(course: Course): void {
  if (!isBrowser()) return
  const validated = CourseSchema.parse(course)
  const courses = getAllCourses()
  const existingIndex = courses.findIndex((c) => c.id === validated.id)
  if (existingIndex >= 0) {
    courses[existingIndex] = validated
  } else {
    courses.unshift(validated)
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(courses))
}

export function deleteCourse(id: string): void {
  if (!isBrowser()) return
  const courses = getAllCourses().filter((c) => c.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(courses))
}

export function clearAllCourses(): void {
  if (!isBrowser()) return
  localStorage.removeItem(STORAGE_KEY)
}
