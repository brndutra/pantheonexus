import React from "react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { Shield, Scroll, LayoutGrid, BookOpen, Crown, ChevronRight, User, Star, Plus } from "lucide-react";
import { useCharacters, slugify } from "@/lib/characters-store";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export default function Home() {
  const { characters } = useCharacters();

  return (
    <div 
      className="min-h-screen bg-black text-foreground overflow-hidden font-tech selection:bg-primary/30 relative flex items-center justify-center bg-grid-gold"
    >
      <div className="fixed inset-0 pointer-events-none z-10 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.9)_80%)]" />

      {/* Main Central Box */}
      <div className="relative z-20 max-w-6xl w-full mx-4 flex flex-col items-center">
        {/* CSS Frame Decoration */}
        <div className="absolute -inset-4 md:-inset-8 pointer-events-none opacity-80 hidden md:block border border-primary/20 rounded-lg">
             {/* Corner Accents */}
             <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-primary rounded-tl-lg" />
             <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-primary rounded-tr-lg" />
             <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-primary rounded-bl-lg" />
             <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-primary rounded-br-lg" />
        </div>
        
        <div className="bg-black/90 backdrop-blur-xl p-8 md:p-12 rounded-lg border border-primary/20 shadow-[0_0_50px_rgba(212,175,55,0.1)] text-center relative overflow-hidden group w-full max-w-5xl">
            
            {/* Animated Background Scanline */}
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(212,175,55,0.05)_50%,transparent_100%)] h-[200%] w-full animate-scanline pointer-events-none opacity-20" />

            <div className="relative z-10 flex flex-col items-center mb-10">
                <Shield className="w-12 h-12 text-primary mb-4 drop-shadow-[0_0_15px_rgba(212,175,55,0.6)]" />
                
                <h1 className="font-mythic text-5xl md:text-6xl text-primary tracking-[0.2em] mb-2 drop-shadow-[0_0_25px_rgba(212,175,55,0.4)]">
                    PANTHEON<span className="text-white/90">EXUS</span>
                </h1>
                
                <p className="font-tech text-muted-foreground tracking-[0.3em] uppercase text-xs mb-4">
                    Divine Access Terminal // Authorized Personnel Only
                </p>
            </div>

            {/* Character Carousel Section */}
            <div className="w-full max-w-4xl mx-auto mb-12">
               <div className="flex items-center gap-4 mb-4">
                  <div className="h-px bg-primary/20 flex-1" />
                  <span className="text-[10px] font-mythic uppercase tracking-widest text-primary/60">Select Character Scroll</span>
                  <div className="h-px bg-primary/20 flex-1" />
               </div>

               {characters.length > 0 ? (
                 <Carousel
                    opts={{
                      align: "start",
                      loop: true,
                    }}
                    className="w-full px-12"
                 >
                    <CarouselContent className="-ml-4">
                       {characters.map((char) => (
                          <CarouselItem key={char.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                             <Link href={`/character-sheet/${slugify(char.name)}`}>
                                <div className="group/card relative h-48 bg-black/40 border border-white/10 hover:border-primary/50 transition-all duration-500 rounded-sm overflow-hidden cursor-pointer hover:shadow-[0_0_20px_rgba(212,175,55,0.15)] hover:-translate-y-1">
                                   <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity" />
                                   
                                   {/* Card Content */}
                                   <div className="p-5 flex flex-col h-full justify-between relative z-10">
                                      <div>
                                         <div className="flex justify-between items-start mb-2">
                                            <Shield className="w-5 h-5 text-primary/40 group-hover/card:text-primary transition-colors" />
                                            <span className="text-[9px] font-code text-muted-foreground uppercase border border-white/5 px-1.5 py-0.5 rounded-sm group-hover/card:border-primary/20 transition-colors">Legend {char.legend}</span>
                                         </div>
                                         <h3 className="font-mythic text-xl text-foreground group-hover/card:text-primary transition-colors tracking-wide truncate">{char.name}</h3>
                                         <p className="text-[10px] font-tech text-muted-foreground uppercase tracking-widest mt-1">{char.pantheon}</p>
                                      </div>
                                      
                                      <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-2">
                                         <div className="flex items-center gap-2 text-[10px] text-muted-foreground/60 font-code uppercase">
                                            <User className="w-3 h-3" />
                                            <span className="truncate max-w-[80px]">{char.player}</span>
                                         </div>
                                         <ChevronRight className="w-4 h-4 text-primary/20 group-hover/card:text-primary transition-colors transform group-hover/card:translate-x-1" />
                                      </div>
                                   </div>
                                </div>
                             </Link>
                          </CarouselItem>
                       ))}
                    </CarouselContent>
                    <CarouselPrevious className="border-primary/20 hover:bg-primary/10 hover:text-primary" />
                    <CarouselNext className="border-primary/20 hover:bg-primary/10 hover:text-primary" />
                 </Carousel>
               ) : (
                 <div className="h-32 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-sm bg-black/20">
                    <p className="font-tech text-xs text-muted-foreground uppercase tracking-widest mb-2">No Scrolls Found</p>
                    <Link href="/admin">
                       <button className="text-[10px] text-primary hover:underline font-mythic uppercase tracking-wider flex items-center gap-2">
                          <Plus className="w-3 h-3" /> Initialize in Admin
                       </button>
                    </Link>
                 </div>
               )}
            </div>

            {/* Bottom Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl mx-auto">
                <Link href="/alleybrary">
                    <button className="group/btn relative w-full h-20 bg-black/40 border border-primary/20 hover:border-primary/60 transition-all duration-500 flex items-center justify-center gap-4 px-6 overflow-hidden rounded-sm hover:bg-primary/5">
                        <BookOpen className="w-6 h-6 text-primary/60 group-hover/btn:text-primary transition-colors" />
                        <div className="text-left">
                            <span className="block font-mythic text-lg text-primary tracking-widest relative z-10">The Alleybrary</span>
                            <span className="block text-[9px] font-tech text-muted-foreground uppercase tracking-widest opacity-60">Knowledge Base</span>
                        </div>
                    </button>
                </Link>

                <Link href="/admin">
                    <button className="group/btn relative w-full h-20 bg-black/40 border border-primary/20 hover:border-primary/60 transition-all duration-500 flex items-center justify-center gap-4 px-6 overflow-hidden rounded-sm hover:bg-primary/5">
                        <Crown className="w-6 h-6 text-primary/60 group-hover/btn:text-primary transition-colors" />
                        <div className="text-left">
                            <span className="block font-mythic text-lg text-primary tracking-widest relative z-10">Admin Console</span>
                            <span className="block text-[9px] font-tech text-muted-foreground uppercase tracking-widest opacity-60">System Control</span>
                        </div>
                    </button>
                </Link>
            </div>
            
        </div>
      </div>
    </div>
  );
}

