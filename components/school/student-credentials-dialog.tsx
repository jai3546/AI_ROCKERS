"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { X, Copy, Check, Key, User, School, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface StudentCredentialsDialogProps {
  student: {
    id: string
    name: string
    class: string
    rollNumber: string
    schoolCode: string
    studentId: string
  }
  onClose: () => void
  language?: "en" | "hi" | "te"
}

export function StudentCredentialsDialog({
  student,
  onClose,
  language = "en"
}: StudentCredentialsDialogProps) {
  const [schoolCodeCopied, setSchoolCodeCopied] = useState(false)
  const [studentIdCopied, setStudentIdCopied] = useState(false)
  
  const translations = {
    title: {
      en: "Student Login Credentials",
      hi: "छात्र लॉगिन क्रेडेंशियल्स",
      te: "విద్యార్థి లాగిన్ క్రెడెన్షియల్స్",
    },
    subtitle: {
      en: "Please save these credentials for the student to login",
      hi: "कृपया छात्र के लॉगिन के लिए इन क्रेडेंशियल्स को सहेजें",
      te: "విద్యార్థి లాగిన్ కోసం ఈ క్రెడెన్షియల్స్‌ను సేవ్ చేయండి",
    },
    schoolCode: {
      en: "School Code",
      hi: "स्कूल कोड",
      te: "స్కూల్ కోడ్",
    },
    studentId: {
      en: "Student ID",
      hi: "छात्र आईडी",
      te: "విద్యార్థి ఐడి",
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
    close: {
      en: "Close",
      hi: "बंद करें",
      te: "మూసివేయండి",
    },
    instructions: {
      en: "Instructions",
      hi: "निर्देश",
      te: "సూచనలు",
    },
    instructionsText: {
      en: "The student can use these credentials to login to the student portal. They will need to enter both the School Code and Student ID.",
      hi: "छात्र छात्र पोर्टल में लॉगिन करने के लिए इन क्रेडेंशियल्स का उपयोग कर सकता है। उन्हें स्कूल कोड और छात्र आईडी दोनों दर्ज करने होंगे।",
      te: "విద్యార్థి పోర్టల్‌లో లాగిన్ చేయడానికి విద్యార్థి ఈ క్రెడెన్షియల్స్‌ను ఉపయోగించవచ్చు. వారు స్కూల్ కోడ్ మరియు విద్యార్థి ఐడి రెండింటినీ నమోదు చేయాలి.",
    },
  }
  
  const copyToClipboard = (text: string, type: "schoolCode" | "studentId") => {
    navigator.clipboard.writeText(text)
    if (type === "schoolCode") {
      setSchoolCodeCopied(true)
      setTimeout(() => setSchoolCodeCopied(false), 2000)
    } else {
      setStudentIdCopied(true)
      setTimeout(() => setStudentIdCopied(false), 2000)
    }
  }
  
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="w-full max-w-md"
      >
        <Card className="border border-border dark:border-border shadow-lg">
          <CardHeader className="pb-3 relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2"
              onClick={onClose}
            >
              <X size={18} />
            </Button>
            <CardTitle>{translations.title[language]}</CardTitle>
            <p className="text-sm text-muted-foreground">{translations.subtitle[language]}</p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="p-4 bg-primary/10 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <User size={18} className="text-primary" />
                <span className="font-medium">{student.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <School size={18} className="text-primary" />
                <span>{student.class}</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="schoolCode" className="flex items-center gap-2">
                  <Key size={16} className="text-secondary" />
                  {translations.schoolCode[language]}
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="schoolCode"
                    value={student.schoolCode}
                    readOnly
                    className="font-mono bg-muted"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(student.schoolCode, "schoolCode")}
                  >
                    {schoolCodeCopied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="studentId" className="flex items-center gap-2">
                  <User size={16} className="text-secondary" />
                  {translations.studentId[language]}
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="studentId"
                    value={student.studentId}
                    readOnly
                    className="font-mono bg-muted"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(student.studentId, "studentId")}
                  >
                    {studentIdCopied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-start gap-2">
                <Info size={18} className="text-muted-foreground mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium mb-1">{translations.instructions[language]}</h4>
                  <p className="text-sm text-muted-foreground">
                    {translations.instructionsText[language]}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-end">
            <Button onClick={onClose}>{translations.close[language]}</Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}
