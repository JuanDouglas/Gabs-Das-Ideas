'use client';

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { PartyPopper, Trophy } from "lucide-react";
import type { LevelProps } from "../../types/game";
import { pageTransition, pageVariants } from "../../constants/animation";
import { useHaptic } from "../../hooks/useHaptic";
import { isSoundEnabled } from "../../lib/audio";
import { StarryBackground } from "../shared/StarryBackground";

export const NewYearLevel = React.forwardRef<HTMLDivElement, LevelProps>(({ onNext }, ref) => {
  const [score, setScore] = useState(0);
  const maxScore = 8; 
  const { trigger: haptic } = useHaptic();

  const handleTap = (e: React.MouseEvent) => {
    if (score >= maxScore) return;
    haptic("heartbeat");
    setScore(s => s + 1);
    
    if (isSoundEnabled()) {
      const audio = new Audio("./dale.wav");
      audio.volume = 0.7;
      audio.play().catch(err => console.log("Audio play failed:", err));
    }
    
    const colors = ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff", "#ffffff", "#ffa500", "#ff69b4"];
    for (let i = 0; i < 25; i++) {
        const particle = document.createElement("div");
        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 150 + 100; 
        const tx = Math.cos(angle) * velocity;
        const ty = Math.sin(angle) * velocity;
        const color = colors[Math.floor(Math.random() * colors.length)];
        const size = Math.random() * 8 + 4;

        particle.style.position = "fixed";
        particle.style.left = `${e.clientX}px`;
        particle.style.top = `${e.clientY}px`;
        particle.style.width = size + "px";
        particle.style.height = size + "px";
        particle.style.backgroundColor = color;
        particle.style.borderRadius = Math.random() > 0.5 ? "50%" : "0";
        particle.style.pointerEvents = "none";
        particle.style.boxShadow = `0 0 ${Math.random() * 15 + 10}px ${color}`;
        particle.style.zIndex = "9999";
        
        particle.animate([
            { 
              transform: "translate(0, 0) scale(1) rotate(0deg)", 
              opacity: 1,
              filter: "brightness(2)" 
            },
            { 
              transform: `translate(${tx}px, ${ty}px) scale(0) rotate(${Math.random() * 720}deg)`, 
              opacity: 0,
              filter: "brightness(0.5)" 
            }
        ], {
            duration: 1200 + Math.random() * 800,
            easing: "cubic-bezier(0, .9, .57, 1)"
        }).onfinish = () => particle.remove();

        document.body.appendChild(particle);
    }
  };

  useEffect(() => {
    if (score >= maxScore) {
      setTimeout(() => {
        haptic("success");
        onNext();
      }, 1500);
    }
  }, [score, maxScore, onNext, haptic]);

  return (
    <motion.div 
      ref={ref}
      className={`absolute inset-0 w-full h-full bg-[#120a2e] flex flex-col items-center justify-center p-6 text-center select-none overflow-hidden ${
        score < maxScore ? "cursor-pointer" : ""
      }`}
      onClick={score < maxScore ? handleTap : undefined}
      variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition}
    >
      <StarryBackground density={90} className="-z-10" />
      <div className="absolute inset-0 opacity-30 pointer-events-none">
         <motion.div animate={{ opacity: 0.5 }} transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }} className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-purple-900 to-transparent" />
         <motion.div animate={{ opacity: 0.3 }} transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse", delay: 1 }} className="absolute top-20 left-20 w-64 h-64 bg-yellow-500/20 rounded-full blur-3xl" />
      </div>

      <div className="absolute top-10 flex gap-3 z-20">
        {[...Array(maxScore)].map((_, i) => (
          <motion.div 
            key={i} 
            initial={{ scale: 0, y: -20 }}
            animate={{ 
              scale: i < score ? 1.3 : 0.9, 
              opacity: i < score ? 1 : 0.4,
              y: 0,
              backgroundColor: i < score ? "#fbbf24" : "#4b5563",
              boxShadow: i < score ? "0 0 15px #fbbf24" : "none"
            }} 
            transition={{ delay: i * 0.1, type: "spring", damping: 10, stiffness: 200 }}
            className="w-4 h-4 rounded-full transition-all duration-300 border border-white/20" 
          >
            {i < score && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.5, 1] }}
                className="w-full h-full rounded-full bg-yellow-300"
              />
            )}
          </motion.div>
        ))}
      </div>

      <div className="z-10 pointer-events-none w-full max-w-sm relative">
        {score < maxScore ? (
          <motion.div animate={{ scale: 1.05 }} transition={{ repeat: Infinity, duration: 0.6, repeatType: "reverse" }}>
            <motion.h2 
              className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-600 mb-4 tracking-tighter drop-shadow-lg relative"
              animate={{ 
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              style={{
                backgroundSize: "200% 200%"
              }}
            >
              CELEBRE!
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                style={{ WebkitBackgroundClip: "text", backgroundClip: "text" }}
              />
            </motion.h2>
            <motion.p 
              className="text-purple-200 font-medium text-lg"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              Toque para estourar os fogos
            </motion.p>
            <PartyPopper className="mx-auto mt-8 text-yellow-400 w-12 h-12 animate-bounce" />
          </motion.div>
        ) : (
          <motion.div 
            initial={{ scale: 0, rotate: -180 }} 
            animate={{ scale: 1, rotate: 0 }} 
            transition={{ type: "spring", damping: 15, stiffness: 200 }}
            className="z-10 flex flex-col items-center space-y-6"
          >
            <motion.div 
              className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/40"
              animate={{ 
                boxShadow: [
                  "0 0 20px rgba(34, 197, 94, 0.4)",
                  "0 0 40px rgba(34, 197, 94, 0.8)",
                  "0 0 20px rgba(34, 197, 94, 0.4)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Trophy size={40} className="text-white" />
            </motion.div>
            
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-4xl font-bold text-white mb-2">Perfeito!</h2>
              <p className="text-yellow-300 font-medium text-lg">Celebração completa! 🎆</p>
            </motion.div>
            
            <motion.div
              className="flex items-center gap-2 text-white/60 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              <span>Preparando próxima aventura...</span>
            </motion.div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
});

NewYearLevel.displayName = "NewYearLevel";
