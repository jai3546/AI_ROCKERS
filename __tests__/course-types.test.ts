import { describe, it, expect } from "vitest"
import { CourseSchema, CourseModuleSchema } from "@/types/course"

describe("CourseSchema", () => {
  it("validates a complete course object", () => {
    const course = {
      id: "course-1",
      title: "Intro to Science",
      description: "A beginner science course",
      subject: "Science",
      syllabus: "General" as const,
      sourceType: "paste" as const,
      modules: [
        {
          id: "mod-1",
          title: "Module 1",
          order: 1,
          complexity: "beginner" as const,
          lessons: [
            {
              id: "lesson-1",
              title: "What is Science?",
              order: 1,
              summary: "Science is the study of the natural world.",
              keyConcepts: ["observation", "hypothesis"],
              isEssential: true,
            },
          ],
        },
      ],
      learningPath: ["lesson-1"],
      essentialTopics: ["lesson-1"],
      createdAt: new Date().toISOString(),
    }

    const result = CourseSchema.safeParse(course)
    expect(result.success).toBe(true)
  })

  it("rejects invalid complexity", () => {
    const module = {
      id: "mod-1",
      title: "Module 1",
      order: 1,
      complexity: "expert",
      lessons: [],
    }
    const result = CourseModuleSchema.safeParse(module)
    expect(result.success).toBe(false)
  })
})
