"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  BookOpen,
  ChevronRight,
  GraduationCap,
  ListOrdered,
  Sparkles,
  Star,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Course, CourseLesson, CourseModule } from "@/types/course"
import { buildLessonSourceContent } from "@/services/course-learning-context"

export type CourseLearningTrigger = {
  subject: string
  topic: string
  sourceContent: string
}

interface CourseViewerProps {
  course: Course
  onClose: () => void
  onTriggerQuiz?: (payload: CourseLearningTrigger) => void
  onTriggerFlashcards?: (payload: CourseLearningTrigger) => void
  language?: "en" | "hi" | "te"
}

const complexityColors = {
  beginner: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  intermediate: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  advanced: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
}

export function CourseViewer({
  course,
  onClose,
  onTriggerQuiz,
  onTriggerFlashcards,
  language = "en",
}: CourseViewerProps) {
  const [activeModuleId, setActiveModuleId] = useState<string | null>(
    course.modules[0]?.id ?? null
  )
  const [activeLessonId, setActiveLessonId] = useState<string | null>(
    course.learningPath[0] ?? course.modules[0]?.lessons[0]?.id ?? null
  )
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set())

  const allLessons = course.modules.flatMap((m) => m.lessons)
  const activeLesson = allLessons.find((l) => l.id === activeLessonId) ?? null
  const activeModule = course.modules.find((m) => m.id === activeModuleId) ?? null

  const pathIndex = activeLessonId
    ? course.learningPath.indexOf(activeLessonId)
    : -1
  const progressPct = course.learningPath.length
    ? Math.round((completedLessons.size / course.learningPath.length) * 100)
    : 0

  const navigateToLesson = (lesson: CourseLesson, module: CourseModule) => {
    setActiveModuleId(module.id)
    setActiveLessonId(lesson.id)
  }

  const goToNextInPath = () => {
    if (pathIndex < 0 || pathIndex >= course.learningPath.length - 1) return
    const nextId = course.learningPath[pathIndex + 1]
    const nextLesson = allLessons.find((l) => l.id === nextId)
    const nextModule = course.modules.find((m) => m.lessons.some((l) => l.id === nextId))
    if (nextLesson && nextModule) navigateToLesson(nextLesson, nextModule)
  }

  const markComplete = () => {
    if (!activeLessonId) return
    setCompletedLessons((prev) => new Set([...prev, activeLessonId]))
    goToNextInPath()
  }

  const labels = {
    en: {
      learningPath: "Recommended Learning Path",
      essential: "Essential",
      prerequisites: "Prerequisites",
      keyConcepts: "Key Concepts",
      markComplete: "Mark Complete & Continue",
      modules: "Modules",
      next: "Next in Path",
      progress: "Course Progress",
    },
    hi: {
      learningPath: "अनुशंसित सीखने का मार्ग",
      essential: "आवश्यक",
      prerequisites: "पूर्वापेक्षाएँ",
      keyConcepts: "मुख्य अवधारणाएँ",
      markComplete: "पूर्ण करें और आगे बढ़ें",
      modules: "मॉड्यूल",
      next: "मार्ग में अगला",
      progress: "कोर्स प्रगति",
    },
    te: {
      learningPath: "సిఫార్సు చేసిన నేర్చుకునే మార్గం",
      essential: "అవసరమైన",
      prerequisites: "ముందస్తు అవసరాలు",
      keyConcepts: "ముఖ్య భావనలు",
      markComplete: "పూర్తి చేసి కొనసాగించండి",
      modules: "మాడ్యూల్స్",
      next: "మార్గంలో తదుపరి",
      progress: "కోర్స్ పురోగతి",
    },
  }

  const t = labels[language]

  return (
    <div className="flex flex-col h-full max-h-[85vh]">
      <div className="flex items-start justify-between gap-4 p-4 border-b border-border">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <GraduationCap className="text-primary shrink-0" size={20} />
            <h2 className="text-xl font-bold truncate">{course.title}</h2>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge variant="secondary">{course.subject}</Badge>
            <Badge variant="outline">{course.syllabus}</Badge>
            <Badge variant="outline">{course.modules.length} modules</Badge>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X size={18} />
        </Button>
      </div>

      <div className="px-4 py-2 border-b border-border">
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="text-muted-foreground">{t.progress}</span>
          <span className="font-medium">{progressPct}%</span>
        </div>
        <Progress value={progressPct} className="h-2" />
      </div>

      <div className="flex flex-1 min-h-0 overflow-hidden">
        <div className="w-64 shrink-0 border-r border-border flex flex-col">
          <div className="p-3 border-b border-border">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <ListOrdered size={16} className="text-primary" />
              {t.learningPath}
            </h3>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {course.learningPath.map((lessonId, idx) => {
                const lesson = allLessons.find((l) => l.id === lessonId)
                if (!lesson) return null
                const mod = course.modules.find((m) => m.lessons.some((l) => l.id === lessonId))
                const isActive = lessonId === activeLessonId
                const isComplete = completedLessons.has(lessonId)
                const isEssential = course.essentialTopics.includes(lessonId)

                return (
                  <button
                    key={lessonId}
                    onClick={() => mod && navigateToLesson(lesson, mod)}
                    className={`w-full text-left p-2 rounded-lg text-sm transition-colors ${
                      isActive
                        ? "bg-primary/10 text-primary font-medium"
                        : "hover:bg-accent/50 text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-5">{idx + 1}.</span>
                      <span className="flex-1 truncate">{lesson.title}</span>
                      {isComplete && <span className="text-emerald-500 text-xs">✓</span>}
                    </div>
                    {isEssential && (
                      <Badge className="mt-1 text-[10px] h-4 px-1" variant="secondary">
                        <Star size={8} className="mr-0.5" />
                        {t.essential}
                      </Badge>
                    )}
                  </button>
                )
              })}
            </div>
          </ScrollArea>

          <div className="p-3 border-t border-border">
            <h3 className="text-sm font-semibold mb-2">{t.modules}</h3>
            <div className="space-y-1">
              {course.modules.map((mod) => (
                <button
                  key={mod.id}
                  onClick={() => {
                    setActiveModuleId(mod.id)
                    if (mod.lessons[0]) setActiveLessonId(mod.lessons[0].id)
                  }}
                  className={`w-full text-left p-2 rounded-lg text-xs transition-colors ${
                    mod.id === activeModuleId
                      ? "bg-accent text-foreground"
                      : "hover:bg-accent/50 text-muted-foreground"
                  }`}
                >
                  <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] mr-1 ${complexityColors[mod.complexity]}`}>
                    {mod.complexity}
                  </span>
                  {mod.title}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <AnimatePresence mode="wait">
            {activeLesson && activeModule ? (
              <motion.div
                key={activeLesson.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex-1 overflow-y-auto p-6"
              >
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <BookOpen size={14} />
                  <span>{activeModule.title}</span>
                  <ChevronRight size={14} />
                  <span className="text-foreground">{activeLesson.title}</span>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge className={complexityColors[activeModule.complexity]}>
                    {activeModule.complexity}
                  </Badge>
                  {course.essentialTopics.includes(activeLesson.id) && (
                    <Badge variant="secondary">
                      <Sparkles size={12} className="mr-1" />
                      {t.essential}
                    </Badge>
                  )}
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">{activeLesson.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {activeLesson.summary}
                    </p>

                    {activeLesson.keyConcepts.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold mb-2">{t.keyConcepts}</h4>
                        <div className="flex flex-wrap gap-2">
                          {activeLesson.keyConcepts.map((concept) => (
                            <Badge key={concept} variant="outline">
                              {concept}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {(activeLesson.prerequisites?.length ?? 0) > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold mb-2">{t.prerequisites}</h4>
                        <div className="flex flex-wrap gap-2">
                          {activeLesson.prerequisites!.map((prereqId) => {
                            const prereq = allLessons.find((l) => l.id === prereqId)
                            return (
                              <Badge key={prereqId} variant="secondary">
                                {prereq?.title ?? prereqId}
                              </Badge>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div className="flex flex-wrap gap-3 mt-6">
                  <Button onClick={markComplete}>
                    {t.markComplete}
                  </Button>
                  {pathIndex < course.learningPath.length - 1 && (
                    <Button variant="outline" onClick={goToNextInPath}>
                      {t.next}
                      <ChevronRight size={16} className="ml-1" />
                    </Button>
                  )}
                  {onTriggerQuiz && (
                    <Button
                      variant="outline"
                      onClick={() =>
                        onTriggerQuiz({
                          subject: course.subject,
                          topic: activeLesson.title,
                          sourceContent: buildLessonSourceContent(activeLesson, course),
                        })
                      }
                    >
                      Quiz this topic
                    </Button>
                  )}
                  {onTriggerFlashcards && (
                    <Button
                      variant="outline"
                      onClick={() =>
                        onTriggerFlashcards({
                          subject: course.subject,
                          topic: activeLesson.title,
                          sourceContent: buildLessonSourceContent(activeLesson, course),
                        })
                      }
                    >
                      Flashcards
                    </Button>
                  )}
                </div>
              </motion.div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                Select a lesson to begin
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
