"use client"

import { Activity } from "lucide-react"
import {
  getLearnerStatusKey,
  getLearnerStatusLabel,
  shouldShowLearnerStatus,
  type LearnerStatusInput,
  type LearnerStatusLanguage,
} from "@/services/learner-status-service"

interface LearnerStatusBadgeProps {
  status?: LearnerStatusInput
  language?: LearnerStatusLanguage
  trackingActive?: boolean
  className?: string
  showIcon?: boolean
}

const STATUS_STYLE: Record<
  NonNullable<ReturnType<typeof getLearnerStatusKey>>,
  string
> = {
  needsBreak: "bg-amber-500/15 text-amber-800 dark:text-amber-200",
  focusModerate: "bg-blue-500/15 text-blue-800 dark:text-blue-200",
  focusHigh: "bg-green-500/15 text-green-800 dark:text-green-200",
  focusTracking: "bg-primary/20 text-primary",
  learningSupport: "bg-violet-500/15 text-violet-800 dark:text-violet-200",
}

export function LearnerStatusBadge({
  status,
  language = "en",
  trackingActive = true,
  className = "",
  showIcon = true,
}: LearnerStatusBadgeProps) {
  if (!shouldShowLearnerStatus(status, trackingActive)) return null

  const key = getLearnerStatusKey(status)!
  const label = getLearnerStatusLabel(status, language)!

  return (
    <div
      className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${STATUS_STYLE[key]} ${className}`}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      {showIcon && <Activity size={11} aria-hidden="true" />}
      <span>{label}</span>
    </div>
  )
}
