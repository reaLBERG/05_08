import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, Music, Volume2, VolumeX, Volume1 } from 'lucide-react';
import { Track } from '../types';

export const MusicPlayer = ({ 
  currentTrack, 
  isPlaying, 
  togglePlay,
  volume,
  setVolume,
  currentTime,
  duration,
  onSeek
}: { 
  currentTrack: Track | null; 
  isPlaying: boolean; 
  togglePlay: () => void;
  volume: number;
  setVolume: (v: number) => void;
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
}) => {
  const [isVolumeOpen, setIsVolumeOpen] = useState(false);
  const volumeRef = useRef<HTMLDivElement>(null);
  const prevVolumeRef = useRef(volume > 0 ? volume : 0.4);
  
  const toggleMute = () => {
    if (volume > 0) {
      prevVolumeRef.current = volume;
      setVolume(0);
    } else {
      setVolume(prevVolumeRef.current);
    }
  };

  const getVolumeIcon = () => {
    if (volume === 0) return <VolumeX className="w-4 h-4" />;
    if (volume < 0.5) return <Volume1 className="w-4 h-4" />;
    return <Volume2 className="w-4 h-4" />;
  };
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (volumeRef.current && !volumeRef.current.contains(event.target as Node)) {
        setIsVolumeOpen(false);
      }
    };

    if (isVolumeOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVolumeOpen]);

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!currentTrack) return null;

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="fixed bottom-0 left-0 right-0 z-50 p-3 md:p-6"
    >
      <div className="max-w-5xl mx-auto bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl md:rounded-full shadow-2xl flex flex-col md:flex-row items-center gap-2.5 md:gap-4 px-4 md:px-6 py-2.5 md:py-4">
        {/* Track Info & Mobile Controls */}
        <div className="flex items-center justify-between w-full md:w-1/4 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 md:w-12 md:h-12 bg-orange-500 flex-shrink-0 rounded-lg md:rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(249,115,22,0.4)]">
              <Music className="text-black w-4 h-4 md:w-6 md:h-6" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-white text-xs md:text-base font-medium truncate leading-tight">{currentTrack.title}</span>
              <span className="text-white/40 text-[9px] md:text-xs truncate">{currentTrack.artist}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 md:hidden">
            {/* Mobile Play Button */}
            <button 
              onClick={togglePlay}
              className="w-9 h-9 rounded-full bg-white flex-shrink-0 flex items-center justify-center active:scale-90 transition-transform"
            >
              {isPlaying ? (
                <Pause className="text-black fill-black w-4 h-4" />
              ) : (
                <Play className="text-black fill-black w-4 h-4 ml-0.5" />
              )}
            </button>
            
            {/* Mobile Volume Trigger */}
            <div className="relative" ref={volumeRef}>
              <AnimatePresence>
                {isVolumeOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.9 }}
                    className="absolute bottom-12 right-0 bg-black/90 backdrop-blur-xl border border-white/10 p-3 rounded-xl flex flex-col items-center gap-2 shadow-2xl z-[60]"
                  >
                    <div className="h-20 w-4 relative flex items-center justify-center">
                      <input 
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={(e) => setVolume(parseFloat(e.target.value))}
                        style={{ 
                          writingMode: 'bt-lr', 
                          WebkitAppearance: 'slider-vertical',
                          width: '4px',
                          height: '100%'
                        } as any}
                        className="accent-orange-500 h-full"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <button 
                onClick={() => setIsVolumeOpen(!isVolumeOpen)}
                className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all ${
                  isVolumeOpen ? 'bg-orange-500 border-orange-500 text-black shadow-lg scale-110' : 'bg-black/60 border-white/10 text-white/40'
                }`}
              >
                {getVolumeIcon()}
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Play Button (Hidden on Mobile) */}
        <button 
          onClick={togglePlay}
          className="hidden md:flex w-12 h-12 rounded-full bg-white flex-shrink-0 items-center justify-center hover:scale-110 active:scale-95 transition-transform"
        >
          {isPlaying ? (
            <Pause className="text-black fill-black w-6 h-6" />
          ) : (
            <Play className="text-black fill-black w-6 h-6 ml-1" />
          )}
        </button>

        {/* Progress Bar */}
        <div className="flex-1 flex flex-col gap-1 w-full">
          <div className="flex items-center gap-3 w-full">
            <div className="flex-1 h-1 bg-white/10 rounded-full relative group/seek">
              <input 
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={(e) => onSeek(parseFloat(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
              />
              <motion.div 
                className="absolute inset-y-0 left-0 bg-orange-500 rounded-full pointer-events-none"
                style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
              />
            </div>
            <div className="text-[9px] font-mono text-white/30 whitespace-nowrap min-w-[70px] text-right">
                {formatTime(currentTime)} / {currentTrack.duration}
            </div>
          </div>
        </div>

        {/* Desktop Volume */}
        <div className="hidden md:flex items-center gap-3 group/volume">
            <button 
              onClick={toggleMute}
              className="text-white/40 hover:text-white transition-colors"
              title={volume === 0 ? "Unmute" : "Mute"}
            >
              {volume === 0 ? <VolumeX className="w-4 h-4" /> : volume < 0.5 ? <Volume1 className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.01" 
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-24 h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-orange-500 hover:bg-white/30 transition-all focus:outline-none"
            />
        </div>

      </div>
    </motion.div>
  );
};
