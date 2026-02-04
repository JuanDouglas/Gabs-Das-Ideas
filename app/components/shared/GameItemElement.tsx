'use client';

import React from "react";
import { Bomb, Heart, Rocket } from "lucide-react";
import type { GameItem } from "../../types/game";

interface GameItemProps {
  item: GameItem;
}

export const GameItemElement = React.memo<GameItemProps>(({ item }) => (
  <div 
    className={`absolute pointer-events-none will-change-transform ${item.type === "bomb" ? "text-red-500" : "text-pink-500"}`}
    style={{ 
      transform: `translate3d(${item.x}vw, ${item.y}vh, 0)`, 
      left: 0,
      top: 0
    }}
  >
    {item.type === "bomb" ? (
      <Bomb size={28} className="fill-red-900/50 animate-pulse" />
    ) : (
      <Heart size={28} className="fill-pink-500/50" />
    )}
  </div>
));
GameItemElement.displayName = "GameItemElement";

interface PlayerElementProps {
  isDragging?: boolean;
  skin?: 'rocket' | 'plane';
}

export const PlayerElement = React.memo(React.forwardRef<HTMLDivElement, PlayerElementProps>(({ skin = 'rocket' }, ref) => {
  const getSkinIcon = () => {
    switch (skin) {
      case 'plane':
        return <div className="text-4xl transform rotate-90">✈️</div>;
      default:
        return <Rocket size={40} className="fill-indigo-500 text-indigo-300 rotate-[-45deg]" />;
    }
  };
  
  return (
    <div 
      ref={ref}
      className="player-pos text-white will-change-transform" 
      style={{
        position: "absolute",
        bottom: "8rem",
        transform: "translateX(-50%)",
        transition: "none"
      }}
    >
      {getSkinIcon()}
      {skin === 'rocket' && (
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-2 h-6 bg-orange-500/80 rounded-full blur-sm animate-pulse" />
      )}
      {skin === 'plane' && (
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-3 h-4 bg-gray-300/80 rounded-full blur-sm" />
      )}
    </div>
  );
}));
PlayerElement.displayName = "PlayerElement";
