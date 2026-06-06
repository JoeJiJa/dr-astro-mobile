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
    <div className="flex-none w-[160px] md:w-[240px] group cursor-pointer select-none">
      <div className="relative aspect-[2/3] overflow-hidden rounded-xl md:rounded-2xl bg-zinc-900 shadow-2xl transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-[1.08] group-hover:z-50 group-hover:ring-2 group-hover:ring-zinc-400">
        <Image
          src={item.image}
          alt={item.title}
          fill
          sizes="(max-width: 768px) 160px, 240px"
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />
        {/* Cinematic gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Optional: 'Recently Added' style badge placeholder */}
        <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
           <span className="bg-red-600 text-[8px] font-black text-white px-2 py-1 rounded-sm uppercase tracking-tighter">Medical Standard</span>
        </div>
      </div>
      <p className="mt-4 text-center text-[11px] md:text-sm font-bold text-zinc-500 group-hover:text-white transition-colors duration-300 line-clamp-2 px-1 tracking-tight leading-tight">
        {item.title}
      </p>
    </div>
  );
};

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

  const updateArrows = () => {
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
      const scrollAmount = direction === 'left' ? -clientWidth * 0.9 : clientWidth * 0.9;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className={`w-full py-2 md:py-4 group/carousel relative ${className}`}>
      {title && (
        <div className="px-4 md:px-16 mb-4 md:mb-6">
          <h2 className="text-lg md:text-2xl font-bold text-white/90 hover:text-white flex items-center gap-2 group/title cursor-pointer transition-colors">
            {title}
            <span className="text-red-600 opacity-0 group-hover/title:opacity-100 -translate-x-2 group-hover/title:translate-x-0 transition-all duration-300">
              <ChevronRight size={20} strokeWidth={3} />
            </span>
          </h2>
        </div>
      )}
      
      <div className="relative">
        {/* Netflix-style Left Arrow Overlay */}
        <AnimatePresence>
          {showLeftArrow && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => scroll('left')}
              className="absolute left-0 top-0 bottom-0 z-40 w-12 md:w-16 flex items-center justify-center bg-black/40 hover:bg-black/60 text-white opacity-0 group-hover/carousel:opacity-100 transition-all duration-300 border-r border-white/5 backdrop-blur-sm"
              aria-label="Scroll Left"
            >
              <ChevronLeft size={40} className="hover:scale-125 transition-transform" />
            </motion.button>
          )}
        </AnimatePresence>

        <Container
          ref={scrollRef}
          onScroll={updateArrows}
          className="flex gap-2 md:gap-4 overflow-x-auto px-4 md:px-16 pb-6 no-scrollbar snap-x snap-mandatory scroll-smooth"
          {...containerProps}
        >
          {children}
        </Container>

        {/* Netflix-style Right Arrow Overlay */}
        <AnimatePresence>
          {showRightArrow && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => scroll('right')}
              className="absolute right-0 top-0 bottom-0 z-40 w-12 md:w-16 flex items-center justify-center bg-black/40 hover:bg-black/60 text-white opacity-0 group-hover/carousel:opacity-100 transition-all duration-300 border-l border-white/5 backdrop-blur-sm"
              aria-label="Scroll Right"
            >
              <ChevronRight size={40} className="hover:scale-125 transition-transform" />
            </motion.button>
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
