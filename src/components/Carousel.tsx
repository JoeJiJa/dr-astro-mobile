"use client";

import React, { useRef, useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import Image from 'next/image';

interface CardData {
  id: string | number;
  title: string;
  image: string;
}

interface CarouselSectionProps {
  title: string;
  items: CardData[];
}

/**
 * Pixel-perfect Carousel Card component
 * Fixed aspect ratio 2:3, rounded corners, centered title below
 */
export const CarouselCard = ({ item }: { item: CardData }) => {
  return (
    <div className="flex-none w-[170px] md:w-[220px] group cursor-pointer select-none">
      <div className="relative aspect-[2/3] overflow-hidden rounded-2xl bg-zinc-900 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-500 ease-out group-hover:scale-[1.05] group-hover:ring-1 group-hover:ring-white/40">
        <Image
          src={item.image}
          alt={item.title}
          fill
          sizes="(max-width: 768px) 170px, 220px"
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />
        {/* Subtle overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
      <p className="mt-4 text-center text-sm md:text-base font-bold text-zinc-400 group-hover:text-white transition-colors duration-300 line-clamp-2 px-2 leading-snug tracking-tight">
        {item.title}
      </p>
    </div>
  );
};

/**
 * Main Carousel Section component
 * Features horizontal scrolling, category title, and hover-triggered navigation
 */
/**
 * Generic Unified Carousel component
 * Wraps any horizontal scrolling content with cinematic navigation arrows
 */
export const UnifiedCarousel = ({ 
  title, 
  children, 
  className = "", 
  containerComponent: Container = "div",
  containerProps = {} 
}: { 
  title?: string, 
  children: React.ReactNode, 
  className?: string,
  containerComponent?: any,
  containerProps?: any
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const lastScrollTime = useRef(0);

  const updateArrows = () => {
    const now = Date.now();
    if (now - lastScrollTime.current < 100) return;
    lastScrollTime.current = now;

    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 20);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 20);
    }
  };

  useEffect(() => {
    updateArrows();
    const handleResize = () => updateArrows();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [children]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      const scrollAmount = direction === 'left' ? -clientWidth * 0.8 : clientWidth * 0.8;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className={`w-full py-8 md:py-14 overflow-hidden ${className}`}>
      {title && (
        <div className="px-6 md:px-16 mb-8">
          <h2 className="text-2xl md:text-4xl font-black text-white tracking-tighter uppercase font-sans">
            {title}
          </h2>
        </div>
      )}
      
      <div className="relative group/carousel px-0">
        <AnimatePresence>
          {showLeftArrow && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute left-0 top-0 bottom-0 z-30 w-20 md:w-32 hidden md:flex items-center justify-start pl-6 bg-gradient-to-r from-black via-black/40 to-transparent opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300 pointer-events-none"
            >
              <button
                onClick={(e) => { e.stopPropagation(); scroll('left'); }}
                className="p-4 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/10 backdrop-blur-2xl transition-all hover:scale-110 pointer-events-auto shadow-2xl"
                aria-label="Scroll Left"
              >
                <ChevronLeft size={32} strokeWidth={2.5} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <Container
          ref={scrollRef}
          onScroll={updateArrows}
          className="flex gap-4 md:gap-8 overflow-x-auto px-6 md:px-16 pb-8 no-scrollbar snap-x snap-mandatory"
          {...containerProps}
        >
          {children}
        </Container>

        <AnimatePresence>
          {showRightArrow && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute right-0 top-0 bottom-0 z-30 w-20 md:w-32 hidden md:flex items-center justify-end pr-6 bg-gradient-to-l from-black via-black/40 to-transparent opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300 pointer-events-none"
            >
              <button
                onClick={(e) => { e.stopPropagation(); scroll('right'); }}
                className="p-4 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/10 backdrop-blur-2xl transition-all hover:scale-110 pointer-events-auto shadow-2xl"
                aria-label="Scroll Right"
              >
                <ChevronRight size={32} strokeWidth={2.5} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};


/**
 * Legacy CarouselSection (uses UnifiedCarousel internally)
 */
export const CarouselSection = ({ title, items }: CarouselSectionProps) => {
  return (
    <UnifiedCarousel title={title}>
      {items.map((item, index) => (
        <div key={item.id || index} className="snap-start first:ml-0">
          <CarouselCard item={item} />
        </div>
      ))}
    </UnifiedCarousel>
  );
};

export default CarouselSection;
