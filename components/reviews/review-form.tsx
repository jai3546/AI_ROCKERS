// "use client"

// import { useState } from "react"
// import { motion } from "framer-motion"
// import { Star, X } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Textarea } from "@/components/ui/textarea"
// import { Label } from "@/components/ui/label"
// import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

// interface ReviewFormProps {
//   onClose: () => void
//   onSubmit: (review: {
//     name: string
//     role: string
//     rating: number
//     comment: string
//   }) => void
//   language?: "en" | "hi" | "te"
// }

// export function ReviewForm({ onClose, onSubmit, language = "en" }: ReviewFormProps) {
//   const [name, setName] = useState("")
//   const [role, setRole] = useState("")
//   const [rating, setRating] = useState(5)
//   const [comment, setComment] = useState("")
//   const [hoveredRating, setHoveredRating] = useState(0)
//   const [errors, setErrors] = useState<{
//     name?: string
//     role?: string
//     comment?: string
//   }>({})
  
//   const translations = {
//     writeReview: {
//       en: "Write a Review",
//       hi: "समीक्षा लिखें",
//       te: "సమీక్ష రాయండి",
//     },
//     yourName: {
//       en: "Your Name",
//       hi: "आपका नाम",
//       te: "మీ పేరు",
//     },
//     yourRole: {
//       en: "Your Role (Student, Teacher, Parent, etc.)",
//       hi: "आपकी भूमिका (छात्र, शिक्षक, अभिभावक, आदि)",
//       te: "మీ పాత్ర (విద్యార్థి, ఉపాధ్యాయుడు, తల్లిదండ్రులు, మొదలైనవి)",
//     },
//     yourReview: {
//       en: "Your Review",
//       hi: "आपकी समीक्षा",
//       te: "మీ సమీక్ష",
//     },
//     rating: {
//       en: "Rating",
//       hi: "रेटिंग",
//       te: "రేటింగ్",
//     },
//     submit: {
//       en: "Submit Review",
//       hi: "समीक्षा जमा करें",
//       te: "సమీక్ష సమర్పించండి",
//     },
//     cancel: {
//       en: "Cancel",
//       hi: "रद्द करें",
//       te: "రద్దు చేయండి",
//     },
//     required: {
//       en: "This field is required",
//       hi: "यह फ़ील्ड आवश्यक है",
//       te: "ఈ ఫీల్డ్ అవసరం",
//     },
//     minLength: {
//       en: "Please enter at least 10 characters",
//       hi: "कृपया कम से कम 10 अक्षर दर्ज करें",
//       te: "దయచేసి కనీసం 10 అక్షరాలను నమోదు చేయండి",
//     },
//   }
  
//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault()
    
//     // Validate form
//     const newErrors: {
//       name?: string
//       role?: string
//       comment?: string
//     } = {}
    
//     if (!name.trim()) {
//       newErrors.name = translations.required[language]
//     }
    
//     if (!role.trim()) {
//       newErrors.role = translations.required[language]
//     }
    
//     if (!comment.trim()) {
//       newErrors.comment = translations.required[language]
//     } else if (comment.trim().length < 10) {
//       newErrors.comment = translations.minLength[language]
//     }
    
//     if (Object.keys(newErrors).length > 0) {
//       setErrors(newErrors)
//       return
//     }
    
//     // Submit the review
//     onSubmit({
//       name,
//       role,
//       rating,
//       comment
//     })
    
//     // Close the form
//     onClose()
//   }
  
//   return (
//     <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
//       <motion.div
//         initial={{ opacity: 0, scale: 0.9 }}
//         animate={{ opacity: 1, scale: 1 }}
//         exit={{ opacity: 0, scale: 0.9 }}
//         className="w-full max-w-md"
//       >
//         {/* <Card className="border border-border dark:border-border shadow-lg"> */}
//           <Card className="border-[#E9D5FF] shadow-[0_8px_24px_rgba(124,58,237,0.08)]">
//           <CardHeader className="pb-3 relative">
//             <Button
//               variant="ghost"
//               size="icon"
//               className="absolute right-2 top-2"
//               onClick={onClose}
//             >
//               <X size={18} />
//             </Button>
//             <CardTitle className="text-[#7C3AED]">{translations.writeReview[language]}</CardTitle>
//             {/* <CardTitle ></CardTitle> */}
//           </CardHeader>
          
//           <form onSubmit={handleSubmit}>
//             <CardContent className="space-y-4">
//               <div className="space-y-2">
//                 <Label htmlFor="name">{translations.yourName[language]}</Label>
//                 {/* <Input
//                   id="name"
//                   value={name}
//                   onChange={(e) => setName(e.target.value)}
//                   className={errors.name ? "border-destructive" : ""}
//                 /> */}
//                 <Input
//   id="name"
//   value={name}
//   onChange={(e) => setName(e.target.value)}
//   className={`focus-visible:ring-[#7C3AED] focus-visible:border-[#7C3AED] ${
//     errors.name ? "border-destructive" : ""
//   }`}
// />
//                 {errors.name && (
//                   <p className="text-xs text-destructive">{errors.name}</p>
//                 )}
//               </div>
              
//               <div className="space-y-2">
//                 <Label htmlFor="role">{translations.yourRole[language]}</Label>
//                 <Input
//                   id="role"
//                   value={role}
//                   onChange={(e) => setRole(e.target.value)}
//                   className={errors.role ? "border-destructive" : ""}
//                 />
//                 {errors.role && (
//                   <p className="text-xs text-destructive">{errors.role}</p>
//                 )}
//               </div>
              
//               <div className="space-y-2">
//                 <Label>{translations.rating[language]}</Label>
//                 <div className="flex items-center gap-1">
//                   {[1, 2, 3, 4, 5].map((star) => (
//                     <button
//                       key={star}
//                       type="button"
//                       className="focus:outline-none"
//                       onClick={() => setRating(star)}
//                       onMouseEnter={() => setHoveredRating(star)}
//                       onMouseLeave={() => setHoveredRating(0)}
//                     >
//                       <Star
//                         size={24}
//                         // className={
//                         //   (hoveredRating ? star <= hoveredRating : star <= rating)
//                         //     ? "text-yellow-500 fill-yellow-500"
//                         //     : "text-gray-300 dark:text-gray-600"
//                         // }
//                         className={
//   (hoveredRating ? star <= hoveredRating : star <= rating)
//     ? "text-[#A855F7] fill-[#A855F7]"
//     : "text-[#E9D5FF] dark:text-[#4C1D95]"
// }
//                       />
//                     </button>
//                   ))}
//                 </div>
//               </div>
              
//               <div className="space-y-2">
//                 <Label htmlFor="comment">{translations.yourReview[language]}</Label>
//                 {/* <Textarea
//                   id="comment"
//                   value={comment}
//                   onChange={(e) => setComment(e.target.value)}
//                   rows={4}
//                   className={errors.comment ? "border-destructive" : ""}
//                 /> */}
//                 <Textarea
//   id="comment"
//   value={comment}
//   onChange={(e) => setComment(e.target.value)}
//   rows={4}
//   className={`focus-visible:ring-[#7C3AED] focus-visible:border-[#7C3AED] ${
//     errors.comment ? "border-destructive" : ""
//   }`}
// />
//                 {errors.comment && (
//                   <p className="text-xs text-destructive">{errors.comment}</p>
//                 )}
//               </div>
//             </CardContent>
            
//             <CardFooter className="flex justify-between">
//               {/* <Button
//                 type="button"
//                 variant="outline"
//                 onClick={onClose}
//               >
//                 {translations.cancel[language]}
//               </Button> */}
//               <Button
//   type="button"
//   variant="outline"
//   onClick={onClose}
//   className="border-[#E9D5FF] hover:bg-[#E9D5FF]/40"
// ></Button>
//               {/* <Button type="submit">
//                 {translations.submit[language]}
//               </Button> */}
//               <Button
//   type="submit"
//   className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white"
// >
//   {translations.submit[language]}
// </Button>
//             </CardFooter>
//           </form>
//         </Card>
//       </motion.div>
//     </div>
//   )
// }

"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Star, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface ReviewFormProps {
  onClose: () => void
  onSubmit: (review: {
    name: string
    role: string
    rating: number
    comment: string
  }) => void
  language?: "en" | "hi" | "te"
}

export function ReviewForm({
  onClose,
  onSubmit,
  language = "en",
}: ReviewFormProps) {
  const [name, setName] = useState("")
  const [role, setRole] = useState("")
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState("")
  const [hoveredRating, setHoveredRating] = useState(0)

  const [errors, setErrors] = useState<{
    name?: string
    role?: string
    comment?: string
  }>({})

  const translations = {
    writeReview: {
      en: "Write a Review",
      hi: "समीक्षा लिखें",
      te: "సమీక్ష రాయండి",
    },
    yourName: {
      en: "Your Name",
      hi: "आपका नाम",
      te: "మీ పేరు",
    },
    yourRole: {
      en: "Your Role (Student, Teacher, Parent, etc.)",
      hi: "आपकी भूमिका (छात्र, शिक्षक, अभिभावक, आदि)",
      te: "మీ పాత్ర (విద్యార్థి, ఉపాధ్యాయుడు, తల్లిదండ్రులు, మొదలైనవి)",
    },
    yourReview: {
      en: "Your Review",
      hi: "आपकी समीक्षा",
      te: "మీ సమీక్ష",
    },
    rating: {
      en: "Rating",
      hi: "रेटिंग",
      te: "రేటింగ్",
    },
    submit: {
      en: "Submit Review",
      hi: "समीक्षा जमा करें",
      te: "సమీక్ష సమర్పించండి",
    },
    cancel: {
      en: "Cancel",
      hi: "रद्द करें",
      te: "రద్దు చేయండి",
    },
    required: {
      en: "This field is required",
      hi: "यह फ़ील्ड आवश्यक है",
      te: "ఈ ఫీల్డ్ అవసరం",
    },
    minLength: {
      en: "Please enter at least 10 characters",
      hi: "कृपया कम से कम 10 अक्षर दर्ज करें",
      te: "దయచేసి కనీసం 10 అక్షరాలను నమోదు చేయండి",
    },
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors: {
      name?: string
      role?: string
      comment?: string
    } = {}

    if (!name.trim()) {
      newErrors.name = translations.required[language]
    }

    if (!role.trim()) {
      newErrors.role = translations.required[language]
    }

    if (!comment.trim()) {
      newErrors.comment = translations.required[language]
    } else if (comment.trim().length < 10) {
      newErrors.comment = translations.minLength[language]
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onSubmit({
      name,
      role,
      rating,
      comment,
    })

    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="w-full max-w-md"
    >
      <Card className="border border-[#CCFBF1] shadow-xl">
        <CardHeader className="border-b border-[#CCFBF1]">
          <div className="flex items-center justify-between">
            <CardTitle className="text-[#0F766E]">
              {translations.writeReview[language]}
            </CardTitle>

            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-slate-500 hover:text-[#0F766E]"
            >
              <X size={18} />
            </Button>
          </div>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-5 pt-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                {translations.yourName[language]}
              </Label>

              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`focus-visible:ring-[#0F766E] focus-visible:border-[#0F766E] ${
                  errors.name ? "border-destructive" : ""
                }`}
              />

              {errors.name && (
                <p className="text-xs text-destructive">
                  {errors.name}
                </p>
              )}
            </div>

            {/* Role */}
            <div className="space-y-2">
              <Label htmlFor="role">
                {translations.yourRole[language]}
              </Label>

              <Input
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className={`focus-visible:ring-[#0F766E] focus-visible:border-[#0F766E] ${
                  errors.role ? "border-destructive" : ""
                }`}
              />

              {errors.role && (
                <p className="text-xs text-destructive">
                  {errors.role}
                </p>
              )}
            </div>

            {/* Rating */}
            <div className="space-y-2">
              <Label>{translations.rating[language]}</Label>

              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className="focus:outline-none"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                  >
                    <Star
                      size={24}
                      className={
                        (hoveredRating
                          ? star <= hoveredRating
                          : star <= rating)
                          ? "text-[#F59E0B] fill-[#F59E0B]"
                          : "text-[#FCD34D] dark:text-[#78350F]"
                      }
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div className="space-y-2">
              <Label htmlFor="comment">
                {translations.yourReview[language]}
              </Label>

              <Textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className={`focus-visible:ring-[#0F766E] focus-visible:border-[#0F766E] ${
                  errors.comment ? "border-destructive" : ""
                }`}
              />

              {errors.comment && (
                <p className="text-xs text-destructive">
                  {errors.comment}
                </p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-[#CCFBF1] text-[#0F766E] hover:bg-[#CCFBF1]/40"
            >
              {translations.cancel[language]}
            </Button>

            <Button
              type="submit"
              className="bg-[#0F766E] hover:bg-[#115E59] text-white"
            >
              {translations.submit[language]}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </motion.div>
  )
}