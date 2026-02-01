'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Gamepad2, Heart, MapPin, Sparkles, Zap, ChevronRight, Star, Trophy, Rocket, Calendar, Volume2, VolumeX, Clock, Gift, X, Terminal, Lock } from 'lucide-react';

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

// URL do QR Code (Substitua pela imagem real do seu QR Code)
const QR_CODE_URL = "./qrcode.png"; 

const MUSIC_URL = "https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3"; 

const STEPS = {
  INTRO: 0,
  LEVEL_1: 1,
  LEVEL_2: 2,
  LEVEL_3: 3,
  LEVEL_4: 4,
  FINAL: 5
};

// Configuração de Transição Suave
const pageVariants = {
  initial: { opacity: 0, scale: 0.95, filter: "blur(10px)" },
  animate: { opacity: 1, scale: 1, filter: "blur(0px)" },
  exit: { opacity: 0, scale: 1.05, filter: "blur(10px)" }
};
const pageTransition = { duration: 1.2, ease: [0.22, 1, 0.36, 1]};

// --- Utilities ---

const useHaptic = () => {
  const trigger = (pattern = [10]) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  };
  return trigger;
};

interface TypewriterTextProps {
  text: string;
  delay?: number;
  className?: string;
}

const TypewriterText = ({
  text,
  delay = 50,
  className
}: TypewriterTextProps) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setDisplayedText(text.slice(0, index + 1));
      index++;
      if (index >= text.length) clearInterval(interval);
    }, delay);
    return () => clearInterval(interval);
  }, [text, delay]);

  return <span className={className}>{displayedText}</span>;
};

// Componentes Memoizados para evitar re-render desnecessário
const HeartElement = React.memo(({ heart }: { heart: Heart }) => (
  <div 
    className="heart-pos text-pink-500" 
    style={{ 
      '--heart-left': `${heart.x}%`, 
      '--heart-top': `${heart.y}%` 
    } as React.CSSProperties}
  >
    <Heart size={24} className="fill-pink-500/50" />
  </div>
));
HeartElement.displayName = 'HeartElement';

const PlayerElement = React.memo(({ x }: { x: number }) => (
  <div 
    className="player-pos text-white" 
    style={{ 
      '--player-left': `${x}%` 
    } as React.CSSProperties}
  >
    <Rocket size={40} className="fill-indigo-500 text-indigo-300 rotate-[-45deg]" />
  </div>
));
PlayerElement.displayName = 'PlayerElement';

const StarElement = React.memo(({ top, left, delay }: { top: number; left: number; delay: number }) => (
  <div 
    className="star-pos" 
    style={{ 
      '--star-top': `${top}%`, 
      '--star-left': `${left}%`, 
      '--star-delay': `${delay}s` 
    } as React.CSSProperties} 
  />
));
StarElement.displayName = 'StarElement';

interface Heart {
  id: number;
  x: number;
  y: number;
}

interface IntroScreenProps {
  onStart: () => void;
}

interface LevelProps {
  onNext: () => void;
}

interface FinalLevelProps {
  onRestart: () => void;
}

const useDaysTogether = (startDate: string | Date) => {
  const [days, setDays] = useState(0);

  useEffect(() => {
    const today = new Date();
    const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
    const diffTime = today.getTime() - start.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    setDays(diffDays);
  }, [startDate]);

  return days;
};

// --- Componentes Auxiliares ---

const BackgroundMusic = () => {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const audio = new Audio(MUSIC_URL);
    audio.loop = true;
    audio.volume = 0.4;
    audioRef.current = audio;
    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (playing) audioRef.current.pause();
    else audioRef.current.play().catch(() => {});
    setPlaying(!playing);
  };

  return (
    <button
      onClick={togglePlay}
      className="fixed top-4 right-4 z-[60] bg-white/10 backdrop-blur-md p-3 rounded-full text-white/70 hover:text-white hover:bg-white/20 transition-all shadow-lg border border-white/10"
    >
      {playing ? <Volume2 size={20} className="text-green-400" /> : <VolumeX size={20} />}
    </button>
  );
};

const ConfettiParticle = React.memo(({ particle }: { particle: { id: number; color: string; left: number; duration: number; delay: number } }) => (
  <div
    className={`confetti-particle w-2 h-2 rounded-full ${particle.color}`}
    style={{
      '--particle-left': `${particle.left}%`,
      '--particle-duration': `${particle.duration}s`,
      '--particle-delay': `${particle.delay}s`
    } as React.CSSProperties}
  />
));
ConfettiParticle.displayName = 'ConfettiParticle';

const ConfettiExplosion = () => {
  const particles = useMemo(() => [...Array(50)].map((_, i) => ({
    id: i,
    color: ['bg-pink-500', 'bg-purple-500', 'bg-cyan-400', 'bg-yellow-400'][Math.floor(Math.random() * 4)],
    left: Math.random() * 100,
    duration: Math.random() * 3 + 2,
    delay: Math.random() * 5
  })), []);
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((particle) => (
        <ConfettiParticle key={particle.id} particle={particle} />
      ))}
      <style>{`@keyframes fall { 0% { transform: translateY(0) rotate(0deg); opacity: 1; } 100% { transform: translateY(110vh) rotate(720deg); opacity: 0; } }`}</style>
    </div>
  );
};

// --- Telas do Jogo ---

const IntroScreen = React.forwardRef<HTMLDivElement, IntroScreenProps>(({ onStart }, ref) => {
  const [gameWon, setGameWon] = useState(false);
  const [score, setScore] = useState(0);
  const [playerX, setPlayerX] = useState(50);
  const [hearts, setHearts] = useState<Heart[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
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
  }, []);

  useEffect(() => {
    if (gameWon) return;
    const spawnInterval = setInterval(() => {
      const id = Math.random();
      setHearts(prev => [...prev, { id, x: Math.random() * 90 + 5, y: -10 }]);
    }, 800);
    const gameLoop = setInterval(() => {
      setHearts(prev => {
        const nextHearts = prev.map(h => ({ ...h, y: h.y + 1.5 })).filter(h => h.y < 100);
        nextHearts.forEach(h => {
          if (h.y > 80 && h.y < 95 && Math.abs(h.x - playerX) < 10) {
            haptic([10]);
            setScore(s => {
              const newScore = s + 1;
              if (newScore >= 3) { setGameWon(true); haptic([50, 50, 50]); }
              return newScore;
            });
            h.y = 110;
          }
        });
        return nextHearts.filter(h => h.y <= 100);
      });
    }, 20);
    return () => { clearInterval(spawnInterval); clearInterval(gameLoop); };
  }, [playerX, gameWon]);

  const handleMove = (clientX: number) => {
    if (!containerRef.current || gameWon) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    setPlayerX(Math.min(95, Math.max(5, x)));
  };

  return (
    <motion.div 
      ref={setCombinedRef}
      className="absolute inset-0 w-full h-full flex flex-col items-center justify-center p-6 text-white overflow-hidden touch-none z-50"
      variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition}
      onMouseMove={(e) => handleMove(e.clientX)}
      onTouchMove={(e) => handleMove(e.touches[0].clientX)}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] -z-10" />
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }} className="absolute top-[-20%] right-[-20%] w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

      {!gameWon ? (
        <>
          <div className="absolute top-10 text-center pointer-events-none z-20">
            <h2 className="text-pink-400 font-bold tracking-widest text-xs uppercase animate-pulse">Catch 3 Hearts</h2>
            <div className="flex gap-2 justify-center mt-2">
              {[...Array(3)].map((_, i) => (
                <Heart key={i} size={20} className={`${i < score ? 'fill-pink-500 text-pink-500' : 'text-white/20'}`} />
              ))}
            </div>
          </div>
          {hearts.map(h => (
            <HeartElement key={h.id} heart={h} />
          ))}
          <PlayerElement x={playerX} />
          <div className="absolute bottom-4 text-white/30 text-xs pointer-events-none">Arraste para mover</div>
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
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onStart} className="px-10 py-4 bg-white text-indigo-900 font-bold rounded-2xl flex items-center gap-3 shadow-xl">
            START STORY <ChevronRight />
          </motion.button>
          
          {/* DICA CTF ADICIONADA AQUI */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 0.6 }} 
            transition={{ delay: 2.5 }}
            className="mt-6 font-mono text-[10px] text-green-400/80 tracking-widest border-t border-green-500/30 pt-2"
          >
             {'>'} SYSTEM_MSG: Glitch detected in [DAYS_COUNTER] at final sequence.
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
          <button onClick={onNext} className="p-4 bg-pink-500 rounded-full text-white hover:bg-pink-600 transition-all shadow-lg shadow-pink-500/30" aria-label="Próximo nível"><ChevronRight size={24} /></button>
        </motion.div>
      </div>
    </motion.div>
  );
});

const NewYearLevel = React.forwardRef<HTMLDivElement, LevelProps>(({ onNext }, ref) => {
  const [score, setScore] = useState(0);
  const maxScore = 5;
  const haptic = useHaptic();

  const handleTap = (e: React.MouseEvent) => {
    if (score >= maxScore) return;
    haptic([5]);
    setScore(s => s + 1);
    const heart = document.createElement('div');
    heart.innerHTML = '✨';
    heart.className = 'fixed text-2xl z-50 pointer-events-none animate-bounce-up opacity-0';
    heart.style.left = `${e.clientX}px`;
    heart.style.top = `${e.clientY}px`;
    document.body.appendChild(heart);
    setTimeout(() => heart.remove(), 1000);
  };

  useEffect(() => {
    if (score >= maxScore) setTimeout(onNext, 1500);
  }, [score, onNext]);

  return (
    <motion.div 
      ref={ref}
      className="absolute inset-0 w-full h-full bg-[#2d1b4e] flex flex-col items-center justify-center p-6 text-center cursor-pointer select-none"
      onClick={handleTap}
      variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition}
    >
      <div className="absolute top-10 flex gap-2 z-20">
        {[...Array(maxScore)].map((_, i) => (
          <motion.div key={i} animate={{ scale: i < score ? 1 : 0.5, opacity: i < score ? 1 : 0.3 }} className={`w-4 h-4 rounded-full ${i < score ? 'bg-yellow-400 shadow-[0_0_10px_#facc15]' : 'bg-gray-600'}`} />
        ))}
      </div>
      <div className="z-10 pointer-events-none w-full max-w-sm">
        {score < maxScore ? (
          <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}>
            <h2 className="text-4xl font-black text-white mb-2 tracking-tighter">TAP TO PARTY!</h2>
            <p className="text-purple-300">Recrie a energia do Ano Novo</p>
          </motion.div>
        ) : (
          <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20 mx-auto">
            <div className="relative aspect-video w-full rounded-xl overflow-hidden mb-4 shadow-lg"><img src={MEMORIES.newYear.url} className="w-full h-full object-cover" alt={MEMORIES.newYear.title} /></div>
            <h2 className="text-xl font-bold text-white mb-1">Momentos Brilhantes</h2>
            <p className="text-sm text-gray-200">Risadas sinceras valem mais que qualquer código.</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
});

const DistanceLevel = React.forwardRef<HTMLDivElement, LevelProps>(({ onNext }, ref) => {
  const [completed, setCompleted] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const width = useTransform(x, value => `${value}px`);
  const haptic = useHaptic();
  
  const handleDragEnd = () => {
    if (!trackRef.current) return;
    const threshold = (trackRef.current.offsetWidth - 48) * 0.85;
    if (x.get() > threshold) {
      setCompleted(true);
      haptic([30, 30]);
      setTimeout(onNext, 1200);
    }
  };

  return (
    <motion.div 
      ref={ref}
      className="absolute inset-0 w-full h-full bg-[#1e1e24] flex flex-col items-center justify-center p-8 text-white relative"
      variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition}
    >
      <div className="w-full max-w-md text-center space-y-12">
        <div>
          <div className="inline-block p-3 bg-red-500/20 rounded-2xl mb-4"><MapPin className="text-red-500" size={32} /></div>
          <h2 className="text-3xl font-bold mb-2">Boss Fight: Distância</h2>
          <p className="text-gray-400 text-sm max-w-xs mx-auto">A distância tenta atrapalhar, mas nosso multiplayer é cooperativo.</p>
        </div>
        <div ref={trackRef} className="relative h-16 bg-black/40 rounded-full border border-white/10 p-2 flex items-center overflow-hidden">
          <motion.div className="absolute left-2 top-2 bottom-2 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full opacity-50" style={{ width: completed ? "calc(100% - 16px)" : width }} />
          <div className="absolute w-full text-center pointer-events-none text-white/20 text-xs font-bold uppercase tracking-widest animate-pulse">Slide to Connect</div>
          <motion.div style={{ x }} drag="x" dragConstraints={trackRef} dragElastic={0.05} dragMomentum={false} onDragEnd={handleDragEnd} whileDrag={{ scale: 1.1 }} className="relative z-10 w-12 h-12 bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,0.4)] flex items-center justify-center cursor-grab active:cursor-grabbing">
            <Zap className={`text-indigo-900 ${completed ? 'fill-indigo-900' : ''}`} size={20} />
          </motion.div>
        </div>
        {completed && <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex items-center justify-center gap-2 text-green-400 font-bold"><Sparkles size={18} /><span>CONNECTED!</span></motion.div>}
      </div>
    </motion.div>
  );
});

const ConstellationLevel = React.forwardRef<HTMLDivElement, LevelProps>(({ onNext }, ref) => {
  const [points, setPoints] = useState([false, false, false]); // 3 Estrelas
  const haptic = useHaptic();

  // Otimização: Gera as estrelas APENAS UMA VEZ
  const stars = useMemo(() => [...Array(20)].map(() => ({
    top: Math.random() * 100,
    left: Math.random() * 100,
    delay: Math.random()
  })), []);

  const handleStarClick = (index: number) => {
    if (points[index]) return;
    const newPoints = [...points];
    newPoints[index] = true;
    setPoints(newPoints);
    haptic([10]);
    
    if (newPoints.every(p => p)) {
      haptic([30, 50, 30]);
      setTimeout(onNext, 1500);
    }
  };

  return (
    <motion.div
      ref={ref}
      className="absolute inset-0 w-full h-full bg-slate-900 flex flex-col items-center justify-center p-6 text-white"
      variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition}
    >
      <div className="absolute inset-0 opacity-40">
        {stars.map((star, i) => (
          <StarElement key={i} top={star.top} left={star.left} delay={star.delay} />
        ))}
      </div>

      <div className="z-10 text-center mb-12">
        <h2 className="text-3xl font-serif text-pink-300 mb-2">Constelação</h2>
        <p className="text-gray-400 text-sm">Mesmo longe, olhamos para o mesmo céu.</p>
        <p className="text-xs text-white/30 mt-2">(Conecte as estrelas)</p>
      </div>

      <div className="relative w-64 h-64 mx-auto">
        <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
          {points[0] && points[1] && <motion.line initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} x1="50%" y1="20%" x2="20%" y2="80%" stroke="rgba(236,72,153,0.5)" strokeWidth="2" />}
          {points[1] && points[2] && <motion.line initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} x1="20%" y1="80%" x2="80%" y2="80%" stroke="rgba(236,72,153,0.5)" strokeWidth="2" />}
          {points[2] && points[0] && <motion.line initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} x1="80%" y1="80%" x2="50%" y2="20%" stroke="rgba(236,72,153,0.5)" strokeWidth="2" />}
        </svg>

        {[
          { top: '20%', left: '50%' }, // Topo
          { top: '80%', left: '20%' }, // Esq
          { top: '80%', left: '80%' }  // Dir
        ].map((pos, i) => (
          <motion.button
            key={i}
            className={`absolute w-12 h-12 -ml-6 -mt-6 rounded-full flex items-center justify-center transition-all ${points[i] ? 'bg-pink-500 shadow-[0_0_20px_#ec4899]' : 'bg-white/10 hover:bg-white/30'}`}
            style={pos}
            onClick={() => handleStarClick(i)}
            whileTap={{ scale: 0.9 }}
          >
            <Star size={20} className={points[i] ? 'text-white fill-white' : 'text-gray-300'} />
          </motion.button>
        ))}

        {points.every(p => p) && (
          <motion.div 
            initial={{ scale: 0, opacity: 0 }} 
            animate={{ scale: 1.5, opacity: 1 }} 
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <Heart size={100} className="text-pink-500/20 fill-pink-500/20 blur-xl" />
          </motion.div>
        )}
      </div>
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
  const haptic = useHaptic();

  const handleEasterEggClick = () => {
    if (glitchMode) {
      setShowTerminal(true);
      return;
    }

    const newCount = easterEggClicks + 1;
    setEasterEggClicks(newCount);
    
    // Feedback visual a cada clique
    haptic([10]);
    
    if (newCount === 5) {
      haptic([50, 100, 50, 100]); // Glitch vibration
      setGlitchMode(true);
    }
  };

  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanInput = terminalInput.toLowerCase().trim();
    if (cleanInput === 'surpresa') {
      setShowTerminal(false);
      setShowQrCode(true);
      setTerminalInput('');
    } else {
      setTerminalError(true);
      haptic([50, 50]);
      setTimeout(() => setTerminalError(false), 500);
    }
  };

  return (
    <motion.div 
      ref={ref}
      className="absolute inset-0 w-full min-h-full bg-gradient-to-b from-[#1a103c] to-[#0f0c29] text-white overflow-y-auto"
      variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition}
    >
      <ConfettiExplosion />
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 50, repeat: Infinity, ease: "linear" }} className="fixed top-10 left-[-20px] text-pink-500/20 pointer-events-none"><Star size={120} fill="currentColor" /></motion.div>
      <div className="flex flex-col items-center p-6 pb-32 max-w-lg mx-auto relative z-10">
        <div className="text-center mt-10 mb-12 relative">
          <motion.h1 initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="font-handwriting text-6xl md:text-7xl text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-300 transform -rotate-6">Nosso Universo</motion.h1>
          
          {/* BOTÃO SECRETO / GLITCH */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 1 }} 
            onClick={handleEasterEggClick}
            className={`mt-4 px-4 py-2 rounded-full inline-flex items-center gap-2 border transform rotate-2 cursor-pointer transition-all select-none
              ${glitchMode 
                ? 'bg-black/80 border-green-500/50 text-green-400 font-mono animate-pulse hover:bg-black' 
                : 'bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 active:scale-95'
              }`}
          >
            {glitchMode ? <Terminal size={14} /> : <Clock size={16} className="text-pink-400" />}
            <span className={`font-bold tracking-widest uppercase ${glitchMode ? 'text-[10px]' : 'text-xs'}`}>
              {glitchMode ? '0x5375727072657361' : `${daysTogether} DIAS DE JOGO`}
            </span>
          </motion.div>
          
        </div>
        <div className="w-full flex flex-col gap-12 px-4">
          {MEMORIES.gallery.map((mem, i) => {
            const rotation = i % 2 === 0 ? -6 : 6;
            const align = i % 2 === 0 ? 'self-start' : 'self-end';
            return (
              <motion.div key={mem.id} initial={{ opacity: 0, y: 50, rotate: rotation * 2 }} animate={{ opacity: 1, y: 0, rotate: rotation }} transition={{ delay: i * 0.2 + 0.5, type: "spring" }} className={`relative bg-white p-3 pb-8 shadow-2xl max-w-[80%] ${align}`} style={{ borderRadius: '4px' }}>
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 bg-pink-500/40 backdrop-blur-sm transform -rotate-2 mask-tape"></div>
                <div className="aspect-square w-full overflow-hidden bg-gray-100 filter contrast-110"><img src={mem.url} className="w-full h-full object-cover" alt={mem.title} /></div>
                <div className="mt-4 text-center relative">
                   <p className="font-handwriting text-gray-800 font-bold text-2xl transform -rotate-1">{mem.title}</p>
                   <p className="font-handwriting text-gray-500 text-lg mt-1">{mem.date}</p>
                   {i === 0 && <Heart className="absolute -right-2 top-0 text-red-500 w-4 h-4" fill="currentColor" />}
                   {i === 1 && <Star className="absolute -left-2 top-2 text-yellow-500 w-4 h-4" fill="currentColor" />}
                </div>
              </motion.div>
            );
          })}
        </div>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 2.5 }} className="mt-20 relative bg-[#fff9c4] text-gray-800 p-8 shadow-lg transform rotate-2 max-w-xs w-full">
           <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-red-500 shadow-md"></div>
           <TypewriterText text="Não importa a fase, o nível ou a dificuldade. Meu jogo favorito é viver a vida com você." delay={50} className="font-handwriting text-2xl leading-relaxed" />
           <p className="font-handwriting text-xl text-pink-600 font-bold mt-4 text-right">- Te amo, Gaby.</p>
        </motion.div>
        <button onClick={onRestart} className="mt-16 px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full font-bold text-sm transition-all border border-white/20 backdrop-blur-md flex items-center gap-2 group">
          <Gamepad2 size={18} className="group-hover:rotate-12 transition-transform" />Reiniciar Jogo
        </button>
      </div>

      {/* TERMINAL MODAL (HACKER) */}
      <AnimatePresence>
        {showTerminal && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/95 font-mono"
          >
            <div className="w-full max-w-md space-y-4">
              <div className="text-green-500 text-xs mb-4">
                <p>{'>'} SYSTEM BREACH DETECTED</p>
                <p>{'>'} DECRYPTING HEX STRING...</p>
                <p>{'>'} 0x53 0x75 0x72 0x70 0x72 0x65 0x73 0x61</p>
              </div>
              
              <div className={`border border-green-500/50 p-6 rounded bg-black relative overflow-hidden ${terminalError ? 'animate-shake border-red-500' : ''}`}>
                 <div className="absolute top-0 left-0 w-full h-1 bg-green-500/20 animate-scanline pointer-events-none"></div>
                 
                 <form onSubmit={handleTerminalSubmit} className="space-y-4">
                   <label className="block text-green-400 text-sm tracking-wider uppercase mb-2">
                     {terminalError ? <span className="text-red-500">ACCESS DENIED</span> : 'Enter Decrypted Password:'}
                   </label>
                   <div className="flex items-center border-b border-green-500/30 pb-2">
                     <span className="text-green-500 mr-2">{'>'}</span>
                     <input 
                       type="text" 
                       autoFocus
                       value={terminalInput}
                       onChange={(e) => setTerminalInput(e.target.value)}
                       className="bg-transparent border-none outline-none text-green-400 w-full font-bold uppercase placeholder-green-900"
                       placeholder="TYPE HERE..."
                     />
                   </div>
                   <button type="submit" className="w-full bg-green-900/20 hover:bg-green-900/40 text-green-400 border border-green-500/50 py-2 text-xs uppercase tracking-widest transition-colors">
                     Unlock System
                   </button>
                 </form>
              </div>
              <button onClick={() => setShowTerminal(false)} className="text-gray-500 text-xs hover:text-white mt-4 w-full text-center">
                [ ABORT MISSION ]
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* EASTER EGG MODAL (QR CODE) */}
      <AnimatePresence>
        {showQrCode && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[70] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.8, y: 50 }} 
              animate={{ scale: 1, y: 0 }} 
              className="bg-white text-gray-900 p-8 rounded-3xl max-w-sm w-full relative shadow-2xl border-4 border-pink-400"
            >
              <button 
                onClick={() => setShowQrCode(false)} 
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-800"
                aria-label="Fechar QR Code"
              >
                <X size={24} />
              </button>
              
              <div className="text-center space-y-4">
                 <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Gift size={32} className="text-pink-600" />
                 </div>
                 
                 <h2 className="text-2xl font-black text-pink-600 uppercase tracking-tighter">Missão Secreta!</h2>
                 <p className="font-medium text-gray-600">
                   Prepare-se para... <br/>
                   <span className="text-pink-600 font-bold bg-pink-100 px-2 rounded inline-block mt-1">algo especial.</span>
                 </p>
                 
                 <div className="border-2 border-dashed border-gray-300 p-4 rounded-xl bg-gray-50 my-6">
                    <img src={QR_CODE_URL} alt="QR Code Surpresa" className="w-full aspect-square object-contain mix-blend-multiply opacity-90" />
                 </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global CSS for Shake Animation */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake { animation: shake 0.2s ease-in-out 0s 2; }
      `}</style>
    </motion.div>
  );
});

export default function App() {
  const [step, setStep] = useState(STEPS.INTRO);
  const nextStep = () => setStep(s => s + 1);
  const restart = () => setStep(STEPS.INTRO);

  return (
    <div className="relative w-full h-screen bg-[#0f0c29] overflow-hidden font-sans antialiased">
      <BackgroundMusic />
      <AnimatePresence mode='wait'>
        {step === STEPS.INTRO && <IntroScreen key="intro" onStart={nextStep} />}
        {step === STEPS.LEVEL_1 && <CampusLevel key="level1" onNext={nextStep} />}
        {step === STEPS.LEVEL_2 && <NewYearLevel key="level2" onNext={nextStep} />}
        {step === STEPS.LEVEL_3 && <DistanceLevel key="level3" onNext={nextStep} />}
        {step === STEPS.LEVEL_4 && <ConstellationLevel key="level4" onNext={nextStep} />}
        {step === STEPS.FINAL && <FinalLevel key="final" onRestart={restart} />}
      </AnimatePresence>
      <style>{`
        @keyframes bounce-up { 0% { transform: translateY(0) scale(0.5); opacity: 1; } 100% { transform: translateY(-100px) scale(1.5); opacity: 0; } }
        .animate-bounce-up { animation: bounce-up 0.8s ease-out forwards; }
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&display=swap');
        .font-handwriting { font-family: 'Caveat', cursive; }
        .heart-pos { position: absolute; pointer-events: none; left: var(--heart-left, 0); top: var(--heart-top, 0); }
        .player-pos { position: absolute; bottom: 2.5rem; transition: all 75ms; transform: translateX(-50%); left: var(--player-left, 0); }
        .star-pos { position: absolute; background: white; border-radius: 50%; width: 0.25rem; height: 0.25rem; animation: pulse 2s infinite; top: var(--star-top, 0); left: var(--star-left, 0); animation-delay: var(--star-delay, 0s); }
        .confetti-particle { position: absolute; top: -5%; left: var(--particle-left, 0); animation: fall var(--particle-duration, 3s) linear infinite; animation-delay: var(--particle-delay, 0s); }
        @keyframes fall { 0% { transform: translateY(0) rotate(0deg); opacity: 1; } 100% { transform: translateY(110vh) rotate(720deg); opacity: 0; } }
        @keyframes scanline { 0% { top: 0% } 100% { top: 100% } }
        .animate-scanline { animation: scanline 2s linear infinite; }
      `}</style>
    </div>
  );
}