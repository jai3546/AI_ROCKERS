"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  BookOpen,
  GraduationCap,
  Plus,
  Trash2,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CourseCreator } from "./course-creator"
import { CourseViewer, type CourseLearningTrigger } from "./course-viewer"
import { getAllCourses, deleteCourse } from "@/services/course-storage"
import type { Course, Syllabus } from "@/types/course"

interface CourseHubProps {
  onClose: () => void
  syllabus?: Syllabus
  language?: "en" | "hi" | "te"
  onTriggerQuiz?: (payload: CourseLearningTrigger) => void
  onTriggerFlashcards?: (payload: CourseLearningTrigger) => void
}

type View = "library" | "create" | "view"

export function CourseHub({
  onClose,
  syllabus = "General",
  language = "en",
  onTriggerQuiz,
  onTriggerFlashcards,
}: CourseHubProps) {
  const [view, setView] = useState<View>("library")
  const [courses, setCourses] = useState<Course[]>([])
  const [activeCourse, setActiveCourse] = useState<Course | null>(null)

  const refreshCourses = () => {
    setCourses(getAllCourses())
  }

  useEffect(() => {
    refreshCourses()
  }, [])

  const handleCourseCreated = (course: Course) => {
    refreshCourses()
    setActiveCourse(course)
    setView("view")
  }

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    deleteCourse(id)
    refreshCourses()
    if (activeCourse?.id === id) {
      setActiveCourse(null)
      setView("library")
    }
  }

  const labels = {
    en: {
      title: "AI Course Builder",
      subtitle: "Turn any content into a structured, guided learning course",
      createNew: "Create New Course",
      myCourses: "My Courses",
      noCourses: "No courses yet. Create your first course from any notes, PDF, or link.",
      modules: "modules",
      lessons: "lessons",
      back: "Back to Library",
    },
    hi: {
      title: "AI कोर्स बिल्डर",
      subtitle: "किसी भी सामग्री को संरचित, मार्गदर्शित सीखने के कोर्स में बदलें",
      createNew: "नया कोर्स बनाएं",
      myCourses: "मेरे कोर्स",
      noCourses: "अभी कोई कोर्स नहीं। किसी भी नोट, PDF या लिंक से अपना पहला कोर्स बनाएं।",
      modules: "मॉड्यूल",
      lessons: "पाठ",
      back: "लाइब्रेरी पर वापस",
    },
    te: {
      title: "AI కోర్స్ బిల్డర్",
      subtitle: "ఏ కంటెంట్‌నైనా నిర్మిత, మార్గదర్శక అభ్యాస కోర్స్‌గా మార్చండి",
      createNew: "కొత్త కోర్స్ సృష్టించండి",
      myCourses: "నా కోర్సులు",
      noCourses: "ఇంకా కోర్సులు లేవు. ఏదైనా నోట్స్, PDF లేదా లింక్ నుండి మొదటి కోర్స్ సృష్టించండి.",
      modules: "మాడ్యూల్స్",
      lessons: "పాఠాలు",
      back: "లైబ్రరీకి తిరిగి",
    },
  }

  const t = labels[language]

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-card rounded-xl shadow-lg border border-border w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col"
        >
          {view === "library" && (
            <>
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <GraduationCap className="text-primary" size={22} />
                    {t.title}
                  </h2>
                  <p className="text-sm text-muted-foreground">{t.subtitle}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X size={18} />
                </Button>
              </div>

              <div className="p-4 flex-1 overflow-y-auto">
                <Button className="w-full mb-4" onClick={() => setView("create")}>
                  <Plus size={18} className="mr-2" />
                  {t.createNew}
                </Button>

                <h3 className="text-sm font-semibold mb-3 text-muted-foreground">{t.myCourses}</h3>

                {courses.length === 0 ? (
                  <Card className="border-dashed">
                    <CardContent className="p-8 text-center text-muted-foreground text-sm">
                      <BookOpen className="mx-auto mb-3 opacity-50" size={40} />
                      {t.noCourses}
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-3">
                    {courses.map((course) => {
                      const lessonCount = course.modules.reduce(
                        (sum, m) => sum + m.lessons.length,
                        0
                      )
                      return (
                        <Card
                          key={course.id}
                          className="cursor-pointer hover:bg-accent/20 transition-colors"
                          onClick={() => {
                            setActiveCourse(course)
                            setView("view")
                          }}
                        >
                          <CardContent className="p-4 flex items-center justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold truncate">{course.title}</h4>
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {course.description}
                              </p>
                              <div className="flex gap-2 mt-2">
                                <Badge variant="secondary">{course.subject}</Badge>
                                <Badge variant="outline">
                                  {course.modules.length} {t.modules}
                                </Badge>
                                <Badge variant="outline">
                                  {lessonCount} {t.lessons}
                                </Badge>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => handleDelete(course.id, e)}
                              className="text-muted-foreground hover:text-destructive shrink-0"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </div>
            </>
          )}

          {view === "create" && (
            <CourseCreator
              onClose={() => setView("library")}
              onCourseCreated={handleCourseCreated}
              syllabus={syllabus}
              language={language}
            />
          )}

          {view === "view" && activeCourse && (
            <div className="flex flex-col h-full max-h-[90vh]">
              <div className="px-4 pt-2">
                <Button variant="ghost" size="sm" onClick={() => setView("library")}>
                  ← {t.back}
                </Button>
              </div>
              <CourseViewer
                course={activeCourse}
                onClose={() => setView("library")}
                onTriggerQuiz={onTriggerQuiz}
                onTriggerFlashcards={onTriggerFlashcards}
                language={language}
              />
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
