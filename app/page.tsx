'use client'

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useAnimation } from 'framer-motion';
import { Gamepad2, Heart, MapPin, Sparkles, Zap, ChevronRight, Star, Trophy, Rocket, Calendar, Volume2, VolumeX, Clock, Gift, X, Terminal, Lock, Eye, Bomb, Map, Bus, PartyPopper, Info, Utensils } from 'lucide-react';

// --- Configuração & Assets ---
const MEMORIES = {
  campus: {
    url: "./cpgo.jpg",
    date: "21 NOV 2025",
    title: "O Encontro (CPBR)"
  },
  newYear: {
    url: "./ano_novo.jpeg",
    date: "31 DEZ 2023",
    title: "Nosso Ano Novo"
  },
  gallery: [
    { 
      id: 1, 
      url: "./primeiro.jpg", 
      date: "21 DEZ 2025", 
      title: "Nosso primeiro encontro de verdade" 
    },
    { 
      id: 2, 
      url: "./surpresa.jpg", 
      date: "17 JAN 2025", 
      title: "Aquela Viagem" 
    },
    { 
      id: 3, 
      url: "./ela_aqui.jpeg", 
      date: "25 JAN 2025", 
      title: "É incrível como sua presença é boa!" 
    },
    { 
      id: 4, 
      url: "./aleatoria.jpg", 
      date: "HOJE", 
      title: "Cada momento conta" 
    },
    {
      id: 5,
      url: "./proximos.png",
      date: "FUTURO",
      title: "Próximas Fases"
    }
  ]
};

const MUSIC_URL = "https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3"; 

const STEPS = {
  INTRO: 0,
  LEVEL_1: 1,
  LEVEL_2: 2,
  LEVEL_3: 3,
  LEVEL_4: 4,
  LEVEL_5: 5,
  FINAL: 6
};

const POINTS_TO_WIN = 15;

// Interfaces TypeScript
interface GameItem {
  id: number;
  x: number;
  y: number;
  type: 'heart' | 'bomb';
}

interface Memory {
  id: number;
  url: string;
  date: string;
  title: string;
}

interface LevelProps {
  onNext: () => void;
}

interface IntroScreenProps {
  onStart: () => void;
}

interface FinalLevelProps {
  onRestart: () => void;
}

// Configuração de Transição
const pageVariants = {
  initial: { opacity: 0, scale: 0.98, filter: "blur(8px)" },
  animate: { opacity: 1, scale: 1, filter: "blur(0px)" },
  exit: { opacity: 0, scale: 1.02, filter: "blur(8px)" }
};
const pageTransition = { duration: 0.8, ease: "easeInOut" as const };

// --- Utilities ---

const useHaptic = () => {
  const trigger = (pattern = [10]) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  };
  return trigger;
};

const TypewriterText = React.memo(({
  text,
  delay = 40,
  className,
  onComplete
}: {
  text: string;
  delay?: number;
  className?: string;
  onComplete?: () => void;
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startTyping = useCallback(() => {
    setDisplayedText('');
    let index = 0;
    
    intervalRef.current = setInterval(() => {
      setDisplayedText(text.slice(0, index + 1));
      index++;
      
      if (index >= text.length) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        onComplete?.();
      }
    }, delay);
  }, [text, delay, onComplete]);

  useEffect(() => {
    startTyping();
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [startTyping]);

  return <span className={className}>{displayedText}</span>;
});

TypewriterText.displayName = 'TypewriterText';

// --- Componentes do Jogo ---

interface GameItemProps {
  item: GameItem;
}

const GameItemElement = React.memo<GameItemProps>(({ item }) => (
  <div 
    className={`absolute pointer-events-none will-change-transform ${item.type === 'bomb' ? 'text-red-500' : 'text-pink-500'}`}
    style={{ 
      transform: `translate3d(${item.x}vw, ${item.y}vh, 0)`, 
      left: 0,
      top: 0
    }}
  >
    {item.type === 'bomb' ? (
      <Bomb size={28} className="fill-red-900/50 animate-pulse" />
    ) : (
      <Heart size={28} className="fill-pink-500/50" />
    )}
  </div>
));
GameItemElement.displayName = 'GameItemElement';

const PlayerElement = React.memo(React.forwardRef<HTMLDivElement, { isDragging?: boolean }>((props, ref) => (
  <div 
    ref={ref}
    className="player-pos text-white will-change-transform" 
  >
    <Rocket size={40} className="fill-indigo-500 text-indigo-300 rotate-[-45deg]" />
    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-2 h-6 bg-orange-500/80 rounded-full blur-sm animate-pulse" />
  </div>
)));
PlayerElement.displayName = 'PlayerElement';

// Interface para StarElement
interface StarElementProps {
  top: number;
  left: number;
  delay: number;
  size?: number;
}

// Estrela de fundo otimizada
const StarElement = React.memo<StarElementProps>(({ top, left, delay, size = 12 }) => (
  <div 
    className="absolute bg-white rounded-full animate-pulse" 
    style={{ 
      top: `${top}%`, 
      left: `${left}%`, 
      width: `${size}px`,
      height: `${size}px`,
      animationDelay: `${delay}s`,
      opacity: 0.3 + (0.7 * ((top * left) % 100) / 100) // Opacidade determinística baseada na posição
    }} 
  />
));
StarElement.displayName = 'StarElement';

// Componente de fundo estrelado reutilizável
interface StarryBackgroundProps {
  density?: number;
  className?: string;
}

const StarryBackground = React.memo<StarryBackgroundProps>(({ density = 120, className = "" }) => {
  const [stars, setStars] = useState<Array<{id: number; top: number; left: number; delay: number; size: number}>>([]);
  
  useEffect(() => {
    setStars([...Array(density)].map((_, i) => ({
      id: i,
      top: Math.random() * 100,
      left: Math.random() * 100,
      delay: Math.random() * 5,
      size: Math.random() * 2 + 1
    })));
  }, [density]);

  return (
    <div className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}>
      {stars.map((star) => (
        <StarElement 
          key={star.id} 
          top={star.top} 
          left={star.left} 
          delay={star.delay} 
          size={star.size} 
        />
      ))}
    </div>
  );
});
StarryBackground.displayName = 'StarryBackground';

const useDaysTogether = (startDate: string) => {
  const [days, setDays] = useState(0);
  
  useEffect(() => {
    const calculateDays = () => {
      const today = new Date();
      const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
      const diffTime = today.getTime() - start.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      setDays(diffDays);
    };
    
    calculateDays();
    // Atualizar a cada dia
    const interval = setInterval(calculateDays, 60000 * 60 * 24);
    return () => clearInterval(interval);
  }, [startDate]);
  
  return days;
};

// --- Componentes Auxiliares ---

const BackgroundMusic = () => {
  const [playing, setPlaying] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const audio = new Audio();
    audio.src = MUSIC_URL;
    audio.loop = true;
    audio.volume = 0.4;
    audio.preload = 'metadata';
    
    const handleCanPlayThrough = () => setLoaded(true);
    const handleError = () => {
      setError(true);
      console.warn('Falha ao carregar música de fundo');
    };
    
    audio.addEventListener('canplaythrough', handleCanPlayThrough);
    audio.addEventListener('error', handleError);
    
    audioRef.current = audio;
    
    return () => {
      audio.removeEventListener('canplaythrough', handleCanPlayThrough);
      audio.removeEventListener('error', handleError);
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  const togglePlay = useCallback(() => {
    if (!audioRef.current || !loaded || error) return;
    
    // Som de clique no botão - tom neutro
    playSound('./button.wav', 500, 'sine');
    
    try {
      if (playing) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch((err) => {
          console.warn('Erro ao reproduzir música:', err);
          setError(true);
        });
      }
      setPlaying(!playing);
    } catch (err) {
      console.warn('Erro no controle de música:', err);
    }
  }, [playing, loaded, error]);

  if (error) return null;

  return (
    <button
      onClick={togglePlay}
      disabled={!loaded}
      className="fixed top-4 right-4 z-[60] bg-white/10 backdrop-blur-md p-3 rounded-full text-white/70 hover:text-white hover:bg-white/20 transition-all shadow-lg border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
      aria-label={playing ? "Pausar música de fundo" : "Tocar música de fundo"}
    >
      {!loaded ? (
        <div className="w-5 h-5 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
      ) : playing ? (
        <Volume2 size={20} className="text-green-400" />
      ) : (
        <VolumeX size={20} />
      )}
    </button>
  );
};

interface ConfettiParticleProps {
  particle: {
    id: number;
    color: string;
    tx: number;
    ty: number;
    duration: number;
    delay: number;
    rotation?: number;
  };
  originX: string;
  originY: string;
}

const ConfettiParticle = React.memo<ConfettiParticleProps>(({ particle, originX, originY }) => (
  <div
    className={`fixed w-4 h-4 rounded-full ${particle.color} pointer-events-none shadow-lg`}
    style={{
      left: originX,
      top: originY,
      '--tx': `${particle.tx}px`,
      '--ty': `${particle.ty}px`,
      animation: `confettiExplode ${particle.duration}s cubic-bezier(0.25, 1, 0.5, 1) forwards`,
      animationDelay: `${particle.delay}s`,
      zIndex: 9999 + (particle.id % 100) // Z-index determinístico para sobreposição natural
    } as React.CSSProperties}
  />
));
ConfettiParticle.displayName = 'ConfettiParticle';

const ConfettiExplosion = ({ x = '50%', y = '50%' }: { x?: string; y?: string }) => {
  const [particles, setParticles] = useState<Array<{id: number; color: string; tx: number; ty: number; duration: number; delay: number; rotation: number}>>([]);
  
  useEffect(() => {
    setParticles([...Array(250)].map((_, i) => {
      const angle = (Math.PI * 2 * i) / 250 + Math.random() * 0.5;
      const radius = Math.random() * 300 + 100;
      const tx = Math.cos(angle) * radius;
      const ty = Math.sin(angle) * radius - Math.random() * 200; // Bias para cima
      
      return {
        id: i,
        color: ['bg-pink-500', 'bg-purple-500', 'bg-blue-400', 'bg-yellow-400', 'bg-white', 'bg-red-500', 'bg-green-500', 'bg-orange-500', 'bg-cyan-400', 'bg-lime-400'][Math.floor(Math.random() * 10)],
        tx,
        ty,
        duration: Math.random() * 3 + 2.5,
        delay: Math.random() * 0.4,
        rotation: Math.random() * 360
      };
    }));
  }, []);
  
  return (
    <>
      {particles.map((particle) => (
        <ConfettiParticle key={particle.id} particle={particle} originX={x} originY={y} />
      ))}
    </>
  );
};

// --- Telas do Jogo ---

const IntroScreen = React.forwardRef<HTMLDivElement, IntroScreenProps>(({ onStart }, ref) => {
  const [gameWon, setGameWon] = useState(false);
  const [score, setScore] = useState(0);
  const [items, setItems] = useState<GameItem[]>([]);
  const [damageEffect, setDamageEffect] = useState(false);
  const [showInfoPopup, setShowInfoPopup] = useState(true); 
  
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rocketRef = useRef<HTMLDivElement | null>(null);
  const playerXRef = useRef(50);
  const requestRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | undefined>(undefined);
  const spawnTimerRef = useRef(0);
  
  const haptic = useHaptic();

  const setCombinedRef = (node: HTMLDivElement | null) => {
    containerRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) ref.current = node;
  };

  useEffect(() => {
    const preloadImage = (src: string) => { const img = new Image(); img.src = src; };
    Object.values(MEMORIES).forEach(v => {
      if(!Array.isArray(v) && v.url) preloadImage(v.url);
      if(Array.isArray(v)) v.forEach(m => m && preloadImage(m.url));
    });
    
    if (rocketRef.current) {
      rocketRef.current.style.left = '50%';
    }
  }, []);

  const animate = useCallback((time: number) => {
    if (lastTimeRef.current !== undefined) {
      const deltaTime = time - lastTimeRef.current;
      spawnTimerRef.current += deltaTime;
      if (spawnTimerRef.current > 500) {
        const isBomb = Math.random() < 0.2;
        setItems(prev => [...prev, { 
          id: Math.random(), 
          x: Math.random() * 90 + 5, 
          y: -10,
          type: isBomb ? 'bomb' : 'heart'
        }]);
        spawnTimerRef.current = 0;
      }

      setItems(prev => {
        // Limitar máximo de 6 itens para performance
        const limitedPrev = prev.length > 6 ? prev.slice(-6) : prev;
        const nextItems = [];
        let scoreDelta = 0;
        let hitBomb = false;

        for (const item of limitedPrev) {
          const newY = item.y + (0.06 * deltaTime);
          if (newY > 70 && newY < 85 && Math.abs(item.x - playerXRef.current) < 8) {
            if (item.type === 'bomb') {
              scoreDelta -= 5;
              hitBomb = true;
            } else {
              scoreDelta += 1;
            }
          } else if (newY <= 100) {
            nextItems.push({ ...item, y: newY });
          }
        }

        if (hitBomb) {
          haptic([100, 50, 100]);
          setDamageEffect(true);
          setTimeout(() => setDamageEffect(false), 300);
        } else if (scoreDelta > 0) {
          haptic([10]);
        }

        if (scoreDelta !== 0) {
          setScore(s => {
            const newScore = Math.max(0, s + scoreDelta);
             if (newScore >= POINTS_TO_WIN && newScore < 100) {
                setTimeout(() => {
                    setGameWon(true); 
                    haptic([50, 50, 50]);
                }, 0);
                return 100;
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

  return (
    <motion.div 
      ref={setCombinedRef}
      className={`absolute inset-0 w-full h-full flex flex-col items-center justify-center p-6 text-white overflow-hidden z-50 touch-none ${damageEffect ? 'bg-red-900/50' : ''}`}
      style={{ touchAction: 'none' }}
      variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition}
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
               <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-full border border-white/10 backdrop-blur-sm">
                  <Heart size={20} className="fill-pink-500 text-pink-500" />
                  <span className="font-mono font-bold text-xl">{score}/{POINTS_TO_WIN}</span>
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
                className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
                style={{ touchAction: 'none' }}
              >
                <motion.div 
                  initial={{ scale: 0.8, y: 50 }} 
                  animate={{ scale: 1, y: 0 }} 
                  className="bg-white/10 border border-white/20 p-8 rounded-3xl max-w-sm w-full text-center shadow-2xl relative"
                >
                  <div className="w-16 h-16 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Gamepad2 size={32} className="text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Protocolo Gabrielly</h2>
                  <p className="text-gray-300 text-sm mb-6 leading-relaxed">
                    Bem-vinda, amor! <br/>
                    Esta é uma jornada interativa pelas nossas memórias. Colete corações, desvie dos obstáculos e preste atenção aos <strong>segredos escondidos</strong>.
                  </p>
                  <button 
                    onClick={() => setShowInfoPopup(false)} 
                    className="w-full py-3 bg-white text-indigo-900 font-bold rounded-xl hover:bg-gray-100 transition-colors shadow-lg active:scale-95"
                  >
                    Iniciar Missão
                  </button>
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
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { playSound('./start.wav', 440, 'square'); onStart(); }} className="px-10 py-4 bg-white text-indigo-900 font-bold rounded-2xl flex items-center gap-3 shadow-xl">
            START STORY <ChevronRight />
          </motion.button>
          
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 0.6 }} 
            transition={{ delay: 2.0 }}
            className="mt-6 font-mono text-[10px] text-green-400/80 tracking-widest border-t border-green-500/30 pt-2 animate-pulse"
          >
             {'>'} SYSTEM_MSG: Glitch detected in [DAYS_COUNTER]...
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
});

const CampusLevel = React.forwardRef<HTMLDivElement, LevelProps>(({ onNext }, ref) => {
  const [revealed, setRevealed] = useState(false);
  const haptic = useHaptic();

  useEffect(() => {
    const timer = setTimeout(() => { setRevealed(true); haptic([20]); }, 1000); 
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div 
      ref={ref}
      className="absolute inset-0 w-full h-full bg-[#1a1a2e] flex flex-col items-center justify-center p-6"
      variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition}
    >
      <StarryBackground density={80} className="-z-10" />
      <div className="w-full max-w-md space-y-6">
        <div className="flex items-center justify-between text-white/60 text-sm font-bold uppercase tracking-wider">
          <span>Level 01</span><span>The Meeting</span>
        </div>
        <motion.div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-2xl relative overflow-hidden">
          <AnimatePresence>
          {!revealed && (
            <motion.div exit={{ opacity: 0 }} className="absolute inset-0 z-20 bg-indigo-900 flex flex-col items-center justify-center">
              <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-white font-bold text-sm">LOADING MEMORY...</p>
            </motion.div>
          )}
          </AnimatePresence>
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden mb-6 bg-black/50">
            <motion.img src={MEMORIES.campus.url} className="w-full h-full object-cover" initial={{ scale: 1.1 }} animate={{ scale: 1 }} transition={{ duration: 3 }} />
            <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg border border-white/20 flex items-center gap-2">
              <Calendar size={12} className="text-pink-400" /><span className="text-xs font-bold text-white uppercase tracking-wider">{MEMORIES.campus.date}</span>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Campus Party</h3>
          {revealed && <TypewriterText className="text-gray-300 text-sm h-16" text="Foi onde o player 1 encontrou o player 2. No meio de tanta tecnologia, o melhor algoritmo foi o destino nos juntando." delay={30} />}
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 4.0 }} className="flex justify-end">
          <button onClick={() => { playSound('./click.wav', 600, 'sine'); onNext(); }} className="p-4 bg-pink-500 rounded-full text-white hover:bg-pink-600 transition-all shadow-lg shadow-pink-500/30" aria-label="Próximo nível"><ChevronRight size={24} /></button>
        </motion.div>
      </div>
    </motion.div>
  );
});

const NewYearLevel = React.forwardRef<HTMLDivElement, LevelProps>(({ onNext }, ref) => {
  const [score, setScore] = useState(0);
  const maxScore = 8; 
  const haptic = useHaptic();

  const handleTap = (e: React.MouseEvent) => {
    if (score >= maxScore) return;
    haptic([10]);
    setScore(s => s + 1);
    
    // Efeito sonoro
    const audio = new Audio('./dale.wav');
    audio.volume = 0.6;
    audio.play().catch(err => console.log('Audio play failed:', err));
    
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#ffffff', '#ffa500', '#ff69b4'];
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 120 + 80; 
        const tx = Math.cos(angle) * velocity;
        const ty = Math.sin(angle) * velocity;
        const color = colors[Math.floor(Math.random() * colors.length)];

        particle.style.position = 'fixed';
        particle.style.left = `${e.clientX}px`;
        particle.style.top = `${e.clientY}px`;
        particle.style.width = Math.random() * 8 + 4 + 'px';
        particle.style.height = particle.style.width;
        particle.style.backgroundColor = color;
        particle.style.borderRadius = '50%';
        particle.style.pointerEvents = 'none';
        particle.style.boxShadow = `0 0 ${Math.random() * 10 + 5}px ${color}`;
        
        particle.animate([
            { transform: 'translate(0, 0) scale(1)', opacity: 1 },
            { transform: `translate(${tx}px, ${ty}px) scale(0)`, opacity: 0 }
        ], {
            duration: 1000 + Math.random() * 600,
            easing: 'cubic-bezier(0, .9, .57, 1)'
        }).onfinish = () => particle.remove();

        document.body.appendChild(particle);
    }
  };

  useEffect(() => {
    if (score >= maxScore) setTimeout(onNext, 4000);
  }, [score, onNext]);

  return (
    <motion.div 
      ref={ref}
      className="absolute inset-0 w-full h-full bg-[#120a2e] flex flex-col items-center justify-center p-6 text-center cursor-pointer select-none overflow-hidden"
      onClick={handleTap}
      variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition}
    >
      <StarryBackground density={90} className="-z-10" />
      <div className="absolute inset-0 opacity-30 pointer-events-none">
         <motion.div animate={{ opacity: 0.5 }} transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }} className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-purple-900 to-transparent" />
         <motion.div animate={{ opacity: 0.3 }} transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse", delay: 1 }} className="absolute top-20 left-20 w-64 h-64 bg-yellow-500/20 rounded-full blur-3xl" />
      </div>

      <div className="absolute top-10 flex gap-2 z-20">
        {[...Array(maxScore)].map((_, i) => (
          <motion.div 
            key={i} 
            initial={{ scale: 0 }}
            animate={{ scale: i < score ? 1.2 : 0.8, opacity: i < score ? 1 : 0.3, backgroundColor: i < score ? '#fbbf24' : '#4b5563' }} 
            className="w-3 h-3 rounded-full transition-colors duration-300" 
          />
        ))}
      </div>

      <div className="z-10 pointer-events-none w-full max-w-sm relative">
        {score < maxScore ? (
          <motion.div animate={{ scale: 1.05 }} transition={{ repeat: Infinity, duration: 0.6, repeatType: "reverse" }}>
            <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-600 mb-4 tracking-tighter drop-shadow-lg">
              CELEBRE!
            </h2>
            <p className="text-purple-200 font-medium">Toque para estourar os fogos</p>
            <PartyPopper className="mx-auto mt-8 text-yellow-400 w-12 h-12 animate-bounce" />
          </motion.div>
        ) : (
          <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-black/60 backdrop-blur-xl p-6 rounded-3xl border border-white/20 mx-auto shadow-2xl">
            <div className="relative aspect-video w-full rounded-xl overflow-hidden mb-4 shadow-lg border border-white/10">
              <img src={MEMORIES.newYear.url} className="w-full h-full object-cover" alt={MEMORIES.newYear.title} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">Ano Novo</h2>
            <p className="text-sm text-gray-300 leading-relaxed">A melhor virada de todas. Risadas sinceras valem mais que qualquer código.</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
});

const DistanceLevel = React.forwardRef<HTMLDivElement, LevelProps>(({ onNext }, ref) => {
  const [completed, setCompleted] = useState(false);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const x = useMotionValue(0);
  const busControls = useAnimation(); 
  const width = useTransform(x, value => `${value}px`);
  const haptic = useHaptic();
  
  const handleDragEnd = () => {
    if (!trackRef.current) return;
    const threshold = (trackRef.current.offsetWidth - 64) * 0.9; 
    if (x.get() > threshold) {
      setCompleted(true);
      haptic([30, 30]);
      
      busControls.start({
        x: window.innerWidth + 100, 
        transition: { duration: 2, ease: "easeInOut" }
      }).then(() => {
        setTimeout(onNext, 200);
      });
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
            <Map size={14} />
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
              whileDrag={{ scale: 1.05 }} 
              className="relative z-10 w-20 h-16 bg-yellow-400 rounded-lg shadow-lg flex items-center justify-center cursor-grab active:cursor-grabbing border-b-4 border-yellow-600"
            >
              <Bus className="text-yellow-900" size={36} />
              <div className="absolute -bottom-2 left-3 w-4 h-4 bg-gray-900 rounded-full border-2 border-gray-600"></div>
              <div className="absolute -bottom-2 right-3 w-4 h-4 bg-gray-900 rounded-full border-2 border-gray-600"></div>
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

const ConstellationLevel = React.forwardRef<HTMLDivElement, LevelProps>(({ onNext }, ref) => {
  const [points, setPoints] = useState([false, false, false, false, false]); 
  const haptic = useHaptic();

  const stars = useMemo(() => [...Array(100)].map(() => ({
    top: Math.random() * 100,
    left: Math.random() * 100,
    delay: Math.random() * 5,
    size: Math.random() * 2 + 1 
  })), []);

  const handleStarClick = (index: number) => {
    if (points[index]) return;
    if (index > 0 && !points[index - 1]) return;

    // Som de estrela/sino - tom cristalino
    playSound('./star.wav', 800 + (index * 100), 'triangle');

    const newPoints = [...points];
    newPoints[index] = true;
    setPoints(newPoints);
    haptic([10]);
    
    if (newPoints.every(p => p)) {
      // Som de constelação completa - arpejo mágico
      setTimeout(() => createSyntheticSound(523, 200), 0);   // C5
      setTimeout(() => createSyntheticSound(659, 200), 100); // E5
      setTimeout(() => createSyntheticSound(784, 200), 200); // G5
      setTimeout(() => createSyntheticSound(1047, 400), 300); // C6
      
      haptic([30, 50, 30]);
      setTimeout(onNext, 1500);
    }
  };

  const starCoords = [
    { top: '30%', left: '20%' }, 
    { top: '60%', left: '35%' }, 
    { top: '40%', left: '50%' }, 
    { top: '65%', left: '65%' },
    { top: '30%', left: '80%' }
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
        <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible filter drop-shadow-[0_0_8px_rgba(236,72,153,0.8)]">
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
            className={`absolute w-12 h-12 -ml-6 -mt-6 rounded-full flex items-center justify-center transition-all duration-500 ${points[i] ? 'bg-white shadow-[0_0_30px_white] scale-110' : 'bg-white/10 hover:bg-white/20 border border-white/30'}`}
            style={pos}
            onClick={() => handleStarClick(i)}
            whileTap={{ scale: 0.9 }}
          >
            <Star size={20} className={points[i] ? 'text-indigo-900 fill-indigo-900' : 'text-white'} />
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

const FeedLevel = React.forwardRef<HTMLDivElement, LevelProps>(({ onNext }, ref) => {
  const [hunger, setHunger] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [navigationCalled, setNavigationCalled] = useState(false);
  const haptic = useHaptic();

  const handleFeed = () => {
    if (isComplete || navigationCalled) return; 
    
    // Som de comer/mastigar - tom baixo e suave
    playSound('./eat.wav', 300, 'square');
    
    setHunger(prev => {
      const newVal = prev + 5; 
      if (newVal >= 100 && !navigationCalled) {
        setIsComplete(true);
        setNavigationCalled(true);
        haptic([50, 50]);
        
        // Som de sucesso/vitória - sequência ascendente
        setTimeout(() => createSyntheticSound(523, 150), 0);   // C5
        setTimeout(() => createSyntheticSound(659, 150), 150); // E5  
        setTimeout(() => createSyntheticSound(784, 300), 300); // G5
        
        // Garantir navegação para última tela
        setTimeout(() => {
          console.log('FeedLevel: Navegando para tela final...');
          onNext();
        }, 1200);
        return 100;
      }
      return newVal;
    });
    haptic([10]);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isComplete) {
        setHunger(h => Math.max(0, h - 1));
      }
    }, 150);
    return () => clearInterval(interval);
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

      <div className="relative w-64 h-8 bg-black/10 rounded-full overflow-hidden border-2 border-black/20 mb-12">
        <motion.div 
          className="h-full bg-red-500"
          style={{ width: `${hunger}%` }}
          animate={{ backgroundColor: hunger > 80 ? '#22c55e' : '#ef4444' }}
        />
      </div>

      <motion.button
        whileTap={!isComplete ? { scale: 0.9 } : {}}
        onClick={handleFeed}
        disabled={isComplete}
        className={`w-48 h-48 bg-white rounded-full flex items-center justify-center shadow-[0_10px_0_rgba(0,0,0,0.1)] transition-all border-4 border-yellow-600 ${isComplete ? 'opacity-50 cursor-not-allowed' : 'active:shadow-none active:translate-y-2'}`}
      >
        <Utensils size={80} className="text-yellow-600" />
      </motion.button>
      
      {isComplete && (
        <motion.div 
          initial={{ scale: 0 }} 
          animate={{ scale: 1 }} 
          className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-10"
        >
          <div className="bg-white p-8 rounded-3xl text-center shadow-2xl">
            <img src="./fome.png" className="w-full h-full object-cover" alt="Sticker" />
            <h3 className="text-2xl font-bold">Buchin Cheio!</h3>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
});

// --- Final Screen ---
const FinalLevel = React.forwardRef<HTMLDivElement, FinalLevelProps>(({ onRestart }, ref) => {
  const daysTogether = useDaysTogether(MEMORIES.campus.date);
  const [easterEggClicks, setEasterEggClicks] = useState(0);
  const [showQrCode, setShowQrCode] = useState(false);
  const [glitchMode, setGlitchMode] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false);
  const [terminalInput, setTerminalInput] = useState('');
  const [terminalError, setTerminalError] = useState(false);
  const [activeConfetti, setActiveConfetti] = useState<{ x: number; y: number } | null>(null); 
  const haptic = useHaptic();

  useEffect(() => {
    if (showTerminal || showQrCode) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [showTerminal, showQrCode]);

  const handleEasterEggClick = () => {
    if (glitchMode) {
      setShowTerminal(true);
      return;
    }

    const newCount = easterEggClicks + 1;
    setEasterEggClicks(newCount);
    
    haptic([10]);
    
    if (newCount === 5) {
      haptic([50, 100, 50, 100]);
      setGlitchMode(true);
    }
  };

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
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

  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanInput = terminalInput.toLowerCase().trim();
    
    // Comandos secretos
    if (cleanInput === 'surpresa') {
      setShowTerminal(false);
      setShowQrCode(true);
      setTerminalInput('');
    } 
    // Novo: Comando para escolher nível
    else if (cleanInput.startsWith('level ')) {
      const levelNumber = cleanInput.replace('level ', '').trim();
      const levels = ['intro', 'campus', 'newyear', 'distance', 'constellation', 'final'];
      const levelIndex = parseInt(levelNumber) - 1;
      
      if (levelIndex >= 0 && levelIndex < levels.length) {
        setShowTerminal(false);
        setTerminalInput('');
        // Aqui você pode implementar a lógica para pular para o nível
        haptic([30, 30, 30]);
        console.log(`Saltando para nível: ${levels[levelIndex]}`);
      } else {
        setTerminalError(true);
        haptic([50, 50]);
        setTimeout(() => setTerminalError(false), 500);
      }
    }
    // Comando de ajuda
    else if (cleanInput === 'help' || cleanInput === 'ajuda') {
      setTerminalInput('Comandos: surpresa, level [1-6], help');
      setTimeout(() => setTerminalInput(''), 2000);
    }
    else {
      setTerminalError(true);
      haptic([50, 50]);
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
      {/* Container de rolagem */}
      <div className="w-full h-full overflow-y-auto">
        {/* Fundo que acompanha a rolagem */}
        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-[#000000] via-[#1a103c] to-[#2a0845]" />
        <div className="absolute inset-0 w-full h-full bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        
        {/* Estrelas que acompanham a rolagem */}
        <div className="absolute inset-0 w-full h-full">
          <StarryBackground density={400} className="absolute inset-0 w-full h-full" />
          <StarryBackground density={150} className="absolute inset-0 w-full h-full" />
        </div>
      
      {activeConfetti && (
        <div className="confetti-container">
          <ConfettiExplosion x={`${activeConfetti.x}px`} y={`${activeConfetti.y}px`} />
        </div>
      )}

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
                ? 'bg-black border-green-500 text-green-400 font-mono animate-pulse hover:bg-gray-900' 
                : 'bg-white/5 backdrop-blur-md border-white/10 hover:bg-white/10 active:scale-95'
              }`}
          >
            {glitchMode ? <Terminal size={14} /> : <Clock size={16} className="text-pink-400" />}
            <span className={`font-bold tracking-widest uppercase ${glitchMode ? 'text-[10px]' : 'text-xs'}`}>
              {glitchMode ? '0x5375727072657361' : `${daysTogether} DIAS DE JOGO`}
            </span>
          </motion.div>
        </div>

        <div className="w-full max-w-md flex flex-col gap-16 px-2">
          {MEMORIES.gallery.map((mem, i) => {
            const rotation = i % 2 === 0 ? -3 : 3;
            const align = i % 2 === 0 ? 'self-start' : 'self-end';
            return (
              <motion.div 
                key={mem.id} 
                initial={{ opacity: 0, y: 50, rotate: rotation * 3 }} 
                animate={{ opacity: 1, y: 0, rotate: rotation }} 
                transition={{ delay: i * 0.2 + 0.5, type: "spring", stiffness: 100 }} 
                className={`relative bg-white p-3 pb-10 shadow-2xl max-w-[85%] ${align} transform hover:scale-105 transition-transform duration-300 z-10 hover:z-20 cursor-pointer`} 
                style={{ borderRadius: '2px' }}
                onClick={handleCardClick} 
              >
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
              </motion.div>
            );
          })}
        </div>

        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 2.5 }} className="mt-32 relative bg-[#fff9c4] text-gray-900 p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transform rotate-1 max-w-xs w-full font-serif cursor-pointer hover:scale-105 transition-transform duration-300" onClick={handleCardClick}>
           <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-red-500 shadow-md"></div>
           <TypewriterText text="Não importa a fase, o nível ou a dificuldade. Meu jogo favorito é viver a vida com você." delay={50} className="font-handwriting text-3xl leading-snug" />
           <p className="font-handwriting text-2xl text-pink-600 font-bold mt-6 text-right">- Te amo, Gaby.</p>
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
                <p>{'>'} SYSTEM BREACH DETECTED...</p>
                <p>{'>'} DECRYPTING HEX STRING [0x10]...</p>
                <p>{'>'} TARGET: 0x53 0x75 0x72 0x70 0x72 0x65 0x73 0x61</p>
              </div>
              <div className={`border border-green-500/50 p-6 rounded bg-black relative overflow-hidden ${terminalError ? 'animate-shake border-red-500' : ''}`}>
                 <form onSubmit={handleTerminalSubmit} className="space-y-4 relative z-10">
                   <label className="block text-green-400 text-sm tracking-wider uppercase mb-2">{terminalError ? <span className="text-red-500">ACCESS DENIED</span> : 'Enter Password:'}</label>
                   <div className="flex items-center border-b border-green-500/30 pb-2">
                     <span className="text-green-500 mr-2 blink">{'>'}</span>
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm" style={{ touchAction: 'none' }}>
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

      {/* Container de confetes fora da div de rolagem */}
      {activeConfetti && (
        <div className="confetti-container">
          <ConfettiExplosion x={`${activeConfetti.x}px`} y={`${activeConfetti.y}px`} />
        </div>
      )}
      
      </div>
    </motion.div>
  );
});

export default function App() {
  const [step, setStep] = useState(STEPS.INTRO);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  // Controle de hidratação
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  const nextStep = useCallback(() => {
    if (isTransitioning) return; // Previne cliques múltiplos
    
    setIsTransitioning(true);
    setStep(s => {
      const nextStepValue = s + 1;
      if (nextStepValue > STEPS.FINAL) {
        console.log('Tentativa de ir além da tela final, permanecendo em:', STEPS.FINAL);
        return STEPS.FINAL;
      }
      console.log('Avançando para step:', nextStepValue);
      return nextStepValue;
    });
    
    // Reset transition state after animation
    setTimeout(() => setIsTransitioning(false), 800);
  }, [isTransitioning]);
  
  const restart = useCallback(() => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    console.log('Reiniciando jogo');
    setStep(STEPS.INTRO);
    
    setTimeout(() => setIsTransitioning(false), 800);
  }, [isTransitioning]);

  // Aguarda hidratação antes de renderizar conteúdo com valores aleatórios
  if (!isMounted) {
    return (
      <div className="relative w-full h-screen bg-[#0f0c29] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen bg-[#0f0c29] overflow-hidden font-sans antialiased">
      {/* Debug: Indicador de step atual */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-4 left-4 z-[9999] bg-black/80 text-white text-xs px-2 py-1 rounded">
          Step: {step}/{STEPS.FINAL}
        </div>
      )}
      <BackgroundMusic />
      <AnimatePresence mode='wait'>
        {step === STEPS.INTRO && <IntroScreen key="intro" onStart={nextStep} />}
        {step === STEPS.LEVEL_1 && <CampusLevel key="level1" onNext={nextStep} />}
        {step === STEPS.LEVEL_2 && <NewYearLevel key="level2" onNext={nextStep} />}
        {step === STEPS.LEVEL_3 && <DistanceLevel key="level3" onNext={nextStep} />}
        {step === STEPS.LEVEL_4 && <ConstellationLevel key="level4" onNext={nextStep} />}
        {step === STEPS.LEVEL_5 && <FeedLevel key="level5" onNext={nextStep} />}
        {step === STEPS.FINAL && (
          <FinalLevel 
            key="final" 
            onRestart={() => {
              console.log('Reiniciando do FinalLevel');
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
        .player-pos { position: absolute; bottom: 8rem; }
        @keyframes fall { 0% { transform: translateY(0) rotate(0deg); opacity: 1; } 100% { transform: translateY(110vh) rotate(720deg); opacity: 0; } }
        @keyframes scanline { 0% { top: 0% } 100% { top: 100% } }
        .animate-scanline { animation: scanline 2s linear infinite; }
        .will-change-transform { will-change: transform; }
        .blink { animation: blink 1s step-end infinite; }
        @keyframes blink { 50% { opacity: 0; } }
        .confetti-container { 
          z-index: 10000 !important; 
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
        .animate-shake { animation: shake 0.2s ease-in-out 0s 2; }
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
  );
}