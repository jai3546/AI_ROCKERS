"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { X, School, Mail, Phone, MapPin, Users, BookOpen, Calendar, Award, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface SchoolDetailsDialogProps {
  school?: {
    id: string
    name: string
    type: string
    address?: string
    email?: string
    phone?: string
    website?: string
    studentCount?: number
    teacherCount?: number
    classCount?: number
    foundedYear?: string
    performance?: number
    subjects?: Array<{
      name: string
      performance: number
      teacherCount?: number
    }>
    recentActivities?: Array<{
      type: string
      name: string
      date: string
      studentCount?: number
      completed?: boolean
    }>
  } | null
  onClose: () => void
  language?: "en" | "hi" | "te"
}

export function SchoolDetailsDialog({
  school,
  onClose,
  language = "en"
}: SchoolDetailsDialogProps) {
  const [activeTab, setActiveTab] = useState("overview")

  const translations = {
    schoolDetails: {
      en: "School Details",
      hi: "स्कूल विवरण",
      te: "పాఠశాల వివరాలు",
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
    address: {
      en: "Address",
      hi: "पता",
      te: "చిరునామా",
    },
    website: {
      en: "Website",
      hi: "वेबसाइट",
      te: "వెబ్‌సైట్",
    },
    students: {
      en: "Students",
      hi: "छात्र",
      te: "విద్యార్థులు",
    },
    teachers: {
      en: "Teachers",
      hi: "शिक्षक",
      te: "ఉపాధ్యాయులు",
    },
    classes: {
      en: "Classes",
      hi: "कक्षाएं",
      te: "తరగతులు",
    },
    foundedYear: {
      en: "Founded Year",
      hi: "स्थापना वर्ष",
      te: "స్థాపించబడిన సంవత్సరం",
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
    event: {
      en: "Event",
      hi: "कार्यक्रम",
      te: "ఈవెంట్",
    },
    workshop: {
      en: "Workshop",
      hi: "कार्यशाला",
      te: "వర్క్‌షాప్",
    },
    completed: {
      en: "Completed",
      hi: "पूरा किया गया",
      te: "పూర్తయింది",
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

  // If no school data is provided, show a message
  if (!school) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>{translations.schoolDetails[language]}</CardTitle>
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
              <div className="w-16 h-16 rounded-full bg-highlight/20 flex items-center justify-center">
                <School size={32} className="text-highlight" />
              </div>
              <div>
                <CardTitle className="text-xl">{school.name}</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline">{school.type}</Badge>
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
                  {school.email && (
                    <div className="flex items-center gap-2">
                      <Mail size={16} className="text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">{translations.email[language]}</p>
                        <p className="text-sm">{school.email}</p>
                      </div>
                    </div>
                  )}

                  {school.phone && (
                    <div className="flex items-center gap-2">
                      <Phone size={16} className="text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">{translations.phone[language]}</p>
                        <p className="text-sm">{school.phone}</p>
                      </div>
                    </div>
                  )}

                  {school.address && (
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">{translations.address[language]}</p>
                        <p className="text-sm">{school.address}</p>
                      </div>
                    </div>
                  )}

                  {school.website && (
                    <div className="flex items-center gap-2">
                      <Globe size={16} className="text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">{translations.website[language]}</p>
                        <p className="text-sm">{school.website}</p>
                      </div>
                    </div>
                  )}

                  {school.foundedYear && (
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">{translations.foundedYear[language]}</p>
                        <p className="text-sm">{school.foundedYear}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4 mt-4">
                  {school.studentCount !== undefined && (
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Users size={16} className="text-primary" />
                        <p className="text-sm font-medium">{translations.students[language]}</p>
                      </div>
                      <p className="text-xl font-bold">{school.studentCount}</p>
                    </div>
                  )}

                  {school.teacherCount !== undefined && (
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Users size={16} className="text-secondary" />
                        <p className="text-sm font-medium">{translations.teachers[language]}</p>
                      </div>
                      <p className="text-xl font-bold">{school.teacherCount}</p>
                    </div>
                  )}

                  {school.classCount !== undefined && (
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <BookOpen size={16} className="text-highlight" />
                        <p className="text-sm font-medium">{translations.classes[language]}</p>
                      </div>
                      <p className="text-xl font-bold">{school.classCount}</p>
                    </div>
                  )}
                </div>

                {school.performance !== undefined && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm">{translations.performance[language]}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{school.performance}%</p>
                        <Badge variant="outline">{getPerformanceLabel(school.performance)}</Badge>
                      </div>
                    </div>
                    <Progress
                      value={school.performance}
                      className="h-2"
                      indicatorClassName={getPerformanceColor(school.performance)}
                    />
                  </div>
                )}
              </TabsContent>

              {/* Performance Tab */}
              <TabsContent value="performance" className="space-y-4">
                {school.subjects && school.subjects.length > 0 ? (
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">{translations.subjects[language]}</h3>
                    {school.subjects.map((subject, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <p className="text-sm">{subject.name}</p>
                            {subject.teacherCount && (
                              <Badge variant="outline" className="text-xs">
                                {subject.teacherCount} {translations.teachers[language]}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">{subject.performance}%</p>
                          </div>
                        </div>
                        <Progress
                          value={subject.performance}
                          className="h-2"
                          indicatorClassName={getPerformanceColor(subject.performance)}
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
                {school.recentActivities && school.recentActivities.length > 0 ? (
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">{translations.recentActivities[language]}</h3>
                    <div className="space-y-3">
                      {school.recentActivities.map((activity, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                              {activity.type === "quiz" && <BookOpen size={16} className="text-primary" />}
                              {activity.type === "event" && <Calendar size={16} className="text-primary" />}
                              {activity.type === "workshop" && <Users size={16} className="text-primary" />}
                            </div>
                            <div>
                              <p className="text-sm font-medium">{activity.name}</p>
                              <p className="text-xs text-muted-foreground">{activity.date}</p>
                            </div>
                          </div>
                          <div>
                            {activity.studentCount !== undefined ? (
                              <Badge variant="outline">
                                {activity.studentCount} {translations.students[language]}
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
