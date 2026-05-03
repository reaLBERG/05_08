import { motion } from 'motion/react';
import { StarryBackground } from './StarryBackground';

export const IntroScreen = ({ onStart }: { onStart: () => void; key?: string }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 1 } }}
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#050505] overflow-hidden select-none"
    >
      <div className="absolute inset-0 z-0 pointer-events-none">
         <StarryBackground />
         <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.05, 0.12, 0.05]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[140px]" 
        />
      </div>

      <div className="relative z-10 flex items-center justify-center p-4">
        <motion.button
          onClick={onStart}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="relative w-56 h-56 md:w-72 md:h-72 flex items-center justify-center bg-[#0a0a0a] border border-white/10 rounded-full group outline-none cursor-pointer overflow-visible"
        >
          {/* Concentric blue waves */}
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="absolute inset-0 rounded-full border border-blue-500/60 pointer-events-none"
              initial={{ opacity: 0, scale: 1 }}
              animate={{ 
                opacity: [0, 0.7, 0],
                scale: [1, 2.5]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                delay: i * 1.3,
                ease: "easeOut"
              }}
            />
          ))}
          
          <span className="relative z-10 text-white font-black italic text-3xl md:text-4xl tracking-tight uppercase drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] group-hover:text-blue-200 transition-all duration-300">
            Ready?
          </span>
        </motion.button>
      </div>
    </motion.div>
  );
};
