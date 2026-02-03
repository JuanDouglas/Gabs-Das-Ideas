'use client';

import React, { useEffect, useState } from "react";

interface StarElementProps {
  top: number;
  left: number;
  delay: number;
  size?: number;
}

export const StarElement = React.memo<StarElementProps>(({ top, left, delay, size = 12 }) => (
  <div 
    className="absolute bg-white rounded-full animate-pulse" 
    style={{ 
      top: `${top}%`, 
      left: `${left}%`, 
      width: `${size}px`,
      height: `${size}px`,
      animationDelay: `${delay}s`,
      opacity: 0.3 + (0.7 * ((top * left) % 100) / 100)
    }} 
  />
));
StarElement.displayName = "StarElement";

interface StarryBackgroundProps {
  density?: number;
  className?: string;
}

export const StarryBackground = React.memo<StarryBackgroundProps>(({ density = 120, className = "" }) => {
  const [stars, setStars] = useState<Array<{id: number; top: number; left: number; delay: number; size: number}>>([]);
  
  useEffect(() => {
    setStars([...Array(density)].map((_, i) => ({
      id: i,
      top: Math.random() * 100,
      left: Math.random() * 100,
      delay: Math.random() * 5,
      size: Math.random() * 2 + 1
    })));
  }, [density]);

  return (
    <div className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}>
      {stars.map((star) => (
        <StarElement 
          key={star.id} 
          top={star.top} 
          left={star.left} 
          delay={star.delay} 
          size={star.size} 
        />
      ))}
    </div>
  );
});
StarryBackground.displayName = "StarryBackground";
