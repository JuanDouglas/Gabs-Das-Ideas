'use client';

export const NoiseOverlay = () => (
  <div className="absolute inset-0 pointer-events-none opacity-5">
    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white to-transparent animate-pulse" />
  </div>
);
