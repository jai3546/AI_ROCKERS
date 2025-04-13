"use client"

import { useState } from "react"
import { 
  AlertTriangle, 
  BarChart3, 
  BookOpen, 
  Calendar, 
  Clock, 
  FileText, 
  Loader2, 
  MessageSquare, 
  X 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface StudentDetailsDialogProps {
  open: boolean
  onClose: () => void
  studentId?: string
  studentName?: string
  studentClass?: string
  type: "emotional" | "quiz"
  language?: "en" | "hi" | "te"
}

export function StudentDetailsDialog({
  open,
  onClose,
  studentId = "s001",
  studentName = "Rahul Singh",
  studentClass = "8A",
  type,
  language = "en"
}: StudentDetailsDialogProps) {
  const [activeTab, setActiveTab] = useState<string>("overview")
  const [isLoading, setIsLoading] = useState(false)

  const translations = {
    studentDetails: {
      en: "Student Details",
      hi: "छात्र विवरण",
      te: "విద్యార్థి వివరాలు",
    },
    emotionalHealth: {
      en: "Emotional Health",
      hi: "भावनात्मक स्वास्थ्य",
      te: "భావోద్వేగ ఆరోగ్యం",
    },
    quizScores: {
      en: "Quiz Scores",
      hi: "क्विज़ स्कोर",
      te: "క్విజ్ స్కోర్లు",
    },
    overview: {
      en: "Overview",
      hi: "अवलोकन",
      te: "అవలోకనం",
    },
    history: {
      en: "History",
      hi: "इतिहास",
      te: "చరిత్ర",
    },
    recommendations: {
      en: "Recommendations",
      hi: "सिफारिशें",
      te: "సిఫార్సులు",
    },
    close: {
      en: "Close",
      hi: "बंद करें",
      te: "మూసివేయండి",
    },
    loading: {
      en: "Loading data...",
      hi: "डेटा लोड हो रहा है...",
      te: "డేటా లోడ్ అవుతోంది...",
    },
    today: {
      en: "Today",
      hi: "आज",
      te: "ఈరోజు",
    },
    yesterday: {
      en: "Yesterday",
      hi: "कल",
      te: "నిన్న",
    },
    daysAgo: {
      en: "days ago",
      hi: "दिन पहले",
      te: "రోజుల క్రితం",
    },
    attention: {
      en: "Attention",
      hi: "ध्यान",
      te: "శ్రద్ధ",
    },
    engagement: {
      en: "Engagement",
      hi: "सहभागिता",
      te: "నిమగ్నత",
    },
    fatigue: {
      en: "Fatigue",
      hi: "थकान",
      te: "అలసట",
    },
    confusion: {
      en: "Confusion",
      hi: "भ्रम",
      te: "గందరగోళం",
    },
    focus: {
      en: "Focus",
      hi: "फोकस",
      te: "దృష్టి",
    },
    quizResults: {
      en: "Quiz Results",
      hi: "क्विज़ परिणाम",
      te: "క్విజ్ ఫలితాలు",
    },
    subject: {
      en: "Subject",
      hi: "विषय",
      te: "విషయం",
    },
    score: {
      en: "Score",
      hi: "स्कोर",
      te: "స్కోరు",
    },
    date: {
      en: "Date",
      hi: "तारीख",
      te: "తేదీ",
    },
    time: {
      en: "Time",
      hi: "समय",
      te: "సమయం",
    },
    duration: {
      en: "Duration",
      hi: "अवधि",
      te: "వ్యవధి",
    },
    questions: {
      en: "Questions",
      hi: "प्रश्न",
      te: "ప్రశ్నలు",
    },
    correct: {
      en: "Correct",
      hi: "सही",
      te: "సరైన",
    },
    incorrect: {
      en: "Incorrect",
      hi: "गलत",
      te: "తప్పు",
    },
    minutes: {
      en: "minutes",
      hi: "मिनट",
      te: "నిమిషాలు",
    },
    recommendedAction: {
      en: "Recommended Action",
      hi: "अनुशंसित कार्रवाई",
      te: "సిఫార్సు చేయబడిన చర్య",
    },
  }

  // Mock emotional health data
  const emotionalHealthData = {
    overview: {
      attention: 65,
      engagement: 72,
      fatigue: 45,
      confusion: 30,
      focus: 68,
    },
    history: [
      {
        date: translations.today[language],
        emotions: {
          attention: 65,
          engagement: 72,
          fatigue: 45,
          confusion: 30,
          focus: 68,
        },
        notes: "Student showed signs of fatigue during afternoon session."
      },
      {
        date: translations.yesterday[language],
        emotions: {
          attention: 75,
          engagement: 80,
          fatigue: 25,
          confusion: 20,
          focus: 78,
        },
        notes: "Good engagement throughout the day."
      },
      {
        date: `3 ${translations.daysAgo[language]}`,
        emotions: {
          attention: 60,
          engagement: 65,
          fatigue: 50,
          confusion: 40,
          focus: 55,
        },
        notes: "Struggled with new math concepts, showing signs of confusion."
      }
    ],
    recommendations: [
      "Consider shorter learning sessions with more breaks",
      "Encourage more interactive learning activities",
      "Check in with student about sleep patterns and overall wellbeing",
      "Try varying the learning content format (visual, auditory, kinesthetic)"
    ]
  }

  // Mock quiz data
  const quizData = {
    overview: {
      totalQuizzes: 12,
      averageScore: 76,
      highestScore: 92,
      lowestScore: 65,
      completionRate: 85,
    },
    history: [
      {
        subject: "Science",
        topic: "Photosynthesis",
        score: 85,
        date: "2023-07-15",
        time: "10:30 AM",
        duration: 15,
        questions: 10,
        correct: 8.5,
        incorrect: 1.5,
      },
      {
        subject: "Math",
        topic: "Algebra",
        score: 75,
        date: "2023-07-12",
        time: "09:15 AM",
        duration: 20,
        questions: 12,
        correct: 9,
        incorrect: 3,
      },
      {
        subject: "English",
        topic: "Grammar",
        score: 92,
        date: "2023-07-08",
        time: "11:45 AM",
        duration: 12,
        questions: 15,
        correct: 13.8,
        incorrect: 1.2,
      },
      {
        subject: "History",
        topic: "Ancient Civilizations",
        score: 68,
        date: "2023-07-05",
        time: "02:30 PM",
        duration: 18,
        questions: 10,
        correct: 6.8,
        incorrect: 3.2,
      }
    ],
    recommendations: [
      "Focus on improving Math skills, particularly in Algebra",
      "Continue with the current approach for English studies",
      "Consider additional practice for History topics",
      "Maintain the good performance in Science"
    ]
  }

  // Simulate loading data
  const loadData = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {type === "emotional" ? (
              <>
                <MessageSquare className="h-5 w-5 text-primary" />
                {translations.emotionalHealth[language]}
              </>
            ) : (
              <>
                <FileText className="h-5 w-5 text-secondary" />
                {translations.quizScores[language]}
              </>
            )}
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                {studentName.split(' ').map(n => n[0]).join('')}
              </div>
              <span>{studentName}</span>
            </div>
            <span className="text-xs px-2 py-0.5 bg-muted rounded-full">
              {translations.subject[language]}: {studentClass}
            </span>
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="overview">{translations.overview[language]}</TabsTrigger>
            <TabsTrigger value="history">{translations.history[language]}</TabsTrigger>
            <TabsTrigger value="recommendations">{translations.recommendations[language]}</TabsTrigger>
          </TabsList>

          {isLoading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">{translations.loading[language]}</p>
              </div>
            </div>
          ) : type === "emotional" ? (
            // Emotional Health Content
            <>
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        {translations.emotionalHealth[language]}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>{translations.attention[language]}</span>
                            <span className="font-medium">{emotionalHealthData.overview.attention}%</span>
                          </div>
                          <Progress value={emotionalHealthData.overview.attention} className="h-2" />
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>{translations.engagement[language]}</span>
                            <span className="font-medium">{emotionalHealthData.overview.engagement}%</span>
                          </div>
                          <Progress value={emotionalHealthData.overview.engagement} className="h-2" />
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>{translations.fatigue[language]}</span>
                            <span className="font-medium">{emotionalHealthData.overview.fatigue}%</span>
                          </div>
                          <Progress value={emotionalHealthData.overview.fatigue} className="h-2" />
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>{translations.confusion[language]}</span>
                            <span className="font-medium">{emotionalHealthData.overview.confusion}%</span>
                          </div>
                          <Progress value={emotionalHealthData.overview.confusion} className="h-2" />
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>{translations.focus[language]}</span>
                            <span className="font-medium">{emotionalHealthData.overview.focus}%</span>
                          </div>
                          <Progress value={emotionalHealthData.overview.focus} className="h-2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        {translations.recommendedAction[language]}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="p-4 bg-yellow-500/10 rounded-lg">
                        <p className="text-sm">
                          Student shows signs of fatigue. Consider shorter learning sessions with more breaks.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="history" className="space-y-4">
                {emotionalHealthData.history.map((entry, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center justify-between">
                        <span>{entry.date}</span>
                        <span className="text-xs px-2 py-0.5 bg-muted rounded-full flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {entry.emotions.focus}% {translations.focus[language]}
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-5 gap-2">
                          {Object.entries(entry.emotions).map(([key, value]) => (
                            <div key={key} className="flex flex-col items-center">
                              <div className="w-full h-24 bg-muted/30 rounded-lg flex items-end justify-center">
                                <div 
                                  className="w-8 bg-primary/80 rounded-t-sm" 
                                  style={{ height: `${value}%` }}
                                ></div>
                              </div>
                              <span className="text-xs mt-1 capitalize">{key}</span>
                              <span className="text-xs font-medium">{value}%</span>
                            </div>
                          ))}
                        </div>
                        
                        <div className="text-sm">
                          <p>{entry.notes}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
              
              <TabsContent value="recommendations" className="space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{translations.recommendations[language]}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {emotionalHealthData.recommendations.map((recommendation, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mt-0.5">
                            <span className="text-xs font-bold">{index + 1}</span>
                          </div>
                          <p className="text-sm">{recommendation}</p>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>
            </>
          ) : (
            // Quiz Scores Content
            <>
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        {translations.quizResults[language]}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                          <span className="text-sm">{translations.totalQuizzes[language]}</span>
                          <span className="font-bold">{quizData.overview.totalQuizzes}</span>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                          <span className="text-sm">{translations.averageScore[language]}</span>
                          <span className="font-bold">{quizData.overview.averageScore}%</span>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                          <span className="text-sm">{translations.highestScore[language]}</span>
                          <span className="font-bold text-green-600">{quizData.overview.highestScore}%</span>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                          <span className="text-sm">{translations.lowestScore[language]}</span>
                          <span className="font-bold text-red-600">{quizData.overview.lowestScore}%</span>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>{translations.completionRate[language]}</span>
                            <span className="font-medium">{quizData.overview.completionRate}%</span>
                          </div>
                          <Progress value={quizData.overview.completionRate} className="h-2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {translations.quizResults[language]}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64 bg-muted/30 rounded-lg flex items-end justify-between gap-2 p-4">
                        {quizData.history.map((quiz, index) => (
                          <div key={index} className="relative flex flex-col items-center">
                            <div 
                              className="w-10 bg-secondary/80 rounded-t-sm" 
                              style={{ height: `${quiz.score}%` }}
                            ></div>
                            <span className="text-xs mt-2">{quiz.subject.substring(0, 3)}</span>
                            <span className="text-xs font-medium">{quiz.score}%</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="history" className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium">{translations.subject[language]}</th>
                        <th className="text-left py-3 px-4 font-medium">{translations.score[language]}</th>
                        <th className="text-left py-3 px-4 font-medium">{translations.date[language]}</th>
                        <th className="text-left py-3 px-4 font-medium">{translations.duration[language]}</th>
                        <th className="text-left py-3 px-4 font-medium">{translations.questions[language]}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quizData.history.map((quiz, index) => (
                        <tr key={index} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium">{quiz.subject}</p>
                              <p className="text-xs text-foreground/70">{quiz.topic}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`font-medium ${
                              quiz.score >= 80 ? 'text-green-600' : 
                              quiz.score >= 60 ? 'text-yellow-600' : 
                              'text-red-600'
                            }`}>
                              {quiz.score}%
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div>
                              <p className="text-sm">{quiz.date}</p>
                              <p className="text-xs text-foreground/70">{quiz.time}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            {quiz.duration} {translations.minutes[language]}
                          </td>
                          <td className="py-3 px-4">
                            <div>
                              <p className="text-sm">{quiz.questions} total</p>
                              <p className="text-xs text-green-600">{quiz.correct} {translations.correct[language]}</p>
                              <p className="text-xs text-red-600">{quiz.incorrect} {translations.incorrect[language]}</p>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>
              
              <TabsContent value="recommendations" className="space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{translations.recommendations[language]}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {quizData.recommendations.map((recommendation, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center mt-0.5">
                            <span className="text-xs font-bold">{index + 1}</span>
                          </div>
                          <p className="text-sm">{recommendation}</p>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>
            </>
          )}
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {translations.close[language]}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
