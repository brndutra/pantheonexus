import React, { useState } from "react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { Shield, BookOpen, Crown, ChevronRight, User, Plus, Zap, Sword, MapPin, Archive, Globe, Skull, Users, Flame, Lock, ExternalLink, Sparkles } from "lucide-react";
import { useCharacters } from "@/lib/use-characters";
import { BoonsCatalogModal } from "@/components/boon-catalog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const WORLD_STATE_CARDS = [
  {
    id: 1,
    title: "The World",
    subtitle: "A Reality Veiled",
    sysId: "System.Archive.01",
    description: "The World is contemporary, yet ancient. Skyscrapers scrape the heavens where Zeus still rules. The Internet connects billions, yet Hermes carries the most vital messages. It is a place of wonder and terror, where the myths of old are the breaking news of today.",
    image: "https://horizons-cdn.hostinger.com/48768f7b-4ea7-4749-9d28-adc9270c994b/1a2d7fe9004843648fd87df90af879b3.jpg",
  },
  {
    id: 2,
    title: "The Divine",
    subtitle: "Theoi • Aesir • Netjer",
    sysId: "System.Archive.02",
    description: "The Gods are real. They are not distant concepts, but active, powerful entities who shape the fate of nations. From the golden halls of Olympus to the sands of the Duat, they watch, they plot, and they breed.",
    image: "https://horizons-cdn.hostinger.com/48768f7b-4ea7-4749-9d28-adc9270c994b/a0b8dcea9d88379b0a00bf25916979f0.jpg",
  },
  {
    id: 3,
    title: "The Convergence",
    subtitle: "Alexandria • Liberty • New York",
    sysId: "System.Archive.03",
    description: "The Lighthouse of Alexandria was lit on the torch of the Statue of Liberty, tearing the veil between myths. Now, legends are drawn to New York like moths to a flame.",
    image: "https://horizons-cdn.hostinger.com/48768f7b-4ea7-4749-9d28-adc9270c994b/8039bed6cb983c36b297cb77a4195182.jpg",
  },
  {
    id: 4,
    title: "The Scion",
    subtitle: "Blood of the Gods",
    sysId: "System.Archive.04",
    description: "You are the child of a God and a mortal. Blessed with ichor in your veins, you possess the potential to rewrite destiny. You are a hero, a monster, a celebrity, a savior.",
    image: "https://horizons-cdn.hostinger.com/48768f7b-4ea7-4749-9d28-adc9270c994b/88751ff2c2bffd81efb2ac51d9d5da4e.jpg",
  },
  {
    id: 5,
    title: "The War",
    subtitle: "Titanomachy Eternal",
    sysId: "System.Archive.05",
    description: "The Titans, ancient enemies of the Gods, seek to reclaim the World and return it to primordial chaos. Their spawn roam the alleys and boardrooms, corrupting and destroying.",
    image: "https://horizons-cdn.hostinger.com/48768f7b-4ea7-4749-9d28-adc9270c994b/be914f2cbe36854abf60884da8f27f9b.jpg",
  },
];

const EPIC_ATTRIBUTES = {
  Physical: [
    { name: "Strength", knacks: 19 },
    { name: "Dexterity", knacks: 19 },
    { name: "Stamina", knacks: 20 },
  ],
  Social: [
    { name: "Charisma", knacks: 18 },
    { name: "Manipulation", knacks: 17 },
    { name: "Appearance", knacks: 16 },
  ],
  Mental: [
    { name: "Perception", knacks: 15 },
    { name: "Intelligence", knacks: 18 },
    { name: "Wits", knacks: 16 },
  ],
};

const PURVIEWS = [
  "Animal", "Chaos", "Darkness", "Death", "Dream", "Earth", "Emotion", "Fertility",
  "Fire", "Frost", "Guardian", "Health", "Illusion", "Innovation", "Justice",
  "Moon", "Prophecy", "Psychopomp", "Sky", "Sound", "Stars", "Sun", "Time", "War", "Water"
];

const WEAPONS_DATA = [
  { weapon: "Pistol, Light", dmg: "+1L", range: "20/40/80", cap: "17+1", tags: "Concealable" },
  { weapon: "Pistol, Heavy", dmg: "+2L", range: "30/60/120", cap: "7+1", tags: "Piercing" },
  { weapon: "Rifle, Assault", dmg: "+3L", range: "150/300/600", cap: "30+1", tags: "Automatic, Two-Handed" },
  { weapon: "Shotgun", dmg: "+4L", range: "10/20/40", cap: "8+1", tags: "Brutal, Short Range" },
  { weapon: "Knife/Dagger", dmg: "+1L", range: "Melee", cap: "-", tags: "Concealable, Thrown" },
  { weapon: "Sword/Machete", dmg: "+2L", range: "Melee", cap: "-", tags: "Versatile" },
  { weapon: "Staff/Club", dmg: "+2B", range: "Melee", cap: "-", tags: "Stun" },
];

const LOADOUTS = [
  { name: "Tactical Response Kit", items: "Heavy Pistol, Kevlar Vest (+1/1), Comms Earpiece, Flashlight." },
  { name: "Covert Ops Kit", items: "Light Pistol w/ Silencer, Lockpicks, Dark Clothing, Switchblade." },
  { name: "Street Brawler Kit", items: "Brass Knuckles, Leather Jacket (+1/0), Baseball Bat, First Aid Kit." },
  { name: "Occultist Kit", items: "Ritual Dagger, Chalk, Candles, Ancient Text (Research +1)." },
];

const LOCATIONS = [
  "Acropolis of Mount Ida", "Angra do Heroísmo", "Apollo Theater", "Base do F.A.R.O.L",
  "Bermuda Triangle", "British Museum", "Caesar Palace Hotel", "Central Park Zoo",
  "Charging Bull", "Chrysler Building", "Cleopatra's Needle", "Delacorte Theater",
  "Devils Tower", "Ellis Island", "Empire State Building", "Farol de Alexandria",
  "Federal Hall", "Golden Gate Bridge", "Great House", "Guggenheim Museum",
  "Madison Square Garden", "Metropolitan Museum of Art", "New York Public Library",
  "New York Stock Exchange", "One Sutton Place North", "Rikers Island",
  "St. Patrick's Cathedral", "Stonehenge", "Temple of Dendur", "The Cloisters",
  "The Dakota", "The Pentagon", "Times Square", "United Nations HQ", "Washington Monument"
];

export default function Home() {
  const { data: characters = [], isLoading } = useCharacters();
  const [epicTab, setEpicTab] = useState<"Physical" | "Social" | "Mental">("Physical");
  const [selectedPurview, setSelectedPurview] = useState("Animal");
  const [selectedLocation, setSelectedLocation] = useState(LOCATIONS[0]);
  const [boonModalOpen, setBoonModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-mythic-void text-foreground overflow-x-hidden font-tech selection:bg-primary/30 relative">
      <div className="fixed inset-0 pointer-events-none z-10 overlay-vignette opacity-70" />
      <div className="fixed inset-0 pointer-events-none z-10 overlay-scanline opacity-10" />
      <div className="fixed inset-0 pointer-events-none z-10 overlay-noise opacity-20 mix-blend-overlay" />

      {/* HEADER */}
      <header className="relative z-20 border-b border-primary/20 bg-black/60 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Shield className="w-8 h-8 text-primary drop-shadow-[0_0_10px_rgba(212,175,55,0.5)]" />
            <div>
              <h1 className="font-mythic text-2xl text-primary tracking-[0.15em]">PANTHEON<span className="text-white">EXUS</span></h1>
              <p className="text-[9px] text-muted-foreground uppercase tracking-[0.3em]">V.2.5.0 // OMEGA</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-[10px] text-primary">
              <span className="animate-pulse">System Online</span>
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_8px_gold]" />
            </div>
            <Link href="/admin">
              <button className="text-[10px] font-mythic uppercase tracking-widest text-primary border border-primary/30 px-3 py-1.5 hover:bg-primary/10 transition-colors rounded-sm">
                Admin
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: "url('https://xokduhssevaaxzmhcpxf.supabase.co/storage/v1/object/public/alleybrary-files/home-assets/1767923776229-ugyky.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-mythic-void" />
        
        <div className="relative z-10 container mx-auto px-4 text-center">
          <div className="mb-8">
            <p className="text-primary/60 font-code text-sm tracking-[0.5em] mb-4">ᚫᚾ𓏏𓍝ᚽᚿᚻᚳ𓀀ᚿᚶᚼᚴᚱ𓆀𓆀ᚷ𓈀ᚣᚣᚷ𓐬ᚤᚿᚶ</p>
          </div>
          
          <h2 className="font-mythic text-5xl md:text-7xl text-primary tracking-[0.1em] mb-4 drop-shadow-[0_0_30px_rgba(212,175,55,0.4)]">
            The Age of Scions
          </h2>
          <p className="text-muted-foreground uppercase tracking-[0.4em] text-sm mb-8">
            Mythos Reborn // System Online
          </p>
          
          <p className="max-w-3xl mx-auto text-muted-foreground/80 leading-relaxed mb-12">
            The World is not as it seems. The Gods are real, and their children walk among us. 
            You are one of them—a Scion, born of divine blood, destined for greatness or ruin.
          </p>

          {/* SCION SPOTLIGHT */}
          <div className="w-full max-w-6xl mx-auto px-8">
            <div className="flex items-center justify-center gap-2 mb-8">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-primary/30" />
              <span className="text-[10px] font-tech text-primary/60 uppercase tracking-[0.3em]">Scion Spotlight</span>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-primary/30" />
            </div>
            
            {isLoading ? (
              <div className="h-64 flex items-center justify-center">
                <p className="font-tech text-sm text-muted-foreground uppercase tracking-widest animate-pulse">Loading Scions...</p>
              </div>
            ) : characters.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 py-4">
                {characters.map((char) => (
                  <Link key={char.id} href={`/character-sheet/${char.id}`}>
                    <div className="group relative h-[340px] bg-black/80 border border-primary/20 transition-all duration-500 rounded-sm overflow-hidden cursor-pointer hover:shadow-[0_0_40px_rgba(212,175,55,0.3)] hover:-translate-y-2 hover:border-primary" data-testid={`card-scion-${char.id}`}>
                      <div className="absolute inset-0 z-0">
                        {char.portrait ? (
                          <img src={char.portrait} alt={char.name} className="w-full h-full object-cover opacity-50 group-hover:opacity-80 transition-all duration-500 group-hover:scale-105 filter grayscale group-hover:grayscale-0" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-b from-zinc-800 to-black" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
                      </div>
                      
                      <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col items-center text-center z-10">
                        <Shield className="w-6 h-6 text-primary mb-2 opacity-60 group-hover:opacity-100" />
                        <h3 className="font-mythic text-xl text-white group-hover:text-primary transition-colors tracking-widest uppercase mb-1">{char.name}</h3>
                        <p className="text-[10px] font-tech text-primary/70 uppercase tracking-[0.2em] mb-3">{char.pantheon || "Unknown"} Pantheon</p>
                        <div className="flex items-center gap-4 text-[9px] text-muted-foreground">
                          <span className="flex items-center gap-1"><User className="w-3 h-3" /> {char.player || "Unknown"}</span>
                          <span className="text-primary">Legend {char.legend}</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-primary/0 group-hover:text-primary transition-all duration-300 mt-3" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-16 flex flex-col items-center justify-center border border-dashed border-primary/20 rounded-sm bg-black/30 backdrop-blur-sm">
                <p className="font-tech text-sm text-muted-foreground uppercase tracking-widest mb-4">No Active Scions Found</p>
                <Link href="/admin">
                  <button className="text-xs text-primary hover:text-white border border-primary/30 hover:border-primary px-6 py-3 rounded-sm font-mythic uppercase tracking-wider flex items-center gap-2 transition-all hover:shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:bg-primary/10" data-testid="button-go-admin">
                    <Plus className="w-4 h-4" /> Criar no Admin Dashboard
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* THE WORLD STATE */}
      <section className="relative z-20 py-24 bg-gradient-to-b from-mythic-void to-black/90">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-mythic text-3xl text-primary tracking-[0.2em] mb-2">The World State</h2>
            <p className="text-[10px] text-muted-foreground uppercase tracking-[0.4em]">Contextual Reality Matrix</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {WORLD_STATE_CARDS.map((card) => (
              <div key={card.id} className="group relative overflow-hidden rounded-sm border border-primary/10 bg-black/40 hover:border-primary/40 transition-all duration-500 hover:shadow-[0_0_30px_rgba(212,175,55,0.1)]">
                <div className="h-48 overflow-hidden">
                  <img 
                    src={card.image} 
                    alt={card.title}
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
                </div>
                
                <div className="relative p-6">
                  <p className="text-[9px] text-primary/50 uppercase tracking-widest mb-1">{card.subtitle}</p>
                  <p className="text-[8px] text-muted-foreground/40 font-code mb-3">{card.sysId}</p>
                  <h3 className="font-mythic text-xl text-primary tracking-widest mb-3">{card.title}</h3>
                  <p className="text-xs text-muted-foreground/70 leading-relaxed line-clamp-3">{card.description}</p>
                  
                  <button className="mt-4 text-[10px] text-primary/70 hover:text-primary uppercase tracking-widest flex items-center gap-2 transition-colors">
                    Access More Data <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DIVINE ARCHITECTURE */}
      <section className="relative z-20 py-24 bg-black/80">
        <div 
          className="absolute inset-0 opacity-10 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1703660326512-98f12b0caf20')" }}
        />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="font-mythic text-3xl text-primary tracking-[0.2em] mb-2">Divine Architecture</h2>
            <p className="text-[10px] text-muted-foreground uppercase tracking-[0.4em]">System Core Mechanics</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Epic Attributes */}
            <div className="bg-black/60 border border-primary/20 rounded-sm p-6">
              <div className="flex items-center gap-2 mb-6">
                <Zap className="w-5 h-5 text-primary" />
                <h3 className="font-mythic text-lg text-primary tracking-widest">Epic Attributes</h3>
              </div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-4">SYS_MODULE_01 // The Pillars of Legends</p>
              
              <div className="flex gap-2 mb-6">
                {(["Physical", "Social", "Mental"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setEpicTab(tab)}
                    className={cn(
                      "px-4 py-2 text-[10px] uppercase tracking-widest transition-all rounded-sm",
                      epicTab === tab 
                        ? "bg-primary/20 text-primary border border-primary/40" 
                        : "text-muted-foreground hover:text-primary border border-transparent"
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              
              <div className="space-y-3">
                {EPIC_ATTRIBUTES[epicTab].map((attr) => (
                  <div key={attr.name} className="flex justify-between items-center p-3 bg-black/40 border border-primary/10 rounded-sm">
                    <span className="font-mythic text-primary tracking-widest">{attr.name}</span>
                    <span className="text-[10px] text-muted-foreground">{attr.knacks} Knacks</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Divine Purviews */}
            <div className="bg-black/60 border border-primary/20 rounded-sm p-6">
              <div className="flex items-center gap-2 mb-6">
                <Crown className="w-5 h-5 text-primary" />
                <h3 className="font-mythic text-lg text-primary tracking-widest">Divine Purviews</h3>
              </div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-4">SYS_MODULE_02 // Boons & Powers of the Gods</p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {PURVIEWS.map((purview) => (
                  <button
                    key={purview}
                    onClick={() => setSelectedPurview(purview)}
                    className={cn(
                      "px-3 py-1.5 text-[9px] uppercase tracking-widest transition-all rounded-sm",
                      selectedPurview === purview
                        ? "bg-primary/20 text-primary border border-primary/40"
                        : "text-muted-foreground hover:text-primary border border-primary/10 hover:border-primary/30"
                    )}
                  >
                    {purview}
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => setBoonModalOpen(true)}
                className="w-full flex items-center justify-center gap-2 py-3 bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 hover:border-primary/50 transition-all rounded-sm"
                data-testid="button-open-boons-catalog"
              >
                <Sparkles className="w-4 h-4" />
                <span className="text-xs uppercase tracking-widest font-tech">Open Boons Catalog</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ARSENAL */}
      <section className="relative z-20 py-24 bg-mythic-void">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sword className="w-5 h-5 text-primary" />
              <h2 className="font-mythic text-3xl text-primary tracking-[0.2em]">The Arsenal</h2>
            </div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-[0.4em]">Technical Specifications & Logistics</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Weapons Table */}
            <div className="lg:col-span-2 bg-black/60 border border-primary/20 rounded-sm p-6">
              <h3 className="font-mythic text-lg text-primary tracking-widest mb-4">Ballistics & Blades Database</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-[11px]">
                  <thead>
                    <tr className="border-b border-primary/20">
                      <th className="text-left py-2 px-3 text-primary/70 uppercase tracking-widest">Weapon</th>
                      <th className="text-center py-2 px-3 text-primary/70 uppercase tracking-widest">Dmg</th>
                      <th className="text-center py-2 px-3 text-primary/70 uppercase tracking-widest">Range</th>
                      <th className="text-center py-2 px-3 text-primary/70 uppercase tracking-widest">Cap</th>
                      <th className="text-left py-2 px-3 text-primary/70 uppercase tracking-widest">Tags</th>
                    </tr>
                  </thead>
                  <tbody>
                    {WEAPONS_DATA.map((w, i) => (
                      <tr key={i} className="border-b border-primary/5 hover:bg-primary/5 transition-colors">
                        <td className="py-2 px-3 text-foreground">{w.weapon}</td>
                        <td className="py-2 px-3 text-center text-primary">{w.dmg}</td>
                        <td className="py-2 px-3 text-center text-muted-foreground">{w.range}</td>
                        <td className="py-2 px-3 text-center text-muted-foreground">{w.cap}</td>
                        <td className="py-2 px-3 text-muted-foreground/70">{w.tags}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Loadouts */}
            <div className="bg-black/60 border border-primary/20 rounded-sm p-6">
              <h3 className="font-mythic text-lg text-primary tracking-widest mb-4">Standard Issue Loadouts</h3>
              <div className="space-y-4">
                {LOADOUTS.map((kit, i) => (
                  <div key={i} className="p-4 bg-black/40 border border-primary/10 rounded-sm">
                    <h4 className="font-mythic text-sm text-primary tracking-widest mb-2">{kit.name}</h4>
                    <p className="text-[10px] text-muted-foreground/70 leading-relaxed">{kit.items}</p>
                    <button className="mt-3 text-[9px] text-primary/50 hover:text-primary uppercase tracking-widest transition-colors">
                      Requisition Kit
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAROUTES WAYFINDER */}
      <section className="relative z-20 py-24 bg-black/80">
        <div 
          className="absolute inset-0 opacity-20 bg-cover bg-center"
          style={{ backgroundImage: "url('https://horizons-cdn.hostinger.com/48768f7b-4ea7-4749-9d28-adc9270c994b/4c26c981d52825c956e3aa6ca2bce029.jpg')" }}
        />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-2 mb-2">
              <MapPin className="w-5 h-5 text-primary" />
              <h2 className="font-mythic text-3xl text-primary tracking-[0.2em]">FAROUTES Wayfinder</h2>
            </div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-[0.4em]">Parallel Systems Interface</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-black/60 border border-primary/20 rounded-sm p-6 max-h-[500px] overflow-y-auto">
              <h3 className="font-mythic text-lg text-primary tracking-widest mb-4 sticky top-0 bg-black/90 py-2">
                Vectors <span className="text-muted-foreground text-sm">({LOCATIONS.length} LOC)</span>
              </h3>
              <div className="space-y-2">
                {LOCATIONS.map((loc) => (
                  <button
                    key={loc}
                    onClick={() => setSelectedLocation(loc)}
                    className={cn(
                      "w-full flex justify-between items-center p-3 text-left transition-all rounded-sm",
                      selectedLocation === loc
                        ? "bg-primary/20 border border-primary/40"
                        : "bg-black/40 border border-primary/5 hover:border-primary/20"
                    )}
                  >
                    <span className="text-[11px] text-foreground">{loc}</span>
                    <span className="text-[9px] text-muted-foreground/50 font-code">UNK-000-000</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-black/60 border border-primary/20 rounded-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-mythic text-lg text-primary tracking-widest">Target Lock</h3>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  <span className="text-[10px] text-primary">Connected</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-black/40 border border-primary/10 rounded-sm">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-2">GPS TARGET</p>
                  <p className="font-mythic text-primary tracking-widest">{selectedLocation}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-black/40 border border-primary/10 rounded-sm">
                    <p className="text-[9px] text-muted-foreground uppercase tracking-widest">Classification</p>
                    <p className="text-sm text-foreground">Local Indefinido</p>
                  </div>
                  <div className="p-3 bg-black/40 border border-primary/10 rounded-sm">
                    <p className="text-[9px] text-muted-foreground uppercase tracking-widest">Ownership</p>
                    <p className="text-sm text-foreground">Unknown</p>
                  </div>
                </div>
                
                <div className="p-4 bg-black/40 border border-primary/10 rounded-sm font-code text-[10px] text-muted-foreground">
                  <p>&gt;&gt; STANDBY FOR TELEMETRY DATA.</p>
                  <div className="flex gap-8 mt-2">
                    <span>LAT: 00.000</span>
                    <span>LONG: 00.000</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ALLEYBRARY ARCHIVES */}
      <section className="relative z-20 py-24 bg-mythic-void">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Archive className="w-5 h-5 text-primary" />
              <h2 className="font-mythic text-3xl text-primary tracking-[0.2em]">Alleybrary Archives</h2>
            </div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-[0.4em]">Encyclopaedia Mythologica</p>
          </div>

          <div className="flex justify-center gap-4 mb-8">
            {["Regras", "Crônicas", "Registros", "Enciclopédia"].map((tab) => (
              <button
                key={tab}
                className="px-4 py-2 text-[10px] uppercase tracking-widest text-muted-foreground hover:text-primary border border-primary/10 hover:border-primary/30 rounded-sm transition-all"
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-black/60 border border-primary/10 rounded-sm overflow-hidden hover:border-primary/30 transition-all group">
                <div className="h-40 bg-gradient-to-b from-zinc-800 to-black opacity-60" />
                <div className="p-4">
                  <p className="text-[9px] text-muted-foreground/50 font-code mb-2">ID: xxxx • Categoria</p>
                  <h4 className="font-mythic text-primary tracking-widest mb-2">Arquivo {i}</h4>
                  <p className="text-[10px] text-muted-foreground/70 line-clamp-2 mb-4">
                    Descrição do arquivo com informações relevantes sobre o conteúdo...
                  </p>
                  <Link href="/alleybrary">
                    <button className="text-[10px] text-primary/70 hover:text-primary uppercase tracking-widest flex items-center gap-2 transition-colors">
                      Open File <ChevronRight className="w-3 h-3" />
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/alleybrary">
              <button className="text-sm text-primary hover:text-white border border-primary/30 hover:border-primary px-8 py-3 rounded-sm font-mythic uppercase tracking-wider transition-all hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:bg-primary/10">
                <BookOpen className="w-4 h-4 inline mr-2" />
                Access Full Archives
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-20 py-8 border-t border-primary/10 bg-black/80">
        <div className="container mx-auto px-4 text-center">
          <p className="text-[10px] text-muted-foreground/50 uppercase tracking-[0.3em]">
            PANTHEONEXUS // Divine Access Terminal // V.2.5.0
          </p>
        </div>
      </footer>
    </div>
  );
}
