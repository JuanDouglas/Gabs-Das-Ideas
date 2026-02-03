'use client';

import React, { createContext, useContext } from "react";
import type { SoundContextType } from "../types/game";

export const SoundContext = createContext<SoundContextType>({
  soundEnabled: false,
  setSoundEnabled: () => {}
});

export const useSoundContext = () => useContext(SoundContext);
