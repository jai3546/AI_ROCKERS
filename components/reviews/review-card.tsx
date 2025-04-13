"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Star, Quote } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

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
  index: number
}

export function ReviewCard({ review, index }: ReviewCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className="h-full bg-white dark:bg-card border border-border dark:border-border shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={review.avatar} alt={review.name} />
                <AvatarFallback className="bg-primary/20 text-primary">
                  {review.name.split(" ").map(n => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-medium text-foreground">{review.name}</h4>
                <p className="text-sm text-muted-foreground">{review.role}</p>
              </div>
            </div>
            <div className="flex items-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  className={i < review.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300 dark:text-gray-600"}
                />
              ))}
            </div>
          </div>
          <div className="relative">
            <Quote size={24} className="absolute -top-2 -left-2 text-primary/20" />
            <p className="text-foreground/80 dark:text-foreground/80 text-sm pl-4 pr-2">
              {review.comment}
            </p>
          </div>
          <p className="text-xs text-muted-foreground mt-4 text-right">{review.date}</p>
        </CardContent>
      </Card>
    </motion.div>
  )
}
