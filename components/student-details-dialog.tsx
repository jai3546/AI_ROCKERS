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
const RadialProgress = ({ value, label, color, size = 90, strokeWidth = 8 }: { value: number, label: string, color: string, size?: number, strokeWidth?: number }) => {
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
            <feGaussianBlur stdDeviation="4" result="blur" />
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
      <div className="absolute inset-0 flex flex-col items-center justify-center -translate-y-3">
        <motion.span 
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="text-lg sm:text-xl font-black bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70"
        >
          {value}%
        </motion.span>
      </div>
      <motion.span 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-2 text-[10px] sm:text-xs font-semibold tracking-wide text-muted-foreground uppercase text-center"
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
  const clayCard = "bg-background/80 backdrop-blur-3xl border border-white/20 dark:border-white/10 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden flex flex-col max-h-[90vh]"
  const innerClay = "bg-muted/40 dark:bg-muted/20 backdrop-blur-md shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)] border border-white/40 dark:border-white/5 rounded-xl sm:rounded-2xl"
  const popHover = "transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-primary/30"

  const containerVariants: any = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants: any = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6" style={{ perspective: '1000px' }}>
        {/* Animated Background Overlay */}
        <motion.div 
          key="bg-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="absolute inset-0 bg-black/40 backdrop-blur-xl"
          onClick={handleClose}
        >
          {/* Decorative Background Orbs (hidden on very small screens for performance) */}
          <div className="hidden sm:block absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px] animate-pulse" />
          <div className="hidden sm:block absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-blue-500/10 rounded-full blur-[120px]" />
        </motion.div>

        <motion.div
          key="modal-content"
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 30 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-4xl z-10"
          onClick={(e) => e.stopPropagation()}
        >
          <div className={clayCard}>
            
            {/* Header Section */}
            <div className="relative p-5 sm:p-8 bg-gradient-to-br from-primary/10 via-background to-transparent border-b border-white/10 dark:border-white/5 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-4 sm:right-6 sm:top-6 hover:bg-background/50 hover:text-red-500 rounded-full transition-colors z-20 h-8 w-8"
                onClick={handleClose}
              >
                <X size={18} />
              </Button>
              
              <div className="flex flex-row items-center gap-4 sm:gap-6 relative z-10">
                <div className="relative shrink-0">
                  <motion.div 
                    initial={{ rotate: -10, scale: 0.8 }}
                    animate={{ rotate: 0, scale: 1 }}
                    transition={{ type: "spring", bounce: 0.5 }}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full p-1 bg-gradient-to-tr from-primary via-blue-500 to-purple-500 shadow-[0_0_20px_rgba(0,0,0,0.1)] relative z-10"
                  >
                    <div className="w-full h-full rounded-full bg-background flex items-center justify-center text-3xl overflow-hidden border-2 border-background">
                      {student.avatar ? student.avatar : <User className="w-8 h-8 text-primary" />}
                    </div>
                  </motion.div>
                  {/* Pulsing glow ring behind avatar */}
                  <div className="absolute inset-0 rounded-full bg-primary/30 blur-xl animate-pulse -z-10 scale-110"></div>
                </div>
                
                <div className="text-left flex-1">
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                    <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-1 bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground/80 to-primary">
                      {student.name || 'Student'}
                    </h2>
                  </motion.div>
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                    className="flex flex-wrap items-center justify-start gap-2 mt-2"
                  >
                    <Badge className="px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold rounded-full bg-primary/10 text-primary border-primary/20 shadow-sm backdrop-blur-md">
                      <School className="w-3 h-3 mr-1 inline" />
                      {student.class || 'Class 12'}
                    </Badge>
                    {student.isDemo && (
                      <Badge variant="outline" className="px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold rounded-full border-dashed border-primary/30 text-primary/80">
                        Demo Account
                      </Badge>
                    )}
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Content Section - Scrollable */}
            <div className="p-4 sm:p-6 md:p-8 bg-background/40 overflow-y-auto flex-1 hide-scrollbar">
              <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="w-full overflow-x-auto pb-2 sm:pb-0 mb-4 sm:mb-6 hide-scrollbar sticky top-0 z-20 bg-background/80 backdrop-blur-md py-1">
                  <TabsList className="inline-flex min-w-full sm:min-w-0 sm:w-auto p-1 bg-muted/50 dark:bg-muted/30 rounded-xl border border-white/20 dark:border-white/5 shadow-inner">
                    {["overview", "performance", "activities", "insights"].map((tab) => (
                      <TabsTrigger 
                        key={tab} 
                        value={tab}
                        className="flex-1 min-w-[90px] sm:min-w-[100px] rounded-lg px-3 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-muted-foreground data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-md transition-all whitespace-nowrap"
                      >
                        {translations[tab as keyof typeof translations]?.[language] || tab}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>

                <div className="mt-2 min-h-[300px]">
                  {/* OVERVIEW TAB */}
                  <TabsContent value="overview" className="m-0 focus-visible:ring-0">
                    <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
                      
                      {/* Contact Info Bento */}
                      <motion.div variants={itemVariants} className={`lg:col-span-7 p-5 sm:p-6 ${innerClay} ${popHover}`}>
                        <div className="flex items-center gap-2 mb-4 sm:mb-6">
                          <div className="p-2 bg-primary/10 rounded-lg text-primary"><User className="w-4 h-4 sm:w-5 sm:h-5" /></div>
                          <h3 className="text-base sm:text-lg font-bold tracking-tight">Profile Information</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                          {[
                            { icon: Mail, label: translations.email[language], value: student.email },
                            { icon: Phone, label: translations.phone[language], value: student.phone },
                            { icon: Calendar, label: translations.joinDate[language], value: student.joinDate },
                            { icon: Award, label: 'Status', value: 'Active Student' }
                          ].map((item, i) => (
                            <div key={i} className="group">
                              <p className="text-[9px] sm:text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1 group-hover:text-primary transition-colors">{item.label}</p>
                              <div className="flex items-center gap-2 overflow-hidden">
                                <item.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground/50 group-hover:text-primary transition-colors shrink-0" />
                                <p className="text-xs sm:text-sm font-semibold truncate" title={item.value}>{item.value}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>

                      {/* Quick Stats Bento */}
                      <motion.div variants={itemVariants} className={`lg:col-span-5 p-5 sm:p-6 flex flex-col justify-center items-center gap-4 sm:gap-6 ${innerClay} ${popHover}`}>
                        <div className="flex flex-row justify-around w-full">
                          <RadialProgress value={student.attendance || 0} label={translations.attendance[language]} color="#10b981" size={90} strokeWidth={6} />
                          <RadialProgress value={student.performance || 0} label={translations.performance[language]} color="#8b5cf6" size={90} strokeWidth={6} />
                        </div>
                      </motion.div>
                    </motion.div>
                  </TabsContent>

                  {/* PERFORMANCE TAB */}
                  <TabsContent value="performance" className="m-0 focus-visible:ring-0">
                    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-4 sm:space-y-6">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <h3 className="text-lg sm:text-xl font-bold tracking-tight">{translations.subjects[language]}</h3>
                        <Badge variant="outline" className="px-3 py-1 rounded-full bg-primary/5 border-primary/30 text-primary font-bold shadow-sm self-start sm:self-auto text-xs">
                          Overall: {getPerformanceLabel(student.performance || 0)}
                        </Badge>
                      </div>
                      
                      {student.subjects?.length ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {student.subjects.map((subject: any, i: number) => (
                            <motion.div 
                              key={i} 
                              variants={itemVariants}
                              className={`p-4 sm:p-5 ${innerClay} ${popHover} group flex flex-col`}
                            >
                              <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-background/80 shadow-sm rounded-lg text-primary group-hover:scale-110 transition-transform">
                                  <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
                                </div>
                                {subject.grade && (
                                  <div className="px-2 py-0.5 bg-background/50 backdrop-blur-sm rounded-md border border-white/10 shadow-sm">
                                    <span className="text-lg sm:text-xl font-black bg-clip-text text-transparent bg-gradient-to-br from-primary to-purple-500">
                                      {subject.grade}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <h4 className="font-bold text-sm sm:text-base mb-1">{subject.name}</h4>
                              <div className="mt-auto pt-4 space-y-2">
                                <div className="flex justify-between text-xs">
                                  <span className="text-muted-foreground font-medium">Progress</span>
                                  <span className="font-black">{subject.progress}%</span>
                                </div>
                                <div className="h-2 w-full bg-background/50 rounded-full overflow-hidden shadow-inner border border-white/5">
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
                        <div className={`p-8 text-center ${innerClay}`}>
                          <p className="text-muted-foreground text-sm sm:text-base">No subject data available</p>
                        </div>
                      )}
                    </motion.div>
                  </TabsContent>

                  {/* ACTIVITIES TAB */}
                  <TabsContent value="activities" className="m-0 focus-visible:ring-0">
                    <motion.div variants={containerVariants} initial="hidden" animate="show" className={`p-5 sm:p-6 md:p-8 ${innerClay}`}>
                      <h3 className="text-lg sm:text-xl font-bold mb-6 sm:mb-8 flex items-center gap-2">
                        <div className="p-1.5 bg-primary/10 rounded-lg"><Activity className="text-primary w-4 h-4 sm:w-5 sm:h-5" /></div> 
                        {translations.recentActivities[language]}
                      </h3>
                      
                      {student.recentActivities?.length ? (
                        <div className="relative border-l-2 border-primary/20 ml-3 sm:ml-4 space-y-6 sm:space-y-8 pb-2">
                          {student.recentActivities.map((activity: any, i: number) => (
                            <motion.div 
                              key={i}
                              variants={itemVariants}
                              className="relative pl-6 sm:pl-8 group"
                            >
                              <div className="absolute -left-[13px] sm:-left-[17px] top-1 w-6 h-6 sm:w-8 sm:h-8 bg-background border-2 border-primary/30 group-hover:border-primary rounded-full flex items-center justify-center shadow-md transition-colors z-10">
                                {activity.type === 'quiz' ? <Target className="text-primary w-3 h-3 sm:w-4 sm:h-4" /> : <CheckCircle2 className="text-green-500 w-3 h-3 sm:w-4 sm:h-4" />}
                              </div>
                              <div className="bg-background/50 backdrop-blur-sm p-4 sm:p-5 rounded-xl border border-white/5 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1">
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-4">
                                  <div>
                                    <h4 className="font-bold text-sm sm:text-base mb-1">{activity.name}</h4>
                                    <p className="text-[10px] sm:text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                                      <Clock className="w-3 h-3 opacity-70" /> {activity.date}
                                    </p>
                                  </div>
                                  {activity.score !== undefined ? (
                                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto mt-2 sm:mt-0">
                                      <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-muted-foreground sm:mb-1">Score</span>
                                      <Badge className={`px-2 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-bold rounded-full ${activity.score >= 90 ? 'bg-green-500 hover:bg-green-600' : 'bg-primary hover:bg-primary/90'} text-white shadow-sm`}>
                                        {activity.score}%
                                      </Badge>
                                    </div>
                                  ) : (
                                    <Badge variant="outline" className="px-2 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs rounded-full bg-green-500/10 text-green-600 border-green-500/20 font-bold self-start mt-2 sm:mt-0">
                                      Completed
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center text-muted-foreground text-sm py-6">No recent activities available</p>
                      )}
                    </motion.div>
                  </TabsContent>

                  {/* INSIGHTS TAB */}
                  <TabsContent value="insights" className="m-0 focus-visible:ring-0">
                    <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                      
                      {/* Emotion Distribution */}
                      <motion.div variants={itemVariants} className={`p-5 sm:p-6 ${innerClay} ${popHover}`}>
                        <h3 className="text-base sm:text-lg font-bold mb-4 sm:mb-6 flex items-center gap-2">
                          <div className="p-1.5 bg-purple-500/10 rounded-lg"><Brain className="text-purple-500 w-4 h-4 sm:w-5 sm:h-5" /></div>
                          Learning Behavior
                        </h3>
                        <div className="space-y-4">
                          {[
                            { label: 'Focused', value: 72, color: 'bg-green-500', icon: Focus },
                            { label: 'Excited', value: 15, color: 'bg-blue-500', icon: Sparkles },
                            { label: 'Confused', value: 8, color: 'bg-amber-500', icon: AlertCircle },
                            { label: 'Bored', value: 5, color: 'bg-red-500', icon: Activity }
                          ].map((emotion, idx) => (
                            <div key={emotion.label}>
                              <div className="flex justify-between text-[10px] sm:text-xs mb-1.5 font-bold uppercase tracking-wider">
                                <span className="flex items-center gap-1.5"><emotion.icon className={`w-3 h-3 text-${emotion.color.split('-')[1]}-500`} /> {emotion.label}</span>
                                <span>{emotion.value}%</span>
                              </div>
                              <div className="h-2 w-full bg-background/50 rounded-full overflow-hidden shadow-inner">
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

                      <div className="space-y-4 sm:space-y-6 flex flex-col">
                        {/* Focus Score */}
                        <motion.div variants={itemVariants} className={`p-5 sm:p-6 flex items-center gap-4 ${innerClay} ${popHover} flex-1`}>
                          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-primary to-purple-500 p-0.5 shadow-lg shrink-0">
                             <div className="w-full h-full bg-background rounded-[10px] flex items-center justify-center">
                               <TrendingUp className="text-primary w-5 h-5 sm:w-6 sm:h-6" />
                             </div>
                          </div>
                          <div>
                            <p className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Average Focus</p>
                            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-1 sm:gap-2">
                              <span className="text-3xl sm:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-foreground to-primary">87%</span>
                              <Badge className="bg-green-500/10 text-green-600 border-0 hover:bg-green-500/20 sm:mb-1.5 font-bold text-[9px] sm:text-[10px] px-1.5 py-0.5">
                                +9%
                              </Badge>
                            </div>
                          </div>
                        </motion.div>

                        {/* Premium AI Advisory Card */}
                        <motion.div variants={itemVariants} className="p-5 sm:p-6 bg-gradient-to-br from-amber-500/20 via-amber-500/5 to-transparent backdrop-blur-xl rounded-xl sm:rounded-2xl border border-amber-500/30 shadow-[0_10px_30px_-10px_rgba(245,158,11,0.2)] relative overflow-hidden group">
                          {/* Animated background gradient */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
                          <div className="absolute -top-6 -right-6 p-2 opacity-[0.07] rotate-12 group-hover:rotate-45 transition-transform duration-700">
                            <Target className="w-24 h-24 sm:w-32 sm:h-32 text-amber-500" />
                          </div>
                          <h3 className="text-base sm:text-lg font-bold text-amber-700 dark:text-amber-400 mb-2 sm:mb-3 flex items-center gap-2 relative z-10">
                            <div className="p-1 sm:p-1.5 bg-amber-500/20 rounded-md sm:rounded-lg text-amber-600 dark:text-amber-300">
                              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                            </div>
                            AI Advisory Insight
                          </h3>
                          <p className="text-xs sm:text-sm text-amber-900/80 dark:text-amber-100/80 relative z-10 leading-relaxed font-medium">
                            <span className="font-bold text-amber-700 dark:text-amber-300">{student.name}</span> demonstrates exceptional focus during morning hours. 
                            However, engagement dips by <span className="font-bold text-red-500/80">~15%</span> after 2 PM. 
                            <br/><br/>
                            <strong className="text-amber-800 dark:text-amber-200 bg-amber-500/10 px-1.5 py-0.5 rounded inline-block">🎯 Recommendation:</strong> Optimize the schedule by moving complex problem-solving sessions to earlier time slots.
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
      {/* Utility style for hiding scrollbar on tabs and inner modal body while keeping it functional */}
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