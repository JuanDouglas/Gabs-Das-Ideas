'use client';

let globalSoundEnabled = false;
let audioContext: AudioContext | null = null;
let isAudioInitialized = false;

export const setGlobalSoundEnabled = (enabled: boolean) => {
  globalSoundEnabled = enabled;
};

export const isSoundEnabled = () => globalSoundEnabled;

export const initializeAudio = async () => {
  if (isAudioInitialized) return;
  
  try {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    if (audioContext.state === "suspended") {
      await audioContext.resume();
    }
    
    isAudioInitialized = true;
    console.log("Audio inicializado com sucesso");
  } catch (err) {
    console.warn("Falha ao inicializar audio:", err);
  }
};

export const createSyntheticSound = (frequency: number, duration: number = 200, type: OscillatorType = "sine") => {
  if (!globalSoundEnabled || !audioContext) return;
  
  try {
    if (audioContext.state === "suspended") {
      audioContext.resume();
    }
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    oscillator.type = type;
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + duration / 1000);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration / 1000);
  } catch (err) {
    console.log("Synthetic sound failed:", err);
  }
};

export const playSound = async (filename: string, fallbackFreq: number = 440, fallbackType: OscillatorType = "sine") => {
  if (!globalSoundEnabled) return;
  
  if (!isAudioInitialized) {
    await initializeAudio();
  }
  
  if (filename.includes("dale.wav") || filename.includes("melhore.wav")) {
    try {
      const audio = new Audio(filename);
      audio.volume = 0.5;
      audio.load();
      await audio.play();
    } catch (err) {
      createSyntheticSound(fallbackFreq, 200, fallbackType);
    }
  } else {
    createSyntheticSound(fallbackFreq, 200, fallbackType);
  }
};
