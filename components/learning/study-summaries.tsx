"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { BookOpen, Download, X, Printer, Share2, Copy, FileText, Search, Workflow, Volume2, Play, Pause, Square, LayoutGrid, ArrowLeft, Globe, Compass, Layers, BookMarked, ChevronRight, Sparkles, Loader2, Brain, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { updateSchoolPortal } from "@/services/school-portal-service"
import { MindMap } from "./mind-map"
import { getMindMapData } from "@/data/mind-map-data"
import { generateAiSummaryAndMindmap, generateAiSummaryFromDocument } from "@/services/gemini-api"

export interface StudySummary {
  id: string
  title: string
  content: string
  subject: string
  syllabus: "AP" | "Telangana" | "CBSE" | "General"
  customMindMapData?: any
}

interface StudySummariesProps {
  summaries: StudySummary[]
  onClose: () => void
  language?: "en" | "hi" | "te"
  syllabus?: "AP" | "Telangana" | "CBSE" | "General"
  subject?: string
  onTriggerQuiz?: (subject: string, topic: string) => void
  onTriggerFlashcards?: (subject: string, topic: string) => void
  onAddSummary?: (summary: StudySummary) => void
}

const SUBJECTS_CONFIG = {
  "Science": {
    icon: Globe,
    color: "text-blue-500",
    gradient: "from-blue-500/20 via-cyan-500/10 to-transparent",
    border: "border-blue-500/30 hover:border-blue-500",
    description: "Read concise summaries on biological, physical, and chemical topics."
  },
  "Math": {
    icon: Compass,
    color: "text-purple-500",
    gradient: "from-purple-500/20 via-indigo-500/10 to-transparent",
    border: "border-purple-500/30 hover:border-purple-500",
    description: "Study key mathematical theories, properties, and core formulas."
  },
  "Social Studies": {
    icon: Layers,
    color: "text-amber-500",
    gradient: "from-amber-500/20 via-orange-500/10 to-transparent",
    border: "border-amber-500/30 hover:border-amber-500",
    description: "Explore geography, history, and civic structure notes."
  },
  "English": {
    icon: BookMarked,
    color: "text-emerald-500",
    gradient: "from-emerald-500/20 via-teal-500/10 to-transparent",
    border: "border-emerald-500/30 hover:border-emerald-500",
    description: "Review parts of speech, grammar guides, and literary device notes."
  }
}

export function StudySummaries({
  summaries,
  onClose,
  language = "en",
  syllabus = "General",
  subject = "all",
  onTriggerQuiz,
  onTriggerFlashcards,
  onAddSummary
}: StudySummariesProps) {
  const [allSummariesList, setAllSummariesList] = useState<StudySummary[]>(summaries)
  const [filteredSummaries, setFilteredSummaries] = useState<StudySummary[]>([])
  const [activeSubject, setActiveSubject] = useState<string>(subject)
  const [showSubjectSelect, setShowSubjectSelect] = useState<boolean>(subject === "all")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [viewMode, setViewMode] = useState<"card" | "compact">("card")
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [activeMindMapSummary, setActiveMindMapSummary] = useState<StudySummary | null>(null)
  const [isGeneratingAI, setIsGeneratingAI] = useState<boolean>(false)
  const [aiTargetSubject, setAiTargetSubject] = useState<string>("Science")
  const [customAiSubject, setCustomAiSubject] = useState<string>("")

  // File upload state definitions
  const [showUploadDialog, setShowUploadDialog] = useState<boolean>(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadSubject, setUploadSubject] = useState<string>("Science")
  const [customUploadSubject, setCustomUploadSubject] = useState<string>("")
  const [uploadStep, setUploadStep] = useState<"idle" | "reading" | "parsing" | "ai_generating" | "complete">("idle")
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState<boolean>(false)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (file.size > 15 * 1024 * 1024) {
        setUploadError("File size exceeds the 15MB limit.")
        setSelectedFile(null)
      } else {
        setSelectedFile(file)
        setUploadError(null)
      }
    }
  }

  const handleUploadAndSummarize = async () => {
    if (!selectedFile) {
      setUploadError("Please select a file first")
      return
    }

    const filename = selectedFile.name.toLowerCase()
    
    if (!filename.endsWith('.pdf') && !filename.endsWith('.pptx') && !filename.endsWith('.ppt') && !filename.endsWith('.txt')) {
      setUploadError("Unsupported format. Please upload a PDF, PPT, PPTX or TXT file.")
      return
    }

    setUploadError(null)
    setUploadStep("reading")

    try {
      const formData = new FormData()
      formData.append("file", selectedFile)

      setUploadStep("parsing")
      const parseResponse = await fetch("/api/parse-document", {
        method: "POST",
        body: formData,
      })

      if (!parseResponse.ok) {
        let errorMessage = "Failed to parse document content."
        try {
          const contentType = parseResponse.headers.get("content-type")
          if (contentType && contentType.includes("application/json")) {
            const errorData = await parseResponse.json()
            errorMessage = errorData.error || errorMessage
          } else {
            const textError = await parseResponse.text()
            errorMessage = textError || errorMessage
          }
        } catch (_) {}
        throw new Error(errorMessage)
      }

      const { text } = await parseResponse.json()
      if (!text || text.trim() === "") {
        throw new Error("No text content could be extracted from this document.")
      }

      setUploadStep("ai_generating")
      const targetSubj = uploadSubject === "Other" ? (customUploadSubject.trim() || "General") : uploadSubject
      const capitalizedSubject = targetSubj.charAt(0).toUpperCase() + targetSubj.slice(1)

      const aiResult = await generateAiSummaryFromDocument(text, selectedFile.name, capitalizedSubject, syllabus)

      const newSummary: StudySummary = {
        id: `uploaded-summary-${Date.now()}`,
        title: aiResult.title,
        content: aiResult.summary,
        subject: capitalizedSubject,
        syllabus: syllabus as any || "General",
        customMindMapData: aiResult.mindMapData
      }

      setAllSummariesList(prev => [...prev, newSummary])
      if (onAddSummary) {
        onAddSummary(newSummary)
      }

      setActiveSubject(capitalizedSubject)
      setShowSubjectSelect(false)
      setUploadStep("complete")
      
      setTimeout(() => {
        setShowUploadDialog(false)
        setUploadStep("idle")
        setSelectedFile(null)
        setCustomUploadSubject("")
      }, 1500)

    } catch (err: any) {
      console.error("Document summarization failed:", err)
      setUploadError(err.message || "An unexpected error occurred during summarization.")
      setUploadStep("idle")
    }
  }

  // Sync state if summaries prop changes
  useEffect(() => {
    setAllSummariesList(summaries)
  }, [summaries])

  // Update AI target subject based on search classification or active tab
  useEffect(() => {
    if (searchQuery.trim()) {
      const guessed = activeSubject && activeSubject !== "all" ? activeSubject : classifySubject(searchQuery)
      setAiTargetSubject(guessed)
      setCustomAiSubject("")
    }
  }, [searchQuery, activeSubject])

  const classifySubject = (query: string): string => {
    const q = query.toLowerCase();
    if (/math|equation|geometry|number|sum|algebra|calculus|arithmetic|triangle|pythagor/.test(q)) {
      return "Math";
    }
    if (/history|river|civic|geography|war|monument|culture|constitution|social|polity|dynasty/.test(q)) {
      return "Social Studies";
    }
    if (/grammar|poem|noun|verb|english|story|literature|parts of speech|prose/.test(q)) {
      return "English";
    }
    return "Science"; // default fallback
  };

  const handleGenerateAISummary = async () => {
    if (!searchQuery.trim()) return
    
    let targetSubject = aiTargetSubject === "Other" ? (customAiSubject.trim() || "General") : aiTargetSubject
    targetSubject = targetSubject.charAt(0).toUpperCase() + targetSubject.slice(1)
    
    setIsGeneratingAI(true)
    setShowSubjectSelect(false)

    try {
      const result = await generateAiSummaryAndMindmap(searchQuery, targetSubject, syllabus)
      
      const newSummary: StudySummary = {
        id: `ai-summary-${Date.now()}`,
        title: result.title,
        content: result.summary,
        subject: targetSubject,
        syllabus: syllabus as any || "General",
        customMindMapData: result.mindMapData
      }

      setAllSummariesList(prev => [...prev, newSummary])
      if (onAddSummary) {
        onAddSummary(newSummary)
      }
      setActiveSubject(targetSubject)
      setSearchQuery("")
      setCustomAiSubject("")
    } catch (error) {
      console.error("AI Summary generation failed:", error)
    } finally {
      setIsGeneratingAI(false)
    }
  }

  // Audio Speech Synthesis state and refs
  const [activeSummaryId, setActiveSummaryId] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState<number>(0)
  const [playbackRate, setPlaybackRate] = useState<number>(1)

  const activeSummaryIdRef = useRef<string | null>(null)
  const isPlayingRef = useRef<boolean>(false)
  const currentIndexRef = useRef<number>(0)
  const playbackRateRef = useRef<number>(1)
  const sentencesRef = useRef<string[]>([])

  // Clean up speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  // Helper to split text into sentences
  const splitIntoSentences = (text: string): string[] => {
    if (!text) return []
    const regex = /[^.!?]+(?:[.!?]+(?:\s+|$)|$)/g
    const matches = text.match(regex)
    return matches ? matches.map(s => s.trim()).filter(Boolean) : [text]
  }

  // Speak the current sentence
  const speakCurrent = (summaryId: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return

    window.speechSynthesis.cancel()

    const idx = currentIndexRef.current
    const list = sentencesRef.current

    if (idx < 0 || idx >= list.length || !isPlayingRef.current || activeSummaryIdRef.current !== summaryId) {
      if (idx >= list.length && activeSummaryIdRef.current === summaryId) {
        handleStop()
      }
      return
    }

    const utterance = new SpeechSynthesisUtterance(list[idx])
    utterance.rate = playbackRateRef.current

    // Detect language or fallback
    if (language === "hi") {
      utterance.lang = "hi-IN"
    } else if (language === "te") {
      utterance.lang = "te-IN"
    } else {
      utterance.lang = "en-US"
    }

    // Set matching voice if possible
    const voices = window.speechSynthesis.getVoices()
    const matchedVoice = voices.find(voice => 
      voice.lang.toLowerCase().startsWith(utterance.lang.toLowerCase()) ||
      (language === "en" && voice.lang.toLowerCase().startsWith("en"))
    )
    if (matchedVoice) {
      utterance.voice = matchedVoice
    }

    utterance.onstart = () => {
      if (activeSummaryIdRef.current === summaryId && currentIndexRef.current === idx) {
        setCurrentSentenceIndex(idx)
      }
    }

    utterance.onend = () => {
      if (isPlayingRef.current && activeSummaryIdRef.current === summaryId) {
        currentIndexRef.current = idx + 1
        speakCurrent(summaryId)
      }
    }

    utterance.onerror = (e) => {
      if (e.error !== "interrupted") {
        console.error("Speech Synthesis Error:", e)
      }
    }

    window.speechSynthesis.speak(utterance)
  }

  const handleStartSpeech = (summary: StudySummary) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return

    window.speechSynthesis.cancel()

    const sentences = splitIntoSentences(summary.content)
    sentencesRef.current = sentences
    currentIndexRef.current = 0
    isPlayingRef.current = true
    activeSummaryIdRef.current = summary.id

    setActiveSummaryId(summary.id)
    setIsPlaying(true)
    setCurrentSentenceIndex(0)

    speakCurrent(summary.id)
  }

  const handlePlayPause = () => {
    if (typeof window === "undefined" || !window.speechSynthesis || !activeSummaryId) return

    if (isPlaying) {
      window.speechSynthesis.pause()
      isPlayingRef.current = false
      setIsPlaying(false)
    } else {
      isPlayingRef.current = true
      setIsPlaying(true)
      
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume()
      } else {
        speakCurrent(activeSummaryId)
      }
    }
  }

  const handleStop = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return

    window.speechSynthesis.cancel()
    
    setActiveSummaryId(null)
    setIsPlaying(false)
    setCurrentSentenceIndex(0)
    
    activeSummaryIdRef.current = null
    isPlayingRef.current = false
    currentIndexRef.current = 0
    sentencesRef.current = []
  }

  const handleSpeedChange = (rate: number) => {
    setPlaybackRate(rate)
    playbackRateRef.current = rate

    if (activeSummaryId && isPlaying) {
      speakCurrent(activeSummaryId)
    }
  }  // Sync activeSubject when subject prop changes
  useEffect(() => {
    if (subject && subject !== "all") {
      setActiveSubject(subject)
      setShowSubjectSelect(false)
    } else {
      setShowSubjectSelect(true)
    }
  }, [subject])

  // Filter summaries based on syllabus and search query
  useEffect(() => {
    // First filter by syllabus
    let filtered = allSummariesList.filter(summary => summary.syllabus === syllabus || summary.syllabus === "General")

    // Then filter by search query if present
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(summary =>
        summary.title.toLowerCase().includes(query) ||
        summary.content.toLowerCase().includes(query) ||
        summary.subject.toLowerCase().includes(query)
      )
    }

    setFilteredSummaries(filtered.length > 0 ? filtered : [])

    // Set initial active subject if not already set or is 'all'
    if (activeSubject === "all" || !activeSubject) {
      const subjectsSet = new Set(filtered.map(summary => summary.subject))
      if (subjectsSet.size > 0) {
        const subjectsArray = Array.from(subjectsSet)
        if (subject && subjectsArray.includes(subject)) {
          setActiveSubject(subject)
        } else {
          setActiveSubject(subjectsArray[0])
        }
      }
    }
  }, [allSummariesList, syllabus, searchQuery, activeSubject, subject])
  // Get unique subjects for tabs
  const subjects = Array.from(new Set(
    (searchQuery.trim() ? filteredSummaries : allSummariesList)
      .filter(summary => summary.syllabus === syllabus || summary.syllabus === "General")
      .map(summary => summary.subject)
  ))

  // Handle copy to clipboard
  const handleCopy = (summary: StudySummary) => {
    navigator.clipboard.writeText(summary.content)
    setCopiedId(summary.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Handle print summary
  const handlePrint = (summary: StudySummary) => {
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${summary.title}</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; }
              h1 { color: #333; }
              .meta { color: #666; margin-bottom: 20px; }
              .content { margin-top: 20px; }
            </style>
          </head>
          <body>
            <h1>${summary.title}</h1>
            <div class="meta">
              <p>Subject: ${summary.subject}</p>
              <p>Syllabus: ${summary.syllabus}</p>
              <p>Date: ${new Date().toLocaleDateString()}</p>
            </div>
            <div class="content">
              ${summary.content.replace(/\n/g, '<br>')}
            </div>
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

  // Handle share summary
  const handleShare = async (summary: StudySummary) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: summary.title,
          text: `${summary.title} - ${summary.subject}\n\n${summary.content.substring(0, 100)}...`,
          url: window.location.href,
        })
      } catch (error) {
        console.error('Error sharing:', error)
      }
    } else {
      // Fallback to copy link if Web Share API is not available
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  const translations = {
    summaries: {
      en: "Study Summaries",
      hi: "अध्ययन सारांश",
      te: "అధ్యయన సారాంశాలు",
    },
    allSubjects: {
      en: "All Subjects",
      hi: "सभी विषय",
      te: "అన్ని విషయాలు",
    },
    downloadSummary: {
      en: "Download",
      hi: "डाउनलोड",
      te: "డౌన్‌లోడ్",
    },
    print: {
      en: "Print",
      hi: "प्रिंट",
      te: "ప్రింట్",
    },
    share: {
      en: "Share",
      hi: "शेयर",
      te: "షేర్",
    },
    copy: {
      en: "Copy",
      hi: "कॉपी",
      te: "కాపీ",
    },
    copied: {
      en: "Copied!",
      hi: "कॉपी किया गया!",
      te: "కాపీ చేయబడింది!",
    },
    search: {
      en: "Search summaries...",
      hi: "सारांश खोजें...",
      te: "సారాంశాలను శోధించండి...",
    },
    listen: {
      en: "Listen",
      hi: "सुनें",
      te: "వినండి",
    },
    speed: {
      en: "Speed",
      hi: "गति",
      te: "వేగం",
    },
    cardView: {
      en: "Card View",
      hi: "कार्ड व्यू",
      te: "కార్డ్ వ్యూ",
    },
    compactView: {
      en: "Compact View",
      hi: "कॉम्पैक्ट व्यू",
      te: "కంపాక్ట్ వ్యూ",
    },
    close: {
      en: "Close",
      hi: "बंद करें",
      te: "మూసివేయండి",
    },
    noSummaries: {
      en: "No summaries available for this syllabus.",
      hi: "इस पाठ्यक्रम के लिए कोई सारांश उपलब्ध नहीं है।",
      te: "ఈ సిలబస్ కోసం సారాంశాలు అందుబాటులో లేవు.",
    },
    noResults: {
      en: "No results found for your search.",
      hi: "आपकी खोज के लिए कोई परिणाम नहीं मिला।",
      te: "మీ శోధనకు ఎటువంటి ఫలితాలు లభించలేదు.",
    }
  }

  const handleDownloadSummary = async (summary: StudySummary) => {
    // Create a formatted summary
    const formattedSummary = `
Study Summary - ${summary.title}
=======================
Subject: ${summary.subject}
Syllabus: ${summary.syllabus}
Date: ${new Date().toLocaleDateString()}

${summary.content}
    `.trim()

    // Create a blob and download link
    const blob = new Blob([formattedSummary], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${summary.title.replace(/\\s+/g, '-').toLowerCase()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    // Update school portal
    try {
      await updateSchoolPortal({
        studentId: "current-user",
        activityType: 'tutor',
        activityDetails: {
          subject: summary.subject,
          completed: true,
          timestamp: Date.now()
        }
      });
    } catch (error) {
      console.error('Failed to update school portal:', error);
    }
  }

  if (showSubjectSelect) {
    return (
      <div className="w-full max-w-2xl mx-auto space-y-6 py-4 px-2">
        <div className="flex items-center justify-between animate-fade-in">
          <h2 className="text-xl font-bold flex items-center gap-2 text-foreground">
            <BookOpen className="text-primary" size={20} />
            Choose Subject for Summaries
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X size={18} />
          </Button>
        </div>
        <p className="text-muted-foreground text-sm">
          Select a subject to browse and study its summaries.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {subjects.map((subj) => {
            const config = SUBJECTS_CONFIG[subj as keyof typeof SUBJECTS_CONFIG] || {
              icon: BookOpen,
              color: "text-foreground",
              gradient: "from-gray-500/10 to-transparent",
              border: "border-border hover:border-gray-500",
              description: "Browse subject summaries."
            }
            const IconComponent = config.icon
            const summaryCount = allSummariesList.filter(
              s => s.subject === subj && (s.syllabus === syllabus || s.syllabus === "General")
            ).length

            return (
              <motion.div
                key={subj}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setActiveSubject(subj)
                  setShowSubjectSelect(false)
                }}
                className="cursor-pointer"
              >
                <Card className={`overflow-hidden border-2 h-full transition-all duration-300 shadow-sm hover:shadow-md bg-gradient-to-br ${config.gradient} ${config.border}`}>
                  <CardContent className="p-5 flex flex-col justify-between h-full gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl bg-background flex items-center justify-center shadow-sm ${config.color}`}>
                        <IconComponent size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-foreground">{subj}</h3>
                        <p className="text-xs text-muted-foreground">{summaryCount} summaries available</p>
                      </div>
                    </div>
                    <p className="text-sm text-foreground/80 leading-relaxed font-light">{config.description}</p>
                    <div className="flex items-center text-xs font-semibold text-primary mt-2">
                      View Notes <ChevronRight size={14} className="ml-1" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* Custom AI Generation Options */}
        <div className="mt-6 pt-4 border-t border-border">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Column 1: Custom AI Summary Generation Block */}
            <Card className="border-2 border-dashed border-purple-500/30 bg-gradient-to-br from-purple-500/5 via-indigo-500/5 to-transparent dark:from-purple-950/10 dark:via-indigo-950/5 dark:to-transparent shadow-sm">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 dark:bg-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0 border border-purple-500/25">
                    <Sparkles size={20} className="text-purple-500 animate-pulse" />
                  </div>
                  <div className="space-y-0.5 text-left">
                    <h4 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                      Generate Custom Summary
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Enter any topic & subject to generate a detailed summary and mind map instantly using Gemini AI.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5 text-left">
                    <span className="text-[11px] font-semibold text-muted-foreground">Select Subject:</span>
                    <select
                      className="w-full h-9 rounded-lg border border-input bg-background px-3 py-1 text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      value={aiTargetSubject}
                      onChange={(e) => {
                        setAiTargetSubject(e.target.value)
                        if (e.target.value !== "Other") {
                          setCustomAiSubject("")
                        }
                      }}
                    >
                      {["Science", "Math", "Social Studies", "English", "Other"].map((subj) => (
                        <option key={subj} value={subj} className="bg-background">
                          {subj}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5 text-left">
                    <span className="text-[11px] font-semibold text-muted-foreground">Enter Topic Name:</span>
                    <Input
                      type="text"
                      placeholder="e.g. Photosynthesis, Linear Equations"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-9 text-xs rounded-lg"
                    />
                  </div>
                </div>

                {aiTargetSubject === "Other" && (
                  <div className="space-y-1.5 text-left max-w-[280px]">
                    <span className="text-[11px] font-semibold text-muted-foreground">Custom Subject Name:</span>
                    <Input
                      type="text"
                      placeholder="e.g. Computer Science, Geography"
                      value={customAiSubject}
                      onChange={(e) => setCustomAiSubject(e.target.value)}
                      className="h-9 text-xs rounded-lg"
                    />
                  </div>
                )}

                <Button
                  onClick={handleGenerateAISummary}
                  disabled={isGeneratingAI || !searchQuery.trim()}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-semibold shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 py-2 px-4 rounded-lg border border-indigo-500/20"
                >
                  <Sparkles size={14} />
                  Generate Summary & Mind Map
                </Button>
              </CardContent>
            </Card>

            {/* Column 2: Document Summarization Block */}
            <Card className="border-2 border-dashed border-purple-500/30 bg-gradient-to-br from-purple-500/5 via-indigo-500/5 to-transparent dark:from-purple-950/10 dark:via-indigo-950/5 dark:to-transparent shadow-sm">
              <CardContent className="p-5 space-y-4 flex flex-col justify-between h-full">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/10 dark:bg-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0 border border-purple-500/25">
                      <Upload size={20} className="text-purple-500 animate-pulse" />
                    </div>
                    <div className="space-y-0.5 text-left">
                      <h4 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                        Generate from Document
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Upload a slide deck or notes file (PDF, PPT, PPTX, TXT) to create summaries & mind maps.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5 text-left">
                      <span className="text-[11px] font-semibold text-muted-foreground">Select Subject:</span>
                      <select
                        className="w-full h-9 rounded-lg border border-input bg-background px-3 py-1 text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        value={uploadSubject}
                        onChange={(e) => {
                          setUploadSubject(e.target.value)
                          if (e.target.value !== "Other") {
                            setCustomUploadSubject("")
                          }
                        }}
                      >
                        {["Science", "Math", "Social Studies", "English", "Other"].map((subj) => (
                          <option key={subj} value={subj} className="bg-background">
                            {subj}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5 text-left">
                      <span className="text-[11px] font-semibold text-muted-foreground">Upload File:</span>
                      <div
                        onDragEnter={handleDrag}
                        onDragOver={handleDrag}
                        onDragLeave={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => document.getElementById("direct-file-upload-input")?.click()}
                        className={`h-9 border border-input rounded-lg flex items-center justify-center px-3 text-xs cursor-pointer hover:bg-muted/30 transition-colors ${
                          selectedFile ? "border-purple-500/50 bg-purple-500/5" : "border-border"
                        }`}
                      >
                        <input
                          id="direct-file-upload-input"
                          type="file"
                          accept=".pdf,.pptx,.ppt,.txt"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              const file = e.target.files[0]
                              if (file.size > 15 * 1024 * 1024) {
                                setUploadError("File size exceeds the 15MB limit.")
                                setSelectedFile(null)
                              } else {
                                setSelectedFile(file)
                                setUploadError(null)
                              }
                            }
                          }}
                        />
                        <span className="truncate max-w-[150px] text-muted-foreground font-medium flex items-center gap-1.5">
                          {selectedFile ? selectedFile.name : <>Select PPT/PDF/TXT</>}
                        </span>
                      </div>
                    </div>
                  </div>

                  {uploadSubject === "Other" && (
                    <div className="space-y-1.5 text-left max-w-[280px]">
                      <span className="text-[11px] font-semibold text-muted-foreground">Custom Subject Name:</span>
                      <Input
                        type="text"
                        placeholder="e.g. Computer Science, Geography"
                        value={customUploadSubject}
                        onChange={(e) => setCustomUploadSubject(e.target.value)}
                        className="h-9 text-xs rounded-lg"
                      />
                    </div>
                  )}

                  {uploadError && (
                    <div className="p-2 bg-red-500/10 border border-red-500/20 text-red-500 text-[11px] rounded-lg">
                      {uploadError}
                    </div>
                  )}
                </div>

                <Button
                  onClick={handleUploadAndSummarize}
                  disabled={(uploadStep !== "idle" && uploadStep !== "complete") || !selectedFile}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-semibold shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 py-2 px-4 rounded-lg border border-indigo-500/20 mt-auto"
                >
                  {uploadStep === "reading" && <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Reading...</>}
                  {uploadStep === "parsing" && <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Extracting slides...</>}
                  {uploadStep === "ai_generating" && <><Loader2 className="w-3.5 h-3.5 animate-spin" /> AI Generating...</>}
                  {uploadStep === "complete" && <>Success!</>}
                  {uploadStep === "idle" && (
                    <>
                      <Upload size={14} />
                      Upload & Generate Summary
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (allSummariesList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p>{translations.noSummaries[language]}</p>
        <Button onClick={onClose} className="mt-4">
          {translations.close[language]}
        </Button>
      </div>
    )
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          {subject === "all" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSubjectSelect(true)}
              className="mr-2 h-8 text-xs flex items-center gap-1 hover:bg-muted"
            >
              <ArrowLeft size={12} />
              Subjects
            </Button>
          )}
          <BookOpen size={20} />
          {translations.summaries[language]}
        </h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X size={18} />
        </Button>
      </div>

      {/* Search and View Controls */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={translations.search[language]}
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button
          variant="outline"
          className="flex items-center gap-1.5 h-9 px-3 border-purple-500/30 hover:border-purple-500 hover:bg-purple-50/50 dark:hover:bg-purple-950/20 text-purple-600 dark:text-purple-400 font-semibold"
          onClick={() => setShowUploadDialog(true)}
        >
          <Upload size={14} />
          <span>Upload PDF/PPT</span>
        </Button>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setViewMode(viewMode === "card" ? "compact" : "card")}
              >
                 {viewMode === "card" ? <FileText size={16} /> : <LayoutGrid size={16} />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {viewMode === "card" ? translations.compactView[language] : translations.cardView[language]}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {isGeneratingAI ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center space-y-6 bg-muted/20 dark:bg-card/30 rounded-2xl border-2 border-dashed border-purple-500/20 backdrop-blur-sm">
          <div className="relative flex items-center justify-center w-20 h-20">
            <div className="absolute inset-0 rounded-full border-4 border-purple-500/20 dark:border-purple-500/10 animate-pulse"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-purple-600 dark:border-t-purple-400 animate-spin"></div>
            <Sparkles size={28} className="text-purple-600 dark:text-purple-400 animate-pulse" />
          </div>
          <div className="space-y-2 max-w-md text-center flex flex-col items-center">
            <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">
              Creating Study Summary
            </h3>
            <p className="text-sm text-muted-foreground">
              Gemini AI is researching <strong className="text-foreground">"{searchQuery}"</strong>, generating key concepts, and constructing an interactive mind map...
            </p>
          </div>
        </div>
      ) : filteredSummaries.length === 0 ? (
        <div className="space-y-6">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {searchQuery ? translations.noResults[language] : translations.noSummaries[language]}
            </h3>
          </div>

          {searchQuery.trim() !== "" && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="overflow-hidden border-2 border-purple-500/30 bg-gradient-to-br from-purple-500/10 via-indigo-500/5 to-transparent dark:from-purple-950/20 dark:via-indigo-950/10 dark:to-transparent shadow-md hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 dark:bg-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0 shadow-sm border border-purple-500/20">
                      <Sparkles size={24} className="animate-pulse" />
                    </div>
                    <div className="space-y-1 text-left">
                      <h4 className="font-bold text-lg text-foreground flex items-center gap-1.5">
                        Generate Summary with Gemini AI
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        No preloaded summary found for <strong className="text-foreground font-semibold">"{searchQuery}"</strong>. 
                        Let Gemini AI generate a detailed study summary and interactive mind map instantly.
                      </p>
                      <div className="mt-3.5 flex flex-wrap items-center gap-2 pt-1">
                        <span className="text-xs font-semibold text-muted-foreground">Select Subject:</span>
                        {["Science", "Math", "Social Studies", "English", "Other"].map((subj) => (
                          <Badge
                            key={subj}
                            variant={aiTargetSubject === subj ? "default" : "outline"}
                            className="cursor-pointer transition-all duration-200 hover:scale-105"
                            onClick={() => {
                              setAiTargetSubject(subj)
                              if (subj !== "Other") {
                                setCustomAiSubject("")
                              }
                            }}
                          >
                            {subj}
                          </Badge>
                        ))}
                      </div>

                      {aiTargetSubject === "Other" && (
                        <div className="mt-3 space-y-1.5 text-left max-w-[240px]">
                          <span className="text-[11px] font-semibold text-muted-foreground">Custom Subject Name:</span>
                          <Input
                            type="text"
                            placeholder="e.g. Computer Science, Geography"
                            value={customAiSubject}
                            onChange={(e) => setCustomAiSubject(e.target.value)}
                            className="h-8 text-xs rounded-lg"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    onClick={handleGenerateAISummary}
                    disabled={isGeneratingAI}
                    className="w-full md:w-auto bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 shrink-0 py-5 px-6 rounded-xl border border-indigo-500/30"
                  >
                    <Sparkles size={16} />
                    Generate with AI
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      ) : null}

      {!isGeneratingAI && filteredSummaries.length > 0 && (
        <Tabs value={activeSubject} onValueChange={setActiveSubject} className="w-full">
          <TabsList className="mb-4 w-full flex-wrap h-auto bg-muted/50 p-1">
            {subjects.map(subject => (
              <TabsTrigger
                key={subject}
                value={subject}
                className="flex-1 text-xs sm:text-sm py-1.5 sm:py-2"
              >
                {subject}
              </TabsTrigger>
            ))}
          </TabsList>

          {subjects.map(subject => (
            <TabsContent key={subject} value={subject} className="space-y-4">
              {filteredSummaries
                .filter(summary => summary.subject === subject)
                .map(summary => (
                  <motion.div
                    key={summary.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="bg-card dark:bg-card text-card-foreground dark:text-card-foreground">
                      <CardHeader className={`${viewMode === "compact" ? 'pb-2' : 'pb-3'} bg-primary/5 dark:bg-primary/10`}>
                        <CardTitle className="text-lg flex items-center justify-between">
                          <span>{summary.title}</span>
                          <Badge variant="outline">{summary.subject}</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className={`${viewMode === "compact" ? 'pt-3 pb-3' : 'pt-4'}`}>
                        <div className={`prose prose-sm dark:prose-invert max-w-none ${viewMode === "compact" ? 'line-clamp-3' : ''}`}>
                          {activeSummaryId === summary.id ? (
                            <p className="whitespace-pre-wrap">
                              {splitIntoSentences(summary.content).map((sentence, idx) => {
                                const isHighlighted = idx === currentSentenceIndex;
                                return (
                                  <span
                                    key={idx}
                                    className={
                                      isHighlighted
                                        ? "bg-yellow-200 dark:bg-yellow-800/50 text-yellow-950 dark:text-yellow-100 transition-colors duration-200 px-1 py-0.5 rounded font-medium shadow-sm inline"
                                        : "text-foreground/90 transition-colors duration-200"
                                    }
                                  >
                                    {sentence}{" "}
                                  </span>
                                );
                              })}
                            </p>
                          ) : (
                            <p className="whitespace-pre-wrap">{summary.content}</p>
                          )}
                        </div>

                        {/* AI Quick Study Actions (Quiz & Flashcards) */}
                        <div className="mt-4 p-3 bg-gradient-to-r from-purple-500/10 via-indigo-500/5 to-transparent dark:from-purple-950/20 dark:via-indigo-950/10 dark:to-transparent rounded-xl border border-purple-500/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
                          <div className="flex items-center gap-2">
                            <Sparkles size={16} className="text-purple-600 dark:text-purple-400 shrink-0 animate-pulse" />
                            <div>
                              <h4 className="text-xs font-semibold text-foreground">Transform into Interactive Study Tools</h4>
                              <p className="text-[10px] text-muted-foreground font-light">Test your understanding of this topic with AI-generated quizzes or flashcards.</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 sm:flex-initial h-7 text-[10px] border-purple-300 dark:border-purple-800 text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/30 flex items-center gap-1"
                              onClick={() => onTriggerQuiz && onTriggerQuiz(summary.subject, summary.title)}
                            >
                              <Brain size={12} />
                              Generate Quiz
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 sm:flex-initial h-7 text-[10px] border-indigo-300 dark:border-indigo-800 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 flex items-center gap-1"
                              onClick={() => onTriggerFlashcards && onTriggerFlashcards(summary.subject, summary.title)}
                            >
                              <FileText size={12} />
                              Generate Flashcards
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex flex-wrap justify-start sm:justify-end items-center gap-2 pt-2 pb-3">
                        {activeSummaryId === summary.id ? (
                          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full border border-border mr-auto">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-blue-600 dark:text-blue-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full"
                              onClick={handlePlayPause}
                              title={isPlaying ? "Pause" : "Play"}
                            >
                              {isPlaying ? <Pause size={13} /> : <Play size={13} />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-red-500 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full"
                              onClick={handleStop}
                              title="Stop"
                            >
                              <Square size={11} fill="currentColor" />
                            </Button>
                            <span className="text-xs text-muted-foreground select-none">|</span>
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-muted-foreground mr-0.5">
                                {translations.speed[language]}:
                              </span>
                              <select
                                value={playbackRate}
                                onChange={(e) => handleSpeedChange(Number(e.target.value))}
                                className="text-xs bg-transparent border-0 font-medium focus:ring-0 focus:outline-none cursor-pointer pr-1 py-0"
                              >
                                <option value="0.75" className="bg-background">0.75x</option>
                                <option value="1" className="bg-background">1.0x</option>
                                <option value="1.25" className="bg-background">1.25x</option>
                                <option value="1.5" className="bg-background">1.5x</option>
                                <option value="2" className="bg-background">2.0x</option>
                              </select>
                            </div>
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1 h-8 bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:hover:bg-blue-900/30 dark:text-blue-300 dark:border-blue-900/30 mr-auto"
                            onClick={() => handleStartSpeech(summary)}
                          >
                            <Volume2 size={14} />
                            {translations.listen[language]}
                          </Button>
                        )}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => handleCopy(summary)}
                              >
                                {copiedId === summary.id ? (
                                  <span className="text-xs text-green-600">{translations.copied[language]}</span>
                                ) : (
                                  <Copy size={14} />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>{translations.copy[language]}</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => handlePrint(summary)}
                              >
                                <Printer size={14} />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>{translations.print[language]}</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => handleShare(summary)}
                              >
                                <Share2 size={14} />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>{translations.share[language]}</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1 h-8 bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950/20 dark:hover:bg-purple-900/30 dark:text-purple-300 dark:border-purple-900/30"
                          onClick={() => setActiveMindMapSummary(summary)}
                        >
                          <Workflow size={14} />
                          Mind Map
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1 h-8"
                          onClick={() => handleDownloadSummary(summary)}
                        >
                          <Download size={14} />
                          {translations.downloadSummary[language]}
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
            </TabsContent>
          ))}
        </Tabs>
      )}

      {/* Mind Map Overlay Modal */}
      <AnimatePresence>
        {activeMindMapSummary && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-3xl relative"
            >
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-3 top-3 z-50 bg-white/85 hover:bg-white dark:bg-slate-800/80 dark:hover:bg-slate-800 rounded-full"
                onClick={() => setActiveMindMapSummary(null)}
              >
                <X size={18} />
              </Button>

              <div className="bg-white dark:bg-card p-4 rounded-xl shadow-2xl border border-border dark:border-border">
                <MindMap
                  data={activeMindMapSummary.customMindMapData || getMindMapData(activeMindMapSummary.title, activeMindMapSummary.subject)}
                  title={`${activeMindMapSummary.title} - Concept Map`}
                  language={language}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Document Overlay Modal */}
      <AnimatePresence>
        {showUploadDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white dark:bg-slate-900 border border-border dark:border-slate-800 text-foreground w-full max-w-md rounded-2xl shadow-2xl p-6 relative overflow-hidden"
            >
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-4 rounded-full text-muted-foreground hover:text-foreground"
                onClick={() => {
                  if (uploadStep === "idle" || uploadStep === "complete") {
                    setShowUploadDialog(false)
                    setSelectedFile(null)
                    setUploadError(null)
                  }
                }}
                disabled={uploadStep !== "idle" && uploadStep !== "complete"}
              >
                <X size={18} />
              </Button>

              <div className="space-y-4 text-left">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                    <Upload size={18} />
                  </div>
                  <h3 className="text-lg font-bold">Generate from Document</h3>
                </div>
                
                <p className="text-xs text-muted-foreground">
                  Upload a class slide deck or notes file, and Gemini AI will parse its pages to create summaries and mind maps instantly.
                </p>

                {uploadStep === "idle" ? (
                  <>
                    {/* Drag and Drop Zone */}
                    <div
                      onDragEnter={handleDrag}
                      onDragOver={handleDrag}
                      onDragLeave={handleDrag}
                      onDrop={handleDrop}
                      onClick={() => document.getElementById("file-upload-input")?.click()}
                      className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
                        dragActive 
                          ? "border-purple-500 bg-purple-50/30 dark:bg-purple-950/10" 
                          : "border-border hover:border-purple-400/50 hover:bg-muted/30"
                      }`}
                    >
                      <input
                        id="file-upload-input"
                        type="file"
                        accept=".pdf,.pptx,.ppt,.txt"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            const file = e.target.files[0]
                            if (file.size > 15 * 1024 * 1024) {
                              setUploadError("File size exceeds the 15MB limit.")
                              setSelectedFile(null)
                            } else {
                              setSelectedFile(file)
                              setUploadError(null)
                            }
                          }
                        }}
                      />
                      <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-3 animate-pulse" />
                      <p className="text-xs font-semibold">
                        {selectedFile ? selectedFile.name : "Drag & drop file here or click to browse"}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-1.5">
                        Supports PDF, PPT, PPTX or TXT (Max 15MB)
                      </p>
                    </div>

                    {selectedFile && (
                      <div className="space-y-3 bg-muted/20 dark:bg-slate-800/30 border border-border/50 rounded-xl p-3 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-muted-foreground">File Selected:</span>
                          <span className="font-medium text-foreground truncate max-w-[200px]" title={selectedFile.name}>
                            {selectedFile.name}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-muted-foreground">Size:</span>
                          <span className="font-medium text-foreground">
                            {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Subject Mapping */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground">Select Study Subject:</label>
                      <select
                        value={uploadSubject}
                        onChange={(e) => setUploadSubject(e.target.value)}
                        className="w-full h-9 rounded-lg border border-input bg-background px-3 py-1 text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      >
                        <option value="Science">Science</option>
                        <option value="Math">Math</option>
                        <option value="Social Studies">Social Studies</option>
                        <option value="English">English</option>
                        <option value="Other">Other (Custom Subject)</option>
                      </select>
                    </div>

                    {uploadSubject === "Other" && (
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground">Custom Subject Name:</label>
                        <Input
                          placeholder="e.g. Computer Science, Economics"
                          value={customUploadSubject}
                          onChange={(e) => setCustomUploadSubject(e.target.value)}
                          className="h-9 text-xs rounded-lg"
                        />
                      </div>
                    )}

                    {uploadError && (
                      <p className="text-xs text-destructive font-medium text-center bg-destructive/10 p-2.5 rounded-lg border border-destructive/20">
                        {uploadError}
                      </p>
                    )}

                    <Button
                      onClick={() => handleUploadAndSummarize()}
                      disabled={!selectedFile}
                      className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-xl text-xs py-2 px-4 shadow-md transition-all duration-200"
                    >
                      Analyze & Summarize Document
                    </Button>
                  </>
                ) : (
                  /* Glowing Multi-Step Parsing Status UI */
                  <div className="py-6 space-y-6 flex flex-col items-center justify-center text-center">
                    <Loader2 size={36} className="animate-spin text-purple-600 dark:text-purple-400" />
                    
                    <div className="space-y-3 w-full">
                      <div className="flex flex-col gap-2 items-center text-xs">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${
                            uploadStep === "reading" ? "bg-purple-500 animate-ping" : "bg-green-500"
                          }`} />
                          <span className={uploadStep === "reading" ? "font-bold text-foreground" : "text-muted-foreground"}>
                            Reading document pages...
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${
                            uploadStep === "parsing" ? "bg-purple-500 animate-ping" : 
                            uploadStep === "reading" ? "bg-muted-foreground/30" : "bg-green-500"
                          }`} />
                          <span className={uploadStep === "parsing" ? "font-bold text-foreground" : "text-muted-foreground"}>
                            Extracting text content...
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${
                            uploadStep === "ai_generating" ? "bg-purple-500 animate-ping" : 
                            (uploadStep === "reading" || uploadStep === "parsing") ? "bg-muted-foreground/30" : "bg-green-500"
                          }`} />
                          <span className={uploadStep === "ai_generating" ? "font-bold text-foreground" : "text-muted-foreground"}>
                            Gemini AI generating summaries...
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${
                            uploadStep === "complete" ? "bg-green-500" : "bg-muted-foreground/30"
                          }`} />
                          <span className={uploadStep === "complete" ? "font-bold text-foreground" : "text-muted-foreground"}>
                            Complete! Study guide ready.
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
