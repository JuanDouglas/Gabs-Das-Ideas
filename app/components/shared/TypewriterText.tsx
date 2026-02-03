'use client';

import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useHaptic } from "../../hooks/useHaptic";

export const TypewriterText = React.memo(({
  text,
  delay = 40,
  className,
  onComplete,
  showCursor = true,
  glowEffect = false
}: {
  text: string;
  delay?: number;
  className?: string;
  onComplete?: () => void;
  showCursor?: boolean;
  glowEffect?: boolean;
}) => {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { trigger } = useHaptic();
  const triggerRef = useRef(trigger);
  
  useEffect(() => {
    triggerRef.current = trigger;
  }, [trigger]);

  const startTyping = useCallback(() => {
    setDisplayedText("");
    setIsTyping(true);
    let index = 0;
    
    intervalRef.current = setInterval(() => {
      setDisplayedText(text.slice(0, index + 1));
      
      if (index % 8 === 0) triggerRef.current("click");
      
      index++;
      
      if (index >= text.length) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        setIsTyping(false);
        triggerRef.current("light");
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

  return (
    <span className={`${className} ${glowEffect ? "text-shadow-glow" : ""}`}>
      {displayedText}
      {showCursor && (
        <motion.span 
          className="inline-block ml-1 bg-current w-[2px] h-[1em]" 
          animate={{ opacity: isTyping ? [1, 0] : [1, 0, 1, 0] }}
          transition={{ 
            duration: isTyping ? 0.5 : 0.8, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        />
      )}
    </span>
  );
});

TypewriterText.displayName = "TypewriterText";
