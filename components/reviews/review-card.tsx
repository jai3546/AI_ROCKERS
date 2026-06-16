// "use client"

// import { motion } from "framer-motion"
// import { Quote, Star } from "lucide-react"
// import { Card, CardContent } from "@/components/ui/card"
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
// import { cn } from "@/lib/utils"

// export interface ReviewData {
//   id: string
//   name: string
//   role: string
//   avatar?: string
//   rating: number
//   comment: string
//   date: string
// }

// interface ReviewCardProps {
//   review: ReviewData
// }

// export function ReviewCard({ review }: ReviewCardProps) {
//   return (
//     <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="h-full w-full">
//       <Card
//         className={cn(
//           "h-full w-full min-h-[22rem] overflow-hidden rounded-[1.95rem] border border-slate-200 bg-white shadow-[0_8px_24px_rgba(17,24,39,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(244,114,182,0.12)] sm:min-h-[24rem] lg:min-h-[26rem] dark:border-border/80 dark:bg-card"
//         )}
//       >
//         <CardContent className="flex h-full flex-col px-6 py-6 sm:px-7 sm:py-7">
//           <Quote className="h-14 w-14 text-pink-400" strokeWidth={2.5} />

//           <div className="mt-5 flex-1">
//             <p className="max-w-[18ch] text-[1.05rem] leading-8 tracking-[-0.02em] text-slate-800 line-clamp-5 dark:text-foreground/90 sm:line-clamp-4 lg:line-clamp-5">
//               “{review.comment}”
//             </p>
//           </div>

//           <div className="mt-auto border-t border-pink-100 pt-5 dark:border-pink-950/70">
//             <div className="flex items-center gap-3">
//               <Avatar className="h-14 w-14 border-2 border-white shadow-md dark:border-card">
//                 <AvatarImage src={review.avatar} alt={review.name} />
//                 <AvatarFallback className="bg-gradient-to-br from-pink-200 via-rose-100 to-sky-100 text-slate-800 dark:from-pink-900/40 dark:via-rose-900/30 dark:to-sky-900/30 dark:text-foreground">
//                   {review.name
//                     .split(" ")
//                     .map((namePart) => namePart[0])
//                     .join("")}
//                 </AvatarFallback>
//               </Avatar>
//               <div>
//                 <h4 className="text-base font-semibold text-slate-900 dark:text-foreground">{review.name}</h4>
//                 <p className="text-sm font-medium text-pink-500 dark:text-pink-300">{review.role}</p>
//               </div>
//             </div>

//             <div className="mt-3 flex items-center gap-1 text-yellow-400">
//               {Array.from({ length: 5 }).map((_, starIndex) => (
//                 <Star
//                   key={starIndex}
//                   size={17}
//                   className={starIndex < review.rating ? "fill-yellow-400" : "fill-transparent text-yellow-200 dark:text-yellow-900"}
//                 />
//               ))}
//             </div>
//           </div>
//         </CardContent>
//       </Card>
//     </motion.div>
//   )
// }
// "use client"

// import { motion } from "framer-motion"
// import { Quote, Star } from "lucide-react"
// import { Card, CardContent } from "@/components/ui/card"
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
// import { cn } from "@/lib/utils"

// export interface ReviewData {
//   id: string
//   name: string
//   role: string
//   avatar?: string
//   rating: number
//   comment: string
//   date: string
// }

// interface ReviewCardProps {
//   review: ReviewData
// }

// export function ReviewCard({ review }: ReviewCardProps) {
//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.45 }}
//       className="h-full w-full"
//     >
//       <Card
//         className={cn(
//           "h-full w-full min-h-[22rem] overflow-hidden rounded-[1.95rem] border border-slate-200 bg-white shadow-[0_8px_24px_rgba(17,24,39,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(124,58,237,0.15)] sm:min-h-[24rem] lg:min-h-[26rem] dark:border-border/80 dark:bg-card"
//         )}
//       >
//         <CardContent className="flex h-full flex-col px-6 py-6 sm:px-7 sm:py-7">
//           <Quote
//             className="h-14 w-14 text-[#7C3AED]"
//             strokeWidth={2.5}
//           />

//           <div className="mt-5 flex-1">
//             <p className="max-w-[18ch] text-[1.05rem] leading-8 tracking-[-0.02em] text-slate-800 line-clamp-5 dark:text-foreground/90 sm:line-clamp-4 lg:line-clamp-5">
//               “{review.comment}”
//             </p>
//           </div>

//           <div className="mt-auto border-t border-[#E9D5FF] pt-5 dark:border-[#7C3AED]/20">
//             <div className="flex items-center gap-3">
//               <Avatar className="h-14 w-14 border-2 border-white shadow-md dark:border-card">
//                 <AvatarImage src={review.avatar} alt={review.name} />
//                 <AvatarFallback className="bg-gradient-to-br from-[#E9D5FF] via-[#F3E8FF] to-[#DDD6FE] text-slate-800 dark:from-[#7C3AED]/30 dark:via-[#A855F7]/20 dark:to-[#8B5CF6]/20 dark:text-foreground">
//                   {review.name
//                     .split(" ")
//                     .map((namePart) => namePart[0])
//                     .join("")}
//                 </AvatarFallback>
//               </Avatar>

//               <div>
//                 <h4 className="text-base font-semibold text-slate-900 dark:text-foreground">
//                   {review.name}
//                 </h4>

//                 <p className="text-sm font-medium text-[#7C3AED] dark:text-[#C4B5FD]">
//                   {review.role}
//                 </p>
//               </div>
//             </div>

//             <div className="mt-3 flex items-center gap-1 text-[#A855F7]">
//               {Array.from({ length: 5 }).map((_, starIndex) => (
//                 <Star
//                   key={starIndex}
//                   size={17}
//                   className={
//                     starIndex < review.rating
//                       ? "fill-[#A855F7] text-[#A855F7]"
//                       : "fill-transparent text-[#D8B4FE] dark:text-[#4C1D95]"
//                   }
//                 />
//               ))}
//             </div>
//           </div>
//         </CardContent>
//       </Card>
//     </motion.div>
//   )
// }

"use client"

import { motion } from "framer-motion"
import { Quote, Star } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

export interface ReviewData {
  id: string
  name: string
  role: string
  avatar?: string
  rating: number
  comment: string
  date: string
}

interface ReviewCardProps {
  review: ReviewData
}

export function ReviewCard({ review }: ReviewCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="h-full w-full"
    >
      <Card
        className={cn(
          "h-full w-full min-h-[22rem] overflow-hidden rounded-[1.95rem] border border-slate-200 bg-white shadow-[0_8px_24px_rgba(17,24,39,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(15,118,110,0.18)] sm:min-h-[24rem] lg:min-h-[26rem] dark:border-border/80 dark:bg-card"
        )}
      >
        <CardContent className="flex h-full flex-col p-7">
          {/* Quote Icon */}
          <div className="mb-5 flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F59E0B]/10">
              <Quote className="h-6 w-6 text-[#F59E0B]" />
            </div>

            <span className="text-xs font-medium text-slate-500 dark:text-muted-foreground">
              {review.date}
            </span>
          </div>

          {/* Review Text */}
          <div className="mt-5 flex-1">
            <p className="max-w-[18ch] text-[1.05rem] leading-8 tracking-[-0.02em] text-slate-800 line-clamp-5 dark:text-foreground/90 sm:line-clamp-4 lg:line-clamp-5">
              “{review.comment}”
            </p>
          </div>

          {/* Footer */}
          <div className="mt-auto border-t border-[#CCFBF1] pt-5 dark:border-[#0F766E]/20">
            <div className="flex items-center gap-3">
              <Avatar className="h-14 w-14 border-2 border-white shadow-md dark:border-card">
                <AvatarImage src={review.avatar} alt={review.name} />

                <AvatarFallback className="bg-gradient-to-br from-[#CCFBF1] via-[#F0FDFA] to-[#99F6E4] text-slate-800 dark:from-[#0F766E]/30 dark:via-[#14B8A6]/20 dark:to-[#06B6D4]/20 dark:text-foreground">
                  {review.name
                    .split(" ")
                    .map((namePart) => namePart[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>

              <div>
                <h4 className="text-base font-semibold text-slate-900 dark:text-foreground">
                  {review.name}
                </h4>

                <p className="text-sm font-medium text-[#0F766E] dark:text-[#5EEAD4]">
                  {review.role}
                </p>
              </div>
            </div>

            {/* Rating */}
            <div className="mt-3 flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, starIndex) => (
                <Star
                  key={starIndex}
                  size={17}
                  className={
                    starIndex < review.rating
                      ? "fill-[#F59E0B] text-[#F59E0B]"
                      : "fill-transparent text-[#FCD34D] dark:text-[#78350F]"
                  }
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}