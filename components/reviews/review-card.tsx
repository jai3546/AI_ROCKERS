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
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="h-full w-full">
      <Card
        className={cn(
          "h-full w-full min-h-[22rem] overflow-hidden rounded-[1.95rem] border border-slate-200 bg-white shadow-[0_8px_24px_rgba(17,24,39,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(244,114,182,0.12)] sm:min-h-[24rem] lg:min-h-[26rem] dark:border-border/80 dark:bg-card"
        )}
      >
        <CardContent className="flex h-full flex-col px-6 py-6 sm:px-7 sm:py-7">
          <Quote className="h-14 w-14 text-pink-400" strokeWidth={2.5} />

          <div className="mt-5 flex-1">
            <p className="max-w-[18ch] text-[1.05rem] leading-8 tracking-[-0.02em] text-slate-800 line-clamp-5 dark:text-foreground/90 sm:line-clamp-4 lg:line-clamp-5">
              “{review.comment}”
            </p>
          </div>

          <div className="mt-auto border-t border-pink-100 pt-5 dark:border-pink-950/70">
            <div className="flex items-center gap-3">
              <Avatar className="h-14 w-14 border-2 border-white shadow-md dark:border-card">
                <AvatarImage src={review.avatar} alt={review.name} />
                <AvatarFallback className="bg-gradient-to-br from-pink-200 via-rose-100 to-sky-100 text-slate-800 dark:from-pink-900/40 dark:via-rose-900/30 dark:to-sky-900/30 dark:text-foreground">
                  {review.name
                    .split(" ")
                    .map((namePart) => namePart[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <h4 className="text-base font-semibold text-slate-900 dark:text-foreground">{review.name}</h4>
                <p className="text-sm font-medium text-pink-500 dark:text-pink-300">{review.role}</p>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-1 text-yellow-400">
              {Array.from({ length: 5 }).map((_, starIndex) => (
                <Star
                  key={starIndex}
                  size={17}
                  className={starIndex < review.rating ? "fill-yellow-400" : "fill-transparent text-yellow-200 dark:text-yellow-900"}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
