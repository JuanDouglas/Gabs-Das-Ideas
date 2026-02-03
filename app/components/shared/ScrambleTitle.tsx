'use client';

import { useEffect, useState } from "react";

export const ScrambleTitle = ({ text, trigger }: { text: string; trigger: boolean }) => {
  const [displayText, setDisplayText] = useState(text);
  const chars = "!@#$%^&*()_+-=[]{}|;:,.<>?";
  
  useEffect(() => {
    if (!trigger) return;
    
    let iterations = 0;
    const interval = setInterval(() => {
      setDisplayText(prev => 
        text.split("").map((char, i) => {
          if (i < iterations) return text[i];
          return chars[Math.floor(Math.random() * chars.length)];
        }).join("")
      );
      
      if (iterations >= text.length) {
        clearInterval(interval);
        setDisplayText(text);
      }
      iterations++;
    }, 30);
    
    return () => clearInterval(interval);
  }, [trigger, text]);
  
  return <span>{displayText}</span>;
};
