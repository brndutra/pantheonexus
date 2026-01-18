import React from "react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { Shield, Scroll, LayoutGrid, BookOpen, Crown } from "lucide-react";
import textureBg from "@assets/generated_images/minimalist_gold_grid_background.png";
import cornerOrnament from "@assets/generated_images/mythological_corner_ornament.png";
import darkGoldTexture from "@assets/generated_images/dark_gold_texture_background.png";
import artNouveauFrame from "@assets/generated_images/art_nouveau_gold_border_frame.png";

export default function Home() {
  return (
    <div 
      className="min-h-screen bg-black text-foreground overflow-hidden font-tech selection:bg-primary/30 relative flex items-center justify-center"
      style={{
        backgroundImage: `url(${darkGoldTexture})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="fixed inset-0 pointer-events-none z-10 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.9)_80%)]" />

      {/* Main Central Box */}
      <div className="relative z-20 max-w-4xl w-full mx-4">
        {/* Frame Decoration */}
        <div className="absolute -inset-4 md:-inset-8 border border-primary/20 rounded-sm pointer-events-none opacity-50" />
        <div className="absolute -inset-1 border border-primary/40 rounded-sm pointer-events-none" />
        
        <img src={cornerOrnament} className="absolute -top-6 -left-6 w-24 h-24 opacity-60 rotate-0 pointer-events-none" alt="" />
        <img src={cornerOrnament} className="absolute -top-6 -right-6 w-24 h-24 opacity-60 rotate-90 pointer-events-none" alt="" />
        <img src={cornerOrnament} className="absolute -bottom-6 -right-6 w-24 h-24 opacity-60 rotate-180 pointer-events-none" alt="" />
        <img src={cornerOrnament} className="absolute -bottom-6 -left-6 w-24 h-24 opacity-60 -rotate-90 pointer-events-none" alt="" />

        <div className="bg-black/80 backdrop-blur-xl border border-primary/30 p-8 md:p-16 rounded-sm shadow-[0_0_50px_rgba(212,175,55,0.15)] text-center relative overflow-hidden group">
            
            {/* Animated Background Scanline */}
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(212,175,55,0.05)_50%,transparent_100%)] h-[200%] w-full animate-scanline pointer-events-none opacity-30" />

            <div className="relative z-10 flex flex-col items-center">
                <Shield className="w-16 h-16 text-primary mb-6 drop-shadow-[0_0_15px_rgba(212,175,55,0.6)]" />
                
                <h1 className="font-mythic text-5xl md:text-7xl text-primary tracking-[0.2em] mb-2 drop-shadow-[0_0_25px_rgba(212,175,55,0.4)]">
                    PANTHEON<span className="text-white/90">EXUS</span>
                </h1>
                
                <div className="h-px w-32 bg-gradient-to-r from-transparent via-primary/60 to-transparent mb-6" />
                
                <p className="font-tech text-muted-foreground tracking-[0.3em] uppercase text-sm mb-12 max-w-lg mx-auto leading-relaxed">
                    Divine Access Terminal // Authorized Personnel Only
                    <br />
                    <span className="text-[10px] opacity-60">System v2.4 Online</span>
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl">
                    <Link href="/character-sheet">
                        <button className="group/btn relative w-full h-32 bg-black/40 border border-primary/20 hover:border-primary/60 transition-all duration-500 flex flex-col items-center justify-center gap-3 p-4 overflow-hidden rounded-sm hover:bg-primary/5 hover:shadow-[0_0_20px_rgba(212,175,55,0.2)]">
                            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                            <LayoutGrid className="w-8 h-8 text-primary/60 group-hover/btn:text-primary transition-colors" />
                            <span className="font-mythic text-xl text-primary tracking-widest relative z-10">Character Sheet</span>
                            <span className="text-[9px] font-tech text-muted-foreground uppercase tracking-widest opacity-0 group-hover/btn:opacity-100 transition-all transform translate-y-2 group-hover/btn:translate-y-0">Access Records</span>
                        </button>
                    </Link>

                    <Link href="/alleybrary">
                        <button className="group/btn relative w-full h-32 bg-black/40 border border-primary/20 hover:border-primary/60 transition-all duration-500 flex flex-col items-center justify-center gap-3 p-4 overflow-hidden rounded-sm hover:bg-primary/5 hover:shadow-[0_0_20px_rgba(212,175,55,0.2)]">
                            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                            <BookOpen className="w-8 h-8 text-primary/60 group-hover/btn:text-primary transition-colors" />
                            <span className="font-mythic text-xl text-primary tracking-widest relative z-10">The Alleybrary</span>
                            <span className="text-[9px] font-tech text-muted-foreground uppercase tracking-widest opacity-0 group-hover/btn:opacity-100 transition-all transform translate-y-2 group-hover/btn:translate-y-0">Knowledge Base</span>
                        </button>
                    </Link>

                    <Link href="/admin">
                        <button className="group/btn relative w-full h-32 bg-black/40 border border-primary/20 hover:border-primary/60 transition-all duration-500 flex flex-col items-center justify-center gap-3 p-4 overflow-hidden rounded-sm hover:bg-primary/5 hover:shadow-[0_0_20px_rgba(212,175,55,0.2)]">
                            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                            <Crown className="w-8 h-8 text-primary/60 group-hover/btn:text-primary transition-colors" />
                            <span className="font-mythic text-xl text-primary tracking-widest relative z-10">Admin Console</span>
                            <span className="text-[9px] font-tech text-muted-foreground uppercase tracking-widest opacity-0 group-hover/btn:opacity-100 transition-all transform translate-y-2 group-hover/btn:translate-y-0">System Control</span>
                        </button>
                    </Link>
                </div>
            </div>
        </div>
        
        {/* Footer */}
        <div className="mt-8 text-center">
            <p className="font-code text-[10px] text-muted-foreground/30 uppercase tracking-[0.5em]">
                Pantheonexus Protocol // Encrypted Connection
            </p>
        </div>
      </div>
    </div>
  );
}
