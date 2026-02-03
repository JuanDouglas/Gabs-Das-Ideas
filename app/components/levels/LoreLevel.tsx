'use client';

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Fingerprint, Lock, Unlock } from "lucide-react";
import type { LoreProps } from "../../types/game";
import { LORE_DATA } from "../../constants/game";
import { useHaptic } from "../../hooks/useHaptic";
import { playSound } from "../../lib/audio";
import { NoiseOverlay } from "../shared/NoiseOverlay";
import { ScrambleTitle } from "../shared/ScrambleTitle";

export const LoreLevel = React.forwardRef<HTMLDivElement, LoreProps>(({ onNext, loreKey }, ref) => {
  const [phase, setPhase] = useState("decrypting"); 
  const { trigger: haptic } = useHaptic();
  
  const loreData = LORE_DATA[loreKey] || LORE_DATA["intro"];

  if (!loreData) {
    return <div className="flex h-screen items-center justify-center text-stone-500 font-mono text-xs">ERR: DATA_CORRUPTED</div>;
  }

  useEffect(() => {
    const img = new Image();
    img.src = loreData.image;
    img.onload = () => {
        setTimeout(() => setPhase("visualizing"), 1000);
    };
    img.onerror = () => {
       console.error("Failed to load lore image");
       setTimeout(() => setPhase("visualizing"), 800);
    };
  }, [loreData.image]);

  useEffect(() => {
    if (phase === "visualizing") {
      const timer = setTimeout(() => setPhase("reading"), 800);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  const handleNext = () => {
    haptic("heavy");
    playSound("./click.wav", 600, "sine");
    onNext?.();
  };

  const containerVariants = {
    decrypting: { backgroundColor: "#0f0c29" },
    visualizing: { backgroundColor: "#0f0c29" },
    reading: { backgroundColor: "#0f0c29" },
    complete: { backgroundColor: "#0f0c29" }
  };

  return (
    <motion.div 
      ref={ref}
      className="relative w-full h-full min-h-screen flex flex-col items-center justify-center overflow-hidden font-sans text-white"
      initial="decrypting"
      animate={phase}
      variants={containerVariants}
      transition={{ duration: 1 }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e]" />
      <NoiseOverlay />
      
      <div className="absolute inset-0 pointer-events-none z-0">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-pink-300/80 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.2, 1, 0.2],
              scale: [0.5, 1.2, 0.5],
            }}
            transition={{
              duration: 2 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut"
            }}
          />
        ))}
        
        {[...Array(25)].map((_, i) => (
          <motion.div
            key={`small-${i}`}
            className="absolute w-0.5 h-0.5 bg-indigo-200/40 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0, 0.8, 0],
            }}
            transition={{
              duration: 1.5 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      <AnimatePresence>
        {phase === "decrypting" && (
          <motion.div 
            className="absolute z-50 flex flex-col items-center gap-4"
            exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
            transition={{ duration: 0.8, ease: "circIn" }}
          >
            <div className="relative w-16 h-16">
              <motion.span 
                className="absolute inset-0 border-t-2 border-r-2 border-pink-400/70 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <motion.span 
                className="absolute inset-2 border-b-2 border-l-2 border-indigo-400/70 rounded-full"
                animate={{ rotate: -360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Lock size={16} className="text-pink-300 animate-pulse" />
              </div>
            </div>
            <p className="text-xs font-mono text-pink-300 uppercase tracking-[0.2em]">Desbloqueando memória {loreData.chapter}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        className="absolute inset-0 z-0"
        initial={{ opacity: 0, scale: 1.2, filter: "grayscale(100%) blur(20px)" }}
        animate={phase !== "decrypting" ? { 
          opacity: 0.4, 
          scale: 1, 
          filter: "grayscale(0%) blur(0px)"
        } : {}}
        transition={{ duration: 1.5, ease: "easeOut" }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0c29]/90 via-[#302b63]/60 to-[#24243e]/40 z-10" />
        <img src={loreData.image} alt="" className="w-full h-full object-cover" />
      </motion.div>

      {phase !== "decrypting" && (
        <div className="relative z-20 w-full max-w-2xl px-8 flex flex-col items-start gap-6">
            <motion.div 
              className="flex items-center gap-3 w-full border-b border-white/10 pb-4"
              initial={{ width: "0%", opacity: 0 }}
              animate={{ width: "100%", opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
                <div className="bg-white/10 text-pink-200 p-2 rounded-lg border border-white/10">
                    <Fingerprint size={18} />
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-widest text-white/60">Registro {loreData.date}</span>
                    <span className="text-xs font-mono text-white/80">NÍVEL DE ACESSO: IV</span>
                </div>
                <div className="ml-auto">
                   <Unlock size={14} className="text-emerald-300/80" />
                </div>
            </motion.div>

            <motion.h1 
              className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-300 font-serif leading-none"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
               <ScrambleTitle text={loreData.title} trigger={phase === "visualizing"} />
            </motion.h1>

            <motion.div 
                className="relative py-6"
                initial="hidden"
                animate={phase === "reading" || phase === "complete" ? "visible" : "hidden"}
                onAnimationComplete={() => {
                    if (phase === "reading") {
                      setTimeout(() => {
                        setPhase("complete");
                        haptic("success");
                      }, 500);
                    }
                }}
            >
                <div className="absolute left-0 top-6 bottom-6 w-[1px] bg-gradient-to-b from-transparent via-pink-300/60 to-transparent" />
                
                <p className="pl-6 text-lg md:text-xl leading-relaxed text-white/80 font-light">
                  {loreData.text.split(" ").map((word, i) => (
                    <motion.span
                      key={i}
                      className="inline-block mr-1.5"
                      variants={{
                        hidden: { filter: "blur(10px)", opacity: 0, y: 5 },
                        visible: { filter: "blur(0px)", opacity: 1, y: 0 }
                      }}
                      transition={{ duration: 0.5, delay: i * 0.03 }}
                    >
                      {word}
                    </motion.span>
                  ))}
                </p>
            </motion.div>

            <motion.div 
                className="w-full mt-8 flex justify-end"
                initial={{ opacity: 0 }}
                animate={phase === "complete" ? { opacity: 1 } : {}}
            >
                <button 
                    onClick={handleNext}
                    className="group relative flex items-center gap-4 px-8 py-3 bg-white/10 hover:bg-white/20 rounded-full transition-all duration-300 overflow-hidden backdrop-blur-md border border-white/10 shadow-lg"
                >
                    <span className="relative z-10 text-sm font-medium tracking-widest uppercase text-white transition-colors">
                        Próximo
                    </span>
                    <div className="relative z-10 bg-white/20 p-1 rounded-full group-hover:bg-white/30 transition-colors duration-300">
                        <ArrowRight size={16} className="text-white" />
                    </div>
                    
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent rounded-full"
                      animate={{ x: ["-100%", "100%"] }}
                      transition={{ 
                        duration: 3, 
                        repeat: Infinity, 
                        repeatDelay: 2,
                        ease: "easeInOut" 
                      }}
                    />
                </button>
            </motion.div>
        </div>
      )}
      
      {phase !== "decrypting" && (
        <div className="absolute inset-0 pointer-events-none p-8">
            <motion.div 
                initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 1.5, duration: 1 }}
                className="absolute top-8 left-8 w-24 h-[1px] bg-white/20" 
            />
            <motion.div 
                initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ delay: 1.5, duration: 1 }}
                className="absolute top-8 left-8 h-24 w-[1px] bg-white/20" 
            />
            
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}
                className="absolute top-8 right-8 flex flex-col items-end gap-2" 
            >
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-pink-300">MEMÓRIA</span>
                    <div className="w-8 h-1 bg-white/20 rounded-full overflow-hidden">
                        <motion.div 
                            className="h-full bg-green-500" 
                            initial={{ width: "0%" }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                        />
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-pink-300">ACESSO</span>
                    <div className="w-8 h-1 bg-white/20 rounded-full overflow-hidden">
                        <motion.div 
                            className="h-full bg-green-500" 
                            initial={{ width: "0%" }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                        />
                    </div>
                </div>
            </motion.div>
            
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5 }}
                className="absolute bottom-8 left-8 flex flex-col gap-1" 
            >
                <span className="text-[8px] font-mono text-white/60">ARQUIVO: {loreData.chapter}</span>
                <span className="text-[8px] font-mono text-white/60">STATUS: DECODIFICADO</span>
                <span className="text-[8px] font-mono text-white/60">INTEGRIDADE: 100%</span>
            </motion.div>
        </div>
      )}

    </motion.div>
  );
});

LoreLevel.displayName = "LoreLevel";
