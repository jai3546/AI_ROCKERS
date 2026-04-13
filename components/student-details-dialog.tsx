"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { X, User, Mail, Phone, School, BookOpen, Calendar, Award, Clock, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface StudentDetailsDialogProps {
  student?: {
    id: string
    name: string
    class: string
    role?: string
    avatar?: string
    email?: string
    phone?: string
    joinDate?: string
    attendance?: number
    performance?: number
    subjects?: Array<{
      name: string
      progress: number
      grade?: string
    }>
    recentActivities?: Array<{
      type: string
      name: string
      date: string
      score?: number
      completed?: boolean
    }>
    isDemo?: boolean
  } | null
  onClose: () => void
  language?: "en" | "hi" | "te"
}

export function StudentDetailsDialog({
  student,
  onClose,
  language = "en"
}: StudentDetailsDialogProps) {
  const [activeTab, setActiveTab] = useState("overview")

  const translations = {
    studentDetails: {
      en: "Student Details",
      hi: "छात्र विवरण",
      te: "విద్యార్థి వివరాలు",
    },
    overview: {
      en: "Overview",
      hi: "अवलोकन",
      te: "అవలోకనం",
    },
    performance: {
      en: "Performance",
      hi: "प्रदर्शन",
      te: "పనితీరు",
    },
    activities: {
      en: "Activities",
      hi: "गतिविधियां",
      te: "కార్యకలాపాలు",
    },
    email: {
      en: "Email",
      hi: "ईमेल",
      te: "ఇమెయిల్",
    },
    phone: {
      en: "Phone",
      hi: "फोन",
      te: "ఫోన్",
    },
    class: {
      en: "Class",
      hi: "कक्षा",
      te: "తరగతి",
    },
    joinDate: {
      en: "Join Date",
      hi: "शामिल होने की तारीख",
      te: "చేరిన తేదీ",
    },
    attendance: {
      en: "Attendance",
      hi: "उपस्थिति",
      te: "హాజరు",
    },
    subjects: {
      en: "Subjects",
      hi: "विषय",
      te: "విషయాలు",
    },
    recentActivities: {
      en: "Recent Activities",
      hi: "हाल की गतिविधियां",
      te: "ఇటీవలి కార్యకలాపాలు",
    },
    quiz: {
      en: "Quiz",
      hi: "क्विज़",
      te: "క్విజ్",
    },
    flashcard: {
      en: "Flashcard",
      hi: "फ्लैशकार्ड",
      te: "ఫ్లాష్‌కార్డ్",
    },
    summary: {
      en: "Summary",
      hi: "सारांश",
      te: "సారాంశం",
    },
    completed: {
      en: "Completed",
      hi: "पूरा किया गया",
      te: "పూర్తయింది",
    },
    score: {
      en: "Score",
      hi: "स्कोर",
      te: "స్కోరు",
    },
    close: {
      en: "Close",
      hi: "बंद करें",
      te: "మూసివేయండి",
    },
    notAvailable: {
      en: "Not available",
      hi: "उपलब्ध नहीं",
      te: "అందుబాటులో లేదు",
    },
    excellent: {
      en: "Excellent",
      hi: "उत्कृष्ट",
      te: "అద్భుతం",
    },
    good: {
      en: "Good",
      hi: "अच्छा",
      te: "మంచిది",
    },
    average: {
      en: "Average",
      hi: "औसत",
      te: "సగటు",
    },
    needsImprovement: {
      en: "Needs Improvement",
      hi: "सुधार की आवश्यकता है",
      te: "మెరుగుదల అవసరం",
    },
  }

  // If no student data is provided, show a message
  if (!student) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>{translations.studentDetails[language]}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{translations.notAvailable[language]}</p>
          </CardContent>
          <CardFooter>
            <Button onClick={onClose}>{translations.close[language]}</Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  // Get performance label
  const getPerformanceLabel = (performance: number) => {
    if (performance >= 90) return translations.excellent[language]
    if (performance >= 75) return translations.good[language]
    if (performance >= 60) return translations.average[language]
    return translations.needsImprovement[language]
  }

  // Get performance color
  const getPerformanceColor = (performance: number) => {
    if (performance >= 90) return "bg-green-500"
    if (performance >= 75) return "bg-blue-500"
    if (performance >= 60) return "bg-amber-500"
    return "bg-red-500"
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="w-full max-w-2xl"
      >
        <Card className="border border-border dark:border-border shadow-lg">
          <CardHeader className="pb-3 relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4"
              onClick={onClose}
            >
              <X size={18} />
            </Button>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                {student.avatar ? (
                  <div className="text-2xl">{student.avatar}</div>
                ) : (
                  <User size={32} className="text-primary" />
                )}
              </div>
              <div>
                <CardTitle className="text-xl">{student.name || 'Student'}</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline">{student.class || 'Class'}</Badge>
                  {student.isDemo && <Badge variant="secondary">Demo Account</Badge>}
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="overview">{translations.overview[language]}</TabsTrigger>
                <TabsTrigger value="performance">{translations.performance[language]}</TabsTrigger>
                <TabsTrigger value="activities">{translations.activities[language]}</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {student.email && (
                    <div className="flex items-center gap-2">
                      <Mail size={16} className="text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">{translations.email[language]}</p>
                        <p className="text-sm">{student.email}</p>
                      </div>
                    </div>
                  )}

                  {student.phone && (
                    <div className="flex items-center gap-2">
                      <Phone size={16} className="text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">{translations.phone[language]}</p>
                        <p className="text-sm">{student.phone}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <School size={16} className="text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">{translations.class[language]}</p>
                      <p className="text-sm">{student.class}</p>
                    </div>
                  </div>

                  {student.joinDate && (
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">{translations.joinDate[language]}</p>
                        <p className="text-sm">{student.joinDate}</p>
                      </div>
                    </div>
                  )}
                </div>

                {student.attendance !== undefined && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm">{translations.attendance[language]}</p>
                      <p className="text-sm font-medium">{student.attendance}%</p>
                    </div>
                    <Progress value={student.attendance} className="h-2" />
                  </div>
                )}

                {student.performance !== undefined && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm">{translations.performance[language]}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{student.performance}%</p>
                        <Badge variant="outline">{getPerformanceLabel(student.performance)}</Badge>
                      </div>
                    </div>
                    <Progress
                      value={student.performance}
                      className="h-2"
                      indicatorClassName={getPerformanceColor(student.performance)}
                    />
                  </div>
                )}
              </TabsContent>

              {/* Performance Tab */}
              <TabsContent value="performance" className="space-y-4">
                {student.subjects && student.subjects.length > 0 ? (
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">{translations.subjects[language]}</h3>
                    {student.subjects.map((subject, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm">{subject.name}</p>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">{subject.progress}%</p>
                            {subject.grade && <Badge variant="outline">{subject.grade}</Badge>}
                          </div>
                        </div>
                        <Progress
                          value={subject.progress}
                          className="h-2"
                          indicatorClassName={getPerformanceColor(subject.progress)}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">{translations.notAvailable[language]}</p>
                )}
              </TabsContent>

              {/* Activities Tab */}
              <TabsContent value="activities">
                {student.recentActivities && student.recentActivities.length > 0 ? (
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">{translations.recentActivities[language]}</h3>
                    <div className="space-y-3">
                      {student.recentActivities.map((activity, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                              {activity.type === "quiz" && <BookOpen size={16} className="text-primary" />}
                              {activity.type === "flashcard" && <FileText size={16} className="text-primary" />}
                              {activity.type === "summary" && <BookOpen size={16} className="text-primary" />}
                            </div>
                            <div>
                              <p className="text-sm font-medium">{activity.name}</p>
                              <p className="text-xs text-muted-foreground">{activity.date}</p>
                            </div>
                          </div>
                          <div>
                            {activity.score !== undefined ? (
                              <Badge variant={activity.score >= 80 ? "default" : "outline"}>
                                {activity.score}%
                              </Badge>
                            ) : activity.completed !== undefined ? (
                              <Badge variant={activity.completed ? "default" : "outline"}>
                                {activity.completed ? translations.completed[language] : "In Progress"}
                              </Badge>
                            ) : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">{translations.notAvailable[language]}</p>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>

          <CardFooter className="flex justify-end">
            <Button onClick={onClose}>{translations.close[language]}</Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}
