import { describe, it, expect } from "vitest"
import { buildLessonSourceContent } from "@/services/course-learning-context"
import type { Course, CourseLesson } from "@/types/course"

const baseLesson: CourseLesson = {
  id: "lesson-1",
  title: "Cell Structure",
  order: 1,
  summary: "Cells are the basic unit of life.",
  keyConcepts: ["nucleus", "membrane"],
  sourceChunkIds: ["chunk-0"],
}

const baseCourse: Course = {
  id: "course-1",
  title: "Biology Notes",
  description: "From uploaded notes",
  subject: "Science",
  syllabus: "General",
  sourceType: "paste",
  modules: [],
  learningPath: [],
  essentialTopics: [],
  createdAt: new Date().toISOString(),
  sourceText: "Full pasted biology notes about cells and organelles.",
  sourceChunks: {
    "chunk-0": "The nucleus stores DNA. The cell membrane controls entry and exit.",
  },
}

describe("buildLessonSourceContent", () => {
  it("includes lesson summary and matching source chunks", () => {
    const content = buildLessonSourceContent(baseLesson, baseCourse)
    expect(content).toContain("Cell Structure")
    expect(content).toContain("nucleus stores DNA")
    expect(content).toContain("Key concepts: nucleus, membrane")
  })

  it("falls back to full sourceText when no chunk ids", () => {
    const lesson = { ...baseLesson, sourceChunkIds: undefined }
    const content = buildLessonSourceContent(lesson, baseCourse)
    expect(content).toContain("Full pasted biology notes")
  })

  it("works for URL-sourced courses using stored sourceText", () => {
    const urlCourse: Course = {
      ...baseCourse,
      sourceType: "url",
      sourceText: "Article content fetched from https://example.com about photosynthesis.",
      sourceChunks: undefined,
    }
    const content = buildLessonSourceContent({ ...baseLesson, sourceChunkIds: [] }, urlCourse)
    expect(content).toContain("Article content fetched")
  })
})
