import type { LoreKey } from "../constants/game";

export interface SoundContextType {
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
}

export interface LoreProps {
  onNext: () => void;
  loreKey: LoreKey;
}

export interface LoreData {
  chapter: string;
  title: string;
  image: string;
  date: string;
  text: string;
}

export interface GameItem {
  id: number;
  x: number;
  y: number;
  type: "heart" | "bomb";
}

export interface Memory {
  id: number;
  url: string;
  date: string;
  title: string;
}

export interface LevelProps {
  onNext: () => void;
}

export interface IntroScreenProps {
  onStart: () => void;
}

export interface FinalLevelProps {
  onRestart: () => void;
}
