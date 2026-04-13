"use client"

import { useState } from "react"
import { useTheme } from "next-themes"
import { motion, AnimatePresence } from "framer-motion"
import {
  BarChart3,
  BookOpen,
  Brain,
  Calendar,
  Download,
  FileText,
  Home,
  LogOut,
  MessageSquare,
  Moon,
  School,
  Settings,
  Sun,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { VoiceCommand } from "@/components/voice-command"
import { WeeklyProgress } from "@/components/school/weekly-progress"
import { StudentManagement } from "@/components/school/student-management"
import { StudentDetailsDialog } from "@/components/school/student-details-dialog"
import { SchoolDetailsDialog } from "@/components/school-details-dialog"
import { useRouter } from "next/navigation"

// Theme toggle component
function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="text-foreground/70"
    >
      <Sun size={20} className="rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon size={20} className="absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const [language, setLanguage] = useState<"en" | "hi" | "te">(() => {
    // Check if we're in the browser and get stored language or default to "en"
    if (typeof window !== "undefined") {
      const storedLanguage = localStorage.getItem("preferredLanguage") as "en" | "hi" | "te" | null
      return storedLanguage || "en"
    }
    return "en"
  })
  const [isExporting, setIsExporting] = useState(false)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [detailsType, setDetailsType] = useState<"emotional" | "quiz">("emotional")
  const [showSchoolDetails, setShowSchoolDetails] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState({
    id: "",
    name: "",
    class: ""
  })

  const translations = {
    welcome: {
      en: "Welcome, Admin!",
      hi: "स्वागत है, एडमिन!",
      te: "స్వాగతం, అడ్మిన్!",
    },
    dashboard: {
      en: "School Portal",
      hi: "स्कूल पोर्टल",
      te: "స్కూల్ పోర్టల్",
    },
    overview: {
      en: "Overview",
      hi: "अवलोकन",
      te: "అవలోకనం",
    },
    students: {
      en: "Students",
      hi: "छात्र",
      te: "విద్యార్థులు",
    },
    classes: {
      en: "Classes",
      hi: "कक्षाएं",
      te: "తరగతులు",
    },
    activeStudents: {
      en: "Active Students",
      hi: "सक्रिय छात्र",
      te: "యాక్టివ్ విద్యార్థులు",
    },
    weeklyProgress: {
      en: "Weekly Progress",
      hi: "साप्ताहिक प्रगति",
      te: "వారపు పురోగతి",
    },
    viewDetails: {
      en: "View Details",
      hi: "विवरण देखें",
      te: "వివరాలు చూడండి",
    },
    emotionalHealth: {
      en: "Emotional Health Alerts",
      hi: "भावनात्मक स्वास्थ्य अलर्ट",
      te: "భావోద్వేగ ఆరోగ్య హెచ్చరికలు",
    },
    quizScores: {
      en: "Quiz Scores",
      hi: "क्विज़ स्कोर",
      te: "క్విజ్ స్కోర్లు",
    },
    learningHeatmap: {
      en: "Learning Heatmap",
      hi: "लर्निंग हीटमैप",
      te: "లెర్నింగ్ హీట్‌మ్యాప్",
    },
    exportReports: {
      en: "Export Reports",
      hi: "रिपोर्ट निर्यात करें",
      te: "నివేదికలను ఎగుమతి చేయండి",
    },
    logout: {
      en: "Logout",
      hi: "लॉगआउट",
      te: "లాగౌట్",
    },
    voiceCommands: {
      en: ["View students", "View classes", "Export reports", "View progress", "Logout"],
      hi: ["छात्र देखें", "कक्षाएं देखें", "रिपोर्ट निर्यात करें", "प्रगति देखें", "लॉगआउट"],
      te: ["విద్యార్థులను చూడండి", "తరగతులను చూడండి", "నివేదికలను ఎగుమతి చేయండి", "పురోగతిని చూడండి", "లాగౌట్"],
    },
  }

  // Export student reports as CSV
  const exportStudentReports = () => {
    setIsExporting(true)

    try {
      // Create CSV content
      let csvContent = "data:text/csv;charset=utf-8,"
      csvContent += "Student ID,Name,Class,Quizzes Completed,Average Score,Flashcards Reviewed,XP Earned\n"

      // Add mock student data
      csvContent += "S001,Rahul Singh,8A,15,82%,120,850\n"
      csvContent += "S002,Ananya Patel,7B,12,78%,95,720\n"
      csvContent += "S003,Vikram Mehta,9C,10,75%,85,680\n"
      csvContent += "S004,Priya Sharma,6A,8,80%,70,650\n"
      csvContent += "S005,Arjun Kumar,10B,18,85%,150,920\n"

      // Create filename
      const date = new Date().toISOString().split('T')[0]
      const filename = `Student_Reports_${date}.csv`

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
    } catch (error) {
      console.error("Error exporting student reports:", error)
    } finally {
      setIsExporting(false)
    }
  }

  // Export performance data as CSV
  const exportPerformanceData = () => {
    setIsExporting(true)

    try {
      // Create CSV content
      let csvContent = "data:text/csv;charset=utf-8,"
      csvContent += "Class,Subject,Quizzes Completed,Average Score,Highest Score,Lowest Score\n"

      // Add mock performance data
      csvContent += "8A,Science,25,78%,95%,62%\n"
      csvContent += "7B,Math,22,65%,88%,45%\n"
      csvContent += "9C,History,18,82%,98%,70%\n"
      csvContent += "6A,English,15,80%,92%,68%\n"
      csvContent += "10B,Physics,20,75%,90%,55%\n"

      // Create filename
      const date = new Date().toISOString().split('T')[0]
      const filename = `Performance_Data_${date}.csv`

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
    } catch (error) {
      console.error("Error exporting performance data:", error)
    } finally {
      setIsExporting(false)
    }
  }

  // Export attendance records as CSV
  const exportAttendanceRecords = () => {
    setIsExporting(true)

    try {
      // Create CSV content
      let csvContent = "data:text/csv;charset=utf-8,"
      csvContent += "Class,Total Students,Present,Absent,Attendance Rate\n"

      // Add mock attendance data
      csvContent += "8A,35,32,3,91.4%\n"
      csvContent += "7B,38,35,3,92.1%\n"
      csvContent += "9C,40,36,4,90.0%\n"
      csvContent += "6A,42,38,4,90.5%\n"
      csvContent += "10B,36,33,3,91.7%\n"

      // Create filename
      const date = new Date().toISOString().split('T')[0]
      const filename = `Attendance_Records_${date}.csv`

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
    } catch (error) {
      console.error("Error exporting attendance records:", error)
    } finally {
      setIsExporting(false)
    }
  }

  const handleVoiceCommand = (command: string) => {
    const lowerCommand = command.toLowerCase()

    // Handle logout command
    if (lowerCommand.includes("logout") || lowerCommand.includes("लॉगआउट") || lowerCommand.includes("లాగౌట్")) {
      router.push("/")
    }

    // Other commands would trigger specific actions
    // For demo purposes, we'll just log them
    console.log("Voice command received:", command)
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white dark:bg-card border-b border-border dark:border-border shadow-sm">
        <div className="container flex items-center justify-between h-16 px-4">
          <div
            className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 p-2 rounded-lg transition-colors"
            onClick={() => setShowSchoolDetails(true)}
          >
            <div className="w-10 h-10 rounded-full bg-highlight/20 flex items-center justify-center">
              <School size={20} className="text-highlight" />
            </div>
            <div>
              <h1 className="text-sm font-medium text-foreground/70">{translations.dashboard[language]}</h1>
              <p className="text-lg font-bold">{translations.welcome[language]}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={() => router.push("/")} className="text-foreground/70">
              <LogOut size={20} />
              <span className="sr-only">{translations.logout[language]}</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container px-4 py-6 space-y-8">
        {/* Overview Section */}
        <section id="overview-section">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <BarChart3 size={20} className="text-highlight" />
            {translations.overview[language]}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Students Card */}
            <Card className="bg-card dark:bg-card text-card-foreground dark:text-card-foreground">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-foreground/70 dark:text-foreground/80">{translations.students[language]}</p>
                    <p className="text-3xl font-bold text-foreground dark:text-foreground">248</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <Users size={24} className="text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Classes Card */}
            <Card className="bg-card dark:bg-card text-card-foreground dark:text-card-foreground">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-foreground/70 dark:text-foreground/80">{translations.classes[language]}</p>
                    <p className="text-3xl font-bold text-foreground dark:text-foreground">12</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center">
                    <BookOpen size={24} className="text-secondary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Active Students Card */}
            <Card className="bg-card dark:bg-card text-card-foreground dark:text-card-foreground">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-foreground/70 dark:text-foreground/80">{translations.activeStudents[language]}</p>
                    <p className="text-3xl font-bold text-foreground dark:text-foreground">186</p>
                    <p className="text-xs text-foreground/50 dark:text-foreground/60">75% of total</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                    <Brain size={24} className="text-accent" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Weekly Progress Section */}
        <section id="weekly-progress-section">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Calendar size={20} className="text-highlight" />
            {translations.weeklyProgress[language]}
          </h2>

          <WeeklyProgress language={language} />
        </section>

        {/* Monitoring Section */}
        <section id="monitoring-section" className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Emotional Health Card */}
          <Card className="bg-card dark:bg-card text-card-foreground dark:text-card-foreground">
            <CardHeader className="bg-primary/10 dark:bg-primary/20 pb-2">
              <CardTitle className="flex items-center gap-2 text-primary">
                <MessageSquare size={18} />
                {translations.emotionalHealth[language]}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                      <span className="text-sm font-bold">RS</span>
                    </div>
                    <div>
                      <p className="font-medium">Rahul Singh</p>
                      <p className="text-xs text-foreground/70">Class 8A</p>
                    </div>
                  </div>
                  <div className="text-xs font-medium text-destructive">High fatigue detected</div>
                </div>

                <div className="flex items-center justify-between p-3 bg-yellow-500/10 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                      <span className="text-sm font-bold">AP</span>
                    </div>
                    <div>
                      <p className="font-medium">Ananya Patel</p>
                      <p className="text-xs text-foreground/70">Class 7B</p>
                    </div>
                  </div>
                  <div className="text-xs font-medium text-yellow-600">Moderate stress detected</div>
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <Button
                  variant="outline"
                  className="text-primary border-primary hover:bg-primary/10"
                  onClick={() => {
                    setSelectedStudent({
                      id: "s001",
                      name: "Rahul Singh",
                      class: "8A"
                    });
                    setDetailsType("emotional");
                    setShowDetailsDialog(true);
                  }}
                >
                  {translations.viewDetails[language]}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quiz Scores Card */}
          <Card className="bg-card dark:bg-card text-card-foreground dark:text-card-foreground">
            <CardHeader className="bg-secondary/10 dark:bg-secondary/20 pb-2">
              <CardTitle className="flex items-center gap-2 text-secondary">
                <FileText size={18} />
                {translations.quizScores[language]}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
                      <span className="text-sm font-bold">8A</span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground dark:text-foreground">Science Quiz</p>
                      <p className="text-xs text-foreground/70 dark:text-foreground/80">Class 8A</p>
                    </div>
                  </div>
                  <div className="text-sm font-medium">
                    Avg: <span className="text-secondary">78%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
                      <span className="text-sm font-bold">7B</span>
                    </div>
                    <div>
                      <p className="font-medium">Math Quiz</p>
                      <p className="text-xs text-foreground/70">Class 7B</p>
                    </div>
                  </div>
                  <div className="text-sm font-medium">
                    Avg: <span className="text-secondary">65%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
                      <span className="text-sm font-bold">9C</span>
                    </div>
                    <div>
                      <p className="font-medium">History Quiz</p>
                      <p className="text-xs text-foreground/70">Class 9C</p>
                    </div>
                  </div>
                  <div className="text-sm font-medium">
                    Avg: <span className="text-secondary">82%</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <Button
                  variant="outline"
                  className="text-secondary border-secondary hover:bg-secondary/10"
                  onClick={() => {
                    setSelectedStudent({
                      id: "s001",
                      name: "Rahul Singh",
                      class: "8A"
                    });
                    setDetailsType("quiz");
                    setShowDetailsDialog(true);
                  }}
                >
                  {translations.viewDetails[language]}
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Student Management Section */}
        <section id="students-section">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Users size={20} className="text-primary" />
            {translations.students[language]}
          </h2>

          <StudentManagement language={language} />
        </section>

        {/* Export Reports Section */}
        <section id="reports-section">
          <Card className="bg-card dark:bg-card text-card-foreground dark:text-card-foreground">
            <CardHeader className="bg-accent/10 dark:bg-accent/20 pb-2">
              <CardTitle className="flex items-center gap-2 text-accent">
                <Download size={18} />
                {translations.exportReports[language]}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  variant="outline"
                  className="h-auto py-4 flex flex-col items-center gap-2 border-accent text-accent hover:bg-accent/10"
                  onClick={exportStudentReports}
                  disabled={isExporting}
                >
                  {isExporting ? (
                    <div className="animate-spin h-6 w-6 border-2 border-accent rounded-full border-t-transparent" />
                  ) : (
                    <Users size={24} />
                  )}
                  <span>Student Reports</span>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto py-4 flex flex-col items-center gap-2 border-accent text-accent hover:bg-accent/10"
                  onClick={exportPerformanceData}
                  disabled={isExporting}
                >
                  {isExporting ? (
                    <div className="animate-spin h-6 w-6 border-2 border-accent rounded-full border-t-transparent" />
                  ) : (
                    <BarChart3 size={24} />
                  )}
                  <span>Performance Data</span>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto py-4 flex flex-col items-center gap-2 border-accent text-accent hover:bg-accent/10"
                  onClick={exportAttendanceRecords}
                  disabled={isExporting}
                >
                  {isExporting ? (
                    <div className="animate-spin h-6 w-6 border-2 border-accent rounded-full border-t-transparent" />
                  ) : (
                    <Calendar size={24} />
                  )}
                  <span>Attendance Records</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>

      {/* Sidebar Navigation */}
      <div className="fixed left-0 top-0 bottom-0 w-16 bg-white dark:bg-card border-r border-border dark:border-border shadow-md hidden md:flex flex-col items-center py-6 gap-6 z-20">
        <div className="w-10 h-10 rounded-full bg-highlight/20 flex items-center justify-center">
          <School size={20} className="text-highlight" />
        </div>

        <div className="flex-1 flex flex-col items-center gap-4 mt-8">
          <Button
            variant="ghost"
            size="icon"
            className="text-highlight relative group"
            onClick={() => document.getElementById('overview-section')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <Home size={20} />
            <span className="sr-only">Dashboard</span>
            <div className="absolute left-full ml-2 px-2 py-1 bg-foreground text-background text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity">
              Dashboard
            </div>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="relative group"
            onClick={() => document.getElementById('students-section')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <Users size={20} />
            <span className="sr-only">Students</span>
            <div className="absolute left-full ml-2 px-2 py-1 bg-foreground text-background text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity">
              Students
            </div>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="relative group"
            onClick={() => document.getElementById('weekly-progress-section')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <Calendar size={20} />
            <span className="sr-only">Progress</span>
            <div className="absolute left-full ml-2 px-2 py-1 bg-foreground text-background text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity">
              Weekly Progress
            </div>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="relative group"
            onClick={() => document.getElementById('monitoring-section')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <MessageSquare size={20} />
            <span className="sr-only">Monitoring</span>
            <div className="absolute left-full ml-2 px-2 py-1 bg-foreground text-background text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity">
              Monitoring
            </div>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="relative group"
            onClick={() => document.getElementById('reports-section')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <BarChart3 size={20} />
            <span className="sr-only">Reports</span>
            <div className="absolute left-full ml-2 px-2 py-1 bg-foreground text-background text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity">
              Reports
            </div>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="relative group"
          >
            <Settings size={20} />
            <span className="sr-only">Settings</span>
            <div className="absolute left-full ml-2 px-2 py-1 bg-foreground text-background text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity">
              Settings
            </div>
          </Button>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/")}
          className="text-foreground/70 relative group"
        >
          <LogOut size={20} />
          <span className="sr-only">Logout</span>
          <div className="absolute left-full ml-2 px-2 py-1 bg-foreground text-background text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity">
            Logout
          </div>
        </Button>
      </div>

      {/* Voice Command Component */}
      <VoiceCommand
        onCommand={handleVoiceCommand}
        language={language}
        availableCommands={translations.voiceCommands[language]}
        hideCommands={true}
      />

      {/* School Details Dialog */}
      <AnimatePresence>
        {showSchoolDetails && (
          <SchoolDetailsDialog
            school={{
              id: "sch001",
              name: "Vidya International School",
              type: "Secondary School",
              address: "123 Education Street, Hyderabad, Telangana 500001",
              email: "contact@vidyaschool.edu",
              phone: "+91 9876543210",
              website: "www.vidyaschool.edu",
              studentCount: 248,
              teacherCount: 32,
              classCount: 12,
              foundedYear: "1995",
              performance: 88,
              subjects: [
                { name: "Mathematics", performance: 92, teacherCount: 5 },
                { name: "Science", performance: 88, teacherCount: 6 },
                { name: "English", performance: 85, teacherCount: 4 },
                { name: "Social Studies", performance: 82, teacherCount: 4 },
                { name: "Computer Science", performance: 90, teacherCount: 3 },
              ],
              recentActivities: [
                { type: "quiz", name: "Science Quiz Competition", date: "Today", studentCount: 120 },
                { type: "event", name: "Annual Sports Day", date: "Next Week", studentCount: 248 },
                { type: "workshop", name: "Coding Workshop", date: "Last Week", studentCount: 85 },
                { type: "quiz", name: "Math Olympiad", date: "2 weeks ago", studentCount: 75 },
              ]
            }}
            onClose={() => setShowSchoolDetails(false)}
            language={language}
          />
        )}
      </AnimatePresence>

      {/* Student Details Dialog */}
      <StudentDetailsDialog
        open={showDetailsDialog}
        onClose={() => setShowDetailsDialog(false)}
        studentId={selectedStudent.id}
        studentName={selectedStudent.name}
        studentClass={selectedStudent.class}
        type={detailsType}
        language={language}
      />
    </main>
  )
}
