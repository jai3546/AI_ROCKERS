'use client';

import React, { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  quote: string;
  rating: number;
  avatar: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Priya Sharma",
    role: "Student, Class 10",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    rating: 5,
    quote: "VidyAI has completely transformed my learning experience. The voice commands make it so easy to navigate and  improved my grades significantly!",
    // date: "2 weeks ago"
  },
  {
    id: 2,
    name: "Rahul Patel",
    role: "Student, Class 8",
     avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    rating: 4,
    quote: "I love using the flashcards and quizzes. Its fun and interactive. The dark mode is also great for studying at night without straining my eyes.",
    // date: "1 month ago"
  },
  {
    id: 3,
    name: "Ananya Reddy",
    role: "Student, Class 9",
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    rating: 5,
    quote: "The AI tutor is like having a personal teacher available 24/7. It explains concepts in a way that's easy to understand and adapts to my learning style.",
    // date: "3 weeks ago"
  },
  {
    id: 4,
    name: "Vikram Singh",
    role: "Teacher, Science",
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    rating: 5,
    quote: "As a teacher, I find the school portal incredibly useful. It helps me track student progress and the weekly reports are insightful.",
    // date: "1 month ago"
  },
  {
    id: 5,
    name: "Meera Desai",
    role: "Parent",
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
    rating: 4,
    quote: "Tracking my child's emotions reveals how he truly engage, empowering me to provide targeted, meaningful support right where they need it most.",
    // date: "2 months ago"
  },
  {
    id: 6,
    name: "Arjun Kumar",
    role: "Student, Class 11",
     avatar:'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    rating: 5,
    quote: "The summaries feature has been a game-changer for my exam preparation; quick review of key concepts saves so much time.",
    // date: "3 weeks ago"
  }
]

export default function TestimonialCarousel() {
  const [startIndex, setStartIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(4);
  const cardsRef = useRef<HTMLDivElement[]>([]);
  const totalItems = testimonials.length;

  // Track and dynamically adjust visible cards based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setVisibleCount(1); // Mobile
      } else if (window.innerWidth < 1024) {
        setVisibleCount(3); // Tablet (md) — show 3 cards
      } else {
        setVisibleCount(4); // Desktop (lg)
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handlePrev = () => {
    setStartIndex((prev) => (prev - 1 + totalItems) % totalItems);
  };

  const handleNext = () => {
    setStartIndex((prev) => (prev + 1) % totalItems);
  };

  useEffect(() => {
    cardsRef.current.forEach((card, index) => {
      if (!card) return;

      let relativePos = (index - startIndex + totalItems) % totalItems;

      // Completely hide cards that aren't in the active pool or immediate buffer zones
      if (relativePos >= visibleCount && relativePos < totalItems - 1) {
        gsap.set(card, { display: 'none', opacity: 0 });
        return;
      }

      let xPercent = 0;
      let scale = 1.0;
      let opacity = 1;
      let zIndex = 1;
      let borderColor = '#F3F4F6';
      let boxShadow = '0px 4px 20px rgba(0, 0, 0, 0.02)';

      // Item sizing steps depending on the dynamic active layout size
      const cardWidthFactor = 100 / visibleCount;
      const gapOffset = 1.05; // Spacing scaling factor (percentage of element width)

      // Move by multiples of the element's own width (100% == one slot)
      if (relativePos < visibleCount) {
        xPercent = relativePos * 100 * gapOffset;
        
        // Match original mock layout: Highlight the 2nd slot on desktop/tablet, or the single active card on mobile
        if ((visibleCount > 1 && relativePos === 1) || (visibleCount === 1 && relativePos === 0)) {
          scale = 1.03;
          zIndex = 10;
          borderColor = '#FF71A4';
          boxShadow = '0px 20px 40px rgba(255, 113, 164, 0.12)';
        }
      } else if (relativePos === totalItems - 1) {
        // Pre-stage hidden card just off the left edge for clean entry transitions
        xPercent = -100 * gapOffset;
        opacity = 0;
        zIndex = 0;
      }

      gsap.to(card, {
        display: 'flex',
        xPercent,
        scale,
        opacity,
        zIndex,
        borderColor,
        boxShadow,
        duration: 0.5,
        ease: 'power2.out',
      });
    });
  }, [startIndex, totalItems, visibleCount]);

  return (
    <section className="relative w-full min-h-screen bg-[#FFF5F8] py-12 md:py-16 px-4 flex flex-col items-center justify-center overflow-hidden font-sans">
      
      {/* Header */}
      <div className="text-center mb-8 md:mb-12 max-w-2xl">
        <span className="inline-flex items-center gap-2 bg-[#FFEBF2] text-[#FF508E] font-medium text-sm px-4 py-1.5 rounded-full mb-4 shadow-sm">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"><path d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM11 9H9v2h2V9z" /></svg>
          User Feedback
        </span>
        <h2 className="text-3xl md:text-5xl font-bold text-[#0F172A] tracking-tight mb-4">
          Loved by Students, Trusted by <span className="relative inline-block text-[#0F172A]">Thousands<span className="absolute bottom-0 left-0 w-full h-[6px] bg-[#FF71A4] rounded-full opacity-40"></span></span>
        </h2>
        <p className="text-sm md:text-base text-[#64748B]">
          Here's what our users have to say about <span className="text-[#FF508E] font-semibold">VidyaAI Sage</span>.
        </p>
      </div>

      {/* Viewport Frame */}
      <div className="relative w-full flex items-center justify-center my-4 h-[420px] md:h-[380px]">
        
        {/* Left Control Arrow */}
        <button 
          onClick={handlePrev}
          className="absolute left-0 md:left-2 z-30 p-3 md:p-4 rounded-full bg-white text-[#FF508E] shadow-md border border-[#FFEBF2] hover:bg-[#FFEBF2] active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-[#FF508E]"
          aria-label="Previous testimonials"
        >
          <svg className="w-5 h-5 transform rotate-180" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
        </button>

        {/* Carousel Mask Wrapper */}
        <div className="relative w-full h-full overflow-hidden mx-10 md:mx-14">
          <div className="absolute top-0 left-0 flex w-full h-full">
            {testimonials.map((item, idx) => (
              <div
                key={item.id}
                ref={(el) => { if (el) cardsRef.current[idx] = el; }}
                className="absolute top-4 left-0 bg-white border-2 rounded-2xl p-6 flex flex-col justify-between transition-shadow duration-300 h-[350px] md:h-[320px]"
                style={{ 
                  // Calculate width matching requested sizes: 100% (mobile), ~33.3% (md), 25% (lg)
                  width: visibleCount === 1 ? '100%' : visibleCount === 3 ? 'calc(33.33% - 16px)' : 'calc(25% - 18px)',
                  transformOrigin: 'center center'
                }}
              >
                <div>
                  <div className="text-[#FF71A4] opacity-80 text-4xl font-serif leading-none mb-2" aria-hidden="true">“</div>
                  <p className="text-[#334155] font-medium leading-relaxed mb-4 text-[13px] md:text-[14px] line-clamp-6">
                    {item.quote}
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center gap-3 mt-auto">
                  <img 
                    src={item.avatar} 
                    alt="" 
                    className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                  />
                  <div>
                    <h4 className="font-bold text-[#0F172A] text-sm">{item.name}</h4>
                    <p className="text-[#FF508E] font-semibold text-xs">{item.role}</p>
                    <div className="flex gap-0.5 mt-0.5" aria-label={`Rated ${item.rating} out of 5 stars`}>
                      {[...Array(item.rating)].map((_, i) => (
                        <svg key={i} className="w-3 h-3 text-[#FBBF24]" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Control Arrow */}
        <button 
          onClick={handleNext}
          className="absolute right-0 md:right-2 z-30 p-3 md:p-4 rounded-full bg-white text-[#FF508E] shadow-md border border-[#FFEBF2] hover:bg-[#FFEBF2] active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-[#FF508E]"
          aria-label="Next testimonials"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
        </button>

      </div>

      {/* Pagination Dot Navigation */}
      <div className="flex justify-center items-center gap-2.5 mt-6">
        {testimonials.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setStartIndex(idx)}
            className={`h-3 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#FF508E] ${
              idx === startIndex ? 'w-8 bg-[#FF508E]' : 'w-3 bg-[#FFC5DA]'
            }`}
            aria-label={`Go to slide frame ${idx + 1}`}
          />
        ))}
      </div>

      {/* Footer Decoration */}
      <div className="mt-12 flex items-center gap-2 text-xs md:text-sm font-semibold text-[#1E293B]">
        <svg className="w-5 h-5 text-[#FF508E] fill-current animate-pulse" viewBox="0 0 20 20" aria-hidden="true"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg>
        Thank you for being a part of our journey!
      </div>

    </section>
  );
}