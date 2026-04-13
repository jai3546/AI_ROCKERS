"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { BookOpen, Download, X, Printer, Share2, Copy, FileText, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { updateSchoolPortal } from "@/services/school-portal-service"

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

  if (filteredSummaries.length === 0) {
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
                {viewMode === "card" ? <FileText size={16} /> : <Card size={16} />}
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
                          <p>{summary.content}</p>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-end gap-2 pt-0 pb-3">
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
    </div>
  )
}
