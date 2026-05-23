"use client"

import { useState, useEffect } from "react"
import { Calendar, ChevronLeft, ChevronRight, Download, Filter } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getStudentProgress } from "@/services/school-portal-service"

interface WeeklyProgressProps {
  language?: "en" | "hi" | "te"
}

export function WeeklyProgress({ language = "en" }: WeeklyProgressProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "quizzes" | "flashcards" | "engagement">("overview")
  const [selectedClass, setSelectedClass] = useState<string>("all")
  const [selectedWeek, setSelectedWeek] = useState<number>(0) // 0 = current week, -1 = last week, etc.
  const [isLoading, setIsLoading] = useState(true)
  const [progressData, setProgressData] = useState<any>(null)

  const translations = {
    weeklyProgress: {
      en: "Weekly Progress",
      hi: "साप्ताहिक प्रगति",
      te: "వారపు పురోగతి",
    },
    overview: {
      en: "Overview",
      hi: "अवलोकन",
      te: "అవలోకనం",
    },
    quizzes: {
      en: "Quizzes",
      hi: "क्विज़",
      te: "క్విజ్‌లు",
    },
    flashcards: {
      en: "Flashcards",
      hi: "फ्लैशकार्ड",
      te: "ఫ్లాష్‌కార్డులు",
    },
    engagement: {
      en: "Engagement",
      hi: "सहभागिता",
      te: "నిమగ్నత",
    },
    allClasses: {
      en: "All Classes",
      hi: "सभी कक्षाएं",
      te: "అన్ని తరగతులు",
    },
    currentWeek: {
      en: "Current Week",
      hi: "वर्तमान सप्ताह",
      te: "ప్రస్తుత వారం",
    },
    lastWeek: {
      en: "Last Week",
      hi: "पिछला सप्ताह",
      te: "గత వారం",
    },
    twoWeeksAgo: {
      en: "Two Weeks Ago",
      hi: "दो सप्ताह पहले",
      te: "రెండు వారాల క్రితం",
    },
    export: {
      en: "Export Data",
      hi: "डेटा निर्यात करें",
      te: "డేటాను ఎగుమతి చేయండి",
    },
    activeStudents: {
      en: "Active Students",
      hi: "सक्रिय छात्र",
      te: "యాక్టివ్ విద్యార్థులు",
    },
    quizzesCompleted: {
      en: "Quizzes Completed",
      hi: "पूर्ण किए गए क्विज़",
      te: "పూర్తి చేసిన క్విజ్‌లు",
    },
    averageScore: {
      en: "Average Score",
      hi: "औसत स्कोर",
      te: "సగటు స్కోరు",
    },
    flashcardsReviewed: {
      en: "Flashcards Reviewed",
      hi: "समीक्षा किए गए फ्लैशकार्ड",
      te: "సమీక్షించిన ఫ్లాష్‌కార్డులు",
    },
    totalXPEarned: {
      en: "Total XP Earned",
      hi: "अर्जित कुल XP",
      te: "సంపాదించిన మొత్తం XP",
    },
    day: {
      en: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      hi: ["सोम", "मंगल", "बुध", "गुरु", "शुक्र", "शनि", "रवि"],
      te: ["సోమ", "మంగళ", "బుధ", "గురు", "శుక్ర", "శని", "ఆది"],
    },
  }

  // Mock class data
  const classes = [
    { id: "all", name: translations.allClasses[language] },
    { id: "6a", name: "Class 6A" },
    { id: "6b", name: "Class 6B" },
    { id: "7a", name: "Class 7A" },
    { id: "7b", name: "Class 7B" },
    { id: "8a", name: "Class 8A" },
    { id: "8b", name: "Class 8B" },
    { id: "9a", name: "Class 9A" },
    { id: "9b", name: "Class 9B" },
    { id: "10a", name: "Class 10A" },
    { id: "10b", name: "Class 10B" },
  ]

  // Get week label based on selected week
  const getWeekLabel = () => {
    switch (selectedWeek) {
      case 0:
        return translations.currentWeek[language]
      case -1:
        return translations.lastWeek[language]
      case -2:
        return translations.twoWeeksAgo[language]
      default:
        return translations.currentWeek[language]
    }
  }

  // Load progress data
  useEffect(() => {
    const loadProgressData = async () => {
      setIsLoading(true)
      try {
        // In a real app, we would pass the class ID and week to get specific data
        const data = await getStudentProgress(selectedClass)

        // Generate weekly data based on the selected week
        // This is mock data - in a real app, this would come from the API
        const weeklyData = {
          overview: {
            activeStudents: selectedWeek === 0 ? 186 : selectedWeek === -1 ? 172 : 165,
            quizzesCompleted: selectedWeek === 0 ? 78 : selectedWeek === -1 ? 65 : 52,
            averageScore: selectedWeek === 0 ? 76 : selectedWeek === -1 ? 72 : 70,
            flashcardsReviewed: selectedWeek === 0 ? 520 : selectedWeek === -1 ? 480 : 410,
            totalXPEarned: selectedWeek === 0 ? 4250 : selectedWeek === -1 ? 3800 : 3200,
            dailyActivity: selectedWeek === 0
              ? [65, 48, 72, 85, 60, 55, 78]
              : selectedWeek === -1
                ? [58, 62, 45, 70, 52, 48, 65]
                : [50, 55, 60, 48, 52, 45, 60]
          },
          quizzes: {
            subjects: {
              'Science': { completed: selectedWeek === 0 ? 28 : selectedWeek === -1 ? 25 : 20, averageScore: selectedWeek === 0 ? 82 : selectedWeek === -1 ? 78 : 75 },
              'Math': { completed: selectedWeek === 0 ? 22 : selectedWeek === -1 ? 18 : 15, averageScore: selectedWeek === 0 ? 75 : selectedWeek === -1 ? 72 : 70 },
              'English': { completed: selectedWeek === 0 ? 15 : selectedWeek === -1 ? 12 : 10, averageScore: selectedWeek === 0 ? 80 : selectedWeek === -1 ? 76 : 72 },
              'Social Studies': { completed: selectedWeek === 0 ? 13 : selectedWeek === -1 ? 10 : 7, averageScore: selectedWeek === 0 ? 70 : selectedWeek === -1 ? 68 : 65 }
            },
            dailyCompleted: selectedWeek === 0
              ? [12, 8, 15, 18, 10, 5, 10]
              : selectedWeek === -1
                ? [10, 12, 8, 15, 9, 4, 7]
                : [8, 10, 12, 6, 8, 3, 5]
          },
          flashcards: {
            subjects: {
              'Science': { decksCompleted: selectedWeek === 0 ? 18 : selectedWeek === -1 ? 15 : 12, cardsReviewed: selectedWeek === 0 ? 180 : selectedWeek === -1 ? 150 : 120 },
              'Math': { decksCompleted: selectedWeek === 0 ? 15 : selectedWeek === -1 ? 12 : 10, cardsReviewed: selectedWeek === 0 ? 150 : selectedWeek === -1 ? 120 : 100 },
              'English': { decksCompleted: selectedWeek === 0 ? 12 : selectedWeek === -1 ? 10 : 8, cardsReviewed: selectedWeek === 0 ? 120 : selectedWeek === -1 ? 100 : 80 },
              'Social Studies': { decksCompleted: selectedWeek === 0 ? 7 : selectedWeek === -1 ? 5 : 3, cardsReviewed: selectedWeek === 0 ? 70 : selectedWeek === -1 ? 50 : 30 }
            },
            dailyReviewed: selectedWeek === 0
              ? [85, 65, 95, 110, 75, 40, 50]
              : selectedWeek === -1
                ? [75, 85, 60, 95, 70, 35, 60]
                : [65, 70, 80, 55, 60, 30, 50]
          },
          engagement: {
            timeSpent: {
              average: selectedWeek === 0 ? 42 : selectedWeek === -1 ? 38 : 35, // minutes per day
              total: selectedWeek === 0 ? 7812 : selectedWeek === -1 ? 6536 : 5775, // minutes
            },
            dailyEngagement: selectedWeek === 0
              ? [75, 55, 85, 95, 70, 50, 65]
              : selectedWeek === -1
                ? [65, 75, 50, 85, 60, 45, 55]
                : [55, 60, 70, 45, 50, 40, 45]
          }
        }

        setProgressData(weeklyData)
      } catch (error) {
        console.error("Error loading progress data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadProgressData()
  }, [selectedClass, selectedWeek, language])

  // Navigate to previous week
  const goToPreviousWeek = () => {
    setSelectedWeek(prev => prev - 1)
  }

  // Navigate to next week
  const goToNextWeek = () => {
    if (selectedWeek < 0) {
      setSelectedWeek(prev => prev + 1)
    }
  }

  // Export report as CSV
  const exportReport = () => {
    if (!progressData) return

    // Create CSV content based on active tab
    let csvContent = "data:text/csv;charset=utf-8,"

    // Add header row
    if (activeTab === "overview") {
      csvContent += "Metric,Value\n"
      csvContent += `Active Students,${progressData.overview.activeStudents}\n`
      csvContent += `Quizzes Completed,${progressData.overview.quizzesCompleted}\n`
      csvContent += `Average Score,${progressData.overview.averageScore}%\n`
      csvContent += `Flashcards Reviewed,${progressData.overview.flashcardsReviewed}\n`
      csvContent += `Total XP Earned,${progressData.overview.totalXPEarned}\n\n`

      // Add daily activity
      csvContent += "Day,Activity Level\n"
      const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
      progressData.overview.dailyActivity.forEach((value, index) => {
        csvContent += `${days[index]},${value}\n`
      })
    } else if (activeTab === "quizzes") {
      csvContent += "Subject,Quizzes Completed,Average Score\n"
      Object.entries(progressData.quizzes.subjects).forEach(([subject, data]: [string, any]) => {
        csvContent += `${subject},${data.completed},${data.averageScore}%\n`
      })

      csvContent += "\nDay,Quizzes Completed\n"
      const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
      progressData.quizzes.dailyCompleted.forEach((value, index) => {
        csvContent += `${days[index]},${value}\n`
      })
    } else if (activeTab === "flashcards") {
      csvContent += "Subject,Decks Completed,Cards Reviewed\n"
      Object.entries(progressData.flashcards.subjects).forEach(([subject, data]: [string, any]) => {
        csvContent += `${subject},${data.decksCompleted},${data.cardsReviewed}\n`
      })

      csvContent += "\nDay,Cards Reviewed\n"
      const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
      progressData.flashcards.dailyReviewed.forEach((value, index) => {
        csvContent += `${days[index]},${value}\n`
      })
    } else if (activeTab === "engagement") {
      csvContent += "Metric,Value\n"
      csvContent += `Average Daily Time,${progressData.engagement.timeSpent.average} minutes\n`
      csvContent += `Total Time Spent,${Math.floor(progressData.engagement.timeSpent.total / 60)} hours ${progressData.engagement.timeSpent.total % 60} minutes\n\n`

      csvContent += "Day,Engagement Level\n"
      const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
      progressData.engagement.dailyEngagement.forEach((value, index) => {
        csvContent += `${days[index]},${value}\n`
      })
    }

    // Create filename
    const weekLabel = getWeekLabel().replace(/\s/g, '_')
    const classLabel = selectedClass === "all" ? "All_Classes" : selectedClass.toUpperCase()
    const tabLabel = activeTab.charAt(0).toUpperCase() + activeTab.slice(1)
    const filename = `${weekLabel}_${classLabel}_${tabLabel}_Report.csv`

    // Create download link
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", filename)
    document.body.appendChild(link)

    // Trigger download
    link.click()

    // Clean up
    document.body.removeChild(link)
  }

  return (
    <Card className="w-full">
      <CardHeader className="bg-highlight/10 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-highlight">
            <Calendar size={18} />
            {translations.weeklyProgress[language]}
          </CardTitle>

          <div className="flex items-center gap-2">
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-[180px] h-8">
                <SelectValue placeholder={translations.allClasses[language]} />
              </SelectTrigger>
              <SelectContent>
                {classes.map(cls => (
                  <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <CardDescription className="flex items-center justify-between">
          <span>
            {getWeekLabel()}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={goToPreviousWeek}
              disabled={selectedWeek <= -2}
            >
              <ChevronLeft size={14} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={goToNextWeek}
              disabled={selectedWeek >= 0}
            >
              <ChevronRight size={14} />
            </Button>
          </div>
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-4">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="overview">{translations.overview[language]}</TabsTrigger>
            <TabsTrigger value="quizzes">{translations.quizzes[language]}</TabsTrigger>
            <TabsTrigger value="flashcards">{translations.flashcards[language]}</TabsTrigger>
            <TabsTrigger value="engagement">{translations.engagement[language]}</TabsTrigger>
          </TabsList>

          {isLoading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin h-8 w-8 border-4 border-highlight rounded-full border-t-transparent"></div>
            </div>
          ) : progressData ? (
            <>
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-foreground/70">{translations.activeStudents[language]}</p>
                          <p className="text-3xl font-bold">{progressData.overview.activeStudents}</p>
                          <p className="text-xs text-foreground/50">
                            {Math.round(progressData.overview.activeStudents / 248 * 100)}% of total
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-foreground/70">{translations.quizzesCompleted[language]}</p>
                          <p className="text-3xl font-bold">{progressData.overview.quizzesCompleted}</p>
                          <p className="text-xs text-foreground/50">
                            {translations.averageScore[language]}: {progressData.overview.averageScore}%
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-foreground/70">{translations.totalXPEarned[language]}</p>
                          <p className="text-3xl font-bold">{progressData.overview.totalXPEarned}</p>
                          <p className="text-xs text-foreground/50">
                            {translations.flashcardsReviewed[language]}: {progressData.overview.flashcardsReviewed}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Daily Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 bg-muted/30 rounded-lg flex items-end justify-between gap-2 p-4">
                      {progressData.overview.dailyActivity.map((value: number, index: number) => (
                        <div key={index} className="relative flex flex-col items-center">
                          <div
                            className="w-10 bg-highlight/80 rounded-t-sm"
                            style={{ height: `${value}%` }}
                          ></div>
                          <span className="text-xs mt-2">{translations.day[language][index]}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="quizzes" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Subject Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {Object.entries(progressData.quizzes.subjects).map(([subject, data]: [string, any]) => (
                          <div key={subject} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
                                <span className="text-sm font-bold">{subject.substring(0, 2)}</span>
                              </div>
                              <div>
                                <p className="font-medium">{subject}</p>
                                <p className="text-xs text-foreground/70">
                                  {data.completed} quizzes completed
                                </p>
                              </div>
                            </div>
                            <div className="text-sm font-medium">
                              Avg: <span className="text-secondary">{data.averageScore}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Daily Quizzes Completed</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64 bg-muted/30 rounded-lg flex items-end justify-between gap-2 p-4">
                        {progressData.quizzes.dailyCompleted.map((value: number, index: number) => (
                          <div key={index} className="relative flex flex-col items-center">
                            <div
                              className="w-10 bg-secondary/80 rounded-t-sm"
                              style={{ height: `${value * 5}%` }}
                            ></div>
                            <span className="text-xs mt-2">{translations.day[language][index]}</span>
                            <span className="text-xs">{value}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="flashcards" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Subject Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {Object.entries(progressData.flashcards.subjects).map(([subject, data]: [string, any]) => (
                          <div key={subject} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                                <span className="text-sm font-bold">{subject.substring(0, 2)}</span>
                              </div>
                              <div>
                                <p className="font-medium">{subject}</p>
                                <p className="text-xs text-foreground/70">
                                  {data.decksCompleted} decks completed
                                </p>
                              </div>
                            </div>
                            <div className="text-sm font-medium">
                              Cards: <span className="text-primary">{data.cardsReviewed}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Daily Flashcards Reviewed</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64 bg-muted/30 rounded-lg flex items-end justify-between gap-2 p-4">
                        {progressData.flashcards.dailyReviewed.map((value: number, index: number) => (
                          <div key={index} className="relative flex flex-col items-center">
                            <div
                              className="w-10 bg-primary/80 rounded-t-sm"
                              style={{ height: `${value * 0.9}%` }}
                            ></div>
                            <span className="text-xs mt-2">{translations.day[language][index]}</span>
                            <span className="text-xs">{value}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="engagement" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Time Spent</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-foreground/70">Average Daily Time</p>
                            <p className="text-3xl font-bold">{progressData.engagement.timeSpent.average} min</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-foreground/70">Total Time Spent</p>
                            <p className="text-3xl font-bold">
                              {Math.floor(progressData.engagement.timeSpent.total / 60)} hrs {progressData.engagement.timeSpent.total % 60} min
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Daily Engagement</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64 bg-muted/30 rounded-lg flex items-end justify-between gap-2 p-4">
                        {progressData.engagement.dailyEngagement.map((value: number, index: number) => (
                          <div key={index} className="relative flex flex-col items-center">
                            <div
                              className="w-10 bg-accent/80 rounded-t-sm"
                              style={{ height: `${value}%` }}
                            ></div>
                            <span className="text-xs mt-2">{translations.day[language][index]}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </>
          ) : (
            <div className="h-64 flex items-center justify-center">
              <p>No data available</p>
            </div>
          )}
        </Tabs>
      </CardContent>

      <CardFooter className="flex justify-end">
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={exportReport}
          disabled={isLoading || !progressData}
        >
          <Download size={16} />
          {translations.export[language]}
        </Button>
      </CardFooter>
    </Card>
  )
}
