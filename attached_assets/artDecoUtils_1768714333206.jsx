import React from 'react';
import { cn } from '@/lib/utils';
import { Sparkles, Star, Triangle, Diamond } from 'lucide-react';

export const GoldDivider = ({ className }) => (
  <div className={cn("flex items-center justify-center gap-2 my-4 opacity-60", className)}>
    <div className="h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent w-full max-w-[100px]" />
    <Diamond size={8} className="text-[#D4AF37] fill-[#D4AF37]" />
    <div className="h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent w-full max-w-[100px]" />
  </div>
);

export const MythicHeader = ({ title, subtitle, icon: Icon }) => (
  <div className="relative mb-6 text-center">
    <div className="absolute top-1/2 left-0 w-full h-[1px] bg-[#D4AF37]/20 -z-10" />
    <div className="inline-flex flex-col items-center bg-[#0c0a09] px-6 border-x border-[#D4AF37]/30">
      {Icon && <Icon className="text-[#D4AF37] mb-2 drop-shadow-[0_0_8px_rgba(212,175,55,0.5)]" size={24} />}
      <h2 className="text-2xl font-ritual font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#FFD700] to-[#D4AF37] uppercase tracking-widest">
        {title}
      </h2>
      {subtitle && (
        <span className="text-[10px] font-tech text-[#D4AF37]/60 uppercase tracking-[0.3em] mt-1">
          {subtitle}
        </span>
      )}
    </div>
  </div>
);

export const DecoCard = ({ children, className }) => (
  <div className={cn(
    "relative bg-[#0c0a09]/80 border border-[#D4AF37]/30 p-4 overflow-hidden group hover:border-[#D4AF37]/60 transition-colors duration-500",
    className
  )}>
    {/* Corner Accents */}
    <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#D4AF37]" />
    <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#D4AF37]" />
    <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[#D4AF37]" />
    <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#D4AF37]" />
    
    {/* Background Pattern */}
    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none mix-blend-overlay" />
    
    {children}
  </div>
);