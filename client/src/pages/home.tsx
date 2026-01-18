import React from "react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { Shield, BookOpen, Crown, ChevronRight, User, Plus } from "lucide-react";
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
      {/* Aesthetic Overlays */}
      <div className="fixed inset-0 pointer-events-none z-10 overlay-vignette" />
      <div className="fixed inset-0 pointer-events-none z-10 overlay-scanline opacity-10" />
      <div className="fixed inset-0 pointer-events-none z-10 overlay-noise opacity-30 mix-blend-overlay" />
      
      {/* Corner Gradients */}
      <div className="fixed top-0 left-0 w-64 h-64 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none z-0 blur-3xl" />
      <div className="fixed bottom-0 right-0 w-64 h-64 bg-gradient-to-tl from-primary/10 to-transparent pointer-events-none z-0 blur-3xl" />

      {/* Main Central Box */}
      <div className="relative z-20 max-w-7xl w-full mx-4 flex flex-col items-center">
        
        {/* Animated Background Scanline for Container */}
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(212,175,55,0.05)_50%,transparent_100%)] h-[200%] w-full animate-scanline pointer-events-none opacity-20" />

        <div className="relative z-10 flex flex-col items-center mb-12">
            <Shield className="w-16 h-16 text-primary mb-6 drop-shadow-[0_0_20px_rgba(212,175,55,0.4)]" />
            
            <h1 className="font-mythic text-6xl md:text-8xl text-primary tracking-[0.2em] mb-2 drop-shadow-[0_0_30px_rgba(212,175,55,0.3)] text-shadow-glow">
                PANTHEON<span className="text-white/90">EXUS</span>
            </h1>
            
            <p className="font-tech text-muted-foreground tracking-[0.4em] uppercase text-sm mb-4">
                Divine Access Terminal // Authorized Personnel Only
            </p>
        </div>

        {/* Champion Selector Style Carousel */}
        <div className="w-full mb-16 relative px-12">
            {/* Decoration Lines */}
           <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent -z-10" />

           {characters.length > 0 ? (
             <Carousel
                opts={{
                  align: "center",
                  loop: true,
                }}
                className="w-full"
             >
                <CarouselContent className="-ml-4 py-10">
                   {characters.map((char) => (
                      <CarouselItem key={char.id} className="pl-4 md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                         <Link href={`/character-sheet/${slugify(char.name)}`}>
                            <div className="group/card relative h-[450px] bg-black/80 border border-primary/20 transition-all duration-500 rounded-sm overflow-hidden cursor-pointer hover:shadow-[0_0_30px_rgba(212,175,55,0.2)] hover:-translate-y-4 hover:border-primary hover:z-10">
                               
                               {/* Portrait Image */}
                               <div className="absolute inset-0 z-0">
                                   {char.path ? (
                                       <img src={char.path} alt={char.name} className="w-full h-full object-cover opacity-60 group-hover/card:opacity-100 transition-all duration-500 group-hover/card:scale-110 filter grayscale group-hover/card:grayscale-0" />
                                   ) : (
                                       <div className="w-full h-full bg-gradient-to-b from-zinc-800 to-black opacity-50" />
                                   )}
                                   {/* Inner Vignette for text readability */}
                                   <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-90 group-hover/card:opacity-70 transition-opacity duration-500" />
                               </div>
                               
                               {/* Card Content (Champion Style) */}
                               <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col items-center text-center z-10">
                                  
                                  {/* Animated Border on Hover */}
                                  <div className="absolute inset-x-6 top-0 h-px bg-primary/0 group-hover/card:bg-primary/50 transition-colors duration-500" />

                                  <div className="mb-2 opacity-60 group-hover/card:opacity-100 transition-opacity transform group-hover/card:-translate-y-1 duration-500">
                                      <Shield className="w-6 h-6 text-primary" />
                                  </div>

                                  <h3 className="font-mythic text-2xl text-white group-hover/card:text-primary transition-colors tracking-widest uppercase mb-1 drop-shadow-md">{char.name}</h3>
                                  <p className="text-xs font-tech text-primary/80 uppercase tracking-[0.2em] mb-4">{char.pantheon} Pantheon</p>
                                  
                                  {/* Hidden details that slide up or fade in */}
                                  <div className="h-0 group-hover/card:h-auto overflow-hidden transition-all duration-500 opacity-0 group-hover/card:opacity-100 flex flex-col items-center gap-2">
                                     <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-code uppercase bg-black/50 px-2 py-1 rounded-sm border border-white/5">
                                        <User className="w-3 h-3" /> {char.player}
                                     </div>
                                     <div className="text-[10px] text-primary font-mythic tracking-widest uppercase">
                                         Legend {char.legend}
                                     </div>
                                  </div>

                                  <ChevronRight className="w-5 h-5 text-primary/0 group-hover/card:text-primary transition-all duration-500 mt-2 transform translate-y-4 group-hover/card:translate-y-0" />
                               </div>
                            </div>
                         </Link>
                      </CarouselItem>
                   ))}
                </CarouselContent>
                <CarouselPrevious className="border-primary/20 hover:bg-primary/10 hover:text-primary -left-4 md:-left-12 h-12 w-12 rounded-full bg-black/50 backdrop-blur-sm" />
                <CarouselNext className="border-primary/20 hover:bg-primary/10 hover:text-primary -right-4 md:-right-12 h-12 w-12 rounded-full bg-black/50 backdrop-blur-sm" />
             </Carousel>
           ) : (
             <div className="h-64 flex flex-col items-center justify-center border border-dashed border-primary/20 rounded-sm bg-black/20 max-w-2xl mx-auto backdrop-blur-sm">
                <p className="font-tech text-sm text-muted-foreground uppercase tracking-widest mb-4">No Scion Scrolls Registered</p>
                <Link href="/admin">
                   <button className="text-xs text-primary hover:text-white border border-primary/30 hover:border-primary px-6 py-3 rounded-sm font-mythic uppercase tracking-wider flex items-center gap-2 transition-all hover:shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:bg-primary/10">
                      <Plus className="w-4 h-4" /> Initialize Protocol
                   </button>
                </Link>
             </div>
           )}
        </div>

        {/* Bottom Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-3xl mx-auto">
            <Link href="/alleybrary">
                <button className="group/btn relative w-full h-24 bg-black/60 border border-primary/10 hover:border-primary/60 transition-all duration-500 flex items-center justify-center gap-6 px-8 overflow-hidden rounded-sm hover:bg-primary/5 hover:shadow-[0_0_20px_rgba(212,175,55,0.1)]">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500" />
                    <BookOpen className="w-8 h-8 text-primary/40 group-hover/btn:text-primary transition-colors duration-500" />
                    <div className="text-left relative z-10">
                        <span className="block font-mythic text-xl text-primary tracking-widest group-hover/btn:text-white transition-colors">The Alleybrary</span>
                        <span className="block text-[10px] font-tech text-muted-foreground uppercase tracking-[0.3em] opacity-60 mt-1">Classified Knowledge Base</span>
                    </div>
                </button>
            </Link>

            <Link href="/admin">
                <button className="group/btn relative w-full h-24 bg-black/60 border border-primary/10 hover:border-primary/60 transition-all duration-500 flex items-center justify-center gap-6 px-8 overflow-hidden rounded-sm hover:bg-primary/5 hover:shadow-[0_0_20px_rgba(212,175,55,0.1)]">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500" />
                    <Crown className="w-8 h-8 text-primary/40 group-hover/btn:text-primary transition-colors duration-500" />
                    <div className="text-left relative z-10">
                        <span className="block font-mythic text-xl text-primary tracking-widest group-hover/btn:text-white transition-colors">Admin Console</span>
                        <span className="block text-[10px] font-tech text-muted-foreground uppercase tracking-[0.3em] opacity-60 mt-1">System Control Access</span>
                    </div>
                </button>
            </Link>
        </div>
        
      </div>
    </div>
  );
}

