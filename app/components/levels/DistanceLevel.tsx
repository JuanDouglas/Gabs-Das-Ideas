'use client';

import React, { useRef, useState } from "react";
import { motion, useAnimation, useMotionValue, useTransform } from "framer-motion";
import { Bus, MapPin, Sparkles } from "lucide-react";
import type { LevelProps } from "../../types/game";
import { pageTransition, pageVariants } from "../../constants/animation";
import { useHaptic } from "../../hooks/useHaptic";
import { StarryBackground } from "../shared/StarryBackground";

export const DistanceLevel = React.forwardRef<HTMLDivElement, LevelProps>(({ onNext }, ref) => {
  const [completed, setCompleted] = useState(false);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const x = useMotionValue(0);
  const busControls = useAnimation(); 
  const width = useTransform(x, value => `${value}px`);
  const { trigger: haptic } = useHaptic();
  
  const handleDragEnd = () => {
    if (!trackRef.current) return;
    const threshold = (trackRef.current.offsetWidth - 64) * 0.9; 
    if (x.get() > threshold) {
      setCompleted(true);
      haptic("success");
      
      busControls.start({
        x: window.innerWidth + 100, 
        transition: { duration: 2, ease: "easeInOut" }
      }).then(() => {
        setTimeout(onNext, 200);
      });
    } else {
      haptic("light");
    }
  };

  return (
    <motion.div 
      ref={ref}
      className="absolute inset-0 w-full h-full bg-[#1e1e24] flex flex-col items-center justify-center p-8 text-white relative"
      variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition}
    >
      <StarryBackground density={70} className="-z-10" />
      <div className="w-full max-w-md text-center space-y-12">
        <div className="space-y-4">
          <div className="inline-block p-4 bg-red-500/20 rounded-full mb-2 shadow-[0_0_30px_rgba(239,68,68,0.3)]">
            <MapPin className="text-red-500" size={40} />
          </div>
          <h2 className="text-3xl font-bold">Boss Fight: Distância</h2>
          <p className="text-gray-400 text-sm max-w-xs mx-auto">A distância tenta atrapalhar, mas nosso amor viaja rápido.</p>
          
          <div className="flex items-center justify-center gap-3 text-xs font-mono text-pink-400/80 bg-black/40 px-4 py-2 rounded-full border border-pink-500/20 w-fit mx-auto">
            <span className="tracking-wider">BSB ↔ GYN</span>
          </div>
        </div>
        
        <div ref={trackRef} className="relative h-24 bg-gray-800 rounded-2xl border-b-4 border-gray-950 p-2 flex items-center overflow-hidden shadow-2xl">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
             <div className="w-full h-0 border-t-2 border-dashed border-yellow-500"></div>
          </div>
          
          <motion.div className="absolute left-2 top-2 bottom-2 bg-green-500/20 rounded-xl border border-green-500/30" style={{ width: completed ? "100%" : width }} />
          
          {!completed && (
            <div className="absolute w-full text-center pointer-events-none text-white/50 text-xs font-bold uppercase tracking-widest animate-pulse z-0">
              Arraste para Viajar
            </div>
          )}
          
          {!completed && (
            <motion.div 
              style={{ x }} 
              drag="x" 
              dragConstraints={trackRef} 
              dragElastic={0.05} 
              dragMomentum={false} 
              onDragEnd={handleDragEnd}
              onDrag={(_, info) => {
                if (Math.abs(info.velocity.x) > 100) {
                  haptic("light");
                }
              }}
              whileDrag={{ scale: 1.05, rotate: 2 }} 
              className="relative z-10 w-20 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg shadow-lg flex items-center justify-center cursor-grab active:cursor-grabbing border-b-4 border-yellow-700 group"
            >
              <motion.div
                className="absolute -left-2 top-1/2 w-6 h-1 bg-white/30 rounded-full"
                animate={{ scaleX: [0, 1, 0] }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
              />
              
              <Bus className="text-yellow-900 relative z-10" size={36} />
              
              <motion.div 
                className="absolute -bottom-2 left-3 w-4 h-4 bg-gray-900 rounded-full border-2 border-gray-600"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <motion.div 
                className="absolute -bottom-2 right-3 w-4 h-4 bg-gray-900 rounded-full border-2 border-gray-600"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              
              <motion.div
                className="absolute -right-6 top-1/2 w-2 h-2 bg-gray-400 rounded-full opacity-60"
                animate={{ 
                  x: [0, -20, -40],
                  opacity: [0.6, 0.3, 0],
                  scale: [1, 1.5, 0.5]
                }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
              />
            </motion.div>
          )}

          <motion.div 
            initial={{ x: 0, opacity: 0 }}
            animate={completed ? { opacity: 1 } : { opacity: 0 }}
            style={{ x: completed ? 0 : -100 }} 
          >
             <motion.div 
                animate={busControls}
                className="absolute top-2 left-2 z-20 w-20 h-16 bg-green-500 rounded-lg shadow-[0_0_20px_#22c55e] flex items-center justify-center border-b-4 border-green-700"
             >
                <Bus className="text-white" size={36} />
                <div className="absolute -bottom-2 left-3 w-4 h-4 bg-gray-900 rounded-full border-2 border-gray-600 animate-spin"></div>
                <div className="absolute -bottom-2 right-3 w-4 h-4 bg-gray-900 rounded-full border-2 border-gray-600 animate-spin"></div>
                <div className="absolute top-1/2 -right-10 w-8 h-8 bg-white/20 rounded-full blur-xl animate-pulse"></div>
             </motion.div>
          </motion.div>
        </div>
        
        {completed && <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex items-center justify-center gap-2 text-green-400 font-bold"><Sparkles size={18} /><span>Boa Viagem!</span></motion.div>}
      </div>
    </motion.div>
  );
});

DistanceLevel.displayName = "DistanceLevel";
