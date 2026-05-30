"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { BookOpen, Download, X, Printer, Share2, Copy, FileText, Search, Workflow, Volume2, Play, Pause, Square, LayoutGrid } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { updateSchoolPortal } from "@/services/school-portal-service"
import { MindMap } from "./mind-map"
import { getMindMapData } from "@/data/mind-map-data"

export interface StudySummary {
  id: string
  title: string
  content: string
  subject: string
  syllabus: "AP" | "Telangana" | "CBSE" | "General"
}

interface StudySummariesProps {
  summaries: StudySummary[]
  onClose: () => void
  language?: "en" | "hi" | "te"
  syllabus?: "AP" | "Telangana" | "CBSE" | "General"
}

export function StudySummaries({
  summaries,
  onClose,
  language = "en",
  syllabus = "General"
}: StudySummariesProps) {
  const [filteredSummaries, setFilteredSummaries] = useState<StudySummary[]>([])
  const [activeSubject, setActiveSubject] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [viewMode, setViewMode] = useState<"card" | "compact">("card")
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [activeMindMapSummary, setActiveMindMapSummary] = useState<StudySummary | null>(null)

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
  }

  // Filter summaries based on syllabus and search query
  useEffect(() => {
    // First filter by syllabus
    let filtered = summaries.filter(summary => summary.syllabus === syllabus || summary.syllabus === "General")

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

    // Set initial active subject if not already set
    if (activeSubject === "all") {
      const subjects = new Set(filtered.map(summary => summary.subject))
      if (subjects.size > 0) {
        setActiveSubject(Array.from(subjects)[0])
      }
    }
  }, [summaries, syllabus, searchQuery, activeSubject])

  // Get unique subjects for tabs
  const subjects = Array.from(new Set(summaries
    .filter(summary => summary.syllabus === syllabus || summary.syllabus === "General")
    .map(summary => summary.subject)))

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
        activityType: 'summary',
        activityDetails: {
          subject: summary.subject,
          summaryId: summary.id,
          downloaded: true,
          timestamp: Date.now()
        }
      });
    } catch (error) {
      console.error('Failed to update school portal:', error);
    }
  }

  if (summaries.length === 0) {
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

      {filteredSummaries.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">
            {searchQuery ? translations.noResults[language] : translations.noSummaries[language]}
          </h3>
        </div>
      )}

      {filteredSummaries.length > 0 && (
        <Tabs defaultValue={subjects[0]} className="w-full">
          <TabsList className="mb-4 w-full">
            {subjects.map(subject => (
              <TabsTrigger
                key={subject}
                value={subject}
                className="flex-1"
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
                      </CardContent>
                      <CardFooter className="flex justify-end items-center gap-2 pt-0 pb-3">
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
                  data={getMindMapData(activeMindMapSummary.title, activeMindMapSummary.subject)}
                  title={`${activeMindMapSummary.title} - Concept Map`}
                  language={language}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
