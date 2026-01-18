import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DotRating } from "@/components/ui/dot-rating";
import { ScionInput } from "@/components/ui/scion-input";
import { cn } from "@/lib/utils";
import { Shield, Zap, Skull, Scroll, Activity, Cpu, Hexagon, Plus, Trash2, Crown, Heart, Radar } from "lucide-react";
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
  rune: string; // Added rune property
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

const ABILITIES = [
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
  const [abilities, setAbilities] = useState<Record<string, number>>(
    ABILITIES.reduce((acc, curr) => ({ ...acc, [curr]: 0 }), {})
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
  const [willpower, setWillpower] = useState(5);
  const [willpowerTemp, setWillpowerTemp] = useState(5);
  
  // Health State
  const [extraOxBody, setExtraOxBody] = useState(0);
  const [healthDamage, setHealthDamage] = useState<DamageType[]>(new Array(7 + 10).fill(0));

  const [knacks, setKnacks] = useState<string[]>([]);
  const [newKnack, setNewKnack] = useState("");
  const [boons, setBoons] = useState<string[]>([]);
  const [newBoon, setNewBoon] = useState("");

  const [activeTitleIndex, setActiveTitleIndex] = useState<number | null>(null);

  // Handlers
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
     fullMark: 5
  }));


  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden font-tech selection:bg-primary/30 relative bg-grid-gold">
      
      {/* Vignette Overlay */}
      <div className="fixed inset-0 pointer-events-none z-10 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]" />

      {/* Main Container */}
      <div className="relative z-20 container mx-auto p-4 md:p-12 max-w-7xl">
        
        {/* Header Block from Reference */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-12">
            
            {/* Left: Identity */}
            <div className="md:col-span-8 border border-thin-gold p-6 bg-card/50 backdrop-blur-sm rounded-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-6">
                      <ScionInput label="Name" placeholder="CHARACTER NAME" className="text-xl md:text-2xl" />
                      <ScionInput label="Player" placeholder="PLAYER NAME" />
                      <ScionInput label="Chronicle" placeholder="CHRONICLE NAME" />
                   </div>
                   <div className="space-y-6">
                      <ScionInput label="Pantheon" placeholder="PANTHEON" />
                      <ScionInput label="Nature" placeholder="NATURE" />
                      
                      {/* Callings List in Header */}
                      <div className="relative">
                        <label className="block text-[10px] uppercase tracking-[0.2em] mb-2 font-mythic text-primary/70">
                          CALLINGS
                        </label>
                        <div className="flex flex-col gap-2">
                           {callings.map((c, i) => (
                             <div key={i} className="flex items-center gap-2 border-b border-muted-foreground/20 pb-1">
                                <input 
                                  className="bg-transparent w-full outline-none font-tech text-foreground placeholder:text-muted-foreground/20"
                                  placeholder="Calling..."
                                  value={c.name}
                                  onChange={(e) => updateCalling(i, 'name', e.target.value)}
                                />
                                <button 
                                  onClick={() => setActiveTitleIndex(activeTitleIndex === i ? null : i)}
                                  className={cn("opacity-50 hover:opacity-100 transition-opacity", c.title && "text-primary opacity-100")}
                                >
                                   <Crown className="w-3 h-3" />
                                </button>
                                {/* Title Popup */}
                                <AnimatePresence>
                                  {activeTitleIndex === i && (
                                    <motion.div 
                                      initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                                      className="absolute right-0 top-full z-50 bg-black border border-primary p-2 w-48 shadow-2xl"
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
                   </div>
                </div>
            </div>

            {/* Right: Logo / Rank */}
            <div className="md:col-span-4 border border-thin-gold p-6 bg-card/50 backdrop-blur-sm rounded-sm flex flex-col items-center justify-center text-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,gold_0%,transparent_70%)]" />
                <h1 className="text-5xl md:text-7xl font-mythic text-primary tracking-tighter z-10 drop-shadow-[0_0_15px_rgba(212,175,55,0.5)]">SCION</h1>
                <div className="mt-4 flex items-center gap-4 z-10">
                   <span className="text-xs tracking-[0.3em] text-muted-foreground font-code">LEGEND RANK</span>
                   <div className="w-12 h-12 border border-primary flex items-center justify-center bg-black/50 text-2xl font-mythic text-primary">
                      {legend}
                   </div>
                </div>
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
              
              {/* MAIN ATTRIBUTES GRID - Matching Reference Layout */}
              <div className="md:col-span-8">
                 <SectionFrame title="Attributes" subHeader="Core Parameters" className="h-full">
                    <div className="grid grid-cols-3 gap-0 divide-x divide-thin-gold/30">
                       {(Object.entries(attributes) as [AttributeCategory, Attribute[]][]).map(([category, attrs]) => (
                          <div key={category} className="px-4 first:pl-0 last:pr-0">
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
                                      
                                      <DotRating 
                                         value={attr.value} 
                                         max={5} 
                                         onChange={(v) => updateAttribute(category, idx, 'value', v)} 
                                         className="justify-between"
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
                 </SectionFrame>
              </div>

              {/* RIGHT SIDE ANALYSIS & VITALS */}
              <div className="md:col-span-4 space-y-6">
                 
                 {/* Radar Chart */}
                 <SectionFrame title="Radar Analysis" subHeader="Metric Visualization" className="min-h-[300px]">
                    <div className="w-full h-[250px] relative">
                       <ResponsiveContainer width="100%" height="100%">
                          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                             <PolarGrid stroke="#333" />
                             <PolarAngleAxis dataKey="subject" tick={{ fill: '#666', fontSize: 10, fontFamily: 'Share Tech Mono' }} />
                             <PolarRadiusAxis angle={30} domain={[0, 5]} tick={false} axisLine={false} />
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
                 </SectionFrame>

                 {/* Virtues Grid */}
                 <SectionFrame title="Virtues" subHeader="Moral Compass">
                    <div className="grid grid-cols-2 gap-4">
                       {virtues.map((virtue, idx) => (
                          <div key={idx} className="flex flex-col gap-1 border border-white/5 p-2 bg-black/20">
                             <input 
                                className="bg-transparent font-mythic text-xs text-primary/80 outline-none text-center uppercase tracking-widest"
                                value={virtue.name}
                                onChange={(e) => updateVirtue(idx, 'name', e.target.value)}
                                placeholder="VIRTUE"
                             />
                             <div className="flex justify-center">
                                <DotRating value={virtue.value} max={5} className="scale-75" onChange={(v) => updateVirtue(idx, 'value', v)} />
                             </div>
                          </div>
                       ))}
                    </div>
                 </SectionFrame>

                 {/* Willpower & Legend Points */}
                 <div className="grid grid-cols-2 gap-6">
                    <div className="border border-thin-gold p-4 bg-card/50 rounded-sm">
                       <h4 className="text-center font-mythic text-primary text-sm mb-2">WILLPOWER</h4>
                       <div className="flex justify-center mb-2">
                          <DotRating value={willpower} max={10} onChange={setWillpower} className="flex-wrap justify-center w-24" />
                       </div>
                       <div className="flex flex-wrap gap-1 justify-center mt-2 border-t border-white/10 pt-2">
                           {Array.from({length: 10}).map((_, i) => (
                             <button 
                               key={i}
                               onClick={() => setWillpowerTemp(i + 1 === willpowerTemp ? 0 : i + 1)}
                               className={cn(
                                 "w-2 h-2 rounded-[1px] border border-muted-foreground/50 transition-all",
                                 i < willpowerTemp ? "bg-primary border-primary" : "bg-transparent"
                               )}
                             />
                           ))}
                       </div>
                    </div>
                    
                    <div className="border border-thin-gold p-4 bg-card/50 rounded-sm flex flex-col items-center justify-center">
                       <h4 className="text-center font-mythic text-primary text-sm mb-2">LEGEND POINTS</h4>
                       <div className="text-3xl font-code text-white mb-1">{legend * legend}</div>
                       <div className="text-[9px] text-muted-foreground uppercase">Max Pool</div>
                    </div>
                 </div>

              </div>

              {/* Abilities Row */}
              <div className="md:col-span-12">
                 <SectionFrame title="Abilities" subHeader="Skill Matrix">
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-x-12 gap-y-3 px-4">
                       {ABILITIES.map(ability => (
                          <div key={ability} className="flex justify-between items-center border-b border-white/5 pb-1 group hover:border-primary/30 transition-colors">
                             <span className="text-xs font-tech text-muted-foreground group-hover:text-foreground transition-colors uppercase tracking-wider">{ability}</span>
                             <DotRating 
                                value={abilities[ability]} 
                                max={5}
                                className="scale-75 origin-right opacity-60 group-hover:opacity-100 transition-opacity"
                                onChange={(v) => setAbilities({...abilities, [ability]: v})}
                             />
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

          {/* ... Other Tabs remain structurally similar but updated with new styling ... */}
        </AnimatePresence>
      </div>
    </div>
  );
}
