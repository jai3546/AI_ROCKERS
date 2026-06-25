import type { Course, CourseLesson, CourseModule } from "@/types/course"

function normalizeTitle(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, " ").trim()
}

function titlesAreSimilar(a: string, b: string): boolean {
  const na = normalizeTitle(a)
  const nb = normalizeTitle(b)
  if (na === nb) return true
  if (na.includes(nb) || nb.includes(na)) return true
  const wordsA = new Set(na.split(" "))
  const wordsB = new Set(nb.split(" "))
  const intersection = [...wordsA].filter((w) => wordsB.has(w) && w.length > 3)
  const union = new Set([...wordsA, ...wordsB])
  return union.size > 0 && intersection.length / union.size > 0.6
}

export function dedupeLessons(lessons: CourseLesson[]): CourseLesson[] {
  const result: CourseLesson[] = []
  for (const lesson of lessons) {
    const duplicate = result.find((l) => titlesAreSimilar(l.title, lesson.title))
    if (duplicate) {
      duplicate.keyConcepts = [...new Set([...duplicate.keyConcepts, ...lesson.keyConcepts])]
      duplicate.summary = duplicate.summary.length >= lesson.summary.length
        ? duplicate.summary
        : lesson.summary
      duplicate.sourceChunkIds = [
        ...new Set([...(duplicate.sourceChunkIds || []), ...(lesson.sourceChunkIds || [])]),
      ]
      if (lesson.isEssential) duplicate.isEssential = true
    } else {
      result.push({ ...lesson })
    }
  }
  return result
}

export function detectCycle(ids: string[], prerequisites: Map<string, string[]>): string[] {
  const visited = new Set<string>()
  const stack = new Set<string>()
  const cycles: string[] = []

  function dfs(id: string): boolean {
    if (stack.has(id)) {
      cycles.push(id)
      return true
    }
    if (visited.has(id)) return false
    visited.add(id)
    stack.add(id)
    const deps = prerequisites.get(id) || []
    for (const dep of deps) {
      if (ids.includes(dep) && dfs(dep)) return true
    }
    stack.delete(id)
    return false
  }

  for (const id of ids) dfs(id)
  return cycles
}

export function topologicalSort(ids: string[], prerequisites: Map<string, string[]>): string[] {
  const inDegree = new Map<string, number>()
  for (const id of ids) inDegree.set(id, 0)
  for (const id of ids) {
    for (const dep of prerequisites.get(id) || []) {
      if (ids.includes(dep)) {
        inDegree.set(id, (inDegree.get(id) || 0) + 1)
      }
    }
  }

  const queue = ids.filter((id) => (inDegree.get(id) || 0) === 0)
  const sorted: string[] = []

  while (queue.length > 0) {
    const current = queue.shift()!
    sorted.push(current)
    for (const id of ids) {
      const deps = prerequisites.get(id) || []
      if (deps.includes(current)) {
        inDegree.set(id, (inDegree.get(id) || 0) - 1)
        if (inDegree.get(id) === 0) queue.push(id)
      }
    }
  }

  const remaining = ids.filter((id) => !sorted.includes(id))
  return [...sorted, ...remaining]
}

export function buildLearningPath(modules: CourseModule[]): string[] {
  const allLessons: CourseLesson[] = []
  for (const mod of modules) {
    allLessons.push(...mod.lessons)
  }

  const lessonIds = allLessons.map((l) => l.id)
  const prereqMap = new Map<string, string[]>()
  for (const lesson of allLessons) {
    prereqMap.set(lesson.id, lesson.prerequisites || [])
  }

  const cycles = detectCycle(lessonIds, prereqMap)
  if (cycles.length > 0) {
    for (const id of cycles) {
      prereqMap.set(id, [])
    }
  }

  const complexityOrder = { beginner: 0, intermediate: 1, advanced: 2 }
  const lessonComplexity = new Map<string, number>()
  for (const mod of modules) {
    for (const lesson of mod.lessons) {
      lessonComplexity.set(lesson.id, complexityOrder[mod.complexity])
    }
  }

  const sorted = topologicalSort(lessonIds, prereqMap)
  const sorted = topologicalSort(lessonIds, prereqMap)
  const sortedIndex = new Map(sorted.map((id, idx) => [id, idx]))
  const sortedWithStableOrder = [...sorted].sort((a, b) => {
    const prereqsA = (prereqMap.get(a) || []).length
    const prereqsB = (prereqMap.get(b) || []).length
    if (prereqsA !== prereqsB) return prereqsA - prereqsB
    const compA = lessonComplexity.get(a) ?? 0
    const compB = lessonComplexity.get(b) ?? 0
    if (compA !== compB) return compA - compB
    const lessonA = allLessons.find((l) => l.id === a)
    const lessonB = allLessons.find((l) => l.id === b)
    if ((lessonA?.order ?? 0) !== (lessonB?.order ?? 0)) return (lessonA?.order ?? 0) - (lessonB?.order ?? 0)
    return (sortedIndex.get(a) ?? 0) - (sortedIndex.get(b) ?? 0)
  })
  return sortedWithStableOrder
  return sortedWithStableOrder
}

export function findEssentialTopics(modules: CourseModule[]): string[] {
  const essentials: string[] = []
  for (const mod of modules) {
    for (const lesson of mod.lessons) {
      if (lesson.isEssential || mod.complexity === "beginner") {
        essentials.push(lesson.id)
      }
    }
  }
  return [...new Set(essentials)]
}

export function validateModuleCoherence(modules: CourseModule[]): CourseModule[] {
  return modules.map((mod) => {
    const lessons = dedupeLessons(mod.lessons)
    const bounded = lessons.slice(0, 8)
    return {
      ...mod,
      lessons: bounded.map((lesson, idx) => ({ ...lesson, order: idx + 1 })),
    }
  }).filter((mod) => mod.lessons.length >= 1)
}

export function validateAndOrderCourse(course: Course): Course {
  const modules = validateModuleCoherence(
    [...course.modules].sort((a, b) => a.order - b.order)
  )

  const learningPath = buildLearningPath(modules)
  const essentialTopics = findEssentialTopics(modules)

  const foundationalFirst = [...learningPath].sort((a, b) => {
    const aEssential = essentialTopics.includes(a) ? 0 : 1
    const bEssential = essentialTopics.includes(b) ? 0 : 1
    return aEssential - bEssential
  })

  return {
    ...course,
    modules,
    learningPath: foundationalFirst,
    essentialTopics,
  }
}

export function validatePrerequisiteOrder(course: Course): boolean {
  const position = new Map(course.learningPath.map((id, i) => [id, i]))
  for (const mod of course.modules) {
    for (const lesson of mod.lessons) {
      const lessonPos = position.get(lesson.id)
      if (lessonPos === undefined) continue
      for (const prereq of lesson.prerequisites || []) {
        const prereqPos = position.get(prereq)
        if (prereqPos !== undefined && prereqPos > lessonPos) {
          return false
        }
      }
    }
  }
  return true
}
