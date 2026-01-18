import React from 'react';
import { cn } from '@/lib/utils';

// --- Color System ---
export const TEXT_COLORS = {
  primary: '#D4AF37',   // Aged Gold
  secondary: '#E8E8E8', // Light Gray
  tertiary: '#A9A9A9',  // Medium Gray
  disabled: '#696969',  // Dark Gray
};

export const MYTHIC_COLORS = {
  gold: '#D4AF37',       // Primary Aged Gold
  goldDim: '#8B7355',    // Antiqued/Shadow Gold
  goldBright: '#F4D03F', // Highlight
  base: '#1A1A1A',       // Charcoal base
  deep: '#0F0F0F',       // Deep background
  
  // Section Colors (Legacy/Fallback)
  attributes: '#8B1538', 
  virtues: '#2D5016',    
  callings: '#4B0082',   
  physical: '#8B4513',   
  social: '#C21E56',     
  mental: '#0F52BA',     
  legend: '#FFD700',     
  willpower: '#C0C0C0',  
  health: '#DC143C',     
  soak: '#CD7F32',       
  boons: '#8B00FF',      
  knacks: '#00A8A8',     
  weapons: '#70798C',    
  armor: '#CD7F32',
};

export const SECTION_GRADIENTS = {
  attributes: { stops: ['#FF4D6D', '#8B1538', '#4A051C'] },
  virtues: { stops: ['#4ADE80', '#2D5016', '#0F280A'] },
  callings: { stops: ['#A78BFA', '#4B0082', '#260042'] },
  physical: { stops: ['#CD853F', '#8B4513', '#3E1D05'] },
  social: { stops: ['#F43F5E', '#C21E56', '#500820'] },
  mental: { stops: ['#60A5FA', '#0F52BA', '#041E42'] },
  legend: { stops: ['#FDE047', '#FFD700', '#857000'] },
  willpower: { stops: ['#F3F4F6', '#C0C0C0', '#4B5563'] },
  health: { stops: ['#F87171', '#DC143C', '#7F1D1D'] },
  soak: { stops: ['#FDBA74', '#CD7F32', '#7C2D12'] },
  boons: { stops: ['#C084FC', '#8B00FF', '#3B0764'] },
  knacks: { stops: ['#2DD4BF', '#00A8A8', '#004D4D'] },
  weapons: { stops: ['#9CA3AF', '#70798C', '#374151'] },
  armor: { stops: ['#FDBA74', '#CD7F32', '#7C2D12'] },
  combat: { stops: ['#FDE047', '#D4AF37', '#8B7355'] }
};

export const getGradientCss = (sectionKey) => {
   const stops = SECTION_GRADIENTS[sectionKey]?.stops || ['#D4AF37', '#8B7355', '#3D2817'];
   return `linear-gradient(135deg, ${stops[0]} 0%, ${stops[1]} 50%, ${stops[2]} 100%)`;
};

// --- Helper Components ---

export const GlowEffect = ({ color, opacity = 0.2, className }) => (
  <div 
    className={cn("absolute inset-0 pointer-events-none transition-opacity duration-500", className)}
    style={{
      background: `radial-gradient(circle at center, ${color} 0%, transparent 70%)`,
      opacity: opacity
    }}
  />
);

export const MythicSeparator = ({ className, color = MYTHIC_COLORS.gold }) => (
  <div className={cn("w-full h-px my-4 relative flex items-center justify-center opacity-50", className)}>
    <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-current to-transparent" style={{ color }} />
    <div className="w-2 h-2 rotate-45 border border-current bg-[#1A1A1A] z-10" style={{ borderColor: color }} />
  </div>
);

export const MythicHeader = ({ children, color = MYTHIC_COLORS.gold, prefix, className }) => (
  <h3 className={cn("font-ritual text-lg uppercase tracking-[0.15em] flex items-center gap-3 mb-4", className)} style={{ color: TEXT_COLORS.primary }}>
    {prefix && <span className="opacity-50 font-serif" style={{ color: TEXT_COLORS.tertiary }}>{prefix}</span>}
    <span className="drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">{children}</span>
    <div className="h-px flex-1 bg-gradient-to-r from-current to-transparent opacity-30 ml-2" style={{ color }} />
  </h3>
);

export const MythicLabel = ({ children, className }) => (
  <span className={cn("font-tech text-[10px] uppercase tracking-widest opacity-80", className)} style={{ color: TEXT_COLORS.tertiary }}>
    {children}
  </span>
);

export const MythicBox = ({ children, className, color = MYTHIC_COLORS.gold, noPadding = false }) => {
  return (
    <div className={cn("relative group h-full", className)}>
      {/* Background with tint */}
      <div 
        className="absolute inset-0 bg-[#0F0F0F]/90 backdrop-blur-sm transition-colors duration-500"
        style={{ 
          clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)',
        }}
      />
      
      {/* Glow on hover */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-700 pointer-events-none"
        style={{ backgroundColor: color }}
      />

      {/* Frame Border */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
        <path 
          d={`M 12 1 L calc(100% - 2) 1 L 100% 12 L 100% calc(100% - 12) L calc(100% - 12) 100% L 2 100% L 1 calc(100% - 12) L 1 12 Z`}
          fill="none" 
          stroke={MYTHIC_COLORS.goldDim} 
          strokeWidth="1"
          opacity="0.3"
        />
        <path 
          d="M 1 20 L 1 12 L 12 1 M 20 1 L 12 1" 
          fill="none" 
          stroke={color} 
          strokeWidth="1.5"
          className="drop-shadow-[0_0_2px_currentColor]"
        />
        <path 
          d="M calc(100% - 20) 1 L calc(100% - 2) 1 L 100% 12 M 100% 20 L 100% 12" 
          fill="none" 
          stroke={color} 
          strokeWidth="1.5"
          className="drop-shadow-[0_0_2px_currentColor]"
        />
        <path 
          d="M 100% calc(100% - 20) L 100% calc(100% - 12) L calc(100% - 12) 100% M calc(100% - 20) 100% L calc(100% - 12) 100%" 
          fill="none" 
          stroke={color} 
          strokeWidth="1.5"
          className="drop-shadow-[0_0_2px_currentColor]"
        />
        <path 
          d="M 20 100% L 12 100% L 1 calc(100% - 12) M 1 calc(100% - 20) L 1 calc(100% - 12)" 
          fill="none" 
          stroke={color} 
          strokeWidth="1.5"
          className="drop-shadow-[0_0_2px_currentColor]"
        />
      </svg>

      {/* Content Container */}
      <div className={cn("relative z-10 h-full overflow-hidden", noPadding ? "" : "p-4")}>
        {children}
      </div>
    </div>
  );
};

export const RitualList = ({ items, renderItem, className }) => (
  <div className={cn("space-y-1 relative", className)}>
    <div className="absolute left-[9px] top-2 bottom-2 w-px bg-gradient-to-b from-transparent via-[#D4AF37]/20 to-transparent" />
    {items.map((item, idx) => (
      <div key={idx} className="relative pl-6">
         <div className="absolute left-[7px] top-1/2 -translate-y-1/2 w-[5px] h-[5px] rotate-45 bg-[#1A1A1A] border border-[#D4AF37]/40" />
         {renderItem(item, idx)}
      </div>
    ))}
  </div>
);