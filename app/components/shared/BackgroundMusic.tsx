'use client';

import { useCallback, useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { MUSIC_URL } from "../../constants/game";
import { useSoundContext } from "../../context/SoundContext";
import { initializeAudio, playSound, setGlobalSoundEnabled } from "../../lib/audio";

export const BackgroundMusic = () => {
  const [playing, setPlaying] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { setSoundEnabled } = useSoundContext();

  useEffect(() => {
    setGlobalSoundEnabled(playing);
    setSoundEnabled(playing);
  }, [playing, setSoundEnabled]);

  useEffect(() => {
    const handleFirstInteraction = async () => {
      if (!userInteracted) {
        setUserInteracted(true);
        await initializeAudio();
      }
    };

    const events = ["touchstart", "click", "keydown"];
    events.forEach(event => {
      document.addEventListener(event, handleFirstInteraction, { once: true, passive: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleFirstInteraction);
      });
    };
  }, [userInteracted]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const audio = new Audio();
    audio.src = MUSIC_URL;
    audio.loop = true;
    audio.volume = 0.2;
    audio.preload = "metadata";
    audio.crossOrigin = "anonymous";
    
    const handleCanPlayThrough = () => {
      setLoaded(true);
      console.log("M??sica carregada com sucesso");
    };
    
    const handleLoadedMetadata = () => {
      setLoaded(true);
      console.log("Metadados da m??sica carregados");
    };
    
    const handleError = (e: Event) => {
      setError(true);
      console.warn("Falha ao carregar m??sica de fundo:", e);
    };

    const handleLoadedData = () => {
      setLoaded(true);
      console.log("Dados da m??sica carregados");
    };
    
    audio.addEventListener("canplaythrough", handleCanPlayThrough);
    audio.addEventListener("error", handleError);
    audio.addEventListener("loadeddata", handleLoadedData);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    
    audio.load();
    audioRef.current = audio;
    
    return () => {
      audio.removeEventListener("canplaythrough", handleCanPlayThrough);
      audio.removeEventListener("error", handleError);
      audio.removeEventListener("loadeddata", handleLoadedData);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  const togglePlay = useCallback(async () => {
    if (!audioRef.current || !loaded || error) return;
    
    playSound("./button.wav", 500, "sine");
    
    try {
      if (playing) {
        audioRef.current.pause();
        setPlaying(false);
      } else {
        try {
          await audioRef.current.play();
          setPlaying(true);
        } catch (playError) {
          console.warn("Erro ao reproduzir música:", playError);
          
          setTimeout(async () => {
            try {
              await audioRef.current!.play();
              setPlaying(true);
            } catch (retryError) {
              console.error("Falha definitiva ao reproduzir música:", retryError);
              setError(true);
            }
          }, 100);
        }
      }
    } catch (err) {
      console.warn("Erro no controle de música:", err);
      setError(true);
    }
  }, [playing, loaded, error]);

  if (error) return null;

  return (
    <button
      onClick={togglePlay}
      disabled={!loaded}
      className="fixed top-4 right-4 z-[60] bg-white/10 backdrop-blur-md p-3 rounded-full text-white/70 hover:text-white hover:bg-white/20 active:scale-95 active:bg-white/30 transition-all duration-200 shadow-lg border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation select-none"
      aria-label={playing ? "Pausar música de fundo" : "Tocar música de fundo"}
      style={{ 
        WebkitTapHighlightColor: "transparent",
        touchAction: "manipulation"
      }}
    >
      {!loaded ? (
        <div className="w-5 h-5 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
      ) : error ? (
        <VolumeX size={20} className="text-red-400" />
      ) : playing ? (
        <Volume2 size={20} className="text-green-400 animate-pulse" />
      ) : (
        <VolumeX size={20} className="text-white/70" />
      )}
    </button>
  );
};
