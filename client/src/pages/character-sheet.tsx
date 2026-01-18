import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DotRating } from "@/components/ui/dot-rating";
import { ScionInput } from "@/components/ui/scion-input";
import { cn } from "@/lib/utils";
import { Shield, Zap, Skull, Scroll, Activity, Cpu, Hexagon, Plus, Trash2, Crown, Heart, Radar, Minus, Upload, Image as ImageIcon, X, FileText, User } from "lucide-react";
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
import cornerOrnament from "@assets/generated_images/mythological_corner_ornament.png";
import artNouveauFrame from "@assets/generated_images/art_nouveau_gold_border_frame.png";
import darkGoldTexture from "@assets/generated_images/dark_gold_texture_background.png";
import divineDivider from "@assets/generated_images/divine_divider_line.png";


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
  <div className={cn("border-2 border-primary/20 rounded-sm p-6 relative bg-black/40 backdrop-blur-md shadow-2xl overflow-hidden", className)}>
    {/* Corner Ornaments */}
    <img src={cornerOrnament} className="absolute top-0 left-0 w-16 h-16 opacity-30 rotate-0 pointer-events-none" alt="" />
    <img src={cornerOrnament} className="absolute top-0 right-0 w-16 h-16 opacity-30 rotate-90 pointer-events-none" alt="" />
    <img src={cornerOrnament} className="absolute bottom-0 right-0 w-16 h-16 opacity-30 rotate-180 pointer-events-none" alt="" />
    <img src={cornerOrnament} className="absolute bottom-0 left-0 w-16 h-16 opacity-30 -rotate-90 pointer-events-none" alt="" />

    {/* Header Line */}
    <div className="flex justify-between items-start mb-6 border-b border-primary/30 pb-2 relative z-10">
       <div>
          <h3 className="font-mythic text-primary text-xl tracking-[0.15em] uppercase drop-shadow-md">{title}</h3>
          {subHeader && <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] mt-1 font-tech">{subHeader}</p>}
       </div>
       <div className="flex items-center gap-2">
         {action}
         {Icon && <Icon className="w-5 h-5 text-primary/60" />}
       </div>
    </div>
    <div className="relative z-10">
      {children}
    </div>
  </div>
);

const HealthBox = ({ status, onClick }: { status: DamageType, onClick: () => void }) => {
  return (
    <button 
      onClick={onClick}
      className="w-5 h-5 md:w-6 md:h-6 border border-muted-foreground/40 rounded-[1px] bg-black/50 flex items-center justify-center hover:border-primary transition-colors focus:outline-none relative overflow-hidden group"
    >
      <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
      {status === 1 && <div className="w-full h-[1px] bg-primary/70 rotate-45" />}
      {status === 2 && (
        <div className="relative w-full h-full flex items-center justify-center">
          <div className="absolute w-full h-[1px] bg-primary rotate-45" />
          <div className="absolute w-full h-[1px] bg-primary -rotate-45" />
        </div>
      )}
      {status === 3 && (
        <div className="relative w-full h-full flex items-center justify-center">
          <div className="absolute w-full h-[1px] bg-red-600 rotate-45 shadow-[0_0_5px_red]" />
          <div className="absolute w-full h-[1px] bg-red-600 -rotate-45 shadow-[0_0_5px_red]" />
          <div className="absolute w-[1px] h-full bg-red-600 shadow-[0_0_5px_red]" />
        </div>
      )}
    </button>
  );
};

export default function CharacterSheet() {
  const [activeTab, setActiveTab] = useState<"sheet" | "powers" | "bio">("sheet");
  const [idCardTab, setIdCardTab] = useState<"identity" | "psychic" | "presence">("identity");
  
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
    <div 
      className="min-h-screen bg-black text-foreground overflow-x-hidden font-tech selection:bg-primary/30 relative"
      style={{
        backgroundImage: `url(${darkGoldTexture})`,
        backgroundSize: 'cover',
        backgroundAttachment: 'fixed',
      }}
    >
      
      {/* Vignette Overlay */}
      <div className="fixed inset-0 pointer-events-none z-10 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.7)_90%)]" />

      {/* Main Container */}
      <div className="relative z-20 container mx-auto p-4 md:p-8 max-w-7xl">
        
        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8 gap-4 sticky top-4 z-50">
           <div className="flex bg-black/80 border border-primary/30 p-1 rounded-full backdrop-blur-md shadow-lg">
             {['sheet', 'bio', 'powers'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={cn(
                    "px-6 py-2 rounded-full text-xs font-mythic uppercase tracking-widest transition-all duration-300",
                    activeTab === tab 
                      ? "bg-primary text-black font-bold shadow-[0_0_15px_rgba(212,175,55,0.6)]" 
                      : "text-muted-foreground hover:text-white"
                  )}
                >
                  {tab === 'sheet' && <span className="flex items-center gap-2"><Activity className="w-3 h-3"/> Interface</span>}
                  {tab === 'bio' && <span className="flex items-center gap-2"><User className="w-3 h-3"/> Dossier</span>}
                  {tab === 'powers' && <span className="flex items-center gap-2"><Zap className="w-3 h-3"/> Arsenal</span>}
                </button>
             ))}
           </div>
        </div>

        {/* TOP IDENTITY BLOCK */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
            <div className="md:col-span-8 space-y-6">
                
                {/* ID CARD HEADER - Combined */}
                <SectionFrame title="ID Card" subHeader="Designation & Genesis Records" className="h-full">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                        {/* Portrait Column */}
                        <div className="md:col-span-3 flex flex-col gap-2 relative">
                            {/* Decorative Frame for Portrait */}
                             <div className="absolute -inset-1 border border-primary/20 pointer-events-none" />
                             
                             <div 
                                className="aspect-[3/4] border border-primary/30 bg-black/60 relative overflow-hidden group cursor-pointer transition-all hover:border-primary shadow-inner"
                                onClick={() => fileInputRef.current?.click()}
                             >
                                {portrait ? (
                                    <>
                                        <img src={portrait} alt="Scion Portrait" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                            <span className="text-xs uppercase tracking-widest text-primary font-mythic border border-primary px-3 py-1">Change</span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/30 group-hover:text-primary/60 transition-colors">
                                        <ImageIcon className="w-12 h-12 mb-3 opacity-50" />
                                        <span className="text-[10px] uppercase tracking-widest text-center px-4 font-mythic">Upload Visual</span>
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
                                    className="text-[9px] uppercase tracking-widest text-destructive/70 hover:text-red-400 flex items-center justify-center gap-1 py-1 transition-colors"
                                 >
                                     <X className="w-3 h-3" /> Clear Visual
                                 </button>
                             )}
                        </div>

                        {/* Data Column */}
                        <div className="md:col-span-9 flex flex-col gap-4 justify-center pl-4 border-l border-primary/10 relative min-h-[300px]">
                            {/* ID Card Internal Navigation */}
                            <div className="flex gap-4 mb-2 border-b border-primary/20 pb-2">
                               {['identity', 'psychic', 'presence'].map((tab) => (
                                  <button
                                    key={tab}
                                    onClick={() => setIdCardTab(tab as any)}
                                    className={cn(
                                      "text-[10px] uppercase tracking-[0.2em] font-mythic transition-colors pb-1 relative",
                                      idCardTab === tab ? "text-primary" : "text-muted-foreground hover:text-primary/70"
                                    )}
                                  >
                                    {tab}
                                    {idCardTab === tab && (
                                       <motion.div layoutId="idTabIndicator" className="absolute bottom-0 left-0 right-0 h-px bg-primary shadow-[0_0_5px_gold]" />
                                    )}
                                  </button>
                               ))}
                            </div>

                            <AnimatePresence mode="wait">
                                {idCardTab === 'identity' && (
                                    <motion.div 
                                      key="identity"
                                      initial={{ opacity: 0, x: -10 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      exit={{ opacity: 0, x: 10 }}
                                      className="space-y-6"
                                    >
                                        {/* Identity Fields */}
                                        <div className="space-y-4">
                                            <ScionInput label="Designation (Name)" placeholder="CHARACTER NAME" className="text-2xl md:text-3xl font-mythic text-primary drop-shadow-[0_0_10px_rgba(212,175,55,0.3)]" />
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <ScionInput label="Pantheon" placeholder="PANTHEON" />
                                                <ScionInput label="Heritage" placeholder="DIVINE PARENT / PATRON" />
                                            </div>
                                        </div>

                                        {/* Divider with Ornament */}
                                        <div className="flex items-center gap-4 opacity-50">
                                           <div className="h-px bg-primary/30 flex-1" />
                                           <img src={divineDivider} className="h-4 w-auto" alt="" />
                                           <div className="h-px bg-primary/30 flex-1" />
                                        </div>

                                        {/* Genesis Fields */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <ScionInput label="Date of Birth" placeholder="DD/MM/AAAA" />
                                            <ScionInput label="Nationality" placeholder="NATIONALITY" />
                                            <ScionInput label="Origin City" placeholder="CITY" />
                                            <ScionInput label="State" placeholder="STATE/UF" />
                                        </div>
                                    </motion.div>
                                )}

                                {idCardTab === 'psychic' && (
                                   <motion.div 
                                      key="psychic"
                                      initial={{ opacity: 0, x: -10 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      exit={{ opacity: 0, x: 10 }}
                                      className="space-y-4 overflow-y-auto max-h-[300px] pr-2 scion-scrollbar"
                                   >
                                      <div className="grid grid-cols-2 gap-4">
                                         <ScionInput label="Temperament" placeholder="Dominant Emotion" value={psychicProfile.temperament} onChange={(e) => setPsychicProfile({...psychicProfile, temperament: e.target.value})} />
                                         <ScionInput label="Cognitive Type" placeholder="Thought Pattern" value={psychicProfile.cognitiveType} onChange={(e) => setPsychicProfile({...psychicProfile, cognitiveType: e.target.value})} />
                                      </div>
                                      <div className="grid grid-cols-2 gap-4">
                                          <ScionInput label="Major Arcana" placeholder="Archetype" value={psychicProfile.majorArcana} onChange={(e) => setPsychicProfile({...psychicProfile, majorArcana: e.target.value})} />
                                          <ScionInput label="Keywords" placeholder="Key Terms" value={psychicProfile.keywords} onChange={(e) => setPsychicProfile({...psychicProfile, keywords: e.target.value})} />
                                      </div>
                                      <div className="space-y-1">
                                         <label className="text-[9px] uppercase tracking-widest text-primary/70 font-mythic">Deep Analysis</label>
                                         <textarea className="w-full bg-black/20 border border-white/10 rounded-sm p-2 text-xs font-tech text-foreground outline-none focus:border-primary/50 min-h-[60px]" placeholder="Analysis..." value={psychicProfile.analysis} onChange={(e) => setPsychicProfile({...psychicProfile, analysis: e.target.value})} />
                                      </div>
                                   </motion.div>
                                )}

                                {idCardTab === 'presence' && (
                                   <motion.div 
                                      key="presence"
                                      initial={{ opacity: 0, x: -10 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      exit={{ opacity: 0, x: 10 }}
                                      className="space-y-4 overflow-y-auto max-h-[300px] pr-2 scion-scrollbar"
                                   >
                                       <div className="grid grid-cols-3 gap-3">
                                          <ScionInput label="Height" placeholder="Height" value={presenceProfile.height} onChange={(e) => setPresenceProfile({...presenceProfile, height: e.target.value})} />
                                          <ScionInput label="Eyes" placeholder="Color" value={presenceProfile.eyeColor} onChange={(e) => setPresenceProfile({...presenceProfile, eyeColor: e.target.value})} />
                                          <ScionInput label="Hair" placeholder="Color" value={presenceProfile.hairColor} onChange={(e) => setPresenceProfile({...presenceProfile, hairColor: e.target.value})} />
                                       </div>
                                       <div className="grid grid-cols-2 gap-4">
                                           <ScionInput label="Aura" placeholder="Signature" value={presenceProfile.auraSignature} onChange={(e) => setPresenceProfile({...presenceProfile, auraSignature: e.target.value})} />
                                           <ScionInput label="Scent" placeholder="Essence" value={presenceProfile.scent} onChange={(e) => setPresenceProfile({...presenceProfile, scent: e.target.value})} />
                                       </div>
                                       <ScionInput label="Distinguishing Mark" placeholder="Feature" value={presenceProfile.distinguishingMark} onChange={(e) => setPresenceProfile({...presenceProfile, distinguishingMark: e.target.value})} />
                                   </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </SectionFrame>

                {/* COMBINED SECTION: Callings, Nature, Virtues */}
                <SectionFrame title="Essence & Nature" subHeader="Divine Matrix" className="min-h-[250px]">
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                      {/* Vertical Dividers */}
                      <div className="absolute left-1/3 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-primary/20 to-transparent hidden md:block" />
                      <div className="absolute right-1/3 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-primary/20 to-transparent hidden md:block" />

                      {/* Callings */}
                      <div className="space-y-4">
                         <h4 className="text-[10px] uppercase tracking-[0.2em] font-mythic text-primary/70 mb-2 border-b border-primary/20 pb-2 flex items-center justify-between">
                            Callings <Crown className="w-3 h-3 text-primary/40" />
                         </h4>
                         <div className="flex flex-col gap-4">
                           {callings.map((c, i) => (
                             <div key={i} className="flex items-center gap-2 group">
                                <div className="w-1 h-1 bg-primary/50 rotate-45 group-hover:bg-primary transition-colors" />
                                <input 
                                  className="bg-transparent w-full outline-none font-tech text-foreground placeholder:text-muted-foreground/20 text-sm focus:text-primary transition-colors"
                                  placeholder={`Calling ${i+1}`}
                                  value={c.name}
                                  onChange={(e) => updateCalling(i, 'name', e.target.value)}
                                />
                                <button 
                                  onClick={() => setActiveTitleIndex(activeTitleIndex === i ? null : i)}
                                  className={cn("opacity-30 hover:opacity-100 transition-opacity", c.title && "text-primary opacity-100 drop-shadow-[0_0_5px_gold]")}
                                >
                                   <Crown className="w-3 h-3" />
                                </button>
                                <AnimatePresence>
                                  {activeTitleIndex === i && (
                                    <motion.div 
                                      initial={{ opacity: 0, scale: 0.9, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                      className="absolute left-0 mt-8 z-50 bg-black/90 border border-primary p-3 w-48 shadow-[0_0_30px_rgba(0,0,0,0.8)] backdrop-blur-xl rounded-sm"
                                    >
                                       <div className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1">Legendary Title</div>
                                       <input 
                                          autoFocus
                                          className="w-full bg-transparent text-primary font-mythic text-sm outline-none placeholder:text-primary/30 border-b border-primary/30 pb-1"
                                          placeholder="Title..."
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
                         <h4 className="text-[10px] uppercase tracking-[0.2em] font-mythic text-primary/70 mb-2 border-b border-primary/20 pb-2 flex items-center justify-between">
                            Nature <User className="w-3 h-3 text-primary/40" />
                         </h4>
                         <div className="pt-2">
                           <ScionInput placeholder="ARCHETYPE" className="text-center text-xl font-mythic text-primary/90" />
                         </div>
                      </div>

                      {/* Virtues */}
                      <div className="space-y-4">
                         <h4 className="text-[10px] uppercase tracking-[0.2em] font-mythic text-primary/70 mb-2 border-b border-primary/20 pb-2 flex items-center justify-between">
                            Virtues <Heart className="w-3 h-3 text-primary/40" />
                         </h4>
                         <div className="space-y-3">
                            {virtues.map((virtue, idx) => (
                               <div key={idx} className="flex justify-between items-center group">
                                  <input 
                                     className="bg-transparent font-tech text-xs text-muted-foreground group-hover:text-primary transition-colors outline-none w-24 uppercase tracking-wider"
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
                <div className="flex-1 border-2 border-primary/30 p-6 bg-black/60 backdrop-blur-md rounded-sm flex flex-col items-center justify-center relative overflow-hidden shadow-[0_0_30px_rgba(212,175,55,0.1)]">
                   <img src={artNouveauFrame} className="absolute inset-0 w-full h-full opacity-30 mix-blend-overlay pointer-events-none" alt="" />
                   <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.1)_0%,transparent_70%)]" />
                   
                   <h2 className="text-4xl font-mythic text-primary tracking-tighter z-10 mb-6 drop-shadow-[0_0_10px_gold]">LEGEND</h2>
                   
                   <div className="flex items-center gap-8 z-10">
                      <div className="flex flex-col items-center">
                         <div className="w-24 h-24 border-2 border-primary flex items-center justify-center bg-black/80 text-6xl font-mythic text-primary shadow-[0_0_30px_rgba(212,175,55,0.4)] relative">
                            {/* Inner Border */}
                            <div className="absolute inset-1 border border-primary/30" />
                            {legend}
                         </div>
                         <span className="text-[10px] tracking-[0.3em] text-primary/60 mt-3 uppercase font-bold">Rank</span>
                      </div>
                      
                      {/* Aether Percentage Display */}
                      <div className="flex flex-col items-center">
                         <div className="w-24 h-24 rounded-full flex items-center justify-center bg-black/40 relative">
                            {/* SVG Circle for Progress */}
                            <svg className="absolute inset-0 w-full h-full -rotate-90 drop-shadow-[0_0_10px_rgba(212,175,55,0.3)]">
                               <circle cx="48" cy="48" r="42" stroke="#1a1a1a" strokeWidth="4" fill="transparent" />
                               <circle 
                                 cx="48" cy="48" r="42" 
                                 stroke="#d4af37" 
                                 strokeWidth="4" 
                                 fill="transparent" 
                                 strokeDasharray={`${2 * Math.PI * 42}`}
                                 strokeDashoffset={`${2 * Math.PI * 42 * (1 - aetherPercentage/100)}`}
                                 strokeLinecap="round"
                                 className="transition-all duration-1000 ease-out"
                               />
                            </svg>
                            <div className="flex flex-col items-center">
                                <span className="font-code text-2xl text-primary font-bold">{aetherPercentage}%</span>
                            </div>
                         </div>
                         <span className="text-[10px] tracking-[0.3em] text-primary/60 mt-3 uppercase font-bold">Aether</span>
                      </div>
                   </div>
                </div>

                {/* Pools & Health Section Combined */}
                <SectionFrame title="Resources & Vitality" subHeader="Power & Biometric Status" className="flex-1 min-h-[400px]">
                   <div className="space-y-8 py-2">
                      {/* Legend Points */}
                      <div className="space-y-3">
                         <div className="flex justify-between text-xs font-mythic text-primary/90 uppercase tracking-widest">
                            <span>Legend Points</span>
                            <span className="font-code text-primary">{legendCurrent} / {legendPoolTotal}</span>
                         </div>
                         <div className="h-3 bg-black/80 border border-primary/30 rounded-full overflow-hidden relative shadow-inner">
                            <div 
                              className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary/60 to-primary" 
                              style={{ width: `${(legendCurrent / legendPoolTotal) * 100}%` }}
                            />
                         </div>
                         <div className="flex gap-1 justify-between">
                            <button onClick={() => setLegendCurrent(Math.max(0, legendCurrent - 1))} className="w-8 h-6 flex items-center justify-center border border-primary/20 text-[10px] hover:bg-primary/10 hover:border-primary text-primary transition-colors rounded-sm">-</button>
                            <button onClick={() => setLegendCurrent(Math.min(legendPoolTotal, legendCurrent + 1))} className="w-8 h-6 flex items-center justify-center border border-primary/20 text-[10px] hover:bg-primary/10 hover:border-primary text-primary transition-colors rounded-sm">+</button>
                         </div>
                      </div>

                      {/* Willpower */}
                      <div className="space-y-3">
                         <div className="flex justify-between text-xs font-mythic text-primary/90 uppercase tracking-widest">
                            <span>Willpower</span>
                            <span className="font-code text-primary">{willpowerCurrent} / {willpower}</span>
                         </div>
                         <div className="flex justify-between items-center mb-1 px-1">
                            <DotRating value={willpower} max={10} onChange={setWillpower} className="scale-90 origin-left" />
                         </div>
                         <div className="grid grid-cols-10 gap-1 px-1">
                            {Array.from({length: 10}).map((_, i) => (
                               <div 
                                 key={i}
                                 onClick={() => setWillpowerCurrent(i + 1 === willpowerCurrent ? 0 : i + 1)}
                                 className={cn(
                                   "h-4 border border-primary/30 cursor-pointer transition-all duration-300 rounded-[1px]",
                                   i < willpowerCurrent ? "bg-primary shadow-[0_0_8px_rgba(212,175,55,0.5)] border-primary" : "bg-transparent hover:bg-primary/10",
                                   i >= willpower && "opacity-10 pointer-events-none border-none bg-white/5" // Disable dots beyond permanent rating
                                 )}
                               />
                            ))}
                         </div>
                      </div>

                      {/* Divider */}
                      <div className="flex items-center gap-4 opacity-30 py-2">
                         <div className="h-px bg-primary/30 flex-1" />
                         <Activity className="w-4 h-4 text-primary" />
                         <div className="h-px bg-primary/30 flex-1" />
                      </div>

                      {/* Health Tracker Integrated */}
                      <div className="space-y-4">
                          <div className="flex justify-between items-center">
                             <h4 className="text-[10px] uppercase tracking-[0.2em] font-mythic text-primary/70">Health Monitor</h4>
                             <button 
                                onClick={() => setExtraOxBody(prev => Math.min(prev + 1, 5))}
                                className="text-[9px] border border-primary/30 px-2 py-0.5 hover:bg-primary/10 text-primary transition-colors uppercase tracking-wider rounded-sm"
                             >
                                + OxBody
                             </button>
                          </div>
                          
                          <div className="flex flex-wrap gap-4 justify-center items-end">
                             {currentHealthLevels.map((level, i) => (
                                <div key={i} className="flex flex-col items-center gap-2 group relative">
                                   <HealthBox status={healthDamage[i]} onClick={() => toggleHealth(i)} />
                                   <span className={cn(
                                      "font-code text-[9px] uppercase tracking-wider transition-all duration-300",
                                      level === "Incap" ? "text-red-500 font-bold" : "text-muted-foreground group-hover:text-primary"
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
                                      }} className="absolute -top-3 -right-2 text-destructive hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                         <Trash2 className="w-3 h-3" />
                                      </button>
                                   )}
                                </div>
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-12 gap-6"
            >
              
              {/* MAIN ATTRIBUTES GRID + RADAR */}
              <div className="md:col-span-12">
                 <SectionFrame title="Attributes" subHeader="Core Parameters & Analysis">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                       
                       {/* Left 3 Cols: Attributes List */}
                       <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-0 md:divide-x divide-primary/10">
                           {(Object.entries(attributes) as [AttributeCategory, Attribute[]][]).map(([category, attrs]) => (
                              <div key={category} className="px-6 first:pl-0 last:pr-0 py-4 md:py-0">
                                 <h4 className="text-center font-mythic text-primary/60 text-xs uppercase tracking-[0.4em] mb-8 relative">
                                    <span className="bg-black/40 px-2 relative z-10">{category}</span>
                                    <div className="absolute top-1/2 left-10 right-10 h-px bg-primary/10 -z-0" />
                                 </h4>
                                 <div className="space-y-8">
                                    {attrs.map((attr, idx) => (
                                       <div key={attr.name} className="space-y-2 group">
                                          <div className="flex items-center justify-between mb-1">
                                             <div className="flex items-center gap-3">
                                                <span className="text-primary font-mythic text-xl opacity-60 group-hover:opacity-100 transition-opacity w-6 text-center drop-shadow-[0_0_5px_rgba(212,175,55,0.5)]">{attr.rune}</span>
                                                <span className="font-tech text-lg text-foreground tracking-wide group-hover:text-primary transition-colors">{attr.name}</span>
                                             </div>
                                             <span className="text-[9px] text-muted-foreground font-code opacity-50">{attr.name.substring(0,3).toUpperCase()}</span>
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
                                             <div className="flex justify-end pt-2 opacity-50 hover:opacity-100 transition-opacity">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[9px] uppercase tracking-wider text-primary/50">Epic</span>
                                                    <DotRating 
                                                    value={attr.epic} 
                                                    max={5} 
                                                    variant="tech"
                                                    className="scale-75 gap-0.5"
                                                    onChange={(v) => updateAttribute(category, idx, 'epic', v)} 
                                                    />
                                                </div>
                                             </div>
                                          )}
                                       </div>
                                    ))}
                                 </div>
                              </div>
                           ))}
                       </div>

                       {/* Right Col: Radar Chart */}
                       <div className="lg:col-span-1 flex flex-col justify-center border-l border-primary/10 pl-8 relative">
                          <h4 className="text-center font-code text-muted-foreground text-[10px] uppercase tracking-[0.3em] mb-4">
                             Radar Analysis
                          </h4>
                          <div className="w-full h-[300px] relative">
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
                                      fillOpacity={0.2}
                                      isAnimationActive={true}
                                   />
                                </RadarChart>
                             </ResponsiveContainer>
                             {/* Center Decor */}
                             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full shadow-[0_0_15px_gold]" />
                             
                             {/* Decorative Circles */}
                             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-primary/10 rounded-full pointer-events-none" />
                             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-primary/10 rounded-full pointer-events-none" />
                          </div>
                       </div>

                    </div>
                 </SectionFrame>
              </div>

              {/* Abilities Row */}
              <div className="md:col-span-12">
                 <SectionFrame title="Abilities" subHeader="Skill Matrix">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-2">
                       {Object.values(abilities).map(ability => (
                          <div key={ability.name} className="flex flex-col border border-white/5 bg-black/40 p-3 rounded-sm group hover:border-primary/40 transition-all duration-300 hover:shadow-[0_0_15px_rgba(212,175,55,0.1)]">
                             <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-tech text-foreground/90 uppercase tracking-wider font-bold group-hover:text-primary transition-colors">{ability.name}</span>
                                <div className="flex items-center gap-1 bg-black/40 rounded px-1 border border-white/5">
                                  <button onClick={() => updateAbilityValue(ability.name, ability.value - 1)} className="text-muted-foreground hover:text-white px-1 hover:bg-white/10 rounded transition-colors">
                                    <Minus className="w-3 h-3" />
                                  </button>
                                  <span className="font-mythic text-primary text-xl w-8 text-center drop-shadow-[0_0_5px_rgba(212,175,55,0.4)]">{ability.value}</span>
                                  <button onClick={() => updateAbilityValue(ability.name, ability.value + 1)} className="text-muted-foreground hover:text-white px-1 hover:bg-white/10 rounded transition-colors">
                                    <Plus className="w-3 h-3" />
                                  </button>
                                </div>
                             </div>

                             {/* Specialties List */}
                             <div className="space-y-1 mt-1 pt-2 border-t border-white/5">
                               <AnimatePresence>
                               {ability.specialties.map((spec, idx) => (
                                 <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    key={idx} 
                                    className="flex items-center gap-2 mb-1"
                                 >
                                    <div className="w-1.5 h-1.5 bg-primary/40 rotate-45" />
                                    <input 
                                      className="bg-transparent text-[10px] font-tech text-muted-foreground focus:text-primary outline-none flex-1 min-w-0 border-b border-transparent focus:border-primary/30 transition-colors"
                                      placeholder="Specialty..."
                                      value={spec.name}
                                      onChange={(e) => updateSpecialty(ability.name, idx, 'name', e.target.value)}
                                    />
                                    <input 
                                      className="bg-transparent text-[10px] font-mythic text-primary w-6 text-center outline-none border-b border-white/10 focus:border-primary"
                                      value={spec.value}
                                      onChange={(e) => updateSpecialty(ability.name, idx, 'value', parseInt(e.target.value) || 0)}
                                    />
                                    <button onClick={() => removeSpecialty(ability.name, idx)} className="text-destructive opacity-30 hover:opacity-100 transition-opacity">
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                 </motion.div>
                               ))}
                               </AnimatePresence>
                               <button 
                                onClick={() => addSpecialty(ability.name)}
                                className="flex items-center gap-1 text-[9px] text-muted-foreground/40 hover:text-primary mt-2 w-full justify-end uppercase tracking-wider transition-colors"
                               >
                                 <Plus className="w-3 h-3" /> Add Specialty
                               </button>
                             </div>
                          </div>
                       ))}
                    </div>
                 </SectionFrame>
              </div>

              {/* Health Tracker - REMOVED since it is now combined with Pools */}
              
            </motion.div>
          )}

          {activeTab === "bio" && (
            <motion.div 
              key="bio"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 gap-6"
            >
               {/* Psychic Profile */}
               <div className="space-y-6">
                  <SectionFrame title="Psychic Profile" subHeader="Mind & Soul Analysis" className="h-full">
                     <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
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
                        
                        <div className="space-y-2">
                           <label className="text-[10px] uppercase tracking-widest text-primary/70 font-mythic block">Deep Analysis</label>
                           <textarea 
                              className="w-full bg-black/40 border border-white/10 rounded-sm p-3 text-sm font-tech text-foreground outline-none focus:border-primary/50 min-h-[100px] resize-none"
                              placeholder="Psychological Analysis..."
                              value={psychicProfile.analysis}
                              onChange={(e) => setPsychicProfile({...psychicProfile, analysis: e.target.value})}
                           />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                           <div className="space-y-2">
                              <label className="text-[10px] uppercase tracking-widest text-primary/70 font-mythic block">Strengths</label>
                              <textarea 
                                 className="w-full bg-black/40 border border-white/10 rounded-sm p-3 text-sm font-tech text-foreground outline-none focus:border-primary/50 min-h-[80px] resize-none"
                                 placeholder="Psychological Strengths..."
                                 value={psychicProfile.strengths}
                                 onChange={(e) => setPsychicProfile({...psychicProfile, strengths: e.target.value})}
                              />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] uppercase tracking-widest text-primary/70 font-mythic block">Weaknesses</label>
                              <textarea 
                                 className="w-full bg-black/40 border border-white/10 rounded-sm p-3 text-sm font-tech text-foreground outline-none focus:border-primary/50 min-h-[80px] resize-none"
                                 placeholder="Vulnerabilities..."
                                 value={psychicProfile.weaknesses}
                                 onChange={(e) => setPsychicProfile({...psychicProfile, weaknesses: e.target.value})}
                              />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] uppercase tracking-widest text-primary/70 font-mythic block">Behaviors</label>
                              <textarea 
                                 className="w-full bg-black/40 border border-white/10 rounded-sm p-3 text-sm font-tech text-foreground outline-none focus:border-primary/50 min-h-[80px] resize-none"
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
               <div className="space-y-6">
                  <SectionFrame title="Presence Profile" subHeader="Appearance & Aura" className="h-full">
                     <div className="space-y-6">
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        </div>
                        <ScionInput 
                           label="Distinguishing Mark" 
                           placeholder="Notable Feature" 
                           value={presenceProfile.distinguishingMark}
                           onChange={(e) => setPresenceProfile({...presenceProfile, distinguishingMark: e.target.value})}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="space-y-2">
                              <label className="text-[10px] uppercase tracking-widest text-primary/70 font-mythic block">Fashion & Style</label>
                              <textarea 
                                 className="w-full bg-black/40 border border-white/10 rounded-sm p-3 text-sm font-tech text-foreground outline-none focus:border-primary/50 min-h-[100px] resize-none"
                                 placeholder="Dress Style & Presentation..."
                                 value={presenceProfile.fashion}
                                 onChange={(e) => setPresenceProfile({...presenceProfile, fashion: e.target.value})}
                              />
                           </div>

                           <div className="space-y-2">
                              <label className="text-[10px] uppercase tracking-widest text-primary/70 font-mythic block">Visual Notes</label>
                              <textarea 
                                 className="w-full bg-black/40 border border-white/10 rounded-sm p-3 text-sm font-tech text-foreground outline-none focus:border-primary/50 min-h-[100px] resize-none"
                                 placeholder="Additional Visual Observations..."
                                 value={presenceProfile.visualNotes}
                                 onChange={(e) => setPresenceProfile({...presenceProfile, visualNotes: e.target.value})}
                              />
                           </div>
                        </div>
                     </div>
                  </SectionFrame>
               </div>
            </motion.div>
          )}

          {activeTab === "powers" && (
             <motion.div
                key="powers"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center py-20"
             >
                <div className="inline-block border border-primary/30 p-8 bg-black/40 backdrop-blur-sm rounded-sm">
                   <Zap className="w-12 h-12 text-primary mx-auto mb-4 opacity-50" />
                   <h3 className="text-xl font-mythic text-primary mb-2">ARSENAL UNDER CONSTRUCTION</h3>
                   <p className="text-muted-foreground font-tech">Divine powers database initializing...</p>
                </div>
             </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
