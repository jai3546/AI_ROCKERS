"use client"

import React from "react"

import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight, MessageCircleMore, PlusCircle } from "lucide-react"
import useEmblaCarousel from "embla-carousel-react"

import { ReviewCard, type ReviewData } from "./review-card"
import { ReviewForm } from "./review-form"

interface ReviewsSectionProps {
  eyebrow?: string
  title: string
  subtitle?: string
  footerText?: string
  language?: "en" | "hi" | "te"
}

const localizedReviews: Record<"en" | "hi" | "te", ReviewData[]> = {
  en: [
       {
         id: "1",
         name: "Arjun Mehta",
         role: "B.Tech Student",
         avatar: "/avatars/arjun.jpg",
         rating: 5,
         comment: "VidyaAI has completely changed the way I study. The AI explains everything so clearly!",
         date: "",
       },
       {
         id: "2",
         name: "Priya Sharma",
         role: "BCA Student",
         avatar: "/avatars/priya.jpg",
         rating: 5,
         comment: "The doubt solving and notes generation features are incredible. It’s like having a personal tutor 24/7!",
         date: "",
       },
       {
         id: "3",
         name: "Rohan Verma",
         role: "Class 10",
         avatar: "/avatars/rohan.jpg",
         rating: 5,
         comment: "Super easy to use and saves so much time. Perfect study buddy for exam preparation.",
         date: "",
       },
       {
         id: "4",
         name: "Ananya Gupta",
         role: "Class 12",
         avatar: "/avatars/ananya.jpg",
         rating: 5,
         comment: "I love how accurate and instant the answers are. VidyaAI is truly a game-changer!",
         date: "",
       },
  ],
  hi: [
       {
         id: "1",
         name: "Arjun Mehta",
         role: "बी.टेक छात्र",
         avatar: "/avatars/arjun.jpg",
         rating: 5,
         comment: "VidyaAI ने मेरे पढ़ने का तरीका पूरी तरह बदल दिया है। AI सब कुछ बहुत साफ़ तरीके से समझाता है!",
         date: "",
       },
       {
         id: "2",
         name: "Priya Sharma",
         role: "बीसीए छात्रा",
         avatar: "/avatars/priya.jpg",
         rating: 5,
         comment: "डाउट सॉल्विंग और नोट्स जनरेशन फीचर बहुत शानदार हैं। ऐसा लगता है जैसे 24/7 एक निजी ट्यूटर साथ हो!",
         date: "",
       },
       {
         id: "3",
         name: "Rohan Verma",
         role: "कक्षा 10",
         avatar: "/avatars/rohan.jpg",
         rating: 5,
         comment: "इसे इस्तेमाल करना बहुत आसान है और बहुत समय बचता है। परीक्षा की तैयारी के लिए यह सबसे अच्छा साथी है।",
         date: "",
       },
       {
         id: "4",
         name: "Ananya Gupta",
         role: "कक्षा 12",
         avatar: "/avatars/ananya.jpg",
         rating: 5,
         comment: "मुझे बहुत पसंद है कि जवाब कितने सटीक और तुरंत मिलते हैं। VidyaAI सच में एक गेम-चेंजर है!",
         date: "",
       },
  ],
  te: [
       {
         id: "1",
         name: "Arjun Mehta",
         role: "బీ.టెక్ విద్యార్థి",
         avatar: "/avatars/arjun.jpg",
         rating: 5,
         comment: "VidyaAI నా చదువు విధానాన్ని పూర్తిగా మార్చేసింది. AI అన్నీ చాలా స్పష్టంగా వివరించింది!",
         date: "",
       },
       {
         id: "2",
         name: "Priya Sharma",
         role: "బీసీఏ విద్యార్థిని",
         avatar: "/avatars/priya.jpg",
         rating: 5,
         comment: "డౌట్ సాల్వింగ్ మరియు నోట్స్ జనరేషన్ ఫీచర్లు అద్భుతం. 24/7 వ్యక్తిగత ట్యూటర్ ఉన్నట్లుగా అనిపిస్తుంది!",
         date: "",
       },
     {
       id: "3",
       name: "Rohan Verma",
       role: "వర్గం 10",
       avatar: "/avatars/rohan.jpg",
       rating: 5,
       comment: "ఇది ఉపయోగించడం చాలా సులభం మరియు చాలా సమయం ఆదా అవుతుంది. పరీక్షల సిద్ధతకు ఇది సరైన సహాయకుడు.",
       date: "",
     },
     {
       id: "4",
       name: "Ananya Gupta",
       role: "వర్గం 12",
       avatar: "/avatars/ananya.jpg",
       rating: 5,
       comment: "జవాబులు ఎంత ఖచ్చితంగా, तక్షణంగా వస్తాయో నాకు చాలా ఇష్టం. VidyaAI నిజంగా గేమ్-చేంజర్!",
       date: "",
     },
  ],
}

export function ReviewsSection({ eyebrow, title, subtitle, footerText, language = "en" }: ReviewsSectionProps) {
  const [reviews, setReviews] = React.useState<ReviewData[]>(localizedReviews[language])
  const titleParts = language === "en" && title.includes("Thousands") ? title.split("Thousands") : [title, ""]
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "center" })
  const [selectedIndex, setSelectedIndex] = React.useState(0)
  const [slidesToShow, setSlidesToShow] = React.useState(1)
  const [showReviewForm, setShowReviewForm] = React.useState(false)

  React.useEffect(() => {
    setReviews(localizedReviews[language])
    setSelectedIndex(0)
    emblaApi?.scrollTo(0)
  }, [language, emblaApi])

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

        <div className="relative mt-12 sm:mt-16">
          <div className="absolute left-0 top-1/2 z-10 -translate-y-1/2 hidden sm:flex">
            <button
              type="button"
              aria-label="Previous testimonials"
              onClick={() => emblaApi && emblaApi.scrollPrev()}
              className="h-12 w-12 items-center justify-center rounded-full border border-[#CCFBF1] bg-white text-[#0F766E] shadow-[0_10px_30px_rgba(15,118,110,0.18)] transition-transform hover:scale-105 flex focus:outline-none focus:ring-2 focus:ring-[#14B8A6] dark:border-[#0F766E]/30 dark:bg-card"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
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

          <div className="absolute right-0 top-1/2 z-10 -translate-y-1/2 hidden sm:flex">
            <button
              type="button"
              aria-label="Next testimonials"
              onClick={() => emblaApi && emblaApi.scrollNext()}
              className="h-12 w-12 items-center justify-center rounded-full border border-[#CCFBF1] bg-white text-[#0F766E] shadow-[0_10px_30px_rgba(15,118,110,0.18)] transition-transform hover:scale-105 flex focus:outline-none focus:ring-2 focus:ring-[#14B8A6] dark:border-[#0F766E]/30 dark:bg-card"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-3">
          {(() => {
            const pages = Math.max(1, Math.ceil(reviews.length / slidesToShow))
            const activePage = Math.floor(selectedIndex / Math.max(1, slidesToShow))

            return Array.from({ length: pages }).map((_, pageIndex) => (
              <button
                key={pageIndex}
                type="button"
                aria-label={`Go to testimonials page ${pageIndex + 1}`}
                onClick={() => emblaApi && emblaApi.scrollTo(pageIndex * slidesToShow)}
                className={`h-3.5 w-3.5 rounded-full transition-all ${activePage === pageIndex
 ? "bg-[#F59E0B] shadow-[0_0_0_6px_rgba(245,158,11,0.18)]"
: "bg-[#CCFBF1]"}`}
              />
            ))
          })()}
        </div>

        {footerText && (
          <div className="mt-10 text-center text-lg font-medium text-slate-700 dark:text-foreground">
            {footerText}
          </div>
        )}
      </div>

      {showReviewForm && (
        <ReviewForm
          onClose={() => setShowReviewForm(false)}
          onSubmit={handleSubmitReview}
          language={language}
        />
      )}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-[radial-gradient(ellipse_at_center,rgba(15,118,110,0.12),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(15,118,110,0.08),transparent_70%)]" />
    </section>
  )
}
