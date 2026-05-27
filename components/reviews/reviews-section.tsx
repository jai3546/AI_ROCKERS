"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ReviewCard, ReviewData } from "./review-card"
import { ReviewForm } from "./review-form"
import TestimonialCarousel from "./carosel"

interface ReviewsSectionProps {
  title: string
  subtitle?: string
  language?: "en" | "hi" | "te"
}

// Sample reviews data
const sampleReviews: ReviewData[] = [
  {
    id: "1",
    name: "Priya Sharma",
    role: "Student, Class 10",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    rating: 5,
    comment: "VidyAI has completely transformed my learning experience. The voice commands make it so easy to navigate, and the emotional tracking helps me stay focused. I've improved my grades significantly!",
    date: "2 weeks ago"
  },
  {
    id: "2",
    name: "Rahul Patel",
    role: "Student, Class 8",
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    rating: 4,
    comment: "I love using the flashcards and quizzes. They make studying fun and interactive. The dark mode is also great for studying at night without straining my eyes.",
    date: "1 month ago"
  },
  {
    id: "3",
    name: "Ananya Reddy",
    role: "Student, Class 9",
    avatar: "/avatars/ananya.jpg",
    rating: 5,
    comment: "The AI tutor is like having a personal teacher available 24/7. It explains concepts in a way that's easy to understand and adapts to my learning style.",
    date: "3 weeks ago"
  },
  {
    id: "4",
    name: "Vikram Singh",
    role: "Teacher, Science",
    avatar: "/avatars/vikram.jpg",
    rating: 5,
    comment: "As a teacher, I find the school portal incredibly useful. It helps me track student progress and identify areas where they need additional support. The weekly reports are comprehensive and insightful.",
    date: "1 month ago"
  },
  {
    id: "5",
    name: "Meera Desai",
    role: "Parent",
    avatar: "'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80'",
    rating: 4,
    comment: "I appreciate being able to monitor my child's learning progress. The emotional tracking feature gives me insights into how they're engaging with the material, which helps me provide better support at home.",
    date: "2 months ago"
  },
  {
    id: "6",
    name: "Arjun Kumar",
    role: "Student, Class 11",
    avatar:'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    rating: 5,
    comment: "The summaries feature has been a game-changer for my exam preparation. It helps me quickly review key concepts and saves so much time. The voice navigation is also very intuitive.",
    date: "3 weeks ago"
  }
]

export function ReviewsSection({ title, subtitle, language = "en" }: ReviewsSectionProps) {
  const [currentPage, setCurrentPage] = useState(0)
  const [reviews, setReviews] = useState<ReviewData[]>(sampleReviews)
  const [isAnimating, setIsAnimating] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)

  const reviewsPerPage = 3
  const totalPages = Math.ceil(reviews.length / reviewsPerPage)

  const translations = {
    writeReview: {
      en: "Write a Review",
      hi: "समीक्षा लिखें",
      te: "సమీక్ష రాయండి",
    },
    prev: {
      en: "Previous",
      hi: "पिछला",
      te: "మునుపటి",
    },
    next: {
      en: "Next",
      hi: "अगला",
      te: "తదుపరి",
    },
    page: {
      en: "Page",
      hi: "पेज",
      te: "పేజీ",
    },
    of: {
      en: "of",
      hi: "का",
      te: "యొక్క",
    },
  }

  const handlePrevPage = () => {
    if (currentPage > 0 && !isAnimating) {
      setIsAnimating(true)
      setCurrentPage(currentPage - 1)
      setTimeout(() => setIsAnimating(false), 500)
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages - 1 && !isAnimating) {
      setIsAnimating(true)
      setCurrentPage(currentPage + 1)
      setTimeout(() => setIsAnimating(false), 500)
    }
  }

  const currentReviews = reviews.slice(
    currentPage * reviewsPerPage,
    (currentPage + 1) * reviewsPerPage
  )

  const handleAddReview = () => {
    setShowReviewForm(true)
  }

  const handleSubmitReview = (reviewData: {
    name: string
    role: string
    rating: number
    comment: string
  }) => {
    // Create a new review with the submitted data
    const newReview: ReviewData = {
      id: `review-${Date.now()}`,
      name: reviewData.name,
      role: reviewData.role,
      rating: reviewData.rating,
      comment: reviewData.comment,
      date: "Just now"
    }

    // Add the new review to the beginning of the reviews array
    setReviews([newReview, ...reviews])

    // Reset to the first page to show the new review
    setCurrentPage(0)
  }

  return (
    <section className="w-full py-12">
      <div className="container px-4 mx-auto">
        {/* <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">{title}</h2>
            {subtitle && <p className="text-muted-foreground mt-2">{subtitle}</p>}
          </div>
          <div className="flex items-center mt-4 md:mt-0">
            <div className="flex items-center mr-4">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={18}
                    className="text-yellow-500 fill-yellow-500"
                  />
                ))}
              </div>
              <span className="ml-2 text-foreground font-medium">4.8</span>
              <span className="ml-1 text-muted-foreground">({reviews.length})</span>
            </div>
           
          </div>
        </div> */}

                <TestimonialCarousel/>

        {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {currentReviews.map((review, index) => (
            <ReviewCard key={review.id} review={review} index={index} />
          ))}
        </div> */}
              {/* pages movement */}
        {/* {totalPages > 1 && (
          <div className="flex items-center justify-between mt-8">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevPage}
              disabled={currentPage === 0 || isAnimating}
            >
              <ChevronLeft size={16} className="mr-2" />
              {translations.prev[language]}
            </Button>

            <span className="text-sm text-muted-foreground">
              {translations.page[language]} {currentPage + 1} {translations.of[language]} {totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPage === totalPages - 1 || isAnimating}
            >
              {translations.next[language]}
              <ChevronRight size={16} className="ml-2" />
            </Button>
          </div>
        )} */}
      </div>
 <Button onClick={handleAddReview} variant="outline" size="sm">
              {translations.writeReview[language]}
</Button>
      {/* Review Form */}
      <AnimatePresence>
        {showReviewForm && (
          <ReviewForm
            onClose={() => setShowReviewForm(false)}
            onSubmit={handleSubmitReview}
            language={language}
          />
        )}
      </AnimatePresence>
    </section>
  )
}
