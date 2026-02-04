'use client';

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Heart, Star } from "lucide-react";
import type { LevelProps } from "../../types/game";
import { pageTransition, pageVariants } from "../../constants/animation";
import { useHaptic } from "../../hooks/useHaptic";
import { createSyntheticSound, playSound } from "../../lib/audio";
import { StarElement, StarryBackground } from "../shared/StarryBackground";

export const ConstellationLevel = React.forwardRef<HTMLDivElement, LevelProps>(({ onNext }, ref) => {
  const [points, setPoints] = useState([false, false, false, false, false]); 
  const { trigger: haptic } = useHaptic();

  const stars = useMemo(() => [...Array(100)].map(() => ({
    top: Math.random() * 100,
    left: Math.random() * 100,
    delay: Math.random() * 5,
    size: Math.random() * 2 + 1 
  })), []);

  const handleStarClick = (index: number) => {
    if (points[index]) return;
    if (index > 0 && !points[index - 1]) return;

    playSound("./sounds/star.wav", 800 + (index * 100), "triangle");

    const newPoints = [...points];
    newPoints[index] = true;
    setPoints(newPoints);
    haptic("light");
    
    const starElement = document.querySelector(`[data-star="${index}"]`) as HTMLElement;
    if (starElement) {
      const sparkle = document.createElement("div");
      sparkle.innerHTML = "✨";
      sparkle.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 1.5rem;
        pointer-events: none;
        z-index: 1000;
      `;
      starElement.style.position = "relative";
      starElement.appendChild(sparkle);
      
      sparkle.animate([
        { transform: "translate(-50%, -50%) scale(0) rotate(0deg)", opacity: 0 },
        { transform: "translate(-50%, -50%) scale(1.2) rotate(180deg)", opacity: 1 },
        { transform: "translate(-50%, -50%) scale(0) rotate(360deg)", opacity: 0 }
      ], { duration: 1000, easing: "ease-out" }).onfinish = () => sparkle.remove();
    }
    
    if (newPoints.every(p => p)) {
      setTimeout(() => createSyntheticSound(523, 200), 0);
      setTimeout(() => createSyntheticSound(659, 200), 100);
      setTimeout(() => createSyntheticSound(784, 200), 200);
      setTimeout(() => createSyntheticSound(1047, 400), 300);
      
      haptic("celebration");
      setTimeout(onNext, 1500);
    }
  };

  const starCoords = [
    { top: 30, left: 20 }, 
    { top: 60, left: 35 }, 
    { top: 40, left: 50 }, 
    { top: 65, left: 65 },
    { top: 30, left: 80 }
  ];

  return (
    <motion.div
      ref={ref}
      className="absolute inset-0 w-full h-full bg-slate-950 flex flex-col items-center justify-center p-6 text-white overflow-hidden"
      variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition}
    >
      <StarryBackground density={300} className="-z-10" />
      <div className="absolute inset-0">
        {stars.map((star, i) => (
          <StarElement key={i} top={star.top} left={star.left} delay={star.delay} size={star.size} />
        ))}
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-tr from-purple-900/20 via-transparent to-blue-900/20 pointer-events-none" />

      <div className="z-10 text-center mb-12 relative">
        <h2 className="text-4xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-pink-200 to-indigo-200 mb-2 drop-shadow-lg">Constelação</h2>
        <p className="text-gray-400 text-sm">Mesmo longe, olhamos para o mesmo céu.</p>
      </div>

      <div className="relative w-full h-72 mx-auto max-w-sm">
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none overflow-visible filter drop-shadow-[0_0_8px_rgba(236,72,153,0.8)]"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {starCoords.map((_, i) => {
            if (i < starCoords.length - 1 && points[i] && points[i+1]) {
               return (
                 <motion.line 
                   key={i}
                   initial={{ pathLength: 0 }} 
                   animate={{ pathLength: 1 }} 
                   transition={{ duration: 0.5 }} 
                   x1={starCoords[i].left} 
                   y1={starCoords[i].top} 
                   x2={starCoords[i+1].left} 
                   y2={starCoords[i+1].top} 
                   stroke="white" 
                   strokeWidth="2" 
                   strokeDasharray="4 4" 
                 />
               );
            }
            return null;
          })}
        </svg>

        {starCoords.map((pos, i) => (
          <motion.button
            key={i}
            data-star={i}
            className={`absolute w-12 h-12 -ml-6 -mt-6 rounded-full flex items-center justify-center transition-all duration-500 ${points[i] ? "bg-white shadow-[0_0_30px_white] scale-110" : "bg-white/10 hover:bg-white/20 border border-white/30"}`}
            style={{ top: `${pos.top}%`, left: `${pos.left}%` }}
            onClick={() => handleStarClick(i)}
            whileTap={{ scale: 0.9 }}
          >
            <Star size={20} className={points[i] ? "text-indigo-900 fill-indigo-900" : "text-white"} />
          </motion.button>
        ))}

        {points.every(p => p) && (
          <motion.div 
            initial={{ scale: 0, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            transition={{ duration: 0.8, type: "spring", stiffness: 300, damping: 20 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <Heart size={120} className="text-pink-500 fill-pink-500 drop-shadow-[0_0_50px_rgba(236,72,153,0.8)]" />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
});

ConstellationLevel.displayName = "ConstellationLevel";
