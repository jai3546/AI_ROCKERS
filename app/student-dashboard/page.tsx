"use client"

import { useState, useEffect } from "react"
import {
  BookOpen,
  Brain,
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
  Download,
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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { VoiceCommand } from "@/components/voice-command"
import { ChatbotIcon } from "@/components/chatbot-icon"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useTheme } from "next-themes"
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
  const [language, setLanguage] = useState<"en" | "hi" | "te">(() => {
    // Check if we're in the browser and get stored language or default to "en"
    if (typeof window !== "undefined") {
      const storedLanguage = localStorage.getItem("preferredLanguage") as "en" | "hi" | "te" | null
      return storedLanguage || "en"
    }
    return "en"
  })
  const [showAiTutor, setShowAiTutor] = useState(false)
  const [showQuiz, setShowQuiz] = useState(false)
  const [showFlashcards, setShowFlashcards] = useState(false)
  const [showSummaries, setShowSummaries] = useState(false)
  const [showLearningOptions, setShowLearningOptions] = useState(false)
  const [showTextbooks, setShowTextbooks] = useState(false)
  const [showReward, setShowReward] = useState(false)
  const [showMotionTracker, setShowMotionTracker] = useState(false)
  const [showEmotionDetector, setShowEmotionDetector] = useState(false)
  const [showEmotionDisplay, setShowEmotionDisplay] = useState(false)
  const [showFloatingEmotionTracker, setShowFloatingEmotionTracker] = useState(false)
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
  const [userInFrame, setUserInFrame] = useState(true)
  const [showOutOfFrameWarning, setShowOutOfFrameWarning] = useState(false)
  const [quizScore, setQuizScore] = useState({ earned: 0, total: 0 })
  const [showStudentDetails, setShowStudentDetails] = useState(false)

  // Auto-start emotion tracking immediately
  useEffect(() => {
    if (autoEmotionTracking) {
      // Force immediate emotion detection with a default emotion
      setTimeout(() => {
        const emotionData: EmotionData = {
          timestamp: Date.now(),
          emotion: 'focused',
          confidence: 85,
          fatigueScore: 20,
          attentionScore: 80
        };
        handleEmotionDetected(emotionData);
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
    motionTracking: {
      en: "Motion Detection",
      hi: "गति पहचान",
      te: "చలన గుర్తింపు",
    },
    motionTrackingDesc: {
      en: "Stay in frame for better learning experience.",
      hi: "बेहतर सीखने के अनुभव के लिए फ्रेम में रहें।",
      te: "మెరుగైన అభ్యాస అనుభవం కోసం ఫ్రేమ్‌లో ఉండండి.",
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
      if (badgeUnlocked && unlockedBadge) {
        setSelectedBadge(unlockedBadge);
      }
      setShowReward(true);
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

    // Always set user in frame to true
    setUserInFrame(true)
    setShowOutOfFrameWarning(false)

    // Award XP occasionally
    if (Math.random() < 0.02) {
      // Award a small amount of XP for motion tracking
      setCurrentXP(prev => prev + 1)
    }
  }

  // Handle emotion detection
  const handleEmotionDetected = (emotionData: EmotionData) => {
    // Update last emotion data
    setLastEmotionData(emotionData)
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
          !showFloatingEmotionTracker) {
        setShowFloatingEmotionTracker(true)
      }

      // Handle negative emotions
      if (autoEmotionTracking &&
          (emotionData.emotion === 'sad' ||
           emotionData.emotion === 'confused' ||
           emotionData.emotion === 'bored') &&
          emotionData.confidence > 70) {

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
          emotionData.confidence > 60) {

        console.log('Detected high fatigue:', emotionData.fatigueScore, 'with confidence:', emotionData.confidence);
        // Show emotion display with feedback
        if (!showEmotionDisplay && !showFloatingEmotionTracker) {
          setShowEmotionDisplay(true)
        }
      }

      // Handle attention level
      if (emotionData.attentionScore !== undefined &&
          emotionData.attentionScore < 30 &&
          emotionData.confidence > 60) {

        // Low attention might need intervention or a change of pace
        console.log('Low attention detected. Consider changing the learning activity.');
        // Show emotion display with feedback
        if (!showEmotionDisplay && !showFloatingEmotionTracker) {
          setShowEmotionDisplay(true)
        }
      }
    }
  }

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
            onClick={() => setShowQuiz(true)}
          >
            <BookOpen size={20} />
            <span className="sr-only">Learn</span>
            <div className="absolute left-full ml-2 px-2 py-1 bg-foreground text-background text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity">
              Learn
            </div>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="relative group"
            onClick={() => setShowFlashcards(true)}
          >
            <FileText size={20} />
            <span className="sr-only">Flashcards</span>
            <div className="absolute left-full ml-2 px-2 py-1 bg-foreground text-background text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity">
              Flashcards
            </div>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="relative group"
            onClick={() => setShowSummaries(true)}
          >
            <Download size={20} />
            <span className="sr-only">Summaries</span>
            <div className="absolute left-full ml-2 px-2 py-1 bg-foreground text-background text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity">
              Summaries
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
        <DailyChallenge
          title="Science Challenge"
          description="Complete a quiz about photosynthesis and earn bonus XP!"
          xpReward={50}
          timeLeft="8h 45m"
          progress={0}
          language={language}
          onStart={() => setShowQuiz(true)}
        />

        {/* Syllabus Selector */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium">Selected Syllabus:</h3>
          <div className="flex gap-2">
            <Button
              variant={selectedSyllabus === "AP" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedSyllabus("AP")}
            >
              AP
            </Button>
            <Button
              variant={selectedSyllabus === "Telangana" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedSyllabus("Telangana")}
            >
              Telangana
            </Button>
            <Button
              variant={selectedSyllabus === "CBSE" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedSyllabus("CBSE")}
            >
              CBSE
            </Button>
            <Button
              variant={selectedSyllabus === "General" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedSyllabus("General")}
            >
              General
            </Button>
          </div>
        </div>

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
                    <CheckCircle size={18} />
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
                        <p className="font-medium">Science Quiz</p>
                        <p className="text-foreground/70">10 questions</p>
                      </div>
                    </div>
                    <div className="text-xs font-medium text-foreground/50">
                      <Clock size={14} className="inline mr-1" />
                      15 min
                    </div>
                  </div>
                  <Button className="w-full bg-secondary hover:bg-secondary/90" onClick={() => setShowQuiz(true)}>
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
                        <p className="font-medium">Science Concepts</p>
                        <p className="text-foreground/70">15 cards</p>
                      </div>
                    </div>
                    <div className="text-xs font-medium text-foreground/50">
                      <Clock size={14} className="inline mr-1" />
                      10 min
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
                        <p className="font-medium">Science Notes</p>
                        <p className="text-foreground/70">3 summaries</p>
                      </div>
                    </div>
                    <div className="text-xs font-medium text-foreground/50">
                      <Clock size={14} className="inline mr-1" />5 min
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
              {translations.openCamera ? translations.openCamera[language] : "Start Camera"}
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
                          setAutoEmotionTracking(true);
                          // Force immediate emotion detection
                          setTimeout(() => {
                            const emotionData: EmotionData = {
                              timestamp: Date.now(),
                              emotion: 'focused',
                              confidence: 85,
                              fatigueScore: 20,
                              attentionScore: 80
                            };
                            handleEmotionDetected(emotionData);
                          }, 100);
                        }}
                      >
                        Start Tracking
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowFloatingEmotionTracker(true)}
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
            className="flex flex-col items-center gap-1 h-auto py-2"
            onClick={() => {
              setAutoEmotionTracking(!autoEmotionTracking);
              setShowEmotionDetector(!autoEmotionTracking);
            }}
          >
            <Smile size={20} color={autoEmotionTracking ? "#4f46e5" : undefined} />
            <span className="text-xs">{autoEmotionTracking ? "Tracking On" : "Tracking Off"}</span>
          </Button>
        </div>
      </div>

      {/* Voice Command Component */}
      <VoiceCommand
        onCommand={handleVoiceCommand}
        language={language}
        availableCommands={translations.voiceCommands[language]}
        hideCommands={true}
      />

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
                className="absolute right-6 top-6 z-50 bg-white rounded-full"
                onClick={() => setShowQuiz(false)}
              >
                <X size={18} />
              </Button>

              <div className="bg-white p-6 rounded-xl shadow-lg">
                <QuizContainer
                  questions={allQuizQuestions}
                  language={language}
                  syllabus={selectedSyllabus}
                  subject="Science"
                  onComplete={handleQuizComplete}
                  onClose={() => setShowQuiz(false)}
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
                className="absolute right-6 top-6 z-50 bg-white rounded-full"
                onClick={() => setShowFlashcards(false)}
              >
                <X size={18} />
              </Button>

              <div className="bg-white p-6 rounded-xl shadow-lg">
                <FlashcardDeck
                  cards={allFlashcards}
                  language={language}
                  syllabus={selectedSyllabus}
                  onClose={() => setShowFlashcards(false)}
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
                className="absolute right-6 top-6 z-50 bg-white rounded-full"
                onClick={() => setShowSummaries(false)}
              >
                <X size={18} />
              </Button>

              <div className="bg-white p-6 rounded-xl shadow-lg">
                <StudySummaries
                  summaries={allSummaries}
                  language={language}
                  syllabus={selectedSyllabus}
                  onClose={() => setShowSummaries(false)}
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
                  onEmotionDetected={handleEmotionDetected}
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
              {/* Add explicit close button at the top right */}
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
            onClose={() => setShowFloatingEmotionTracker(false)}
            language={language}
          />
        )}
      </AnimatePresence>

      {/* Hidden Face Emotion Detector for background processing */}
      {autoEmotionTracking && (
        <div style={{ position: 'fixed', bottom: '-1px', right: '-1px', width: '1px', height: '1px', overflow: 'hidden', opacity: 0.01, pointerEvents: 'none' }}>
          <SimpleEmotionDetector
            onEmotionDetected={(data) => {
              // Convert SimpleEmotionData to EmotionData
              const emotionData: EmotionData = {
                timestamp: data.timestamp.getTime(),
                emotion: data.emotion,
                confidence: data.confidence,
                fatigueScore: data.fatigueScore,
                attentionScore: data.attentionScore
              }
              handleEmotionDetected(emotionData)
            }}
            autoTracking={true}
            showControls={false}
            language={language}
          />
        </div>
      )}

      {/* Emotion Status Indicator - Disabled as requested */}
      {/* <EmotionStatusIndicator emotionState={emotionState} /> */}

      {/* Student Details Dialog */}
      <AnimatePresence>
        {showStudentDetails && (
          <StudentDetailsDialog
            student={user ? {
              ...user,
              email: "student@example.com",
              phone: "+91 9876543210",
              joinDate: "Sep 15, 2023",
              attendance: 92,
              performance: 85,
              subjects: [
                { name: "Mathematics", progress: 90, grade: "A" },
                { name: "Science", progress: 85, grade: "A-" },
                { name: "English", progress: 78, grade: "B+" },
                { name: "Social Studies", progress: 82, grade: "B+" },
              ],
              recentActivities: [
                { type: "quiz", name: "Science Quiz", date: "Today", score: 85 },
                { type: "flashcard", name: "Math Concepts", date: "Yesterday", completed: true },
                { type: "summary", name: "History Chapter 5", date: "3 days ago", completed: true },
                { type: "quiz", name: "English Grammar", date: "1 week ago", score: 92 },
              ]
            } : {
              id: "demo-student",
              name: "Demo Student",
              class: "Class 8",
              avatar: "👨‍🎓",
              email: "student@example.com",
              phone: "+91 9876543210",
              joinDate: "Sep 15, 2023",
              attendance: 92,
              performance: 85,
              subjects: [
                { name: "Mathematics", progress: 90, grade: "A" },
                { name: "Science", progress: 85, grade: "A-" },
                { name: "English", progress: 78, grade: "B+" },
                { name: "Social Studies", progress: 82, grade: "B+" },
              ],
              recentActivities: [
                { type: "quiz", name: "Science Quiz", date: "Today", score: 85 },
                { type: "flashcard", name: "Math Concepts", date: "Yesterday", completed: true },
                { type: "summary", name: "History Chapter 5", date: "3 days ago", completed: true },
                { type: "quiz", name: "English Grammar", date: "1 week ago", score: 92 },
              ]
            }}
            onClose={() => setShowStudentDetails(false)}
            language={language}
          />
        )}
      </AnimatePresence>

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
      <RewardPopup
        isOpen={showReward}
        onClose={() => {
          setShowReward(false);
          setSelectedBadge(null);
        }}
        title={selectedBadge ? `${selectedBadge.name} Badge Unlocked!` : "You've mastered a new concept!"}
        description={selectedBadge ? selectedBadge.description : "Keep up the great work and continue learning to earn more rewards."}
        xpAmount={selectedBadge ? selectedBadge.xpReward : 50}
        language={language}
      />
    </main>
  )
}
