import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DotRating } from "@/components/ui/dot-rating";
import { ScionInput } from "@/components/ui/scion-input";
import { Link, useRoute } from "wouter";
import { cn } from "@/lib/utils";
import { Shield, Zap, Skull, Scroll, Activity, Cpu, Hexagon, Plus, Trash2, Crown, Heart, Radar, Minus, Upload, Image as ImageIcon, X, FileText, User, LayoutGrid, ArrowLeft, Target, Sword, Crosshair, Fingerprint, Dna, Brain } from "lucide-react";
import { useCharacters, slugify } from "@/lib/characters-store";
import { useCompendium } from "@/lib/compendium-store";
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
import cornerOrnament from "@assets/generated_images/tech_mythic_corner_ornament.png";
import artNouveauFrame from "@assets/generated_images/cyber_greek_ornate_frame.png";
import darkGoldTexture from "@assets/generated_images/digital_hieroglyph_dark_background.png";
import divineDivider from "@assets/generated_images/mythic_tech_divider_line.png";
import cornerTech from "@assets/generated_images/art_deco_mythic_corner_tech_ornament.png";
import bgTech from "@assets/generated_images/ancient_high_tech_background_texture.png";


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
  value: number;
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

// --- New Components ---

const MythicHUDFrame = ({ 
    children, 
    title, 
    className, 
    icon: Icon, 
    action, 
    subHeader,
    variant = "default"
}: { 
    children: React.ReactNode, 
    title?: string, 
    className?: string, 
    icon?: any, 
    action?: React.ReactNode, 
    subHeader?: string,
    variant?: "default" | "minimal" | "cyber"
}) => (
  <div className={cn("relative group", className)}>
    {/* Frame Background */}
    <div className="absolute inset-0 bg-black/40 backdrop-blur-md border border-primary/20" 
         style={{ clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%)" }} />
    
    {/* Tech Corners */}
    <div className="absolute -top-[1px] -left-[1px] w-4 h-4 border-t-2 border-l-2 border-primary/60" />
    <div className="absolute -top-[1px] -right-[1px] w-4 h-4 border-t-2 border-r-2 border-primary/60" />
    <div className="absolute -bottom-[1px] -left-[1px] w-4 h-4 border-b-2 border-l-2 border-primary/60" />
    <div className="absolute bottom-[0px] right-[0px] w-6 h-6 border-b-2 border-r-2 border-primary/60" />
    <div className="absolute bottom-[2px] right-[2px] w-2 h-2 bg-primary/40" />

    {/* Header Section */}
    {(title || Icon) && (
        <div className="relative z-10 flex items-center justify-between p-3 border-b border-primary/10 bg-gradient-to-r from-primary/5 to-transparent">
            <div className="flex items-center gap-3">
                {Icon && (
                    <div className="p-1.5 bg-primary/10 rounded-sm border border-primary/30 text-primary shadow-[0_0_10px_rgba(212,175,55,0.2)]">
                        <Icon className="w-4 h-4" />
                    </div>
                )}
                <div className="flex flex-col">
                    {title && <h3 className="font-mythic text-lg text-primary tracking-widest uppercase text-shadow-glow">{title}</h3>}
                    {subHeader && <span className="text-[9px] font-tech uppercase tracking-[0.2em] text-muted-foreground">{subHeader}</span>}
                </div>
            </div>
            {action && <div className="flex items-center">{action}</div>}
        </div>
    )}

    {/* Content */}
    <div className="relative z-10 p-4">
        {children}
    </div>

    {/* Scanline Effect */}
    <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(212,175,55,0.02)_50%)] bg-[length:100%_4px] pointer-events-none z-0" />
  </div>
);

const SectionDivider = ({ label }: { label?: string }) => (
    <div className="flex items-center gap-4 my-8 opacity-70">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/50 to-primary/20" />
        {label && (
            <div className="relative px-4 py-1">
                <div className="absolute inset-0 border border-primary/30 transform skew-x-[-20deg] bg-black/60" />
                <span className="relative z-10 font-mythic text-xs text-primary tracking-[0.3em] uppercase">{label}</span>
            </div>
        )}
        <div className="h-px flex-1 bg-gradient-to-l from-transparent via-primary/50 to-primary/20" />
    </div>
);

const HealthBox = ({ status, onClick }: { status: DamageType, onClick: () => void }) => {
  return (
    <button 
      onClick={onClick}
      className="w-6 h-6 border border-primary/30 bg-black/60 flex items-center justify-center hover:border-primary transition-all focus:outline-none relative overflow-hidden group shadow-[0_0_5px_rgba(0,0,0,0.5)]"
      style={{ clipPath: "polygon(2px 0, 100% 0, 100% calc(100% - 2px), calc(100% - 2px) 100%, 0 100%, 0 2px)" }}
    >
      <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      {status === 1 && <div className="w-full h-[1px] bg-primary/80 rotate-45 shadow-[0_0_5px_gold]" />}
      {status === 2 && (
        <div className="relative w-full h-full flex items-center justify-center">
          <div className="absolute w-full h-[1.5px] bg-primary rotate-45 shadow-[0_0_8px_gold]" />
          <div className="absolute w-full h-[1.5px] bg-primary -rotate-45 shadow-[0_0_8px_gold]" />
        </div>
      )}
      {status === 3 && (
        <div className="relative w-full h-full flex items-center justify-center bg-red-900/20">
          <div className="absolute w-full h-[2px] bg-red-500 rotate-45 shadow-[0_0_8px_red]" />
          <div className="absolute w-full h-[2px] bg-red-500 -rotate-45 shadow-[0_0_8px_red]" />
          <div className="absolute w-[2px] h-full bg-red-500 shadow-[0_0_8px_red]" />
        </div>
      )}
    </button>
  );
};

export default function CharacterSheet() {
  const [match, params] = useRoute("/character-sheet/:slug");
  const { getCharacterBySlug } = useCharacters();
  const { callings: compendiumCallings, natures: compendiumNatures, virtues: compendiumVirtues } = useCompendium();
  const [activeTab, setActiveTab] = useState<"sheet" | "powers" | "bio">("sheet");
  const [idCardTab, setIdCardTab] = useState<"identity" | "psychic" | "presence">("identity");
  
  // State
  const [attributes, setAttributes] = useState(DEFAULT_ATTRIBUTES);
  const [legend, setLegend] = useState(2);
  const [aetherPercentage, setAetherPercentage] = useState(0);
  const [scionName, setScionName] = useState("");
  const [scionPlayer, setScionPlayer] = useState("");
  const [scionPantheon, setScionPantheon] = useState("");

  // Sync with URL params
  useEffect(() => {
    if (match && params?.slug) {
      const character = getCharacterBySlug(params.slug);
      if (character) {
        setScionName(character.name);
        setScionPlayer(character.player);
        setScionPantheon(character.pantheon);
        setLegend(character.legend);
        setAetherPercentage(character.aetherPercentage || character.legend * 10);
      }
    }
  }, [match, params?.slug, getCharacterBySlug]);

  const [abilities, setAbilities] = useState<Record<string, Ability>>(
    ABILITIES_LIST.reduce((acc, curr) => ({ 
      ...acc, 
      [curr]: { name: curr, value: 0, specialties: [] } 
    }), {} as Record<string, Ability>)
  );
  
  const [callings, setCallings] = useState<Calling[]>([
    { id: 1, name: "", title: "", value: 1 },
    { id: 2, name: "", title: "", value: 1 },
    { id: 3, name: "", title: "", value: 1 },
  ]);

  const [virtues, setVirtues] = useState<Virtue[]>([
    { id: 1, name: "Valor", value: 1 },
    { id: 2, name: "Harmony", value: 1 },
    { id: 3, name: "Order", value: 1 },
    { id: 4, name: "Piety", value: 1 },
    { id: 5, name: "", value: 1 },
  ]);
  
  // legend state is initialized above now
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

  const updateCalling = (index: number, field: keyof Calling, value: string | number) => {
    const newCallings = [...callings];
    // @ts-ignore
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
  const armedDV = Math.ceil((getAttributeTotal("Strength") + getAbilityValue("Melee")) / 2);

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

  // Aether Calculation (Now controlled via state)
  const legendPoolTotal = legend * legend;

  return (
    <div className="min-h-screen bg-mythic-void text-foreground overflow-x-hidden font-tech selection:bg-primary/30 relative">
      <div className="fixed inset-0 pointer-events-none z-10 overlay-vignette opacity-70" />
      <div className="fixed inset-0 pointer-events-none z-10 overlay-scanline opacity-10" />
      <div className="fixed inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none z-0" />
      <div className="fixed inset-0 pointer-events-none z-10 overlay-noise opacity-20 mix-blend-overlay" />

      {/* Main Container */}
      <div className="relative z-20 container mx-auto p-4 md:p-8 max-w-7xl">

        {/* TOP BAR: SYSTEM STATUS HEADER */}
        <div className="flex justify-between items-end mb-10 border-b border-primary/20 pb-4 relative">
             <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-50 shadow-[0_0_10px_gold]" />
            <div className="flex flex-col relative z-10">
                <h1 className="font-mythic text-5xl md:text-7xl text-primary tracking-[0.1em] drop-shadow-[0_0_15px_rgba(212,175,55,0.5)] animate-glitch" data-text="PANTHEONEXUS">
                    PANTHEON<span className="text-foreground">EXUS</span>
                </h1>
                <div className="flex items-center gap-2 mt-1">
                    <div className="h-px w-8 bg-primary/50" />
                    <span className="font-tech text-xs text-muted-foreground tracking-[0.5em] uppercase text-shadow-tech">System v2.5 // Scion Neural Link</span>
                </div>
            </div>
            <div className="text-right hidden md:block relative z-10">
                <div className="flex items-center justify-end gap-3 mb-2">
                    <div className="text-[10px] font-code text-primary/70 tracking-widest uppercase border border-primary/20 px-2 py-0.5 rounded-sm bg-black/40">
                       USER: {scionName || "UNKNOWN"}
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-tech text-primary animate-pulse">ONLINE</span>
                        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse shadow-[0_0_8px_gold]"></div>
                    </div>
                </div>
                <Link href="/">
                  <button className="flex items-center gap-2 text-[10px] font-mythic uppercase tracking-widest text-primary border border-primary/30 px-3 py-1 hover:bg-primary/10 transition-colors rounded-sm ml-auto hover:shadow-[0_0_10px_rgba(212,175,55,0.2)] group">
                    <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" /> TERMINATE SESSION
                  </button>
                </Link>
            </div>
        </div>

        {/* --- GRID LAYOUT START --- */}
        <div className="grid grid-cols-12 gap-6">

            {/* LEFT COLUMN: IDENTITY & VIRTUES (Width 4) */}
            <div className="col-span-12 md:col-span-4 flex flex-col gap-6">
                
                {/* 1. IDENTITY MODULE */}
                <MythicHUDFrame title="Identity Matrix" icon={Fingerprint} subHeader="SUBJECT DESIGNATION" className="h-auto">
                     <div className="flex flex-col gap-4">
                         {/* Portrait + Name */}
                         <div className="relative h-64 w-full border border-primary/20 bg-black/50 overflow-hidden group">
                             {/* Corner accents for portrait */}
                             <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-primary/40 z-10" />
                             <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-primary/40 z-10" />
                             
                             <div 
                                className="w-full h-full cursor-pointer relative"
                                onClick={() => fileInputRef.current?.click()}
                             >
                                {portrait ? (
                                    <img src={portrait} alt="Scion Portrait" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/30">
                                        <ImageIcon className="w-12 h-12 mb-2 opacity-30" />
                                        <span className="text-[10px] tracking-widest uppercase">No Visual Data</span>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                                <div className="absolute bottom-4 left-4 right-4">
                                     <ScionInput 
                                      value={scionName} 
                                      onChange={(e) => setScionName(e.target.value)}
                                      placeholder="CODENAME" 
                                      className="text-2xl font-mythic text-primary uppercase border-none bg-transparent p-0 shadow-none focus-visible:ring-0 placeholder:text-primary/20 text-shadow-glow" 
                                     />
                                     <div className="flex gap-2 mt-1">
                                         <ScionInput 
                                            value={scionPantheon} 
                                            onChange={(e) => setScionPantheon(e.target.value)}
                                            placeholder="PANTHEON" 
                                            className="text-xs font-tech tracking-[0.2em] text-primary/70 uppercase border-none bg-transparent p-0 shadow-none h-auto" 
                                         />
                                     </div>
                                </div>
                             </div>
                             <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePortraitUpload} />
                         </div>
                         
                         {/* Secondary Identity Data */}
                         <div className="space-y-2 p-2 border border-primary/10 bg-primary/5 rounded-sm relative overflow-hidden">
                             {/* Background Data Stream */}
                             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-10" />
                             
                             <div className="grid grid-cols-2 gap-4 relative z-10">
                                 <div>
                                     <label className="text-[9px] uppercase tracking-widest text-muted-foreground block mb-1">Player ID</label>
                                     <ScionInput 
                                        value={scionPlayer} 
                                        onChange={(e) => setScionPlayer(e.target.value)}
                                        className="h-8 text-sm bg-black/40 border-primary/20 focus:border-primary/50 font-code text-primary" 
                                     />
                                 </div>
                                 <div>
                                     <label className="text-[9px] uppercase tracking-widest text-muted-foreground block mb-1">Nature Archetype</label>
                                     <ScionInput 
                                        placeholder="SELECT NATURE" 
                                        className="h-8 text-sm bg-black/40 border-primary/20 focus:border-primary/50 font-code text-primary" 
                                        list="natures-list"
                                     />
                                     <datalist id="natures-list">
                                        {compendiumNatures.map((n: any) => (
                                            <option key={n.id} value={n.name} />
                                        ))}
                                     </datalist>
                                 </div>
                             </div>

                            {/* ID Card Internal Navigation - RESTORED */}
                            <div className="flex gap-4 mt-4 border-b border-primary/20 pb-1 flex-shrink-0 relative z-10">
                               {['identity', 'psychic', 'presence'].map((tab) => (
                                  <button
                                    key={tab}
                                    onClick={() => setIdCardTab(tab as any)}
                                    className={cn(
                                      "text-[9px] uppercase tracking-[0.2em] font-mythic transition-colors pb-1 relative",
                                      idCardTab === tab ? "text-primary" : "text-muted-foreground hover:text-primary/70"
                                    )}
                                  >
                                    {tab}
                                    {idCardTab === tab && (
                                       <motion.div layoutId="idTabIndicator" className="absolute bottom-0 left-0 right-0 h-[1px] bg-primary shadow-[0_0_5px_gold]" />
                                    )}
                                  </button>
                               ))}
                            </div>
                            
                            <AnimatePresence mode="wait">
                                {idCardTab === 'psychic' && (
                                    <motion.div 
                                      key="psychic"
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: 'auto' }}
                                      exit={{ opacity: 0, height: 0 }}
                                      className="space-y-3 mt-4"
                                    >
                                        <h5 className="text-[10px] font-mythic uppercase text-primary/60 border-b border-primary/10 pb-1">Psychological Matrix</h5>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="col-span-2">
                                                <ScionInput 
                                                    label="Psyche Analysis" 
                                                    className="h-8 text-xs bg-black/40 border-primary/20"
                                                    value={psychicProfile.analysis}
                                                    onChange={(e) => setPsychicProfile({...psychicProfile, analysis: e.target.value})}
                                                />
                                            </div>
                                            <ScionInput 
                                                label="Temperament" 
                                                className="h-8 text-xs bg-black/40 border-primary/20"
                                                value={psychicProfile.temperament}
                                                onChange={(e) => setPsychicProfile({...psychicProfile, temperament: e.target.value})}
                                            />
                                            <ScionInput 
                                                label="Cognitive Type" 
                                                className="h-8 text-xs bg-black/40 border-primary/20"
                                                value={psychicProfile.cognitiveType}
                                                onChange={(e) => setPsychicProfile({...psychicProfile, cognitiveType: e.target.value})}
                                            />
                                        </div>
                                    </motion.div>
                                )}
                                {idCardTab === 'presence' && (
                                    <motion.div 
                                      key="presence"
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: 'auto' }}
                                      exit={{ opacity: 0, height: 0 }}
                                      className="space-y-3 mt-4"
                                    >
                                         <h5 className="text-[10px] font-mythic uppercase text-primary/60 border-b border-primary/10 pb-1">Physical Presence</h5>
                                         <div className="grid grid-cols-3 gap-3">
                                            <ScionInput 
                                                label="Height" 
                                                className="h-8 text-xs bg-black/40 border-primary/20"
                                                value={presenceProfile.height}
                                                onChange={(e) => setPresenceProfile({...presenceProfile, height: e.target.value})}
                                            />
                                            <ScionInput 
                                                label="Eye Color" 
                                                className="h-8 text-xs bg-black/40 border-primary/20"
                                                value={presenceProfile.eyeColor}
                                                onChange={(e) => setPresenceProfile({...presenceProfile, eyeColor: e.target.value})}
                                            />
                                            <ScionInput 
                                                label="Hair Color" 
                                                className="h-8 text-xs bg-black/40 border-primary/20"
                                                value={presenceProfile.hairColor}
                                                onChange={(e) => setPresenceProfile({...presenceProfile, hairColor: e.target.value})}
                                            />
                                            <div className="col-span-3">
                                                <ScionInput 
                                                    label="Distinguishing Marks" 
                                                    className="h-8 text-xs bg-black/40 border-primary/20"
                                                    value={presenceProfile.distinguishingMark}
                                                    onChange={(e) => setPresenceProfile({...presenceProfile, distinguishingMark: e.target.value})}
                                                />
                                            </div>
                                         </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                         </div>
                     </div>
                </MythicHUDFrame>

                {/* 2. LEGEND & AETHER (Replaces old square blocks) */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Legend Module */}
                    <div className="bg-black/40 border border-primary/30 p-4 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute top-0 right-0 p-1 opacity-50">
                            <Crown className="w-4 h-4 text-primary" />
                        </div>
                        <h4 className="text-[10px] font-mythic tracking-widest text-primary/60 mb-2">LEGEND RANK</h4>
                        <div className="flex items-center justify-center">
                            <span className="text-4xl font-mythic text-primary drop-shadow-[0_0_10px_gold]">{legend}</span>
                        </div>
                        <div className="mt-2 text-center text-[9px] text-muted-foreground font-tech">
                            POOL: {legendPoolTotal}
                        </div>
                    </div>

                    {/* Aether Module */}
                    <div className="bg-black/40 border border-primary/30 p-4 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute top-0 right-0 p-1 opacity-50">
                            <Zap className="w-4 h-4 text-primary" />
                        </div>
                        <h4 className="text-[10px] font-mythic tracking-widest text-primary/60 mb-2">AETHER LEVEL</h4>
                        <div className="flex items-center justify-center relative">
                             <svg className="w-12 h-12 -rotate-90">
                                <circle cx="24" cy="24" r="20" stroke="#333" strokeWidth="3" fill="transparent" />
                                <circle 
                                  cx="24" cy="24" r="20" 
                                  stroke="#d4af37" 
                                  strokeWidth="3" 
                                  fill="transparent" 
                                  strokeDasharray={`${2 * Math.PI * 20}`}
                                  strokeDashoffset={`${2 * Math.PI * 20 * (1 - aetherPercentage/100)}`}
                                  strokeLinecap="round"
                                />
                             </svg>
                             <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-primary">{aetherPercentage}%</span>
                        </div>
                    </div>
                </div>

                {/* 3. VIRTUES MODULE */}
                <MythicHUDFrame title="Virtue Matrix" icon={Target} subHeader="MORAL COMPASS ALIGNMENT">
                    <div className="space-y-3">
                        {virtues.map((virtue, idx) => (
                           <div key={idx} className="relative group">
                               {/* Tech Background for Virtue Row */}
                               <div className="absolute inset-0 bg-primary/5 skew-x-[-10deg] border border-primary/10 group-hover:border-primary/30 transition-colors" />
                               
                               <div className="relative z-10 flex items-center justify-between p-2 pl-4">
                                   <div className="flex flex-col">
                                       <input 
                                         value={virtue.name} 
                                         onChange={(e) => updateVirtue(idx, 'name', e.target.value)}
                                         className="bg-transparent border-none focus:ring-0 outline-none w-32 text-xs font-mythic uppercase tracking-widest text-primary/90 placeholder:text-primary/30" 
                                         placeholder={`VIRTUE 0${idx+1}`}
                                       />
                                       <div className="h-[1px] w-full bg-gradient-to-r from-primary/30 to-transparent mt-0.5" />
                                   </div>
                                   
                                   <div className="flex items-center gap-3">
                                       <span className="text-sm font-bold font-code text-primary opacity-50 group-hover:opacity-100 transition-opacity">{virtue.value}</span>
                                       <DotRating 
                                          value={virtue.value} 
                                          max={5} 
                                          onChange={(v) => updateVirtue(idx, 'value', v)} 
                                          iconClassName="w-2.5 h-2.5 rotate-45 border-primary/40 group-hover:border-primary/70"
                                          activeClassName="bg-primary shadow-[0_0_8px_gold] scale-110"
                                       />
                                   </div>
                               </div>
                           </div>
                        ))}
                    </div>
                </MythicHUDFrame>

            </div>

            {/* MIDDLE COLUMN: ATTRIBUTES & CALLINGS (Width 4) */}
            <div className="col-span-12 md:col-span-4 flex flex-col gap-6">

                {/* 1. ATTRIBUTES CORE */}
                <MythicHUDFrame title="Attributes Core" icon={Dna} subHeader="PHYSICAL / SOCIAL / MENTAL">
                    <div className="space-y-6">
                        {(Object.entries(attributes) as [AttributeCategory, Attribute[]][]).map(([category, attrs]) => (
                            <div key={category} className="space-y-2 relative">
                                <h4 className="text-[10px] font-mythic uppercase tracking-[0.3em] text-primary/50 border-b border-primary/10 pb-1 mb-2">
                                    {category}
                                </h4>
                                {attrs.map((attr, idx) => (
                                    <div key={attr.name} className="flex flex-col gap-1 group">
                                        <div className="flex justify-between items-end mb-1">
                                            <span className="text-xs font-bold font-tech text-foreground uppercase tracking-wider flex items-center gap-2">
                                                <span className="text-primary/40 text-[10px] w-4">{attr.rune}</span>
                                                {attr.name}
                                            </span>
                                            <div className="flex gap-2 text-[10px] font-mono text-primary/60">
                                                <span>VAL: {attr.value}</span>
                                                {attr.epic > 0 && <span className="text-accent-foreground">EPIC: {attr.epic}</span>}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <DotRating 
                                                value={attr.value} 
                                                onChange={(v) => updateAttribute(category, idx, 'value', v)} 
                                                max={10}
                                                className="flex-1"
                                                iconClassName="w-2 h-2 rounded-full border border-primary/30"
                                                activeClassName="bg-primary shadow-[0_0_4px_gold] border-primary"
                                            />
                                            {/* Epic Toggle - Expanded to 10 slots */}
                                            <div className="flex gap-0.5 ml-auto">
                                                {Array.from({length: 10}).map((_, i) => {
                                                    const e = i + 1;
                                                    return (
                                                        <div 
                                                            key={e} 
                                                            onClick={() => updateAttribute(category, idx, 'epic', attr.epic === e ? 0 : e)}
                                                            className={cn(
                                                                "w-1.5 h-3 border border-primary/30 cursor-pointer transition-all hover:border-accent-foreground",
                                                                attr.epic >= e ? "bg-accent-foreground shadow-[0_0_5px_var(--color-accent-foreground)]" : "bg-black/40"
                                                            )}
                                                            title={`Epic Rank ${e}`}
                                                        />
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </MythicHUDFrame>
                
                {/* 2. CALLINGS MODULE */}
                <MythicHUDFrame title="Divine Callings" icon={Crosshair} subHeader="ROLE SPECIALIZATIONS">
                    <div className="space-y-3">
                        {callings.map((calling, idx) => (
                            <div key={idx} className="relative">
                                {/* Calling Card Background */}
                                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent border-l-2 border-primary/60" />
                                
                                <div className="relative z-10 p-3 flex flex-col gap-2">
                                    <div className="flex justify-between items-center">
                                        <div className="flex flex-col">
                                            <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-tech">CALLING 0{idx+1}</span>
                                            <ScionInput 
                                                value={calling.name} 
                                                onChange={(e) => updateCalling(idx, 'name', e.target.value)}
                                                placeholder="SELECT CALLING"
                                                className="text-base font-mythic uppercase tracking-wider text-primary bg-transparent border-none p-0 h-auto focus:ring-0 drop-shadow-md" 
                                            />
                                        </div>
                                        <div className="flex items-center bg-black/40 p-1 rounded-sm border border-primary/20">
                                            <DotRating 
                                                value={calling.value} 
                                                max={5} 
                                                onChange={(v) => updateCalling(idx, 'value', v)} 
                                                iconClassName="w-2.5 h-2.5 rounded-sm border-primary/50"
                                                activeClassName="bg-primary shadow-[0_0_6px_gold]"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-primary/30" />
                                        <ScionInput 
                                            value={calling.title} 
                                            onChange={(e) => updateCalling(idx, 'title', e.target.value)}
                                            placeholder="Enter Epithet / Title..."
                                            className="flex-1 text-[10px] font-code text-primary/70 bg-transparent border-none p-0 h-auto italic" 
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </MythicHUDFrame>

            </div>

            {/* RIGHT COLUMN: ABILITIES & COMBAT (Width 4) */}
            <div className="col-span-12 md:col-span-4 flex flex-col gap-6">

                {/* 1. VITALITY MONITOR */}
                <MythicHUDFrame title="Vitality Monitor" icon={Activity} subHeader="BIOMETRICS & WILLPOWER">
                    <div className="space-y-6">
                        {/* Willpower */}
                        <div className="space-y-2">
                             <div className="flex justify-between items-center text-xs font-mythic uppercase text-primary/70">
                                 <span>Willpower Integrity</span>
                                 <span>{willpowerCurrent} / {willpower}</span>
                             </div>
                             <div className="p-2 bg-black/40 border border-primary/20 rounded-sm">
                                 <div className="flex justify-between gap-1 mb-2">
                                    <DotRating value={willpower} max={10} onChange={setWillpower} iconClassName="w-2 h-2" activeClassName="bg-primary" />
                                 </div>
                                 <div className="flex gap-1 justify-between">
                                     {Array.from({length: 10}).map((_, i) => (
                                         <button 
                                            key={i} 
                                            onClick={() => setWillpowerCurrent(i < willpowerCurrent ? i : i + 1)}
                                            className={cn(
                                                "h-1.5 w-full rounded-sm transition-all",
                                                i < willpowerCurrent ? "bg-primary shadow-[0_0_5px_gold]" : "bg-primary/10"
                                            )} 
                                            disabled={i >= willpower}
                                         />
                                     ))}
                                 </div>
                             </div>
                        </div>

                        {/* Health Track */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-xs font-mythic uppercase text-primary/70">
                                 <span>Structural Integrity</span>
                                 <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
                                     <span className="w-2 h-2 border border-primary/50 bg-black/50 block" /> B
                                     <span className="w-2 h-2 border border-primary/50 bg-black/50 flex items-center justify-center text-[8px]" >x</span> L
                                     <span className="w-2 h-2 border border-red-500/50 bg-black/50 flex items-center justify-center text-[8px] text-red-500" >*</span> A
                                 </div>
                             </div>
                             <div className="flex flex-wrap gap-2 justify-center">
                                 {currentHealthLevels.map((level, idx) => (
                                     <div key={idx} className="flex flex-col items-center gap-1">
                                         <HealthBox status={healthDamage[idx]} onClick={() => toggleHealth(idx)} />
                                         <span className="text-[9px] font-tech text-muted-foreground">{level}</span>
                                     </div>
                                 ))}
                             </div>
                        </div>

                        {/* Combat Derived Stats - Compact Grid */}
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-primary/10">
                            <div className="bg-black/40 p-2 flex justify-between items-center border-l-2 border-primary/40">
                                <span className="text-[9px] uppercase tracking-wider text-muted-foreground">Dodge DV</span>
                                <span className="font-mythic text-primary">{dodgeDV}</span>
                            </div>
                            <div className="bg-black/40 p-2 flex justify-between items-center border-l-2 border-primary/40">
                                <span className="text-[9px] uppercase tracking-wider text-muted-foreground">Parry DV</span>
                                <span className="font-mythic text-primary">{parryDV}</span>
                            </div>
                            <div className="bg-black/40 p-2 flex justify-between items-center border-l-2 border-primary/40">
                                <span className="text-[9px] uppercase tracking-wider text-muted-foreground">Soak (B/L)</span>
                                <span className="font-mythic text-primary">{bashingSoak}/{lethalSoak}</span>
                            </div>
                             <div className="bg-black/40 p-2 flex justify-between items-center border-l-2 border-primary/40">
                                <span className="text-[9px] uppercase tracking-wider text-muted-foreground">Join Battle</span>
                                <span className="font-mythic text-primary">{joinBattle}</span>
                            </div>
                        </div>
                    </div>
                </MythicHUDFrame>

                {/* 2. ABILITIES SCROLL */}
                <MythicHUDFrame title="Abilities Database" icon={Brain} subHeader="SKILL SET MATRIX" className="flex-1 min-h-[500px] flex flex-col">
                    <div className="flex-1 overflow-y-auto pr-2 scion-scrollbar custom-scroll-area">
                        <div className="grid grid-cols-1 gap-1 h-full content-start">
                            {ABILITIES_LIST.map((abilityName) => {
                                const ability = abilities[abilityName];
                                const isFavored = false; // Todo: Add favored logic
                                return (
                                    <div key={abilityName} className={cn(
                                        "flex items-center justify-between p-2 hover:bg-primary/5 rounded-sm transition-colors border border-transparent hover:border-primary/10 group",
                                        ability.value > 0 ? "opacity-100" : "opacity-60 hover:opacity-100"
                                    )}>
                                        <div className="flex items-center gap-2">
                                            <span className={cn(
                                                "text-xs uppercase tracking-wider font-tech transition-colors",
                                                ability.value > 0 ? "text-primary" : "text-muted-foreground group-hover:text-primary/70"
                                            )}>
                                                {abilityName}
                                            </span>
                                            {/* Add specialty button (hidden by default) */}
                                            <button 
                                                onClick={() => addSpecialty(abilityName)}
                                                className="opacity-0 group-hover:opacity-100 text-primary/40 hover:text-primary transition-opacity"
                                            >
                                                <Plus className="w-3 h-3" />
                                            </button>
                                        </div>
                                        
                                        <div className="flex flex-col items-end gap-1">
                                            <DotRating 
                                                value={ability.value} 
                                                max={5} 
                                                onChange={(v) => updateAbilityValue(abilityName, v)}
                                                iconClassName="w-1.5 h-1.5"
                                                activeClassName="bg-primary"
                                            />
                                            {/* Specialties List */}
                                            {ability.specialties.length > 0 && (
                                                <div className="flex flex-col gap-1 mt-1 items-end">
                                                    {ability.specialties.map((spec, sIdx) => (
                                                        <div key={sIdx} className="flex items-center gap-1">
                                                            <input 
                                                                value={spec.name}
                                                                onChange={(e) => updateSpecialty(abilityName, sIdx, 'name', e.target.value)}
                                                                placeholder="Specialty"
                                                                className="text-[9px] bg-transparent border-b border-primary/20 w-20 text-right focus:border-primary outline-none text-primary/70"
                                                            />
                                                            <button onClick={() => removeSpecialty(abilityName, sIdx)} className="text-red-500/50 hover:text-red-500"><X className="w-2 h-2" /></button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </MythicHUDFrame>

            </div>

        </div> 
        {/* --- GRID END --- */}


        {/* BOTTOM SECTION: POWERS & GEAR (Full Width) */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* POWERS */}
            <MythicHUDFrame title="Supernatural Arsenal" icon={Zap} subHeader="KNACKS & BOONS" className="min-h-[300px]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     {/* Knacks Column */}
                     <div>
                         <h5 className="text-xs font-mythic text-primary/60 border-b border-primary/20 pb-1 mb-3 uppercase">Knacks Registry</h5>
                         <div className="space-y-2">
                             {knacks.map((k, i) => (
                                 <div key={i} className="flex items-center gap-2 p-2 bg-primary/5 border-l-2 border-primary/40 text-sm font-tech text-primary/90">
                                     <div className="w-1 h-1 bg-primary rounded-full shadow-[0_0_5px_gold]" />
                                     {k}
                                 </div>
                             ))}
                             <div className="flex items-center gap-2 mt-2 opacity-50 focus-within:opacity-100 transition-opacity">
                                 <Plus className="w-4 h-4 text-primary" />
                                 <input 
                                     value={newKnack}
                                     onChange={(e) => setNewKnack(e.target.value)}
                                     onKeyDown={(e) => e.key === 'Enter' && addKnack()}
                                     placeholder="Add New Knack Protocol..."
                                     className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-muted-foreground/50"
                                 />
                             </div>
                         </div>
                     </div>

                     {/* Boons Column */}
                     <div>
                         <h5 className="text-xs font-mythic text-accent-foreground/60 border-b border-accent-foreground/20 pb-1 mb-3 uppercase">Boons Registry</h5>
                         <div className="space-y-2">
                             {boons.map((b, i) => (
                                 <div key={i} className="flex items-center gap-2 p-2 bg-accent/10 border-l-2 border-accent text-sm font-tech text-accent-foreground/90">
                                      <div className="w-1 h-1 bg-accent-foreground rounded-full shadow-[0_0_5px_red]" />
                                     {b}
                                 </div>
                             ))}
                             <div className="flex items-center gap-2 mt-2 opacity-50 focus-within:opacity-100 transition-opacity">
                                 <Plus className="w-4 h-4 text-accent-foreground" />
                                 <input 
                                     value={newBoon}
                                     onChange={(e) => setNewBoon(e.target.value)}
                                     onKeyDown={(e) => e.key === 'Enter' && addBoon()}
                                     placeholder="Add New Boon Invocation..."
                                     className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-muted-foreground/50"
                                 />
                             </div>
                         </div>
                     </div>
                </div>
            </MythicHUDFrame>

            {/* GEAR */}
            <MythicHUDFrame title="Offensive Capabilities" icon={Sword} subHeader="WEAPONRY & ATTACK VECTORS" className="min-h-[300px]">
                <div className="space-y-4">
                    {/* Weapons Table Header */}
                    <div className="grid grid-cols-12 gap-2 text-[9px] uppercase tracking-widest text-muted-foreground border-b border-primary/10 pb-2 bg-primary/5 p-2 rounded-t-sm">
                        <div className="col-span-4">Weapon Designation</div>
                        <div className="col-span-2 text-center">Acc</div>
                        <div className="col-span-2 text-center">Dmg</div>
                        <div className="col-span-2 text-center">Def</div>
                        <div className="col-span-2 text-right">Tags</div>
                    </div>

                    {/* Weapons List */}
                    <div className="space-y-1">
                        {weapons.map((w, i) => (
                            <div key={i} className="grid grid-cols-12 gap-2 text-xs font-tech text-primary/80 items-center p-2 hover:bg-primary/10 rounded-sm transition-colors border-l-2 border-transparent hover:border-primary group relative overflow-hidden">
                                {/* Hover Effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                
                                <div className="col-span-4 font-bold truncate relative z-10 flex items-center gap-2">
                                    <Crosshair className="w-3 h-3 text-primary/40 group-hover:text-primary transition-colors" />
                                    {w.name}
                                </div>
                                <div className="col-span-2 text-center text-muted-foreground relative z-10 group-hover:text-primary transition-colors">+{w.accuracy}</div>
                                <div className="col-span-2 text-center text-muted-foreground relative z-10 group-hover:text-red-400 transition-colors">+{w.damage}L</div>
                                <div className="col-span-2 text-center text-muted-foreground relative z-10 group-hover:text-primary transition-colors">+{w.defense}</div>
                                <div className="col-span-2 text-right text-[9px] uppercase relative z-10 opacity-70 group-hover:opacity-100">{w.tags}</div>
                            </div>
                        ))}
                    </div>

                    {/* Add Weapon Mini-Form */}
                    <div className="grid grid-cols-12 gap-2 pt-2 border-t border-primary/10 mt-auto bg-black/40 p-2 rounded-sm">
                        <div className="col-span-4">
                            <input 
                                value={newWeapon.name} 
                                onChange={e => setNewWeapon({...newWeapon, name: e.target.value})}
                                placeholder="NEW WEAPON..." 
                                className="w-full bg-black/30 border border-primary/20 text-xs px-2 py-1 rounded-sm focus:border-primary text-primary placeholder:text-primary/20 outline-none"
                            />
                        </div>
                        <div className="col-span-2">
                             <input 
                                value={newWeapon.accuracy} 
                                onChange={e => setNewWeapon({...newWeapon, accuracy: e.target.value})}
                                placeholder="ACC" 
                                className="w-full bg-black/30 border border-primary/20 text-xs px-1 py-1 rounded-sm text-center text-primary placeholder:text-primary/20 outline-none"
                            />
                        </div>
                        <div className="col-span-2">
                             <input 
                                value={newWeapon.damage} 
                                onChange={e => setNewWeapon({...newWeapon, damage: e.target.value})}
                                placeholder="DMG" 
                                className="w-full bg-black/30 border border-primary/20 text-xs px-1 py-1 rounded-sm text-center text-primary placeholder:text-primary/20 outline-none"
                            />
                        </div>
                        <div className="col-span-3 flex items-center gap-2">
                             <input 
                                value={newWeapon.tags} 
                                onChange={e => setNewWeapon({...newWeapon, tags: e.target.value})}
                                placeholder="TAGS" 
                                className="w-full bg-black/30 border border-primary/20 text-xs px-1 py-1 rounded-sm text-primary placeholder:text-primary/20 outline-none"
                            />
                             <button onClick={addWeapon} className="p-1 bg-primary/20 hover:bg-primary/40 text-primary rounded-sm shadow-[0_0_5px_rgba(212,175,55,0.2)]">
                                <Plus className="w-3 h-3" />
                             </button>
                        </div>
                    </div>
                </div>
            </MythicHUDFrame>

        </div>

        <SectionDivider label="END OF LINE" />

      </div>
    </div>
  );
}
