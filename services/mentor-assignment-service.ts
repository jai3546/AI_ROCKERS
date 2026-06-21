export interface AssignedStudent {
  id: string
  name: string
  class: string
  subjectNeed?: string
  performanceLevel?: "high" | "medium" | "low"
  assignedAt: number
  lastActiveAt?: number
}

const ASSIGNMENTS_KEY = "mentor-assignments"

const DEFAULT_ASSIGNMENTS: Record<string, AssignedStudent[]> = {
  M001: [
    { id: "S005", name: "Arjun Kumar", class: "10B", subjectNeed: "math", performanceLevel: "high", assignedAt: Date.now() - 86400000 * 5, lastActiveAt: Date.now() - 3600000 },
    { id: "S001", name: "Rahul Singh", class: "8A", subjectNeed: "science", performanceLevel: "high", assignedAt: Date.now() - 86400000 * 3, lastActiveAt: Date.now() - 7200000 },
  ],
  M002: [
    { id: "S002", name: "Ananya Patel", class: "7B", subjectNeed: "english", performanceLevel: "medium", assignedAt: Date.now() - 86400000 * 4, lastActiveAt: Date.now() - 1800000 },
    { id: "S004", name: "Priya Sharma", class: "6A", subjectNeed: "science", performanceLevel: "low", assignedAt: Date.now() - 86400000 * 2, lastActiveAt: Date.now() - 86400000 },
  ],
  "demo-m-1": [
    { id: "S005", name: "Arjun Kumar", class: "10B", subjectNeed: "math", performanceLevel: "high", assignedAt: Date.now() - 86400000 * 5, lastActiveAt: Date.now() - 3600000 },
  ],
  "demo-m-2": [
    { id: "S002", name: "Ananya Patel", class: "7B", subjectNeed: "english", performanceLevel: "medium", assignedAt: Date.now() - 86400000 * 4, lastActiveAt: Date.now() - 1800000 },
  ],
}

function readAssignments(): Record<string, AssignedStudent[]> {
  if (typeof window === "undefined") return {}
  try {
    const raw = localStorage.getItem(ASSIGNMENTS_KEY)
    return raw ? (JSON.parse(raw) as Record<string, AssignedStudent[]>) : {}
  } catch {
    return {}
  }
}

function writeAssignments(assignments: Record<string, AssignedStudent[]>): void {
  if (typeof window === "undefined") return
  localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(assignments))
}

export function assignStudentToMentor(
  mentorId: string,
  student: Omit<AssignedStudent, "assignedAt"> & { assignedAt?: number }
): void {
  const assignments = readAssignments()
  const list = assignments[mentorId] ?? []
  const exists = list.some((entry) => entry.id === student.id)

  if (!exists) {
    assignments[mentorId] = [
      ...list,
      { ...student, assignedAt: student.assignedAt ?? Date.now() },
    ]
    writeAssignments(assignments)
  }
}

export function getMentorStudents(mentorId: string): AssignedStudent[] {
  const assignments = readAssignments()
  const stored = assignments[mentorId]
  if (stored?.length) return stored
  return DEFAULT_ASSIGNMENTS[mentorId] ?? []
}

export function getMentorStats(mentorId: string) {
  const students = getMentorStudents(mentorId)
  const now = Date.now()
  const weekAgo = now - 7 * 86400000
  const activeThisWeek = students.filter(
    (s) => s.lastActiveAt && s.lastActiveAt >= weekAgo
  ).length

  return {
    totalStudents: students.length,
    activeThisWeek,
    needsAttention: students.filter((s) => s.performanceLevel === "low").length,
  }
}
