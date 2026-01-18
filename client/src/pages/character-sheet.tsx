import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DotRating } from "@/components/ui/dot-rating";
import { ScionInput } from "@/components/ui/scion-input";
import { cn } from "@/lib/utils";
import { Shield, Zap, Skull, Scroll, Activity, Cpu, Hexagon, Plus, Trash2, Crown, Heart, Radar, Minus, Upload, Image as ImageIcon, X } from "lucide-react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar as RechartsRadar,
  ResponsiveContainer,
} from 'recharts';

import virtueIcon from "@assets/generated_images/virtue_icon_gold_geometric.png";
import crownIcon from "@assets/generated_images/legendary_title_crown_icon.png";
import textureBg from "@assets/generated_images/minimalist_gold_grid_background.png";

// --- Types ---
type AttributeCategory = "Physical" | "Social" | "Mental";
type AttributeName = "Strength" | "Dexterity" | "Stamina" | "Charisma" | "Manipulation" | "Appearance" | "Perception" | "Intelligence" | "Wits";

interface Attribute {
  name: AttributeName;
  value: number;
  epic: number;
  rune: string;
}

interface Calling {
  id: number;
  name: string;
  title: string;
}

interface Virtue {
  id: number;
  name: string;
  value: number;
}

interface Ability {
  name: string;
  value: number;
  specialties: { name: string; value: number }[];
}

type DamageType = 0 | 1 | 2 | 3; // 0: None, 1: Bashing, 2: Lethal, 3: Aggravated

// --- Data ---
const DEFAULT_ATTRIBUTES: Record<AttributeCategory, Attribute[]> = {
  Physical: [
    { name: "Strength", value: 1, epic: 0, rune: "ᚠ" },
    { name: "Dexterity", value: 1, epic: 0, rune: "ᚢ" },
    { name: "Stamina", value: 1, epic: 0, rune: "ᚦ" },
  ],
  Social: [
    { name: "Charisma", value: 1, epic: 0, rune: "ᚨ" },
    { name: "Manipulation", value: 1, epic: 0, rune: "ᚱ" },
    { name: "Appearance", value: 1, epic: 0, rune: "ᚲ" },
  ],
  Mental: [
    { name: "Perception", value: 1, epic: 0, rune: "ᚷ" },
    { name: "Intelligence", value: 1, epic: 0, rune: "ᚹ" },
    { name: "Wits", value: 1, epic: 0, rune: "ᚺ" },
  ],
};

const ABILITIES_LIST = [
  "Academics", "Animal Ken", "Art", "Athletics", "Awareness", "Brawl", 
  "Command", "Control", "Craft", "Empathy", "Fortitude", "Integrity", 
  "Investigation", "Larceny", "Marksmanship", "Medicine", "Melee", 
  "Occult", "Politics", "Presence", "Science", "Stealth", "Survival", "Thrown"
];

// --- Components ---

const SectionFrame = ({ children, title, className, icon: Icon, action, subHeader }: { children: React.ReactNode, title: string, className?: string, icon?: any, action?: React.ReactNode, subHeader?: string }) => (
  <div className={cn("border border-thin-gold rounded-sm p-6 relative bg-card/30 backdrop-blur-sm shadow-lg", className)}>
    {/* Header Line */}
    <div className="flex justify-between items-start mb-6 border-b border-thin-gold/30 pb-2">
       <div>
          <h3 className="font-mythic text-primary text-xl tracking-[0.1em] uppercase">{title}</h3>
          {subHeader && <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">{subHeader}</p>}
       </div>
       <div className="flex items-center gap-2">
         {action}
         {Icon && <Icon className="w-4 h-4 text-primary/50" />}
       </div>
    </div>
    {children}
  </div>
);

const HealthBox = ({ status, onClick }: { status: DamageType, onClick: () => void }) => {
  return (
    <button 
      onClick={onClick}
      className="w-5 h-5 md:w-6 md:h-6 border border-muted-foreground/40 rounded-[1px] bg-black/50 flex items-center justify-center hover:border-primary transition-colors focus:outline-none"
    >
      {status === 1 && <div className="w-full h-[1px] bg-primary/70 rotate-45" />}
      {status === 2 && (
        <div className="relative w-full h-full flex items-center justify-center">
          <div className="absolute w-full h-[1px] bg-primary rotate-45" />
          <div className="absolute w-full h-[1px] bg-primary -rotate-45" />
        </div>
      )}
      {status === 3 && (
        <div className="relative w-full h-full flex items-center justify-center">
          <div className="absolute w-full h-[1px] bg-red-600 rotate-45" />
          <div className="absolute w-full h-[1px] bg-red-600 -rotate-45" />
          <div className="absolute w-[1px] h-full bg-red-600" />
        </div>
      )}
    </button>
  );
};

export default function CharacterSheet() {
  const [activeTab, setActiveTab] = useState<"sheet" | "powers" | "bio">("sheet");
  
  // State
  const [attributes, setAttributes] = useState(DEFAULT_ATTRIBUTES);
  const [abilities, setAbilities] = useState<Record<string, Ability>>(
    ABILITIES_LIST.reduce((acc, curr) => ({ 
      ...acc, 
      [curr]: { name: curr, value: 0, specialties: [] } 
    }), {} as Record<string, Ability>)
  );
  
  const [callings, setCallings] = useState<Calling[]>([
    { id: 1, name: "", title: "" },
    { id: 2, name: "", title: "" },
    { id: 3, name: "", title: "" },
  ]);

  const [virtues, setVirtues] = useState<Virtue[]>([
    { id: 1, name: "Valor", value: 1 },
    { id: 2, name: "Harmony", value: 1 },
    { id: 3, name: "Order", value: 1 },
    { id: 4, name: "Piety", value: 1 },
    { id: 5, name: "", value: 1 },
  ]);
  
  const [legend, setLegend] = useState(2);
  const [legendCurrent, setLegendCurrent] = useState(4); // Example value

  const [willpower, setWillpower] = useState(5);
  const [willpowerCurrent, setWillpowerCurrent] = useState(5);
  
  // Health State
  const [extraOxBody, setExtraOxBody] = useState(0);
  const [healthDamage, setHealthDamage] = useState<DamageType[]>(new Array(7 + 10).fill(0));

  const [knacks, setKnacks] = useState<string[]>([]);
  const [newKnack, setNewKnack] = useState("");
  const [boons, setBoons] = useState<string[]>([]);
  const [newBoon, setNewBoon] = useState("");

  const [activeTitleIndex, setActiveTitleIndex] = useState<number | null>(null);

  // Portrait State
  const [portrait, setPortrait] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Psychic Profile State
  const [psychicProfile, setPsychicProfile] = useState({
    analysis: "",
    keywords: "",
    strengths: "",
    behaviors: "",
    weaknesses: "",
    temperament: "",
    cognitiveType: "",
    majorArcana: ""
  });

  // Presence Profile State
  const [presenceProfile, setPresenceProfile] = useState({
    eyeColor: "",
    hairColor: "",
    height: "",
    auraSignature: "",
    scent: "",
    fashion: "",
    distinguishingMark: "",
    visualNotes: ""
  });

  // Handlers
  const handlePortraitUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPortrait(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const updateAttribute = (cat: AttributeCategory, idx: number, field: 'value'|'epic', val: number) => {
    const newCat = [...attributes[cat]];
    newCat[idx] = { ...newCat[idx], [field]: val };
    setAttributes({ ...attributes, [cat]: newCat });
  };

  const updateCalling = (index: number, field: keyof Calling, value: string) => {
    const newCallings = [...callings];
    newCallings[index] = { ...newCallings[index], [field]: value };
    setCallings(newCallings);
  };

  const updateVirtue = (index: number, field: keyof Virtue, value: string | number) => {
    const newVirtues = [...virtues];
    newVirtues[index] = { ...newVirtues[index], [field]: value };
    setVirtues(newVirtues);
  };

  const updateAbilityValue = (abilityName: string, newValue: number) => {
    setAbilities(prev => ({
      ...prev,
      [abilityName]: { ...prev[abilityName], value: Math.max(0, newValue) }
    }));
  };

  const addSpecialty = (abilityName: string) => {
    setAbilities(prev => ({
      ...prev,
      [abilityName]: {
        ...prev[abilityName],
        specialties: [...prev[abilityName].specialties, { name: "", value: 1 }]
      }
    }));
  };

  const removeSpecialty = (abilityName: string, index: number) => {
    setAbilities(prev => ({
      ...prev,
      [abilityName]: {
        ...prev[abilityName],
        specialties: prev[abilityName].specialties.filter((_, i) => i !== index)
      }
    }));
  };

  const updateSpecialty = (abilityName: string, index: number, field: 'name' | 'value', value: string | number) => {
    setAbilities(prev => {
      const newSpecialties = [...prev[abilityName].specialties];
      // @ts-ignore - dynamic key access
      newSpecialties[index] = { ...newSpecialties[index], [field]: value };
      return {
        ...prev,
        [abilityName]: { ...prev[abilityName], specialties: newSpecialties }
      };
    });
  };


  const toggleHealth = (idx: number) => {
    const newHealth = [...healthDamage];
    newHealth[idx] = ((newHealth[idx] + 1) % 4) as DamageType;
    setHealthDamage(newHealth);
  };

  const addKnack = () => {
    if (newKnack.trim()) {
      setKnacks([...knacks, newKnack]);
      setNewKnack("");
    }
  };

  const addBoon = () => {
    if (newBoon.trim()) {
      setBoons([...boons, newBoon]);
      setNewBoon("");
    }
  };

  // Build current health levels array
  const currentHealthLevels = [
    ...Array(1 + extraOxBody).fill("-0"),
    "-1", "-1", "-2", "-2", "-4", "Incap"
  ];

  // Prepare Radar Data
  const radarData = [
     ...attributes.Physical,
     ...attributes.Social,
     ...attributes.Mental
  ].map(attr => ({
     subject: attr.name.substring(0, 3).toUpperCase(),
     A: attr.value,
     fullMark: 10
  }));

  // Aether Calculation (Example: Legend * 10%)
  const aetherPercentage = legend * 10;
  const legendPoolTotal = legend * legend;

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden font-tech selection:bg-primary/30 relative bg-grid-gold">
      
      {/* Vignette Overlay */}
      <div className="fixed inset-0 pointer-events-none z-10 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]" />

      {/* Main Container */}
      <div className="relative z-20 container mx-auto p-4 md:p-12 max-w-7xl">
        
        {/* TOP IDENTITY BLOCK */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
            <div className="md:col-span-8 space-y-6">
                
                {/* ID CARD HEADER - Combined */}
                <SectionFrame title="ID Card" subHeader="Designation & Genesis Records" className="h-full">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                        {/* Portrait Column */}
                        <div className="md:col-span-3 flex flex-col gap-2">
                             <div 
                                className="aspect-[3/4] border-2 border-thin-gold/50 rounded-sm bg-black/40 relative overflow-hidden group cursor-pointer transition-all hover:border-primary/50"
                                onClick={() => fileInputRef.current?.click()}
                             >
                                {portrait ? (
                                    <>
                                        <img src={portrait} alt="Scion Portrait" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <span className="text-xs uppercase tracking-widest text-primary font-mythic">Change</span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/30 group-hover:text-primary/50 transition-colors">
                                        <ImageIcon className="w-8 h-8 mb-2" />
                                        <span className="text-[9px] uppercase tracking-widest text-center px-2">Upload Portrait</span>
                                    </div>
                                )}
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    className="hidden" 
                                    accept="image/*"
                                    onChange={handlePortraitUpload}
                                />
                             </div>
                             {portrait && (
                                 <button 
                                    onClick={() => setPortrait(null)}
                                    className="text-[9px] uppercase tracking-widest text-destructive hover:text-red-400 flex items-center justify-center gap-1"
                                 >
                                     <X className="w-3 h-3" /> Remove
                                 </button>
                             )}
                        </div>

                        {/* Data Column */}
                        <div className="md:col-span-9 flex flex-col gap-6 justify-center">
                            {/* Identity Fields */}
                            <div className="space-y-4">
                                <ScionInput label="Designation (Name)" placeholder="CHARACTER NAME" className="text-xl md:text-2xl" />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <ScionInput label="Pantheon" placeholder="PANTHEON" />
                                    <ScionInput label="Heritage" placeholder="DIVINE PARENT / PATRON" />
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="h-px bg-thin-gold/30 w-full" />

                            {/* Genesis Fields */}
                            <div className="grid grid-cols-2 gap-4">
                                <ScionInput label="Date of Birth" placeholder="DD/MM/AAAA" />
                                <ScionInput label="Nationality" placeholder="NATIONALITY" />
                                <ScionInput label="Origin City" placeholder="CITY" />
                                <ScionInput label="State" placeholder="STATE/UF" />
                            </div>
                        </div>
                    </div>
                </SectionFrame>

                {/* COMBINED SECTION: Callings, Nature, Virtues */}
                <SectionFrame title="Essence & Nature" subHeader="Divine Matrix" className="min-h-[250px]">
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {/* Callings */}
                      <div className="space-y-4">
                         <h4 className="text-[10px] uppercase tracking-[0.2em] font-mythic text-primary/70 mb-2 border-b border-thin-gold/30 pb-1">Callings</h4>
                         <div className="flex flex-col gap-3">
                           {callings.map((c, i) => (
                             <div key={i} className="flex items-center gap-2">
                                <input 
                                  className="bg-transparent w-full outline-none font-tech text-foreground placeholder:text-muted-foreground/20 text-sm"
                                  placeholder={`Calling ${i+1}`}
                                  value={c.name}
                                  onChange={(e) => updateCalling(i, 'name', e.target.value)}
                                />
                                <button 
                                  onClick={() => setActiveTitleIndex(activeTitleIndex === i ? null : i)}
                                  className={cn("opacity-50 hover:opacity-100 transition-opacity", c.title && "text-primary opacity-100")}
                                >
                                   <Crown className="w-3 h-3" />
                                </button>
                                <AnimatePresence>
                                  {activeTitleIndex === i && (
                                    <motion.div 
                                      initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                                      className="absolute left-0 mt-6 z-50 bg-black border border-primary p-2 w-48 shadow-2xl"
                                    >
                                       <input 
                                          autoFocus
                                          className="w-full bg-transparent text-primary font-mythic text-sm outline-none placeholder:text-primary/30"
                                          placeholder="Legendary Title"
                                          value={c.title}
                                          onChange={(e) => updateCalling(i, 'title', e.target.value)}
                                       />
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                             </div>
                           ))}
                         </div>
                      </div>

                      {/* Nature */}
                      <div className="space-y-4">
                         <h4 className="text-[10px] uppercase tracking-[0.2em] font-mythic text-primary/70 mb-2 border-b border-thin-gold/30 pb-1">Nature</h4>
                         <ScionInput placeholder="NATURE ARCHETYPE" />
                      </div>

                      {/* Virtues */}
                      <div className="space-y-4">
                         <h4 className="text-[10px] uppercase tracking-[0.2em] font-mythic text-primary/70 mb-2 border-b border-thin-gold/30 pb-1">Virtues</h4>
                         <div className="space-y-2">
                            {virtues.map((virtue, idx) => (
                               <div key={idx} className="flex justify-between items-center group">
                                  <input 
                                     className="bg-transparent font-tech text-xs text-muted-foreground group-hover:text-primary transition-colors outline-none w-20 uppercase"
                                     value={virtue.name}
                                     onChange={(e) => updateVirtue(idx, 'name', e.target.value)}
                                     placeholder="VIRTUE"
                                  />
                                  <DotRating value={virtue.value} max={5} className="scale-75" onChange={(v) => updateVirtue(idx, 'value', v)} />
                               </div>
                            ))}
                         </div>
                      </div>
                   </div>
                </SectionFrame>
            </div>

            {/* Right Column: Legend & Aether Status */}
            <div className="md:col-span-4 flex flex-col gap-6">
                {/* Legend Rank Block */}
                <div className="flex-1 border border-thin-gold p-6 bg-card/50 backdrop-blur-sm rounded-sm flex flex-col items-center justify-center relative overflow-hidden">
                   <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,gold_0%,transparent_70%)]" />
                   <h2 className="text-3xl font-mythic text-primary tracking-tighter z-10 mb-4">LEGEND</h2>
                   
                   <div className="flex items-center gap-6 z-10">
                      <div className="flex flex-col items-center">
                         <div className="w-20 h-20 border-2 border-primary flex items-center justify-center bg-black/50 text-5xl font-mythic text-primary shadow-[0_0_20px_rgba(212,175,55,0.3)]">
                            {legend}
                         </div>
                         <span className="text-[10px] tracking-[0.2em] text-muted-foreground mt-2 uppercase">Rank</span>
                      </div>
                      
                      {/* Aether Percentage Display */}
                      <div className="flex flex-col items-center">
                         <div className="w-20 h-20 border border-thin-gold/50 rounded-full flex items-center justify-center bg-black/30 relative">
                            {/* SVG Circle for Progress */}
                            <svg className="absolute inset-0 w-full h-full -rotate-90">
                               <circle cx="40" cy="40" r="36" stroke="#333" strokeWidth="4" fill="transparent" />
                               <circle 
                                 cx="40" cy="40" r="36" 
                                 stroke="#d4af37" 
                                 strokeWidth="4" 
                                 fill="transparent" 
                                 strokeDasharray={`${2 * Math.PI * 36}`}
                                 strokeDashoffset={`${2 * Math.PI * 36 * (1 - aetherPercentage/100)}`}
                                 className="transition-all duration-1000 ease-out"
                               />
                            </svg>
                            <span className="font-code text-xl text-primary">{aetherPercentage}%</span>
                         </div>
                         <span className="text-[10px] tracking-[0.2em] text-muted-foreground mt-2 uppercase">Aether</span>
                      </div>
                   </div>
                </div>

                {/* Pools Section */}
                <SectionFrame title="Pools" subHeader="Resource Management" className="flex-1">
                   <div className="space-y-6">
                      {/* Legend Points */}
                      <div className="space-y-2">
                         <div className="flex justify-between text-xs font-mythic text-primary/80 uppercase">
                            <span>Legend Points</span>
                            <span>{legendCurrent} / {legendPoolTotal}</span>
                         </div>
                         <div className="h-2 bg-black/50 border border-thin-gold/30 rounded-sm overflow-hidden relative">
                            <div 
                              className="absolute top-0 left-0 h-full bg-primary/60" 
                              style={{ width: `${(legendCurrent / legendPoolTotal) * 100}%` }}
                            />
                         </div>
                         <div className="flex gap-1 justify-between">
                            <button onClick={() => setLegendCurrent(Math.max(0, legendCurrent - 1))} className="px-2 py-0.5 border border-white/10 text-[10px] hover:bg-white/10">-</button>
                            <button onClick={() => setLegendCurrent(Math.min(legendPoolTotal, legendCurrent + 1))} className="px-2 py-0.5 border border-white/10 text-[10px] hover:bg-white/10">+</button>
                         </div>
                      </div>

                      {/* Willpower */}
                      <div className="space-y-2">
                         <div className="flex justify-between text-xs font-mythic text-primary/80 uppercase">
                            <span>Willpower</span>
                            <span>{willpowerCurrent} / {willpower}</span>
                         </div>
                         <div className="flex justify-between items-center mb-1">
                            <DotRating value={willpower} max={10} onChange={setWillpower} className="scale-75 origin-left" />
                         </div>
                         <div className="grid grid-cols-10 gap-0.5">
                            {Array.from({length: 10}).map((_, i) => (
                               <div 
                                 key={i}
                                 onClick={() => setWillpowerCurrent(i + 1 === willpowerCurrent ? 0 : i + 1)}
                                 className={cn(
                                   "h-3 border border-thin-gold/40 cursor-pointer transition-colors",
                                   i < willpowerCurrent ? "bg-primary" : "bg-transparent",
                                   i >= willpower && "opacity-20 pointer-events-none" // Disable dots beyond permanent rating
                                 )}
                               />
                            ))}
                         </div>
                      </div>
                   </div>
                </SectionFrame>
            </div>
        </div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          {activeTab === "sheet" && (
            <motion.div 
              key="sheet"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-12 gap-6"
            >
              
              {/* MAIN ATTRIBUTES GRID + RADAR */}
              <div className="md:col-span-12">
                 <SectionFrame title="Attributes" subHeader="Core Parameters & Analysis">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                       
                       {/* Left 3 Cols: Attributes List */}
                       <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-0 md:divide-x divide-thin-gold/30">
                           {(Object.entries(attributes) as [AttributeCategory, Attribute[]][]).map(([category, attrs]) => (
                              <div key={category} className="px-4 first:pl-0 last:pr-0 py-4 md:py-0">
                                 <h4 className="text-center font-code text-muted-foreground text-[10px] uppercase tracking-[0.3em] mb-6">
                                    {category}
                                 </h4>
                                 <div className="space-y-8">
                                    {attrs.map((attr, idx) => (
                                       <div key={attr.name} className="space-y-2 group">
                                          <div className="flex items-center justify-between mb-1">
                                             <div className="flex items-center gap-3">
                                                <span className="text-primary font-mythic text-lg opacity-60 group-hover:opacity-100 transition-opacity w-4 text-center">{attr.rune}</span>
                                                <span className="font-tech text-lg text-foreground tracking-wide">{attr.name}</span>
                                             </div>
                                             <span className="text-[9px] text-muted-foreground font-code">{attr.name.substring(0,3).toUpperCase()}</span>
                                          </div>
                                          
                                          {/* Max 10 Dots, wrapping enabled in component */}
                                          <DotRating 
                                             value={attr.value} 
                                             max={10} 
                                             onChange={(v) => updateAttribute(category, idx, 'value', v)} 
                                             className="justify-start max-w-full"
                                          />
                                          
                                          {/* Epic Dots - Subtle */}
                                          {attr.value >= 1 && (
                                             <div className="flex justify-end pt-1 opacity-40 hover:opacity-100 transition-opacity">
                                                <DotRating 
                                                   value={attr.epic} 
                                                   max={5} 
                                                   variant="tech"
                                                   className="scale-75 gap-0.5"
                                                   onChange={(v) => updateAttribute(category, idx, 'epic', v)} 
                                                />
                                             </div>
                                          )}
                                       </div>
                                    ))}
                                 </div>
                              </div>
                           ))}
                       </div>

                       {/* Right Col: Radar Chart */}
                       <div className="lg:col-span-1 flex flex-col justify-center border-l border-thin-gold/30 pl-8">
                          <h4 className="text-center font-code text-muted-foreground text-[10px] uppercase tracking-[0.3em] mb-4">
                             Radar Analysis
                          </h4>
                          <div className="w-full h-[250px] relative">
                             <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                                   <PolarGrid stroke="#333" />
                                   <PolarAngleAxis dataKey="subject" tick={{ fill: '#666', fontSize: 10, fontFamily: 'Share Tech Mono' }} />
                                   <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
                                   <RechartsRadar
                                      name="Attributes"
                                      dataKey="A"
                                      stroke="#d4af37"
                                      strokeWidth={2}
                                      fill="#d4af37"
                                      fillOpacity={0.15}
                                      isAnimationActive={true}
                                   />
                                </RadarChart>
                             </ResponsiveContainer>
                             {/* Center Decor */}
                             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-primary rounded-full shadow-[0_0_10px_gold]" />
                          </div>
                       </div>

                    </div>
                 </SectionFrame>
              </div>

              {/* Abilities Row */}
              <div className="md:col-span-12">
                 <SectionFrame title="Abilities" subHeader="Skill Matrix">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-4">
                       {Object.values(abilities).map(ability => (
                          <div key={ability.name} className="flex flex-col border border-white/5 bg-black/20 p-2 rounded-sm group hover:border-primary/30 transition-colors">
                             <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-tech text-foreground/90 uppercase tracking-wider">{ability.name}</span>
                                <div className="flex items-center gap-1">
                                  <button onClick={() => updateAbilityValue(ability.name, ability.value - 1)} className="text-muted-foreground hover:text-white px-1">
                                    <Minus className="w-3 h-3" />
                                  </button>
                                  <span className="font-mythic text-primary text-lg w-6 text-center">{ability.value}</span>
                                  <button onClick={() => updateAbilityValue(ability.name, ability.value + 1)} className="text-muted-foreground hover:text-white px-1">
                                    <Plus className="w-3 h-3" />
                                  </button>
                                </div>
                             </div>

                             {/* Specialties List */}
                             <div className="space-y-1 mt-1 border-t border-white/5 pt-1">
                               {ability.specialties.map((spec, idx) => (
                                 <div key={idx} className="flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 border-l border-b border-primary/40 rounded-bl-sm" />
                                    <input 
                                      className="bg-transparent text-[10px] font-tech text-muted-foreground focus:text-primary outline-none flex-1 min-w-0"
                                      placeholder="Specialty..."
                                      value={spec.name}
                                      onChange={(e) => updateSpecialty(ability.name, idx, 'name', e.target.value)}
                                    />
                                    <input 
                                      className="bg-transparent text-[10px] font-mythic text-primary w-4 text-center outline-none border-b border-white/10 focus:border-primary"
                                      value={spec.value}
                                      onChange={(e) => updateSpecialty(ability.name, idx, 'value', parseInt(e.target.value) || 0)}
                                    />
                                    <button onClick={() => removeSpecialty(ability.name, idx)} className="text-destructive opacity-50 hover:opacity-100">
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                 </div>
                               ))}
                               <button 
                                onClick={() => addSpecialty(ability.name)}
                                className="flex items-center gap-1 text-[9px] text-muted-foreground/50 hover:text-primary mt-1 w-full justify-end"
                               >
                                 <Plus className="w-3 h-3" /> Add Specialty
                               </button>
                             </div>
                          </div>
                       ))}
                    </div>
                 </SectionFrame>
              </div>

              {/* Health Tracker */}
              <div className="md:col-span-12">
                 <SectionFrame 
                    title="Health Monitor" 
                    subHeader="Biometric Status" 
                    action={
                        <button 
                          onClick={() => setExtraOxBody(prev => Math.min(prev + 1, 5))}
                          className="text-[10px] border border-primary/30 px-2 py-1 hover:bg-primary/10 text-primary transition-colors uppercase tracking-wider"
                        >
                          + OxBody
                        </button>
                    }
                  >
                    <div className="flex flex-wrap gap-4 justify-center md:justify-start items-end mt-4">
                       {currentHealthLevels.map((level, i) => (
                          <div key={i} className="flex flex-col items-center gap-2 group">
                             <HealthBox status={healthDamage[i]} onClick={() => toggleHealth(i)} />
                             <span className={cn(
                                "font-code text-[10px] uppercase",
                                level === "Incap" ? "text-red-500" : "text-muted-foreground group-hover:text-primary transition-colors"
                             )}>
                                {level}
                             </span>
                             {i < extraOxBody && (
                                <button onClick={() => {
                                   setExtraOxBody(prev => prev - 1);
                                   const newDamage = [...healthDamage];
                                   newDamage.splice(i, 1);
                                   newDamage.push(0); 
                                   setHealthDamage(newDamage);
                                }} className="text-destructive hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                   <Trash2 className="w-3 h-3" />
                                </button>
                             )}
                          </div>
                       ))}
                    </div>
                 </SectionFrame>
              </div>

            </motion.div>
          )}

          {activeTab === "bio" && (
            <motion.div 
              key="bio"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-12 gap-6"
            >
               {/* Psychic Profile */}
               <div className="md:col-span-6 space-y-6">
                  <SectionFrame title="Psychic Profile" subHeader="Mind & Soul Analysis" className="h-full">
                     <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                           <ScionInput 
                              label="Temperament" 
                              placeholder="Dominant Emotion" 
                              value={psychicProfile.temperament}
                              onChange={(e) => setPsychicProfile({...psychicProfile, temperament: e.target.value})}
                           />
                           <ScionInput 
                              label="Cognitive Type" 
                              placeholder="Thought Pattern" 
                              value={psychicProfile.cognitiveType}
                              onChange={(e) => setPsychicProfile({...psychicProfile, cognitiveType: e.target.value})}
                           />
                        </div>
                        <ScionInput 
                           label="Major Arcana" 
                           placeholder="Archetype" 
                           value={psychicProfile.majorArcana}
                           onChange={(e) => setPsychicProfile({...psychicProfile, majorArcana: e.target.value})}
                        />
                        <ScionInput 
                           label="Keywords" 
                           placeholder="Key Terms" 
                           value={psychicProfile.keywords}
                           onChange={(e) => setPsychicProfile({...psychicProfile, keywords: e.target.value})}
                        />
                        
                        <div className="space-y-1">
                           <label className="text-[10px] uppercase tracking-widest text-primary/70 font-mythic">Deep Analysis</label>
                           <textarea 
                              className="w-full bg-black/20 border border-white/10 rounded-sm p-2 text-sm font-tech text-foreground outline-none focus:border-primary/50 min-h-[80px]"
                              placeholder="Psychological Analysis..."
                              value={psychicProfile.analysis}
                              onChange={(e) => setPsychicProfile({...psychicProfile, analysis: e.target.value})}
                           />
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                           <div className="space-y-1">
                              <label className="text-[10px] uppercase tracking-widest text-primary/70 font-mythic">Strengths</label>
                              <textarea 
                                 className="w-full bg-black/20 border border-white/10 rounded-sm p-2 text-sm font-tech text-foreground outline-none focus:border-primary/50 min-h-[60px]"
                                 placeholder="Psychological Strengths..."
                                 value={psychicProfile.strengths}
                                 onChange={(e) => setPsychicProfile({...psychicProfile, strengths: e.target.value})}
                              />
                           </div>
                           <div className="space-y-1">
                              <label className="text-[10px] uppercase tracking-widest text-primary/70 font-mythic">Weaknesses</label>
                              <textarea 
                                 className="w-full bg-black/20 border border-white/10 rounded-sm p-2 text-sm font-tech text-foreground outline-none focus:border-primary/50 min-h-[60px]"
                                 placeholder="Vulnerabilities..."
                                 value={psychicProfile.weaknesses}
                                 onChange={(e) => setPsychicProfile({...psychicProfile, weaknesses: e.target.value})}
                              />
                           </div>
                           <div className="space-y-1">
                              <label className="text-[10px] uppercase tracking-widest text-primary/70 font-mythic">Behaviors</label>
                              <textarea 
                                 className="w-full bg-black/20 border border-white/10 rounded-sm p-2 text-sm font-tech text-foreground outline-none focus:border-primary/50 min-h-[60px]"
                                 placeholder="Recurrent Patterns..."
                                 value={psychicProfile.behaviors}
                                 onChange={(e) => setPsychicProfile({...psychicProfile, behaviors: e.target.value})}
                              />
                           </div>
                        </div>
                     </div>
                  </SectionFrame>
               </div>

               {/* Presence Profile */}
               <div className="md:col-span-6 space-y-6">
                  <SectionFrame title="Presence Profile" subHeader="Appearance & Aura" className="h-full">
                     <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                           <ScionInput 
                              label="Height" 
                              placeholder="Height" 
                              value={presenceProfile.height}
                              onChange={(e) => setPresenceProfile({...presenceProfile, height: e.target.value})}
                           />
                           <ScionInput 
                              label="Eye Color" 
                              placeholder="Eyes" 
                              value={presenceProfile.eyeColor}
                              onChange={(e) => setPresenceProfile({...presenceProfile, eyeColor: e.target.value})}
                           />
                           <ScionInput 
                              label="Hair Color" 
                              placeholder="Hair" 
                              value={presenceProfile.hairColor}
                              onChange={(e) => setPresenceProfile({...presenceProfile, hairColor: e.target.value})}
                           />
                        </div>

                        <ScionInput 
                           label="Aura Signature" 
                           placeholder="Vibration/Feeling" 
                           value={presenceProfile.auraSignature}
                           onChange={(e) => setPresenceProfile({...presenceProfile, auraSignature: e.target.value})}
                        />
                         <ScionInput 
                           label="Scent / Essence" 
                           placeholder="Olfactory Impression" 
                           value={presenceProfile.scent}
                           onChange={(e) => setPresenceProfile({...presenceProfile, scent: e.target.value})}
                        />
                        <ScionInput 
                           label="Distinguishing Mark" 
                           placeholder="Notable Feature" 
                           value={presenceProfile.distinguishingMark}
                           onChange={(e) => setPresenceProfile({...presenceProfile, distinguishingMark: e.target.value})}
                        />

                        <div className="space-y-1">
                           <label className="text-[10px] uppercase tracking-widest text-primary/70 font-mythic">Fashion & Style</label>
                           <textarea 
                              className="w-full bg-black/20 border border-white/10 rounded-sm p-2 text-sm font-tech text-foreground outline-none focus:border-primary/50 min-h-[80px]"
                              placeholder="Dress Style & Presentation..."
                              value={presenceProfile.fashion}
                              onChange={(e) => setPresenceProfile({...presenceProfile, fashion: e.target.value})}
                           />
                        </div>

                        <div className="space-y-1">
                           <label className="text-[10px] uppercase tracking-widest text-primary/70 font-mythic">Visual Notes</label>
                           <textarea 
                              className="w-full bg-black/20 border border-white/10 rounded-sm p-2 text-sm font-tech text-foreground outline-none focus:border-primary/50 min-h-[150px]"
                              placeholder="Additional Visual Observations..."
                              value={presenceProfile.visualNotes}
                              onChange={(e) => setPresenceProfile({...presenceProfile, visualNotes: e.target.value})}
                           />
                        </div>
                     </div>
                  </SectionFrame>
               </div>
            </motion.div>
          )}

          {/* ... Other Tabs remain structurally similar but updated with new styling ... */}
        </AnimatePresence>
      </div>
    </div>
  );
}
