import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export const FlipUnit = ({ value, label }: { value: number; label: string }) => {
  const prevValue = useRef(value);
  const [isFlipping, setIsFlipping] = useState(false);

  useEffect(() => {
    if (prevValue.current !== value) {
      setIsFlipping(true);
      const timer = setTimeout(() => {
        setIsFlipping(false);
        prevValue.current = value;
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [value]);

  const formattedValue = String(value).padStart(2, '0');
  const prevFormatted = String(prevValue.current).padStart(2, '0');

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-[4.5rem] h-20 md:w-32 md:h-40 perspective-1000">
        {/* Top Half (Static Background) */}
        <div className="absolute inset-0 bg-[#111] rounded-lg md:rounded-xl overflow-hidden shadow-2xl">
          <div className="absolute top-0 w-full h-1/2 bg-white/5 flex items-end justify-center overflow-hidden border-b border-white/5">
            <span className="text-5xl md:text-8xl font-black font-mono text-white translate-y-[48%] md:translate-y-[52%]">{formattedValue}</span>
          </div>
          <div className="absolute bottom-0 w-full h-1/2 bg-transparent flex items-start justify-center overflow-hidden">
            <span className="text-5xl md:text-8xl font-black font-mono text-white -translate-y-[48%] md:-translate-y-[52%]">{prevFormatted}</span>
          </div>
        </div>

        {/* Flipping Top Card */}
        <AnimatePresence initial={false}>
          {isFlipping && (
            <motion.div
               key={`${label}-${value}-top`}
               initial={{ rotateX: 0 }}
               animate={{ rotateX: -90 }}
               transition={{ duration: 0.3, ease: 'easeIn' }}
               style={{ transformOrigin: 'bottom' }}
               className="absolute top-0 w-full h-1/2 bg-[#111] rounded-t-lg md:rounded-t-xl flex items-end justify-center overflow-hidden z-20 border-b border-white/10"
            >
              <span className="text-5xl md:text-8xl font-black font-mono text-white translate-y-[48%] md:translate-y-[52%]">{prevFormatted}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Flipping Bottom Card */}
        <AnimatePresence initial={false}>
          {isFlipping && (
            <motion.div
               key={`${label}-${value}-bottom`}
               initial={{ rotateX: 90 }}
               animate={{ rotateX: 0 }}
               transition={{ delay: 0.3, duration: 0.3, ease: 'easeOut' }}
               style={{ transformOrigin: 'top' }}
               className="absolute bottom-0 w-full h-1/2 bg-[#1a1a1a] rounded-b-lg md:rounded-b-xl flex items-start justify-center overflow-hidden z-20"
            >
              <span className="text-5xl md:text-8xl font-black font-mono text-white -translate-y-[48%] md:-translate-y-[52%]">{formattedValue}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Divider Line */}
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-black/40 z-30 shadow-[0_0_10px_rgba(0,0,0,0.5)]" />
      </div>
      <span className="text-[9px] md:text-xs font-mono text-white/30 uppercase tracking-[0.2em] mt-4 md:mt-6">
        {label}
      </span>
    </div>
  );
};
