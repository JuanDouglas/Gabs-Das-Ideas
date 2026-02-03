'use client';

import React, { useCallback, useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { SoundContext } from "./context/SoundContext";
import { STEPS } from "./constants/game";
import { BackgroundMusic } from "./components/shared/BackgroundMusic";
import { IntroScreen } from "./components/levels/IntroScreen";
import { LoreLevel } from "./components/levels/LoreLevel";
import { NewYearLevel } from "./components/levels/NewYearLevel";
import { DistanceLevel } from "./components/levels/DistanceLevel";
import { ConstellationLevel } from "./components/levels/ConstellationLevel";
import { FeedLevel } from "./components/levels/FeedLevel";
import { FinalLevel } from "./components/levels/FinalLevel";

export default function App() {
  const [step, setStep] = useState(STEPS.INTRO);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  useEffect(() => {
    if (!isMounted) return;
    
    if (process.env.NODE_ENV === "development" || typeof window !== "undefined") {
      (window as any).setLevel = (levelNumber: number) => {
        if (levelNumber >= STEPS.INTRO && levelNumber <= STEPS.FINAL) {
          setStep(levelNumber);
          console.log(`✅ Nível definido para: ${levelNumber}`);
          console.log("Níveis disponíveis:");
          console.log("0 - INTRO (Tela inicial)");
          console.log("1 - LEVEL_1 (Campus)");
          console.log("2 - LEVEL_2 (Texto digitado)");
          console.log("3 - LEVEL_3 (Ano Novo)");
          console.log("4 - LEVEL_4 (Jogo dos corações)");
          console.log("5 - LEVEL_5 (Distância)");
          console.log("6 - FINAL (Galeria/Final)");
        } else {
          console.error(`❌ Nível inválido! Use um valor entre ${STEPS.INTRO} e ${STEPS.FINAL}`);
        }
      };
      
      (window as any).listLevels = () => {
        console.log("🎮 Níveis do jogo:");
        console.log("0 - INTRO: Tela inicial");
        console.log("1 - LORE_1: Introdução");
        console.log("2 - LEVEL_1: Ano Novo (Fogos)");
        console.log("3 - LORE_2: Celebração");
        console.log("4 - LEVEL_2: Distância (Ônibus)");
        console.log("5 - LORE_3: Obstáculos");
        console.log("6 - LEVEL_3: Estrelas (Constelação)");
        console.log("7 - LORE_4: Céu estrelado");
        console.log("8 - LEVEL_4: Alimentar (Hora do Lanche)");
        console.log("9 - LORE_5: Cuidado");
        console.log("10 - LEVEL_5: [RESERVADO]");
        console.log("11 - FINAL: Galeria/Final");
        console.log("");
        console.log("💻 Comandos disponíveis:");
        console.log("setLevel(n) - Vai para o nível n");
        console.log("listLevels() - Lista todos os níveis");
        console.log("getCurrentLevel() - Mostra o nível atual");
      };
      
      (window as any).getCurrentLevel = () => {
        const currentStep = step;
        console.log(`📍 Nível atual: ${currentStep}`);
        return currentStep;
      };
      
      console.log("🔧 Console de desenvolvedor ativado!");
      console.log("Digite listLevels() para ver todos os comandos disponíveis");
    }
  }, [isMounted, step]);
  
  const nextStep = useCallback(() => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setStep(s => {
      const nextStepValue = s + 1;
      if (nextStepValue > STEPS.FINAL) {
        console.log("Tentativa de ir além da tela final, permanecendo em:", STEPS.FINAL);
        return STEPS.FINAL;
      }
      console.log("Avançando para step:", nextStepValue);
      return nextStepValue;
    });
    
    setTimeout(() => setIsTransitioning(false), 800);
  }, [isTransitioning]);
  
  const restart = useCallback(() => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    console.log("Reiniciando jogo");
    setStep(STEPS.INTRO);
    
    setTimeout(() => setIsTransitioning(false), 800);
  }, [isTransitioning]);

  if (!isMounted) {
    return (
      <div className="relative w-full h-screen bg-[#0f0c29] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <SoundContext.Provider value={{ soundEnabled, setSoundEnabled }}>
      <div className="relative w-full h-screen bg-[#0f0c29] overflow-hidden font-sans antialiased">
      {process.env.NODE_ENV === "development" && (
        <div className="absolute top-4 left-4 z-[9999] bg-black/80 text-white text-xs px-2 py-1 rounded">
          Step: {step}/{STEPS.FINAL}
        </div>
      )}
      <BackgroundMusic />
      <AnimatePresence mode="wait">
        {step === STEPS.INTRO && <IntroScreen key="intro" onStart={nextStep} />}
        {step === STEPS.LORE_1 && <LoreLevel key="lore1" loreKey="intro" onNext={nextStep} />}
        {step === STEPS.LEVEL_1 && <NewYearLevel key="level1" onNext={nextStep} />}
        {step === STEPS.LORE_2 && <LoreLevel key="lore2" loreKey="celebration" onNext={nextStep} />}
        {step === STEPS.LEVEL_2 && <DistanceLevel key="level2" onNext={nextStep} />}
        {step === STEPS.LORE_3 && <LoreLevel key="lore3" loreKey="distance" onNext={nextStep} />}
        {step === STEPS.LEVEL_3 && <ConstellationLevel key="level3" onNext={nextStep} />}
        {step === STEPS.LORE_4 && <LoreLevel key="lore4" loreKey="stars" onNext={nextStep} />}
        {step === STEPS.LEVEL_4 && <FeedLevel key="level4" onNext={nextStep} />}
        {step === STEPS.LORE_5 && <LoreLevel key="lore5" loreKey="care" onNext={nextStep} />}
        {step === STEPS.LEVEL_5 && (
          <FinalLevel 
            key="final" 
            onRestart={() => {
              console.log("Reiniciando do FinalLevel");
              restart();
            }} 
          />
        )}
        {step === STEPS.FINAL && (
          <FinalLevel 
            key="final" 
            onRestart={() => {
              console.log("Reiniciando do FinalLevel");
              restart();
            }} 
          />
        )}
      </AnimatePresence>
      <style>{`
        @keyframes bounce-up { 0% { transform: translateY(0) scale(0.5); opacity: 1; } 100% { transform: translateY(-100px) scale(1.5); opacity: 0; } }
        .animate-bounce-up { animation: bounce-up 0.8s ease-out forwards; }
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&display=swap');
        .font-handwriting { font-family: 'Caveat', cursive; }
        .star-pos { position: absolute; background: white; border-radius: 50%; width: 0.25rem; height: 0.25rem; animation: pulse 2s infinite; top: var(--star-top, 0); left: var(--star-left, 0); animation-delay: var(--star-delay, 0s); }
        .player-pos { 
          /* Posição é controlada via JavaScript ref para melhor performance */
          /* Removido position: absolute para evitar conflito com controle via ref */
        }
        @keyframes fall { 0% { transform: translateY(0) rotate(0deg); opacity: 1; } 100% { transform: translateY(110vh) rotate(720deg); opacity: 0; } }
        @keyframes scanline { 0% { top: 0% } 100% { top: 100% } }
        .animate-scanline { animation: scanline 2s linear infinite; }
        .will-change-transform { will-change: transform; }
        .blink { animation: blink 1s step-end infinite; }
        @keyframes blink { 50% { opacity: 0; } }
        .confetti-container { 
          z-index: 5 !important; 
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          width: 100vw !important;
          height: 100vh !important;
          pointer-events: none !important;
        }
        .no-touch-action { touch-action: none; }
        .shake-animation { animation: shake 0.5s ease-in-out; }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
        .terminal-fullscreen { 
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          width: 100vw !important;
          height: 100vh !important;
          z-index: 9999 !important;
          background: rgba(0, 0, 0, 0.85) !important;
          backdrop-filter: blur(15px) saturate(180%) !important;
          -webkit-backdrop-filter: blur(15px) saturate(180%) !important;
        }
        .text-shadow-glow { 
          text-shadow: 0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor;
        }
        .pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite alternate;
        }
        @keyframes pulse-glow {
          from {
            box-shadow: 0 0 5px currentColor;
          }
          to {
            box-shadow: 0 0 20px currentColor, 0 0 30px currentColor;
          }
        }
        .gradient-text {
          background: linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab);
          background-size: 400% 400%;
          animation: gradient-flow 3s ease infinite;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        @keyframes gradient-flow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .text-shadow-glow { 
          text-shadow: 0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor;
        }
        .pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite alternate;
        }
        @keyframes pulse-glow {
          from {
            box-shadow: 0 0 5px currentColor;
          }
          to {
            box-shadow: 0 0 20px currentColor, 0 0 30px currentColor;
          }
        }
        @keyframes confettiExplode { 
          0% { 
            transform: translate(0, 0) scale(1) rotate(0deg); 
            opacity: 1; 
            box-shadow: 0 0 15px currentColor;
          } 
          25% { 
            opacity: 1; 
            transform: translate(calc(var(--tx, 0) * 0.3), calc(var(--ty, 0) * 0.3)) scale(1.1) rotate(90deg);
            box-shadow: 0 0 10px currentColor;
          }
          50% { 
            opacity: 0.9; 
            transform: translate(calc(var(--tx, 0) * 0.7), calc(var(--ty, 0) * 0.7)) scale(1) rotate(270deg);
            box-shadow: 0 0 5px currentColor;
          }
          100% { 
            transform: translate(var(--tx, 0), var(--ty, 0)) scale(0.2) rotate(720deg); 
            opacity: 0; 
            box-shadow: none;
          } 
        }
      `}</style>
    </div>
    </SoundContext.Provider>
  );
}
