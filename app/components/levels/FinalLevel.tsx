'use client';

import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Clock, Eye, Gamepad2, Gift, Heart, MapPin, Star, Terminal, X } from "lucide-react";
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
  const [flashSecret, setFlashSecret] = useState(false);
  const [showSecretPolaroid, setShowSecretPolaroid] = useState(false);
  const [showPfScan, setShowPfScan] = useState(false);
  const [pfStep, setPfStep] = useState(0);
  const cardConfettiTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pressTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatRateRef = useRef(900);
  const pfTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pfIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { trigger: haptic } = useHaptic();

  useEffect(() => {
    if (showTerminal || showQrCode) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      if (pressTimeoutRef.current) {
        clearTimeout(pressTimeoutRef.current);
        pressTimeoutRef.current = null;
      }
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }
      if (pfTimerRef.current) {
        clearTimeout(pfTimerRef.current);
        pfTimerRef.current = null;
      }
      if (pfIntervalRef.current) {
        clearInterval(pfIntervalRef.current);
        pfIntervalRef.current = null;
      }
    };
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
        
        const errorAudio = new Audio("./sounds/melhore.wav");
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
      
      const errorAudio = new Audio("./sounds/melhore.wav");
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

  const startPfScan = () => {
    setPfStep(0);
    setShowPfScan(true);
    haptic([30, 60, 30]);
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate([80, 120, 60, 200]);
    }
    if (isSoundEnabled()) {
      createSyntheticSound(420, 120, "square");
      setTimeout(() => createSyntheticSound(520, 120, "square"), 180);
      setTimeout(() => createSyntheticSound(320, 200, "sawtooth"), 380);
    }

    if (pfIntervalRef.current) clearInterval(pfIntervalRef.current);
    pfIntervalRef.current = setInterval(() => {
      setPfStep(prev => Math.min(prev + 1, 4));
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate([30, 70, 30]);
      }
      if (isSoundEnabled()) {
        createSyntheticSound(300 + Math.random() * 200, 80, "sawtooth");
      }
    }, 900);

    if (pfTimerRef.current) clearTimeout(pfTimerRef.current);
    pfTimerRef.current = setTimeout(() => {
      if (pfIntervalRef.current) {
        clearInterval(pfIntervalRef.current);
        pfIntervalRef.current = null;
      }
      setPfStep(5);
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate([50, 100, 50, 120, 50]);
      }
      if (isSoundEnabled()) {
        createSyntheticSound(740, 200, "triangle");
      }
    }, 4200);
  };

  const closePfScan = () => {
    if (pfTimerRef.current) {
      clearTimeout(pfTimerRef.current);
      pfTimerRef.current = null;
    }
    if (pfIntervalRef.current) {
      clearInterval(pfIntervalRef.current);
      pfIntervalRef.current = null;
    }
    setShowPfScan(false);
  };

  const stopHeartbeat = () => {
    if (pressTimeoutRef.current) {
      clearTimeout(pressTimeoutRef.current);
      pressTimeoutRef.current = null;
    }
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
    heartbeatRateRef.current = 900;
  };

  const startHeartbeat = () => {
    if (heartbeatIntervalRef.current) return;
    heartbeatRateRef.current = 900;
    heartbeatIntervalRef.current = setInterval(() => {
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate([40, 80, 60]);
      }
      heartbeatRateRef.current = Math.max(260, heartbeatRateRef.current - 80);
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = setInterval(() => {
          if (typeof navigator !== "undefined" && navigator.vibrate) {
            navigator.vibrate([35, 70, 55]);
          }
          heartbeatRateRef.current = Math.max(220, heartbeatRateRef.current - 60);
        }, heartbeatRateRef.current);
      }
    }, heartbeatRateRef.current);
  };

  const handleSecretPressStart = () => {
    if (showSecretPolaroid) return;
    stopHeartbeat();
    pressTimeoutRef.current = setTimeout(() => {
      startHeartbeat();
      haptic([40, 80, 40, 120]);
      setTimeout(() => {
        setFlashSecret(true);
        setTimeout(() => setFlashSecret(false), 160);
        setShowSecretPolaroid(true);
        stopHeartbeat();
      }, 1800);
    }, 3000);
  };

  const handleSecretPressEnd = () => {
    stopHeartbeat();
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
            Nosso universo
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
              {glitchMode ? "0x5375727072657361" : `${daysTogether} DIAS COM VOCÊ`}
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
                  
                  {i === 0 && (
                    <button
                      type="button"
                      onPointerDown={handleSecretPressStart}
                      onPointerUp={handleSecretPressEnd}
                      onPointerLeave={handleSecretPressEnd}
                      onPointerCancel={handleSecretPressEnd}
                      className="absolute -right-4 -top-4 text-red-500 w-8 h-8 animate-pulse"
                      aria-label="Ativar batimento secreto"
                    >
                      <Heart className="w-full h-full" fill="currentColor" />
                    </button>
                  )}
                  {i === 2 && <Star className="absolute -left-4 bottom-20 text-yellow-400 w-8 h-8 animate-spin-slow" fill="currentColor" />}
                </div>
              </motion.div>
            );
          })}
        </div>

        {showSecretPolaroid && (
          <motion.div
            initial={{ opacity: 0, y: 40, rotate: -4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, rotate: -1, scale: 1 }}
            transition={{ duration: 0.8, type: "spring", stiffness: 120 }}
            className="mt-16 relative bg-white p-3 pb-10 shadow-2xl max-w-[85%] w-full transform rotate-1"
            style={{ borderRadius: "2px" }}
          >
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-24 h-8 bg-white/20 backdrop-blur-sm transform -rotate-1 shadow-sm border border-white/30"></div>
            <div className="aspect-[4/5] w-full overflow-hidden bg-gray-100 filter contrast-105">
              <img src={MEMORIES.gallery[0]?.url} className="w-full h-full object-cover scale-105" alt="Memória secreta" />
            </div>
            <div className="mt-4 text-center">
              <p className="font-handwriting text-gray-800 font-bold text-3xl transform -rotate-1 leading-none">Segredo revelado</p>
              <p className="font-handwriting text-gray-500 text-xl mt-2">Olha por outro ângulo</p>
            </div>
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 2.5 }} className="mt-32 relative bg-[#fff9c4] text-gray-900 p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transform rotate-1 max-w-xs w-full font-serif hover:scale-105 transition-transform duration-300">
           <div className="relative z-10">
           <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-red-500 shadow-md"></div>
           <TypewriterText text="Não importa a fase, o nível ou a dificuldade. Meu jogo preferido é viver a vida com você." delay={50} className="font-handwriting text-3xl leading-snug" />
           <p className="font-handwriting text-2xl text-pink-600 font-bold mt-6 text-right">— Te amo, Gaby.</p>
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
          <Gamepad2 size={18} className="group-hover:rotate-12 transition-transform" />Recomeçar jogo
        </button>

        <button
          onClick={startPfScan}
          className="mt-6 text-[10px] text-white/25 hover:text-white/60 transition-colors flex items-center gap-2"
          aria-label="Iniciar varredura de segurança"
        >
          <Eye size={12} />
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
                <p>{">"} ALERTA: invasão detectada...</p>
                <p>{">"} DESCRIPTOGRAFANDO STRING [0x10]...</p>
                <p>{">"} ALVO: 0x53 0x75 0x72 0x70 0x72 0x65 0x73 0x61</p>
              </div>
              <div className={`border border-green-500/50 p-6 rounded bg-black relative overflow-hidden ${terminalError ? "animate-shake border-red-500" : ""}`}>
                 <form onSubmit={handleTerminalSubmit} className="space-y-4 relative z-10">
                   <label className="block text-green-400 text-sm tracking-wider uppercase mb-2">{terminalError ? <span className="text-red-500">ACESSO NEGADO</span> : "Digite a senha:"}</label>
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
                     Liberar
                   </button>
                 </form>
              </div>
              <button 
                onClick={() => setShowTerminal(false)} 
                className="text-gray-500 text-xs hover:text-white mt-4 w-full text-center"
                aria-label="Fechar terminal"
              >
                [ SAIR ]
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
                 <h2 className="text-2xl font-black text-pink-600 uppercase tracking-tighter">Missão secreta!</h2>
                 <p className="font-medium text-gray-600">Prepare-se para... <br/><span className="text-pink-600 font-bold bg-pink-100 px-2 rounded inline-block mt-1">algo especial.</span></p>
                 <div className="bg-gray-50 border-2 border-dashed border-gray-300 p-6 rounded-xl my-6 relative overflow-hidden group">
                    <div className="relative z-10 flex flex-col items-center gap-2">
                      <MapPin size={32} className="text-red-500 animate-bounce" />
                      <h3 className="font-bold text-gray-800 text-lg">DESBLOQUEIO</h3>
                      <div className="h-px w-full bg-gray-200 my-1"></div>
                      <p className="font-mono text-sm text-gray-600 bg-white px-2 py-1 rounded border border-gray-200 shadow-sm">Siga as coordenadas</p>
                      <div className="flex flex-col gap-1 text-[10px] text-gray-400 font-mono mt-1">
                        <span>LA: -12.903224374762098</span>
                        <span>LO: -38.43053206334685</span>
                      </div>
                    </div>
                 </div>
                 <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Próximo destino</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPfScan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="terminal-fullscreen z-[90] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
            onClick={closePfScan}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              transition={{ type: "spring", damping: 18, stiffness: 200 }}
              className="relative w-full max-w-md rounded-3xl border border-white/20 bg-white/10 backdrop-blur-2xl p-6 text-left shadow-[0_30px_80px_rgba(0,0,0,0.45)] ring-1 ring-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/10 via-transparent to-white/5 pointer-events-none" />
              <div className="absolute -top-10 right-6 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
              <div className="absolute -bottom-12 left-6 h-24 w-24 rounded-full bg-emerald-400/10 blur-2xl" />
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center">
                  <Eye size={18} className="text-white/80" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-white/50">Varredura de segurança</p>
                  <p className="text-sm font-semibold text-white/90">Agente da PF</p>
                </div>
                <button onClick={closePfScan} className="ml-auto text-white/40 hover:text-white/80">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-2 text-xs font-mono text-white/70">
                <div>{pfStep >= 0 ? "> iniciando protocolo..." : ""}</div>
                <div>{pfStep >= 1 ? "> acessando logs de conversa..." : ""}</div>
                <div>{pfStep >= 2 ? "> analisando sentimentos..." : ""}</div>
                <div>{pfStep >= 3 ? "> validando compatibilidade..." : ""}</div>
                <div>{pfStep >= 4 ? "> conferindo termos de namoro..." : ""}</div>
              </div>

              {pfStep >= 5 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-5 rounded-2xl border border-emerald-400/40 bg-emerald-400/10 p-4"
                >
                  <p className="text-sm text-emerald-200 font-semibold">
                    APROVADO: namoro autorizado.
                  </p>
                  <p className="text-xs text-emerald-200/80 mt-1">
                    Agente da PF: "Prosseguam. Esse namoro está lindo demais."
                  </p>
                </motion.div>
              )}
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

      {flashSecret && (
        <motion.div
          className="fixed inset-0 bg-white z-[80] pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.8, 0] }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        />
      )}
      
      </div>
    </motion.div>
  );
});

FinalLevel.displayName = "FinalLevel";



