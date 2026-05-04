import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, ChevronDown } from 'lucide-react';
import confetti from 'canvas-confetti';

import { Track } from './types';
import { TRACKS } from './constants';
import { Countdown } from './components/Countdown';
import { StarryBackground } from './components/StarryBackground';
import { GlobalVolumeControl } from './components/GlobalVolumeControl';
import { MusicPlayer } from './components/MusicPlayer';
import { IntroScreen } from './components/IntroScreen';

export default function App() {
  const [timeOffset, setTimeOffset] = useState(0);
  const [isSynced, setIsSynced] = useState(false);
  const [currentTimeMs, setCurrentTimeMs] = useState(Date.now());
  const [debugTargetDate, setDebugTargetDate] = useState<number | null>(null);
  const REVEAL_GRACE_PERIOD = 60000;
  
  const targetDate = useMemo(() => {
    return debugTargetDate || new Date('2026-05-08T00:00:00+03:00').getTime();
  }, [debugTargetDate]);

  useEffect(() => {
    let isMounted = true;
    
    const syncTimeout = setTimeout(() => {
      if (isMounted && !isSynced) {
        setIsSynced(true);
      }
    }, 8000);

    async function syncTime() {
      const apis = [
        'https://timeapi.io/api/Time/current/zone?timeZone=Europe/Kyiv',
        'https://worldtimeapi.org/api/timezone/Europe/Kyiv'
      ];

      for (const url of apis) {
        if (!isMounted) return;
        try {
          const start = Date.now();
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3000);
          
          const response = await fetch(url, { signal: controller.signal });
          clearTimeout(timeoutId);
          
          if (!response.ok) continue;
          
          const data = await response.json();
          const end = Date.now();
          const latency = (end - start) / 2;
          
          const timeStr = data.dateTime || data.datetime;
          const serverTime = new Date(timeStr).getTime() + latency;
          
          if (isMounted) {
            setTimeOffset(serverTime - end);
            setCurrentTimeMs(end + (serverTime - end));
            setIsSynced(true);
            clearTimeout(syncTimeout);
            return;
          }
        } catch (e) {
        }
      }

      if (isMounted && !isSynced) {
        setIsSynced(true);
        clearTimeout(syncTimeout);
      }
    }

    syncTime();

    // Debug Helpers for Console
    (window as any).forceReveal = () => {
      console.log("🚀 Forced reveal triggered!");
      setIsRevealed(true);
      setHasStarted(true);
    };

    (window as any).setDebugDate = (dateStr: string) => {
      const newDate = new Date(dateStr).getTime();
      if (isNaN(newDate)) {
        console.error("❌ Invalid date format. Use YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss");
        return;
      }
      console.log(`📡 Setting debug target date to: ${new Date(newDate).toLocaleString()}`);
      setDebugTargetDate(newDate);
    };

    return () => { 
      isMounted = false; 
      clearTimeout(syncTimeout); 
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTimeMs(Date.now() + timeOffset);
    }, 1000); // Changed back to 1000ms to prevent huge CPU load from React rendering
    return () => clearInterval(timer);
  }, [timeOffset]);

  const isActuallyTime = isSynced && currentTimeMs >= targetDate;
  const isWithinGracePeriod = currentTimeMs < targetDate + REVEAL_GRACE_PERIOD;

  const [hasStarted, setHasStarted] = useState(false);
  const [activeTrack, setActiveTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [trackVolume, setTrackVolume] = useState(0.4);
  const [specialVolume, setSpecialVolume] = useState(0.15);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    if (isSynced && isActuallyTime) {
      const wasRevealed = localStorage.getItem('nata_birthday_revealed') === 'true';
      if (!isWithinGracePeriod || wasRevealed) {
        setHasStarted(true);
        setIsRevealed(true);
      }
    }
  }, [isSynced, isActuallyTime, isWithinGracePeriod]);

  useEffect(() => {
    if (isRevealed) {
      localStorage.setItem('nata_birthday_revealed', 'true');
    }
  }, [isRevealed]);
  
  const shouldShowBirthdayContent = isActuallyTime && (isRevealed || !isWithinGracePeriod);
  const confettiTriggered = useRef(false);
  const isFirstRevealSession = useRef(true);

  useEffect(() => {
    let interval: any;
    let frameId: number;

    if (shouldShowBirthdayContent && hasStarted && !confettiTriggered.current) {
      const alreadySeenLongAgo = !isWithinGracePeriod; 
      if (alreadySeenLongAgo) {
        confettiTriggered.current = true;
        return;
      }

      confettiTriggered.current = true;
      
      const duration = 15 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          clearInterval(interval);
          return;
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);

      const end = Date.now() + 5 * 1000;

      const frame = () => {
        confetti({
          particleCount: 2,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#ff0000', '#ffa500', '#ffff00', '#008000', '#0000ff', '#4b0082', '#ee82ee'],
          zIndex: 1000
        });
        confetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#ff0000', '#ffa500', '#ffff00', '#008000', '#0000ff', '#4b0082', '#ee82ee'],
          zIndex: 1000
        });

        if (Date.now() < end) {
          frameId = requestAnimationFrame(frame);
        }
      };
      
      frame();
    }

    return () => {
      if (interval) clearInterval(interval);
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [shouldShowBirthdayContent, hasStarted]);

  useEffect(() => {
    document.title = shouldShowBirthdayContent ? "Nata's Birthday" : "05.08";
  }, [shouldShowBirthdayContent]);

  const [isVideoIframeLoaded, setIsVideoIframeLoaded] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const engineRef = useRef<{ ctx: AudioContext, gainNode: GainNode, sources: AudioBufferSourceNode[] } | null>(null);
  const preloadedBuffers = useRef<Record<string, ArrayBuffer>>({});

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = trackVolume;
  }, [trackVolume]);

  useEffect(() => {
    if (!isActuallyTime || isWithinGracePeriod) {
        const urls = { pre1: '/05_08/audio/pre1.mp3', post1: '/05_08/audio/post1.mp3', post2: '/05_08/audio/post2.mp3', ambient: '/05_08/audio/ambient.mp3' };
        Object.entries(urls).forEach(async ([key, url]) => {
           try {
             const res = await fetch(url);
             preloadedBuffers.current[key] = await res.arrayBuffer();
           } catch(e) { console.warn("Preload failed", key); }
        });
    }
  }, [isActuallyTime, isWithinGracePeriod]);

  // Control Web Audio Engine Volume & Cleanup
  useEffect(() => {
    if (isActuallyTime && !isWithinGracePeriod) {
       if (engineRef.current) {
          const { ctx, gainNode, sources } = engineRef.current;
          gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 3);
          setTimeout(() => {
             sources.forEach(s => { try { s.stop(); } catch(e) {} });
             ctx.close();
             engineRef.current = null;
          }, 3500);
       }
    } else {
        if (engineRef.current && engineRef.current.ctx.state !== "closed") {
            try {
                engineRef.current.gainNode.gain.linearRampToValueAtTime(specialVolume, engineRef.current.ctx.currentTime + 0.1);
            } catch (e) {}
        }
    }
  }, [specialVolume, isActuallyTime, isWithinGracePeriod]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const isYT = typeof event.origin === 'string' && (event.origin.includes("youtube.com") || event.origin.includes("youtube-nocookie.com"));
      if (!isYT) return;
      
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        
        const isPlayingState = (data.event === "onStateChange" && (data.info === 1 || data.info === 3));
        const isInfoPlaying = (data.event === "infoDelivery" && data.info && (data.info.playerState === 1 || data.info.playerState === 3));
        
        if (isPlayingState || isInfoPlaying) {
          setIsPlaying(false); 
        }
      } catch (e) {
      }
    };

    const handleBlur = () => {
      setTimeout(() => {
        if (document.activeElement && document.activeElement.tagName === 'IFRAME') {
          setIsPlaying(false);
        }
      }, 100);
    };

    window.addEventListener("message", handleMessage);
    window.addEventListener("blur", handleBlur);
    return () => {
      window.removeEventListener("message", handleMessage);
      window.removeEventListener("blur", handleBlur);
    };
  }, [isActuallyTime]);

  const startAmbientEngine = async () => {
    if (engineRef.current) return;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContextClass();
    const gainNode = ctx.createGain();
    
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(specialVolume || 0.15, ctx.currentTime + 2);
    gainNode.connect(ctx.destination);

    const decoded: Record<string, AudioBuffer> = {};
    const urls = { pre1: '/05_08/audio/pre1.mp3', post1: '/05_08/audio/post1.mp3', post2: '/05_08/audio/post2.mp3', ambient: '/05_08/audio/ambient.mp3' };

    await Promise.all(Object.entries(urls).map(async ([key, url]) => {
         let arrayBuffer = preloadedBuffers.current[key];
         if (!arrayBuffer) {
             try {
                 const res = await fetch(url);
                 arrayBuffer = await res.arrayBuffer();
             } catch(e) {}
         }
         if (arrayBuffer) {
             try {
                 decoded[key] = await ctx.decodeAudioData(arrayBuffer.slice(0)); 
             } catch(e) { console.error("Decode fail", e); }
         }
    }));

    const nowReal = Date.now() + timeOffset;
    const baseCtxTime = ctx.currentTime;
    const toCtxTime = (tRealMs: number) => baseCtxTime + (tRealMs - nowReal) / 1000;

    const post1StartReal = targetDate - 40000;
    const post2StartReal = targetDate - 13000;
    const ambientStartReal = targetDate;
    
    const sources: AudioBufferSourceNode[] = [];

    const schedule = (buffer: AudioBuffer, startReal: number, endReal?: number, loop = false, manualOffset?: number, exactDurationSec?: number) => {
        const startTimeCtx = toCtxTime(startReal);
        let actualStartTimeCtx = startTimeCtx;
        let offsetCtx = manualOffset !== undefined ? manualOffset : 0;
        const loopLen = exactDurationSec || buffer.duration;

        if (startTimeCtx < ctx.currentTime) {
            actualStartTimeCtx = ctx.currentTime;
            const pastSeconds = ctx.currentTime - startTimeCtx;
            if (manualOffset !== undefined) { offsetCtx = (manualOffset + pastSeconds) % loopLen; } 
            else if (loop) { offsetCtx = pastSeconds % loopLen; } 
            else { offsetCtx = pastSeconds; }
            if (!loop && offsetCtx >= buffer.duration) return;
        }

        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = loop;
        if (loop && exactDurationSec && exactDurationSec <= buffer.duration) {
            source.loopStart = 0;
            source.loopEnd = exactDurationSec;
        }
        source.connect(gainNode);
        source.start(actualStartTimeCtx, offsetCtx);

        if (endReal) {
            const endTimeCtx = toCtxTime(endReal);
            if (endTimeCtx > ctx.currentTime) {
               source.stop(endTimeCtx);
            } else {
               source.stop(ctx.currentTime);
            }
        }
        sources.push(source);
    };

    if (nowReal < post1StartReal && decoded.pre1) {
        const distToPost1Ms = post1StartReal - nowReal;
        // The math ensures the start loop hits the beginning of the file strictly relative to post1StartReal 
        const offset = (12 - ((distToPost1Ms / 1000) % 12)) % 12;
        schedule(decoded.pre1, nowReal, post1StartReal, true, offset, 12);
    }

    if (nowReal < post2StartReal && decoded.post1) {
        schedule(decoded.post1, post1StartReal, post2StartReal, false);
    }

    if (nowReal < ambientStartReal && decoded.post2) {
        schedule(decoded.post2, post2StartReal, ambientStartReal, true);
    }

    if (decoded.ambient) {
        schedule(decoded.ambient, ambientStartReal, undefined, false);
    }

    engineRef.current = { ctx, gainNode, sources };
  };

  const handleStart = () => {
    setHasStarted(true);
    if (isActuallyTime) return; 
    
    if (audioRef.current) {
        audioRef.current.load();
    }
    
    startAmbientEngine();
  };

  const handleTrackSelect = (track: Track) => {
    if (activeTrack?.id === track.id) {
      setIsPlaying(!isPlaying);
    } else {
      setActiveTrack(track);
      setIsPlaying(true);
      setCurrentTime(0);
    }
  };

  const togglePlay = () => setIsPlaying(!isPlaying);

  const handleSeek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const onTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const onLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Play failed", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, activeTrack]);

  if (!isSynced) {
    return (
      <div className="bg-[#050505] min-h-[100dvh] flex items-center justify-center">
        <motion.div 
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-orange-500 font-mono text-xs uppercase tracking-[0.5em]"
        >
          Synchronizing Cosmic Time...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-[#050505] min-h-[100dvh] text-white selection:bg-orange-500 selection:text-white font-sans overflow-x-hidden">
      {(!isActuallyTime || isWithinGracePeriod) && (
        <GlobalVolumeControl volume={specialVolume} setVolume={setSpecialVolume} />
      )}
      
      <AnimatePresence mode="wait">
        {!hasStarted ? (
          <IntroScreen key="intro" onStart={handleStart} />
        ) : !shouldShowBirthdayContent ? (
          <Countdown 
            key="countdown" 
            targetDate={targetDate}
            currentTimeMs={currentTimeMs}
            onComplete={() => isActuallyTime && setIsRevealed(true)} 
          />
        ) : (
          <motion.div
            key="main-content"
            initial={{ opacity: 0, clipPath: 'inset(100% 0% 0% 0%)' }}
            animate={{ opacity: 1, clipPath: 'inset(0% 0% 0% 0%)' }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="relative min-h-[100dvh] w-full">
              <StarryBackground />
              
              <main className="relative z-10 transition-opacity duration-1000 ease-in-out">
        {/* Hero Section */}
        <section className="relative min-h-[100dvh] pt-20 pb-[calc(4rem+env(safe-area-inset-bottom))] flex flex-col items-center justify-center px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="max-w-4xl"
          >
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={{ 
                opacity: [0.3, 0.8, 0.3], 
                y: 0 
              }}
              transition={{ 
                y: { duration: 0.5, delay: 0.2 },
                opacity: { duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }
              }}
              className="text-orange-500 font-mono text-sm tracking-[0.4em] uppercase mb-6"
            >
              TaiTake Dev
            </motion.h2>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-5xl md:text-8xl font-black tracking-tighter mb-4 bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent italic"
            >
              HAPPY BIRTHDAY,<br/>NATA!
            </motion.h1>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 1 }}
              className="space-y-4 text-lg md:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed"
            >
              <p>
                З ДН! 🥳 25 років — це той чудовий вік, коли ти ще "I'm just a baby 🥺", але вже доводиться гуглити "чому хрустить коліно" і щиро радіти новій сковорідці.
              </p>
              <p>
                Нехай спина ніколи не болить, а кукуха тримається міцно на своєму місці! 🥂
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, filter: 'blur(10px)' }}
              animate={{ opacity: 1, filter: 'blur(0px)' }}
              transition={{ delay: 2, duration: 2 }}
              className="mt-8 flex flex-col items-center gap-2"
            >
              <span className="text-white/30 font-mono text-xs uppercase tracking-widest">Signed with love,</span>
              <a 
                href="https://t.me/muzdev" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-3xl font-serif italic text-white/90 underline decoration-orange-500/50 hover:decoration-orange-500 underline-offset-8 transition-colors cursor-pointer"
              >
                TaiTake
              </a>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 3.5, duration: 1 }}
                className="mt-6 md:mt-8 flex flex-col items-center"
              >
                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <ChevronDown className="w-8 h-8 text-white/40" />
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        </section>

        {/* Video Gift Section */}
        <section className="py-6 md:py-8 px-6 max-w-6xl mx-auto relative z-10">
          <motion.div
             initial={{ opacity: 0, y: 50 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true, margin: "-100px" }}
             className="relative"
          >
            <div className="flex items-center gap-4 mb-6 md:mb-8">
              <span className="text-lg md:text-2xl font-black italic uppercase tracking-tighter">Your 25th birth present</span>
              <div className="h-px flex-1 bg-white/20" />
            </div>

            <div className="relative">
              {/* YouTube Ambient Mode Simulation */}
              <div className="absolute -inset-8 md:-inset-16 -z-10 bg-[url('https://img.youtube.com/vi/yaJnJ3EKMxw/maxresdefault.jpg')] bg-cover bg-center blur-[80px] md:blur-[100px] opacity-40 saturate-[1.5] brightness-125 transform-gpu rounded-[40px] pointer-events-none" />

              <div 
                className="aspect-video w-full rounded-2xl md:rounded-3xl overflow-hidden bg-black/40 border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative group cursor-pointer"
                onClick={() => setIsVideoIframeLoaded(true)}
              >
              {!isVideoIframeLoaded ? (
                <>
                  <img 
                    src="https://img.youtube.com/vi/yaJnJ3EKMxw/maxresdefault.jpg" 
                    alt="Video thumbnail"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/20 transition-colors duration-500">
                    <div className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-orange-500/90 text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-[0_0_50px_rgba(249,115,22,0.4)] backdrop-blur-sm">
                      <Play className="w-8 h-8 md:w-12 md:h-12 ml-1 md:ml-2 text-white fill-white" />
                    </div>
                  </div>
                </>
              ) : (
                <iframe
                  id="gift-video"
                  className="w-full h-full"
                  src="https://www.youtube.com/embed/yaJnJ3EKMxw?autoplay=1&enablejsapi=1" 
                  title="Birthday Video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-view; web-share"
                  allowFullScreen
                />
              )}
              <div className="absolute inset-0 pointer-events-none border-[6px] md:border-[12px] border-black/20 rounded-2xl md:rounded-3xl" />
            </div>
            </div>
          </motion.div>
        </section>

        {/* Music List Section */}
        <section className="py-8 px-6 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="text-center space-y-2">
              <h3 className="text-3xl font-black italic uppercase tracking-tighter">Favorite Radio Station</h3>
              <p className="text-white/40 text-sm font-mono tracking-widest uppercase italic">For your special day</p>
            </div>

            <div className="space-y-2">
              {TRACKS.map((track) => (
                <motion.div
                  key={track.id}
                  whileHover={{ x: 10 }}
                  onClick={() => handleTrackSelect(track)}
                  className={`group flex items-center justify-between p-4 md:p-6 rounded-2xl cursor-pointer transition-all border ${
                    activeTrack?.id === track.id 
                    ? 'bg-orange-500 border-orange-500 text-black shadow-[0_0_30px_rgba(249,115,22,0.3)]' 
                    : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-4 md:gap-6">
                    <div className={`shrink-0 w-10 h-10 md:w-12 md:h-12 flex-none min-w-[2.5rem] md:min-w-[3rem] min-h-[2.5rem] md:min-h-[3rem] rounded-full flex items-center justify-center transition-colors ${
                      activeTrack?.id === track.id ? 'bg-black/20' : 'bg-white/10 group-hover:bg-orange-500'
                    }`}>
                      {activeTrack?.id === track.id && isPlaying ? (
                        <Pause className={activeTrack?.id === track.id ? 'text-black fill-black w-4 h-4 md:w-5 md:h-5' : 'text-white w-4 h-4 md:w-5 md:h-5'} />
                      ) : (
                        <Play className={`translate-x-[1px] md:translate-x-[2px] ${activeTrack?.id === track.id ? 'text-black fill-black w-4 h-4 md:w-5 md:h-5' : 'text-white group-hover:text-black group-hover:fill-black w-4 h-4 md:w-5 md:h-5'}`} />
                      )}
                    </div>
                    <div className="flex flex-col gap-1 md:gap-0.5">
                      <span className="font-bold text-base md:text-xl tracking-tight leading-[1.1]">{track.title}</span>
                      <span className={`text-xs md:text-sm ${activeTrack?.id === track.id ? 'text-black/60 font-medium' : 'text-white/40'}`}>
                        {track.artist}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`font-mono text-sm ${activeTrack?.id === track.id ? 'text-black/60' : 'text-white/20'}`}>
                      {track.duration}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Final Message & Footer */}
        <footer className="relative pb-32 md:pb-40 px-6 overflow-hidden">
          <div className="max-w-4xl mx-auto text-center space-y-12">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter italic leading-none">
                I THINK U LIKE IT!<br/>
                HAPPY BIRTHDAY, BESTIE!
              </h2>
              <div className="flex justify-center gap-4">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                <div className="w-1.5 h-1.5 rounded-full bg-orange-500/60" />
                <div className="w-1.5 h-1.5 rounded-full bg-orange-500/30" />
              </div>
            </motion.div>

            <div className="pt-12 border-t border-white/10 flex flex-col items-center gap-6">
              <p className="text-white/30 text-[10px] font-mono tracking-[0.3em] uppercase">
                &copy; {new Date().getFullYear()} <a href="https://t.me/muzdev" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors underline decoration-white/20 hover:decoration-white/60">TaiTake</a>
              </p>
            </div>
          </div>
        </footer>
      </main>
      </div>
      </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeTrack && (
          <MusicPlayer 
            currentTrack={activeTrack} 
            isPlaying={isPlaying} 
            togglePlay={togglePlay}
            volume={trackVolume}
            setVolume={setTrackVolume}
            currentTime={currentTime}
            duration={duration}
            onSeek={handleSeek}
          />
        )}
      </AnimatePresence>

      <audio 
        ref={audioRef}
        src={activeTrack?.url}
        onEnded={() => setIsPlaying(false)}
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onLoadedMetadata}
      />



      <style>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.1; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.5); box-shadow: 0 0 10px white; }
        }
        .animate-twinkle {
          animation-name: twinkle;
          animation-iteration-count: infinite;
          animation-timing-function: ease-in-out;
        }
        .stars-container {
          perspective: 1000px;
        }
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #050505;
        }
        ::-webkit-scrollbar-thumb {
          background: #222;
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #333;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 12px;
          height: 12px;
          background: white;
          border-radius: 50%;
          cursor: pointer;
          border: 2px solid #f97316;
        }
      `}</style>
    </div>
  );
}
