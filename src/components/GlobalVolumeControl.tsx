import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, VolumeX, Volume1 } from 'lucide-react';

export const GlobalVolumeControl = ({ volume, setVolume }: { volume: number; setVolume: (v: number) => void }) => {
  const [isOpen, setIsOpen] = useState(false);

  const getVolumeIcon = () => {
    if (volume === 0) return <VolumeX className={`w-4 h-4 md:w-5 md:h-5 ${isOpen ? 'text-orange-500' : 'text-white/60'}`} />;
    if (volume < 0.5) return <Volume1 className={`w-4 h-4 md:w-5 md:h-5 ${isOpen ? 'text-orange-500' : 'text-white/60'}`} />;
    return <Volume2 className={`w-4 h-4 md:w-5 md:h-5 ${isOpen ? 'text-orange-500' : 'text-white/60'}`} />;
  };

  return (
    <div className="fixed top-4 right-4 md:top-8 md:right-8 z-[110] flex items-center gap-4">
       <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="bg-black/60 backdrop-blur-md px-3 md:px-4 py-1.5 md:py-2 rounded-full border border-white/10 flex items-center gap-3"
          >
            <span className="text-[9px] md:text-[10px] font-mono text-white/40 uppercase tracking-tighter">Ambient</span>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.01" 
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-20 md:w-24 h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-orange-500"
            />
          </motion.div>
        )}
      </AnimatePresence>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
      >
        {getVolumeIcon()}
      </button>
    </div>
  );
};
