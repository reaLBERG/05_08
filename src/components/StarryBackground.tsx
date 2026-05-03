import React, { memo, useMemo } from 'react';

export const StarryBackground = memo(() => {
  const stars = useMemo(() => {
    return [...Array(50)].map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: `${Math.random() * 3}px`,
      delay: `${Math.random() * 5}s`,
      duration: `${2 + Math.random() * 3}s`
    }));
  }, []);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Fallback gradients if video fails or while loading */}
      <div className="absolute inset-0 bg-[#050505]">
        <div className="absolute inset-0 bg-radial-[circle_at_50%_50%] from-[#1a1a2e]/40 to-transparent" />
      </div>
      
      {/* The Star Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-screen"
        src="https://cdn.pixabay.com/video/2019/10/22/28169-368731383_large.mp4"
      />
      
      {/* Star Particles (CSS Overlay for extra "glowing" stars) */}
      <div className="stars-container absolute inset-0">
        {stars.map((star) => (
          <div
            key={star.id}
            className="star absolute bg-white rounded-full opacity-0 animate-twinkle"
            style={{
              top: star.top,
              left: star.left,
              width: star.size,
              height: star.size,
              animationDelay: star.delay,
              '--twinkle-duration': star.duration
            } as React.CSSProperties}
          />
        ))}
      </div>
      
      {/* Overlay darkening for text readability */}
      <div className="absolute inset-0 bg-black/30" />
    </div>
  );
});

StarryBackground.displayName = 'StarryBackground';
