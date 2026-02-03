'use client';

import { useEffect, useState } from "react";

export const useDaysTogether = (startDate: string) => {
  const [days, setDays] = useState(0);
  
  useEffect(() => {
    const calculateDays = () => {
      const today = new Date();
      const start = typeof startDate === "string" ? new Date(startDate) : startDate;
      const diffTime = today.getTime() - start.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      setDays(diffDays);
    };
    
    calculateDays();
    const interval = setInterval(calculateDays, 60000 * 60 * 24);
    return () => clearInterval(interval);
  }, [startDate]);
  
  return days;
};
