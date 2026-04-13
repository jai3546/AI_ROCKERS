"use client"

import { useState } from "react"
import { Loader2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Flashcard } from "@/data/flashcards"

interface AIFlashcardGeneratorProps {
  onFlashcardsGenerated: (flashcards: Flashcard[]) => void
  syllabus: "AP" | "Telangana" | "CBSE" | "General"
}

export function AIFlashcardGenerator({
  onFlashcardsGenerated,
  syllabus
}: AIFlashcardGeneratorProps) {
  const [subject, setSubject] = useState("")
  const [customSubject, setCustomSubject] = useState("")
  const [numFlashcards, setNumFlashcards] = useState(5)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Subject options based on syllabus
  const subjectOptions = {
    "General": ["Math", "Science", "English", "Social Studies", "Computer Science"],
    "AP": ["Math", "Science", "English", "Social Studies", "Telugu"],
    "Telangana": ["Math", "Science", "English", "Social Studies", "Telugu"],
    "CBSE": ["Math", "Science", "English", "Social Studies", "Hindi"]
  }

  // Generate AI flashcards based on subject
  const generateFlashcards = async () => {
    const selectedSubject = subject === "custom" ? customSubject : subject
    
    if (!selectedSubject.trim()) {
      setError("Please select or enter a subject")
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Generate flashcards based on the subject
      const flashcards: Flashcard[] = []
      
      // Subject-specific flashcard templates
      const templates: Record<string, Array<{front: string, back: string}>> = {
        "Math": [
          {
            front: "What is the formula for the area of a circle?",
            back: "A = πr², where r is the radius of the circle."
          },
          {
            front: "What is the Pythagorean theorem?",
            back: "In a right-angled triangle, the square of the length of the hypotenuse equals the sum of the squares of the other two sides. a² + b² = c²"
          },
          {
            front: "What is the formula for the volume of a sphere?",
            back: "(4/3)πr³, where r is the radius of the sphere."
          },
          {
            front: "What is the formula for the area of a triangle?",
            back: "A = (1/2) × b × h, where b is the base and h is the height."
          },
          {
            front: "What is the quadratic formula?",
            back: "x = (-b ± √(b² - 4ac)) / 2a, where ax² + bx + c = 0"
          },
          {
            front: "What is the formula for the perimeter of a rectangle?",
            back: "P = 2(l + w), where l is the length and w is the width."
          },
          {
            front: "What is the formula for the area of a rectangle?",
            back: "A = l × w, where l is the length and w is the width."
          },
          {
            front: "What is the formula for the circumference of a circle?",
            back: "C = 2πr, where r is the radius of the circle."
          },
          {
            front: "What is the formula for the slope of a line?",
            back: "m = (y₂ - y₁) / (x₂ - x₁), where (x₁, y₁) and (x₂, y₂) are two points on the line."
          },
          {
            front: "What is the formula for the distance between two points?",
            back: "d = √[(x₂ - x₁)² + (y₂ - y₁)²], where (x₁, y₁) and (x₂, y₂) are the two points."
          }
        ],
        "Science": [
          {
            front: "What is photosynthesis?",
            back: "The process by which green plants and some other organisms use sunlight to synthesize foods with carbon dioxide and water, generating oxygen as a byproduct."
          },
          {
            front: "What are the three states of matter?",
            back: "Solid, liquid, and gas. Some scientists also include plasma as a fourth state."
          },
          {
            front: "What is Newton's First Law of Motion?",
            back: "An object at rest stays at rest, and an object in motion stays in motion unless acted upon by an external force."
          },
          {
            front: "What is the chemical formula for water?",
            back: "H₂O"
          },
          {
            front: "What is the process of cellular respiration?",
            back: "The process by which cells break down glucose and other molecules to release energy, consuming oxygen and producing carbon dioxide and water."
          },
          {
            front: "What is the difference between a physical and chemical change?",
            back: "A physical change alters the form of a substance but not its chemical composition. A chemical change creates a new substance with different properties."
          },
          {
            front: "What is the law of conservation of energy?",
            back: "Energy cannot be created or destroyed, only transformed from one form to another."
          },
          {
            front: "What is the structure of an atom?",
            back: "An atom consists of a nucleus (containing protons and neutrons) surrounded by electrons that orbit in energy levels or shells."
          },
          {
            front: "What is the difference between mitosis and meiosis?",
            back: "Mitosis is cell division that results in two identical daughter cells, while meiosis is cell division that results in four genetically different daughter cells with half the original number of chromosomes."
          },
          {
            front: "What is the pH scale?",
            back: "A scale from 0 to 14 that measures how acidic or basic a solution is. A pH of 7 is neutral, below 7 is acidic, and above 7 is basic."
          }
        ],
        "English": [
          {
            front: "What are the eight parts of speech?",
            back: "Noun, pronoun, verb, adjective, adverb, preposition, conjunction, and interjection."
          },
          {
            front: "What is the difference between a simile and a metaphor?",
            back: "A simile compares two things using 'like' or 'as', while a metaphor directly states that one thing is another thing."
          },
          {
            front: "What is alliteration?",
            back: "The repetition of the same sound at the beginning of a series of words in succession."
          },
          {
            front: "What is the difference between active and passive voice?",
            back: "In active voice, the subject performs the action. In passive voice, the subject receives the action."
          },
          {
            front: "What is a synonym?",
            back: "A word that means the same or nearly the same as another word."
          },
          {
            front: "What is an antonym?",
            back: "A word that means the opposite of another word."
          },
          {
            front: "What is a homonym?",
            back: "Words that sound the same but have different meanings and often different spellings."
          },
          {
            front: "What is personification?",
            back: "A figure of speech in which human characteristics are attributed to non-human things."
          },
          {
            front: "What is onomatopoeia?",
            back: "Words that phonetically imitate or suggest the sound they describe, like 'buzz' or 'splash'."
          },
          {
            front: "What is the difference between a protagonist and an antagonist?",
            back: "The protagonist is the main character in a story, while the antagonist is the character who opposes the protagonist."
          }
        ],
        "Social Studies": [
          {
            front: "What are the three branches of the U.S. government?",
            back: "Executive, Legislative, and Judicial."
          },
          {
            front: "What is democracy?",
            back: "A system of government where power is held by citizens through voting and elected representatives."
          },
          {
            front: "What is the capital of India?",
            back: "New Delhi"
          },
          {
            front: "What is globalization?",
            back: "The process of interaction and integration among people, companies, and governments worldwide."
          },
          {
            front: "What was the Industrial Revolution?",
            back: "A period of rapid industrial growth with far-reaching social and economic consequences, beginning in Britain during the late 1700s."
          },
          {
            front: "What is the United Nations?",
            back: "An international organization founded in 1945 to promote international cooperation and to create and maintain international order."
          },
          {
            front: "What is the difference between a renewable and non-renewable resource?",
            back: "Renewable resources can be replenished naturally over time, while non-renewable resources exist in fixed amounts and can be depleted."
          },
          {
            front: "What is urbanization?",
            back: "The process by which large numbers of people become permanently concentrated in relatively small areas, forming cities."
          },
          {
            front: "What is the significance of the Magna Carta?",
            back: "It established the principle that everyone, including the king, was subject to the law and guaranteed certain rights to individuals."
          },
          {
            front: "What is cultural diffusion?",
            back: "The spread of cultural beliefs and social activities from one group of people to another."
          }
        ],
        "Computer Science": [
          {
            front: "What is an algorithm?",
            back: "A step-by-step procedure or formula for solving a problem."
          },
          {
            front: "What is the difference between hardware and software?",
            back: "Hardware refers to the physical components of a computer system, while software refers to the programs and applications that run on the hardware."
          },
          {
            front: "What is a variable in programming?",
            back: "A storage location paired with an associated symbolic name that contains a value which can be changed during program execution."
          },
          {
            front: "What is a loop in programming?",
            back: "A sequence of instructions that is continually repeated until a certain condition is reached."
          },
          {
            front: "What is a database?",
            back: "An organized collection of data stored and accessed electronically."
          },
          {
            front: "What is the difference between RAM and ROM?",
            back: "RAM (Random Access Memory) is volatile memory that stores data temporarily while a computer is running. ROM (Read-Only Memory) is non-volatile memory that stores permanent data."
          },
          {
            front: "What is an IP address?",
            back: "A unique string of numbers separated by periods that identifies each computer using the Internet Protocol to communicate over a network."
          },
          {
            front: "What is HTML?",
            back: "HyperText Markup Language, the standard markup language for creating web pages and web applications."
          },
          {
            front: "What is the difference between HTTP and HTTPS?",
            back: "HTTP (Hypertext Transfer Protocol) is unsecured, while HTTPS (Hypertext Transfer Protocol Secure) is secured using SSL/TLS encryption."
          },
          {
            front: "What is cloud computing?",
            back: "The delivery of computing services—including servers, storage, databases, networking, software, analytics, and intelligence—over the Internet ('the cloud')."
          }
        ],
        "Telugu": [
          {
            front: "What are the vowels in Telugu?",
            back: "అ, ఆ, ఇ, ఈ, ఉ, ఊ, ఋ, ౠ, ఎ, ఏ, ఐ, ఒ, ఓ, ఔ"
          },
          {
            front: "Who wrote 'Amuktamalyada'?",
            back: "Sri Krishnadevaraya"
          },
          {
            front: "What is 'Satakam' in Telugu literature?",
            back: "A collection of 100 poems with a common theme or dedicated to a deity."
          },
          {
            front: "Who is considered the father of Telugu poetry?",
            back: "Nannayya"
          },
          {
            front: "What is 'Yati Prasa' in Telugu poetry?",
            back: "A form of alliteration where the same consonant appears at specific positions in consecutive lines."
          }
        ],
        "Hindi": [
          {
            front: "What are the vowels in Hindi?",
            back: "अ, आ, इ, ई, उ, ऊ, ऋ, ए, ऐ, ओ, औ"
          },
          {
            front: "Who wrote 'Ramcharitmanas'?",
            back: "Tulsidas"
          },
          {
            front: "What is 'Doha' in Hindi literature?",
            back: "A self-contained rhyming couplet in Hindi poetry."
          },
          {
            front: "Who is known as the 'Father of Hindi literature'?",
            back: "Bharatendu Harishchandra"
          },
          {
            front: "What is 'Khariboli'?",
            back: "The dialect of Hindi that forms the basis for standard Hindi and Urdu."
          }
        ]
      }

      // Get templates for the selected subject or use generic ones
      const subjectTemplates = templates[selectedSubject] || [
        {
          front: `What is ${selectedSubject}?`,
          back: `${selectedSubject} is a field of study that explores various concepts and principles.`
        },
        {
          front: `Who is an important figure in ${selectedSubject}?`,
          back: `There are many important figures who have contributed to the field of ${selectedSubject}.`
        },
        {
          front: `What are the key concepts in ${selectedSubject}?`,
          back: `${selectedSubject} encompasses various key concepts that form the foundation of this field.`
        },
        {
          front: `How is ${selectedSubject} applied in real life?`,
          back: `${selectedSubject} has numerous practical applications in everyday life and various industries.`
        },
        {
          front: `What is the history of ${selectedSubject}?`,
          back: `${selectedSubject} has evolved over time through the contributions of various scholars and practitioners.`
        }
      ]

      // Shuffle the templates and select the requested number
      const shuffled = [...subjectTemplates].sort(() => 0.5 - Math.random())
      const selected = shuffled.slice(0, Math.min(numFlashcards, shuffled.length))

      // Create flashcards from the selected templates
      selected.forEach((template, index) => {
        flashcards.push({
          id: `ai-${selectedSubject.toLowerCase()}-${index}`,
          front: template.front,
          back: template.back,
          subject: selectedSubject,
          syllabus: syllabus
        })
      })

      // If we don't have enough templates, add generic ones
      if (flashcards.length < numFlashcards) {
        const remaining = numFlashcards - flashcards.length
        for (let i = 0; i < remaining; i++) {
          flashcards.push({
            id: `ai-${selectedSubject.toLowerCase()}-generic-${i}`,
            front: `Question ${flashcards.length + 1} about ${selectedSubject}?`,
            back: `This is the answer to question ${flashcards.length + 1} about ${selectedSubject}.`,
            subject: selectedSubject,
            syllabus: syllabus
          })
        }
      }

      onFlashcardsGenerated(flashcards)
    } catch (err) {
      setError("Failed to generate flashcards. Please try again.")
      console.error(err)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Select
              value={subject}
              onValueChange={(value) => {
                setSubject(value)
                if (value !== "custom") {
                  setCustomSubject("")
                }
              }}
            >
              <SelectTrigger id="subject">
                <SelectValue placeholder="Select a subject" />
              </SelectTrigger>
              <SelectContent>
                {subjectOptions[syllabus].map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
                <SelectItem value="custom">Custom Subject</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {subject === "custom" && (
            <div className="space-y-2">
              <Label htmlFor="customSubject">Custom Subject</Label>
              <Input
                id="customSubject"
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
                placeholder="Enter a subject"
              />
            </div>
          )}

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="numFlashcards">Number of Flashcards</Label>
              <span className="text-sm text-muted-foreground">{numFlashcards}</span>
            </div>
            <Slider
              id="numFlashcards"
              min={1}
              max={10}
              step={1}
              value={[numFlashcards]}
              onValueChange={(value) => setNumFlashcards(value[0])}
            />
          </div>

          {error && (
            <div className="text-sm text-destructive">{error}</div>
          )}

          <Button
            className="w-full"
            onClick={generateFlashcards}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate AI Flashcards
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
