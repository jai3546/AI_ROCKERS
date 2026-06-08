"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  X, User, Mail, Phone, School, BookOpen, Calendar, 
  Award, Clock, FileText, Activity, Brain, TrendingUp, 
  AlertCircle, CheckCircle2, Target, Focus, Sparkles
} from "lucide-react"
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

// Reusable SVG Radial Progress Ring Component with Glow
const RadialProgress = ({ value, label, color, size = 100, strokeWidth = 8 }: { value: number, label: string, color: string, size?: number, strokeWidth?: number }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;
  
  return (
    <div className="relative flex flex-col items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90 filter drop-shadow-xl">
        <defs>
          <linearGradient id={`gradient-${label.replace(/\s+/g, '')}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="1" />
            <stop offset="100%" stopColor={color} stopOpacity="0.6" />
          </linearGradient>
          <filter id={`glow-${label.replace(/\s+/g, '')}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/10 dark:text-muted/20"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={`url(#gradient-${label.replace(/\s+/g, '')})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          filter={`url(#glow-${label.replace(/\s+/g, '')})`}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.8, ease: "easeOut", delay: 0.2 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center -translate-y-4">
        <motion.span 
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="text-xl sm:text-2xl font-black bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70"
        >
          {value}%
        </motion.span>
      </div>
      <motion.span 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-2 text-xs sm:text-sm font-semibold tracking-wide text-muted-foreground uppercase text-center"
      >
        {label}
      </motion.span>
    </div>
  )
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

  // Load student data
  useEffect(() => {
    if (propStudent) {
      setLocalStudent(propStudent)
    } else if (open) {
      try {
        const userData = localStorage.getItem("demoUser")
        if (userData) {
          const parsedUser = JSON.parse(userData)
          setLocalStudent({
            id: parsedUser.id || '1',
            name: parsedUser.name || 'Riya',
            class: parsedUser.class || '12',
            role: 'student',
            avatar: parsedUser.avatar || '👩‍🎓',
            email: `${(parsedUser.name || 'student').toLowerCase().replace(' ', '.')}@example.com`,
            phone: '+91 98765 43210',
            joinDate: new Date().toLocaleDateString(),
            attendance: 92,
            performance: 88,
            subjects: [
              { name: 'Mathematics', progress: 95, grade: 'A+' },
              { name: 'Science', progress: 85, grade: 'A' },
              { name: 'English', progress: 84, grade: 'A' },
              { name: 'Computer Science', progress: 98, grade: 'A+' }
            ],
            recentActivities: [
              { type: 'quiz', name: 'Advanced Calculus Quiz', date: new Date().toLocaleDateString(), score: 96, completed: true },
              { type: 'task', name: 'Physics Lab Report', date: 'Yesterday', completed: true },
              { type: 'quiz', name: 'Grammar Test', date: '3 days ago', score: 82, completed: true }
            ],
            isDemo: parsedUser.isDemo || false
          })
        } else {
          setLocalStudent({
            id: 'default-1',
            name: 'Riya',
            class: '12',
            role: 'student',
            avatar: '👩‍🎓',
            email: 'riya@example.com',
            phone: '+91 98765 43210',
            joinDate: new Date().toLocaleDateString(),
            attendance: 92,
            performance: 88,
            subjects: [
              { name: 'Mathematics', progress: 95, grade: 'A+' },
              { name: 'Science', progress: 85, grade: 'A' }
            ],
            recentActivities: [
              { type: 'quiz', name: 'Daily Challenge', date: new Date().toLocaleDateString(), score: 90, completed: true }
            ],
            isDemo: true
          })
        }
      } catch (error) {
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
    studentDetails: { en: "Student Details", hi: "छात्र विवरण", te: "విద్యార్థి వివరాలు" },
    overview: { en: "Overview", hi: "अवलोकन", te: "అవలోకనం" },
    performance: { en: "Performance", hi: "प्रदर्शन", te: "పనితీరు" },
    activities: { en: "Activities", hi: "गतिविधियां", te: "కార్యకలాపాలు" },
    insights: { en: "Insights", hi: "अंतर्दृष्टि", te: "అంతర్దృష్టులు" },
    email: { en: "Email", hi: "ईमेल", te: "ఇమెయిల్" },
    phone: { en: "Phone", hi: "फोन", te: "ఫోన్" },
    class: { en: "Class", hi: "कक्षा", te: "తరగతి" },
    joinDate: { en: "Join Date", hi: "शामिल होने की तारीख", te: "చేరిన తేదీ" },
    attendance: { en: "Attendance", hi: "उपस्थिति", te: "హాజరు" },
    subjects: { en: "Subjects", hi: "विषय", te: "విషయాలు" },
    recentActivities: { en: "Timeline", hi: "हाल की गतिविधियां", te: "ఇటీవలి కార్యకలాపాలు" },
    completed: { en: "Completed", hi: "पूरा किया गया", te: "పూర్తయింది" },
    close: { en: "Close", hi: "बंद करें", te: "మూసివేయండి" },
    excellent: { en: "Excellent", hi: "उत्कृष्ट", te: "అద్భుతం" },
    good: { en: "Good", hi: "अच्छा", te: "మంచిది" },
    average: { en: "Average", hi: "औसत", te: "సగటు" },
    needsImprovement: { en: "Needs Improvement", hi: "सुधार की आवश्यकता है", te: "మెరుగుదల అవసరం" },
  }

  const handleClose = () => {
    if (onClose) onClose()
    if (onOpenChange) onOpenChange(false)
  }

  if (!open) return null

  const student = propStudent || localStudent

  if (!student) {
    return (
      <div className="fixed inset-0 bg-background/60 backdrop-blur-xl z-50 flex items-center justify-center p-4">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-primary font-medium tracking-widest uppercase">Loading</p>
        </div>
      </div>
    )
  }

  const getPerformanceLabel = (performance: number) => {
    if (performance >= 90) return translations.excellent[language]
    if (performance >= 75) return translations.good[language]
    if (performance >= 60) return translations.average[language]
    return translations.needsImprovement[language]
  }

  // Ultra-Premium Claymorphism & Glassmorphism Utilities
  const clayCard = "bg-background/80 backdrop-blur-3xl border border-white/20 dark:border-white/10 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden"
  const innerClay = "bg-muted/40 dark:bg-muted/20 backdrop-blur-md shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)] border border-white/40 dark:border-white/5 rounded-2xl sm:rounded-3xl"
  const popHover = "transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-primary/30"

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Animated Background Overlay */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 bg-black/40 backdrop-blur-xl"
          onClick={handleClose}
        >
          {/* Decorative Background Orbs (hidden on very small screens for performance) */}
          <div className="hidden sm:block absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px] animate-pulse" />
          <div className="hidden sm:block absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-blue-500/10 rounded-full blur-[120px]" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 30 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-5xl my-auto z-10"
          onClick={(e) => e.stopPropagation()}
        >
          <div className={clayCard}>
            
            {/* Header Section */}
            <div className="relative p-6 sm:p-10 bg-gradient-to-br from-primary/10 via-background to-transparent border-b border-white/10 dark:border-white/5">
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-4 sm:right-6 sm:top-6 hover:bg-background/50 hover:text-red-500 rounded-full transition-colors z-20 h-8 w-8 sm:h-10 sm:w-10"
                onClick={handleClose}
              >
                <X size={18} className="sm:w-5 sm:h-5" />
              </Button>
              
              <div className="flex flex-col sm:flex-row items-center sm:items-center gap-4 sm:gap-8 relative z-10">
                <div className="relative">
                  <motion.div 
                    initial={{ rotate: -10, scale: 0.8 }}
                    animate={{ rotate: 0, scale: 1 }}
                    transition={{ type: "spring", bounce: 0.5 }}
                    className="w-24 h-24 sm:w-32 sm:h-32 rounded-full p-1 sm:p-1.5 bg-gradient-to-tr from-primary via-blue-500 to-purple-500 shadow-[0_0_30px_rgba(0,0,0,0.1)] relative z-10"
                  >
                    <div className="w-full h-full rounded-full bg-background flex items-center justify-center text-4xl sm:text-5xl overflow-hidden border-2 sm:border-4 border-background">
                      {student.avatar ? student.avatar : <User className="w-10 h-10 sm:w-12 sm:h-12 text-primary" />}
                    </div>
                  </motion.div>
                  {/* Pulsing glow ring behind avatar */}
                  <div className="absolute inset-0 rounded-full bg-primary/30 blur-xl sm:blur-2xl animate-pulse -z-10 scale-110"></div>
                </div>
                
                <div className="text-center sm:text-left flex-1 mt-2 sm:mt-0">
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-2 bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground/80 to-primary">
                      {student.name || 'Student'}
                    </h2>
                  </motion.div>
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                    className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3 mt-3 sm:mt-4"
                  >
                    <Badge className="px-3 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm font-semibold rounded-full bg-primary/10 text-primary border-primary/20 shadow-sm backdrop-blur-md">
                      <School className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 inline" />
                      {student.class || 'Class 12'}
                    </Badge>
                    {student.isDemo && (
                      <Badge variant="outline" className="px-3 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm font-semibold rounded-full border-dashed border-primary/30 text-primary/80">
                        Demo Account
                      </Badge>
                    )}
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-4 sm:p-8 md:p-10 bg-background/40">
              <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="w-full overflow-x-auto pb-2 sm:pb-0 mb-6 sm:mb-8 hide-scrollbar">
                  <TabsList className="inline-flex min-w-full sm:min-w-0 sm:w-auto p-1.5 bg-muted/50 dark:bg-muted/30 rounded-2xl border border-white/20 dark:border-white/5 shadow-inner">
                    {["overview", "performance", "activities", "insights"].map((tab) => (
                      <TabsTrigger 
                        key={tab} 
                        value={tab}
                        className="flex-1 min-w-[100px] sm:min-w-[120px] rounded-xl px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-muted-foreground data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-md transition-all whitespace-nowrap"
                      >
                        {translations[tab as keyof typeof translations]?.[language] || tab}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>

                <div className="mt-4 sm:mt-6 min-h-[420px]">
                  {/* OVERVIEW TAB */}
                  <TabsContent value="overview" className="m-0 focus-visible:ring-0">
                    <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
                      
                      {/* Contact Info Bento */}
                      <motion.div variants={itemVariants} className={`lg:col-span-7 p-6 sm:p-8 ${innerClay} ${popHover}`}>
                        <div className="flex items-center gap-3 mb-6 sm:mb-8">
                          <div className="p-2.5 sm:p-3 bg-primary/10 rounded-xl sm:rounded-2xl text-primary"><User className="w-5 h-5 sm:w-6 sm:h-6" /></div>
                          <h3 className="text-lg sm:text-xl font-bold tracking-tight">Profile Information</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                          {[
                            { icon: Mail, label: translations.email[language], value: student.email },
                            { icon: Phone, label: translations.phone[language], value: student.phone },
                            { icon: Calendar, label: translations.joinDate[language], value: student.joinDate },
                            { icon: Award, label: 'Current Status', value: 'Active Student' }
                          ].map((item, i) => (
                            <div key={i} className="group">
                              <p className="text-[10px] sm:text-xs text-muted-foreground uppercase font-bold tracking-widest mb-1 group-hover:text-primary transition-colors">{item.label}</p>
                              <div className="flex items-center gap-2 sm:gap-3 overflow-hidden">
                                <item.icon className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground/50 group-hover:text-primary transition-colors shrink-0" />
                                <p className="text-sm sm:text-base font-semibold truncate" title={item.value}>{item.value}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>

                      {/* Quick Stats Bento */}
                      <motion.div variants={itemVariants} className={`lg:col-span-5 p-6 sm:p-8 flex flex-col justify-center items-center gap-6 sm:gap-8 ${innerClay} ${popHover}`}>
                        <div className="flex flex-row flex-wrap sm:flex-nowrap gap-6 sm:gap-8 lg:gap-12 w-full justify-center">
                          <RadialProgress value={student.attendance || 0} label={translations.attendance[language]} color="#10b981" size={120} />
                          <RadialProgress value={student.performance || 0} label={translations.performance[language]} color="#8b5cf6" size={120} />
                        </div>
                      </motion.div>
                    </motion.div>
                  </TabsContent>

                  {/* PERFORMANCE TAB */}
                  <TabsContent value="performance" className="m-0 focus-visible:ring-0">
                    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6 sm:space-y-8">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <h3 className="text-xl sm:text-2xl font-bold tracking-tight">{translations.subjects[language]}</h3>
                        <Badge variant="outline" className="px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-primary/5 border-primary/30 text-primary font-bold shadow-sm self-start sm:self-auto">
                          Overall: {getPerformanceLabel(student.performance || 0)}
                        </Badge>
                      </div>
                      
                      {student.subjects?.length ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                          {student.subjects.map((subject: any, i: number) => (
                            <motion.div 
                              key={i} 
                              variants={itemVariants}
                              className={`p-5 sm:p-6 ${innerClay} ${popHover} group flex flex-col`}
                            >
                              <div className="flex justify-between items-start mb-5 sm:mb-6">
                                <div className="p-2 sm:p-3 bg-background/80 shadow-sm rounded-xl sm:rounded-2xl text-primary group-hover:scale-110 transition-transform">
                                  <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
                                </div>
                                {subject.grade && (
                                  <div className="px-2 sm:px-3 py-1 bg-background/50 backdrop-blur-sm rounded-lg border border-white/10 shadow-sm">
                                    <span className="text-xl sm:text-2xl font-black bg-clip-text text-transparent bg-gradient-to-br from-primary to-purple-500">
                                      {subject.grade}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <h4 className="font-bold text-lg sm:text-xl mb-1">{subject.name}</h4>
                              <div className="mt-auto pt-5 sm:pt-6 space-y-2 sm:space-y-3">
                                <div className="flex justify-between text-xs sm:text-sm">
                                  <span className="text-muted-foreground font-medium">Progress</span>
                                  <span className="font-black">{subject.progress}%</span>
                                </div>
                                <div className="h-2.5 sm:h-3 w-full bg-background/50 rounded-full overflow-hidden shadow-inner border border-white/5">
                                  <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${subject.progress}%` }}
                                    transition={{ duration: 1, delay: 0.2 + (i * 0.1) }}
                                    className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full"
                                  />
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className={`p-10 sm:p-16 text-center ${innerClay}`}>
                          <p className="text-muted-foreground text-base sm:text-lg">No subject data available</p>
                        </div>
                      )}
                    </motion.div>
                  </TabsContent>

                  {/* ACTIVITIES TAB */}
                  <TabsContent value="activities" className="m-0 focus-visible:ring-0">
                    <motion.div variants={containerVariants} initial="hidden" animate="show" className={`p-6 sm:p-8 md:p-10 ${innerClay}`}>
                      <h3 className="text-xl sm:text-2xl font-bold mb-8 sm:mb-10 flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-xl"><Activity className="text-primary w-5 h-5 sm:w-6 sm:h-6" /></div> 
                        {translations.recentActivities[language]}
                      </h3>
                      
                      {student.recentActivities?.length ? (
                        <div className="relative border-l-2 border-primary/20 ml-4 sm:ml-6 space-y-8 sm:space-y-10 pb-2 sm:pb-4">
                          {student.recentActivities.map((activity: any, i: number) => (
                            <motion.div 
                              key={i}
                              variants={itemVariants}
                              className="relative pl-6 sm:pl-10 group"
                            >
                              <div className="absolute -left-[17px] sm:-left-[25px] top-1 sm:top-2 w-8 h-8 sm:w-12 sm:h-12 bg-background border-2 sm:border-[3px] border-primary/30 group-hover:border-primary rounded-full flex items-center justify-center shadow-md transition-colors z-10">
                                {activity.type === 'quiz' ? <Target className="text-primary w-4 h-4 sm:w-[18px] sm:h-[18px]" /> : <CheckCircle2 className="text-green-500 w-4 h-4 sm:w-[18px] sm:h-[18px]" />}
                              </div>
                              <div className="bg-background/50 backdrop-blur-sm p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-white/5 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1">
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4">
                                  <div>
                                    <h4 className="font-bold text-base sm:text-lg mb-1">{activity.name}</h4>
                                    <p className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                                      <Clock className="w-3 h-3 sm:w-[14px] sm:h-[14px] opacity-70" /> {activity.date}
                                    </p>
                                  </div>
                                  {activity.score !== undefined ? (
                                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start w-full sm:w-auto mt-2 sm:mt-0">
                                      <span className="text-[10px] sm:text-sm font-bold uppercase tracking-widest text-muted-foreground sm:mb-1">Score</span>
                                      <Badge className={`px-3 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm font-bold rounded-full ${activity.score >= 90 ? 'bg-green-500 hover:bg-green-600' : 'bg-primary hover:bg-primary/90'} text-white shadow-sm`}>
                                        {activity.score}%
                                      </Badge>
                                    </div>
                                  ) : (
                                    <Badge variant="outline" className="px-3 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm rounded-full bg-green-500/10 text-green-600 border-green-500/20 font-bold self-start mt-2 sm:mt-0">
                                      Completed
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center text-muted-foreground text-base sm:text-lg py-8 sm:py-10">No recent activities available</p>
                      )}
                    </motion.div>
                  </TabsContent>

                  {/* INSIGHTS TAB */}
                  <TabsContent value="insights" className="m-0 focus-visible:ring-0">
                    <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                      
                      {/* Emotion Distribution */}
                      <motion.div variants={itemVariants} className={`p-6 sm:p-8 ${innerClay} ${popHover}`}>
                        <h3 className="text-lg sm:text-xl font-bold mb-6 sm:mb-8 flex items-center gap-3">
                          <div className="p-2 bg-purple-500/10 rounded-xl"><Brain className="text-purple-500 w-5 h-5 sm:w-6 sm:h-6" /></div>
                          Learning Behavior
                        </h3>
                        <div className="space-y-5 sm:space-y-6">
                          {[
                            { label: 'Focused', value: 72, color: 'bg-green-500', icon: Focus },
                            { label: 'Excited', value: 15, color: 'bg-blue-500', icon: Sparkles },
                            { label: 'Confused', value: 8, color: 'bg-amber-500', icon: AlertCircle },
                            { label: 'Bored', value: 5, color: 'bg-red-500', icon: Activity }
                          ].map((emotion, idx) => (
                            <div key={emotion.label}>
                              <div className="flex justify-between text-xs sm:text-sm mb-2 font-bold uppercase tracking-wider">
                                <span className="flex items-center gap-2"><emotion.icon className={`w-3 h-3 sm:w-3.5 sm:h-3.5 text-${emotion.color.split('-')[1]}-500`} /> {emotion.label}</span>
                                <span>{emotion.value}%</span>
                              </div>
                              <div className="h-2.5 sm:h-3 w-full bg-background/50 rounded-full overflow-hidden shadow-inner">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${emotion.value}%` }}
                                  transition={{ duration: 1, delay: 0.2 + (idx * 0.1) }}
                                  className={`h-full ${emotion.color} rounded-full`}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>

                      <div className="space-y-6 sm:space-y-8 flex flex-col">
                        {/* Focus Score */}
                        <motion.div variants={itemVariants} className={`p-6 sm:p-8 flex items-center gap-4 sm:gap-6 ${innerClay} ${popHover} flex-1`}>
                          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary to-purple-500 p-0.5 shadow-lg shrink-0">
                             <div className="w-full h-full bg-background rounded-[10px] sm:rounded-[15px] flex items-center justify-center">
                               <TrendingUp className="text-primary w-6 h-6 sm:w-8 sm:h-8" />
                             </div>
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Average Focus</p>
                            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-1 sm:gap-3 mt-1">
                              <span className="text-4xl sm:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-foreground to-primary">87%</span>
                              <Badge className="bg-green-500/10 text-green-600 border-0 hover:bg-green-500/20 sm:mb-2 font-bold text-[10px] sm:text-xs px-2 py-0.5">
                                +9% this week
                              </Badge>
                            </div>
                          </div>
                        </motion.div>

                        {/* Premium AI Advisory Card */}
                        <motion.div variants={itemVariants} className="p-6 sm:p-8 bg-gradient-to-br from-amber-500/20 via-amber-500/5 to-transparent backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-amber-500/30 shadow-[0_10px_30px_-10px_rgba(245,158,11,0.2)] relative overflow-hidden group">
                          {/* Animated background gradient */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
                          <div className="absolute -top-10 -right-10 p-4 opacity-[0.07] rotate-12 group-hover:rotate-45 transition-transform duration-700">
                            <Target className="w-32 h-32 sm:w-48 sm:h-48 text-amber-500" />
                          </div>
                          <h3 className="text-lg sm:text-xl font-bold text-amber-700 dark:text-amber-400 mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3 relative z-10">
                            <div className="p-1.5 sm:p-2 bg-amber-500/20 rounded-lg sm:rounded-xl text-amber-600 dark:text-amber-300">
                              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                            AI Advisory Insight
                          </h3>
                          <p className="text-sm sm:text-base text-amber-900/80 dark:text-amber-100/80 relative z-10 leading-relaxed font-medium">
                            <span className="font-bold text-amber-700 dark:text-amber-300">{student.name}</span> demonstrates exceptional focus during morning hours. 
                            However, engagement dips by <span className="font-bold text-red-500/80">~15%</span> after 2 PM. 
                            <br/><br/>
                            <strong className="text-amber-800 dark:text-amber-200 bg-amber-500/10 px-2 py-1 rounded-md inline-block">🎯 Recommendation:</strong> Optimize the schedule by moving complex problem-solving sessions (e.g. {student.subjects?.[0]?.name || 'Math'}) to earlier time slots.
                          </p>
                        </motion.div>
                      </div>

                    </motion.div>
                  </TabsContent>
                </div>
              </Tabs>
            </div>
            
          </div>
        </motion.div>
      </div>
      {/* Utility style for hiding scrollbar on tabs while keeping it functional */}
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </AnimatePresence>
  )
}