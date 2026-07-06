"use client"

import { useCallback, useEffect, useRef, useState } from "react"

/**
 * The lifecycle states a study session can be in.
 *
 * - `idle`      → timer has not started yet (or was just reset)
 * - `running`   → timer is actively counting down
 * - `paused`    → timer was running and is temporarily stopped
 * - `completed` → the countdown reached zero
 */
export type StudyTimerStatus = "idle" | "running" | "paused" | "completed"

/**
 * Options accepted by {@link useStudyTimer}.
 */
export interface UseStudyTimerOptions {
  /**
   * Length of a single study session, in minutes.
   * Defaults to 25 minutes (a classic Pomodoro-style session).
   */
  sessionLengthMinutes?: number
  /**
   * Called exactly once when the countdown reaches zero.
   * Use this to show a "take a break" message, award XP, etc.
   */
  onSessionComplete?: () => void
}

/**
 * Value returned by {@link useStudyTimer}.
 */
export interface UseStudyTimerResult {
  /** Total seconds the student has actively studied in the current session. */
  elapsedSeconds: number
  /** Seconds remaining until the session ends. */
  secondsLeft: number
  /** Elapsed time formatted as `MM:SS`, e.g. `"04:32"`. */
  elapsedLabel: string
  /** Time remaining formatted as `MM:SS`, e.g. `"20:15"`. */
  remainingLabel: string
  /** Current lifecycle state of the timer. */
  status: StudyTimerStatus
  /** Convenience flag, equivalent to `status === "running"`. */
  isRunning: boolean
  /** Convenience flag, equivalent to `status === "completed"`. */
  isCompleted: boolean
  /** Starts the timer, or resumes it after a pause. Does nothing once completed. */
  start: () => void
  /** Pauses a running timer without losing progress. */
  pause: () => void
  /** Stops the timer and resets elapsed/remaining time back to the full session length. */
  reset: () => void
  /** Updates how long a session should last (in minutes) and resets the timer. */
  setSessionLengthMinutes: (minutes: number) => void
}

/**
 * Formats a duration given in seconds as a zero-padded `MM:SS` string.
 *
 * @param totalSeconds - Duration in seconds. Negative values are clamped to 0.
 * @returns A string like `"05:09"`.
 */
function formatSeconds(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds))
  const minutes = Math.floor(safeSeconds / 60)
  const seconds = safeSeconds % 60
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
}

/**
 * `useStudyTimer` tracks how long a student has been studying during a
 * focused session, similar to a Pomodoro timer.
 *
 * It counts down from a configurable session length, keeps track of the
 * total elapsed time, and calls `onSessionComplete` once when the
 * countdown reaches zero so the UI can suggest a break, show a reward
 * popup, or log the completed session.
 *
 * The hook cleans up its internal interval automatically on unmount or
 * when the timer is paused/reset, so components using it don't need to
 * manage `setInterval`/`clearInterval` themselves.
 *
 * @param options - Optional session length and completion callback.
 * @returns Timer state (elapsed/remaining time, status) and controls
 * (`start`, `pause`, `reset`, `setSessionLengthMinutes`).
 *
 * @example
 * ```tsx
 * function StudySessionCard() {
 *   const timer = useStudyTimer({
 *     sessionLengthMinutes: 25,
 *     onSessionComplete: () => setShowBreakSuggestion(true),
 *   })
 *
 *   return (
 *     <div>
 *       <p className="text-3xl font-bold">{timer.remainingLabel}</p>
 *       <Button onClick={timer.start} disabled={timer.isRunning}>
 *         Start
 *       </Button>
 *       <Button onClick={timer.pause} disabled={!timer.isRunning}>
 *         Pause
 *       </Button>
 *       <Button onClick={timer.reset}>Reset</Button>
 *     </div>
 *   )
 * }
 * ```
 */
export function useStudyTimer(options: UseStudyTimerOptions = {}): UseStudyTimerResult {
  const { sessionLengthMinutes = 25, onSessionComplete } = options

  const [sessionMinutes, setSessionMinutes] = useState(sessionLengthMinutes)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [secondsLeft, setSecondsLeft] = useState(sessionLengthMinutes * 60)
  const [status, setStatus] = useState<StudyTimerStatus>("idle")

  // Store the latest callback in a ref so the ticking effect below can
  // always call the newest version without needing to restart the
  // interval every time the caller passes a new function reference.
  const onSessionCompleteRef = useRef(onSessionComplete)
  useEffect(() => {
    onSessionCompleteRef.current = onSessionComplete
  }, [onSessionComplete])

  // Only ticks while the timer is running; automatically cleaned up when
  // the status changes (pause/reset) or the component unmounts.
  useEffect(() => {
    if (status !== "running") {
      return
    }

    const intervalId = setInterval(() => {
      setSecondsLeft((previousSecondsLeft) => {
        if (previousSecondsLeft <= 1) {
          setStatus("completed")
          onSessionCompleteRef.current?.()
          return 0
        }
        return previousSecondsLeft - 1
      })
      setElapsedSeconds((previousElapsed) => previousElapsed + 1)
    }, 1000)

    return () => clearInterval(intervalId)
  }, [status])

  const start = useCallback(() => {
    setStatus((current) => (current === "completed" ? current : "running"))
  }, [])

  const pause = useCallback(() => {
    setStatus((current) => (current === "running" ? "paused" : current))
  }, [])

  const reset = useCallback(() => {
    setStatus("idle")
    setElapsedSeconds(0)
    setSecondsLeft(sessionMinutes * 60)
  }, [sessionMinutes])

  const setSessionLengthMinutes = useCallback((minutes: number) => {
    const safeMinutes = Math.max(1, Math.floor(minutes))
    setSessionMinutes(safeMinutes)
    setStatus("idle")
    setElapsedSeconds(0)
    setSecondsLeft(safeMinutes * 60)
  }, [])

  return {
    elapsedSeconds,
    secondsLeft,
    elapsedLabel: formatSeconds(elapsedSeconds),
    remainingLabel: formatSeconds(secondsLeft),
    status,
    isRunning: status === "running",
    isCompleted: status === "completed",
    start,
    pause,
    reset,
    setSessionLengthMinutes,
  }
}
