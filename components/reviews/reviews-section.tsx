"use client"

import React from "react"

import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight, MessageCircleMore, PlusCircle } from "lucide-react"
import useEmblaCarousel from "embla-carousel-react"

import { ReviewCard, type ReviewData } from "./review-card"
import { ReviewForm } from "./review-form"
import TestimonialCarousel from "./carosel"

interface ReviewsSectionProps {
  eyebrow?: string
  title: string
  subtitle?: string
  footerText?: string
  language?: "en" | "hi" | "te"
}

// Sample reviews data not used in production
const sampleReviews: ReviewData[] = [
  {
    id: "1",
    name: "Priya Sharma",
    role: "Student, Class 10",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    rating: 5,
    comment: "Vidya AI has completely transformed my learning experience. The voice commands make it so easy to navigate, and the emotional tracking helps me stay focused. I've improved my grades significantly!",
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
    avatar: '',
    rating: 4,
    comment: "I appreciate being able to monitor my child's learning progress. The emotional tracking feature gives me insights into how they're engaging with the material, which helps me provide better support at home.",
    date: "2 months ago"
  },
  {
    id: "6",
    name: "Arjun Kumar",
    role: "Student, Class 11",
    avatar: '',
    rating: 5,
    comment: "The summaries feature has been a game-changer for my exam preparation. It helps me quickly review key concepts and saves so much time. The voice navigation is also very intuitive.",
    date: "3 weeks ago"
  }
]

  React.useEffect(() => {
    function onResize() {
      const w = window.innerWidth
      if (w < 640) setSlidesToShow(1)
      else if (w < 1024) setSlidesToShow(3)
      else setSlidesToShow(4)
    }
    onResize()
    window.addEventListener("resize", onResize)
    return () => {
      window.removeEventListener("resize", onResize)
    }
  }, [])

  React.useEffect(() => {
    if (!emblaApi) return
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap())
    emblaApi.on("select", onSelect)
    onSelect()
    return () => {
      emblaApi.off("select", onSelect)
    }
  }, [emblaApi])

  const handleSubmitReview = (review: { name: string; role: string; rating: number; comment: string }) => {
    const newReview: ReviewData = {
      id: String(Date.now()),
      name: review.name,
      role: review.role,
      avatar: undefined,
      rating: review.rating,
      comment: review.comment,
      date: "",
    }

    setReviews((currentReviews) => [newReview, ...currentReviews])
    requestAnimationFrame(() => emblaApi?.scrollTo(0))
  }

  const translations = {
    writeReview: {
      en: "Write a Review",
      hi: "समीक्षा लिखें",
      te: "సమీక్ష రాయండి",
    },
  }

  return (
    <section className="relative w-full overflow-hidden bg-[#F0FDFA] py-14 sm:py-20 dark:bg-background">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-0 top-0 h-52 w-52 rounded-full bg-[#0F766E]/10 blur-3xl dark:bg-primary/5" />
        <div className="absolute right-0 top-12 h-56 w-56 rounded-full bg-[#14B8A6]/10 blur-3xl dark:bg-secondary/5" />
        <div className="absolute -left-2 top-8 hidden h-40 w-28 opacity-60 [background-image:radial-gradient(rgba(15,118,110,0.18)_2px,transparent_2px)] [background-size:18px_18px] sm:block" />
        <div className="absolute -bottom-2 right-0 hidden h-40 w-32 opacity-50 [background-image:radial-gradient(rgba(20,184,166,0.15)_2px,transparent_2px)] [background-size:18px_18px] sm:block" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl text-center">
          {eyebrow && (
            <div className="mx-auto inline-flex items-center gap-2 rounded-full bg-[#CCFBF1] px-5 py-2 text-sm font-semibold text-[#0F766E] shadow-sm dark:bg-[#0F766E]/15 dark:text-[#5EEAD4]">
              <MessageCircleMore className="h-4 w-4" />
              {eyebrow}
            </div>
          )}

          <h2 className="mt-6 text-4xl font-black tracking-tight text-slate-950 sm:text-6xl dark:text-foreground">
            {language === "en" && title.includes("Thousands") ? (
              <span className="inline-flex flex-wrap items-end justify-center gap-x-3 gap-y-0">
                <span>{titleParts[0]}</span>
                <span className="relative inline-flex items-end pb-3 text-slate-950 dark:text-foreground">
                  <span>Thousands</span>
                  <span className="absolute -bottom-1 left-0 h-1 w-full rounded-full bg-[#F59E0B]/80" />
                  {/* decorative heart removed per design: keep only underline */}
                </span>
                <span>{titleParts[1]}</span>
              </span>
            ) : (
              title
            )}
          </h2>

          {subtitle && (
            <p className="mx-auto mt-5 max-w-4xl text-lg leading-8 text-slate-500 sm:text-2xl dark:text-muted-foreground">
              {subtitle.split("VidyaAI.").map((part, index) => (
                <span key={index}>
                  {part}
                  {index === 0 && subtitle.includes("VidyaAI.") && (
                    <span className="font-semibold text-[#0F766E]">VidyaAI.</span>
                  )}
                </span>
              ))}
            </p>
          )}

          <div className="mt-8 flex items-center justify-center">
            <button
              type="button"
              onClick={() => setShowReviewForm(true)}
              className="inline-flex items-center gap-2 rounded-full border border-[#CCFBF1] bg-white px-5 py-3 text-sm font-semibold text-[#0F766E] shadow-sm transition-colors hover:bg-[#CCFBF1]/40 hover:text-[#115E59] dark:border-[#0F766E]/30 dark:bg-card dark:text-[#5EEAD4] dark:hover:bg-[#0F766E]/10"
            >
              <PlusCircle className="h-4 w-4" />
              {translations.writeReview[language]}
            </button>
          </div>
        </div>

  return (
    <section className="w-full py-12">
      <div className="container px-4 mx-auto">
        {/* <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">{title}</h2>
            {subtitle && <p className="text-muted-foreground mt-2">{subtitle}</p>}
          </div>

          <div ref={emblaRef} className="embla overflow-hidden h-auto sm:h-[30rem] lg:h-[32rem]">
            <div className="embla__container flex items-stretch">
              {reviews.map((review, index) => (
                <div
                  key={review.id}
                      className="embla__slide h-full px-3 sm:px-5"
                      style={{ flex: `0 0 ${100 / slidesToShow}%`, maxWidth: `${100 / slidesToShow}%` }}
                      aria-hidden={Math.floor(index / Math.max(1, slidesToShow)) !== Math.floor(selectedIndex / Math.max(1, slidesToShow))}
                >
                  <div className="flex h-full w-full justify-center">
                    <ReviewCard review={review} />
                  </div>
                </div>
              ))}
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
