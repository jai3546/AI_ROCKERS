"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  GraduationCap,
  Mic,
  Moon,
  Sparkles,
  Sun,
  TabletSmartphone,
  Menu,
  X,
} from "lucide-react"
import Link from "next/link"

import { ReviewsSection } from "@/components/reviews/reviews-section"
import { LanguageSelector } from "@/components/language-selector"
import { VoiceCommand } from "@/components/voice-command"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme-provider"

type Language = "en" | "hi" | "te"

export default function LandingPage() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [language, setLanguage] = useState<Language>("en")

  useEffect(() => {
    setMounted(true)

    const storedLanguage = localStorage.getItem("preferredLanguage") as Language | null
    if (storedLanguage) {
      setLanguage(storedLanguage)
    }
  }, [])

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage)

    if (typeof window !== "undefined") {
      localStorage.setItem("preferredLanguage", newLanguage)
    }
  }

  const translations = {
    title: {
      en: "VidyaAI",
      hi: "विद्या AI++",
      te: "విద్య AI++",
    },
    languageLabel: {
      en: "Language",
      hi: "भाषा",
      te: "భాష",
    },
    nav: {
      en: ["Features", "Portal", "Reviews"],
      hi: ["विशेषताएँ", "पोर्टल", "समीक्षाएँ"],
      te: ["ఫీచర్లు", "పోర్టల్", "సమీక్షలు"],
    },
    subtitle: {
      en: "Voice-First Learning for Everyone",
      hi: "सभी के लिए आवाज-पहले सीखना",
      te: "అందరికీ వాయిస్-ఫస్ట్ లెర్నింగ్",
    },
    heroDescription: {
      en: "Experience adaptive learning with voice commands, emotion-aware support, and study tools built for students and schools.",
      hi: "वॉयस कमांड, भावना-आधारित सहायता और छात्रों तथा स्कूलों के लिए बनाए गए अध्ययन टूल के साथ अनुकूली सीखने का अनुभव लें।",
      te: "వాయిస్ కమాండ్లు, భావోద్వేగ-అవగాహన సహాయం మరియు విద్యార్థులు, పాఠశాలల కోసం నిర్మించిన స్టడీ టూల్స్‌తో అనుకూల లెర్నింగ్‌ను అనుభవించండి.",
    },
    heroBadge: {
      en: "Voice-first learning platform",
      hi: "वॉयस-फर्स्ट लर्निंग प्लेटफ़ॉर्म",
      te: "వాయిస్-ఫస్ట్ లెర్నింగ్ ప్లాట్‌ఫాం",
    },
    getStarted: {
      en: "Get Started",
      hi: "शुरू करें",
      te: "ప్రారంభించండి",
    },
    tryDemo: {
      en: "Try Demo",
      hi: "डेमो आज़माएं",
      te: "డెమో ప్రయత్నించండి",
    },
    studentLogin: {
      en: "Student Login",
      hi: "छात्र लॉगिन",
      te: "విద్యార్థి లాగిన్",
    },
    schoolLogin: {
      en: "School Portal",
      hi: "स्कूल पोर्टल",
      te: "స్కూల్ పోర్టల్",
    },
    demoLogin: {
      en: "Try Demo",
      hi: "डेमो आज़माएं",
      te: "డెమో ప్రయత్నించండి",
    },
    voiceCommands: {
      en: ["Student login", "School portal", "Try demo"],
      hi: ["छात्र लॉगिन", "स्कूल पोर्टल", "डेमो आज़माएं"],
      te: ["విద్యార్థి లాగిన్", "స్కూల్ పోర్టల్", "డెమో ప్రయత్నించండి"],
    },
    features: {
      title: {
        en: "Core Features",
        hi: "मुख्य विशेषताएँ",
        te: "ముఖ్య ఫీచర్లు",
      },
      subtitle: {
        en: "Explore the tools students and teachers use to learn faster, track progress, and stay focused — lightweight and easy to use.",
        hi: "छात्र और शिक्षक जिन उपकरणों का उपयोग करते हैं उन्हें एक्सप्लोर करें — तेज़ी से सीखें, प्रगति ट्रैक करें और ध्यान बनाए रखें। हल्का और उपयोग में आसान।",
        te: "విద్యార్థులు మరియు ఉపాధ్యాయులు ఉపయోగించే టూల్స్‌ను అన్వేషించండి — త్వరగా నేర్చుకోండి, ప్రగతి ట్రాక్ చేయండి మరియు ఫోకస్‌లో ఉండండి. తేలికగా, సులభంగా ఉపయోగించడానికి.",
      },
      cards: {
        en: [
          {
            title: "Voice Commands",
            description: "Navigate the app hands-free and keep studying without breaking your flow.",
          },
          {
            title: "Emotion Tracking",
            description: "Detect focus, fatigue, and confusion so the experience can adapt in real time.",
          },
          {
            title: "Interactive Flashcards",
            description: "Turn notes into active recall practice with lightweight study tools that feel immediate.",
          },
        ],
        hi: [
          {
            title: "वॉइस कमांड",
            description: "ऐप को बिना हाथ लगाए चलाएँ और अपनी पढ़ाई की लय बनाए रखें।",
          },
          {
            title: "भावना ट्रैकिंग",
            description: "एकाग्रता, थकान और उलझन पहचानकर अनुभव को तुरंत ढालती है।",
          },
          {
            title: "इंटरैक्टिव फ्लैशकार्ड्स",
            description: "नोट्स को तुरंत रिविज़न के लिए आसान अभ्यास में बदलें।",
          },
        ],
        te: [
          {
            title: "వాయిస్ కమాండ్లు",
            description: "యాప్‌ను చేతులు ఉపయోగించకుండా నడపండి మరియు చదువులోని ప్రవాహాన్ని నిలుపుకోండి.",
          },
          {
            title: "ఎమోషన్ ట్రాకింగ్",
            description: "ఫోకస్, అలసట, అయోమయం గుర్తించి అనుభవాన్ని తక్షణమే మార్చుతుంది.",
          },
          {
            title: "ఇంటరాక్టివ్ ఫ్లాష్‌కార్డ్స్",
            description: "నోట్స్‌ను త్వరిత రివిజన్ కోసం ప్రాక్టీస్‌గా మార్చండి.",
          },
        ],
      },
    },
    portal: {
      title: {
        en: "Access Your Portal",
        hi: "अपना पोर्टल खोलें",
        te: "మీ పోర్టల్‌ను తెరవండి",
      },
      subtitle: {
        en: "Choose the path that fits your role and jump straight into the experience.",
        hi: "अपनी भूमिका के अनुसार पोर्टल चुनें और सीधे अनुभव शुरू करें।",
        te: "మీ పాత్రకు సరిపోయే పోర్టల్‌ను ఎంచుకుని వెంటనే అనుభవంలోకి వెళ్లండి.",
      },
      cards: {
        en: [
          {
            title: "Student Portal",
            subtitle: "Personalized learning, quizzes, flashcards, and AI tutor support in one place.",
            bullets: ["Adaptive study dashboard", "Voice-enabled navigation", "Gamified progress tracking"],
            cta: "Open Student Portal",
          },
          {
            title: "School Portal",
            subtitle: "A clear view of class progress, student engagement, and actionable analytics.",
            bullets: ["Weekly performance summaries", "Focus and emotion insights", "Teacher-friendly reporting"],
            cta: "Open School Portal",
          },
        ],
        hi: [
          {
            title: "छात्र पोर्टल",
            subtitle: "व्यक्तिगत सीखना, क्विज़, फ्लैशकार्ड और AI ट्यूटर सपोर्ट एक ही जगह।",
            bullets: ["अनुकूल अध्ययन डैशबोर्ड", "वॉइस-आधारित नेविगेशन", "गेमिफाइड प्रगति ट्रैकिंग"],
            cta: "छात्र पोर्टल खोलें",
          },
          {
            title: "स्कूल पोर्टल",
            subtitle: "कक्षा की प्रगति, छात्र सहभागिता और उपयोगी विश्लेषण का स्पष्ट दृश्य।",
            bullets: ["साप्ताहिक प्रदर्शन सारांश", "ध्यान और भावना की जानकारी", "शिक्षक-अनुकूल रिपोर्टिंग"],
            cta: "स्कूल पोर्टल खोलें",
          },
        ],
        te: [
          {
            title: "విద్యార్థి పోర్టల్",
            subtitle: "వ్యక్తిగత లెర్నింగ్, క్విజ్‌లు, ఫ్లాష్‌కార్డ్స్, AI ట్యూటర్ సహాయం ఒకే చోట.",
            bullets: ["అనుకూల స్టడీ డాష్‌బోర్డ్", "వాయిస్ ఆధారిత నావిగేషన్", "గేమిఫైడ్ ప్రగతి ట్రాకింగ్"],
            cta: "విద్యార్థి పోర్టల్ తెరవండి",
          },
          {
            title: "స్కూల్ పోర్టల్",
            subtitle: "తరగతి పురోగతి, విద్యార్థి నిమగ్నత, ఉపయోగకరమైన విశ్లేషణల స్పష్టమైన దృశ్యం.",
            bullets: ["వారపు పనితీరు సారాంశాలు", "ఫోకస్ మరియు భావోద్వేగ అవగాహన", "టీచర్‌కు అనుకూల రిపోర్టింగ్"],
            cta: "స్కూల్ పోర్టల్ తెరవండి",
          },
        ],
      },
    },
    testimonials: {
      title: {
        en: "Loved by Students, Trusted by Thousands",
        hi: "छात्रों को पसंद, हजारों का भरोसा",
        te: "విద్యార్థుల ప్రేమ, వేల మంది నమ్మకం",
      },
      subtitle: {
        en: "Here’s what our users have to say about VidyaAI.",
        hi: "VidyaAI के बारे में हमारे उपयोगकर्ताओं की राय।",
        te: "VidyaAI గురించి మా వినియోగదారుల అభిప్రాయం.",
      },
      eyebrow: {
        en: "User Feedback",
        hi: "उपयोगकर्ता प्रतिक्रिया",
        te: "వినియోగదారు అభిప్రాయం",
      },
      footer: {
        en: "Thank you for being a part of our journey!",
        hi: "हमारी यात्रा का हिस्सा बनने के लिए धन्यवाद!",
        te: "మా ప్రయాణంలో భాగమైనందుకు ధన్యవాదాలు!",
      },
    },
    hero: {
      label: {
        en: "Voice-first learning platform",
        hi: "वॉयस-फर्स्ट लर्निंग प्लेटफ़ॉर्म",
        te: "వాయిస్-ఫస్ట్ లెర్నింగ్ ప్లాట్‌ఫాం",
      },
      title: {
        en: "Voice-First Learning for Everyone",
        hi: "सभी के लिए वॉयस-फर्स्ट लर्निंग",
        te: "అందరికీ వాయిస్-ఫస్ట్ లెర్నింగ్",
      },
      description: {
        en: "Experience adaptive learning with voice commands, emotion-aware support, and study tools built for students and schools.",
        hi: "वॉयस कमांड, भावना-आधारित सहायता और छात्रों तथा स्कूलों के लिए बनाए गए अध्ययन टूल के साथ अनुकूली सीखने का अनुभव लें।",
        te: "వాయిస్ కమాండ్లు, భావోద్వేగ-అవగాహన సహాయం మరియు విద్యార్థులు, పాఠశాలల కోసం నిర్మించిన స్టడీ టూల్స్‌తో అనుకూల లెర్నింగ్‌ను అనుభవించండి.",
      },
      stats: {
        en: [
          { label: "3 languages", value: "English, Hindi, Telugu" },
          { label: "Adaptive study", value: "AI tutor + flashcards" },
          { label: "School ready", value: "Student and educator views" },
        ],
        hi: [
          { label: "3 भाषाएँ", value: "अंग्रेज़ी, हिंदी, तेलुगु" },
          { label: "अनुकूली अध्ययन", value: "AI ट्यूटर + फ्लैशकार्ड्स" },
          { label: "स्कूल-तैयार", value: "छात्र और शिक्षक दृश्य" },
        ],
        te: [
          { label: "3 భాషలు", value: "ఇంగ్లీష్, హిందీ, తెలుగు" },
          { label: "అడాప్టివ్ స్టడీ", value: "AI ట్యూటర్ + ఫ్లాష్‌కార్డ్స్" },
          { label: "స్కూల్ రెడీ", value: "విద్యార్థి మరియు ఉపాధ్యాయ దృశ్యాలు" },
        ],
      },
      image: {
        en: {
          heading: "Adaptive learning hub",
          subtitle: "Study, track, and respond in real time.",
          voiceTitle: "Hands-free navigation",
          voiceSubtitle: "Voice control for fast access.",
          emotionTitle: "Emotion-aware support",
          emotionSubtitle: "Adjusts with the learner state.",
          studyTitle: "Flashcards, quizzes, and summaries",
          studySubtitle: "Everything stays lightweight, fast, and focused.",
          liveSignal: "Live signal",
          voiceReady: "Voice ready",
          focusMeter: "Focus meter",
          emotionActive: "Emotion tracking active",
          readyToStudy: "Ready to study",
        },
        hi: {
          heading: "अनुकूली लर्निंग हब",
          subtitle: "रियल टाइम में पढ़ें, ट्रैक करें और प्रतिक्रिया दें।",
          voiceTitle: "हैंड्स-फ्री नेविगेशन",
          voiceSubtitle: "तेज़ पहुंच के लिए वॉइस कंट्रोल।",
          emotionTitle: "भावना-आधारित सहायता",
          emotionSubtitle: "सीखने की स्थिति के अनुसार खुद को ढालती है।",
          studyTitle: "फ्लैशकार्ड्स, क्विज़ और सारांश",
          studySubtitle: "सब कुछ हल्का, तेज़ और केंद्रित रहता है।",
          liveSignal: "लाइव सिग्नल",
          voiceReady: "वॉइस तैयार",
          focusMeter: "फोकस मीटर",
          emotionActive: "भावना ट्रैकिंग सक्रिय",
          readyToStudy: "पढ़ाई के लिए तैयार",
        },
        te: {
          heading: "అడాప్టివ్ లెర్నింగ్ హబ్",
          subtitle: "రియల్ టైమ్‌లో చదవండి, ట్రాక్ చేయండి, స్పందించండి.",
          voiceTitle: "హ్యాండ్స్-ఫ్రీ నావిగేషన్",
          voiceSubtitle: "త్వరిత యాక్సెస్ కోసం వాయిస్ నియంత్రణ.",
          emotionTitle: "భావోద్వేగ-అవగాహన సహాయం",
          emotionSubtitle: "విద్యార్థి స్థితికి అనుగుణంగా సర్దుబాటు చేస్తుంది.",
          studyTitle: "ఫ్లాష్‌కార్డ్స్, క్విజ్‌లు మరియు సారాంశాలు",
          studySubtitle: "అన్నీ తేలికగా, వేగంగా, ఫోకస్‌గా ఉంటాయి.",
          liveSignal: "లైవ్ సిగ్నల్",
          voiceReady: "వాయిస్ సిద్ధంగా ఉంది",
          focusMeter: "ఫోకస్ మీటర్",
          emotionActive: "భావోద్వేగ ట్రాకింగ్ సక్రియం",
          readyToStudy: "చదవడానికి సిద్ధం",
        },
      },
      sectionHeading: {
        en: "A cleaner snapshot of the platform's most important tools.",
        hi: "प्लेटफ़ॉर्म के सबसे महत्वपूर्ण टूल्स का एक साफ़ और आसान दृश्य।",
        te: "ప్లాట్‌ఫామ్‌లోని అత్యంత ముఖ్యమైన టూల్స్‌కు ఒక సులభమైన, స్పష్టమైన దృశ్యం.",
      },
    },
  }

  const featureCards = [
    {
      icon: Mic,
      title: translations.features.cards[language][0].title,
      description: translations.features.cards[language][0].description,
      accent: "from-primary/15 to-primary/5",
    },
    {
      icon: BrainCircuit,
      title: translations.features.cards[language][1].title,
      description: translations.features.cards[language][1].description,
      accent: "from-secondary/15 to-secondary/5",
    },
    {
      icon: BookOpen,
      title: translations.features.cards[language][2].title,
      description: translations.features.cards[language][2].description,
      accent: "from-accent/15 to-accent/5",
    },
  ]

  const portalCards = [
    {
      icon: GraduationCap,
      href: "/student-login",
      title: translations.portal.cards[language][0].title,
      subtitle: translations.portal.cards[language][0].subtitle,
      bullets: translations.portal.cards[language][0].bullets,
      cta: translations.portal.cards[language][0].cta,
      accent: "from-primary to-highlight",
    },
    {
      icon: BarChart3,
      href: "/school-login",
      title: translations.portal.cards[language][1].title,
      subtitle: translations.portal.cards[language][1].subtitle,
      bullets: translations.portal.cards[language][1].bullets,
      cta: translations.portal.cards[language][1].cta,
      accent: "from-secondary to-accent",
    },
  ]

  const heroHighlights = translations.hero.stats[language]
  const heroImage = translations.hero.image[language]

  const handleVoiceCommand = (command: string) => {
    const studentCommands = [
      translations.studentLogin.en.toLowerCase(),
      translations.studentLogin.hi.toLowerCase(),
      translations.studentLogin.te.toLowerCase(),
    ]

    const schoolCommands = [
      translations.schoolLogin.en.toLowerCase(),
      translations.schoolLogin.hi.toLowerCase(),
      translations.schoolLogin.te.toLowerCase(),
    ]

    const demoCommands = [
      translations.demoLogin.en.toLowerCase(),
      translations.demoLogin.hi.toLowerCase(),
      translations.demoLogin.te.toLowerCase(),
    ]

    const lowerCommand = command.toLowerCase()

    if (studentCommands.includes(lowerCommand)) {
      window.location.href = "/student-login"
    } else if (schoolCommands.includes(lowerCommand)) {
      window.location.href = "/school-login"
    } else if (demoCommands.includes(lowerCommand)) {
      window.location.href = "/student-login"
    }
  }

  return (
    <main
      suppressHydrationWarning
      className="relative min-h-screen overflow-hidden bg-background"
    >
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute right-8 top-24 h-40 w-40 rounded-full bg-primary/6 blur-2xl dark:bg-primary/4" />
      </div>

      <div className="relative mx-auto flex w-full max-w-7xl flex-col px-4 pb-16 pt-4 sm:px-6 lg:px-8">
        <motion.header
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="sticky top-2 z-40 mb-4 rounded-2xl border border-border/70 bg-background/85 px-3 py-2 shadow-sm backdrop-blur-xl"
        >
          <div className="flex items-center justify-between gap-3 lg:grid lg:grid-cols-[auto,1fr,auto] lg:gap-4">
            <div className="flex min-w-0 items-center gap-3 justify-self-start">
              <Link href="#hero" className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-highlight text-sm font-bold text-white shadow-lg shadow-primary/20">
                  V+
                </div>
                <div className="block sm:block">
                  <p className="text-sm font-semibold tracking-tight text-foreground sm:text-sm">{translations.title[language]}</p>
                  <p className="text-[11px] leading-none text-muted-foreground">{translations.hero.label[language]}</p>
                </div>
              </Link>
            </div>

            <div className="flex items-center gap-2 lg:hidden">
              {mounted && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="h-9 w-9 rounded-full border border-border/50 bg-background/80 text-muted-foreground shadow-sm hover:bg-muted/60 hover:text-foreground"
                >
                  {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  <span className="sr-only">Toggle theme</span>
                </Button>
              )}

              <button
                aria-controls="mobile-menu"
                aria-expanded={isMenuOpen}
                onClick={() => setIsMenuOpen((s) => !s)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/50 bg-background/80 text-muted-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                <span className="sr-only">Open menu</span>
              </button>
            </div>

            <nav className="hidden items-center justify-center gap-1.5 text-sm text-muted-foreground lg:flex">
              {translations.nav[language].map((item, index) => {
                const anchor = ["#features", "#portal", "#reviews"][index]

                return (
                  <Link
                    key={item}
                    href={anchor}
                    className="rounded-full px-2.5 py-1 transition-colors hover:bg-primary/10 hover:text-foreground"
                  >
                    {item}
                  </Link>
                )
              })}
            </nav>

            <div className="hidden items-center justify-self-end lg:flex">
              <div className="flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-2 py-1 shadow-sm backdrop-blur dark:bg-card/70">
                <LanguageSelector
                  onLanguageChange={handleLanguageChange}
                  initialLanguage={language}
                  label={translations.languageLabel[language]}
                />
                {mounted && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    className="h-8 w-8 rounded-full text-muted-foreground hover:bg-primary/10 hover:text-foreground"
                  >
                    {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    <span className="sr-only">Toggle theme</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
          {isMenuOpen && (
            <motion.div
              id="mobile-menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm lg:hidden"
            >
              <div className="mt-20 w-[92%] max-w-md rounded-2xl border border-border/60 bg-background/95 p-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-highlight text-sm font-bold text-white">V+</div>
                    <p className="text-sm font-semibold">{translations.title[language]}</p>
                  </div>
                  <button onClick={() => setIsMenuOpen(false)} className="h-9 w-9 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted/50">
                    <X className="h-5 w-5" />
                    <span className="sr-only">Close menu</span>
                  </button>
                </div>

                <nav className="mt-4 flex flex-col gap-3">
                {translations.nav[language].map((item, index) => {
                  const anchor = ["#features", "#portal", "#reviews"][index]

                  return (
                    <Link
                      key={item}
                      href={anchor}
                      onClick={() => setIsMenuOpen(false)}
                      className="block rounded-md px-3 py-3 text-lg font-medium hover:bg-primary/10"
                    >
                      {item}
                    </Link>
                  )
                })}

                <div className="mt-4 flex items-center justify-between">
                  <LanguageSelector onLanguageChange={handleLanguageChange} initialLanguage={language} label={translations.languageLabel[language]} />
                </div>
              </nav>
            </div>
          </motion.div>
          )}
        </motion.header>

        <section id="hero" className="grid items-center gap-14 py-8 lg:grid-cols-[1.05fr_0.95fr] lg:py-14">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="relative max-w-2xl"
          >
            <div className="absolute -left-12 top-6 h-56 w-56 rounded-full bg-gradient-to-br from-primary/30 to-transparent blur-3xl opacity-80 dark:opacity-0 pointer-events-none" />
            {/* hero badge removed to simplify layout */}

            <h1 className="mt-6 text-4xl font-black tracking-tight text-foreground sm:text-5xl lg:text-7xl">
              <span className="block">{translations.hero.title[language]}</span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-8 text-muted-foreground sm:text-lg">
              {translations.hero.description[language]}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="rounded-full px-7 shadow-lg shadow-primary/20">
                <Link href="/student-login">
                  {translations.getStarted[language]}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full px-7">
                <Link href="/demo-login">{translations.tryDemo[language]}</Link>
              </Button>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              {heroHighlights.map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-border/70 bg-background/80 p-4 shadow-sm backdrop-blur dark:border-border/80 dark:bg-card/80"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{item.label}</p>
                  <p className="mt-2 text-sm font-medium text-foreground">{item.value}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="relative mx-auto w-full max-w-lg sm:max-w-xl lg:-translate-y-12">
            <div className="relative rounded-xl border border-border/60 bg-background/80 p-4 sm:p-6 dark:bg-card/80 overflow-hidden h-64 sm:h-100 lg:h-50">
              <div className="absolute inset-0 -z-0 bg-gradient-to-br from-primary/30 via-primary/10 to-highlight/20 opacity-80 dark:opacity-0 pointer-events-none" />
              {/* additional pink glare for top-right, visible in dark mode and moved slightly upward */}
              <div className="absolute -right-6 -top-12 h-44 w-44 rounded-full bg-gradient-to-br from-primary/40 to-transparent blur-3xl opacity-70 dark:opacity-40 pointer-events-none -z-0" />
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{heroImage.heading}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{heroImage.subtitle}</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted/10 text-primary">
                    <TabletSmartphone className="h-5 w-5" />
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border border-border/60 bg-background p-3 dark:bg-card">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/8 text-primary">
                        <Mic className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{heroImage.voiceTitle}</p>
                        <p className="text-xs text-muted-foreground">{heroImage.voiceSubtitle}</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-border/60 bg-background p-3 dark:bg-card">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/8 text-secondary">
                        <BrainCircuit className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{heroImage.emotionTitle}</p>
                        <p className="text-xs text-muted-foreground">{heroImage.emotionSubtitle}</p>
                      </div>
                    </div>
                  </div>

                  <div className="sm:col-span-2 rounded-lg border border-border/60 bg-background p-3 dark:bg-card">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/8 text-accent">
                        <BookOpen className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-foreground">{heroImage.studyTitle}</p>
                        <p className="text-xs text-muted-foreground">{heroImage.studySubtitle}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="py-12 sm:py-16">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">{translations.features.title[language]}</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-foreground sm:text-4xl">
              {translations.hero.sectionHeading[language]}
            </h2>
            <p className="mt-4 text-muted-foreground">{translations.features.subtitle[language]}</p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {featureCards.map((feature, index) => {
              const Icon = feature.icon

              return (
                <motion.article
                  key={feature.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.45, delay: index * 0.08 }}
                  className="rounded-lg border border-border/60 bg-background p-5"
                >
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.accent}`}>
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mt-5 text-xl font-bold text-foreground">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{feature.description}</p>
                </motion.article>
              )
            })}
          </div>
        </section>

        <section id="portal" className="py-12 sm:py-16">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-secondary">{translations.portal.title[language]}</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-foreground sm:text-4xl">
              {translations.portal.subtitle[language]}
            </h2>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {portalCards.map((portal) => {
              const Icon = portal.icon

              return (
                <motion.div
                  key={portal.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.45 }}
                  className="rounded-lg border border-border/60 bg-background p-4"
                >
                  <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                    <div className={`flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br ${portal.accent} text-white shadow-lg`}>
                      <Icon className="h-7 w-7" />
                    </div>

                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-foreground">{portal.title}</h3>
                      <p className="mt-2 max-w-lg text-sm leading-7 text-muted-foreground">{portal.subtitle}</p>

                      <ul className="mt-5 space-y-3 text-sm text-foreground/80">
                        {portal.bullets.map((bullet) => (
                          <li key={bullet} className="flex items-center gap-3">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                              <CheckCircle2 className="h-4 w-4" />
                            </span>
                            {bullet}
                          </li>
                        ))}
                      </ul>

                      <Button asChild className="mt-6 rounded-full px-6">
                        <Link href={portal.href}>
                          {portal.cta}
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </section>

        <div id="reviews" className="py-8 sm:py-12">
          <ReviewsSection
            eyebrow={translations.testimonials.eyebrow[language]}
            title={translations.testimonials.title[language]}
            subtitle={translations.testimonials.subtitle[language]}
            footerText={translations.testimonials.footer[language]}
            language={language}
          />
        </div>
      </div>

      <VoiceCommand
        onCommand={handleVoiceCommand}
        language={language}
        availableCommands={translations.voiceCommands[language]}
        hideCommands={true}
      />
    </main>
  )
}