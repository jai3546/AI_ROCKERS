"use client"

import { useRef, useState } from "react"
import { motion } from "framer-motion"
import {
  FileText,
  GraduationCap,
  Link2,
  Loader2,
  Sparkles,
  Upload,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { ingestContent } from "@/services/content-ingestion"
import { generateCourseFromContent } from "@/services/course-generation"
import { saveCourse } from "@/services/course-storage"
import type { Course, CourseGenerationProgress, SourceType, Syllabus } from "@/types/course"

interface CourseCreatorProps {
  onClose: () => void
  onCourseCreated: (course: Course) => void
  syllabus?: Syllabus
  language?: "en" | "hi" | "te"
}

export function CourseCreator({
  onClose,
  onCourseCreated,
  syllabus = "General",
  language = "en",
}: CourseCreatorProps) {
  const [sourceType, setSourceType] = useState<SourceType>("paste")
  const [pastedText, setPastedText] = useState("")
  const [url, setUrl] = useState("")
  const [subject, setSubject] = useState("General")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState<CourseGenerationProgress | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const pdfInputRef = useRef<HTMLInputElement>(null)

  const labels = {
    en: {
      title: "Create Course from Content",
      subtitle: "Upload or paste any material — AI will structure it into a guided course",
      paste: "Paste Notes",
      file: "Text File",
      pdf: "PDF",
      url: "Web Link",
      pastePlaceholder: "Paste your study notes, lecture content, or any learning material here...",
      urlPlaceholder: "https://example.com/article",
      subject: "Subject",
      generate: "Generate Course",
      generating: "Generating your course...",
      selectFile: "Choose .txt or .md file",
      selectPdf: "Choose PDF file",
    },
    hi: {
      title: "सामग्री से कोर्स बनाएं",
      subtitle: "कोई भी सामग्री अपलोड या पेस्ट करें — AI इसे एक संरचित कोर्स में बदल देगा",
      paste: "नोट्स पेस्ट करें",
      file: "टेक्स्ट फ़ाइल",
      pdf: "PDF",
      url: "वेब लिंक",
      pastePlaceholder: "अपने अध्ययन नोट्स या लेक्चर सामग्री यहाँ पेस्ट करें...",
      urlPlaceholder: "https://example.com/article",
      subject: "विषय",
      generate: "कोर्स बनाएं",
      generating: "आपका कोर्स बनाया जा रहा है...",
      selectFile: ".txt या .md फ़ाइल चुनें",
      selectPdf: "PDF फ़ाइल चुनें",
    },
    te: {
      title: "కంటెంట్ నుండి కోర్స్ సృష్టించండి",
      subtitle: "ఏదైనా మెటీరియల్ అప్‌లోడ్ లేదా పేస్ట్ చేయండి — AI దానిని గైడెడ్ కోర్స్‌గా నిర్మిస్తుంది",
      paste: "నోట్స్ పేస్ట్ చేయండి",
      file: "టెక్స్ట్ ఫైల్",
      pdf: "PDF",
      url: "వెబ్ లింక్",
      pastePlaceholder: "మీ అధ్యయన నోట్స్ లేదా లెక్చర్ కంటెంట్ ఇక్కడ పేస్ట్ చేయండి...",
      urlPlaceholder: "https://example.com/article",
      subject: "విషయం",
      generate: "కోర్స్ సృష్టించండి",
      generating: "మీ కోర్స్ సృష్టించబడుతోంది...",
      selectFile: ".txt లేదా .md ఫైల్ ఎంచుకోండి",
      selectPdf: "PDF ఫైల్ ఎంచుకోండి",
    },
  }

  const t = labels[language]

  const handleGenerate = async () => {
    setError(null)
    setIsGenerating(true)
    setProgress({ stage: "chunking", message: "Starting...", progress: 0 })

    try {
      let input: string | File
      if (sourceType === "paste") {
        input = pastedText
      } else if (sourceType === "url") {
        input = url
      } else if (sourceType === "file" || sourceType === "pdf") {
        if (!selectedFile) {
          throw new Error(sourceType === "pdf" ? "Please select a PDF file." : "Please select a text file.")
        }
        input = selectedFile
      } else {
        throw new Error("Unsupported input type.")
      }

      const content = await ingestContent(sourceType, input)
      const course = await generateCourseFromContent(
        content,
        { subject, syllabus, maxModules: 6, targetAudience: "K-12" },
        setProgress
      )

      saveCourse(course)
      onCourseCreated(course)
    } catch (e) {
      const message = e instanceof Error ? e.message : "Course generation failed."
      setError(message)
      setProgress({ stage: "error", message, progress: 0 })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="flex flex-col max-h-[85vh]">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <GraduationCap className="text-primary" size={22} />
            {t.title}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">{t.subtitle}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} disabled={isGenerating}>
          <X size={18} />
        </Button>
      </div>

      <div className="p-4 overflow-y-auto flex-1 space-y-4">
        <Tabs value={sourceType} onValueChange={(v) => setSourceType(v as SourceType)}>
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="paste" disabled={isGenerating}>
              <FileText size={14} className="mr-1" />
              {t.paste}
            </TabsTrigger>
            <TabsTrigger value="file" disabled={isGenerating}>
              <Upload size={14} className="mr-1" />
              {t.file}
            </TabsTrigger>
            <TabsTrigger value="pdf" disabled={isGenerating}>
              <FileText size={14} className="mr-1" />
              {t.pdf}
            </TabsTrigger>
            <TabsTrigger value="url" disabled={isGenerating}>
              <Link2 size={14} className="mr-1" />
              {t.url}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="paste" className="mt-4">
            <Textarea
              placeholder={t.pastePlaceholder}
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              className="min-h-[200px] resize-y"
              disabled={isGenerating}
            />
          </TabsContent>

          <TabsContent value="file" className="mt-4">
            <Card
              className="border-dashed cursor-pointer hover:bg-accent/30 transition-colors"
              onClick={() => !isGenerating && fileInputRef.current?.click()}
            >
              <CardContent className="p-8 text-center">
                <Upload className="mx-auto mb-3 text-muted-foreground" size={32} />
                <p className="text-sm text-muted-foreground">{t.selectFile}</p>
                {selectedFile && sourceType === "file" && (
                  <p className="text-sm font-medium mt-2">{selectedFile.name}</p>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.md,.markdown"
                  className="hidden"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pdf" className="mt-4">
            <Card
              className="border-dashed cursor-pointer hover:bg-accent/30 transition-colors"
              onClick={() => !isGenerating && pdfInputRef.current?.click()}
            >
              <CardContent className="p-8 text-center">
                <FileText className="mx-auto mb-3 text-muted-foreground" size={32} />
                <p className="text-sm text-muted-foreground">{t.selectPdf}</p>
                {selectedFile && sourceType === "pdf" && (
                  <p className="text-sm font-medium mt-2">{selectedFile.name}</p>
                )}
                <input
                  ref={pdfInputRef}
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="url" className="mt-4">
            <Input
              placeholder={t.urlPlaceholder}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isGenerating}
            />
          </TabsContent>
        </Tabs>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>{t.subject}</Label>
            <Select value={subject} onValueChange={setSubject} disabled={isGenerating}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["General", "Math", "Science", "English", "Social Studies", "Computer Science"].map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {isGenerating && progress && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Loader2 className="animate-spin text-primary" size={16} />
              <span>{progress.message || t.generating}</span>
            </div>
            <Progress value={progress.progress} className="h-2" />
          </motion.div>
        )}

        {error && (
          <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
            {error}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-border">
        <Button
          className="w-full"
          onClick={handleGenerate}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <Loader2 className="animate-spin mr-2" size={18} />
              {t.generating}
            </>
          ) : (
            <>
              <Sparkles className="mr-2" size={18} />
              {t.generate}
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
