import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DotRating } from "@/components/ui/dot-rating";
import { ScionInput } from "@/components/ui/scion-input";
import { Link, useRoute } from "wouter";
import { cn } from "@/lib/utils";
import { Shield, Zap, Skull, Scroll, Activity, Cpu, Hexagon, Plus, Trash2, Crown, Heart, Radar, Minus, Upload, Image as ImageIcon, X, FileText, User, LayoutGrid, ArrowLeft, Target, Sword, Crosshair, Fingerprint, Dna, Brain, Pencil, Check, Loader2, Star } from "lucide-react";
import { useCharacter, useUpdateCharacter } from "@/lib/use-characters";
import { useCompendium } from "@/lib/compendium-store";
import { Button } from "@/components/ui/button";
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
  sparks: number;
  heritage: boolean;
  specialties: { name: string; value: number }[];
}

interface AbilitySchema {
  name: string;
  ratingColumn: string;
  sparksColumn: string;
  heritageColumn: string;
  specialtiesColumn: string;
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

// Default abilities list - will be replaced by API data if available
const DEFAULT_ABILITIES_LIST = [
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
    variant = "default",
    titleSize = "default",
    isEditing,
    onEdit,
    onSave,
    onCancel,
    isLoading
}: {  
    children: React.ReactNode, 
    title?: string, 
    className?: string, 
    icon?: any, 
    action?: React.ReactNode, 
    subHeader?: string,
    variant?: "default" | "minimal" | "cyber",
    titleSize?: "default" | "large",
    isEditing?: boolean,
    onEdit?: () => void,
    onSave?: () => void,
    onCancel?: () => void,
    isLoading?: boolean
}) => (
  <div className={cn("relative group", isEditing && "ring-1 ring-primary/50", className)}>
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
                    {title && <h3 className={cn("font-mythic text-primary tracking-widest uppercase text-shadow-glow", titleSize === "large" ? "text-xl" : "text-lg")}>{title}</h3>}
                    {subHeader && <span className="text-[9px] font-tech uppercase tracking-[0.2em] text-muted-foreground">{subHeader}</span>}
                </div>
            </div>
            
            <div className="flex items-center gap-2">
                <AnimatePresence mode="wait">
                    {onEdit && !isEditing && (
                        <motion.button 
                            key="edit-btn"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            onClick={onEdit}
                            data-testid="button-edit-section"
                            className="h-6 w-6 p-1 rounded-full border border-primary/30 hover:border-primary hover:bg-primary/10 hover:shadow-[0_0_10px_rgba(212,175,55,0.2)] text-primary transition-all flex items-center justify-center"
                            title="Edit"
                        >
                            <Pencil size={12} />
                        </motion.button>
                    )}
                    {isEditing && (
                        <motion.div 
                            key="edit-actions"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            className="flex gap-2"
                        >
                            <button 
                                onClick={onSave}
                                disabled={isLoading}
                                data-testid="button-save-section"
                                className="h-6 px-3 bg-black/40 border border-green-500/50 text-green-400 hover:bg-green-900/20 hover:text-green-300 hover:border-green-400 font-tech uppercase text-[10px] tracking-wider rounded-sm flex items-center gap-1 transition-all disabled:opacity-50"
                            >
                                {isLoading ? <Loader2 size={10} className="animate-spin" /> : <><Check size={10} /> Save</>}
                            </button>
                            <button 
                                onClick={onCancel}
                                disabled={isLoading}
                                data-testid="button-cancel-edit"
                                className="h-6 px-3 bg-black/40 border border-red-500/50 text-red-400 hover:bg-red-900/20 hover:text-red-300 hover:border-red-400 font-tech uppercase text-[10px] tracking-wider rounded-sm flex items-center gap-1 transition-all disabled:opacity-50"
                            >
                                <X size={10} /> Cancel
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
                
                {/* Status Indicator */}
                <div 
                    className={cn(
                        "w-1.5 h-1.5 rotate-45 border border-primary ml-1 transition-all duration-500",
                        isEditing ? "bg-green-400 border-green-400 shadow-[0_0_8px_green]" : "bg-transparent opacity-50"
                    )} 
                />
                
                {action && <div className="flex items-center ml-2">{action}</div>}
            </div>
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
  const [match, params] = useRoute("/character-sheet/:id");
  const characterId = params?.id;
  const { data: loadedCharacter, isLoading } = useCharacter(characterId);
  const { mutate: updateCharacter } = useUpdateCharacter();
  const { callings: compendiumCallings, natures: compendiumNatures, virtues: compendiumVirtues } = useCompendium();
  const [activeTab, setActiveTab] = useState<"sheet" | "powers" | "bio">("sheet");
  const [idCardTab, setIdCardTab] = useState<"identity" | "psychic" | "presence" | "professional">("identity");
  
  
  // State
  const [attributes, setAttributes] = useState(DEFAULT_ATTRIBUTES);
  const [legend, setLegend] = useState(2);
  const [aetherPercentage, setAetherPercentage] = useState(0);
  const [scionName, setScionName] = useState("");
  const [scionPlayer, setScionPlayer] = useState("");
  const [scionPantheon, setScionPantheon] = useState("");
  const [divineParent, setDivineParent] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [nationality, setNationality] = useState("");
  const [cityOfOrigin, setCityOfOrigin] = useState("");
  const [stateRegion, setStateRegion] = useState("");

  // Sync with URL params
  useEffect(() => {
    if (loadedCharacter) {
      // Basic identity
      setScionName(loadedCharacter.name);
      setScionPlayer(loadedCharacter.player || "");
      setScionPantheon(loadedCharacter.pantheon || "");
      setDivineParent(loadedCharacter.divineParent || "");
      setDateOfBirth(loadedCharacter.dateOfBirth || "");
      setNationality(loadedCharacter.nationality || "");
      setCityOfOrigin(loadedCharacter.cityOfOrigin || "");
      setStateRegion(loadedCharacter.stateRegion || "");
      
      // Core stats
      setLegend(loadedCharacter.legend);
      setLegendPointsCurrent(loadedCharacter.legendPointsCurrent);
      
      // Attributes
      if (loadedCharacter.attributes && typeof loadedCharacter.attributes === 'object') {
        setAttributes(loadedCharacter.attributes as any);
      }
      
      // Abilities
      if (loadedCharacter.abilities && typeof loadedCharacter.abilities === 'object') {
        setAbilities(loadedCharacter.abilities as any);
      }
      
      // Callings
      if (Array.isArray(loadedCharacter.callings)) {
        setCallings(loadedCharacter.callings as any);
      }
      
      // Virtues
      if (Array.isArray(loadedCharacter.virtues)) {
        setVirtues(loadedCharacter.virtues as any);
      }
      
      // Willpower
      setWillpower(loadedCharacter.willpower);
      setWillpowerCurrent(loadedCharacter.willpowerCurrent);
      
      // Health
      setExtraOxBody(loadedCharacter.extraOxBody);
      if (Array.isArray(loadedCharacter.healthDamage)) {
        setHealthDamage(loadedCharacter.healthDamage as any);
      }
      
      // Powers
      if (Array.isArray(loadedCharacter.knacks)) {
        setKnacks(loadedCharacter.knacks as any);
      }
      if (Array.isArray(loadedCharacter.boons)) {
        setBoons(loadedCharacter.boons as any);
      }
      
      // Equipment
      if (Array.isArray(loadedCharacter.weapons)) {
        setWeapons(loadedCharacter.weapons as any);
      }
      if (Array.isArray(loadedCharacter.armorList)) {
        setArmorList(loadedCharacter.armorList as any);
      }
      if (Array.isArray(loadedCharacter.feats)) {
        setFeats(loadedCharacter.feats as any);
      }
      
      // Portrait
      if (loadedCharacter.portrait) {
        setPortrait(loadedCharacter.portrait);
      }
      
      // Profiles
      if (loadedCharacter.psychicProfile && typeof loadedCharacter.psychicProfile === 'object') {
        setPsychicProfile(loadedCharacter.psychicProfile as any);
      }
      if (loadedCharacter.presenceProfile && typeof loadedCharacter.presenceProfile === 'object') {
        setPresenceProfile(loadedCharacter.presenceProfile as any);
      }
      
      // New fields from Scionsight/Scrolls
      setNature(loadedCharacter.nature || "");
      setLegendaryTitle(loadedCharacter.legendaryTitle || "");
      setBiography(loadedCharacter.biography || "");
      setZodiacSign(loadedCharacter.zodiacSign || "");
      setPlaylistLink(loadedCharacter.playlistLink || "");
      
      if (loadedCharacter.birthrights && typeof loadedCharacter.birthrights === 'object') {
        setBirthrights(loadedCharacter.birthrights as any);
      }
      if (loadedCharacter.movementFeats && typeof loadedCharacter.movementFeats === 'object') {
        setMovementFeats(loadedCharacter.movementFeats as any);
      }
      if (loadedCharacter.professionalProfile && typeof loadedCharacter.professionalProfile === 'object') {
        setProfessionalProfile(loadedCharacter.professionalProfile as any);
      }
    }
  }, [loadedCharacter]);

  // Abilities schema from API
  const [abilitiesSchema, setAbilitiesSchema] = useState<AbilitySchema[]>(
    DEFAULT_ABILITIES_LIST.map(name => ({
      name,
      ratingColumn: `ability_${name.toLowerCase()}_rating`,
      sparksColumn: `ability_${name.toLowerCase()}_sparks_rating`,
      heritageColumn: `ability_${name.toLowerCase()}_heritage_fav`,
      specialtiesColumn: `ability_${name.toLowerCase()}_specialties_rating`
    }))
  );
  
  // Fetch abilities schema from API
  useEffect(() => {
    fetch('/api/abilities-schema')
      .then(res => res.json())
      .then(data => {
        if (data.abilities && data.abilities.length > 0) {
          setAbilitiesSchema(data.abilities);
        }
      })
      .catch(err => console.error('Failed to fetch abilities schema:', err));
  }, []);

  const [abilities, setAbilities] = useState<Record<string, Ability>>(
    DEFAULT_ABILITIES_LIST.reduce((acc, curr) => ({ 
      ...acc, 
      [curr]: { name: curr, value: 0, sparks: 0, heritage: false, specialties: [] } 
    }), {} as Record<string, Ability>)
  );
  
  const [callings, setCallings] = useState<Calling[]>([
    { id: 1, name: "", title: "", value: 1 },
    { id: 2, name: "", title: "", value: 1 },
    { id: 3, name: "", title: "", value: 1 },
  ]);

  const [virtues, setVirtues] = useState<Virtue[]>([]);
  
  // Available virtues from database for autocomplete
  const [availableVirtues, setAvailableVirtues] = useState<{id: string, name: string, description?: string}[]>([]);
  const [virtueSearchOpen, setVirtueSearchOpen] = useState<number | null>(null);
  const [availableNatures, setAvailableNatures] = useState<{id: string, name: string, description?: string}[]>([]);
  const [natureSearchOpen, setNatureSearchOpen] = useState(false);
  
  // Fetch available virtues from API
  useEffect(() => {
    fetch('/api/virtues')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setAvailableVirtues(data);
        }
      })
      .catch(err => console.error('Failed to fetch virtues:', err));
      
    // Fetch available natures from API
    fetch('/api/list-natures')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setAvailableNatures(data);
        }
      })
      .catch(err => console.error('Failed to fetch natures:', err));
  }, []);

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

  // New fields from Scionsight/Scrolls
  const [nature, setNature] = useState("");
  const [legendaryTitle, setLegendaryTitle] = useState("");
  const [biography, setBiography] = useState("");
  const [zodiacSign, setZodiacSign] = useState("");
  const [playlistLink, setPlaylistLink] = useState("");
  
  const [birthrights, setBirthrights] = useState({
    creatures: "",
    guides: "",
    followers: "",
    relics: ""
  });
  
  const [movementFeats, setMovementFeats] = useState({
    walk: 0,
    run: 0,
    jump: 0,
    lift: 0
  });
  
  const [professionalProfile, setProfessionalProfile] = useState({
    educationHistory: "",
    mentorInfo: "",
    pupilInfo: "",
    interestedPurviews: "",
    interestedAttributes: "",
    interestedAbilities: "",
    professionalNotes: ""
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
  
  const addVirtue = (virtueName?: string) => {
    const newId = virtues.length > 0 ? Math.max(...virtues.map(v => v.id)) + 1 : 1;
    setVirtues([...virtues, { id: newId, name: virtueName || "", value: 1 }]);
  };
  
  const removeVirtue = (index: number) => {
    setVirtues(virtues.filter((_, i) => i !== index));
  };

  const updateAbilityValue = (abilityName: string, newValue: number) => {
    setAbilities(prev => ({
      ...prev,
      [abilityName]: { ...prev[abilityName], value: Math.max(0, newValue) }
    }));
  };

  const updateAbilitySparks = (abilityName: string, newSparks: number) => {
    setAbilities(prev => ({
      ...prev,
      [abilityName]: { ...prev[abilityName], sparks: Math.min(5, Math.max(0, newSparks)) }
    }));
  };

  const updateAbilityHeritage = (abilityName: string, isHeritage: boolean) => {
    setAbilities(prev => ({
      ...prev,
      [abilityName]: { ...prev[abilityName], heritage: isHeritage }
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

  // Prepare Radar Data (with safety checks for attribute arrays)
  const radarData = [
     ...(attributes.Physical || []),
     ...(attributes.Social || []),
     ...(attributes.Mental || [])
  ].filter(attr => attr && attr.name).map(attr => ({
     subject: attr.name.substring(0, 3).toUpperCase(),
     A: attr.value || 0,
     fullMark: 10
  }));

  // Combat & Physics Calculations (Updated - with safety checks)
  const getAttributeTotal = (name: AttributeName) => {
    let attr: Attribute | undefined;
    for (const cat of Object.values(attributes || {})) {
      if (Array.isArray(cat)) {
        attr = cat.find(a => a && a.name === name);
        if (attr) break;
      }
    }
    return attr ? (attr.value || 0) + (attr.epic || 0) : 0; 
  };
  
  const getAttributeEpic = (name: AttributeName) => {
    let attr: Attribute | undefined;
    for (const cat of Object.values(attributes || {})) {
      if (Array.isArray(cat)) {
        attr = cat.find(a => a && a.name === name);
        if (attr) break;
      }
    }
    return attr ? (attr.epic || 0) : 0;
  };

  const getAbilityValue = (name: string) => abilities[name]?.value || 0;

  // Legend Pool Calculation (Scion 1st Edition: Legend ^ 2)
  const legendPoolTotal = legend * legend;
  const [legendPointsCurrent, setLegendPointsCurrent] = useState(legendPoolTotal);

  // Combat Stats (Scion 1st Ed)
  // Join Battle = Wits + Awareness
  const joinBattle = getAttributeTotal("Wits") + getAbilityValue("Awareness");
  // DV = [(Dexterity + Athletics + Legend) / 2]
  const dodgeDV = Math.ceil((getAttributeTotal("Dexterity") + getAbilityValue("Athletics") + legend) / 2);
  // Parry DV = [(Dexterity + Brawl/Melee + Weapon Defense) / 2]
  const parryDV = Math.ceil((getAttributeTotal("Dexterity") + Math.max(getAbilityValue("Melee"), getAbilityValue("Brawl"))) / 2); 
  
  // Soak (Scion 1st Ed)
  // Bashing Soak = Stamina + Epic Stamina
  // Lethal Soak = RoundDown(Stamina / 2) + Epic Stamina
  // Aggravated Soak = Epic Stamina
  // + Armor values added later
  const staminaVal = getAttributeTotal("Stamina") - getAttributeEpic("Stamina"); // Base Stamina
  const epicStamina = getAttributeEpic("Stamina");
  
  const baseBashingSoak = staminaVal + epicStamina;
  const baseLethalSoak = Math.floor(staminaVal / 2) + epicStamina;
  const baseAggSoak = epicStamina;

  const [armorList, setArmorList] = useState<{name: string, soakB: number, soakL: number, soakA: number, mobility: number, fatigue: number}[]>([]);
  
  // Calculate total soak with armor
  const totalBashingSoak = baseBashingSoak + armorList.reduce((acc, curr) => acc + curr.soakB, 0);
  const totalLethalSoak = baseLethalSoak + armorList.reduce((acc, curr) => acc + curr.soakL, 0);
  const totalAggSoak = baseAggSoak + armorList.reduce((acc, curr) => acc + curr.soakA, 0);

  // New State for Feats / Merits (if separate from Knacks)
  const [feats, setFeats] = useState<{name: string, type: string, cost: string, desc: string}[]>([]);
  const [newFeat, setNewFeat] = useState({name: "", type: "", cost: "", desc: ""});

  // Edit mode states for each section
  const [editingIdentity, setEditingIdentity] = useState(false);
  const [editingAttributes, setEditingAttributes] = useState(false);
  const [editingAbilities, setEditingAbilities] = useState(false);
  const [editingVirtues, setEditingVirtues] = useState(false);
  const [editingCombat, setEditingCombat] = useState(false);
  const [editingPowers, setEditingPowers] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState(false);
  const [editingVitality, setEditingVitality] = useState(false);

  // Save function to persist character changes to database
  const handleSave = () => {
    if (!characterId) return;
    
    updateCharacter({
      id: characterId,
      updates: {
        name: scionName,
        player: scionPlayer,
        pantheon: scionPantheon,
        divineParent,
        dateOfBirth,
        nationality,
        cityOfOrigin,
        stateRegion,
        legend,
        legendPointsCurrent,
        attributes,
        abilities,
        callings,
        virtues,
        willpower,
        willpowerCurrent,
        extraOxBody,
        healthDamage,
        knacks,
        boons,
        weapons,
        armorList,
        feats,
        portrait: portrait || undefined,
        psychicProfile,
        presenceProfile,
        // New fields from Scionsight/Scrolls
        nature,
        legendaryTitle,
        biography,
        zodiacSign,
        playlistLink,
        birthrights,
        movementFeats,
        professionalProfile,
      },
    });
  };

  // Loading state for saving
  const [isSaving, setIsSaving] = useState(false);

  // Auto-save for interactive fields (no edit mode required)
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialMount = useRef(true);
  
  useEffect(() => {
    // Skip initial mount to avoid saving on load
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
    // Debounced auto-save for interactive fields
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    autoSaveTimeoutRef.current = setTimeout(() => {
      if (characterId) {
        updateCharacter({
          id: characterId,
          updates: {
            legendPointsCurrent,
            willpowerCurrent,
            healthDamage,
            portrait: portrait || undefined,
          },
        });
      }
    }, 1000); // 1 second debounce
    
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [legendPointsCurrent, willpowerCurrent, healthDamage, portrait, characterId]);

  // Create edit handlers for each section
  const createEditHandlers = (isEditing: boolean, setEditing: (v: boolean) => void) => ({
    onEdit: () => setEditing(true),
    onSave: () => {
      handleSave();
      setEditing(false);
    },
    onCancel: () => setEditing(false),
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-mythic-void text-foreground flex items-center justify-center">
        <p className="font-tech text-primary uppercase tracking-widest">Loading character data...</p>
      </div>
    );
  }

  // No character found
  if (!characterId || (!loadedCharacter && !isLoading)) {
    return (
      <div className="min-h-screen bg-mythic-void text-foreground flex flex-col items-center justify-center gap-4">
        <p className="font-tech text-muted-foreground uppercase tracking-widest">No character selected</p>
        <Link href="/">
          <button className="text-sm text-primary hover:text-white border border-primary/30 hover:border-primary px-6 py-3 rounded-sm font-mythic uppercase tracking-wider flex items-center gap-2 transition-all hover:shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:bg-primary/10">
            <ArrowLeft className="w-4 h-4" /> Return Home
          </button>
        </Link>
      </div>
    );
  }

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
                <div className="flex items-center gap-2">
                  <Link href="/">
                    <button className="flex items-center gap-2 text-[10px] font-mythic uppercase tracking-widest text-primary border border-primary/30 px-3 py-1 hover:bg-primary/10 transition-colors rounded-sm hover:shadow-[0_0_10px_rgba(212,175,55,0.2)] group">
                      <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" /> TERMINATE SESSION
                    </button>
                  </Link>
                </div>
            </div>
        </div>

        {/* --- GRID LAYOUT START --- */}
        <div className="grid grid-cols-12 gap-6">

            {/* LEFT COLUMN: IDENTITY & VIRTUES (Width 4) */}
            <div className="col-span-12 md:col-span-4 flex flex-col gap-6">
                
                {/* 1. IDENTITY MODULE */}
                <MythicHUDFrame title="Identity Matrix" icon={Fingerprint} subHeader="SUBJECT DESIGNATION" className="h-auto" isEditing={editingIdentity} {...createEditHandlers(editingIdentity, setEditingIdentity)}>
                     <div className="flex flex-col gap-4">
                         {/* Portrait + Name - Always visible */}
                         <div className="relative h-[280px] w-full border border-primary/20 bg-black/50 overflow-hidden group">
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
                                      viewMode={!editingIdentity}
                                     />
                                     <div className="flex gap-2 mt-1">
                                         <ScionInput 
                                            value={scionPantheon} 
                                            onChange={(e) => setScionPantheon(e.target.value)}
                                            placeholder="PANTHEON" 
                                            className="text-xs font-tech tracking-[0.2em] text-primary/70 uppercase border-none bg-transparent p-0 shadow-none h-auto" 
                                            viewMode={!editingIdentity}
                                         />
                                     </div>
                                </div>
                             </div>
                             <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePortraitUpload} />
                         </div>
                         
                         {/* Tab Content Area */}
                         <div className="p-2 border border-primary/10 bg-primary/5 rounded-sm relative overflow-hidden">
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-10" />
                            
                            {/* Tab Navigation */}
                            <div className="flex gap-3 border-b border-primary/20 pb-1 relative z-10">
                              {['identity', 'psychic', 'presence', 'professional'].map((tab) => (
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
                                {idCardTab === 'identity' && (
                                    <motion.div 
                                      key="identity"
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: 'auto' }}
                                      exit={{ opacity: 0, height: 0 }}
                                      className="space-y-3 mt-4"
                                    >
                                        <h5 className="text-[10px] font-mythic uppercase text-primary border-b border-primary/20 pb-1">Basic Data</h5>
                                        
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="col-span-2">
                                                <label className="text-[9px] uppercase tracking-widest text-muted-foreground block mb-1">Designation (Name)</label>
                                                <ScionInput 
                                                   value={scionName} 
                                                   onChange={(e) => setScionName(e.target.value)}
                                                   className="h-8 text-sm bg-black/40 border-primary/20 focus:border-primary/50 font-code text-primary" 
                                                   viewMode={!editingIdentity}
                                                />
                                            </div>
                                            
                                            <div>
                                                <label className="text-[9px] uppercase tracking-widest text-muted-foreground block mb-1">Pantheon</label>
                                                <ScionInput 
                                                   value={scionPantheon} 
                                                   onChange={(e) => setScionPantheon(e.target.value)}
                                                   className="h-8 text-sm bg-black/40 border-primary/20 focus:border-primary/50 font-code text-primary" 
                                                   viewMode={!editingIdentity}
                                                   list="pantheons-list"
                                                />
                                                <datalist id="pantheons-list">
                                                   <option value="Aesir" />
                                                   <option value="Kami" />
                                                   <option value="Manitou" />
                                                   <option value="Netjer" />
                                                   <option value="Theoi" />
                                                   <option value="Tuatha Dé Danann" />
                                                   <option value="Yazata" />
                                                </datalist>
                                            </div>

                                            <div>
                                                <label className="text-[9px] uppercase tracking-widest text-muted-foreground block mb-1">Heritage (Divine Parent)</label>
                                                <ScionInput 
                                                   value={divineParent} 
                                                   onChange={(e) => setDivineParent(e.target.value)}
                                                   className="h-8 text-sm bg-black/40 border-primary/20 focus:border-primary/50 font-code text-[hsl(var(--highlight-amber))]" 
                                                   viewMode={!editingIdentity}
                                                />
                                            </div>

                                            <div>
                                                <label className="text-[9px] uppercase tracking-widest text-muted-foreground block mb-1">Date of Birth</label>
                                                <ScionInput 
                                                   value={dateOfBirth} 
                                                   onChange={(e) => setDateOfBirth(e.target.value)}
                                                   className="h-8 text-sm bg-black/40 border-primary/20 focus:border-primary/50 font-code text-primary" 
                                                   viewMode={!editingIdentity}
                                                   type="date"
                                                />
                                            </div>

                                            <div>
                                                <label className="text-[9px] uppercase tracking-widest text-muted-foreground block mb-1">Nationality</label>
                                                <ScionInput 
                                                   value={nationality} 
                                                   onChange={(e) => setNationality(e.target.value)}
                                                   className="h-8 text-sm bg-black/40 border-primary/20 focus:border-primary/50 font-code text-primary" 
                                                   viewMode={!editingIdentity}
                                                />
                                            </div>

                                            <div>
                                                <label className="text-[9px] uppercase tracking-widest text-muted-foreground block mb-1">City of Origin</label>
                                                <ScionInput 
                                                   value={cityOfOrigin} 
                                                   onChange={(e) => setCityOfOrigin(e.target.value)}
                                                   className="h-8 text-sm bg-black/40 border-primary/20 focus:border-primary/50 font-code text-primary" 
                                                   viewMode={!editingIdentity}
                                                />
                                            </div>

                                            <div>
                                                <label className="text-[9px] uppercase tracking-widest text-muted-foreground block mb-1">State / Region</label>
                                                <ScionInput 
                                                   value={stateRegion} 
                                                   onChange={(e) => setStateRegion(e.target.value)}
                                                   className="h-8 text-sm bg-black/40 border-primary/20 focus:border-primary/50 font-code text-primary" 
                                                   viewMode={!editingIdentity}
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                                {idCardTab === 'psychic' && (
                                    <motion.div 
                                      key="psychic"
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: 'auto' }}
                                      exit={{ opacity: 0, height: 0 }}
                                      className="space-y-3 mt-4"
                                    >
                                        <h5 className="text-[10px] font-mythic uppercase text-[hsl(var(--highlight-purple))] border-b border-[hsl(var(--highlight-purple))]/20 pb-1">Psychological Matrix</h5>
                                        
                                        <div className="space-y-2">
                                            <ScionInput 
                                                label="Deep Analysis" 
                                                className="h-16 text-xs bg-black/40 border-primary/20 resize-none"
                                                textarea
                                                value={psychicProfile.analysis}
                                                onChange={(e) => setPsychicProfile({...psychicProfile, analysis: e.target.value})}
                                                viewMode={!editingIdentity}
                                            />
                                            
                                            <div className="grid grid-cols-2 gap-3">
                                                <ScionInput 
                                                    label="Keywords" 
                                                    className="h-8 text-xs bg-black/40 border-primary/20"
                                                    value={psychicProfile.keywords}
                                                    onChange={(e) => setPsychicProfile({...psychicProfile, keywords: e.target.value})}
                                                    viewMode={!editingIdentity}
                                                />
                                                <ScionInput 
                                                    label="Major Arcana" 
                                                    className="h-8 text-xs bg-black/40 border-primary/20 text-[hsl(var(--highlight-purple))]"
                                                    value={psychicProfile.majorArcana}
                                                    onChange={(e) => setPsychicProfile({...psychicProfile, majorArcana: e.target.value})}
                                                    viewMode={!editingIdentity}
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <ScionInput 
                                                    label="Temperament" 
                                                    className="h-8 text-xs bg-black/40 border-primary/20"
                                                    value={psychicProfile.temperament}
                                                    onChange={(e) => setPsychicProfile({...psychicProfile, temperament: e.target.value})}
                                                    viewMode={!editingIdentity}
                                                />
                                                <ScionInput 
                                                    label="Cognitive Type" 
                                                    className="h-8 text-xs bg-black/40 border-primary/20"
                                                    value={psychicProfile.cognitiveType}
                                                    onChange={(e) => setPsychicProfile({...psychicProfile, cognitiveType: e.target.value})}
                                                    viewMode={!editingIdentity}
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <ScionInput 
                                                    label="Strengths" 
                                                    className="h-8 text-xs bg-black/40 border-primary/20 text-green-400/80"
                                                    value={psychicProfile.strengths}
                                                    onChange={(e) => setPsychicProfile({...psychicProfile, strengths: e.target.value})}
                                                    viewMode={!editingIdentity}
                                                />
                                                <ScionInput 
                                                    label="Weaknesses" 
                                                    className="h-8 text-xs bg-black/40 border-primary/20 text-red-400/80"
                                                    value={psychicProfile.weaknesses}
                                                    onChange={(e) => setPsychicProfile({...psychicProfile, weaknesses: e.target.value})}
                                                    viewMode={!editingIdentity}
                                                />
                                            </div>

                                            <ScionInput 
                                                label="Behaviors" 
                                                className="h-8 text-xs bg-black/40 border-primary/20"
                                                value={psychicProfile.behaviors}
                                                onChange={(e) => setPsychicProfile({...psychicProfile, behaviors: e.target.value})}
                                                viewMode={!editingIdentity}
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
                                         <h5 className="text-[10px] font-mythic uppercase text-[hsl(var(--highlight-blue))] border-b border-[hsl(var(--highlight-blue))]/20 pb-1">Physical Presence</h5>
                                         
                                         <div className="grid grid-cols-3 gap-3">
                                            <ScionInput 
                                                label="Height" 
                                                className="h-8 text-xs bg-black/40 border-primary/20"
                                                value={presenceProfile.height}
                                                onChange={(e) => setPresenceProfile({...presenceProfile, height: e.target.value})}
                                                viewMode={!editingIdentity}
                                            />
                                            <ScionInput 
                                                label="Eye Color" 
                                                className="h-8 text-xs bg-black/40 border-primary/20"
                                                value={presenceProfile.eyeColor}
                                                onChange={(e) => setPresenceProfile({...presenceProfile, eyeColor: e.target.value})}
                                                viewMode={!editingIdentity}
                                            />
                                            <ScionInput 
                                                label="Hair Color" 
                                                className="h-8 text-xs bg-black/40 border-primary/20"
                                                value={presenceProfile.hairColor}
                                                onChange={(e) => setPresenceProfile({...presenceProfile, hairColor: e.target.value})}
                                                viewMode={!editingIdentity}
                                            />
                                         </div>

                                         <div className="grid grid-cols-2 gap-3">
                                            <ScionInput 
                                                label="Aura Signature" 
                                                className="h-8 text-xs bg-black/40 border-primary/20 text-[hsl(var(--highlight-blue))]"
                                                value={presenceProfile.auraSignature}
                                                onChange={(e) => setPresenceProfile({...presenceProfile, auraSignature: e.target.value})}
                                                viewMode={!editingIdentity}
                                            />
                                            <ScionInput 
                                                label="Scent / Essence" 
                                                className="h-8 text-xs bg-black/40 border-primary/20"
                                                value={presenceProfile.scent}
                                                onChange={(e) => setPresenceProfile({...presenceProfile, scent: e.target.value})}
                                                viewMode={!editingIdentity}
                                            />
                                         </div>

                                         <ScionInput 
                                            label="Fashion & Style" 
                                            className="h-8 text-xs bg-black/40 border-primary/20"
                                            value={presenceProfile.fashion}
                                            onChange={(e) => setPresenceProfile({...presenceProfile, fashion: e.target.value})}
                                            viewMode={!editingIdentity}
                                         />

                                         <ScionInput 
                                            label="Distinguishing Marks" 
                                            className="h-8 text-xs bg-black/40 border-primary/20"
                                            value={presenceProfile.distinguishingMark}
                                            onChange={(e) => setPresenceProfile({...presenceProfile, distinguishingMark: e.target.value})}
                                            viewMode={!editingIdentity}
                                         />
                                         
                                         <ScionInput 
                                            label="Visual Notes" 
                                            className="h-16 text-xs bg-black/40 border-primary/20 resize-none"
                                            textarea
                                            value={presenceProfile.visualNotes}
                                            onChange={(e) => setPresenceProfile({...presenceProfile, visualNotes: e.target.value})}
                                            viewMode={!editingIdentity}
                                         />
                                    </motion.div>
                                )}
                                {idCardTab === 'professional' && (
                                    <motion.div 
                                      key="professional"
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: 'auto' }}
                                      exit={{ opacity: 0, height: 0 }}
                                      className="space-y-3 mt-4"
                                    >
                                        <h5 className="text-[10px] font-mythic uppercase text-[hsl(var(--highlight-orange))] border-b border-[hsl(var(--highlight-orange))]/20 pb-1">Professional Profile</h5>
                                        
                                        <ScionInput 
                                            label="Education History" 
                                            className="h-12 text-xs bg-black/40 border-primary/20 resize-none"
                                            textarea
                                            value={professionalProfile.educationHistory}
                                            onChange={(e) => setProfessionalProfile({...professionalProfile, educationHistory: e.target.value})}
                                            viewMode={!editingIdentity}
                                        />
                                        
                                        <div className="grid grid-cols-2 gap-3">
                                            <ScionInput 
                                                label="Mentor Info" 
                                                className="h-8 text-xs bg-black/40 border-primary/20"
                                                value={professionalProfile.mentorInfo}
                                                onChange={(e) => setProfessionalProfile({...professionalProfile, mentorInfo: e.target.value})}
                                                viewMode={!editingIdentity}
                                            />
                                            <ScionInput 
                                                label="Pupil Info" 
                                                className="h-8 text-xs bg-black/40 border-primary/20"
                                                value={professionalProfile.pupilInfo}
                                                onChange={(e) => setProfessionalProfile({...professionalProfile, pupilInfo: e.target.value})}
                                                viewMode={!editingIdentity}
                                            />
                                        </div>
                                        
                                        <h5 className="text-[10px] font-mythic uppercase text-primary/70 border-b border-primary/20 pb-1 mt-2">Interests</h5>
                                        
                                        <div className="grid grid-cols-3 gap-3">
                                            <ScionInput 
                                                label="Purviews" 
                                                className="h-8 text-xs bg-black/40 border-primary/20"
                                                value={professionalProfile.interestedPurviews}
                                                onChange={(e) => setProfessionalProfile({...professionalProfile, interestedPurviews: e.target.value})}
                                                viewMode={!editingIdentity}
                                            />
                                            <ScionInput 
                                                label="Attributes" 
                                                className="h-8 text-xs bg-black/40 border-primary/20"
                                                value={professionalProfile.interestedAttributes}
                                                onChange={(e) => setProfessionalProfile({...professionalProfile, interestedAttributes: e.target.value})}
                                                viewMode={!editingIdentity}
                                            />
                                            <ScionInput 
                                                label="Abilities" 
                                                className="h-8 text-xs bg-black/40 border-primary/20"
                                                value={professionalProfile.interestedAbilities}
                                                onChange={(e) => setProfessionalProfile({...professionalProfile, interestedAbilities: e.target.value})}
                                                viewMode={!editingIdentity}
                                            />
                                        </div>
                                        
                                        <ScionInput 
                                            label="Professional Notes" 
                                            className="h-16 text-xs bg-black/40 border-primary/20 resize-none"
                                            textarea
                                            value={professionalProfile.professionalNotes}
                                            onChange={(e) => setProfessionalProfile({...professionalProfile, professionalNotes: e.target.value})}
                                            viewMode={!editingIdentity}
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                         </div>
                     </div>
                </MythicHUDFrame>

                {/* 2. LEGEND & AETHER (Replaces old square blocks) */}
                {/* MOVED TO VITALITY MONITOR */}

            </div>

            {/* MIDDLE COLUMN: CALLINGS (Width 4) */}
            <div className="col-span-12 md:col-span-4 flex flex-col gap-6">
                
                {/* CALLINGS MODULE - Compact Design */}
                <MythicHUDFrame title="Divine Callings" icon={Crosshair} subHeader="ROLE SPECIALIZATIONS" isEditing={editingCombat} {...createEditHandlers(editingCombat, setEditingCombat)}>
                    <div className="space-y-1.5">
                        {callings.map((calling, idx) => (
                            <div key={idx} className="relative group">
                                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent border-l-2 border-primary/60" />
                                
                                <div className="relative z-10 px-3 py-2 flex items-center justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[8px] uppercase tracking-widest text-muted-foreground font-tech shrink-0">0{idx+1}</span>
                                            <ScionInput 
                                                value={calling.name} 
                                                onChange={(e) => updateCalling(idx, 'name', e.target.value)}
                                                placeholder="CALLING"
                                                className="text-sm font-mythic uppercase tracking-wider text-primary bg-transparent border-none p-0 h-auto focus:ring-0 drop-shadow-md" 
                                                viewMode={!editingCombat}
                                            />
                                        </div>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <span className="text-[8px] text-primary/40">»</span>
                                            <ScionInput 
                                                value={calling.title} 
                                                onChange={(e) => updateCalling(idx, 'title', e.target.value)}
                                                placeholder="Epithet..."
                                                className="flex-1 text-[9px] font-code text-primary/60 bg-transparent border-none p-0 h-auto italic" 
                                                viewMode={!editingCombat}
                                            />
                                        </div>
                                    </div>
                                    <DotRating 
                                        value={calling.value} 
                                        max={5} 
                                        onChange={(v) => updateCalling(idx, 'value', v)} 
                                        iconClassName="w-2 h-2 rounded-sm border-primary/50"
                                        activeClassName="bg-primary shadow-[0_0_4px_gold]"
                                        readOnly={!editingCombat}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    {/* Nature Section - Compact inline */}
                    <div className="mt-2 pt-2 border-t border-primary/15">
                        <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--highlight-purple))]/10 to-transparent border-l-2 border-[hsl(var(--highlight-purple))]/60" />
                            <div className="relative z-10 px-3 py-1.5 flex items-center gap-2">
                                <span className="text-[8px] uppercase tracking-widest text-muted-foreground font-tech shrink-0">NAT</span>
                                <div className="flex-1 relative">
                                    <input 
                                        value={nature} 
                                        onChange={(e) => setNature(e.target.value)}
                                        onFocus={() => editingCombat && setNatureSearchOpen(true)}
                                        onBlur={() => setTimeout(() => setNatureSearchOpen(false), 200)}
                                        className="w-full text-sm font-mythic uppercase tracking-wider text-[hsl(var(--highlight-purple))] bg-transparent border-none p-0 h-auto focus:ring-0 outline-none placeholder:text-primary/30" 
                                        placeholder="SELECT NATURE"
                                        disabled={!editingCombat}
                                    />
                                    {/* Nature Tooltip on hover */}
                                    {nature && !editingCombat && (() => {
                                        const foundNature = availableNatures.find(n => n.name.toLowerCase() === nature.toLowerCase());
                                        return foundNature?.description ? (
                                            <div className="absolute left-0 top-full mt-2 p-2 bg-black/95 border border-primary/30 rounded-sm text-[10px] font-tech text-primary/70 max-w-[250px] opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
                                                {foundNature.description}
                                            </div>
                                        ) : null;
                                    })()}
                                    {/* Autocomplete dropdown */}
                                    {natureSearchOpen && editingCombat && (
                                        <div className="absolute top-full left-0 right-0 mt-1 bg-black/95 border border-primary/30 rounded-sm max-h-40 overflow-y-auto z-50">
                                            {availableNatures
                                                .filter(n => n.name.toLowerCase().includes(nature.toLowerCase()))
                                                .slice(0, 10)
                                                .map(n => (
                                                    <div
                                                        key={n.id}
                                                        onClick={() => {
                                                            setNature(n.name);
                                                            setNatureSearchOpen(false);
                                                        }}
                                                        className="w-full text-left px-2 py-1.5 text-xs font-tech text-primary/80 hover:bg-primary/20 hover:text-primary transition-colors cursor-pointer"
                                                        title={n.description || ''}
                                                    >
                                                        <span className="block">{n.name}</span>
                                                        {n.description && (
                                                            <span className="block text-[9px] text-muted-foreground truncate">{n.description}</span>
                                                        )}
                                                    </div>
                                                ))
                                            }
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </MythicHUDFrame>

            </div>

            {/* RIGHT COLUMN: VIRTUES (Width 4) */}
            <div className="col-span-12 md:col-span-4 flex flex-col gap-6">

                {/* VIRTUES MODULE - Compact like Callings */}
                <MythicHUDFrame title="Virtue Matrix" icon={Target} subHeader="MORAL COMPASS" isEditing={editingVirtues} {...createEditHandlers(editingVirtues, setEditingVirtues)}>
                    <div className="space-y-1.5">
                        {virtues.length === 0 ? (
                            <div className="text-center py-3">
                                <p className="text-[10px] text-muted-foreground mb-2">Nenhuma virtude</p>
                                {editingVirtues && (
                                    <button 
                                        onClick={() => addVirtue()}
                                        className="flex items-center gap-1 mx-auto text-[10px] text-primary hover:text-primary/80 transition-colors"
                                    >
                                        <Plus className="w-3 h-3" />
                                        Adicionar
                                    </button>
                                )}
                            </div>
                        ) : (
                            <>
                                {virtues.map((virtue, idx) => (
                                    <div key={virtue.id} className="relative group">
                                        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent border-l-2 border-primary/60" />
                                        
                                        <div className="relative z-10 px-3 py-2 flex items-center justify-between gap-2">
                                            <div className="flex-1 min-w-0 relative group/virtue">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[8px] uppercase tracking-widest text-muted-foreground font-tech shrink-0">0{idx+1}</span>
                                                    <input 
                                                        value={virtue.name} 
                                                        onChange={(e) => updateVirtue(idx, 'name', e.target.value)}
                                                        onFocus={() => editingVirtues && setVirtueSearchOpen(idx)}
                                                        onBlur={() => setTimeout(() => setVirtueSearchOpen(null), 200)}
                                                        className="text-sm font-mythic uppercase tracking-wider text-primary bg-transparent border-none p-0 h-auto focus:ring-0 drop-shadow-md outline-none placeholder:text-primary/30" 
                                                        placeholder="VIRTUE"
                                                        disabled={!editingVirtues}
                                                    />
                                                    {/* Description Tooltip on hover */}
                                                    {virtue.name && !editingVirtues && (() => {
                                                        const foundVirtue = availableVirtues.find(v => v.name.toLowerCase() === virtue.name.toLowerCase());
                                                        return foundVirtue?.description ? (
                                                            <div className="absolute left-0 top-full mt-2 p-2 bg-black/95 border border-primary/30 rounded-sm text-[10px] font-tech text-primary/70 max-w-[200px] opacity-0 group-hover/virtue:opacity-100 transition-opacity z-50 pointer-events-none">
                                                                {foundVirtue.description}
                                                            </div>
                                                        ) : null;
                                                    })()}
                                                    {/* Autocomplete dropdown */}
                                                    {virtueSearchOpen === idx && editingVirtues && (
                                                        <div className="absolute top-full left-0 right-0 mt-1 bg-black/95 border border-primary/30 rounded-sm max-h-32 overflow-y-auto z-50">
                                                            {availableVirtues
                                                                .filter(v => v.name.toLowerCase().includes(virtue.name.toLowerCase()))
                                                                .slice(0, 8)
                                                                .map(v => (
                                                                    <div
                                                                        key={v.id}
                                                                        onClick={() => {
                                                                            updateVirtue(idx, 'name', v.name);
                                                                            setVirtueSearchOpen(null);
                                                                        }}
                                                                        className="w-full text-left px-2 py-1.5 text-xs font-tech text-primary/80 hover:bg-primary/20 hover:text-primary transition-colors cursor-pointer"
                                                                        title={v.description || ''}
                                                                    >
                                                                        <span className="block">{v.name}</span>
                                                                        {v.description && (
                                                                            <span className="block text-[9px] text-muted-foreground truncate">{v.description}</span>
                                                                        )}
                                                                    </div>
                                                                ))
                                                            }
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <DotRating 
                                                    value={virtue.value} 
                                                    max={5} 
                                                    onChange={(v) => updateVirtue(idx, 'value', v)} 
                                                    iconClassName="w-2 h-2 rounded-sm border-primary/50"
                                                    activeClassName="bg-primary shadow-[0_0_4px_gold]"
                                                    readOnly={!editingVirtues}
                                                />
                                                {editingVirtues && (
                                                    <button 
                                                        onClick={() => removeVirtue(idx)}
                                                        className="text-red-500/50 hover:text-red-500 transition-colors"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {editingVirtues && virtues.length < 5 && (
                                    <button 
                                        onClick={() => addVirtue()}
                                        className="flex items-center gap-2 text-xs text-primary/50 hover:text-primary transition-colors mt-2"
                                    >
                                        <Plus className="w-3 h-3" />
                                        Adicionar Virtude
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </MythicHUDFrame>

            </div>

        </div> 
        {/* --- TOP 3-COLUMN GRID END --- */}

        {/* VITALITY ROW - Full Width with 3 sections */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* 1. VITALITY MONITOR - No edit mode needed, fields are always interactive */}
            <MythicHUDFrame 
                title="Vitality & Energy" 
                icon={Activity} 
                subHeader="BIOMETRICS & POOLS"
            >
                    <div className="space-y-6">
                        {/* Legend & Aether Integrated */}
                        <div className="grid grid-cols-2 gap-3 pb-4 border-b border-primary/10">
                            {/* Legend Module */}
                            <div className="bg-black/60 border border-[hsl(var(--highlight-amber))]/30 p-3 relative overflow-hidden group rounded-sm shadow-[0_0_15px_rgba(255,160,0,0.1)] col-span-2">
                                <div className="absolute inset-0 bg-[hsl(var(--highlight-amber))]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="text-[10px] font-mythic tracking-widest text-[hsl(var(--highlight-amber))] flex items-center gap-2">
                                        <Crown className="w-3 h-3" /> LEGEND RANK
                                    </h4>
                                    <div className="flex items-center gap-2">
                                         <span className="text-[9px] text-muted-foreground uppercase">PERMANENT:</span>
                                         <span className="text-xl font-mythic text-[hsl(var(--highlight-amber))] drop-shadow-[0_0_10px_orange] leading-none">{legend}</span>
                                    </div>
                                </div>
                                
                                {/* Legend Pool Tracker - Boxes */}
                                <div className="space-y-1">
                                    <div className="flex justify-between items-end">
                                        <span className="text-[9px] font-tech text-muted-foreground uppercase tracking-widest">LEGEND POOL ({legendPointsCurrent}/{legendPoolTotal})</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                        {Array.from({ length: legendPoolTotal }).map((_, i) => (
                                            <button
                                                key={i}
                                                onClick={() => {
                                                    if (legendPointsCurrent === i + 1) {
                                                        setLegendPointsCurrent(i); // Toggle off if clicking the last active one
                                                    } else {
                                                        setLegendPointsCurrent(i + 1);
                                                    }
                                                }}
                                                className={cn(
                                                    "w-3 h-3 border transition-all duration-300 relative overflow-hidden",
                                                    i < legendPointsCurrent 
                                                        ? "bg-[hsl(var(--highlight-amber))] border-[hsl(var(--highlight-amber))] shadow-[0_0_5px_orange]" 
                                                        : "bg-transparent border-primary/20 hover:border-[hsl(var(--highlight-amber))]/50"
                                                )}
                                                style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)" }} // Standard square for points
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Willpower */}
                        <div className="space-y-2">
                             <div className="flex justify-between items-center text-xs font-mythic uppercase text-primary/70">
                                 <span>Willpower Integrity</span>
                                 <span>{willpowerCurrent} / {willpower}</span>
                             </div>
                             <div className="p-2 bg-black/40 border border-primary/20 rounded-sm">
                                 <div className="flex justify-between gap-1 mb-2">
                                    <DotRating value={willpower} max={10} onChange={setWillpower} iconClassName="w-2 h-2" activeClassName="bg-primary" readOnly={!editingVitality} />
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

                        {/* Feats & Merits Section */}
                        <div className="space-y-2 pt-2 border-t border-primary/10">
                             <div className="flex justify-between items-center">
                                <h5 className="text-[10px] font-mythic uppercase text-primary/70">Feats & Merits</h5>
                                <button className="text-[10px] text-primary hover:text-white border border-primary/30 px-2 py-0.5 rounded-sm hover:bg-primary/20 transition-colors">+ ADD</button>
                             </div>
                            {feats.length === 0 ? (
                                <div className="text-[10px] text-muted-foreground/40 italic text-center py-2 border border-dashed border-primary/10 rounded-sm">
                                    NO FEATS RECORDED
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    {feats.map((feat, i) => (
                                        <div key={i} className="flex justify-between items-center text-[10px] bg-black/40 p-2 border border-primary/10 rounded-sm">
                                            <span className="text-primary font-bold">{feat.name}</span>
                                            <span className="text-muted-foreground">{feat.cost}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
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
                                <span className="font-mythic text-primary">{totalBashingSoak}/{totalLethalSoak}</span>
                            </div>
                             <div className="bg-black/40 p-2 flex justify-between items-center border-l-2 border-primary/40">
                                <span className="text-[9px] uppercase tracking-wider text-muted-foreground">Join Battle</span>
                                <span className="font-mythic text-primary">{joinBattle}</span>
                            </div>
                        </div>
                    </div>
                </MythicHUDFrame>

        </div> 
        {/* --- VITALITY ROW END --- */}

        {/* ATTRIBUTES & ABILITIES ROW - 1/3 + 2/3 */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {/* ATTRIBUTES CORE - 1 column */}
            <MythicHUDFrame title="Attributes Core" icon={Dna} subHeader="PHYSICAL / SOCIAL / MENTAL" className="md:col-span-1 flex flex-col" titleSize="large" isEditing={editingAttributes} {...createEditHandlers(editingAttributes, setEditingAttributes)}>
                <div className="space-y-4 flex-1 flex flex-col justify-between">
                    {(Object.entries(attributes) as [AttributeCategory, Attribute[]][]).map(([category, attrs]) => (
                        <div key={category} className="space-y-1.5 relative flex-1">
                            <h4 className="text-[11px] font-mythic uppercase tracking-[0.2em] text-primary/60 border-b border-primary/20 pb-1.5 mb-2">
                                {category}
                            </h4>
                            {attrs.map((attr, idx) => (
                                <div key={attr.name} className="flex items-center justify-between gap-2 group py-1 px-1 hover:bg-primary/5 rounded-sm transition-colors">
                                    <div className="flex items-center gap-2">
                                        <span className="text-primary/50 text-[10px] w-4">{attr.rune}</span>
                                        <span className="text-[11px] font-bold font-tech text-foreground uppercase tracking-wide">
                                            {attr.name}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <DotRating 
                                            value={attr.value} 
                                            onChange={(v) => updateAttribute(category, idx, 'value', v)} 
                                            max={5}
                                            iconClassName="w-2 h-2 rounded-full border border-primary/40"
                                            activeClassName="bg-primary shadow-[0_0_4px_gold] border-primary"
                                            readOnly={!editingAttributes}
                                        />
                                        <span className="text-xs font-mythic text-primary w-3 text-center">{attr.value}</span>
                                        {/* Epic indicator */}
                                        <div className="flex gap-0.5">
                                            {Array.from({length: 5}).map((_, i) => {
                                                const e = i + 1;
                                                return (
                                                    <div 
                                                        key={e} 
                                                        onClick={() => editingAttributes && updateAttribute(category, idx, 'epic', attr.epic === e ? 0 : e)}
                                                        className={cn(
                                                            "w-1.5 h-2.5 border border-accent-foreground/30 transition-all rounded-sm",
                                                            editingAttributes ? "cursor-pointer hover:border-accent-foreground" : "cursor-default",
                                                            attr.epic >= e ? "bg-accent-foreground shadow-[0_0_4px_cyan]" : "bg-black/40"
                                                        )}
                                                        title={`Epic ${e}`}
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

            {/* ABILITIES SCROLL - 2 columns */}
            <MythicHUDFrame title="Abilities Database" icon={Brain} subHeader="SKILL SET MATRIX" className="md:col-span-2 flex flex-col" titleSize="large" isEditing={editingAbilities} {...createEditHandlers(editingAbilities, setEditingAbilities)}>
                <div className="flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-1 h-full content-start">
                        {abilitiesSchema.map((schema) => {
                            const abilityName = schema.name;
                            const ability = abilities[abilityName] || { value: 0, sparks: 0, heritage: false, specialties: [] };
                            const isHeritage = ability.heritage;
                            return (
                                <div key={abilityName} className={cn(
                                    "flex items-center justify-between py-1.5 px-2 hover:bg-primary/5 rounded-sm transition-colors border-l-2 group",
                                    (ability.value || 0) > 0 ? "opacity-100 border-l-primary/30" : "opacity-70 hover:opacity-100 border-l-transparent",
                                    isHeritage && "border-l-[hsl(var(--highlight-amber))] bg-[hsl(var(--highlight-amber))]/5"
                                )}>
                                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                        {/* Heritage indicator - star icon */}
                                        {isHeritage && (
                                            <Star className="w-3 h-3 text-[hsl(var(--highlight-amber))] fill-[hsl(var(--highlight-amber))] flex-shrink-0" />
                                        )}
                                        <span className={cn(
                                            "text-[11px] uppercase tracking-wide font-tech transition-colors truncate",
                                            isHeritage ? "text-[hsl(var(--highlight-amber))] font-bold" : 
                                            (ability.value || 0) > 0 ? "text-foreground" : "text-muted-foreground group-hover:text-primary/70"
                                        )}>
                                            {abilityName}
                                        </span>
                                        {/* Heritage toggle button (in edit mode) */}
                                        {editingAbilities && (
                                            <button 
                                                onClick={() => updateAbilityHeritage(abilityName, !ability.heritage)}
                                                className={cn(
                                                    "opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0",
                                                    isHeritage ? "text-[hsl(var(--highlight-amber))]" : "text-muted-foreground/40 hover:text-[hsl(var(--highlight-amber))]"
                                                )}
                                                title="Toggle Heritage Favored"
                                            >
                                                <Star className="w-3 h-3" />
                                            </button>
                                        )}
                                    </div>
                                    
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        {/* Ability value as number */}
                                        {editingAbilities ? (
                                            <div className="flex items-center gap-1">
                                                <button 
                                                    onClick={() => updateAbilityValue(abilityName, Math.max(0, (ability.value || 0) - 1))}
                                                    className="text-primary/40 hover:text-primary"
                                                >
                                                    <Minus className="w-3 h-3" />
                                                </button>
                                                <span className="text-sm font-mythic text-primary w-4 text-center">{ability.value || 0}</span>
                                                <button 
                                                    onClick={() => updateAbilityValue(abilityName, Math.min(5, (ability.value || 0) + 1))}
                                                    className="text-primary/40 hover:text-primary"
                                                >
                                                    <Plus className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ) : (
                                            <span className={cn(
                                                "text-sm font-mythic w-5 text-center",
                                                (ability.value || 0) > 0 ? "text-primary" : "text-muted-foreground/40"
                                            )}>{ability.value || 0}</span>
                                        )}
                                        {/* Sparks indicator - always show 5 dots */}
                                        <div className="flex items-center gap-0.5">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => editingAbilities && updateAbilitySparks(abilityName, i < (ability.sparks || 0) ? i : i + 1)}
                                                    disabled={!editingAbilities}
                                                    className={cn(
                                                        "w-1.5 h-1.5 rounded-full border transition-all",
                                                        i < (ability.sparks || 0) 
                                                            ? "bg-accent-foreground border-accent-foreground shadow-[0_0_4px_cyan]" 
                                                            : "bg-transparent border-muted-foreground/30",
                                                        editingAbilities && "hover:border-accent-foreground cursor-pointer"
                                                    )}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </MythicHUDFrame>
        </div>


        {/* BOTTOM SECTION: POWERS & GEAR (Full Width) */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* POWERS */}
            <MythicHUDFrame title="Supernatural Arsenal" icon={Zap} subHeader="KNACKS & BOONS" className="min-h-[300px]" isEditing={editingPowers} {...createEditHandlers(editingPowers, setEditingPowers)}>
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
            <MythicHUDFrame title="Offensive Capabilities" icon={Sword} subHeader="WEAPONRY & ATTACK VECTORS" className="min-h-[300px]" isEditing={editingEquipment} {...createEditHandlers(editingEquipment, setEditingEquipment)}>
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
