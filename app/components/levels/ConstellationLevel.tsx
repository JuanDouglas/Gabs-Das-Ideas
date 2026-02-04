'use client';

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Heart, Star } from "lucide-react";
import type { LevelProps } from "../../types/game";
import { pageTransition, pageVariants } from "../../constants/animation";
import { useHaptic } from "../../hooks/useHaptic";
import { createSyntheticSound, playSound } from "../../lib/audio";
import { StarElement, StarryBackground } from "../shared/StarryBackground";

export const ConstellationLevel = React.forwardRef<HTMLDivElement, LevelProps>(({ onNext }, ref) => {
  const [points, setPoints] = useState([false, false, false, false, false]); 
  const [sensorEnabled, setSensorEnabled] = useState(false);
  const [needsPermission, setNeedsPermission] = useState(false);
  const [tiltProgress, setTiltProgress] = useState(0);
  const [secretVisible, setSecretVisible] = useState(false);
  const [tilt, setTilt] = useState({ beta: 0, gamma: 0 });
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

  const secretCoords = [
    { top: 18, left: 18 },
    { top: 20, left: 52 },
    { top: 28, left: 72 },
    { top: 48, left: 62 },
    { top: 62, left: 32 },
    { top: 44, left: 22 }
  ];

  useEffect(() => {
    if (typeof window === "undefined") return;
    const needs = typeof (window.DeviceOrientationEvent as any)?.requestPermission === "function";
    setNeedsPermission(needs);
    if (!needs) setSensorEnabled(true);
  }, []);

  useEffect(() => {
    if (!sensorEnabled) return;
    const handleOrientation = (event: DeviceOrientationEvent) => {
      const beta = event.beta ?? 0;
      const gamma = event.gamma ?? 0;
      setTilt({ beta, gamma });

      const threshold = 35;
      const maxRange = 25;
      const intensity = Math.max(Math.abs(beta) - threshold, Math.abs(gamma) - threshold);
      const progress = Math.min(Math.max(intensity / maxRange, 0), 1);
      setTiltProgress(progress);
      setSecretVisible(progress > 0.6);
    };

    window.addEventListener("deviceorientation", handleOrientation, true);
    return () => window.removeEventListener("deviceorientation", handleOrientation, true);
  }, [sensorEnabled]);

  const handleEnableSensors = async () => {
    if (typeof window === "undefined") return;
    const permissionFn = (window.DeviceOrientationEvent as any)?.requestPermission;
    if (typeof permissionFn === "function") {
      try {
        const result = await permissionFn();
        if (result === "granted") {
          setSensorEnabled(true);
          haptic("light");
        }
      } catch {
        setSensorEnabled(false);
      }
      return;
    }
    setSensorEnabled(true);
  };

  return (
    <motion.div
      ref={ref}
      className="absolute inset-0 w-full h-full bg-slate-950 flex flex-col items-center justify-center p-6 text-white overflow-hidden"
      variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition}
    >
      <StarryBackground density={300} className="-z-10" />
      <div
        className="absolute inset-0"
        style={{
          transform: `translate3d(${tilt.gamma * 0.15}px, ${tilt.beta * 0.15}px, 0)`
        }}
      >
        {stars.map((star, i) => (
          <StarElement key={i} top={star.top} left={star.left} delay={star.delay} size={star.size} />
        ))}
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-tr from-purple-900/20 via-transparent to-blue-900/20 pointer-events-none" />

      <div className="z-10 text-center mb-12 relative">
        <h2 className="text-4xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-pink-200 to-indigo-200 mb-2 drop-shadow-lg">Constelação</h2>
        <p className="text-gray-400 text-sm">Mesmo longe, olhamos para o mesmo céu.</p>
        {needsPermission && !sensorEnabled && (
          <button
            onClick={handleEnableSensors}
            className="mt-4 px-4 py-2 text-[10px] uppercase tracking-widest rounded-full border border-white/20 bg-white/10 hover:bg-white/20 transition-all"
          >
            Ativar giroscópio
          </button>
        )}
        {sensorEnabled && (
          <p className="mt-3 text-[10px] uppercase tracking-widest text-white/50">
            Incline o celular para ver o segredo
          </p>
        )}
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

        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute inset-0"
            animate={{
              opacity: tiltProgress,
              scale: 0.98 + tiltProgress * 0.02,
              filter: `blur(${Math.max(0, 6 - tiltProgress * 6)}px)`
            }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <svg
              className="absolute inset-0 w-full h-full overflow-visible drop-shadow-[0_0_12px_rgba(147,197,253,0.8)]"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              {secretCoords.map((pos, i) => (
                <circle key={`s-${i}`} cx={pos.left} cy={pos.top} r="1.6" fill="white" opacity="0.9" />
              ))}
              {secretCoords.map((pos, i) => {
                const next = secretCoords[i + 1];
                if (!next) return null;
                return (
                  <line
                    key={`l-${i}`}
                    x1={pos.left}
                    y1={pos.top}
                    x2={next.left}
                    y2={next.top}
                    stroke="rgba(191,219,254,0.8)"
                    strokeWidth="1.2"
                    strokeDasharray="2 4"
                  />
                );
              })}
            </svg>
          </motion.div>

          <motion.div
            className="absolute bottom-4 right-2 text-right text-xs font-serif text-blue-100/90"
            initial={{ opacity: 0, y: 10 }}
            animate={{
              opacity: secretVisible ? 1 : 0,
              y: secretVisible ? 0 : 10
            }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            Existem coisas que só vemos
            <br />
            quando mudamos a perspectiva.
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
});

ConstellationLevel.displayName = "ConstellationLevel";
