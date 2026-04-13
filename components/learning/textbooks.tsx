"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { BookMarked, BookOpen, Download, X, FileText, Search, ExternalLink, Bookmark } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export interface Textbook {
  id: string
  title: string
  subject: string
  grade: string
  syllabus: "AP" | "Telangana" | "CBSE" | "General"
  description: string
  coverImage: string
  pdfUrl: string
}

interface TextbooksProps {
  textbooks: Textbook[]
  onClose: () => void
  language?: "en" | "hi" | "te"
  syllabus?: "AP" | "Telangana" | "CBSE" | "General"
}

export function Textbooks({
  textbooks,
  onClose,
  language = "en",
  syllabus = "General"
}: TextbooksProps) {
  const [filteredTextbooks, setFilteredTextbooks] = useState<Textbook[]>(textbooks)
  const [activeSubject, setActiveSubject] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [viewMode, setViewMode] = useState<"card" | "compact">("card")

  // Get unique subjects
  const subjects = ["all", ...Array.from(new Set(textbooks.map(textbook => textbook.subject)))]

  // Filter textbooks based on search query and active subject
  const filterTextbooks = () => {
    let filtered = textbooks.filter(textbook => textbook.syllabus === syllabus || textbook.syllabus === "General")

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(textbook => 
        textbook.title.toLowerCase().includes(query) || 
        textbook.subject.toLowerCase().includes(query) ||
        textbook.description.toLowerCase().includes(query)
      )
    }

    if (activeSubject !== "all") {
      filtered = filtered.filter(textbook => textbook.subject === activeSubject)
    }

    setFilteredTextbooks(filtered)
  }

  // Update filtered textbooks when search query or active subject changes
  useState(() => {
    filterTextbooks()
  })

  const translations = {
    textbooks: {
      en: "Textbooks & Notes",
      hi: "पाठ्यपुस्तकें और नोट्स",
      te: "పాఠ్యపుస్తకాలు మరియు నోట్స్",
    },
    search: {
      en: "Search textbooks...",
      hi: "पाठ्यपुस्तकें खोजें...",
      te: "పాఠ్యపుస్తకాలను శోధించండి...",
    },
    all: {
      en: "All",
      hi: "सभी",
      te: "అన్నీ",
    },
    viewMode: {
      en: "View Mode",
      hi: "देखने का मोड",
      te: "వీక్షణ మోడ్",
    },
    card: {
      en: "Card",
      hi: "कार्ड",
      te: "కార్డ్",
    },
    compact: {
      en: "Compact",
      hi: "कॉम्पैक्ट",
      te: "కాంపాక్ట్",
    },
    open: {
      en: "Open",
      hi: "खोलें",
      te: "తెరవండి",
    },
    download: {
      en: "Download",
      hi: "डाउनलोड",
      te: "డౌన్‌లోడ్",
    },
    bookmark: {
      en: "Bookmark",
      hi: "बुकमार्क",
      te: "బుక్‌మార్క్",
    },
    grade: {
      en: "Grade",
      hi: "कक्षा",
      te: "తరగతి",
    },
    noTextbooks: {
      en: "No textbooks found",
      hi: "कोई पाठ्यपुस्तक नहीं मिली",
      te: "పాఠ్యపుస్తకాలు కనుగొనబడలేదు",
    },
  }

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    filterTextbooks()
  }

  // Handle subject tab change
  const handleSubjectChange = (subject: string) => {
    setActiveSubject(subject)
    filterTextbooks()
  }

  // Handle view mode change
  const handleViewModeChange = (mode: "card" | "compact") => {
    setViewMode(mode)
  }

  // Handle open textbook
  const handleOpenTextbook = (textbook: Textbook) => {
    window.open(textbook.pdfUrl, "_blank")
  }

  // Handle download textbook
  const handleDownloadTextbook = (textbook: Textbook) => {
    const link = document.createElement("a")
    link.href = textbook.pdfUrl
    link.download = `${textbook.title.replace(/\\s+/g, '-').toLowerCase()}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2 text-foreground dark:text-foreground">
          <BookMarked size={20} />
          {translations.textbooks[language]}
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
            onChange={handleSearchChange}
          />
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className={viewMode === "card" ? "bg-muted" : ""}
                onClick={() => handleViewModeChange("card")}
              >
                <BookOpen size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{translations.card[language]}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className={viewMode === "compact" ? "bg-muted" : ""}
                onClick={() => handleViewModeChange("compact")}
              >
                <FileText size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{translations.compact[language]}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {filteredTextbooks.length > 0 ? (
        <Tabs defaultValue={subjects[0]} className="w-full">
          <TabsList className="mb-4 w-full">
            {subjects.map(subject => (
              <TabsTrigger
                key={subject}
                value={subject}
                className="flex-1"
                onClick={() => handleSubjectChange(subject)}
              >
                {subject === "all" ? translations.all[language] : subject}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={activeSubject} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTextbooks.map(textbook => (
                <motion.div
                  key={textbook.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="bg-card dark:bg-card text-card-foreground dark:text-card-foreground h-full flex flex-col">
                    <CardHeader className="pb-2 bg-primary/5 dark:bg-primary/10">
                      <CardTitle className="text-lg flex items-center justify-between">
                        <span>{textbook.title}</span>
                        <Badge variant="outline">{textbook.subject}</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-3 pb-3 flex-1">
                      <div className="flex gap-4 mb-3">
                        <div className="w-20 h-28 bg-muted rounded-md overflow-hidden flex-shrink-0">
                          {textbook.coverImage ? (
                            <img 
                              src={textbook.coverImage} 
                              alt={textbook.title} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-primary/10">
                              <BookMarked size={24} className="text-primary/50" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm text-foreground/70 dark:text-foreground/80 mb-1">
                            {translations.grade[language]}: {textbook.grade}
                          </p>
                          <p className="text-sm text-muted-foreground dark:text-muted-foreground line-clamp-3">
                            {textbook.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2 pt-0 pb-3">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleOpenTextbook(textbook)}
                            >
                              <ExternalLink size={16} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{translations.open[language]}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleDownloadTextbook(textbook)}
                            >
                              <Download size={16} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{translations.download[language]}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Bookmark size={16} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{translations.bookmark[language]}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <BookMarked size={48} className="text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">{translations.noTextbooks[language]}</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            {searchQuery ? `No textbooks found for "${searchQuery}"` : "No textbooks available for the selected subject."}
          </p>
        </div>
      )}
    </div>
  )
}
