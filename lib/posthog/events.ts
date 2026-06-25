export const POSTHOG_EVENTS = {
  // Navigation
  PAGE_VIEW: "$pageview",

  // Auth
  USER_LOGGED_IN: "user_logged_in",
  LOGIN_ERROR: "login_error",

  // Landing
  LANDING_PAGE_VIEWED: "landing_page_viewed",
  PORTAL_SELECTED: "portal_selected",
  LANGUAGE_CHANGED: "language_changed",

  // Learning — quiz
  QUIZ_STARTED: "quiz_started",
  QUIZ_COMPLETED: "quiz_completed",
  AI_QUIZ_GENERATED: "ai_quiz_generated",

  // Learning — flashcard
  FLASHCARD_DECK_STARTED: "flashcard_deck_started",
  FLASHCARD_DECK_COMPLETED: "flashcard_deck_completed",
  AI_FLASHCARD_GENERATED: "ai_flashcard_generated",

  // Emotion tracking
  EMOTION_DETECTED: "emotion_detected",
  WEBCAM_PERMISSION_GRANTED: "webcam_permission_granted",
  WEBCAM_PERMISSION_DENIED: "webcam_permission_denied",

  // Admin
  STUDENT_PROGRESS_VIEWED: "student_progress_viewed",
  EMOTIONAL_ALERT_TRIGGERED: "emotional_alert_triggered",
  REPORT_EXPORTED: "report_exported",
} as const
