import React, { useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { getDaysInViewMonth } from './utils';

export const CalendarStrip = React.memo(({
    viewDate,
    selectedDate,
    onSelectDate
}: {
    viewDate: Date,
    selectedDate: Date,
    onSelectDate: (d: Date) => void
}) => {
    const dates = useMemo(() => getDaysInViewMonth(viewDate), [viewDate]);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            const today = new Date();
            const targetDate = dates.find(d =>
                d.fullDate.getDate() === selectedDate.getDate() &&
                d.fullDate.getMonth() === selectedDate.getMonth()
            ) || dates.find(d => d.isToday);

            if (targetDate) {
                const index = dates.indexOf(targetDate);
                if (index !== -1) {
                    const itemWidth = 58;
                    const scrollPos = (index * itemWidth) - (scrollRef.current.clientWidth / 2) + (itemWidth / 2);
                    scrollRef.current.scrollTo({ left: scrollPos, behavior: 'smooth' });
                }
            } else {
                scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
            }
        }
    }, [viewDate, selectedDate, dates]);

    return (
        <div ref={scrollRef} className="flex gap-3 overflow-x-auto pb-6 pt-2 px-4 scrollbar-hide mask-fade-right">
            {dates.map((d, i) => {
                const isSelected = d.fullDate.getDate() === selectedDate.getDate() &&
                    d.fullDate.getMonth() === selectedDate.getMonth() &&
                    d.fullDate.getFullYear() === selectedDate.getFullYear();

                return (
                    <motion.div
                        key={i}
                        layoutId={`date-${i}`}
                        onClick={() => onSelectDate(d.fullDate)}
                        className={`flex flex-col items-center min-w-[54px] space-y-3 cursor-pointer transition-all shrink-0 group ${isSelected || d.isToday ? 'opacity-100' : 'opacity-60 hover:opacity-100'
                            }`}
                        animate={{ scale: isSelected ? 1.05 : 1 }}
                    >
                        <span className={`text-[10px] uppercase font-bold tracking-widest ${isSelected ? 'text-blue-400' : 'text-zinc-500 group-hover:text-zinc-300'}`}>{d.day}</span>
                        <div className={`
                            w-14 h-16 rounded-2xl flex flex-col items-center justify-center border transition-all duration-300 relative overflow-hidden
                            ${isSelected
                                ? 'bg-gradient-to-br from-blue-600 to-blue-800 border-blue-400 shadow-[0_4px_20px_-4px_rgba(59,130,246,0.6)]'
                                : (d.isToday
                                    ? 'bg-zinc-800/80 border-zinc-600 shadow-lg'
                                    : 'bg-zinc-900/30 border-transparent hover:bg-zinc-800/50 hover:border-zinc-700')
                            }
                        `}>
                            {isSelected && <div className="absolute inset-0 bg-blue-400/20 blur-xl" />}
                            <span className={`text-xl font-bold relative z-10 ${isSelected ? 'text-white' : (d.isToday ? 'text-white' : 'text-zinc-400')}`}>
                                {d.date}
                            </span>
                        </div>
                        {d.isToday && !isSelected && <div className="w-1.5 h-1.5 rounded-full bg-zinc-500 shadow-sm"></div>}
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>}
                    </motion.div>
                );
            })}
        </div>
    );
});
CalendarStrip.displayName = 'CalendarStrip';

export default CalendarStrip;
