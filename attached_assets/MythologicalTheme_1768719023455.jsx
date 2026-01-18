import React from 'react';
import { cn } from '@/lib/utils';
import { CornerFlourish, GreekMeander } from '@/components/ui/SvgOrnaments';

// Color Palette Constants
export const MYTH_COLORS = {
  gold: '#D4AF37',       // Primary Gold
  goldDark: '#8B7355',   // Antiqued Gold
  goldLight: '#F4D03F',  // Highlight Gold
  goldDim: 'rgba(212, 175, 55, 0.1)', // Glass Gold
  bg: '#050505',         // Deep Black
  panel: '#0c0a09',      // Dark Warm Gray
  danger: '#7f1d1d',     // Muted Red
  success: '#064e3b',    // Muted Green
};

export const COMMAND_CENTER_COLORS = {
  attributes: { primary: '#8B1538', accent: '#6B1428' }, // Deep Crimson
  virtues: { primary: '#2D5016', accent: '#1B4D3E' },   // Emerald Green
  callings: { primary: '#4B0082', accent: '#3A0066' },  // Deep Purple
  abilities: {
    physical: '#8B4513', // Rust
    social: '#C21E56',   // Rose
    mental: '#0F52BA'    // Sapphire
  },
  pools: {
    legend: '#FFD700',   // Golden Yellow
    willpower: '#C0C0C0' // Silver
  },
  health: { primary: '#DC143C', accent: '#8B0000' },    // Crimson / Blood Red
  soak: { primary: '#CD7F32', accent: '#B87333' },      // Bronze / Copper
  boons: { primary: '#8B00FF', accent: '#6A0DAD' },     // Violet / Purple
  knacks: { primary: '#00A8A8', accent: '#008080' },    // Cyan / Teal
  weapons: { primary: '#70798C', accent: '#C0C0C0' },   // Steel Gray / Silver
  armor: { primary: '#CD7F32', accent: '#B87333' },     // Bronze / Copper
  combat: { primary: '#D4AF37', accent: '#8B7355' }     // Aged Gold
};

// Common Style Classes
export const MYTH_STYLES = {
  glass: "backdrop-blur-md bg-[#0c0a09]/90 border border-[#D4AF37]/30 shadow-[0_4px_30px_rgba(0,0,0,0.5)]",
  glassLight: "backdrop-blur-sm bg-[#0c0a09]/60 border border-[#D4AF37]/20",
  panelBorder: "rounded-xl border border-[#D4AF37]/30 relative overflow-hidden",
  tabActive: "bg-[#D4AF37]/10 text-[#D4AF37] border-b-2 border-[#D4AF37] shadow-[0_4px_10px_rgba(212,175,55,0.1)]",
  tabInactive: "text-[#8B7355] hover:text-[#D4AF37] hover:bg-[#D4AF37]/5 border-b-2 border-transparent transition-all",
  input: "bg-[#050505]/80 border-[#D4AF37]/20 text-[#D4AF37] placeholder:text-[#8B7355]/50 focus:border-[#D4AF37]/60 focus:ring-[#D4AF37]/20",
  buttonPrimary: "bg-[#D4AF37] text-black hover:bg-[#F4D03F] font-bold uppercase tracking-widest font-ritual transition-all shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:shadow-[0_0_25px_rgba(212,175,55,0.5)]",
  buttonSecondary: "bg-transparent border border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37]/10 hover:border-[#D4AF37] font-ritual uppercase tracking-widest transition-all",
  buttonGhost: "text-[#8B7355] hover:text-[#D4AF37] hover:bg-[#D4AF37]/5",
  heading: "font-ritual uppercase tracking-widest text-[#D4AF37] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]",
  subheading: "font-tech uppercase tracking-[0.2em] text-[#8B7355]",
};

// Layout Components
export const MythicPanel = ({ children, className, glow = true }) => (
  <div className={cn(
    MYTH_STYLES.glass,
    MYTH_STYLES.panelBorder,
    glow && "shadow-[0_0_30px_rgba(212,175,55,0.05)]",
    "group",
    className
  )}>
    <div className="absolute top-2 left-2 text-[#D4AF37]/20 pointer-events-none z-0">
        <CornerFlourish position="top-left" size={32} />
    </div>
    <div className="absolute top-2 right-2 text-[#D4AF37]/20 pointer-events-none z-0">
        <CornerFlourish position="top-right" size={32} />
    </div>
    <div className="absolute bottom-2 left-2 text-[#D4AF37]/20 pointer-events-none z-0">
        <CornerFlourish position="bottom-left" size={32} />
    </div>
    <div className="absolute bottom-2 right-2 text-[#D4AF37]/20 pointer-events-none z-0">
        <CornerFlourish position="bottom-right" size={32} />
    </div>
    <div className="relative z-10 h-full">
        {children}
    </div>
  </div>
);

export const MythicSectionHeader = ({ title, subtitle, icon: Icon, className }) => (
  <div className={cn("relative mb-6 pb-2 border-b border-[#D4AF37]/20 flex justify-between items-end", className)}>
    <div className="flex items-center gap-3">
        {Icon && (
            <div className="p-2 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/5 text-[#D4AF37]">
                <Icon size={20} />
            </div>
        )}
        <div>
            <h3 className={cn("text-xl font-bold", MYTH_STYLES.heading)}>{title}</h3>
            {subtitle && <p className={cn("text-[10px]", MYTH_STYLES.subheading)}>{subtitle}</p>}
        </div>
    </div>
    <div className="hidden sm:block opacity-40">
        <GreekMeander width={100} height={12} className="text-[#D4AF37]" />
    </div>
  </div>
);

export const MythicTabList = ({ children, className }) => (
    <div className={cn("flex items-center gap-1 p-1 bg-[#050505]/60 rounded-t-xl border-b border-[#D4AF37]/30", className)}>
        {children}
    </div>
);