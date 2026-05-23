"use client"

import { useState, useEffect } from "react"
import {
  Check,
  ChevronDown,
  Edit,
  Loader2,
  MoreHorizontal,
  Plus,
  Search,
  Trash,
  UserPlus,
  X
} from "lucide-react"
import { StudentCredentialsDialog } from "./student-credentials-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { motion, AnimatePresence } from "framer-motion"

interface StudentManagementProps {
  language?: "en" | "hi" | "te"
}

// Student interface
interface Student {
  id: string
  name: string
  class: string
  rollNumber: string
  joinDate: string
  schoolCode?: string
  studentId?: string
  status: "active" | "inactive"
}

export function StudentManagement({ language = "en" }: StudentManagementProps) {
  const [students, setStudents] = useState<Student[]>([])
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedClass, setSelectedClass] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCredentialsDialog, setShowCredentialsDialog] = useState(false)
  const [newlyAddedStudent, setNewlyAddedStudent] = useState<Student | null>(null)

  // Form state for adding a new student
  const [newStudent, setNewStudent] = useState({
    name: "",
    class: "",
    rollNumber: "",
  })

  // Form validation errors
  const [formErrors, setFormErrors] = useState({
    name: "",
    class: "",
    rollNumber: "",
  })

  const translations = {
    studentManagement: {
      en: "Student Management",
      hi: "छात्र प्रबंधन",
      te: "విద్యార్థి నిర్వహణ",
    },
    addStudent: {
      en: "Add Student",
      hi: "छात्र जोड़ें",
      te: "విద్యార్థిని జోడించండి",
    },
    deleteStudent: {
      en: "Delete Student",
      hi: "छात्र हटाएं",
      te: "విద్యార్థిని తొలగించండి",
    },
    search: {
      en: "Search students...",
      hi: "छात्रों को खोजें...",
      te: "విద్యార్థులను శోధించండి...",
    },
    filterByClass: {
      en: "Filter by Class",
      hi: "कक्षा के अनुसार फ़िल्टर करें",
      te: "తరగతి ద్వారా ఫిల్టర్ చేయండి",
    },
    allClasses: {
      en: "All Classes",
      hi: "सभी कक्षाएं",
      te: "అన్ని తరగతులు",
    },
    name: {
      en: "Name",
      hi: "नाम",
      te: "పేరు",
    },
    class: {
      en: "Class",
      hi: "कक्षा",
      te: "తరగతి",
    },
    rollNumber: {
      en: "Roll Number",
      hi: "रोल नंबर",
      te: "రోల్ నంబర్",
    },
    status: {
      en: "Status",
      hi: "स्थिति",
      te: "స్థితి",
    },
    active: {
      en: "Active",
      hi: "सक्रिय",
      te: "యాక్టివ్",
    },
    inactive: {
      en: "Inactive",
      hi: "निष्क्रिय",
      te: "నిష్క్రియాత్మక",
    },
    actions: {
      en: "Actions",
      hi: "कार्रवाई",
      te: "చర్యలు",
    },
    edit: {
      en: "Edit",
      hi: "संपादित करें",
      te: "సవరించు",
    },
    delete: {
      en: "Delete",
      hi: "हटाएं",
      te: "తొలగించు",
    },
    cancel: {
      en: "Cancel",
      hi: "रद्द करें",
      te: "రద్దు చేయండి",
    },
    save: {
      en: "Save",
      hi: "सहेजें",
      te: "సేవ్ చేయండి",
    },
    confirmDelete: {
      en: "Are you sure you want to delete this student?",
      hi: "क्या आप वाकई इस छात्र को हटाना चाहते हैं?",
      te: "మీరు ఖచ్చితంగా ఈ విద్యార్థిని తొలగించాలనుకుంటున్నారా?",
    },
    deleteWarning: {
      en: "This action cannot be undone. This will permanently delete the student's data from the system.",
      hi: "यह क्रिया पूर्ववत नहीं की जा सकती है। यह छात्र के डेटा को सिस्टम से स्थायी रूप से हटा देगा।",
      te: "ఈ చర్యను రద్దు చేయలేము. ఇది విద్యార్థి డేటాను సిస్టమ్ నుండి శాశ్వతంగా తొలగిస్తుంది.",
    },
    noStudentsFound: {
      en: "No students found",
      hi: "कोई छात्र नहीं मिला",
      te: "విద్యార్థులు కనుగొనబడలేదు",
    },
    addNewStudent: {
      en: "Add New Student",
      hi: "नया छात्र जोड़ें",
      te: "కొత్త విద్యార్థిని జోడించండి",
    },
    studentDetails: {
      en: "Student Details",
      hi: "छात्र विवरण",
      te: "విద్యార్థి వివరాలు",
    },
    enterName: {
      en: "Enter student name",
      hi: "छात्र का नाम दर्ज करें",
      te: "విద్యార్థి పేరు నమోదు చేయండి",
    },
    selectClass: {
      en: "Select class",
      hi: "कक्षा चुनें",
      te: "తరగతిని ఎంచుకోండి",
    },
    enterRollNumber: {
      en: "Enter roll number",
      hi: "रोल नंबर दर्ज करें",
      te: "రోల్ నంబర్ నమోదు చేయండి",
    },
    nameRequired: {
      en: "Name is required",
      hi: "नाम आवश्यक है",
      te: "పేరు అవసరం",
    },
    classRequired: {
      en: "Class is required",
      hi: "कक्षा आवश्यक है",
      te: "తరగతి అవసరం",
    },
    rollNumberRequired: {
      en: "Roll number is required",
      hi: "रोल नंबर आवश्यक है",
      te: "రోల్ నంబర్ అవసరం",
    },
    studentAdded: {
      en: "Student added successfully",
      hi: "छात्र सफलतापूर्वक जोड़ा गया",
      te: "విద్యార్థి విజయవంతంగా జోడించబడింది",
    },
    studentDeleted: {
      en: "Student deleted successfully",
      hi: "छात्र सफलतापूर्वक हटा दिया गया",
      te: "విద్యార్థి విజయవంతంగా తొలగించబడింది",
    },
  }

  // Mock class data
  const classes = [
    { id: "all", name: translations.allClasses[language] },
    { id: "6a", name: "Class 6A" },
    { id: "6b", name: "Class 6B" },
    { id: "7a", name: "Class 7A" },
    { id: "7b", name: "Class 7B" },
    { id: "8a", name: "Class 8A" },
    { id: "8b", name: "Class 8B" },
    { id: "9a", name: "Class 9A" },
    { id: "9b", name: "Class 9B" },
    { id: "10a", name: "Class 10A" },
    { id: "10b", name: "Class 10B" },
  ]

  // Load mock student data
  useEffect(() => {
    const loadStudents = async () => {
      setIsLoading(true)
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Mock student data
        const mockStudents: Student[] = [
          {
            id: "s001",
            name: "Rahul Singh",
            class: "8A",
            rollNumber: "8A01",
            joinDate: "2023-06-15",
            status: "active"
          },
          {
            id: "s002",
            name: "Ananya Patel",
            class: "7B",
            rollNumber: "7B05",
            joinDate: "2023-06-10",
            status: "active"
          },
          {
            id: "s003",
            name: "Vikram Mehta",
            class: "9C",
            rollNumber: "9C03",
            joinDate: "2023-06-12",
            status: "active"
          },
          {
            id: "s004",
            name: "Priya Sharma",
            class: "6A",
            rollNumber: "6A08",
            joinDate: "2023-06-18",
            status: "inactive"
          },
          {
            id: "s005",
            name: "Arjun Kumar",
            class: "10B",
            rollNumber: "10B02",
            joinDate: "2023-06-05",
            status: "active"
          },
          {
            id: "s006",
            name: "Neha Kapoor",
            class: "8A",
            rollNumber: "8A04",
            joinDate: "2023-06-20",
            status: "active"
          },
          {
            id: "s007",
            name: "Rohan Malhotra",
            class: "9A",
            rollNumber: "9A07",
            joinDate: "2023-06-08",
            status: "active"
          },
          {
            id: "s008",
            name: "Divya Nair",
            class: "7A",
            rollNumber: "7A06",
            joinDate: "2023-06-14",
            status: "inactive"
          }
        ]

        setStudents(mockStudents)
        setFilteredStudents(mockStudents)
      } catch (error) {
        console.error("Error loading students:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadStudents()
  }, [])

  // Filter students based on search query and selected class
  useEffect(() => {
    let filtered = [...students]

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(student =>
        student.name.toLowerCase().includes(query) ||
        student.rollNumber.toLowerCase().includes(query) ||
        student.class.toLowerCase().includes(query)
      )
    }

    // Filter by class
    if (selectedClass !== "all") {
      filtered = filtered.filter(student =>
        student.class.toLowerCase() === selectedClass.toLowerCase()
      )
    }

    setFilteredStudents(filtered)
  }, [searchQuery, selectedClass, students])

  // Handle adding a new student
  const handleAddStudent = () => {
    // Reset form
    setNewStudent({
      name: "",
      class: "",
      rollNumber: "",
    })
    setFormErrors({
      name: "",
      class: "",
      rollNumber: "",
    })
    setShowAddDialog(true)
  }

  // Validate form
  const validateForm = () => {
    const errors = {
      name: "",
      class: "",
      rollNumber: "",
    }
    let isValid = true

    if (!newStudent.name.trim()) {
      errors.name = translations.nameRequired[language]
      isValid = false
    }

    if (!newStudent.class) {
      errors.class = translations.classRequired[language]
      isValid = false
    }

    if (!newStudent.rollNumber.trim()) {
      errors.rollNumber = translations.rollNumberRequired[language]
      isValid = false
    }

    setFormErrors(errors)
    return isValid
  }

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Generate school code and student ID
      const schoolCode = "VIDYA" + Math.floor(Math.random() * 1000).toString().padStart(3, '0')
      const studentId = newStudent.class.replace(/\s+/g, '') + "-" +
                       newStudent.rollNumber + "-" +
                       Math.floor(Math.random() * 100).toString().padStart(2, '0')

      // Create new student object
      const newStudentObj: Student = {
        id: `s${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        name: newStudent.name,
        class: newStudent.class,
        rollNumber: newStudent.rollNumber,
        joinDate: new Date().toISOString().split('T')[0],
        status: "active",
        schoolCode: schoolCode,
        studentId: studentId
      }

      // Add to students list
      const updatedStudents = [...students, newStudentObj]
      setStudents(updatedStudents)

      // Store students in localStorage for login validation
      try {
        // Get existing managed students from localStorage
        const existingStudentsStr = localStorage.getItem("managedStudents")
        let managedStudents = []

        if (existingStudentsStr) {
          managedStudents = JSON.parse(existingStudentsStr)
        }

        // Add the new student to the managed students list
        managedStudents.push({
          id: newStudentObj.id,
          name: newStudentObj.name,
          class: newStudentObj.class,
          schoolCode: newStudentObj.schoolCode,
          studentId: newStudentObj.studentId
        })

        // Save back to localStorage
        localStorage.setItem("managedStudents", JSON.stringify(managedStudents))
      } catch (error) {
        console.error("Error storing student in localStorage:", error)
      }

      // Close dialog
      setShowAddDialog(false)

      // Set newly added student for credentials dialog
      setNewlyAddedStudent(newStudentObj)

      // Show credentials dialog
      setShowCredentialsDialog(true)

      // Show success message (in a real app, you would use a toast notification)
      console.log(translations.studentAdded[language])
    } catch (error) {
      console.error("Error adding student:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle deleting a student
  const handleDeleteStudent = (student: Student) => {
    setStudentToDelete(student)
    setShowDeleteDialog(true)
  }

  // Confirm delete
  const confirmDelete = async () => {
    if (!studentToDelete) return

    setIsSubmitting(true)

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Remove from students list
      const updatedStudents = students.filter(s => s.id !== studentToDelete.id)
      setStudents(updatedStudents)

      // Remove from localStorage
      try {
        const existingStudentsStr = localStorage.getItem("managedStudents")

        if (existingStudentsStr) {
          const managedStudents = JSON.parse(existingStudentsStr)
          const filteredStudents = managedStudents.filter((s: any) => s.id !== studentToDelete.id)
          localStorage.setItem("managedStudents", JSON.stringify(filteredStudents))
        }
      } catch (error) {
        console.error("Error removing student from localStorage:", error)
      }

      // Close dialog
      setShowDeleteDialog(false)
      setStudentToDelete(null)

      // Show success message (in a real app, you would use a toast notification)
      console.log(translations.studentDeleted[language])
    } catch (error) {
      console.error("Error deleting student:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="bg-primary/10 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-primary">
            <UserPlus size={18} />
            {translations.studentManagement[language]}
          </CardTitle>

          <Button
            size="sm"
            onClick={handleAddStudent}
            className="h-8"
          >
            <Plus size={16} className="mr-1" />
            {translations.addStudent[language]}
          </Button>
        </div>
        <CardDescription>
          {filteredStudents.length} students
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
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

          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={translations.filterByClass[language]} />
            </SelectTrigger>
            <SelectContent>
              {classes.map(cls => (
                <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary rounded-full border-t-transparent"></div>
          </div>
        ) : filteredStudents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">{translations.name[language]}</th>
                  <th className="text-left py-3 px-4 font-medium">{translations.class[language]}</th>
                  <th className="text-left py-3 px-4 font-medium">{translations.rollNumber[language]}</th>
                  <th className="text-left py-3 px-4 font-medium">{translations.status[language]}</th>
                  <th className="text-right py-3 px-4 font-medium">{translations.actions[language]}</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredStudents.map((student) => (
                    <motion.tr
                      key={student.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="border-b hover:bg-muted/50"
                    >
                      <td className="py-3 px-4">{student.name}</td>
                      <td className="py-3 px-4">{student.class}</td>
                      <td className="py-3 px-4">{student.rollNumber}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          student.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}>
                          {student.status === "active"
                            ? translations.active[language]
                            : translations.inactive[language]}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal size={16} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="cursor-pointer">
                              <Edit size={14} className="mr-2" />
                              {translations.edit[language]}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="cursor-pointer text-destructive focus:text-destructive"
                              onClick={() => handleDeleteStudent(student)}
                            >
                              <Trash size={14} className="mr-2" />
                              {translations.delete[language]}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            {translations.noStudentsFound[language]}
          </div>
        )}
      </CardContent>

      {/* Add Student Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{translations.addNewStudent[language]}</DialogTitle>
            <DialogDescription>
              {translations.studentDetails[language]}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">{translations.name[language]}</Label>
              <Input
                id="name"
                value={newStudent.name}
                onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
                placeholder={translations.enterName[language]}
              />
              {formErrors.name && (
                <p className="text-sm text-destructive">{formErrors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="class">{translations.class[language]}</Label>
              <Select
                value={newStudent.class}
                onValueChange={(value) => setNewStudent({...newStudent, class: value})}
              >
                <SelectTrigger id="class">
                  <SelectValue placeholder={translations.selectClass[language]} />
                </SelectTrigger>
                <SelectContent>
                  {classes.filter(c => c.id !== "all").map(cls => (
                    <SelectItem key={cls.id} value={cls.name}>{cls.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.class && (
                <p className="text-sm text-destructive">{formErrors.class}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="rollNumber">{translations.rollNumber[language]}</Label>
              <Input
                id="rollNumber"
                value={newStudent.rollNumber}
                onChange={(e) => setNewStudent({...newStudent, rollNumber: e.target.value})}
                placeholder={translations.enterRollNumber[language]}
              />
              {formErrors.rollNumber && (
                <p className="text-sm text-destructive">{formErrors.rollNumber}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              {translations.cancel[language]}
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {translations.save[language]}...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  {translations.save[language]}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{translations.deleteStudent[language]}</AlertDialogTitle>
            <AlertDialogDescription>
              {translations.confirmDelete[language]}
              <p className="mt-2 text-destructive">
                {translations.deleteWarning[language]}
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{translations.cancel[language]}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isSubmitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {translations.delete[language]}...
                </>
              ) : (
                <>
                  <Trash className="mr-2 h-4 w-4" />
                  {translations.delete[language]}
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Student Credentials Dialog */}
      <AnimatePresence>
        {showCredentialsDialog && newlyAddedStudent && (
          <StudentCredentialsDialog
            student={{
              id: newlyAddedStudent.id,
              name: newlyAddedStudent.name,
              class: newlyAddedStudent.class,
              rollNumber: newlyAddedStudent.rollNumber,
              schoolCode: newlyAddedStudent.schoolCode || "",
              studentId: newlyAddedStudent.studentId || ""
            }}
            onClose={() => setShowCredentialsDialog(false)}
            language={language}
          />
        )}
      </AnimatePresence>
    </Card>
  )
}
