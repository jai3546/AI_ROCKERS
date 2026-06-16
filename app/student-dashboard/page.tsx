"use client"

import { useState, useEffect, useRef } from "react"
import {
  BookOpen,
  Brain,
  Goal,
  CheckCircle,
  Clock,
  FileText,
  Home,
  LogOut,
  MessageSquare,
  Settings,
  Star,
  Trophy,
  X,
  Activity,
  Smile,
  Eye,
  Headphones,
  AlertTriangle,
  Award,
  Medal,
  Target,
  Sparkles,
  User,
  Moon,
  Sun,
  Camera,
  RefreshCw,
  TrendingUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { VoiceCommand } from "@/components/voice-command"
import { ChatbotIcon } from "@/components/chatbot-icon"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useTheme } from "@/components/theme-provider"
import { LevelProgress } from "@/components/gamification/level-progress"
import { DailyChallenge } from "@/components/gamification/daily-challenge"
import { AchievementCard } from "@/components/gamification/achievement-card"
import { Leaderboard } from "@/components/gamification/leaderboard"
import { RewardPopup } from "@/components/gamification/reward-popup"
import { BadgeCollection } from "@/components/gamification/badge-collection"
import { AchievementBadge, BadgeType, BadgeCategory } from "@/components/gamification/achievement-badge"
import { AiTutorChat } from "@/components/learning/ai-tutor-chat"
import { QuizCard } from "@/components/learning/quiz-card"
import { Flashcard } from "@/components/learning/flashcard"
import { QuizContainer } from "@/components/learning/quiz-container"
import { FlashcardDeck } from "@/components/learning/flashcard-deck"
import { StudySummaries } from "@/components/learning/study-summaries"
import { LearningOptionsMenu } from "@/components/learning/learning-options-menu"
import { Textbooks } from "@/components/learning/textbooks"
import { MindMap } from "@/components/learning/mind-map"
import { getMindMapData } from "@/data/mind-map-data"
import { sampleTextbooks } from "@/data/textbooks"
import { ImprovedMotionDetector, type MotionData } from "@/components/motion/improved-motion-detector"
import { ImprovedEmotionDetector, type EmotionData } from "@/components/tracking/improved-emotion-detector"
import { SimpleEmotionDetector, type EmotionData as SimpleEmotionData } from "@/components/tracking/simple-emotion-detector"
import { EmotionDisplay } from "@/components/tracking/emotion-display"
import { FloatingEmotionTracker } from "@/components/tracking/floating-emotion-tracker"
import { LearningStyleProfile, initialLearningStyleProfile } from "@/services/learning-style-service"
import { type EmotionState } from "@/services/gemini-api"
import { EmotionStatusIndicator } from "@/components/emotion-status-indicator"
import { StudentDetailsDialog } from "@/components/student-details-dialog"
import { allQuizQuestions } from "@/data/quiz-questions"
import { allFlashcards } from "@/data/flashcards"
import { allSummaries } from "@/data/summaries"
import { updateSchoolPortal } from "@/services/school-portal-service"
import { toast } from "@/components/ui/use-toast"
import { LearningMemoryService } from "@/services/learning-memory-service"
import { tagQuizTopicToConcept, tagFlashcardToConcept } from "@/services/concept-tagging-service"

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

export default function StudentDashboardPage() {
  const router = useRouter()
  const [language, setLanguage] = useState<"en" | "hi" | "te">("en")
  const [showAiTutor, setShowAiTutor] = useState(false)
  const [showQuiz, setShowQuiz] = useState(false)
  const [activeQuizSubject, setActiveQuizSubject] = useState<string | undefined>(undefined)
  const [showFlashcards, setShowFlashcards] = useState(false)
  const [showSummaries, setShowSummaries] = useState(false)
  const [activeQuizTopic, setActiveQuizTopic] = useState<string | undefined>(undefined)
  const [showQuizAi, setShowQuizAi] = useState<boolean>(false)
  const [activeFlashcardTopic, setActiveFlashcardTopic] = useState<string | undefined>(undefined)
  const [showFlashcardAi, setShowFlashcardAi] = useState<boolean>(false)
  const [activeFlashcardSubject, setActiveFlashcardSubject] = useState<string | undefined>(undefined)
  const [showLearningOptions, setShowLearningOptions] = useState(false)
  const [showTextbooks, setShowTextbooks] = useState(false)
  const [showMindMap, setShowMindMap] = useState(false)
  const [activeMindMapTopic, setActiveMindMapTopic] = useState<string>("Photosynthesis")
  const [activeMindMapSubject, setActiveMindMapSubject] = useState<string>("Science")
  const [showReward, setShowReward] = useState(false)
  const [showMotionTracker, setShowMotionTracker] = useState(false)
  const [showEmotionDetector, setShowEmotionDetector] = useState(false)
  const [showEmotionDisplay, setShowEmotionDisplay] = useState(false)
  const [showFloatingEmotionTracker, setShowFloatingEmotionTracker] = useState(false)
  const [userDismissedEmotionTracker, setUserDismissedEmotionTracker] = useState(false)
  const [emotionHistory, setEmotionHistory] = useState<EmotionData[]>([])
  const [lastMotionData, setLastMotionData] = useState<MotionData | null>(null)
  const [lastEmotionData, setLastEmotionData] = useState<EmotionData | null>(null)
  const [learningStyle, setLearningStyle] = useState<LearningStyleProfile>(initialLearningStyleProfile)
  const [user, setUser] = useState<{
    id: string
    name: string
    class: string
    role: string
    avatar: string
    isDemo: boolean
  } | null>(null)
  const [emotionState, setEmotionState] = useState<EmotionState | undefined>(undefined)
  const [autoEmotionTracking, setAutoEmotionTracking] = useState(true)
  const [selectedSyllabus, setSelectedSyllabus] = useState<"AP" | "Telangana" | "CBSE" | "General">("General")
  const [dashboardSubject, setDashboardSubject] = useState<string>("all")
  const [userInFrame, setUserInFrame] = useState(true)
  const [showOutOfFrameWarning, setShowOutOfFrameWarning] = useState(false)
  const [quizScore, setQuizScore] = useState({ earned: 0, total: 0 })
  const [showStudentDetails, setShowStudentDetails] = useState(false)
  const [studyTime, setStudyTime] = useState(0)
  const [sessionLength, setSessionLength] = useState(25)
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [isRunning, setIsRunning] = useState(false)
  const formatStudyTime = () => {
     const minutes = Math.floor(timeLeft / 60)
     const seconds = timeLeft % 60

     return `${minutes.toString().padStart(2, "0")}:${seconds
       .toString()
       .padStart(2, "0")}`
  }

  const [showBreakSuggestion, setShowBreakSuggestion] = useState(false)
  const [breakMessage, setBreakMessage] = useState("")

  useEffect(() => {
    const storedLanguage = localStorage.getItem("preferredLanguage") as "en" | "hi" | "te" | null
    if (storedLanguage) {
      setLanguage(storedLanguage)
    }
  }, [])

  useEffect(() => {
    if (!isRunning) return

    const interval = setInterval(() => {
       setTimeLeft((prev) => {
         if (prev <= 1) {
           setIsRunning(false)

           setBreakMessage(
              `You completed a ${sessionLength}-minute study session. Consider taking a short break, stretching, or drinking water.`
           )

           setShowBreakSuggestion(true)

           return 0
         }

         setStudyTime((prevStudy) => prevStudy + 1)

         return prev - 1
       })
     }, 1000)

    return () => clearInterval(interval)
   }, [isRunning, sessionLength])


 

  // Auto-start emotion tracking immediately
  useEffect(() => {
    if (autoEmotionTracking) {
      // Force immediate emotion detection with a default emotion
      setTimeout(() => {
        const emotionData: EmotionData = {
          timestamp: new Date(),
          emotion: 'focused',
          confidence: 85,
          faceDetected: true,
          fatigueScore: 20,
          attentionScore: 80
        };
        handleEmotionDetectedRef.current(emotionData);
      }, 100);
    }
  }, [autoEmotionTracking])

  // Update document title with current emotion
  useEffect(() => {
    if (emotionState) {
      // Update the document title with the current emotion
      const originalTitle = "VidyAI - Student Dashboard";
      document.title = `${originalTitle} | Emotion: ${emotionState.emotion.charAt(0).toUpperCase() + emotionState.emotion.slice(1)}`;

      // Reset title when component unmounts
      return () => {
        document.title = originalTitle;
      };
    }
  }, [emotionState])

  // Mock data for gamification
  const [studentLevel, setStudentLevel] = useState(5)
  const [currentXP, setCurrentXP] = useState(750)
  const [requiredXP, setRequiredXP] = useState(1000)

  // Check for level up whenever XP changes
  useEffect(() => {
    if (currentXP >= requiredXP) {
      // Level up
      setStudentLevel(prevLevel => prevLevel + 1);
      // Carry over excess XP
      const excessXP = currentXP - requiredXP;
      // Reset XP with excess carried over
      setCurrentXP(excessXP);
      // Increase required XP for next level (20% more)
      setRequiredXP(prevRequired => Math.round(prevRequired * 1.2));

      // Show level up notification
      toast({
        title: "Level Up!",
        description: `Congratulations! You've reached level ${studentLevel + 1}!`,
        variant: "default",
      });
    }
  }, [currentXP, requiredXP, studentLevel])
  const [showBadges, setShowBadges] = useState(false)
  const [selectedBadge, setSelectedBadge] = useState<any>(null)

  // Mock badge data
  const [badges, setBadges] = useState([
    {
      id: "quiz-bronze",
      type: "bronze" as BadgeType,
      category: "quiz" as BadgeCategory,
      name: "Quiz Novice",
      description: "Complete 1 quiz with a score of 60% or higher",
      xpReward: 50,
      isUnlocked: true,
      subject: "General"
    },
    {
      id: "quiz-silver",
      type: "silver" as BadgeType,
      category: "quiz" as BadgeCategory,
      name: "Quiz Apprentice",
      description: "Complete 3 quizzes with a score of 70% or higher",
      xpReward: 100,
      isUnlocked: true,
      subject: "General"
    },
    {
      id: "quiz-gold",
      type: "gold" as BadgeType,
      category: "quiz" as BadgeCategory,
      name: "Quiz Master",
      description: "Complete 5 quizzes with a score of 80% or higher",
      xpReward: 200,
      isUnlocked: false,
      subject: "General"
    },
    {
      id: "science-bronze",
      type: "bronze" as BadgeType,
      category: "subject" as BadgeCategory,
      name: "Science Novice",
      description: "Complete a Science quiz with 70% or higher",
      xpReward: 75,
      isUnlocked: true,
      subject: "Science"
    },
    {
      id: "math-bronze",
      type: "bronze" as BadgeType,
      category: "subject" as BadgeCategory,
      name: "Math Novice",
      description: "Complete a Math quiz with 70% or higher",
      xpReward: 75,
      isUnlocked: false,
      subject: "Math"
    },
    {
      id: "flashcard-bronze",
      type: "bronze" as BadgeType,
      category: "flashcard" as BadgeCategory,
      name: "Flashcard Beginner",
      description: "Review 10 flashcards",
      xpReward: 30,
      isUnlocked: true
    },
    {
      id: "flashcard-silver",
      type: "silver" as BadgeType,
      category: "flashcard" as BadgeCategory,
      name: "Flashcard Enthusiast",
      description: "Review 50 flashcards",
      xpReward: 100,
      isUnlocked: false
    },
    {
      id: "streak-bronze",
      type: "bronze" as BadgeType,
      category: "streak" as BadgeCategory,
      name: "3-Day Streak",
      description: "Log in for 3 consecutive days",
      xpReward: 30,
      isUnlocked: true
    },
    {
      id: "streak-silver",
      type: "silver" as BadgeType,
      category: "streak" as BadgeCategory,
      name: "7-Day Streak",
      description: "Log in for 7 consecutive days",
      xpReward: 100,
      isUnlocked: true
    },
    {
      id: "streak-gold",
      type: "gold" as BadgeType,
      category: "streak" as BadgeCategory,
      name: "30-Day Streak",
      description: "Log in for 30 consecutive days",
      xpReward: 300,
      isUnlocked: false
    }
  ])

  // Load user data from localStorage
  useEffect(() => {
    const loadUser = () => {
      try {
        const userData = localStorage.getItem("demoUser")
        if (userData) {
          const parsedUser = JSON.parse(userData)
          console.log("Loaded user data:", parsedUser)
          setUser(parsedUser)
        } else {
          // If no user data, redirect to login
          router.push("/student-login")
        }
      } catch (error) {
        console.error("Error loading user data:", error)
        router.push("/student-login")
      }
    }

    loadUser()
  }, [router])

  // Check redirect actions from Learning Brain
  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const startQuiz = searchParams.get("startQuiz");
      const startTutor = searchParams.get("startTutor");
      const startFlashcards = searchParams.get("startFlashcards");
      const conceptId = searchParams.get("conceptId");
      const subject = searchParams.get("subject");

      if (startQuiz === "true") {
        if (subject && subject !== "general" && subject !== "all") {
          setActiveQuizSubject(subject);
        }
        if (conceptId) {
          const graph = LearningMemoryService.getConceptGraph(user?.id || "S001");
          const node = graph.find(n => n.id === conceptId);
          if (node) {
            setActiveQuizTopic(node.name);
            setShowQuizAi(true);
          }
        }
        setShowQuiz(true);
        window.history.replaceState({}, document.title, window.location.pathname);
      } else if (startTutor === "true") {
        setShowAiTutor(true);
        window.history.replaceState({}, document.title, window.location.pathname);
      } else if (startFlashcards === "true") {
        if (subject && subject !== "general" && subject !== "all") {
          setActiveFlashcardSubject(subject);
        }
        if (conceptId) {
          const graph = LearningMemoryService.getConceptGraph(user?.id || "S001");
          const node = graph.find(n => n.id === conceptId);
          if (node) {
            setActiveFlashcardTopic(node.name);
            setShowFlashcardAi(true);
          }
        }
        setShowFlashcards(true);
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, [user]);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("demoUser")
    router.push("/")
  }

  // Mock leaderboard data
  const leaderboardEntries = [
    { id: "user1", name: "Rahul Singh", points: 850, rank: 1 },
    { id: "current", name: user?.name || "You", points: 750, rank: 2 },
    { id: "user2", name: "Ananya Patel", points: 720, rank: 3 },
    { id: "user3", name: "Vikram Mehta", points: 680, rank: 4 },
    { id: "user4", name: "Priya Sharma", points: 650, rank: 5 },
  ]

  // Mock quiz data
  const quizQuestion = {
    question: "What is the process by which plants make their own food using sunlight?",
    options: [
      { id: "a", text: "Respiration", isCorrect: false },
      { id: "b", text: "Photosynthesis", isCorrect: true },
      { id: "c", text: "Transpiration", isCorrect: false },
      { id: "d", text: "Germination", isCorrect: false },
    ],
    points: 20,
  }

  // Mock flashcard data
  const flashcardData = {
    front: "Photosynthesis",
    back: "The process by which green plants and some other organisms use sunlight to synthesize foods with the help of chlorophyll.",
    currentIndex: 0,
    totalCards: 10,
  }

  const translations = {
    welcome: {
      en: "Welcome, Rahul!",
      hi: "स्वागत है, राहुल!",
      te: "స్వాగతం, రాహుల్!",
    },
    dashboard: {
      en: "Student Dashboard",
      hi: "छात्र डैशबोर्ड",
      te: "విద్యార్థి డాష్‌బోర్డ్",
    },

    startLearning: {
      en: "Start Learning",
      hi: "सीखना शुरू करें",
      te: "నేర్చుకోవడం ప్రారంభించండి",
    },
    aiTutor: {
      en: "AI Tutor",
      hi: "AI ट्यूटर",
      te: "AI ట్యూటర్",
    },
    askQuestion: {
      en: "Ask a question",
      hi: "प्रश्न पूछें",
      te: "ప్రశ్న అడగండి",
    },
    quizzes: {
      en: "Quizzes",
      hi: "क्विज़",
      te: "క్విజ్‌లు",
    },
    startQuiz: {
      en: "Start Quiz",
      hi: "क्विज़ शुरू करें",
      te: "క్విజ్ ప్రారంభించండి",
    },
    flashcards: {
      en: "Flashcards",
      hi: "फ्लैशकार्ड",
      te: "ఫ్లాష్‌కార్డ్‌లు",
    },
    practice: {
      en: "Practice",
      hi: "अभ्यास",
      te: "ప్రాక్టీస్",
    },
    summaries: {
      en: "Summaries",
      hi: "सारांश",
      te: "సారాంశాలు",
    },
    viewSummaries: {
      en: "View Summaries",
      hi: "सारांश देखें",
      te: "సారాంశాలు చూడండి",
    },
    progress: {
      en: "Your Progress",
      hi: "आपकी प्रगति",
      te: "మీ పురోగతి",
    },
    points: {
      en: "points",
      hi: "अंक",
      te: "పాయింట్లు",
    },
    level: {
      en: "Level",
      hi: "स्तर",
      te: "లెవల్",
    },
    badges: {
      en: "Badges",
      hi: "बैज",
      te: "బ్యాడ్జ్‌లు",
    },
    streak: {
      en: "Day Streak",
      hi: "दिन की स्ट्रीक",
      te: "రోజు స్ట్రీక్",
    },
    achievements: {
      en: "Achievements",
      hi: "उपलब्धियां",
      te: "విజయాలు",
    },
    dailyChallenge: {
      en: "Daily Challenge",
      hi: "दैनिक चुनौती",
      te: "రోజువారీ ఛాలెంజ్",
    },
    logout: {
      en: "Logout",
      hi: "लॉगआउट",
      te: "లాగౌట్",
    },
    motionTracking: {
      en: "Motion Tracking",
      hi: "गति ट्रैकिंग",
      te: "మోషన్ ట్రాకింగ్",
    },
    motionTrackingDesc: {
      en: "Stay in frame for better learning experience",
      hi: "बेहतर सीखने के अनुभव के लिए फ्रेम में रहें",
      te: "మెరుగైన అభ్యాస అనుభవం కోసం ఫ్రేమ్‌లో ఉండండి",
    },
    startTracking: {
      en: "Start Tracking",
      hi: "ट्रैकिंग शुरू करें",
      te: "ట్రాకింగ్ ప్రారంభించండి",
    },
    outOfFrame: {
      en: "You are out of frame!",
      hi: "आप फ्रेम से बाहर हैं!",
      te: "మీరు ఫ్రేమ్ నుండి బయటకు వెళ్లారు!",
    },
    returnToFrame: {
      en: "Please return to the frame",
      hi: "कृपया फ्रेम में वापस आएं",
      te: "దయచేసి ఫ్రేమ్‌కి తిరిగి రండి",
    },
    dismiss: {
      en: "Dismiss",
      hi: "खारिज करें",
      te: "తోసిపుచ్చు",
    },
    voiceCommands: {
      en: ["Start learning", "Open AI tutor", "Start quiz", "View flashcards", "View summaries", "Start motion tracking", "Detect emotions", "Logout"],
      hi: ["सीखना शुरू करें", "AI ट्यूटर खोलें", "क्विज़ शुरू करें", "फ्लैशकार्ड देखें", "सारांश देखें", "गति ट्रैकिंग शुरू करें", "भावनाओं का पता लगाएं", "लॉगआउट"],
      te: ["నేర్చుకోవడం ప్రారంభించండి", "AI ట్యూటర్ తెరవండి", "క్విజ్ ప్రారంభించండి", "ఫ్లాష్‌కార్డ్‌లు చూడండి", "సారాంశాలు చూడండి", "చలనం ట్రాకింగ్ ప్రారంభించండి", "భావోద్వేగాలను గుర్తించండి", "లాగౌట్"],
    },
    congratulations: {
      en: "Congratulations!",
      hi: "बधाई हो!",
      te: "అభినందనలు!",
    },
  }

  const handleVoiceCommand = (command: string) => {
    const lowerCommand = command.toLowerCase()

    // Handle logout command
    if (lowerCommand.includes("logout") || lowerCommand.includes("लॉगआउट") || lowerCommand.includes("లాగౌట్")) {
      router.push("/")
    }

    // Handle AI tutor command
    if (lowerCommand.includes("tutor") || lowerCommand.includes("ट्यूटर") || lowerCommand.includes("ట్యూటర్")) {
      setShowAiTutor(true)
    }

    // Handle quiz command
    if (lowerCommand.includes("quiz") || lowerCommand.includes("क्विज़") || lowerCommand.includes("క్విజ్")) {
      setShowQuiz(true)
    }

    // Handle flashcard command
    if (lowerCommand.includes("flash") || lowerCommand.includes("फ्लैश") || lowerCommand.includes("ఫ్లాష్")) {
      setShowFlashcards(true)
    }

    // Handle motion tracking command
    if (lowerCommand.includes("motion") || lowerCommand.includes("tracking") ||
        lowerCommand.includes("गति") || lowerCommand.includes("చలనం")) {
      setShowMotionTracker(true)
    }

    // Handle emotion detection command
    if (lowerCommand.includes("emotion") || lowerCommand.includes("face") ||
        lowerCommand.includes("भावना") || lowerCommand.includes("భావోద్వేగం")) {
      setShowEmotionDetector(true)
    }

    console.log("Voice command received:", command)
  }

  // Handle quiz completion
  const handleQuizComplete = async (earned: number, total: number, percentageScore: number) => {
    setQuizScore({ earned, total });

    // Record quiz activity in personalized learning memory
    try {
      const quizTopic = activeQuizTopic || quizDetails.title;
      const conceptId = tagQuizTopicToConcept(quizTopic, activeQuizSubject || quizDetails.subject || "General");
      if (conceptId) {
        const confusion = emotionState?.emotion === "confused";
        LearningMemoryService.recordActivity(user?.id || "S001", conceptId, {
          activityType: "quiz",
          score: earned,
          total: total,
          confusionDetected: confusion,
          engagement: 90
        });
      }
    } catch (e) {
      console.error("Failed to record quiz in learning memory:", e);
    }

    // Calculate XP reward based on score percentage
    let xpReward = Math.round(earned / 2); // Base XP is half of points earned

    // Bonus XP for high scores
    if (percentageScore >= 90) {
      xpReward += 100; // Excellent performance bonus
    } else if (percentageScore >= 80) {
      xpReward += 50;  // Great performance bonus
    } else if (percentageScore >= 70) {
      xpReward += 25;  // Good performance bonus
    }

    // Update XP and potentially level
    const newXP = currentXP + xpReward;
    setCurrentXP(newXP);

    // Check if level up is needed
    if (newXP >= requiredXP) {
      setStudentLevel(studentLevel + 1);
    }

    // Check for badge unlocks based on the quiz performance
    const updatedBadges = [...badges];
    let badgeUnlocked = false;
    let unlockedBadge = null;

    // Check for subject-specific badges
    if (percentageScore >= 70) {
      const quizSubject = "Science"; // This would come from the actual quiz subject
      const subjectBadgeId = `${quizSubject.toLowerCase()}-bronze`;
      const subjectBadgeIndex = updatedBadges.findIndex(b => b.id === subjectBadgeId);

      if (subjectBadgeIndex !== -1 && !updatedBadges[subjectBadgeIndex].isUnlocked) {
        updatedBadges[subjectBadgeIndex].isUnlocked = true;
        badgeUnlocked = true;
        unlockedBadge = updatedBadges[subjectBadgeIndex];
      }
    }

    // Check for quiz mastery badges
    if (percentageScore >= 80) {
      const goldBadgeIndex = updatedBadges.findIndex(b => b.id === "quiz-gold");
      if (goldBadgeIndex !== -1 && !updatedBadges[goldBadgeIndex].isUnlocked) {
        updatedBadges[goldBadgeIndex].isUnlocked = true;
        badgeUnlocked = true;
        unlockedBadge = updatedBadges[goldBadgeIndex];
      }
    }

    setBadges(updatedBadges);

    // Update school portal with quiz completion
    try {
      const portalResponse = await updateSchoolPortal({
        studentId: "current-user", // In a real app, this would be the actual student ID
        activityType: 'quiz',
        activityDetails: {
          subject: "Science", // This would come from the actual quiz subject
          score: earned,
          totalScore: total,
          percentageScore,
          completed: true,
          timestamp: Date.now()
        }
      });

      console.log('School portal updated:', portalResponse);

      // Add any additional XP from the portal response
      if (portalResponse.xpAwarded) {
        const totalNewXP = newXP + portalResponse.xpAwarded;
        setCurrentXP(totalNewXP);

        // Check if additional XP causes level up
        if (totalNewXP >= requiredXP && newXP < requiredXP) {
          setStudentLevel(studentLevel + 1);
        }
      }
    } catch (error) {
      console.error('Failed to update school portal:', error);
    }

    // Show reward popup
    setTimeout(() => {
      if (percentageScore >= 50) {
        if (badgeUnlocked && unlockedBadge) {
          setSelectedBadge(unlockedBadge);
        }
        setShowReward(true);
      }
    }, 1000);
  }

  const handleQuizAnswer = (isCorrect: boolean) => {
    if (isCorrect) {
      // Show reward popup after a short delay
      setTimeout(() => {
        setShowReward(true)
      }, 1000)
    }
  }

  const handleFlashcardActions = {
    onNext: () => console.log("Next flashcard"),
    onPrevious: () => console.log("Previous flashcard"),
    onMarkKnown: () => {
      console.log("Marked as known")
      // Show reward popup
      setTimeout(() => {
        setShowReward(true)
      }, 500)
    },
    onMarkUnknown: () => console.log("Marked as still learning"),
    onSave: () => console.log("Saved for later"),
  }

  // Handle motion detection
  const handleMotionDetected = (motionData: MotionData) => {
    // Update last motion data
    setLastMotionData(motionData)

    // Set states based on actual detected motion data
    setUserInFrame(motionData.inFrame)
    setShowOutOfFrameWarning(!motionData.inFrame)

    // Award XP occasionally if in frame
    if (motionData.inFrame && Math.random() < 0.02) {
      // Award a small amount of XP for motion tracking
      setCurrentXP(prev => prev + 1)
    }
  }

  // Handle emotion detection
  const handleEmotionDetected = (emotionData: EmotionData) => {
    // Update last emotion data
    setLastEmotionData(emotionData)
    if (
       (emotionData?.fatigueScore ?? 0) > 75 ||
       (emotionData?.attentionScore ?? 100) < 30
    ) {
       setBreakMessage(
          "You seem tired. Consider taking a short break, stretching, or drinking water."
       )

       setShowBreakSuggestion(true)
       }
    console.log('Emotion detected:', emotionData)

    // Update emotion history
    if (emotionData.emotion !== 'unknown') {
      setEmotionHistory(prev => {
        const newHistory = [...prev, emotionData]
        // Keep only the last 10 emotions
        return newHistory.slice(-10)
      })
    }

    // Update emotion state for AI tutor with more detailed information
    const newEmotionState: EmotionState = {
      emotion: emotionData.emotion,
      fatigueScore: emotionData.fatigueScore,
      attentionScore: emotionData.attentionScore
    };

    // Only update if emotion has changed or scores have changed significantly
    const shouldUpdate =
      !emotionState ||
      emotionState.emotion !== newEmotionState.emotion ||
      Math.abs((emotionState.fatigueScore || 0) - (newEmotionState.fatigueScore || 0)) > 10 ||
      Math.abs((emotionState.attentionScore || 0) - (newEmotionState.attentionScore || 0)) > 10;

    if (shouldUpdate) {
      setEmotionState(newEmotionState);

      // Show floating emotion tracker for significant emotions
      if (autoEmotionTracking &&
          emotionData.emotion !== 'unknown' &&
          emotionData.confidence > 60 &&
          !showFloatingEmotionTracker &&
          !userDismissedEmotionTracker) {
        setShowFloatingEmotionTracker(true)
      }

      // Handle negative emotions
      if (autoEmotionTracking &&
          (emotionData.emotion === 'sad' ||
           emotionData.emotion === 'confused' ||
           emotionData.emotion === 'bored') &&
          emotionData.confidence > 70 &&
          !userDismissedEmotionTracker) {

        console.log('Detected negative emotion:', emotionData.emotion, 'with confidence:', emotionData.confidence);
        // Show emotion display with feedback
        if (!showEmotionDisplay && !showFloatingEmotionTracker) {
          setShowEmotionDisplay(true)
        }
      }

      // Handle fatigue detection
      if (autoEmotionTracking &&
          emotionData.fatigueScore !== undefined &&
          emotionData.fatigueScore > 75 &&
          emotionData.confidence > 60 &&
          !userDismissedEmotionTracker) {

        console.log('Detected high fatigue:', emotionData.fatigueScore, 'with confidence:', emotionData.confidence);
        // Show emotion display with feedback
        if (!showEmotionDisplay && !showFloatingEmotionTracker) {
          setShowEmotionDisplay(true)
        }
      }

      // Handle attention level
      if (emotionData.attentionScore !== undefined &&
          emotionData.attentionScore < 30 &&
          emotionData.confidence > 60 &&
          !userDismissedEmotionTracker) {

        // Low attention might need intervention or a change of pace
        console.log('Low attention detected. Consider changing the learning activity.');
        // Show emotion display with feedback
        if (!showEmotionDisplay && !showFloatingEmotionTracker) {
          setShowEmotionDisplay(true)
        }
      }
    }
  }

  const handleEmotionDetectedRef = useRef(handleEmotionDetected)
  useEffect(() => {
    handleEmotionDetectedRef.current = handleEmotionDetected
  })
  // Dynamic card content calculations based on syllabus and subject
  const getQuizDetails = () => {
    if (dashboardSubject === "all") {
      const questionsCount = allQuizQuestions.filter(
        q => q.syllabus === selectedSyllabus || q.syllabus === "General"
      ).length
      return {
        title: "All Subjects Quiz",
        countText: `${questionsCount} questions available`,
        timeText: `${Math.round(questionsCount * 1.5)} min`,
        subject: undefined
      }
    } else {
      const questionsCount = allQuizQuestions.filter(
        q => q.subject === dashboardSubject && (q.syllabus === selectedSyllabus || q.syllabus === "General")
      ).length
      return {
        title: `${dashboardSubject} Quiz`,
        countText: `${questionsCount} questions`,
        timeText: `${Math.round(questionsCount * 1.5)} min`,
        subject: dashboardSubject
      }
    }
  }

  const getFlashcardDetails = () => {
    if (dashboardSubject === "all") {
      const cardsCount = allFlashcards.filter(
        c => c.syllabus === selectedSyllabus || c.syllabus === "General"
      ).length
      return {
        title: "All Concepts",
        countText: `${cardsCount} cards available`,
        timeText: `${Math.round(cardsCount * 0.7)} min`,
        subject: "all"
      }
    } else {
      const cardsCount = allFlashcards.filter(
        c => c.subject === dashboardSubject && (c.syllabus === selectedSyllabus || c.syllabus === "General")
      ).length
      return {
        title: `${dashboardSubject} Concepts`,
        countText: `${cardsCount} cards`,
        timeText: `${Math.round(cardsCount * 0.7)} min`,
        subject: dashboardSubject
      }
    }
  }

  const getSummaryDetails = () => {
    if (dashboardSubject === "all") {
      const summariesCount = allSummaries.filter(
        s => s.syllabus === selectedSyllabus || s.syllabus === "General"
      ).length
      return {
        title: "All Notes",
        countText: `${summariesCount} summaries available`,
        timeText: `${summariesCount * 5} min`,
        subject: "all"
      }
    } else {
      const summariesCount = allSummaries.filter(
        s => s.subject === dashboardSubject && (s.syllabus === selectedSyllabus || s.syllabus === "General")
      ).length
      return {
        title: `${dashboardSubject} Notes`,
        countText: `${summariesCount} summaries`,
        timeText: `${summariesCount * 5} min`,
        subject: dashboardSubject
      }
    }
  }

  const quizDetails = getQuizDetails()
  const flashcardDetails = getFlashcardDetails()
  const summaryDetails = getSummaryDetails()

  return (
    <main className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white dark:bg-card border-b border-border dark:border-border shadow-sm">
        <div className="container flex items-center justify-between h-16 px-4">
          <div
            className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 p-2 rounded-lg transition-colors"
            onClick={() => setShowStudentDetails(true)}
          >
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              {user?.avatar ? (
                <div className="text-xl">{user.avatar}</div>
              ) : (
                <User size={20} className="text-primary" />
              )}
            </div>
            <div>
              <h1 className="text-sm font-medium text-foreground/70">{translations.dashboard[language]}</h1>
              <p className="text-lg font-bold">
                {user?.name ? `Welcome, ${user.name.split(' ')[0]}!` : translations.welcome[language]}
              </p>
              {user?.class && (
                <p className="text-xs text-muted-foreground">{user.class}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={handleLogout} className="text-foreground/70">
              <LogOut size={20} />
              <span className="sr-only">{translations.logout[language]}</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Sidebar Navigation */}
      <div className="fixed left-0 top-0 bottom-0 w-16 bg-white dark:bg-card border-r border-border dark:border-border shadow-md hidden md:flex flex-col items-center py-6 gap-6 z-20">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
          {user?.avatar ? (
            <div className="text-xl">{user.avatar}</div>
          ) : (
            <BookOpen size={20} className="text-primary" />
          )}
        </div>

        <div className="flex-1 flex flex-col items-center gap-4 mt-8">
          <Button
            variant="ghost"
            size="icon"
            className="text-primary relative group"
            onClick={() => document.getElementById('dashboard-section')?.scrollIntoView({ behavior: 'smooth' })}
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
            onClick={() => {
              setActiveQuizSubject(undefined)
              setShowQuiz(true)
            }}
          >
            <Goal size={20} />
            <span className="sr-only">{translations.quizzes[language]}</span>
            <div className="absolute left-full ml-2 px-2 py-1 bg-foreground text-background text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity">
              {translations.quizzes[language]}
            </div>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="relative group"
            onClick={() => setShowFlashcards(true)}
          >
            <FileText size={20} />
            <span className="sr-only">{translations.flashcards[language]}</span>
            <div className="absolute left-full ml-2 px-2 py-1 bg-foreground text-background text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity">
              {translations.flashcards[language]}
            </div>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="relative group"
            onClick={() => setShowSummaries(true)}
          >
            <BookOpen size={20} />
            <span className="sr-only">{translations.summaries[language]}</span>
            <div className="absolute left-full ml-2 px-2 py-1 bg-foreground text-background text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity">
              {translations.summaries[language]}
            </div>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="relative group"
            onClick={() => setShowAiTutor(true)}
          >
            <MessageSquare size={20} />
            <span className="sr-only">AI Tutor</span>
            <div className="absolute left-full ml-2 px-2 py-1 bg-foreground text-background text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity">
              AI Tutor
            </div>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="relative group text-indigo-600 dark:text-indigo-400"
            onClick={() => router.push('/learning-brain')}
          >
            <Brain size={20} />
            <span className="sr-only">My Learning Brain</span>
            <div className="absolute left-full ml-2 px-2 py-1 bg-foreground text-background text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity">
              My Learning Brain
            </div>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="relative group"
            onClick={() => document.getElementById('achievements-section')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <Trophy size={20} />
            <span className="sr-only">Achievements</span>
            <div className="absolute left-full ml-2 px-2 py-1 bg-foreground text-background text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity">
              Achievements
            </div>
          </Button>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          className="text-foreground/70 relative group"
        >
          <LogOut size={20} />
          <span className="sr-only">Logout</span>
          <div className="absolute left-full ml-2 px-2 py-1 bg-foreground text-background text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity">
            Logout
          </div>
        </Button>
      </div>

      {/* Main Content */}
      <div className="container px-4 py-6 space-y-8 md:ml-16">
        {/* Level Progress */}
        <div id="dashboard-section">
          <LevelProgress level={studentLevel} currentXP={currentXP} requiredXP={requiredXP} language={language} />
        </div>

        {/* Daily Challenge */}
        <Card className="border-red-300">
           <CardHeader>
             <CardTitle className="flex items-center gap-2">
                 🍅 Pomodoro Study Timer
             </CardTitle>
           </CardHeader>

           <CardContent>
             <div className="flex gap-2 mb-4">

               <Button
                  variant="outline"
                  onClick={() => {
                      setIsRunning(false)
                      setSessionLength(25)
                      setTimeLeft(25 * 60)
                   }}
              >
                   25 Min
              </Button>

               <Button
                  variant="outline"
                  onClick={() => {
                      setIsRunning(false)
                      setSessionLength(30)
                      setTimeLeft(30 * 60)
                  }}
               >
                   30 Min
              </Button>

              <Button
                  variant="outline"
                  onClick={() => {
                      setIsRunning(false)
                      setSessionLength(45)
                      setTimeLeft(45 * 60)
                   }}
              >
                   45 Min
               </Button>

            </div>

              <p className="text-3xl font-bold">
                 {formatStudyTime()}
              </p>
             

             <Button
                 className="mt-4"
                 onClick={() => setIsRunning(true)}
             >
                 Start Session
             </Button>
             <Button
                   variant="outline"
                   className="ml-3 bg-pink-500 hover:bg-pink-600 text-white"
                   onClick={() => setIsRunning(false)}
             >
                   Stop Session
             </Button>
             <Button
                    variant="outline"
                    className="ml-3 bg-pink-500 hover:bg-pink-600 text-white"
                    onClick={() => {
                       setIsRunning(false)
                       setTimeLeft(sessionLength * 60)
                       setStudyTime(0)
                       setShowBreakSuggestion(false)

                  }}
             >
                 Reset Session
             </Button>
             
          </CardContent>
        </Card>

        {
          showBreakSuggestion && (
           <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20">
             <CardHeader>
               <CardTitle className="flex items-center gap-2">
                 <AlertTriangle size={18} />
                  Smart Break Suggestion
                </CardTitle>
             </CardHeader>

            <CardContent>
               <p>{breakMessage}</p>

               <Button
                 className="mt-3"
                 onClick={() => setShowBreakSuggestion(false)}
               >
                 Got It
                </Button>
             </CardContent>
           </Card>
          )
       }
        <DailyChallenge
          title="Science Challenge"
          description="Complete a quiz about photosynthesis and earn bonus XP!"
          xpReward={50}
          timeLeft="8h 45m"
          progress={0}
          language={language}
          onStart={() => {
            setActiveQuizSubject("Science")
            setShowQuiz(true)
          }}
        />

        {/* Learning Filters Card */}
        <Card className="border border-border/50 shadow-sm bg-card p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Syllabus Selection */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen size={14} className="text-primary" />
                Syllabus
              </h3>
              <div className="flex flex-wrap gap-2">
                {(["General", "CBSE", "AP", "Telangana"] as const).map((syll) => (
                  <Button
                    key={syll}
                    variant={selectedSyllabus === syll ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedSyllabus(syll)}
                    className="rounded-full px-4 h-9 text-xs font-medium transition-all"
                  >
                    {syll}
                  </Button>
                ))}
              </div>
            </div>

            {/* Subject Selection */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Brain size={14} className="text-secondary" />
                Subject Selection
              </h3>
              <div className="flex flex-wrap gap-2">
                {["all", "Science", "Math", "English", "Social Studies"].map((subj) => (
                  <Button
                    key={subj}
                    variant={dashboardSubject === subj ? "default" : "outline"}
                    size="sm"
                    onClick={() => setDashboardSubject(subj)}
                    className={`rounded-full px-4 h-9 text-xs font-medium transition-all ${
                      dashboardSubject === subj
                        ? "bg-secondary text-secondary-foreground hover:bg-secondary/90"
                        : ""
                    }`}
                  >
                    {subj === "all" ? "All Subjects" : subj}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Learning Section */}
        <section>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Brain size={20} className="text-secondary" />
            {translations.startLearning[language]}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* AI Tutor Card */}
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Card className="overflow-hidden border-2 border-primary/50 dark:border-primary/40 shadow-md h-full bg-card dark:bg-card text-card-foreground dark:text-card-foreground">
                <CardHeader className="bg-primary/10 dark:bg-primary/20 pb-2">
                  <CardTitle className="flex items-center gap-2 text-primary">
                    <MessageSquare size={18} />
                    {translations.aiTutor[language]}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3 mb-4">
                    <ChatbotIcon className="w-12 h-12" />
                    <p className="text-sm text-foreground/70 dark:text-foreground/80">Ask questions and get instant help</p>
                  </div>
                  <Button className="w-full bg-primary hover:bg-primary/90" onClick={() => setShowAiTutor(true)}>
                    {translations.askQuestion[language]}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quizzes Card */}
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Card className="overflow-hidden border-2 border-secondary/50 shadow-md h-full">
                <CardHeader className="bg-secondary/10 pb-2">
                  <CardTitle className="flex items-center gap-2 text-secondary">
                    <Goal size={18} />
                    {translations.quizzes[language]}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center">
                        <Star size={16} className="text-secondary" />
                      </div>
                      <div className="text-sm">
                        <p className="font-medium">{quizDetails.title}</p>
                        <p className="text-foreground/70">{quizDetails.countText}</p>
                      </div>
                    </div>
                    <div className="text-xs font-medium text-foreground/50">
                      <Clock size={14} className="inline mr-1" />
                      {quizDetails.timeText}
                    </div>
                  </div>
                  <Button 
                    className="w-full bg-secondary hover:bg-secondary/90" 
                    onClick={() => {
                      setActiveQuizSubject(quizDetails.subject)
                      setShowQuiz(true)
                    }}
                  >
                    {translations.startQuiz[language]}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Flashcards Card */}
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Card className="overflow-hidden border-2 border-accent/50 shadow-md h-full">
                <CardHeader className="bg-accent/10 pb-2">
                  <CardTitle className="flex items-center gap-2 text-accent">
                    <FileText size={18} />
                    {translations.flashcards[language]}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                        <Star size={16} className="text-accent" />
                      </div>
                      <div className="text-sm">
                        <p className="font-medium">{flashcardDetails.title}</p>
                        <p className="text-foreground/70">{flashcardDetails.countText}</p>
                      </div>
                    </div>
                    <div className="text-xs font-medium text-foreground/50">
                      <Clock size={14} className="inline mr-1" />
                      {flashcardDetails.timeText}
                    </div>
                  </div>
                  <Button className="w-full bg-accent hover:bg-accent/90" onClick={() => setShowFlashcards(true)}>
                    {translations.practice[language]}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Summaries Card */}
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Card className="overflow-hidden border-2 border-highlight/50 shadow-md h-full">
                <CardHeader className="bg-highlight/10 pb-2">
                  <CardTitle className="flex items-center gap-2 text-highlight">
                    <BookOpen size={18} />
                    {translations.summaries[language]}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-highlight/20 flex items-center justify-center">
                        <Star size={16} className="text-highlight" />
                      </div>
                      <div className="text-sm">
                        <p className="font-medium">{summaryDetails.title}</p>
                        <p className="text-foreground/70">{summaryDetails.countText}</p>
                      </div>
                    </div>
                    <div className="text-xs font-medium text-foreground/50">
                      <Clock size={14} className="inline mr-1" />
                      {summaryDetails.timeText}
                    </div>
                  </div>
                  <Button
                    className="w-full bg-highlight hover:bg-highlight/90"
                    onClick={() => setShowSummaries(true)}
                  >
                    {translations.viewSummaries[language]}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Motion Detection Button */}
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Activity size={20} className="text-primary" />
              {translations.motionTracking ? translations.motionTracking[language] : "Motion Detection"}
            </h2>
            <Button
              variant="default"
              size="sm"
              onClick={() => setShowMotionTracker(true)}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90"
            >
              <Camera size={16} />
              {(translations as any).openCamera ? (translations as any).openCamera[language] : "Start Camera"}
            </Button>
          </div>

          {/* Status display - always visible */}
            <Card className="bg-card dark:bg-card p-3 border border-primary/20">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-green-500 animate-pulse"></div>
                <div>
                  <p className="font-medium">
                    Motion Tracking {showMotionTracker ? "Active" : "Ready"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {showMotionTracker ?
                      "Camera is currently monitoring your presence" :
                      "Click 'Start Camera' to begin motion tracking"}
                  </p>
                </div>
              </div>
            </Card>
        </section>

        {/* Interactive Learning Tools Section */}
        <section className="space-y-4 mt-8">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Activity size={20} className="text-primary" />
            Interactive Learning Tools
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Face Emotion Card */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Card className="overflow-hidden border-2 border-secondary/50 dark:border-secondary/40 shadow-md h-full cursor-pointer bg-card dark:bg-card text-card-foreground dark:text-card-foreground">
                <CardHeader className="bg-secondary/10 dark:bg-secondary/20 pb-2">
                  <CardTitle className="flex items-center gap-2 text-secondary">
                    <Smile size={18} />
                    Emotion Detection
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-foreground/70 dark:text-foreground/80">
                      Analyze facial expressions to adapt learning content to your emotional state.
                    </p>
                    {lastEmotionData && (
                      <div className="flex items-center gap-2">
                        {lastEmotionData.emotion !== "unknown" && (
                          <Badge variant="outline" className="capitalize">
                            {lastEmotionData.emotion}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      className="w-full bg-secondary hover:bg-secondary/90"
                      onClick={() => setShowEmotionDisplay(true)}
                    >
                      View Emotions
                    </Button>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setUserDismissedEmotionTracker(false);
                          setAutoEmotionTracking(true);
                          // Force immediate emotion detection
                          setTimeout(() => {
                            const emotionData: EmotionData = {
                              timestamp: new Date(),
                              emotion: 'focused',
                              confidence: 85,
                              faceDetected: true,
                              fatigueScore: 20,
                              attentionScore: 80
                            };
                            handleEmotionDetectedRef.current(emotionData);
                          }, 100);
                        }}
                      >
                        Start Tracking
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setUserDismissedEmotionTracker(false);
                          setShowFloatingEmotionTracker(true);
                        }}
                      >
                        Show Tracker
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Achievements and Leaderboard Section */}
        <div id="achievements-section" className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Achievements */}
          <div className="md:col-span-2 space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Trophy size={20} className="text-secondary" />
              {translations.achievements[language]}
            </h2>

            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Achievements</h3>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                onClick={() => setShowBadges(!showBadges)}
              >
                <Award size={14} />
                {showBadges ? "Hide Badges" : "View Badges"}
              </Button>
            </div>

            {showBadges ? (
              <BadgeCollection
                badges={badges}
                onBadgeClick={(badge) => {
                  setSelectedBadge(badge);
                  setShowReward(true);
                }}
                language={language}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <AchievementCard
                  title="Quiz Master"
                  description="Complete 5 quizzes with a score of 80% or higher"
                  icon={<CheckCircle size={18} />}
                  isUnlocked={badges.find(b => b.id === "quiz-gold")?.isUnlocked || false}
                  progress={badges.filter(b => b.category === "quiz" && b.isUnlocked).length}
                  maxProgress={5}
                  xpReward={100}
                  onClick={() => {
                    setSelectedBadge(badges.find(b => b.id === "quiz-gold"));
                    setShowReward(true);
                  }}
                />

                <AchievementCard
                  title="Knowledge Seeker"
                  description="Use the AI tutor 10 times to learn new concepts"
                  icon={<MessageSquare size={18} />}
                  isUnlocked={false}
                  progress={7}
                  maxProgress={10}
                  xpReward={150}
                />

                <AchievementCard
                  title="Flashcard Pro"
                  description="Review 50 flashcards"
                  icon={<FileText size={18} />}
                  isUnlocked={badges.find(b => b.id === "flashcard-silver")?.isUnlocked || false}
                  progress={badges.filter(b => b.category === "flashcard" && b.isUnlocked).length * 10}
                  maxProgress={50}
                  xpReward={75}
                />

                <AchievementCard
                  title="Consistent Learner"
                  description="Maintain a 7-day learning streak"
                  icon={<Clock size={18} />}
                  isUnlocked={badges.find(b => b.id === "streak-silver")?.isUnlocked || false}
                  progress={7}
                  maxProgress={7}
                  xpReward={50}
                  onClick={() => {
                    setSelectedBadge(badges.find(b => b.id === "streak-silver"));
                    setShowReward(true);
                  }}
                />
              </div>
            )}
          </div>

          {/* Leaderboard */}
          <div>
            <Leaderboard entries={leaderboardEntries} currentUserId="current" language={language} />
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-card border-t border-border dark:border-border shadow-md">
        <div className="container flex items-center justify-around h-16 px-4">
          <Button
            variant="ghost"
            className="flex flex-col items-center gap-1 h-auto py-2"
            onClick={() => router.push('/student-dashboard')}
          >
            <Home size={20} className="text-primary" />
            <span className="text-xs">Home</span>
          </Button>
          <Button
            variant="ghost"
            className="flex flex-col items-center gap-1 h-auto py-2"
            onClick={() => setShowLearningOptions(true)}
          >
            <BookOpen size={20} />
            <span className="text-xs">Learn</span>
          </Button>
          <Button
            variant="ghost"
            className="flex flex-col items-center gap-1 h-auto py-2"
            onClick={() => setShowAiTutor(true)}
          >
            <MessageSquare size={20} />
            <span className="text-xs">Chat</span>
          </Button>
          <Button
            variant="ghost"
            className="flex flex-col items-center gap-1 h-auto py-2 text-indigo-600 dark:text-indigo-400"
            onClick={() => router.push('/learning-brain')}
          >
            <Brain size={20} />
            <span className="text-xs">Brain</span>
          </Button>
          <Button
            variant="ghost"
            className="flex flex-col items-center gap-1 h-auto py-2"
            onClick={() => {
              setAutoEmotionTracking(!autoEmotionTracking);
              setShowEmotionDetector(!autoEmotionTracking);
            }}
          >
            <Smile size={20} color={autoEmotionTracking ? "#4f46e5" : undefined} />
            <span className="text-xs">{autoEmotionTracking ? "Tracking On" : "Tracking Off"}</span>
          </Button>
          <Button
            variant="ghost"
            className="flex flex-col items-center gap-1 h-auto py-2"
            onClick={() => router.push("/session-history")}
          >
            <TrendingUp size={20} />
            <span className="text-xs">History</span>
          </Button>
        </div>
      </div>

      {/* Voice Command Component */}
     <div className="fixed bottom-36 right-4 z-30">
        <VoiceCommand
          onCommand={handleVoiceCommand}
          language={language}
          availableCommands={translations.voiceCommands[language]}
          hideCommands={true}
        />
      </div>

      {/* AI Tutor Modal */}
      <AnimatePresence>
        {showAiTutor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-2xl"
            >
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-6 top-6 z-50 bg-white rounded-full"
                onClick={() => setShowAiTutor(false)}
              >
                <X size={18} />
              </Button>

              <AiTutorChat
                language={language}
                onClose={() => setShowAiTutor(false)}
                emotionState={emotionState}
                learningStyle={learningStyle}
                onLearningStyleUpdate={setLearningStyle}
                studentId={user?.id || "S001"}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quiz Modal */}
      <AnimatePresence>
        {showQuiz && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-2xl"
            >
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-6 top-6 z-50 bg-white dark:bg-slate-800 text-foreground dark:text-white rounded-full hover:bg-muted dark:hover:bg-slate-700"
                onClick={() => setShowQuiz(false)}
              >
                <X size={18} />
              </Button>

              <div className="bg-white dark:bg-card text-foreground dark:text-foreground p-6 rounded-xl shadow-lg max-h-[85vh] overflow-y-auto border border-border dark:border-border/50">
                <QuizContainer
                  questions={allQuizQuestions}
                  language={language}
                  syllabus={selectedSyllabus}
                  subject={activeQuizSubject}
                  defaultShowAiGenerator={showQuizAi}
                  defaultAiTopic={activeQuizTopic}
                  onComplete={handleQuizComplete}
                  onClose={() => {
                    setShowQuiz(false)
                    setActiveQuizSubject(undefined)
                    setActiveQuizTopic(undefined)
                    setShowQuizAi(false)
                  }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Flashcards Modal */}
      <AnimatePresence>
        {showFlashcards && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-2xl"
            >
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-6 top-6 z-50 bg-white dark:bg-slate-800 text-foreground dark:text-white rounded-full hover:bg-muted dark:hover:bg-slate-700"
                onClick={() => setShowFlashcards(false)}
              >
                <X size={18} />
              </Button>

              <div className="bg-white dark:bg-card text-foreground dark:text-foreground p-6 rounded-xl shadow-lg max-h-[85vh] overflow-y-auto border border-border dark:border-border/50">
                <FlashcardDeck
                  cards={allFlashcards}
                  language={language}
                  syllabus={selectedSyllabus}
                  subject={activeFlashcardSubject || flashcardDetails.subject}
                  defaultShowAiGenerator={showFlashcardAi}
                  defaultAiTopic={activeFlashcardTopic}
                  onClose={() => {
                    setShowFlashcards(false)
                    setActiveFlashcardSubject(undefined)
                    setActiveFlashcardTopic(undefined)
                    setShowFlashcardAi(false)
                    // Log flashcard activity to Personalized Learning Memory
                    try {
                      const subj = activeFlashcardSubject || flashcardDetails.subject;
                      if (subj && subj !== "all") {
                        const conceptId = tagFlashcardToConcept(activeFlashcardTopic || subj, subj);
                        if (conceptId) {
                          const confusion = emotionState?.emotion === "confused";
                          LearningMemoryService.recordActivity(user?.id || "S001", conceptId, {
                            activityType: "flashcard",
                            isKnown: true,
                            confusionDetected: confusion,
                            engagement: 80
                          });
                        }
                      }
                    } catch (e) {
                      console.error("Failed to record flashcard activity in learning memory:", e);
                    }
                  }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summaries Modal */}
      <AnimatePresence>
        {showSummaries && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-3xl"
            >
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-6 top-6 z-50 bg-white dark:bg-slate-800 text-foreground dark:text-white rounded-full hover:bg-muted dark:hover:bg-slate-700"
                onClick={() => setShowSummaries(false)}
              >
                <X size={18} />
              </Button>

              <div className="bg-white dark:bg-card text-foreground dark:text-foreground p-6 rounded-xl shadow-lg max-h-[85vh] overflow-y-auto border border-border dark:border-border/50">
                <StudySummaries
                  summaries={allSummaries}
                  language={language}
                  syllabus={selectedSyllabus}
                  subject={summaryDetails.subject === "all" ? undefined : summaryDetails.subject}
                  onClose={() => setShowSummaries(false)}
                  onTriggerQuiz={(subject, topic) => {
                    setShowSummaries(false)
                    setActiveQuizSubject(subject)
                    setActiveQuizTopic(topic)
                    setShowQuizAi(true)
                    setShowQuiz(true)
                  }}
                  onTriggerFlashcards={(subject, topic) => {
                    setShowSummaries(false)
                    setActiveFlashcardSubject(subject)
                    setActiveFlashcardTopic(topic)
                    setShowFlashcardAi(true)
                    setShowFlashcards(true)
                  }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Motion Tracker - Side Panel */}
      <AnimatePresence>
        {showMotionTracker && (
          <motion.div
            initial={{ opacity: 0, x: -300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            className="fixed top-20 left-0 bottom-4 z-40 shadow-xl"
          >
            <div className="relative bg-white dark:bg-card rounded-tr-lg rounded-br-lg overflow-hidden border border-l-0 border-border dark:border-border w-80 h-full flex flex-col">
              <div className="flex items-center justify-between p-2 bg-primary/10 dark:bg-primary/20">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-xs font-medium">Motion Tracking Active</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-full"
                  onClick={() => setShowMotionTracker(false)}
                >
                  <X size={12} />
                </Button>
              </div>

              <div className="p-3 flex-1 overflow-y-auto">
                <ImprovedMotionDetector
                  onMotionDetected={handleMotionDetected}
                  autoTracking={true}
                  language={language}
                  showCamera={true}
                  className="rounded-lg overflow-hidden"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Face Emotion Detector - Side Panel */}
      <AnimatePresence>
        {showEmotionDetector && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed top-20 right-0 bottom-4 z-40 shadow-xl"
          >
            <div className="relative bg-white dark:bg-card rounded-tl-lg rounded-bl-lg overflow-hidden border border-r-0 border-border dark:border-border w-80 h-full flex flex-col">
              <div className="flex items-center justify-between p-2 bg-secondary/10 dark:bg-secondary/20">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-xs font-medium">Emotion Tracking Active</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-full"
                  onClick={() => {
                    setShowEmotionDetector(false);
                    setAutoEmotionTracking(false);
                  }}
                >
                  <X size={12} />
                </Button>
              </div>

              <div className="p-3 flex-1 overflow-y-auto">
                <ImprovedEmotionDetector
                  onEmotionDetected={(data) => handleEmotionDetectedRef.current(data)}
                  autoTracking={true}
                  showControls={false}
                  language={language}
                  showCamera={true}
                  className="rounded-lg overflow-hidden"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Learning Options Menu */}
      <AnimatePresence>
        {showLearningOptions && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <LearningOptionsMenu
              onClose={() => setShowLearningOptions(false)}
              onSelectQuiz={() => {
                setShowLearningOptions(false)
                setActiveQuizSubject(undefined)
                setShowQuiz(true)
              }}
              onSelectFlashcards={() => {
                setShowLearningOptions(false)
                setShowFlashcards(true)
              }}
              onSelectSummaries={() => {
                setShowLearningOptions(false)
                setShowSummaries(true)
              }}
              onSelectTextbooks={() => {
                setShowLearningOptions(false)
                setShowTextbooks(true)
              }}
              onSelectMindMap={() => {
                setShowLearningOptions(false)
                setActiveMindMapTopic("Photosynthesis")
                setActiveMindMapSubject("Science")
                setShowMindMap(true)
              }}
              language={language}
            />
          </div>
        )}
      </AnimatePresence>

      {/* Textbooks Modal */}
      <AnimatePresence>
        {showTextbooks && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-card rounded-xl shadow-lg border border-border dark:border-border w-full max-w-4xl overflow-hidden p-6"
            >
              <Textbooks
                textbooks={sampleTextbooks}
                onClose={() => setShowTextbooks(false)}
                language={language}
                syllabus={selectedSyllabus}
              />
            </motion.div>
</motion.div>
        )}
      </AnimatePresence>

      {/* Mind Map Modal */}
      <AnimatePresence>
        {showMindMap && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-3xl relative"
            >
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-4 z-50 bg-white/80 dark:bg-slate-800 rounded-full"
                onClick={() => setShowMindMap(false)}
              >
                <X size={18} />
              </Button>

              <div className="bg-white dark:bg-card p-6 rounded-xl shadow-lg max-h-[85vh] overflow-y-auto">
                <MindMap
                  data={getMindMapData(activeMindMapTopic, activeMindMapSubject)}
                  title={`${activeMindMapTopic} Concept Map`}
                  language={language}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Emotion Display Modal */}
      <AnimatePresence mode="wait">
        {showEmotionDisplay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            key="emotion-display-modal"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-card rounded-xl shadow-lg border border-border dark:border-border w-full max-w-md overflow-hidden relative"
            >
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2 z-50 bg-white/80 dark:bg-background/80 rounded-full h-6 w-6"
                onClick={() => setShowEmotionDisplay(false)}
              >
                <X size={14} />
              </Button>

              <EmotionDisplay
                emotionData={lastEmotionData}
                showHeader={true}
                showControls={true}
                onClose={() => setShowEmotionDisplay(false)}
                language={language}
                showEmotionHistory={true}
                emotionHistory={emotionHistory}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Emotion Tracker */}
      <AnimatePresence>
        {showFloatingEmotionTracker && (
          <FloatingEmotionTracker
            lastEmotionData={lastEmotionData}
            onClose={() => {
              setShowFloatingEmotionTracker(false);
              setUserDismissedEmotionTracker(true);
            }}
            language={language}
          />
        )}
      </AnimatePresence>

      {/* Hidden Face Emotion Detector for background processing */}
      {autoEmotionTracking && (
        <div style={{ position: 'fixed', bottom: '-1px', right: '-1px', width: '1px', height: '1px', overflow: 'hidden', opacity: 0.01, pointerEvents: 'none' }}>
          <SimpleEmotionDetector
            onEmotionDetected={(data) => {
              const emotionData: EmotionData = {
                timestamp: data.timestamp,
                emotion: data.emotion,
                confidence: data.confidence,
                faceDetected: data.faceDetected,
                fatigueScore: data.fatigueScore,
                attentionScore: data.attentionScore
              }
              handleEmotionDetectedRef.current(emotionData)
            }}
            autoTracking={true}
            showControls={false}
            language={language}
          />
        </div>
      )}

      {/* Student Details Dialog */}
      <StudentDetailsDialog 
        open={showStudentDetails} 
        onOpenChange={setShowStudentDetails} 
        initialProfile={learningStyle} 
        onProfileUpdate={setLearningStyle} 
      />

      {/* Out of Frame Warning */}
      <AnimatePresence>
        {showOutOfFrameWarning && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-destructive text-destructive-foreground dark:bg-destructive/90 dark:text-destructive-foreground px-6 py-3 rounded-lg shadow-lg flex items-center gap-3"
          >
            <div className="bg-destructive-foreground/20 p-2 rounded-full">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">{translations.outOfFrame[language]}</h3>
              <p>{translations.returnToFrame[language]}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="ml-2 bg-destructive-foreground/10 border-destructive-foreground/30 hover:bg-destructive-foreground/20"
              onClick={() => setShowOutOfFrameWarning(false)}
            >
              {translations.dismiss ? translations.dismiss[language] : "Dismiss"}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reward Popup */}
      {showReward && (
        <RewardPopup 
          open={showReward} 
          onOpenChange={setShowReward} 
          xpEarned={quizScore.earned * 5} 
          badgeUnlocked={selectedBadge} 
        />
      )}

      {/* Mobile Sticky Tab Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-card border-t border-border shadow-lg flex justify-around items-center h-16 md:hidden z-30 px-2">
        <Button variant="ghost" className="flex flex-col items-center gap-1 h-auto py-2 flex-1" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <Home size={20} />
          <span className="text-xs">Home</span>
        </Button>
        <Button variant="ghost" className="flex flex-col items-center gap-1 h-auto py-2 flex-1" onClick={() => { setActiveQuizSubject(undefined); setShowQuiz(true); }}>
          <BookOpen size={20} />
          <span className="text-xs">Learn</span>
        </Button>
        <Button variant="ghost" className="flex flex-col items-center gap-1 h-auto py-2 flex-1 text-indigo-600 dark:text-indigo-400" onClick={() => router.push("/learning-brain")}>
          <Brain size={20} />
          <span className="text-xs">Brain</span>
        </Button>
        <Button variant="ghost" className="flex flex-col items-center gap-1 h-auto py-2 flex-1" onClick={() => setShowAiTutor(true)}>
          <MessageSquare size={20} />
          <span className="text-xs">Chat</span>
        </Button>
        {/* <Button variant="ghost" className="flex flex-col items-center gap-1 h-auto py-2 flex-1" onClick={() => router.push("/session-history")}>
          <TrendingUp size={20} />
          <span className="text-xs">History</span>
        </Button> */}
         <Button
            variant="ghost"
            className="flex flex-col items-center gap-1 h-auto py-2"
            onClick={() => {
              setAutoEmotionTracking(!autoEmotionTracking);
              setShowEmotionDetector(!autoEmotionTracking);
            }}
          >
            <Smile size={20} color={autoEmotionTracking ? "#4f46e5" : undefined} />
            <span className="text-xs">{autoEmotionTracking ? "Tracking On" : "Tracking Off"}</span>
          </Button>
          <Button
            variant="ghost"
            className="flex flex-col items-center gap-1 h-auto py-2"
            onClick={() => router.push("/session-history")}
          >
            <TrendingUp size={20} />
            <span className="text-xs">History</span>
          </Button>
      </nav>
    </main>
  )
}
