'use client';

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Utensils } from "lucide-react";
import type { LevelProps } from "../../types/game";
import { pageTransition, pageVariants } from "../../constants/animation";
import { useHaptic } from "../../hooks/useHaptic";
import { createSyntheticSound, playSound } from "../../lib/audio";
import { StarryBackground } from "../shared/StarryBackground";

export const FeedLevel = React.forwardRef<HTMLDivElement, LevelProps>(({ onNext }, ref) => {
  const [hunger, setHunger] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [navigationCalled, setNavigationCalled] = useState(false);
  const { trigger: haptic } = useHaptic();
  const decayIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleFeed = () => {
    if (isComplete || navigationCalled) return; 
    
    playSound("./eat.wav", 300, "square");
    
    setHunger(prev => {
      const newVal = prev + 5; 
      if (newVal >= 100 && !isComplete && !navigationCalled) {
        if (decayIntervalRef.current) {
          clearInterval(decayIntervalRef.current);
          decayIntervalRef.current = null;
        }
        
        setIsComplete(true);
        setNavigationCalled(true);
        haptic("success");
        
        setTimeout(() => createSyntheticSound(523, 150), 0);
        setTimeout(() => createSyntheticSound(659, 150), 150);
        setTimeout(() => createSyntheticSound(784, 300), 300);
        
        setTimeout(() => {
          console.log("FeedLevel: Navegando para tela final...");
          onNext();
        }, 1200);
        return 100;
      }
      return newVal;
    });
    haptic("light");
  };

  useEffect(() => {
    decayIntervalRef.current = setInterval(() => {
      if (!isComplete) {
        setHunger(h => Math.max(0, h - 1));
      }
    }, 150);
    
    return () => {
      if (decayIntervalRef.current) {
        clearInterval(decayIntervalRef.current);
      }
    };
  }, [isComplete]);

  return (
    <motion.div 
      ref={ref}
      className="absolute inset-0 w-full h-full bg-[#fde047] flex flex-col items-center justify-center p-6 text-yellow-900 relative"
      variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition}
    >
      <StarryBackground density={60} className="-z-10 opacity-20" />
      <div className="text-center mb-8">
        <h2 className="text-4xl font-black uppercase mb-2">Hora do Lanche!</h2>
        <p className="text-yellow-800 font-bold opacity-70">A Gaby está com fome! Clique rápido!</p>
      </div>

      <div className="relative w-72 h-12 bg-black/20 rounded-full overflow-hidden border-3 border-black/30 mb-12 shadow-inner">
        <motion.div 
          className="h-full relative overflow-hidden"
          style={{ width: `${hunger}%` }}
          animate={{ 
            backgroundColor: hunger > 80 ? "#22c55e" : hunger > 60 ? "#eab308" : hunger > 30 ? "#f97316" : "#ef4444"
          }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
        </motion.div>
        
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white font-bold text-sm drop-shadow-lg mix-blend-difference">
            {Math.round(hunger)}%
          </span>
        </div>
        
        <motion.div
          className="absolute right-2 top-1/2 -translate-y-1/2 text-2xl"
          animate={{ 
            rotate: hunger < 30 ? [-5, 5] : 0,
            scale: hunger < 30 ? [1, 1.1] : 1
          }}
          transition={{ duration: 0.5, repeat: hunger < 30 ? Infinity : 0, repeatType: "reverse" }}
        >
          {hunger > 80 ? "😋" : hunger > 50 ? "😊" : hunger > 20 ? "😐" : "😫"}
        </motion.div>
      </div>

      <motion.button
        whileTap={!isComplete ? { scale: 0.95 } : {}}
        whileHover={!isComplete ? { 
          scale: 1.05, 
          boxShadow: "0 15px 35px rgba(0,0,0,0.15)",
          y: -2 
        } : {}}
        onClick={handleFeed}
        disabled={isComplete}
        className={`w-52 h-52 bg-gradient-to-br from-white to-gray-100 rounded-full flex items-center justify-center shadow-[0_15px_0_rgba(0,0,0,0.1)] transition-all duration-200 border-4 border-yellow-600 relative overflow-hidden ${
          isComplete 
            ? "opacity-50 cursor-not-allowed" 
            : "hover:shadow-[0_20px_0_rgba(0,0,0,0.1)] active:shadow-[0_5px_0_rgba(0,0,0,0.1)] active:translate-y-2"
        }`}
      >
        {!isComplete && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
          />
        )}
        <Utensils size={80} className={`text-yellow-600 relative z-10 transition-transform duration-200 ${
          !isComplete ? "group-hover:scale-110" : ""
        }`} />
        
        {!isComplete && hunger < 100 && (
          <>
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                animate={{
                  x: [0, Math.random() * 40 - 20],
                  y: [0, Math.random() * 40 - 20],
                  opacity: [0, 1, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.7,
                  ease: "easeInOut"
                }}
                style={{
                  left: `${30 + i * 15}%`,
                  top: `${30 + i * 15}%`
                }}
              />
            ))}
          </>
        )}
      </motion.button>
      
      {isComplete && (
        <motion.div 
          initial={{ scale: 0, rotate: -180 }} 
          animate={{ scale: 1, rotate: 0 }} 
          transition={{ type: "spring", damping: 15, stiffness: 200 }}
          className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-10"
        >
          <motion.div 
            className="bg-gradient-to-br from-white to-gray-100 p-10 rounded-3xl text-center shadow-2xl border-4 border-yellow-500 relative overflow-hidden max-w-sm"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
          >
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-3 h-3 bg-yellow-400 rounded-full"
                  animate={{
                    y: [0, -30, 0],
                    x: [0, Math.random() * 60 - 30, 0],
                    rotate: [0, 360],
                    opacity: [1, 0]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: "easeInOut"
                  }}
                  style={{
                    left: `${10 + i * 10}%`,
                    top: "20%"
                  }}
                />
              ))}
            </div>
            
            <motion.div
              className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden shadow-lg border-4 border-yellow-400"
              whileHover={{ scale: 1.05 }}
            >
              <img src="./fome.png" className="w-full h-full object-cover" alt="Sticker" />
            </motion.div>
            
            <motion.h3 
              className="text-3xl font-bold text-yellow-600 mb-2 gradient-text"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Buchin Cheio!
            </motion.h3>
            
            <motion.p
              className="text-gray-600 font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Missão cumprida com sucesso! 🎉
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
});

FeedLevel.displayName = "FeedLevel";
