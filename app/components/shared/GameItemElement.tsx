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

export const PlayerElement = React.memo(React.forwardRef<HTMLDivElement, { isDragging?: boolean }>((props, ref) => (
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
    <Rocket size={40} className="fill-indigo-500 text-indigo-300 rotate-[-45deg]" />
    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-2 h-6 bg-orange-500/80 rounded-full blur-sm animate-pulse" />
  </div>
)));
PlayerElement.displayName = "PlayerElement";
