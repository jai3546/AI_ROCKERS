export interface DailyProgressStats {
  studyTimeMinutes: number
  quizzesCompleted: number
  flashcardsReviewed: number
  xpEarned: number
}

const DEFAULT_STATS: DailyProgressStats = {
  studyTimeMinutes: 0,
  quizzesCompleted: 0,
  flashcardsReviewed: 0,
  xpEarned: 0,
}

function getTodayDateKey(): string {
  return new Date().toISOString().slice(0, 10)
}

function getStorageKey(studentId: string): string {
  return `vidyai_daily_progress_${studentId}_${getTodayDateKey()}`
}

function readStats(studentId: string): DailyProgressStats {
  if (typeof window === "undefined") return { ...DEFAULT_STATS }

  try {
    const stored = localStorage.getItem(getStorageKey(studentId))
    if (!stored) return { ...DEFAULT_STATS }
    return { ...DEFAULT_STATS, ...JSON.parse(stored) }
  } catch {
    return { ...DEFAULT_STATS }
  }
}

function writeStats(studentId: string, stats: DailyProgressStats): DailyProgressStats {
  if (typeof window === "undefined") return stats

  localStorage.setItem(getStorageKey(studentId), JSON.stringify(stats))
  return stats
}

function updateStats(
  studentId: string,
  updates: Partial<DailyProgressStats>
): DailyProgressStats {
  const current = readStats(studentId)
  const next: DailyProgressStats = {
    studyTimeMinutes: current.studyTimeMinutes + (updates.studyTimeMinutes ?? 0),
    quizzesCompleted: current.quizzesCompleted + (updates.quizzesCompleted ?? 0),
    flashcardsReviewed: current.flashcardsReviewed + (updates.flashcardsReviewed ?? 0),
    xpEarned: current.xpEarned + (updates.xpEarned ?? 0),
  }
  return writeStats(studentId, next)
}

export function getTodayProgress(studentId: string): DailyProgressStats {
  return readStats(studentId)
}

export function recordStudyTime(studentId: string, minutes: number): DailyProgressStats {
  return updateStats(studentId, { studyTimeMinutes: minutes })
}

export function recordQuizCompleted(studentId: string, xpEarned: number): DailyProgressStats {
  return updateStats(studentId, { quizzesCompleted: 1, xpEarned })
}

export function recordFlashcardsReviewed(
  studentId: string,
  count: number,
  xpEarned: number
): DailyProgressStats {
  return updateStats(studentId, { flashcardsReviewed: count, xpEarned })
}

export function recordXpEarned(studentId: string, xp: number): DailyProgressStats {
  return updateStats(studentId, { xpEarned: xp })
}
