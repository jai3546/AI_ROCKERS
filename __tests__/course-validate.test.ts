import { describe, it, expect } from "vitest"
import {
  dedupeLessons,
  buildLearningPath,
  findEssentialTopics,
  validateAndOrderCourse,
  validatePrerequisiteOrder,
  topologicalSort,
} from "@/services/course-generation/validate"
import type { Course, CourseLesson, CourseModule } from "@/types/course"

const sampleLessons: CourseLesson[] = [
  {
    id: "lesson-1",
    title: "Introduction to Variables",
    order: 1,
    summary: "Variables store data.",
    keyConcepts: ["variable", "assignment"],
    isEssential: true,
  },
  {
    id: "lesson-2",
    title: "Introduction to variables",
    order: 2,
    summary: "A longer summary about variables and how they work in programs.",
    keyConcepts: ["declaration", "type"],
    prerequisites: ["lesson-1"],
  },
  {
    id: "lesson-3",
    title: "Functions",
    order: 3,
    summary: "Functions group reusable code.",
    keyConcepts: ["function", "return"],
    prerequisites: ["lesson-2"],
  },
]

const sampleModules: CourseModule[] = [
  {
    id: "mod-1",
    title: "Basics",
    order: 1,
    complexity: "beginner",
    lessons: sampleLessons,
  },
]

function makeCourse(modules: CourseModule[]): Course {
  return {
    id: "test-course",
    title: "Test Course",
    description: "A test course",
    subject: "Computer Science",
    syllabus: "General",
    sourceType: "paste",
    modules,
    learningPath: [],
    essentialTopics: [],
    createdAt: new Date().toISOString(),
  }
}

describe("dedupeLessons", () => {
  it("merges similar lesson titles", () => {
    const result = dedupeLessons(sampleLessons)
    expect(result).toHaveLength(2)
    expect(result[0].keyConcepts).toContain("variable")
    expect(result[0].keyConcepts).toContain("declaration")
  })
})

describe("topologicalSort", () => {
  it("orders lessons respecting prerequisites", () => {
    const ids = ["lesson-1", "lesson-2", "lesson-3"]
    const prereqs = new Map([
      ["lesson-2", ["lesson-1"]],
      ["lesson-3", ["lesson-2"]],
    ])
    const sorted = topologicalSort(ids, prereqs)
    expect(sorted.indexOf("lesson-1")).toBeLessThan(sorted.indexOf("lesson-2"))
    expect(sorted.indexOf("lesson-2")).toBeLessThan(sorted.indexOf("lesson-3"))
  })

  it("handles lessons with no prerequisites", () => {
    const ids = ["a", "b", "c"]
    const prereqs = new Map<string, string[]>()
    const sorted = topologicalSort(ids, prereqs)
    expect(sorted).toHaveLength(3)
  })
})

describe("buildLearningPath", () => {
  it("generates ordered learning path from modules", () => {
    const path = buildLearningPath(sampleModules)
    expect(path).toContain("lesson-1")
    expect(path.indexOf("lesson-1")).toBeLessThan(path.indexOf("lesson-3"))
  })
})

describe("findEssentialTopics", () => {
  it("identifies essential and beginner lessons", () => {
    const essentials = findEssentialTopics(sampleModules)
    expect(essentials).toContain("lesson-1")
  })
})

describe("validateAndOrderCourse", () => {
  it("produces valid learning path and essential topics", () => {
    const course = validateAndOrderCourse(makeCourse(sampleModules))
    expect(course.learningPath.length).toBeGreaterThan(0)
    expect(course.essentialTopics.length).toBeGreaterThan(0)
    expect(course.modules[0].lessons.length).toBeLessThanOrEqual(8)
  })

  it("deduplicates lessons within modules", () => {
    const course = validateAndOrderCourse(makeCourse(sampleModules))
    const lessonTitles = course.modules[0].lessons.map((l) => l.title.toLowerCase())
    const uniqueTitles = new Set(lessonTitles)
    expect(uniqueTitles.size).toBe(lessonTitles.length)
  })
})

describe("validatePrerequisiteOrder", () => {
  it("returns true when prerequisites come before dependents", () => {
    const course = validateAndOrderCourse(makeCourse(sampleModules))
    expect(validatePrerequisiteOrder(course)).toBe(true)
  })

  it("returns false when prerequisites are out of order", () => {
    const course = makeCourse(sampleModules)
    course.learningPath = ["lesson-3", "lesson-1", "lesson-2"]
    expect(validatePrerequisiteOrder(course)).toBe(false)
  })
})
