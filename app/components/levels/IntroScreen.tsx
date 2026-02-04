'use client';

import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, Gamepad2, Heart, Rocket } from "lucide-react";
import type { GameItem, IntroScreenProps } from "../../types/game";
import { pageTransition, pageVariants } from "../../constants/animation";
import { MEMORIES, POINTS_TO_WIN } from "../../constants/game";
import { useHaptic } from "../../hooks/useHaptic";
import { playSound } from "../../lib/audio";
import { createExplosionEffect } from "../../lib/effects";
import { GameItemElement, PlayerElement } from "../shared/GameItemElement";
import { StarryBackground } from "../shared/StarryBackground";

export const IntroScreen = React.forwardRef<HTMLDivElement, IntroScreenProps>(({ onStart }, ref) => {
  const INFO_SEEN_KEY = "intro_protocol_seen";
  const [gameWon, setGameWon] = useState(false);
  const [score, setScore] = useState(0);
  const [items, setItems] = useState<GameItem[]>([]);
  const [damageEffect, setDamageEffect] = useState(false);
  const [showInfoPopup, setShowInfoPopup] = useState(true); 
  
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rocketRef = useRef<HTMLDivElement | null>(null);
  const playerXRef = useRef(50);
  const scoreRef = useRef(0);
  const requestRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | undefined>(undefined);
  const spawnTimerRef = useRef(0);
  
  const { trigger: haptic } = useHaptic();

  const setCombinedRef = (node: HTMLDivElement | null) => {
    containerRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) ref.current = node;
  };

  useEffect(() => {
    const preloadImage = (src: string) => { const img = new Image(); img.src = src; };
    Object.values(MEMORIES).forEach(v => {
      if (!Array.isArray(v) && (v as any).url) preloadImage((v as any).url);
      if (Array.isArray(v)) v.forEach(m => m && preloadImage(m.url));
    });
    
    playerXRef.current = 50;
    if (rocketRef.current) {
      rocketRef.current.style.left = "50%";
    }
  }, []);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hasSeen = window.localStorage.getItem(INFO_SEEN_KEY) === "1";
    setShowInfoPopup(!hasSeen);
  }, []);

  const animate = useCallback((time: number) => {
    if (lastTimeRef.current !== undefined) {
      const deltaTime = time - lastTimeRef.current;
      const progress = Math.min(scoreRef.current / POINTS_TO_WIN, 1);
      const spawnInterval = 500 - (progress * 150);
      const fallSpeed = 0.06 + (progress * 0.02);
      const bombChance = 0.2 + (progress * 0.08);
      spawnTimerRef.current += deltaTime;
      if (spawnTimerRef.current > spawnInterval) {
        const isBomb = Math.random() < bombChance;
        setItems(prev => [...prev, { 
          id: Math.random(), 
          x: Math.random() * 90 + 5, 
          y: -10,
          type: isBomb ? "bomb" : "heart"
        }]);
        spawnTimerRef.current = 0;
      }

      setItems(prev => {
        const limitedPrev = prev.length > 6 ? prev.slice(-6) : prev;
        const nextItems: GameItem[] = [];
        let scoreDelta = 0;
        let hitBomb = false;

        for (const item of limitedPrev) {
          const newY = item.y + (fallSpeed * deltaTime);
          const playerHitboxSize = 6;
          const verticalHitbox = newY > 75 && newY < 90;
          const horizontalHitbox = Math.abs(item.x - playerXRef.current) < playerHitboxSize;
          
          if (verticalHitbox && horizontalHitbox) {
            if (item.type === "bomb") {
              scoreDelta -= 5;
              hitBomb = true;
              
              playSound("./sounds/explosion.wav", 200, "sawtooth");
              createExplosionEffect(item.x, newY);
            } else {
              scoreDelta += 1;
              playSound("./sounds/heart.wav", 800, "sine");
              
              const heartEffect = document.createElement("div");
              heartEffect.innerHTML = "💖";
              heartEffect.style.cssText = `
                position: fixed;
                left: ${item.x}vw;
                top: ${newY}vh;
                font-size: 2rem;
                pointer-events: none;
                z-index: 9999;
                transform: translate(-50%, -50%);
              `;
              heartEffect.animate([
                { transform: "translate(-50%, -50%) scale(1)", opacity: 1 },
                { transform: "translate(-50%, -150%) scale(1.5)", opacity: 0 }
              ], { duration: 800, easing: "ease-out" }).onfinish = () => heartEffect.remove();
              document.body.appendChild(heartEffect);
            }
          } else if (newY <= 100) {
            nextItems.push({ ...item, y: newY });
          }
        }

        if (hitBomb) {
          haptic("explosion");
          setDamageEffect(true);
          setTimeout(() => setDamageEffect(false), 300);
        } else if (scoreDelta > 0) {
          haptic("heartbeat");
        }

        if (scoreDelta !== 0) {
          setScore(s => {
            const newScore = Math.max(0, s + scoreDelta);
            if (newScore >= POINTS_TO_WIN && s < POINTS_TO_WIN) {
                setTimeout(() => {
                    setGameWon(true); 
                    haptic("celebration");
                }, 100);
                return POINTS_TO_WIN;
            }
            return newScore;
          });
        }
        return nextItems;
      });
    }
    lastTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  }, [haptic]);

  useEffect(() => {
    if (!gameWon && !showInfoPopup) {
      lastTimeRef.current = performance.now(); 
      requestRef.current = requestAnimationFrame(animate);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gameWon, animate, showInfoPopup]);

  const handleMove = (clientX: number) => {
    if (!containerRef.current || gameWon || showInfoPopup) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    const clampedX = Math.min(95, Math.max(5, x));
    playerXRef.current = clampedX;
    if (rocketRef.current) {
        rocketRef.current.style.left = `${clampedX}%`;
    }
  };

  const resetIntroGame = (showPopup: boolean) => {
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
      requestRef.current = null;
    }
    lastTimeRef.current = undefined;
    spawnTimerRef.current = 0;
    playerXRef.current = 50;
    if (rocketRef.current) {
      rocketRef.current.style.left = "50%";
    }
    setItems([]);
    setScore(0);
    setDamageEffect(false);
    setGameWon(false);
    setShowInfoPopup(showPopup);
  };

  return (
    <motion.div 
      ref={setCombinedRef}
      className={`absolute inset-0 w-full h-full flex flex-col items-center justify-center p-6 text-white overflow-hidden z-50 touch-none ${damageEffect ? "bg-red-900/50" : ""}`}
      style={{ touchAction: "none" }}
      variants={pageVariants} initial="initial" animate="animate" exit="exit"
      transition={pageTransition}
      onMouseMove={(e) => handleMove(e.clientX)}
      onTouchMove={(e) => handleMove(e.touches[0].clientX)}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] -z-10" />
      <StarryBackground density={150} className="-z-10" />
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }} className="absolute top-[-20%] right-[-20%] w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

      {!gameWon ? (
        <>
          <div className="absolute top-10 text-center pointer-events-none z-20 w-full px-4">
            <h2 className="text-pink-400 font-bold tracking-widest text-xs uppercase animate-pulse mb-2">
              Evite as Bombas!
            </h2>
            <div className="flex justify-center items-center gap-4">
               <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md shadow-lg text-white/80">
                  <Heart size={20} className="fill-pink-500 text-pink-500" />
                  <span className="font-mono font-bold text-xl">
                    {score}/{POINTS_TO_WIN}
                    {score >= POINTS_TO_WIN && <span className="ml-2 text-green-400">✓</span>}
                  </span>
               </div>
            </div>
          </div>

          {items.map(item => (
            <GameItemElement key={item.id} item={item} />
          ))}
          
          <PlayerElement ref={rocketRef} />
          
          <div className="absolute bottom-10 w-full text-center space-y-2 pointer-events-none">
             <div className="text-white/30 text-xs uppercase tracking-widest">Arraste para pilotar</div>
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 0.8 }}
               transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
               className="text-[10px] text-green-300/80 font-mono tracking-wider flex items-center justify-center gap-2 mt-4"
             >
               <Eye size={12} />
               <span>Nada é por acaso... observe os detalhes.</span>
             </motion.div>
          </div>

          <AnimatePresence>
            {showInfoPopup && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm"
                style={{ touchAction: "none" }}
              >
                <motion.div 
                  initial={{ scale: 0.8, y: 50 }} 
                  animate={{ scale: 1, y: 0 }} 
                  className="bg-white/10 border border-white/20 p-8 rounded-3xl max-w-sm w-full text-center shadow-[0_30px_80px_rgba(0,0,0,0.45)] relative backdrop-blur-xl ring-1 ring-white/10"
                >
                  <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-white/10 via-transparent to-white/5 pointer-events-none" />
                  <div className="w-16 h-16 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Gamepad2 size={32} className="text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Protocolo Gabrielly</h2>
                  <p className="text-gray-300 text-sm mb-6 leading-relaxed">
                    Bem-vinda, amor! <br/>
                    Esta é uma jornada interativa pelas nossas memórias. Colete corações, desvie dos obstáculos e preste atenção aos <strong>segredos escondidos</strong>.
                  </p>
                  <motion.button 
                    onClick={() => {
                      haptic("medium");
                      if (typeof window !== "undefined") {
                        window.localStorage.setItem(INFO_SEEN_KEY, "1");
                      }
                      setShowInfoPopup(false);
                    }} 
                    whileHover={{ scale: 1.02, boxShadow: "0 10px 25px rgba(0,0,0,0.15)" }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-xl shadow-lg active:shadow-md transition-all duration-200 relative overflow-hidden group"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: "0%" }}
                      transition={{ duration: 0.3 }}
                    />
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      <Rocket size={20} className="group-hover:rotate-12 transition-transform" />
                      Iniciar Missão
                    </span>
                  </motion.button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      ) : (
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="z-10 flex flex-col items-center space-y-8 text-center">
          <motion.div className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center shadow-[0_0_40px_rgba(236,72,153,0.5)] border border-white/20">
            <Gamepad2 size={48} className="text-pink-400 fill-pink-400/20" />
          </motion.div>
          <div className="space-y-2">
            <h2 className="text-green-400 font-bold tracking-widest text-xs uppercase">Level Unlocked</h2>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">Gabrielly's <br/> Adventure</h1>
          </div>
          <motion.button 
            whileHover={{ 
              scale: 1.05, 
              boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
              y: -2
            }} 
            whileTap={{ scale: 0.98 }} 
            onClick={() => { 
              playSound("./sounds/start.wav", 440, "square"); 
              haptic("medium");
              onStart(); 
            }}
            className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-full font-bold text-sm transition-all border border-white/20 backdrop-blur-md flex items-center gap-2 group hover:scale-105"
          >
            <Gamepad2 size={18} className="group-hover:rotate-12 transition-transform" />Continuar
          </motion.button>
          <button
            onClick={() => resetIntroGame(false)}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white rounded-full text-xs font-semibold tracking-wide transition-all border border-white/10 backdrop-blur-md"
            aria-label="Jogar novamente o primeiro jogo"
          >
            Jogar novamente.
          </button>
        </motion.div>
      )}
    </motion.div>
  );
});

IntroScreen.displayName = "IntroScreen";
