'use client';

import { useCallback, useMemo } from "react";

export const useHaptic = () => {
  const patterns = useMemo(() => ({
    light: [10],
    medium: [20],
    heavy: [50],
    success: [50, 30, 50],
    error: [100, 50, 100, 50, 100],
    heartbeat: [25, 25],
    explosion: [200, 100, 200],
    click: [5],
    longPress: [30, 50, 30],
    notification: [10, 10, 10],
    celebration: [50, 50, 50, 50, 50]
  }), []);
  
  const trigger = useCallback((patternName: keyof typeof patterns | number[] = "light") => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      const pattern = Array.isArray(patternName) ? patternName : patterns[patternName] || patterns.light;
      navigator.vibrate(pattern);
    }
  }, [patterns]);
  
  return useMemo(() => ({ trigger, patterns }), [trigger, patterns]);
};
