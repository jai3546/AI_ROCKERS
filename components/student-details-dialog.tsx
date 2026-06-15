"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { X, User, Mail, Phone, School, BookOpen, Calendar, Award, Clock, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface StudentDetailsDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onClose?: () => void
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
  initialProfile?: any
  onProfileUpdate?: (profile: any) => void
  language?: "en" | "hi" | "te"
}

export function StudentDetailsDialog({
  open = false,
  onOpenChange,
  onClose,
  student: propStudent,
  initialProfile,
  onProfileUpdate,
  language = "en"
}: StudentDetailsDialogProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [localStudent, setLocalStudent] = useState<any>(null)

  // Load student data from localStorage if not provided as prop
  useEffect(() => {
    if (propStudent) {
      setLocalStudent(propStudent)
    } else if (open) {
      // Try to load from localStorage
      try {
        const userData = localStorage.getItem("demoUser")
        if (userData) {
          const parsedUser = JSON.parse(userData)
          const studentData = {
            id: parsedUser.id || '1',
            name: parsedUser.name || 'Riya',
            class: parsedUser.class || '12',
            role: 'student',
            avatar: parsedUser.avatar || '👩‍🎓',
            email: `${(parsedUser.name || 'student').toLowerCase().replace(' ', '.')}@example.com`,
            phone: '+91 98765 43210',
            joinDate: new Date().toLocaleDateString(),
            attendance: 85,
            performance: 75,
            subjects: [
              { name: 'Mathematics', progress: 80, grade: 'A' },
              { name: 'Science', progress: 75, grade: 'B+' },
              { name: 'English', progress: 70, grade: 'B' }
            ],
            recentActivities: [
              { type: 'quiz', name: 'Photosynthesis Quiz', date: new Date().toLocaleDateString(), score: 85, completed: true }
            ],
            isDemo: parsedUser.isDemo || false
          }
          setLocalStudent(studentData)
        } else {
          // Create default student
          const defaultStudent = {
            id: 'default-1',
            name: 'Riya',
            class: '12',
            role: 'student',
            avatar: '👩‍🎓',
            email: 'riya@example.com',
            phone: '+91 98765 43210',
            joinDate: new Date().toLocaleDateString(),
            attendance: 85,
            performance: 75,
            subjects: [
              { name: 'Mathematics', progress: 80, grade: 'A' },
              { name: 'Science', progress: 75, grade: 'B+' },
              { name: 'English', progress: 70, grade: 'B' }
            ],
            recentActivities: [
              { type: 'quiz', name: 'Daily Challenge', date: new Date().toLocaleDateString(), score: 75, completed: true }
            ],
            isDemo: true
          }
          setLocalStudent(defaultStudent)
        }
      } catch (error) {
        console.error("Error loading student data:", error)
        // Set fallback student data
        setLocalStudent({
          id: 'fallback-1',
          name: 'Student',
          class: '12',
          role: 'student',
          avatar: '👩‍🎓',
          email: 'student@example.com',
          phone: '+91 98765 43210',
          joinDate: new Date().toLocaleDateString(),
          attendance: 80,
          performance: 70,
          subjects: [],
          recentActivities: [],
          isDemo: true
        })
      }
    }
  }, [propStudent, open])

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

  const handleClose = () => {
    if (onClose) {
      onClose()
    }
    if (onOpenChange) {
      onOpenChange(false)
    }
  }

  // If dialog is not open, don't render
  if (!open) {
    return null
  }

  // Get the student data to display (use localStudent or propStudent)
  const student = propStudent || localStudent

  // If still no student data, show loading/error state
  if (!student) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>{translations.studentDetails[language]}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
            <p className="text-center text-muted-foreground">Loading student data...</p>
          </CardContent>
          <CardFooter>
            <Button onClick={handleClose} className="w-full">{translations.close[language]}</Button>
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
              onClick={handleClose}
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
                  <Badge variant="outline">{student.class || 'Class 12'}</Badge>
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
                  <div className="flex items-center gap-2">
                    <Mail size={16} className="text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">{translations.email[language]}</p>
                      <p className="text-sm">{student.email || 'student@example.com'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Phone size={16} className="text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">{translations.phone[language]}</p>
                      <p className="text-sm">{student.phone || '+91 98765 43210'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <School size={16} className="text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">{translations.class[language]}</p>
                      <p className="text-sm">{student.class || 'Class 12'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">{translations.joinDate[language]}</p>
                      <p className="text-sm">{student.joinDate || new Date().toLocaleDateString()}</p>
                    </div>
                  </div>
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
                    {student.subjects.map((subject: any, index: number) => (
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
                  <p className="text-sm text-muted-foreground">No subject data available</p>
                )}
              </TabsContent>

              {/* Activities Tab */}
              <TabsContent value="activities">
                {student.recentActivities && student.recentActivities.length > 0 ? (
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">{translations.recentActivities[language]}</h3>
                    <div className="space-y-3">
                      {student.recentActivities.map((activity: any, index: number) => (
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
                  <p className="text-sm text-muted-foreground">No recent activities available</p>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>

          <CardFooter className="flex justify-end">
            <Button onClick={handleClose}>{translations.close[language]}</Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}