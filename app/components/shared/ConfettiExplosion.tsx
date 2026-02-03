'use client';

import React, { useEffect, useState } from "react";

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
    className={`absolute w-4 h-4 rounded-full ${particle.color} pointer-events-none shadow-lg`}
    style={{
      left: originX,
      top: originY,
      "--tx": `${particle.tx}px`,
      "--ty": `${particle.ty}px`,
      animation: `confettiExplode ${particle.duration}s cubic-bezier(0.25, 1, 0.5, 1) forwards`,
      animationDelay: `${particle.delay}s`,
      zIndex: 1
    } as React.CSSProperties}
  />
));
ConfettiParticle.displayName = "ConfettiParticle";

export const ConfettiExplosion = ({ x = "50%", y = "50%", instanceId = Math.random() }: { x?: string; y?: string; instanceId?: number }) => {
  const [particles, setParticles] = useState<Array<{id: number; color: string; tx: number; ty: number; duration: number; delay: number; rotation: number}>>([]);
  
  useEffect(() => {
    const newParticles = [...Array(250)].map((_, i) => {
      const angle = (Math.PI * 2 * i) / 250 + Math.random() * 0.5;
      const radius = Math.random() * 300 + 100;
      const tx = Math.cos(angle) * radius;
      const ty = Math.sin(angle) * radius - Math.random() * 200;
      
      return {
        id: instanceId * 1000 + i,
        color: ["bg-pink-500", "bg-purple-500", "bg-blue-400", "bg-yellow-400", "bg-white", "bg-red-500", "bg-green-500", "bg-orange-500", "bg-cyan-400", "bg-lime-400"][Math.floor(Math.random() * 10)],
        tx,
        ty,
        duration: Math.random() * 3 + 2.5,
        delay: Math.random() * 0.4,
        rotation: Math.random() * 360
      };
    });
    setParticles(newParticles);
    
    const cleanup = setTimeout(() => {
      setParticles([]);
    }, 6000);
    
    return () => clearTimeout(cleanup);
  }, [instanceId]);
  
  return (
    <>
      {particles.map((particle) => (
        <ConfettiParticle key={particle.id} particle={particle} originX={x} originY={y} />
      ))}
    </>
  );
};
