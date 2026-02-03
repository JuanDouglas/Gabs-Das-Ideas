'use client';

import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Clock, Gamepad2, Gift, Heart, MapPin, Star, Terminal, X } from "lucide-react";
import type { FinalLevelProps } from "../../types/game";
import { MEMORIES } from "../../constants/game";
import { pageTransition, pageVariants } from "../../constants/animation";
import { useDaysTogether } from "../../hooks/useDaysTogether";
import { useHaptic } from "../../hooks/useHaptic";
import { createSyntheticSound, isSoundEnabled } from "../../lib/audio";
import { ConfettiExplosion } from "../shared/ConfettiExplosion";
import { StarryBackground } from "../shared/StarryBackground";
import { TypewriterText } from "../shared/TypewriterText";

export const FinalLevel = React.forwardRef<HTMLDivElement, FinalLevelProps>(({ onRestart }, ref) => {
  const daysTogether = useDaysTogether(MEMORIES.campus.date);
  const [easterEggClicks, setEasterEggClicks] = useState(0);
  const [showQrCode, setShowQrCode] = useState(false);
  const [glitchMode, setGlitchMode] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false);
  const [terminalInput, setTerminalInput] = useState("");
  const [terminalError, setTerminalError] = useState(false);
  const [activeConfetti, setActiveConfetti] = useState<{ x: number; y: number } | null>(null); 
  const [activeCardConfetti, setActiveCardConfetti] = useState<{ id: number; instanceId: number } | null>(null);
  const cardConfettiTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { trigger: haptic } = useHaptic();

  useEffect(() => {
    if (showTerminal || showQrCode) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [showTerminal, showQrCode]);

  const handleEasterEggClick = () => {
    if (glitchMode) {
      setShowTerminal(true);
      haptic("medium");
      return;
    }

    const newCount = easterEggClicks + 1;
    setEasterEggClicks(newCount);
    
    haptic("light");
    
    if (newCount === 5) {
      haptic([50, 100, 50, 100]);
      setGlitchMode(true);
    }
  };

  const handleCardClick = (cardId: number) => (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    
    const instanceId = Date.now() + Math.random();
    setActiveCardConfetti({ id: cardId, instanceId });
    haptic([20, 50, 20]);
    
    if (cardConfettiTimeoutRef.current) {
      clearTimeout(cardConfettiTimeoutRef.current);
    }
    cardConfettiTimeoutRef.current = setTimeout(() => {
      setActiveCardConfetti(prev => (prev?.id === cardId && prev.instanceId === instanceId ? null : prev));
    }, 4000);
  };

  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanInput = terminalInput.toLowerCase().trim();
    
    if (cleanInput === "surpresa") {
      setShowTerminal(false);
      setShowQrCode(true);
      setTerminalInput("");
    } 
    else if (cleanInput.startsWith("level ")) {
      const levelNumber = cleanInput.replace("level ", "").trim();
      const levels = ["intro", "campus", "newyear", "distance", "constellation", "final"];
      const levelIndex = parseInt(levelNumber) - 1;
      
      if (levelIndex >= 0 && levelIndex < levels.length) {
        setShowTerminal(false);
        setTerminalInput("");
        haptic([30, 30, 30]);
        console.log(`Saltando para nível: ${levels[levelIndex]}`);
      } else {
        setTerminalError(true);
        haptic([50, 50]);
        
        const errorAudio = new Audio("./melhore.wav");
        errorAudio.volume = 0.6;
        errorAudio.play().catch(() => {
          if (isSoundEnabled()) {
            createSyntheticSound(150, 300, "sawtooth");
          }
        });
        
        setTimeout(() => setTerminalError(false), 500);
      }
    }
    else if (cleanInput === "help" || cleanInput === "ajuda") {
      setTerminalInput("Comandos: surpresa, level [1-6], help");
      setTimeout(() => setTerminalInput(""), 2000);
    }
    else {
      setTerminalError(true);
      haptic([50, 50]);
      
      const errorAudio = new Audio("./melhore.wav");
      errorAudio.volume = 0.6;
      errorAudio.play().catch(() => {
        if (isSoundEnabled()) {
          createSyntheticSound(150, 300, "sawtooth");
        }
      });
      
      setTimeout(() => setTerminalError(false), 500);
    }
  };

  const handleButtonConfetti = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    
    setActiveConfetti({ x, y });
    haptic([20, 50, 20]);
    
    setTimeout(() => {
      setActiveConfetti(null);
    }, 4000);
  };

  return (
    <motion.div 
      ref={ref}
      className="absolute inset-0 w-full h-full text-white"
      variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition}
    >
      <div className="w-full h-full overflow-y-auto">
        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-[#000000] via-[#1a103c] to-[#2a0845]" />
        <div className="absolute inset-0 w-full h-full bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        
        <div className="absolute inset-0 w-full h-full">
          <StarryBackground density={400} className="absolute inset-0 w-full h-full" />
          <StarryBackground density={150} className="absolute inset-0 w-full h-full" />
        </div>
      
        <div className="relative z-50 flex flex-col items-center p-6 pb-32 min-h-screen">
        <div className="text-center mt-12 mb-12 relative">
          <motion.h1 
            initial={{ scale: 0.8, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            transition={{ duration: 0.8, type: "spring", stiffness: 200, damping: 15 }}
            className="font-handwriting text-6xl md:text-8xl text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-300 transform -rotate-3 drop-shadow-2xl"
          >
            Nosso Universo
          </motion.h1>
          
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 1 }} 
            onClick={handleEasterEggClick}
            className={`mt-6 px-6 py-2 rounded-full inline-flex items-center gap-2 border transform rotate-1 cursor-pointer transition-all select-none shadow-lg
              ${glitchMode 
                ? "bg-black border-green-500 text-green-400 font-mono animate-pulse hover:bg-gray-900" 
                : "bg-white/5 backdrop-blur-md border-white/10 hover:bg-white/10 active:scale-95"
              }`}
          >
            {glitchMode ? <Terminal size={14} /> : <Clock size={16} className="text-pink-400" />}
            <span className={`font-bold tracking-widest uppercase ${glitchMode ? "text-[10px]" : "text-xs"}`}>
              {glitchMode ? "0x5375727072657361" : `${daysTogether} DIAS DE JOGO`}
            </span>
          </motion.div>
        </div>

        <div className="w-full max-w-md flex flex-col gap-16 px-2">
          {MEMORIES.gallery.map((mem, i) => {
            const rotation = i % 2 === 0 ? -3 : 3;
            const align = i % 2 === 0 ? "self-start" : "self-end";
            return (
              <motion.div 
                key={mem.id} 
                initial={{ opacity: 0, y: 50, rotate: rotation * 3 }} 
                animate={{ opacity: 1, y: 0, rotate: rotation }} 
                transition={{ delay: i * 0.2 + 0.5, type: "spring", stiffness: 100 }} 
                className={`relative bg-white p-3 pb-10 shadow-2xl max-w-[85%] ${align} transform hover:scale-105 transition-transform duration-300 z-10 hover:z-20 cursor-pointer`} 
                style={{ borderRadius: "2px" }}
                onClick={handleCardClick(mem.id)} 
              >
                {activeCardConfetti?.id === mem.id && (
                  <div className="absolute inset-0 z-0 pointer-events-none">
                    <ConfettiExplosion x="50%" y="50%" instanceId={activeCardConfetti.instanceId} />
                  </div>
                )}
                <div className="relative z-10">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-24 h-8 bg-white/20 backdrop-blur-sm transform -rotate-1 shadow-sm border border-white/30"></div>
                  
                  <div className="aspect-[4/5] w-full overflow-hidden bg-gray-100 filter contrast-105">
                    <img src={mem.url} className="w-full h-full object-cover" alt={mem.title} />
                  </div>
                  
                  <div className="mt-4 text-center">
                     <p className="font-handwriting text-gray-800 font-bold text-3xl transform -rotate-1 leading-none">{mem.title}</p>
                     <p className="font-handwriting text-gray-500 text-xl mt-2">{mem.date}</p>
                  </div>
                  
                  {i === 0 && <Heart className="absolute -right-4 -top-4 text-red-500 w-8 h-8 animate-pulse" fill="currentColor" />}
                  {i === 2 && <Star className="absolute -left-4 bottom-20 text-yellow-400 w-8 h-8 animate-spin-slow" fill="currentColor" />}
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 2.5 }} className="mt-32 relative bg-[#fff9c4] text-gray-900 p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transform rotate-1 max-w-xs w-full font-serif cursor-pointer hover:scale-105 transition-transform duration-300" onClick={handleCardClick(0)}>
           {activeCardConfetti?.id === 0 && (
             <div className="absolute inset-0 z-0 pointer-events-none">
               <ConfettiExplosion x="50%" y="50%" instanceId={activeCardConfetti.instanceId} />
             </div>
           )}
           <div className="relative z-10">
           <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-red-500 shadow-md"></div>
           <TypewriterText text="Não importa a fase, o nível ou a dificuldade. Meu jogo favorito é viver a vida com você." delay={50} className="font-handwriting text-3xl leading-snug" />
           <p className="font-handwriting text-2xl text-pink-600 font-bold mt-6 text-right">- Te amo, Gaby.</p>
           </div>
        </motion.div>

        <button 
          onClick={(e) => {
            handleButtonConfetti(e);
            setTimeout(() => onRestart(), 1000);
          }} 
          className="mt-24 px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-full font-bold text-sm transition-all border border-white/20 backdrop-blur-md flex items-center gap-2 group hover:scale-105"
          aria-label="Reiniciar jogo com efeito de confetes"
        >
          <Gamepad2 size={18} className="group-hover:rotate-12 transition-transform" />Reiniciar Jogo
        </button>
      </div>

      <AnimatePresence>
        {showTerminal && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="terminal-fullscreen flex items-center justify-center p-6 bg-black font-mono no-touch-action"
          >
            <div className="w-full max-w-md space-y-4">
              <div className="text-green-500 text-xs mb-4 space-y-1">
                <p>{">"} SYSTEM BREACH DETECTED...</p>
                <p>{">"} DECRYPTING HEX STRING [0x10]...</p>
                <p>{">"} TARGET: 0x53 0x75 0x72 0x70 0x72 0x65 0x73 0x61</p>
              </div>
              <div className={`border border-green-500/50 p-6 rounded bg-black relative overflow-hidden ${terminalError ? "animate-shake border-red-500" : ""}`}>
                 <form onSubmit={handleTerminalSubmit} className="space-y-4 relative z-10">
                   <label className="block text-green-400 text-sm tracking-wider uppercase mb-2">{terminalError ? <span className="text-red-500">ACCESS DENIED</span> : "Enter Password:"}</label>
                   <div className="flex items-center border-b border-green-500/30 pb-2">
                     <span className="text-green-500 mr-2 blink">{">"}</span>
                   <input 
                     type="text" 
                     autoFocus 
                     value={terminalInput} 
                     onChange={(e) => setTerminalInput(e.target.value)} 
                     className="bg-transparent border-none outline-none text-green-400 w-full font-bold uppercase placeholder-green-900" 
                     placeholder="Digite a senha..." 
                     aria-label="Campo de entrada de senha do terminal"
                     autoComplete="off"
                   />
                   </div>
                   <button 
                     type="submit" 
                     className="w-full bg-green-900/20 hover:bg-green-900/40 text-green-400 border border-green-500/50 py-2 text-xs uppercase tracking-widest transition-colors"
                     aria-label="Desbloquear acesso ao sistema"
                   >
                     Unlock
                   </button>
                 </form>
              </div>
              <button 
                onClick={() => setShowTerminal(false)} 
                className="text-gray-500 text-xs hover:text-white mt-4 w-full text-center"
                aria-label="Fechar terminal"
              >
                [ ABORT ]
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showQrCode && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm" style={{ touchAction: "none" }}>
            <motion.div initial={{ scale: 0.8, y: 50 }} animate={{ scale: 1, y: 0 }} className="bg-white text-gray-900 p-8 rounded-3xl max-w-sm w-full relative shadow-2xl border-4 border-pink-400 overflow-hidden">
              <button onClick={() => setShowQrCode(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 z-10" aria-label="Fechar QR Code"><X size={24} /></button>
              <div className="text-center space-y-4">
                 <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-pink-200"><Gift size={32} className="text-pink-600" /></div>
                 <h2 className="text-2xl font-black text-pink-600 uppercase tracking-tighter">Missão Secreta!</h2>
                 <p className="font-medium text-gray-600">Prepare-se para... <br/><span className="text-pink-600 font-bold bg-pink-100 px-2 rounded inline-block mt-1">algo especial.</span></p>
                 <div className="bg-gray-50 border-2 border-dashed border-gray-300 p-6 rounded-xl my-6 relative overflow-hidden group">
                    <div className="relative z-10 flex flex-col items-center gap-2">
                      <MapPin size={32} className="text-red-500 animate-bounce" />
                      <h3 className="font-bold text-gray-800 text-lg">UNLOCK</h3>
                      <div className="h-px w-full bg-gray-200 my-1"></div>
                      <p className="font-mono text-sm text-gray-600 bg-white px-2 py-1 rounded border border-gray-200 shadow-sm">Follow the Coords</p>
                      <div className="flex flex-col gap-1 text-[10px] text-gray-400 font-mono mt-1">
                        <span>LA: -12.903224374762098</span>
                        <span>LO: -38.43053206334685</span>
                      </div>
                    </div>
                 </div>
                 <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Próximo Destino</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {activeConfetti && (
        <div className="confetti-container" style={{ zIndex: 5 }}>
          <ConfettiExplosion 
            x={`${activeConfetti.x}px`} 
            y={`${activeConfetti.y}px`} 
            instanceId={Date.now() + Math.random()} 
          />
        </div>
      )}
      
      </div>
    </motion.div>
  );
});

FinalLevel.displayName = "FinalLevel";
