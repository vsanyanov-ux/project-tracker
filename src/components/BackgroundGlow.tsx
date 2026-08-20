import React from 'react';

export const BackgroundGlow: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Top Left Neon Cyan/Blue Orb */}
      <div 
        className="absolute -top-40 -left-40 w-[650px] h-[650px] rounded-full blur-[140px] opacity-25 animate-pulse"
        style={{
          background: 'radial-gradient(circle, rgba(6,182,212,0.8) 0%, rgba(59,130,246,0.3) 60%, transparent 80%)',
          animationDuration: '8s'
        }}
      />
      
      {/* Top Right Violet/Purple Orb */}
      <div 
        className="absolute top-10 -right-40 w-[700px] h-[700px] rounded-full blur-[160px] opacity-30 animate-pulse"
        style={{
          background: 'radial-gradient(circle, rgba(168,85,247,0.7) 0%, rgba(236,72,153,0.3) 60%, transparent 80%)',
          animationDuration: '10s'
        }}
      />
      
      {/* Center Ambient Subtle Emerald Orb */}
      <div 
        className="absolute top-1/2 left-1/3 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[180px] opacity-15"
        style={{
          background: 'radial-gradient(circle, rgba(16,185,129,0.5) 0%, rgba(14,165,233,0.2) 60%, transparent 80%)'
        }}
      />

      {/* Bottom Center Indigo Glow */}
      <div 
        className="absolute -bottom-40 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full blur-[160px] opacity-20"
        style={{
          background: 'radial-gradient(circle, rgba(99,102,241,0.6) 0%, rgba(168,85,247,0.2) 60%, transparent 80%)'
        }}
      />

      {/* Subtle Grid Lines Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
          backgroundSize: '48px 48px'
        }}
      />
    </div>
  );
};
