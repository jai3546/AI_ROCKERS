import type { Course, CourseLesson } from "@/types/course"

const MAX_SOURCE_CHARS = 8000

/** Build quiz/flashcard context from a lesson plus the course's original uploaded material. */
export function buildLessonSourceContent(lesson: CourseLesson, course: Course): string {
  const parts = [`Topic: ${lesson.title}`, lesson.summary]

  if (lesson.keyConcepts.length > 0) {
    parts.push(`Key concepts: ${lesson.keyConcepts.join(", ")}`)
  }

  const chunkTexts = (lesson.sourceChunkIds ?? [])
    .map((id) => course.sourceChunks?.[id])
    .filter((text): text is string => Boolean(text?.trim()))

  if (chunkTexts.length > 0) {
    parts.push(`Source material:\n${chunkTexts.join("\n\n").slice(0, MAX_SOURCE_CHARS)}`)
  } else if (course.sourceText?.trim()) {
    parts.push(`Source material:\n${course.sourceText.trim().slice(0, MAX_SOURCE_CHARS)}`)
  }

  return parts.join("\n\n")
}
