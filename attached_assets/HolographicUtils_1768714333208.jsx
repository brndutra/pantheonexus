import React from 'react';
import { cn } from '@/lib/utils';
import { MYTHIC_COLORS, SECTION_GRADIENTS } from '@/lib/MythicFuturismTheme';
import { Pencil, Check, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

// --- Constants ---
export const HOLO_COLORS = {
  black: '#000000',
  gold: '#D4AF37',
  goldDim: 'rgba(212, 175, 55, 0.5)',
  textLight: '#E8E8E8',
  textSecondary: '#A9A9A9',
  textDisabled: '#696969',
  neonCyan: 'rgba(0, 255, 255, 0.1)',
  neonMagenta: 'rgba(255, 0, 255, 0.1)',
  neonGreen: 'rgba(0, 255, 0, 0.1)',
};

export const HOLO_STYLES = {
  container: "bg-[#000000] border border-[#D4AF37] border-opacity-70 rounded-lg relative overflow-hidden transition-all duration-300 shadow-[0_4px_20px_rgba(212,175,55,0.15)]",
  header: "font-ritual text-[#D4AF37] font-bold uppercase tracking-[0.05em] text-lg mb-1 drop-shadow-[0_0_8px_rgba(212,175,55,0.4)]",
  label: "font-tech text-[#E8E8E8] text-xs uppercase tracking-wider opacity-80",
  value: "font-mono text-[#E8E8E8] font-bold tracking-tight",
  subtext: "text-[#A9A9A9] text-[10px] font-mono tracking-wide",
  divider: "h-px w-full bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-30 my-2",
  input: "bg-black border border-[#D4AF37]/50 text-[#E8E8E8] font-mono text-center focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/50 focus:shadow-[0_0_10px_rgba(212,175,55,0.2)] transition-all",
  buttonIcon: "h-6 w-6 p-1 rounded-full border border-[#D4AF37]/30 hover:border-[#D4AF37] hover:bg-[#D4AF37]/10 hover:shadow-[0_0_10px_rgba(212,175,55,0.2)] text-[#D4AF37] transition-all flex items-center justify-center",
};

// --- Utility Functions ---

export const getGradientForSection = (section) => {
  const grad = SECTION_GRADIENTS[section];
  if (!grad || !grad.stops) return `linear-gradient(135deg, ${MYTHIC_COLORS.gold}, ${MYTHIC_COLORS.goldDim})`;
  return `linear-gradient(135deg, ${grad.stops[0]} 0%, ${grad.stops[1]} 50%, ${grad.stops[2]} 100%)`;
};

export const getGlowColor = (section, opacity = 0.3) => {
  const grad = SECTION_GRADIENTS[section];
  const color = grad?.stops?.[1] || MYTHIC_COLORS.gold;
  return `${color}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}`;
};

// --- Components ---

export const HolographicBox = ({ children, className, section = 'combat', active = false, onClick, isEditing = false }) => {
  const glowColor = SECTION_GRADIENTS[section]?.stops?.[1] || MYTHIC_COLORS.gold;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      onClick={onClick}
      className={cn(
        HOLO_STYLES.container,
        "group hover:border-opacity-100 hover:shadow-[0_0_25px_rgba(212,175,55,0.25)]",
        (active || isEditing) ? "border-opacity-100 shadow-[0_0_30px_rgba(212,175,55,0.35)]" : "",
        isEditing ? "bg-opacity-95 ring-1 ring-[#D4AF37]/50" : "",
        className
      )}
    >
      {/* 1. Animated Scanline Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.08] z-0 overflow-hidden rounded-lg">
          <div className="w-full h-[200%] absolute top-[-50%] left-0 animate-[scanline_8s_linear_infinite] bg-[linear-gradient(to_bottom,transparent_40%,rgba(212,175,55,0.4)_50%,transparent_60%)] bg-[length:100%_4px]" />
      </div>

      {/* 2. Subtle Grid Background */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.05] z-0" 
           style={{ 
             backgroundImage: `linear-gradient(#D4AF37 1px, transparent 1px), linear-gradient(90deg, #D4AF37 1px, transparent 1px)`,
             backgroundSize: "20px 20px"
           }} 
      />
      
      {/* 3. Ambient Glow Gradient */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-10 transition-opacity duration-700 z-0 bg-gradient-to-br from-transparent via-transparent to-[#D4AF37]/20"
      />
      
      {/* 4. Rare Flicker Overlay */}
      <div className="absolute inset-0 bg-[#D4AF37] mix-blend-overlay opacity-0 animate-[hologramFlicker_10s_infinite_7s] pointer-events-none z-10" />

      {/* Content */}
      <div className="relative z-20 h-full">
        {children}
      </div>
      
      {/* Corner Accents */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#D4AF37] opacity-60" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#D4AF37] opacity-60" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[#D4AF37] opacity-60" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#D4AF37] opacity-60" />
    </motion.div>
  );
};

export const HoloHeader = ({ title, subtitle, section = 'combat', onEdit, isEditing, onSave, onCancel, isOwner, isLoading }) => (
  <div className="flex items-center justify-between border-b border-[#D4AF37]/30 pb-3 mb-4 px-5 pt-5 relative">
    {/* Glow under header line */}
    <div className="absolute bottom-0 left-0 right-0 h-px bg-[#D4AF37] opacity-30 shadow-[0_0_10px_#D4AF37]" />

    <div className="flex flex-col">
      <h3 className={HOLO_STYLES.header}>{title}</h3>
      {subtitle && <span className={HOLO_STYLES.subtext}>{subtitle}</span>}
    </div>
    <div className="flex items-center gap-2">
        {/* Edit Controls */}
        {isOwner && (
            <AnimatePresence mode="wait">
                {!isEditing ? (
                    <motion.button
                        key="edit"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        onClick={onEdit}
                        className={HOLO_STYLES.buttonIcon}
                        title="Edit Module"
                    >
                        <Pencil size={12} />
                    </motion.button>
                ) : (
                    <motion.div 
                        key="actions"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="flex gap-2"
                    >
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={onSave}
                            disabled={isLoading}
                            className="h-6 px-3 bg-black/40 border border-green-500/50 text-green-400 hover:bg-green-900/20 hover:text-green-300 hover:border-green-400 font-tech uppercase text-[10px] tracking-wider"
                        >
                            {isLoading ? <Loader2 size={10} className="animate-spin" /> : <><Check size={10} className="mr-1" /> Save</>}
                        </Button>
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={onCancel}
                            disabled={isLoading}
                            className="h-6 px-3 bg-black/40 border border-red-500/50 text-red-400 hover:bg-red-900/20 hover:text-red-300 hover:border-red-400 font-tech uppercase text-[10px] tracking-wider"
                        >
                            <X size={10} className="mr-1" /> Cancel
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
        )}
        {/* Status Indicator */}
        <div 
          className={cn(
            "w-1.5 h-1.5 rotate-45 border border-[#D4AF37] ml-2 transition-all duration-500",
            isEditing ? "bg-[#D4AF37] shadow-[0_0_8px_#D4AF37]" : "bg-transparent opacity-50"
          )} 
        />
    </div>
  </div>
);

export const HoloDivider = ({ className }) => (
    <div className={cn("w-full h-px bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent my-4 relative", className)}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-[#D4AF37] rounded-full shadow-[0_0_5px_#D4AF37]" />
    </div>
);