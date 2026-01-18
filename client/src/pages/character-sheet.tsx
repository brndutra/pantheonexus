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

interface Weapon {
  name: string;
  accuracy: string;
  damage: string;
  defense: string;
  overwhelming: string;
  minStr: string;
  tags: string;
  attribute: string;
  ability: string;
  damageAttribute: string;
}

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

  const [weapons, setWeapons] = useState<Weapon[]>([]);
  const [newWeapon, setNewWeapon] = useState<Weapon>({
     name: "", accuracy: "", damage: "", defense: "", overwhelming: "", minStr: "", tags: "", attribute: "", ability: "", damageAttribute: ""
  });

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

  const addWeapon = () => {
     if (newWeapon.name.trim()) {
        setWeapons([...weapons, newWeapon]);
        setNewWeapon({ name: "", accuracy: "", damage: "", defense: "", overwhelming: "", minStr: "", tags: "", attribute: "", ability: "", damageAttribute: "" });
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

  // Combat & Physics Calculations
  const getAttributeTotal = (name: AttributeName) => {
    let attr: Attribute | undefined;
    for (const cat of Object.values(attributes)) {
      attr = cat.find(a => a.name === name);
      if (attr) break;
    }
    return attr ? attr.value + attr.epic : 0; // Using simplified total for now
  };

  const getAbilityValue = (name: string) => abilities[name]?.value || 0;

  const joinBattle = getAttributeTotal("Wits") + getAbilityValue("Awareness");
  const dodgeDV = Math.ceil((getAttributeTotal("Dexterity") + getAbilityValue("Athletics") + legend) / 2);
  const parryDV = Math.ceil((getAttributeTotal("Dexterity") + Math.max(getAbilityValue("Melee"), getAbilityValue("Brawl"))) / 2); // Simplified weapon defense
  
  const staminaTotal = getAttributeTotal("Stamina");
  const armorSoak = 0; // Placeholder until Armor is implemented properly
  const bashingSoak = staminaTotal + armorSoak;
  const lethalSoak = Math.floor(staminaTotal / 2) + armorSoak;
  const aggSoak = armorSoak;

  const move = getAttributeTotal("Dexterity") + 6;
  const dash = getAttributeTotal("Dexterity") + 12;
  
  const jumpVert = getAttributeTotal("Strength") + getAbilityValue("Athletics");
  const jumpHoriz = (getAttributeTotal("Strength") + getAbilityValue("Athletics")) * 2;
  
  const strengthTotal = getAttributeTotal("Strength");
  const lift = strengthTotal * 50; // Simplified calculation (lbs)
  const throwRange = strengthTotal * 10; // Simplified calculation (yards)

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

        {/* PANTHEONEXUS HEADER */}
        <div className="flex justify-between items-end mb-8 border-b border-primary/20 pb-4">
            <div className="flex flex-col">
                <h1 className="font-mythic text-4xl text-primary tracking-[0.2em] drop-shadow-[0_0_15px_rgba(212,175,55,0.5)]">
                    PANTHEON<span className="text-foreground">EXUS</span>
                </h1>
                <div className="flex items-center gap-2">
                    <span className="font-tech text-xs text-muted-foreground tracking-[0.5em] uppercase">System v2.4 // Scion Scrolls</span>
                </div>
            </div>
            <div className="text-right hidden md:block">
                <div className="text-[10px] font-code text-primary/50 tracking-widest">SECURE CONNECTION</div>
                <div className="flex items-center justify-end gap-2 mt-1">
                    <span className="text-[10px] font-tech text-primary">ONLINE</span>
                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse shadow-[0_0_8px_gold]"></div>
                </div>
            </div>
        </div>
        
        {/* Navigation Tabs - REMOVED since everything is on one page */}
        {/* 
        <div className="flex justify-center mb-8 gap-4 sticky top-4 z-50">
           ...
        </div> 
        */}

        {/* TOP BLOCK: ID & RESOURCES */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8 items-start">
            {/* LEFT COLUMN: IDENTITY & ESSENCE */}
            <div className="md:col-span-8 flex flex-col gap-6">
                
                {/* ID CARD */}
                <SectionFrame title="ID Card" subHeader="Designation & Genesis Records">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-[420px]">
                        {/* Portrait Column */}
                        <div className="md:col-span-3 flex flex-col gap-2 relative h-full">
                            {/* Decorative Frame for Portrait */}
                             <div className="absolute -inset-1 border border-primary/20 pointer-events-none" />
                             
                             <div 
                                className="h-full w-full border border-primary/30 bg-black/60 relative overflow-hidden group cursor-pointer transition-all hover:border-primary shadow-inner"
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
                                    className="absolute bottom-2 left-0 right-0 text-[9px] uppercase tracking-widest text-destructive/70 hover:text-red-400 flex items-center justify-center gap-1 py-1 transition-colors bg-black/80"
                                 >
                                     <X className="w-3 h-3" /> Clear
                                 </button>
                             )}
                        </div>

                        {/* Data Column */}
                        <div className="md:col-span-9 flex flex-col gap-4 justify-start pl-4 border-l border-primary/10 relative h-full overflow-hidden">
                            {/* ID Card Internal Navigation */}
                            <div className="flex gap-4 mb-2 border-b border-primary/20 pb-2 flex-shrink-0">
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

                            <div className="flex-1 overflow-y-auto scion-scrollbar pr-2">
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
                                          className="space-y-4 pb-4"
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
                                          className="space-y-4 pb-4"
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
                    </div>
                </SectionFrame>

                {/* COMBINED SECTION: Callings, Nature, Virtues */}
                <SectionFrame title="Essence & Nature" subHeader="Divine Matrix">
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

            {/* RIGHT COLUMN: LEGEND & VITALITY */}
            <div className="md:col-span-4 flex flex-col gap-6">
                {/* Legend Rank Block */}
                <div className="border-2 border-primary/30 p-6 bg-black/60 backdrop-blur-md rounded-sm flex flex-col items-center justify-center relative overflow-hidden shadow-[0_0_30px_rgba(212,175,55,0.1)]">
                   <img src={artNouveauFrame} className="absolute inset-0 w-full h-full opacity-30 mix-blend-overlay pointer-events-none" alt="" />
                   <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.1)_0%,transparent_70%)]" />
                   
                   <h2 className="text-3xl font-mythic text-primary tracking-tighter z-10 mb-4 drop-shadow-[0_0_10px_gold]">LEGEND</h2>
                   
                   <div className="flex items-center gap-6 z-10">
                      <div className="flex flex-col items-center">
                         <div className="w-20 h-20 border-2 border-primary flex items-center justify-center bg-black/80 text-5xl font-mythic text-primary shadow-[0_0_30px_rgba(212,175,55,0.4)] relative">
                            {/* Inner Border */}
                            <div className="absolute inset-1 border border-primary/30" />
                            {legend}
                         </div>
                         <span className="text-[10px] tracking-[0.3em] text-primary/60 mt-2 uppercase font-bold">Rank</span>
                      </div>
                      
                      {/* Aether Percentage Display */}
                      <div className="flex flex-col items-center">
                         <div className="w-20 h-20 rounded-full flex items-center justify-center bg-black/40 relative">
                            {/* SVG Circle for Progress */}
                            <svg className="absolute inset-0 w-full h-full -rotate-90 drop-shadow-[0_0_10px_rgba(212,175,55,0.3)]">
                               <circle cx="40" cy="40" r="36" stroke="#1a1a1a" strokeWidth="3" fill="transparent" />
                               <circle 
                                 cx="40" cy="40" r="36" 
                                 stroke="#d4af37" 
                                 strokeWidth="3" 
                                 fill="transparent" 
                                 strokeDasharray={`${2 * Math.PI * 36}`}
                                 strokeDashoffset={`${2 * Math.PI * 36 * (1 - aetherPercentage/100)}`}
                                 strokeLinecap="round"
                                 className="transition-all duration-1000 ease-out"
                               />
                            </svg>
                            <div className="flex flex-col items-center">
                                <span className="font-code text-xl text-primary font-bold">{aetherPercentage}%</span>
                            </div>
                         </div>
                         <span className="text-[10px] tracking-[0.3em] text-primary/60 mt-2 uppercase font-bold">Aether</span>
                      </div>
                   </div>
                </div>

                {/* Pools & Health Section Combined */}
                <SectionFrame title="Vitality" subHeader="Status Monitor" className="flex-1">
                   <div className="space-y-6">
                      {/* Legend Points */}
                      <div className="space-y-2">
                         <div className="flex justify-between text-[10px] font-mythic text-primary/90 uppercase tracking-widest">
                            <span>Legend Points</span>
                            <span className="font-code text-primary">{legendCurrent} / {legendPoolTotal}</span>
                         </div>
                         <div className="h-2 bg-black/80 border border-primary/30 rounded-full overflow-hidden relative shadow-inner">
                            <div 
                              className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary/60 to-primary" 
                              style={{ width: `${(legendCurrent / legendPoolTotal) * 100}%` }}
                            />
                         </div>
                         <div className="flex gap-1 justify-between">
                            <button onClick={() => setLegendCurrent(Math.max(0, legendCurrent - 1))} className="w-6 h-5 flex items-center justify-center border border-primary/20 text-[9px] hover:bg-primary/10 hover:border-primary text-primary transition-colors rounded-sm">-</button>
                            <button onClick={() => setLegendCurrent(Math.min(legendPoolTotal, legendCurrent + 1))} className="w-6 h-5 flex items-center justify-center border border-primary/20 text-[9px] hover:bg-primary/10 hover:border-primary text-primary transition-colors rounded-sm">+</button>
                         </div>
                      </div>

                      {/* Willpower */}
                      <div className="space-y-2">
                         <div className="flex justify-between text-[10px] font-mythic text-primary/90 uppercase tracking-widest">
                            <span>Willpower</span>
                            <span className="font-code text-primary">{willpowerCurrent} / {willpower}</span>
                         </div>
                         <div className="flex justify-between items-center mb-1 px-1">
                            <DotRating value={willpower} max={10} onChange={setWillpower} className="scale-75 origin-left" />
                         </div>
                         <div className="grid grid-cols-10 gap-1 px-1">
                            {Array.from({length: 10}).map((_, i) => (
                               <div 
                                 key={i}
                                 onClick={() => setWillpowerCurrent(i + 1 === willpowerCurrent ? 0 : i + 1)}
                                 className={cn(
                                   "h-3 border border-primary/30 cursor-pointer transition-all duration-300 rounded-[1px]",
                                   i < willpowerCurrent ? "bg-primary shadow-[0_0_8px_rgba(212,175,55,0.5)] border-primary" : "bg-transparent hover:bg-primary/10",
                                   i >= willpower && "opacity-10 pointer-events-none border-none bg-white/5" // Disable dots beyond permanent rating
                                 )}
                               />
                            ))}
                         </div>
                      </div>

                      {/* Divider */}
                      <div className="flex items-center gap-4 opacity-30 py-1">
                         <div className="h-px bg-primary/30 flex-1" />
                         <Activity className="w-3 h-3 text-primary" />
                         <div className="h-px bg-primary/30 flex-1" />
                      </div>

                      {/* Health Tracker Integrated */}
                      <div className="space-y-3">
                          <div className="flex justify-between items-center">
                             <h4 className="text-[10px] uppercase tracking-[0.2em] font-mythic text-primary/70">Health</h4>
                             <button 
                                onClick={() => setExtraOxBody(prev => Math.min(prev + 1, 5))}
                                className="text-[9px] border border-primary/30 px-2 py-0.5 hover:bg-primary/10 text-primary transition-colors uppercase tracking-wider rounded-sm"
                             >
                                + OxBody
                             </button>
                          </div>
                          
                          <div className="flex flex-wrap gap-x-3 gap-y-2 justify-start items-end">
                             {currentHealthLevels.map((level, i) => (
                                <div key={i} className="flex flex-col items-center gap-1 group relative">
                                   <HealthBox status={healthDamage[i]} onClick={() => toggleHealth(i)} />
                                   <span className={cn(
                                      "font-code text-[8px] uppercase tracking-wider transition-all duration-300",
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
        <div className="space-y-6">
          {/* Main Sheet Content */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
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

              {/* Combat Dynamics & Physical Feats Section */}
              <div className="md:col-span-12">
                 <SectionFrame title="Combat & Feats" subHeader="Tactical Data & Physics">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                       
                       {/* Defensive Values */}
                       <div className="space-y-4">
                          <h4 className="text-[10px] uppercase tracking-[0.2em] font-mythic text-primary/70 mb-2 border-b border-primary/20 pb-2 flex items-center justify-between">
                             Defense <Shield className="w-3 h-3 text-primary/40" />
                          </h4>
                          <div className="grid grid-cols-2 gap-4">
                             <ScionInput label="Dodge DV" value={dodgeDV} readOnly className="text-center font-code text-xl text-primary" />
                             <ScionInput label="Parry DV" value={parryDV} readOnly className="text-center font-code text-xl text-primary" />
                          </div>
                          <ScionInput label="Join Battle" value={joinBattle} readOnly className="text-center font-code text-lg" />
                       </div>

                       {/* Soak & Resistance */}
                       <div className="space-y-4">
                          <h4 className="text-[10px] uppercase tracking-[0.2em] font-mythic text-primary/70 mb-2 border-b border-primary/20 pb-2 flex items-center justify-between">
                             Resilience <Hexagon className="w-3 h-3 text-primary/40" />
                          </h4>
                          <div className="grid grid-cols-3 gap-2">
                             <div className="flex flex-col gap-1">
                                <label className="text-[8px] uppercase tracking-widest text-primary/50 text-center">Bashing</label>
                                <input className="bg-black/40 border border-primary/30 text-center font-code text-lg py-2 text-primary focus:bg-primary/10 outline-none transition-colors" value={bashingSoak} readOnly />
                             </div>
                             <div className="flex flex-col gap-1">
                                <label className="text-[8px] uppercase tracking-widest text-primary/50 text-center">Lethal</label>
                                <input className="bg-black/40 border border-primary/30 text-center font-code text-lg py-2 text-primary focus:bg-primary/10 outline-none transition-colors" value={lethalSoak} readOnly />
                             </div>
                             <div className="flex flex-col gap-1">
                                <label className="text-[8px] uppercase tracking-widest text-primary/50 text-center">Aggravated</label>
                                <input className="bg-black/40 border border-primary/30 text-center font-code text-lg py-2 text-primary focus:bg-primary/10 outline-none transition-colors" value={aggSoak} readOnly />
                             </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4 mt-2">
                              <ScionInput label="Armor" placeholder="Name/Type" />
                              <ScionInput label="Mobility Penalty" placeholder="-0" />
                          </div>
                       </div>

                       {/* Physical Feats */}
                       <div className="space-y-4">
                          <h4 className="text-[10px] uppercase tracking-[0.2em] font-mythic text-primary/70 mb-2 border-b border-primary/20 pb-2 flex items-center justify-between">
                             Movement & Feats <Activity className="w-3 h-3 text-primary/40" />
                          </h4>
                          <div className="grid grid-cols-2 gap-4">
                             <ScionInput label="Move" value={`${move} yds`} readOnly />
                             <ScionInput label="Dash" value={`${dash} yds`} readOnly />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                             <ScionInput label="Jump (V)" value={`${jumpVert} yds`} readOnly />
                             <ScionInput label="Jump (H)" value={`${jumpHoriz} yds`} readOnly />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                             <ScionInput label="Lift" value={`${lift} lbs`} readOnly />
                             <ScionInput label="Throw" value={`${throwRange} yds`} readOnly />
                          </div>
                       </div>
                    </div>
                 </SectionFrame>
              </div>

              {/* Offensive / Arsenal Section */}
              <div className="md:col-span-12">
                 <SectionFrame title="Offensive Capabilities" subHeader="Weapons & Attack Profiles">
                    <div className="space-y-4">
                       {/* Weapons Header */}
                       <div className="grid grid-cols-12 gap-2 text-[9px] uppercase tracking-widest text-primary/60 font-mythic border-b border-primary/20 pb-2 px-2">
                          <div className="col-span-3">Weapon</div>
                          <div className="col-span-2 text-center">Pool (Attr + Abil)</div>
                          <div className="col-span-1 text-center">Acc</div>
                          <div className="col-span-1 text-center">Dmg (Attr)</div>
                          <div className="col-span-1 text-center">Def</div>
                          <div className="col-span-1 text-center">Ovw</div>
                          <div className="col-span-2 text-center">Tags</div>
                          <div className="col-span-1 text-right">Action</div>
                       </div>
                       
                       {/* Weapons List */}
                       <div className="space-y-2">
                          <AnimatePresence>
                             {weapons.map((w, i) => (
                                <motion.div 
                                   key={i}
                                   initial={{ opacity: 0, height: 0 }}
                                   animate={{ opacity: 1, height: 'auto' }}
                                   exit={{ opacity: 0, height: 0 }}
                                   className="grid grid-cols-12 gap-2 items-center bg-black/40 border border-white/5 p-2 rounded-sm group hover:border-primary/30 transition-colors"
                                >
                                   <div className="col-span-3 font-tech text-foreground">{w.name}</div>
                                   <div className="col-span-2 font-code text-xs text-muted-foreground text-center flex flex-col justify-center">
                                       <span>{w.attribute}</span>
                                       <span className="text-[8px] opacity-60">+ {w.ability}</span>
                                   </div>
                                   <div className="col-span-1 font-code text-primary text-center">+{w.accuracy}</div>
                                   <div className="col-span-1 font-code text-destructive text-center flex flex-col justify-center">
                                       <span>+{w.damage}</span>
                                       <span className="text-[8px] text-muted-foreground opacity-60">({w.damageAttribute})</span>
                                   </div>
                                   <div className="col-span-1 font-code text-primary text-center">+{w.defense}</div>
                                   <div className="col-span-1 font-code text-muted-foreground text-center">{w.overwhelming}</div>
                                   <div className="col-span-2 font-tech text-[10px] text-muted-foreground text-center truncate">{w.tags}</div>
                                   <div className="col-span-1 flex justify-end">
                                      <button 
                                         onClick={() => setWeapons(prev => prev.filter((_, idx) => idx !== i))}
                                         className="text-destructive/50 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                      >
                                         <Trash2 className="w-4 h-4" />
                                      </button>
                                   </div>
                                </motion.div>
                             ))}
                          </AnimatePresence>
                          
                          {/* New Weapon Input Row */}
                          <div className="grid grid-cols-12 gap-2 pt-2 items-start">
                             <div className="col-span-3">
                                <input 
                                   className="w-full bg-black/20 border border-white/10 rounded-sm px-2 py-1 text-xs font-tech text-foreground outline-none focus:border-primary/50 placeholder:text-muted-foreground/30"
                                   placeholder="Name..."
                                   value={newWeapon.name}
                                   onChange={(e) => setNewWeapon({...newWeapon, name: e.target.value})}
                                />
                             </div>
                             <div className="col-span-2 flex flex-col gap-1">
                                <input 
                                   className="w-full bg-black/20 border border-white/10 rounded-sm px-1 py-1 text-[9px] font-code text-center text-muted-foreground outline-none focus:border-primary/50 placeholder:text-muted-foreground/30 uppercase"
                                   placeholder="ATTR"
                                   value={newWeapon.attribute}
                                   onChange={(e) => setNewWeapon({...newWeapon, attribute: e.target.value})}
                                />
                                <input 
                                   className="w-full bg-black/20 border border-white/10 rounded-sm px-1 py-1 text-[9px] font-code text-center text-muted-foreground outline-none focus:border-primary/50 placeholder:text-muted-foreground/30 uppercase"
                                   placeholder="ABIL"
                                   value={newWeapon.ability}
                                   onChange={(e) => setNewWeapon({...newWeapon, ability: e.target.value})}
                                />
                             </div>
                             <div className="col-span-1">
                                <input 
                                   className="w-full bg-black/20 border border-white/10 rounded-sm px-1 py-1 text-xs font-code text-center text-primary outline-none focus:border-primary/50 placeholder:text-muted-foreground/30"
                                   placeholder="+0"
                                   value={newWeapon.accuracy}
                                   onChange={(e) => setNewWeapon({...newWeapon, accuracy: e.target.value})}
                                />
                             </div>
                             <div className="col-span-1 flex flex-col gap-1">
                                <input 
                                   className="w-full bg-black/20 border border-white/10 rounded-sm px-1 py-1 text-xs font-code text-center text-destructive outline-none focus:border-primary/50 placeholder:text-muted-foreground/30"
                                   placeholder="+0L"
                                   value={newWeapon.damage}
                                   onChange={(e) => setNewWeapon({...newWeapon, damage: e.target.value})}
                                />
                                <input 
                                   className="w-full bg-black/20 border border-white/10 rounded-sm px-1 py-1 text-[9px] font-code text-center text-muted-foreground outline-none focus:border-primary/50 placeholder:text-muted-foreground/30 uppercase"
                                   placeholder="ATTR"
                                   value={newWeapon.damageAttribute}
                                   onChange={(e) => setNewWeapon({...newWeapon, damageAttribute: e.target.value})}
                                />
                             </div>
                             <div className="col-span-1">
                                <input 
                                   className="w-full bg-black/20 border border-white/10 rounded-sm px-1 py-1 text-xs font-code text-center text-primary outline-none focus:border-primary/50 placeholder:text-muted-foreground/30"
                                   placeholder="+0"
                                   value={newWeapon.defense}
                                   onChange={(e) => setNewWeapon({...newWeapon, defense: e.target.value})}
                                />
                             </div>
                             <div className="col-span-1">
                                <input 
                                   className="w-full bg-black/20 border border-white/10 rounded-sm px-1 py-1 text-xs font-code text-center text-muted-foreground outline-none focus:border-primary/50 placeholder:text-muted-foreground/30"
                                   placeholder="1"
                                   value={newWeapon.overwhelming}
                                   onChange={(e) => setNewWeapon({...newWeapon, overwhelming: e.target.value})}
                                />
                             </div>
                             <div className="col-span-2">
                                <input 
                                   className="w-full bg-black/20 border border-white/10 rounded-sm px-2 py-1 text-xs font-tech text-muted-foreground outline-none focus:border-primary/50 placeholder:text-muted-foreground/30"
                                   placeholder="Tags..."
                                   value={newWeapon.tags}
                                   onChange={(e) => setNewWeapon({...newWeapon, tags: e.target.value})}
                                />
                             </div>
                             <div className="col-span-1 flex justify-end">
                                <button 
                                   onClick={addWeapon}
                                   className="bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary px-3 py-1 rounded-sm flex items-center justify-center transition-colors text-xs uppercase tracking-wider w-full"
                                >
                                   <Plus className="w-3 h-3" />
                                </button>
                             </div>
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
              
          </div>

          {/* ARSENAL SECTION - Now integrated into the main flow */}
          <div className="pt-8 border-t border-primary/20">
             <SectionFrame title="Arsenal" subHeader="Divine Powers & Abilities">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 min-h-[300px]">
                    {/* Knacks */}
                    <div className="space-y-4">
                       <h4 className="text-[10px] uppercase tracking-[0.2em] font-mythic text-primary/70 mb-2 border-b border-primary/20 pb-2 flex items-center justify-between">
                          Knacks <Cpu className="w-3 h-3 text-primary/40" />
                       </h4>
                       <div className="space-y-2">
                          <AnimatePresence>
                             {knacks.map((knack, idx) => (
                                <motion.div 
                                   initial={{ opacity: 0, height: 0 }}
                                   animate={{ opacity: 1, height: 'auto' }}
                                   exit={{ opacity: 0, height: 0 }}
                                   key={idx} 
                                   className="flex items-center justify-between bg-black/40 border border-white/5 p-2 rounded-sm group hover:border-primary/30 transition-colors"
                                >
                                   <span className="font-tech text-sm text-foreground/90">{knack}</span>
                                   <button 
                                      onClick={() => setKnacks(prev => prev.filter((_, i) => i !== idx))}
                                      className="text-destructive/50 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                   >
                                      <Trash2 className="w-3 h-3" />
                                   </button>
                                </motion.div>
                             ))}
                          </AnimatePresence>
                          <div className="flex gap-2 pt-2">
                             <input 
                                className="flex-1 bg-black/20 border border-white/10 rounded-sm px-3 py-1.5 text-xs font-tech text-foreground outline-none focus:border-primary/50 placeholder:text-muted-foreground/30"
                                placeholder="New Knack..."
                                value={newKnack}
                                onChange={(e) => setNewKnack(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && addKnack()}
                             />
                             <button 
                                onClick={addKnack}
                                className="bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary px-3 rounded-sm flex items-center justify-center transition-colors"
                             >
                                <Plus className="w-3 h-3" />
                             </button>
                          </div>
                       </div>
                    </div>

                    {/* Boons */}
                    <div className="space-y-4">
                       <h4 className="text-[10px] uppercase tracking-[0.2em] font-mythic text-primary/70 mb-2 border-b border-primary/20 pb-2 flex items-center justify-between">
                          Boons <Zap className="w-3 h-3 text-primary/40" />
                       </h4>
                       <div className="space-y-2">
                          <AnimatePresence>
                             {boons.map((boon, idx) => (
                                <motion.div 
                                   initial={{ opacity: 0, height: 0 }}
                                   animate={{ opacity: 1, height: 'auto' }}
                                   exit={{ opacity: 0, height: 0 }}
                                   key={idx} 
                                   className="flex items-center justify-between bg-black/40 border border-white/5 p-2 rounded-sm group hover:border-primary/30 transition-colors"
                                >
                                   <span className="font-tech text-sm text-foreground/90">{boon}</span>
                                   <button 
                                      onClick={() => setBoons(prev => prev.filter((_, i) => i !== idx))}
                                      className="text-destructive/50 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                   >
                                      <Trash2 className="w-3 h-3" />
                                   </button>
                                </motion.div>
                             ))}
                          </AnimatePresence>
                          <div className="flex gap-2 pt-2">
                             <input 
                                className="flex-1 bg-black/20 border border-white/10 rounded-sm px-3 py-1.5 text-xs font-tech text-foreground outline-none focus:border-primary/50 placeholder:text-muted-foreground/30"
                                placeholder="New Boon..."
                                value={newBoon}
                                onChange={(e) => setNewBoon(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && addBoon()}
                             />
                             <button 
                                onClick={addBoon}
                                className="bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary px-3 rounded-sm flex items-center justify-center transition-colors"
                             >
                                <Plus className="w-3 h-3" />
                             </button>
                          </div>
                       </div>
                    </div>
                </div>
             </SectionFrame>
          </div>
        </div>
      </div>
    </div>
  );
}
