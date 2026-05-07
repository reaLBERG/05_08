import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { FlipUnit } from './FlipUnit';

export const Countdown = ({ targetDate, currentTimeMs, onComplete }: { targetDate: number; currentTimeMs: number; onComplete: () => void; key?: string }) => {
  const [timeLeft, setTimeLeft] = useState<{ d: number; h: number; m: number; s: number } | null>(null);
  const isRockPhase = targetDate - currentTimeMs <= 28000;
  const hasFinishedRef = useRef(false);

  useEffect(() => {
    if (hasFinishedRef.current) return;
    const distance = targetDate - currentTimeMs;

    if (distance <= 0) {
      hasFinishedRef.current = true;
      onComplete();
      return;
    }

    setTimeLeft({
      d: Math.floor(distance / (1000 * 60 * 60 * 24)),
      h: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      m: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
      s: Math.floor((distance % (1000 * 60)) / 1000),
    });
  }, [targetDate, currentTimeMs, onComplete]);

  if (!timeLeft) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ 
        opacity: 0,
        transition: { duration: 1, ease: 'easeInOut' }
      }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#050505] p-6 text-center overflow-hidden"
    >
      {/* Visual background elements */}
          <div className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden pointer-events-none">
            <motion.div 
              animate={{ 
                scale: isRockPhase ? 1.4 : [1, 1.4, 1],
                opacity: isRockPhase ? 0 : [0.3, 0.6, 0.3]
              }}
              transition={{ duration: isRockPhase ? 2 : 8, repeat: isRockPhase ? 0 : Infinity, ease: 'easeInOut' }}
              className="absolute w-[400px] h-[400px] md:w-[800px] md:h-[800px] rounded-full transform-gpu will-change-transform" 
              style={{ background: 'radial-gradient(50% 50% at 50% 50%, rgba(37,99,235,0.4) 0%, transparent 100%)' }}
            />
            <motion.div 
              animate={{ 
                scale: [1.2, 1, 1.2],
                opacity: isRockPhase ? 0 : [0.2, 0.5, 0.2]
              }}
              transition={{ duration: isRockPhase ? 2 : 12, repeat: isRockPhase ? 0 : Infinity, ease: 'easeInOut' }}
              className="absolute w-[300px] h-[300px] md:w-[600px] md:h-[600px] rounded-full transform-gpu will-change-transform" 
              style={{ background: 'radial-gradient(50% 50% at 50% 50%, rgba(234,88,12,0.3) 0%, transparent 100%)' }}
            />
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ 
                scale: isRockPhase ? [1, 1.3, 1] : 1,
                opacity: isRockPhase ? [0.25, 0.55, 0.25] : 0
              }}
              transition={{ 
                scale: { duration: 6.4, repeat: Infinity, ease: 'easeInOut' },
                opacity: { duration: isRockPhase ? 4 : 3, repeat: isRockPhase ? Infinity : 0, ease: 'easeInOut' }
              }}
              className="absolute w-[350px] h-[350px] md:w-[700px] md:h-[700px] rounded-full transform-gpu will-change-transform" 
              style={{ background: 'radial-gradient(50% 50% at 50% 50%, rgba(220,38,38,0.55) 0%, transparent 100%)' }}
            />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30" />
          </div>
      
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full flex flex-col items-center justify-center gap-20 md:gap-24 max-w-4xl"
      >
        <div className="space-y-4 md:space-y-6">
          <motion.div
            animate={{ 
              opacity: [0.3, 0.8, 0.3]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="text-orange-500 font-mono text-[10px] md:text-xs uppercase tracking-[0.6em]"
          >
            Cosmic Event approaching
          </motion.div>
          <h2 className="text-5xl md:text-8xl font-black italic tracking-tighter text-white uppercase max-w-2xl mx-auto leading-none">
            The Reveal<br/><span className="text-white/20">Is Near!</span>
          </h2>
        </div>

        <div className="flex gap-2.5 md:gap-8 justify-center">
          <FlipUnit value={timeLeft.d} label="Days" />
          <FlipUnit value={timeLeft.h} label="Hours" />
          <FlipUnit value={timeLeft.m} label="Min" />
          <FlipUnit value={timeLeft.s} label="Sec" />
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-12 h-px bg-white/10" />
          <p className="text-white/40 text-[10px] md:text-xs font-mono tracking-widest uppercase px-6">
            Establishing stable orbit for May 8th <br className="md:hidden" /><span className="hidden md:inline"> • </span>
            <a href="https://t.me/muzdev" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors underline decoration-white/20 hover:decoration-white/60">TaiTake</a>
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};
