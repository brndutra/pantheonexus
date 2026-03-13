import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DotRating } from "@/components/ui/dot-rating";
import { ScionInput } from "@/components/ui/scion-input";
import { Link, useRoute } from "wouter";
import { cn } from "@/lib/utils";
import { Shield, Zap, Skull, Scroll, Activity, Cpu, Hexagon, Plus, Trash2, Crown, Heart, Radar, Minus, Upload, Image as ImageIcon, X, FileText, User, LayoutGrid, ArrowLeft, Target, Sword, Crosshair, Fingerprint, Dna, Brain, Pencil, Check, Loader2, Star, Flame, ChevronDown, ChevronUp } from "lucide-react";
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
  category: string;
  accuracy: number;
  attackAttribute: string;
  attackAbility: string;
  damage: string;
  damageAttribute: string;
  defense: number;
  range: string | null;
  clip: string | null;
  speed: number;
  tags: string | null;
  isInnate?: boolean;
}

interface SupabaseOffensive {
  offensive_name: string;
  category: string;
  accuracy: number;
  attack_attribute: string;
  attack_ability: string;
  damage: string;
  damage_attribute: string;
  defense: number;
  range: string | null;
  clip: string | null;
  speed: number;
  tags: string | null;
}

interface SupabaseKnack {
  id: string;
  name: string;
  attribute: string;
  requirements: string;
  description: string;
  type: string;
  duration: string;
  range: string;
  usage_per_scene: string;
  visible: boolean;
  url_icon: string | null;
}

interface CharacterKnack {
  id: string;
  name: string;
  attribute: string;
  description: string;
  type: string;
}

interface ScionsightData {
  scion_id: string;
  legend_level: number;
  legend_pool_current: number | null;
  legend_pool_total: number;
  willpower_pool_current: number;
  willpower_pool_total: number;
  knacks_selected?: string[];
  boons_selected?: string[];
}

interface SupabaseBoon {
  id: string;
  name: string;
  purview: string;
  level: number;
  description: string;
  dice_pool: string | null;
  cost: string | null;
  duration: string | null;
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

const CyberSection = ({ 
    children, 
    title, 
    collapsed, 
    onToggle,
    testId,
    isEditing,
    onEditToggle
}: { 
    children: React.ReactNode;
    title: string;
    collapsed: boolean;
    onToggle: () => void;
    testId?: string;
    isEditing?: boolean;
    onEditToggle?: () => void;
}) => (
    <div className="mt-6 relative">
        <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none z-20">
            <svg viewBox="0 0 64 64" className="w-full h-full">
                <path d="M12,0 L64,0 L64,52 L52,64" fill="none" stroke="hsl(var(--primary))" strokeWidth="1.5" opacity="0.4" />
                <path d="M24,0 L64,0 L64,40" fill="none" stroke="hsl(var(--primary))" strokeWidth="1" opacity="0.25" />
                <line x1="20" y1="4" x2="56" y2="4" stroke="hsl(var(--primary))" strokeWidth="2" opacity="0.6" />
                <line x1="58" y1="8" x2="58" y2="36" stroke="hsl(var(--primary))" strokeWidth="1" opacity="0.3" />
            </svg>
        </div>
        <div className="absolute top-0 left-0 w-10 h-10 pointer-events-none z-20">
            <svg viewBox="0 0 40 40" className="w-full h-full">
                <path d="M0,8 L0,0 L8,0" fill="none" stroke="hsl(var(--primary))" strokeWidth="2" opacity="0.5" />
            </svg>
        </div>
        <div className="absolute bottom-0 left-0 w-10 h-10 pointer-events-none z-20">
            <svg viewBox="0 0 40 40" className="w-full h-full">
                <path d="M0,32 L0,40 L8,40" fill="none" stroke="hsl(var(--primary))" strokeWidth="2" opacity="0.5" />
            </svg>
        </div>
        <div className="absolute bottom-0 right-0 w-10 h-10 pointer-events-none z-20">
            <svg viewBox="0 0 40 40" className="w-full h-full">
                <path d="M32,40 L40,40 L40,32" fill="none" stroke="hsl(var(--primary))" strokeWidth="2" opacity="0.5" />
            </svg>
        </div>

        <div className="border border-primary/25 bg-black/30 overflow-hidden relative"
             style={{ clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))' }}>
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary/60 via-primary/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-primary/40" />
            <div className="absolute top-0 left-0 w-[2px] h-full bg-gradient-to-b from-primary/50 via-primary/15 to-primary/30" />

            <button 
                onClick={onToggle}
                className="w-full flex items-center justify-between px-5 py-3 bg-black/50 hover:bg-black/70 transition-colors cursor-pointer relative"
                data-testid={testId}
            >
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-primary/20" />
                <div className="flex items-center gap-3">
                    <div className="w-[3px] h-5 bg-primary/70 rounded-full" />
                    <span className="text-2xl font-display uppercase tracking-[0.3em] text-primary drop-shadow-[0_0_8px_hsl(var(--primary)/0.3)]">{title}</span>
                </div>
                <div className="flex items-center gap-2">
                    {onEditToggle && !collapsed && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onEditToggle(); }}
                            className={cn(
                                "h-6 px-2 flex items-center gap-1.5 border text-[9px] font-code uppercase tracking-wider transition-all rounded-sm",
                                isEditing 
                                    ? "border-primary/60 bg-primary/20 text-primary" 
                                    : "border-primary/20 bg-black/40 text-primary/50 hover:border-primary/40 hover:text-primary/80"
                            )}
                            data-testid="btn-edit-section"
                        >
                            {isEditing ? <Check className="w-3 h-3" /> : <Pencil className="w-3 h-3" />}
                            {isEditing ? "Save" : "Edit"}
                        </button>
                    )}
                    <div className="hidden md:flex items-center gap-1">
                        <div className="w-6 h-[2px] bg-primary/30" />
                        <div className="w-3 h-[2px] bg-primary/20" />
                        <div className="w-1.5 h-[2px] bg-primary/15" />
                    </div>
                    {collapsed ? <ChevronDown className="w-4 h-4 text-primary/50" /> : <ChevronUp className="w-4 h-4 text-primary/50" />}
                </div>
            </button>
            {!collapsed && (
                <div className="p-4 relative">
                    {children}
                </div>
            )}
        </div>
    </div>
);

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
  <div className={cn("relative group", isEditing && "ring-1 ring-primary/30", className)}>
    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm border border-primary/15" />
    
    {/* Header Section — Muller style: thick rule + condensed title */}
    {(title || Icon) && (
        <div className="relative z-10">
            <div className="h-[3px] bg-primary w-full" />
            <div className="flex items-center justify-between px-4 py-2.5">
                <div className="flex items-center gap-3">
                    {Icon && <Icon className="w-4 h-4 text-primary/70" />}
                    <div className="flex flex-col">
                        {title && <h3 className={cn("font-display text-primary tracking-wide uppercase", titleSize === "large" ? "text-2xl" : "text-xl")}>{title}</h3>}
                        {subHeader && <span className="text-[8px] font-code uppercase tracking-[0.15em] text-muted-foreground/60">{subHeader}</span>}
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
                            className="h-6 w-6 p-1 border border-primary/30 hover:border-primary hover:bg-primary/10 text-primary transition-all flex items-center justify-center"
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
                                className="h-6 px-3 bg-black/40 border border-green-500/50 text-green-400 hover:bg-green-900/20 hover:text-green-300 hover:border-green-400 font-code uppercase text-[10px] tracking-wider rounded-sm flex items-center gap-1 transition-all disabled:opacity-50"
                            >
                                {isLoading ? <Loader2 size={10} className="animate-spin" /> : <><Check size={10} /> Save</>}
                            </button>
                            <button 
                                onClick={onCancel}
                                disabled={isLoading}
                                data-testid="button-cancel-edit"
                                className="h-6 px-3 bg-black/40 border border-red-500/50 text-red-400 hover:bg-red-900/20 hover:text-red-300 hover:border-red-400 font-code uppercase text-[10px] tracking-wider rounded-sm flex items-center gap-1 transition-all disabled:opacity-50"
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
            <div className="h-[1px] bg-primary/20 w-full" />
        </div>
    )}

    {/* Content */}
    <div className="relative z-10 p-4">
        {children}
    </div>
  </div>
);

const SectionDivider = ({ label }: { label?: string }) => (
    <div className="flex items-center gap-4 my-8">
        <div className="h-[2px] flex-1 bg-primary/30" />
        {label && (
            <div className="relative px-4 py-1">
                <div className="absolute inset-0 border border-primary/30 transform skew-x-[-20deg] bg-black/60" />
                <span className="relative z-10 font-display text-sm text-primary tracking-[0.2em] uppercase">{label}</span>
            </div>
        )}
        <div className="h-[2px] flex-1 bg-primary/30" />
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
  const [supabaseCallings, setSupabaseCallings] = useState<{id: number; name: string; description: string}[]>([]);
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

  useEffect(() => {
    fetch('/api/callings')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setSupabaseCallings(data);
      })
      .catch(err => console.error('Failed to load callings:', err));
  }, []);

  const hasInitializedRef = useRef(false);
  const loadedCharacterIdRef = useRef<string | null>(null);

  // Sync with URL params - only on initial load or character change
  useEffect(() => {
    if (loadedCharacter && (!hasInitializedRef.current || loadedCharacterIdRef.current !== loadedCharacter.id)) {
      hasInitializedRef.current = true;
      loadedCharacterIdRef.current = loadedCharacter.id;
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
        const br = loadedCharacter.birthrights as any;
        // Convert old string format to new array format if needed
        setBirthrights({
          creatures: Array.isArray(br.creatures) ? br.creatures : [],
          guides: Array.isArray(br.guides) ? br.guides : [],
          followers: Array.isArray(br.followers) ? br.followers : [],
          relics: Array.isArray(br.relics) ? br.relics : []
        });
      }
      if (loadedCharacter.movementFeats && typeof loadedCharacter.movementFeats === 'object') {
        setMovementFeats(loadedCharacter.movementFeats as any);
      }
      if (loadedCharacter.professionalProfile && typeof loadedCharacter.professionalProfile === 'object') {
        setProfessionalProfile(loadedCharacter.professionalProfile as any);
      }
      
      // Fetch scionsight data from Supabase
      if (loadedCharacter.id) {
        // First fetch innate offensives, then scionsight
        Promise.all([
          fetch('/api/offensives/innate').then(res => res.json()),
          fetch(`/api/scionsight/${loadedCharacter.id}`).then(res => res.json())
        ])
          .then(([innateData, scionsightData]) => {
            // Process innate offensives
            const innateWeapons: Weapon[] = Array.isArray(innateData) ? innateData.map((o: any) => ({
              name: o.offensive_name,
              category: o.category || 'innate',
              accuracy: o.accuracy || 0,
              attackAttribute: o.attack_attribute || '',
              attackAbility: o.attack_ability || '',
              damage: o.damage || '',
              damageAttribute: o.damage_attribute || '',
              defense: o.defense || 0,
              range: o.range,
              clip: o.clip,
              speed: o.speed || 0,
              tags: o.tags,
              isInnate: true, // Mark as innate so it can't be removed
            })) : [];
            
            if (scionsightData && scionsightData.scion_id) {
              setScionsight(scionsightData);
              setLegendPoolCurrent(scionsightData.legend_pool_current || 0);
              
              // Load saved offensives from scionsight and merge with innate
              const savedOffensives = Array.isArray(scionsightData.offensives) ? scionsightData.offensives : [];
              
              // Filter out any saved innate offensives (we'll use fresh ones)
              const nonInnateOffensives = savedOffensives.filter((w: Weapon) => w.category !== 'innate');
              
              // Combine innate (at start) with other saved offensives
              const mergedWeapons = [...innateWeapons, ...nonInnateOffensives];
              setWeapons(mergedWeapons);
              setInnateOffensivesLoaded(true);
              
              // Save merged weapons back to scionsight to persist innate offensives
              if (innateWeapons.length > 0 && savedOffensives.length === 0) {
                saveOffensivesToScionsight(mergedWeapons);
              }
            } else {
              // No scionsight data, just set innate offensives
              setWeapons(innateWeapons);
              setInnateOffensivesLoaded(true);
            }
          })
          .catch(err => console.error('Failed to fetch scionsight/innate:', err));
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
  const [availableNatures, setAvailableNatures] = useState<{id?: string, nome: string, name?: string, description?: string, definition?: string, gatilho_forca_vontade?: string}[]>([]);
  const [natureSearchOpen, setNatureSearchOpen] = useState(false);
  const [showNatureTooltip, setShowNatureTooltip] = useState(false);
  
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
      
    // Fetch available offensives from Supabase
    fetch('/api/offensives')
      .then(res => res.json())
      .then(data => {
        if (data && typeof data === 'object') {
          setAvailableOffensives(data);
        }
      })
      .catch(err => console.error('Failed to fetch offensives:', err));
      
    // Fetch available knacks from Supabase
    fetch('/api/supabase-knacks')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setAvailableKnacks(data.filter((k: SupabaseKnack) => k.visible));
        }
      })
      .catch(err => console.error('Failed to fetch knacks:', err));
      
    // Fetch available boons from Supabase
    fetch('/api/supabase-boons')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setAvailableBoons(data);
        }
      })
      .catch(err => console.error('Failed to fetch boons:', err));
  }, []);

  const [willpower, setWillpower] = useState(5);
  const [willpowerCurrent, setWillpowerCurrent] = useState(5);
  
  // Health State
  const [extraOxBody, setExtraOxBody] = useState(0);
  const [healthDamage, setHealthDamage] = useState<DamageType[]>(new Array(7 + 10).fill(0));

  const [knacks, setKnacks] = useState<CharacterKnack[]>([]);
  const [availableKnacks, setAvailableKnacks] = useState<SupabaseKnack[]>([]);
  const [knackSearch, setKnackSearch] = useState("");
  const [showKnackDropdown, setShowKnackDropdown] = useState(false);
  const [knackAttributeFilter, setKnackAttributeFilter] = useState<string>("all");
  
  // Boons from Supabase
  const [availableBoons, setAvailableBoons] = useState<SupabaseBoon[]>([]);
  const [selectedBoons, setSelectedBoons] = useState<SupabaseBoon[]>([]);
  const [boonSearch, setBoonSearch] = useState("");
  const [showBoonDropdown, setShowBoonDropdown] = useState(false);
  const [boonPurviewFilter, setBoonPurviewFilter] = useState<string>("all");
  
  // Scionsight data from Supabase
  const [scionsight, setScionsight] = useState<ScionsightData | null>(null);
  const [legendPoolCurrent, setLegendPoolCurrent] = useState(0);
  const [boons, setBoons] = useState<string[]>([]);
  const [newBoon, setNewBoon] = useState("");

  const [weapons, setWeapons] = useState<Weapon[]>([]);
  const [availableOffensives, setAvailableOffensives] = useState<{
    melee: SupabaseOffensive[];
    ranged: SupabaseOffensive[];
    firearms: SupabaseOffensive[];
    innate: SupabaseOffensive[];
  }>({ melee: [], ranged: [], firearms: [], innate: [] });
  const [innateOffensivesLoaded, setInnateOffensivesLoaded] = useState(false);
  const [offensiveSearch, setOffensiveSearch] = useState("");
  const [showOffensiveDropdown, setShowOffensiveDropdown] = useState(false);
  const [customOffensive, setCustomOffensive] = useState<Partial<Weapon>>({
    name: '',
    category: 'custom',
    accuracy: 0,
    attackAttribute: 'Dexterity',
    attackAbility: 'Melee',
    damage: '0L',
    damageAttribute: 'Strength',
    defense: 0,
    range: null,
    clip: null,
    speed: 5,
    tags: null
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
  
  // Birthrights - arrays of items for each category
  type BirthrightItem = { name: string; description: string; dots: number };
  const [birthrights, setBirthrights] = useState<{
    creatures: BirthrightItem[];
    guides: BirthrightItem[];
    followers: BirthrightItem[];
    relics: BirthrightItem[];
  }>({
    creatures: [],
    guides: [],
    followers: [],
    relics: []
  });
  
  // Form state for adding new birthrights
  const [newBirthright, setNewBirthright] = useState<{ [key: string]: { name: string; description: string; dots: number } }>({
    creatures: { name: '', description: '', dots: 1 },
    guides: { name: '', description: '', dots: 1 },
    followers: { name: '', description: '', dots: 1 },
    relics: { name: '', description: '', dots: 1 }
  });
  
  const addBirthright = (category: 'creatures' | 'guides' | 'followers' | 'relics') => {
    const item = newBirthright[category];
    if (!item.name.trim()) return;
    setBirthrights(prev => ({
      ...prev,
      [category]: [...prev[category], { ...item }]
    }));
    setNewBirthright(prev => ({
      ...prev,
      [category]: { name: '', description: '', dots: 1 }
    }));
  };
  
  const removeBirthright = (category: 'creatures' | 'guides' | 'followers' | 'relics', index: number) => {
    setBirthrights(prev => ({
      ...prev,
      [category]: prev[category].filter((_, i) => i !== index)
    }));
  };
  
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
    // Auto-save health damage to database
    if (characterId) {
      fetch(`/api/characters/${characterId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ healthDamage: newHealth })
      });
    }
  };
  
  // Auto-save function for willpower current
  const updateWillpowerCurrent = (newValue: number) => {
    setWillpowerCurrent(newValue);
    if (characterId) {
      fetch(`/api/characters/${characterId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ willpowerCurrent: newValue })
      });
    }
  };
  
  // Auto-save function for legend points current
  const updateLegendPointsCurrent = (newValue: number) => {
    setLegendPointsCurrent(newValue);
    if (characterId) {
      fetch(`/api/characters/${characterId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ legendPointsCurrent: newValue })
      });
    }
  };

  const addKnackFromDatabase = (knack: SupabaseKnack) => {
    // Check if already added
    if (knacks.some(k => k.id === knack.id)) return;
    
    const newKnack: CharacterKnack = {
      id: knack.id,
      name: knack.name,
      attribute: knack.attribute,
      description: knack.description,
      type: knack.type,
    };
    const newKnacks = [...knacks, newKnack];
    setKnacks(newKnacks);
    setKnackSearch("");
    setShowKnackDropdown(false);
    saveKnacksToScionsight(newKnacks);
  };
  
  const removeKnack = (id: string) => {
    const newKnacks = knacks.filter(k => k.id !== id);
    setKnacks(newKnacks);
    saveKnacksToScionsight(newKnacks);
  };
  
  // Get unique attributes from knacks for filter dropdown
  const knackAttributes = [...new Set(availableKnacks.map(k => k.attribute))].sort();
  
  // Get unique purviews from boons for filter dropdown
  const boonPurviews = [...new Set(availableBoons.map(b => b.purview))].sort();
  
  // Filter knacks based on search and attribute filter
  const filteredKnacks = availableKnacks.filter(k => {
    const matchesAttribute = knackAttributeFilter === "all" || k.attribute === knackAttributeFilter;
    const matchesSearch = knackSearch.length === 0 || 
      k.name.toLowerCase().includes(knackSearch.toLowerCase()) ||
      k.attribute.toLowerCase().includes(knackSearch.toLowerCase());
    return matchesAttribute && matchesSearch;
  });
  
  // Filter boons based on search and purview filter  
  const filteredBoons = availableBoons.filter(b => {
    const matchesPurview = boonPurviewFilter === "all" || b.purview === boonPurviewFilter;
    const matchesSearch = boonSearch.length === 0 ||
      b.name.toLowerCase().includes(boonSearch.toLowerCase()) ||
      b.purview.toLowerCase().includes(boonSearch.toLowerCase());
    return matchesPurview && matchesSearch;
  });

  const addBoon = () => {
    if (newBoon.trim()) {
      setBoons([...boons, newBoon]);
      setNewBoon("");
    }
  };
  
  // Add boon from database
  const addBoonFromDatabase = (boon: SupabaseBoon) => {
    if (selectedBoons.some(b => b.id === boon.id)) return;
    const newSelectedBoons = [...selectedBoons, boon];
    setSelectedBoons(newSelectedBoons);
    setBoonSearch("");
    setShowBoonDropdown(false);
    saveBoonsToScionsight(newSelectedBoons);
  };
  
  const removeBoon = (id: string) => {
    const newSelectedBoons = selectedBoons.filter(b => b.id !== id);
    setSelectedBoons(newSelectedBoons);
    saveBoonsToScionsight(newSelectedBoons);
  };
  
  // Save knacks to scionsight
  const saveKnacksToScionsight = async (knacksList: CharacterKnack[]) => {
    if (!loadedCharacter?.id) return;
    try {
      await fetch(`/api/scionsight/${loadedCharacter.id}/knacks`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ knacks_selected: knacksList.map(k => k.name) })
      });
    } catch (error) {
      console.error('Failed to save knacks to scionsight:', error);
    }
  };
  
  // Save boons to scionsight
  const saveBoonsToScionsight = async (boonsList: SupabaseBoon[]) => {
    if (!loadedCharacter?.id) return;
    try {
      await fetch(`/api/scionsight/${loadedCharacter.id}/boons`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ boons_selected: boonsList.map(b => b.name) })
      });
    } catch (error) {
      console.error('Failed to save boons to scionsight:', error);
    }
  };

  const addOffensiveFromDatabase = (offensive: SupabaseOffensive) => {
    const newWeapon: Weapon = {
      name: offensive.offensive_name,
      category: offensive.category,
      accuracy: offensive.accuracy,
      attackAttribute: offensive.attack_attribute,
      attackAbility: offensive.attack_ability,
      damage: offensive.damage,
      damageAttribute: offensive.damage_attribute,
      defense: offensive.defense,
      range: offensive.range,
      clip: offensive.clip,
      speed: offensive.speed,
      tags: offensive.tags,
    };
    const newWeapons = [...weapons, newWeapon];
    setWeapons(newWeapons);
    saveOffensivesToScionsight(newWeapons);
    setOffensiveSearch("");
    setShowOffensiveDropdown(false);
  };
  
  const removeWeapon = (index: number) => {
    // Don't allow removing innate offensives
    if (weapons[index]?.isInnate || weapons[index]?.category === 'innate') {
      return;
    }
    const newWeapons = weapons.filter((_, i) => i !== index);
    setWeapons(newWeapons);
    // Save to scionsight
    if (loadedCharacter?.id) {
      fetch(`/api/scionsight/${loadedCharacter.id}/offensives`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offensives: newWeapons })
      });
    }
  };
  
  const saveOffensivesToScionsight = (weaponsList: Weapon[]) => {
    if (loadedCharacter?.id) {
      fetch(`/api/scionsight/${loadedCharacter.id}/offensives`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offensives: weaponsList })
      });
    }
  };
  
  const createCustomOffensive = async () => {
    if (!customOffensive.name?.trim()) return;
    
    try {
      // Save to offensives_custom table
      const response = await fetch('/api/offensives-custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          offensive_name: customOffensive.name,
          category: customOffensive.category || 'custom',
          accuracy: customOffensive.accuracy || 0,
          attack_attribute: customOffensive.attackAttribute || 'Dexterity',
          attack_ability: customOffensive.attackAbility || 'Melee',
          damage: customOffensive.damage || '0L',
          damage_attribute: customOffensive.damageAttribute || 'Strength',
          defense: customOffensive.defense || 0,
          range: customOffensive.range,
          clip: customOffensive.clip,
          speed: customOffensive.speed || 5,
          tags: customOffensive.tags,
          scion_id: loadedCharacter?.id
        })
      });
      
      if (response.ok) {
        // Add to local weapons list
        const newWeapon: Weapon = {
          name: customOffensive.name || '',
          category: customOffensive.category || 'custom',
          accuracy: customOffensive.accuracy || 0,
          attackAttribute: customOffensive.attackAttribute || 'Dexterity',
          attackAbility: customOffensive.attackAbility || 'Melee',
          damage: customOffensive.damage || '0L',
          damageAttribute: customOffensive.damageAttribute || 'Strength',
          defense: customOffensive.defense || 0,
          range: customOffensive.range || null,
          clip: customOffensive.clip || null,
          speed: customOffensive.speed || 5,
          tags: customOffensive.tags || null
        };
        const newWeapons = [...weapons, newWeapon];
        setWeapons(newWeapons);
        saveOffensivesToScionsight(newWeapons);
        
        // Reset form
        setCustomOffensive({
          name: '',
          category: 'custom',
          accuracy: 0,
          attackAttribute: 'Dexterity',
          attackAbility: 'Melee',
          damage: '0L',
          damageAttribute: 'Strength',
          defense: 0,
          range: null,
          clip: null,
          speed: 5,
          tags: null
        });
        setShowCustomOffensiveForm(false);
      }
    } catch (error) {
      console.error('Failed to create custom offensive:', error);
    }
  };
  
  // Filter offensives based on search (exclude innate since they're auto-added)
  const allOffensives = [
    ...availableOffensives.melee,
    ...availableOffensives.ranged,
    ...availableOffensives.firearms,
  ];
  
  const filteredOffensives = offensiveSearch.length > 0
    ? allOffensives.filter(o => 
        o.offensive_name.toLowerCase().includes(offensiveSearch.toLowerCase()) ||
        o.category.toLowerCase().includes(offensiveSearch.toLowerCase())
      )
    : allOffensives;

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

  // Combat & Physics Calculations (Updated - with safety checks and proper type conversion)
  const getAttributeTotal = (name: AttributeName) => {
    let attr: Attribute | undefined;
    for (const cat of Object.values(attributes || {})) {
      if (Array.isArray(cat)) {
        attr = cat.find(a => a && a.name === name);
        if (attr) break;
      }
    }
    const baseVal = Number(attr?.value) || 0;
    const epicVal = Number(attr?.epic) || 0;
    return baseVal + epicVal; 
  };
  
  const getAttributeBase = (name: AttributeName) => {
    let attr: Attribute | undefined;
    for (const cat of Object.values(attributes || {})) {
      if (Array.isArray(cat)) {
        attr = cat.find(a => a && a.name === name);
        if (attr) break;
      }
    }
    return Number(attr?.value) || 0;
  };
  
  const getAttributeEpic = (name: AttributeName) => {
    let attr: Attribute | undefined;
    for (const cat of Object.values(attributes || {})) {
      if (Array.isArray(cat)) {
        attr = cat.find(a => a && a.name === name);
        if (attr) break;
      }
    }
    return Number(attr?.epic) || 0;
  };

  const getAbilityValue = (name: string) => Number(abilities[name]?.value) || 0;

  // Legend Pool Calculation (Scion 1st Edition: Legend ^ 2)
  const legendPoolTotal = legend * legend;
  const [legendPointsCurrent, setLegendPointsCurrent] = useState(legendPoolTotal);

  // Combat Stats (Scion 1st Ed - Portuguese ability names used)
  // Join Battle = Raciocínio (Wits) + Prontidão (Awareness)
  const joinBattle = getAttributeTotal("Wits") + getAbilityValue("Prontidão");
  
  // Dodge DV = (Destreza + Atletismo + Lenda) / 2
  const dodgeDV = Math.floor((getAttributeTotal("Dexterity") + getAbilityValue("Atletismo") + legend) / 2);
  
  // Parry DV = (Destreza + Briga ou Armas Brancas) / 2
  const parryDV = Math.floor((getAttributeTotal("Dexterity") + Math.max(getAbilityValue("Armas Brancas"), getAbilityValue("Briga"))) / 2);
  
  // Armed DV = (Força + Hoplomaquia) / 2 + Defesa da arma equipada
  const armedDVBase = Math.floor((getAttributeTotal("Strength") + getAbilityValue("Hoplomaquia")) / 2);
  // Add weapon defense from first equipped weapon (if any)
  const equippedWeaponDefense = weapons.length > 0 ? (weapons[0].defense || 0) : 0;
  const armedDV = armedDVBase + equippedWeaponDefense;
  
  // Movement & Feats (Scion 1st Ed)
  const dexterityTotal = getAttributeTotal("Dexterity");
  const strengthTotal = getAttributeTotal("Strength");
  const athleticsValue = getAbilityValue("Atletismo");
  
  // Move = Dexterity + 6 yards
  const moveSpeed = dexterityTotal + 6;
  // Dash = Dexterity + 12 yards  
  const dashSpeed = dexterityTotal + 12;
  // Vertical Jump = (Strength + Athletics) / 2 feet
  const verticalJump = Math.floor((strengthTotal + athleticsValue) / 2);
  // Horizontal Jump = Strength + Athletics feet
  const horizontalJump = strengthTotal + athleticsValue;
  // Lift capacity based on Strength (simplified)
  const liftCapacity = strengthTotal * 50; // lbs base 
  
  // Soak (Scion 1st Ed - Regras do usuário)
  // Bashing Soak = Vitalidade (Stamina base, SEM Epic)
  // Lethal Soak = Vitalidade / 2 (arredondado para baixo, SEM Epic)
  // Aggravated Soak = Apenas Armadura (0 sem armadura)
  const staminaBase = getAttributeBase("Stamina"); // Apenas Stamina base
  const epicStamina = getAttributeEpic("Stamina");
  
  const baseBashingSoak = staminaBase; // Apenas Vitalidade base
  const baseLethalSoak = Math.floor(staminaBase / 2); // Vitalidade base / 2
  const baseAggSoak = 0; // Apenas armadura

  const [armorList, setArmorList] = useState<{name: string, soakB: number, soakL: number, soakA: number, mobility: number, fatigue: number}[]>([]);
  const [selectedArmor, setSelectedArmor] = useState<string>("");
  
  // Scion 1st Edition Armor Options
  const ARMOR_OPTIONS = [
    { name: "Nenhuma", soakB: 0, soakL: 0, soakA: 0, mobility: 0, fatigue: 0 },
    { name: "Roupas Pesadas", soakB: 1, soakL: 0, soakA: 0, mobility: 0, fatigue: 0 },
    { name: "Couro Reforçado", soakB: 2, soakL: 1, soakA: 0, mobility: 0, fatigue: 1 },
    { name: "Colete Kevlar", soakB: 2, soakL: 2, soakA: 0, mobility: 0, fatigue: 1 },
    { name: "Colete Balístico", soakB: 3, soakL: 3, soakA: 0, mobility: -1, fatigue: 1 },
    { name: "Colete Tático", soakB: 4, soakL: 4, soakA: 0, mobility: -1, fatigue: 2 },
    { name: "Armadura Riot", soakB: 5, soakL: 5, soakA: 0, mobility: -2, fatigue: 2 },
    { name: "Armadura de Batalha", soakB: 6, soakL: 6, soakA: 0, mobility: -2, fatigue: 3 },
    { name: "Cota de Malha", soakB: 4, soakL: 3, soakA: 0, mobility: -1, fatigue: 2 },
    { name: "Armadura de Placas", soakB: 6, soakL: 5, soakA: 0, mobility: -3, fatigue: 3 },
    { name: "Armadura Mítica (Leve)", soakB: 4, soakL: 4, soakA: 2, mobility: 0, fatigue: 0 },
    { name: "Armadura Mítica (Média)", soakB: 6, soakL: 6, soakA: 3, mobility: 0, fatigue: 0 },
    { name: "Armadura Mítica (Pesada)", soakB: 8, soakL: 8, soakA: 4, mobility: 0, fatigue: 0 },
  ];
  
  // Get current armor stats
  const currentArmor = ARMOR_OPTIONS.find(a => a.name === selectedArmor) || ARMOR_OPTIONS[0];
  
  // Calculate total soak with armor
  const totalBashingSoak = baseBashingSoak + currentArmor.soakB;
  const totalLethalSoak = baseLethalSoak + currentArmor.soakL;
  const totalAggSoak = baseAggSoak + currentArmor.soakA;
  const mobilityPenalty = currentArmor.mobility;
  const fatiguePenalty = currentArmor.fatigue;

  // New State for Feats / Merits (if separate from Knacks)
  const [feats, setFeats] = useState<{name: string, type: string, cost: string, desc: string}[]>([]);
  const [newFeat, setNewFeat] = useState({name: "", type: "", cost: "", desc: ""});

  // Edit mode states for each section
  const [editingIdentity, setEditingIdentity] = useState(false);
  const [editingAttributes, setEditingAttributes] = useState(false);
  const [editingAbilities, setEditingAbilities] = useState(false);
  const [editingVirtues, setEditingVirtues] = useState(false);
  const [editingCombat, setEditingCombat] = useState(false);
  const [combatRowCollapsed, setCombatRowCollapsed] = useState(false);
  const [editingCombatAll, setEditingCombatAll] = useState(false);
  const [attribAbilCollapsed, setAttribAbilCollapsed] = useState(false);
  const [personalCollapsed, setPersonalCollapsed] = useState(false);
  const [legacyCollapsed, setLegacyCollapsed] = useState(false);
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
          silent: true,
          updates: {
            legend,
            legendPointsCurrent,
            willpower,
            willpowerCurrent,
            extraOxBody,
            healthDamage,
            portrait: portrait || undefined,
            birthrights,
          },
        });
      }
    }, 1000); // 1 second debounce
    
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [legend, legendPointsCurrent, willpower, willpowerCurrent, extraOxBody, healthDamage, portrait, birthrights, characterId]);
  

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
        <p className="font-code text-primary uppercase tracking-widest">Loading character data...</p>
      </div>
    );
  }

  // No character found
  if (!characterId || (!loadedCharacter && !isLoading)) {
    return (
      <div className="min-h-screen bg-mythic-void text-foreground flex flex-col items-center justify-center gap-4">
        <p className="font-code text-muted-foreground uppercase tracking-widest">No character selected</p>
        <Link href="/">
          <button className="text-sm text-primary hover:text-white border border-primary/30 hover:border-primary px-6 py-3 rounded-sm font-display uppercase tracking-wider flex items-center gap-2 transition-all hover:shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:bg-primary/10">
            <ArrowLeft className="w-4 h-4" /> Return Home
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mythic-void text-foreground overflow-x-hidden font-code selection:bg-primary/30 relative">
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
                <h1 className="font-display text-5xl md:text-7xl text-primary tracking-[0.1em] drop-shadow-[0_0_15px_rgba(212,175,55,0.5)] animate-glitch" data-text="PANTHEONEXUS">
                    PANTHEON<span className="text-foreground">EXUS</span>
                </h1>
                <div className="flex items-center gap-2 mt-1">
                    <div className="h-px w-8 bg-primary/50" />
                    <span className="font-code text-xs text-muted-foreground tracking-[0.5em] uppercase text-shadow-tech">System v2.5 // Scion Neural Link</span>
                </div>
            </div>
            <div className="text-right hidden md:block relative z-10">
                <div className="flex items-center justify-end gap-3 mb-2">
                    <div className="text-[10px] font-code text-primary/70 tracking-widest uppercase border border-primary/20 px-2 py-0.5 rounded-sm bg-black/40">
                       USER: {scionName || "UNKNOWN"}
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-code text-primary animate-pulse">ONLINE</span>
                        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse shadow-[0_0_8px_gold]"></div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link href="/">
                    <button className="flex items-center gap-2 text-[10px] font-display uppercase tracking-widest text-primary border border-primary/30 px-3 py-1 hover:bg-primary/10 transition-colors rounded-sm hover:shadow-[0_0_10px_rgba(212,175,55,0.2)] group">
                      <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" /> BACK TO PANT-HOME
                    </button>
                  </Link>
                </div>
            </div>
        </div>

        {/* --- PERSONAL PROFILES --- */}
        <CyberSection title="Personal Profiles" collapsed={personalCollapsed} onToggle={() => setPersonalCollapsed(!personalCollapsed)} testId="btn-toggle-personal">
        <div className="grid grid-cols-12 gap-6 items-start md:items-stretch">

            {/* LEFT COLUMN: IDENTITY & VIRTUES (Width 4) */}
            <div className="col-span-12 md:col-span-4 flex flex-col gap-6">
                
                {/* 1. IDENTITY MODULE */}
                <MythicHUDFrame title="Identity Matrix" icon={Fingerprint} subHeader="SUBJECT DESIGNATION" className="flex-1" isEditing={editingIdentity} {...createEditHandlers(editingIdentity, setEditingIdentity)}>
                     <div className="flex flex-col gap-4">
                         {/* Portrait + Name - Always visible */}
                         <div className="relative aspect-[3/4] w-full border border-primary/20 bg-black/50 overflow-hidden group">
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
                                      className="text-2xl font-display text-primary uppercase border-none bg-transparent p-0 shadow-none focus-visible:ring-0 placeholder:text-primary/20 text-shadow-glow" 
                                      viewMode={!editingIdentity}
                                     />
                                     <div className="flex gap-2 mt-1">
                                         <ScionInput 
                                            value={scionPantheon} 
                                            onChange={(e) => setScionPantheon(e.target.value)}
                                            placeholder="PANTHEON" 
                                            className="text-xs font-code tracking-[0.2em] text-primary/70 uppercase border-none bg-transparent p-0 shadow-none h-auto" 
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
                                      "text-[9px] uppercase tracking-[0.2em] font-display transition-colors pb-1 relative",
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
                                        <h5 className="text-[10px] font-display uppercase text-primary border-b border-primary/20 pb-1">Basic Data</h5>
                                        
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
                                        <h5 className="text-[10px] font-display uppercase text-[hsl(var(--highlight-purple))] border-b border-[hsl(var(--highlight-purple))]/20 pb-1">Psychological Matrix</h5>
                                        
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
                                         <h5 className="text-[10px] font-display uppercase text-[hsl(var(--highlight-blue))] border-b border-[hsl(var(--highlight-blue))]/20 pb-1">Physical Presence</h5>
                                         
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
                                        <h5 className="text-[10px] font-display uppercase text-[hsl(var(--highlight-orange))] border-b border-[hsl(var(--highlight-orange))]/20 pb-1">Professional Profile</h5>
                                        
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
                                        
                                        <h5 className="text-[10px] font-display uppercase text-primary/70 border-b border-primary/20 pb-1 mt-2">Interests</h5>
                                        
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
                <MythicHUDFrame title="Psychic Profile" icon={Brain} subHeader="PSYCHOLOGICAL MATRIX" isEditing={editingIdentity} {...createEditHandlers(editingIdentity, setEditingIdentity)}>
                    <div className="space-y-2">
                        <ScionInput 
                            label="Deep Analysis" 
                            className="h-16 text-xs bg-black/40 border-primary/20 resize-none"
                            textarea
                            value={psychicProfile.analysis}
                            onChange={(e) => setPsychicProfile({...psychicProfile, analysis: e.target.value})}
                            viewMode={!editingIdentity}
                        />
                        <div className="grid grid-cols-2 gap-2">
                            <ScionInput 
                                label="Keywords" 
                                className="h-7 text-xs bg-black/40 border-primary/20"
                                value={psychicProfile.keywords}
                                onChange={(e) => setPsychicProfile({...psychicProfile, keywords: e.target.value})}
                                viewMode={!editingIdentity}
                            />
                            <ScionInput 
                                label="Major Arcana" 
                                className="h-7 text-xs bg-black/40 border-primary/20 text-[hsl(var(--highlight-purple))]"
                                value={psychicProfile.majorArcana}
                                onChange={(e) => setPsychicProfile({...psychicProfile, majorArcana: e.target.value})}
                                viewMode={!editingIdentity}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <ScionInput 
                                label="Temperament" 
                                className="h-7 text-xs bg-black/40 border-primary/20"
                                value={psychicProfile.temperament}
                                onChange={(e) => setPsychicProfile({...psychicProfile, temperament: e.target.value})}
                                viewMode={!editingIdentity}
                            />
                            <ScionInput 
                                label="Cognitive Type" 
                                className="h-7 text-xs bg-black/40 border-primary/20"
                                value={psychicProfile.cognitiveType}
                                onChange={(e) => setPsychicProfile({...psychicProfile, cognitiveType: e.target.value})}
                                viewMode={!editingIdentity}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <ScionInput 
                                label="Strengths" 
                                className="h-7 text-xs bg-black/40 border-primary/20 text-green-400/80"
                                value={psychicProfile.strengths}
                                onChange={(e) => setPsychicProfile({...psychicProfile, strengths: e.target.value})}
                                viewMode={!editingIdentity}
                            />
                            <ScionInput 
                                label="Weaknesses" 
                                className="h-7 text-xs bg-black/40 border-primary/20 text-red-400/80"
                                value={psychicProfile.weaknesses}
                                onChange={(e) => setPsychicProfile({...psychicProfile, weaknesses: e.target.value})}
                                viewMode={!editingIdentity}
                            />
                        </div>
                        <ScionInput 
                            label="Behaviors" 
                            className="h-7 text-xs bg-black/40 border-primary/20"
                            value={psychicProfile.behaviors}
                            onChange={(e) => setPsychicProfile({...psychicProfile, behaviors: e.target.value})}
                            viewMode={!editingIdentity}
                        />
                    </div>
                </MythicHUDFrame>

                <MythicHUDFrame title="Divine Callings" icon={Crosshair} subHeader="ROLE SPECIALIZATIONS" className="flex-1" isEditing={editingCombat} {...createEditHandlers(editingCombat, setEditingCombat)}>
                    <div className="space-y-1.5">
                        {callings.map((calling, idx) => (
                            <div key={idx} className="relative group">
                                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent border-l-2 border-primary/60" />
                                
                                <div className="relative z-10 px-3 py-2 flex items-center justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[8px] uppercase tracking-widest text-muted-foreground font-code shrink-0">0{idx+1}</span>
                                            {editingCombat ? (
                                              <select
                                                data-testid={`select-calling-${idx}`}
                                                value={calling.name}
                                                onChange={(e) => updateCalling(idx, 'name', e.target.value)}
                                                className="text-sm font-display uppercase tracking-wider text-primary bg-black/60 border border-primary/30 rounded-sm px-1 py-0.5 h-auto focus:ring-1 focus:ring-primary/50 focus:outline-none drop-shadow-md cursor-pointer"
                                              >
                                                <option value="">CALLING</option>
                                                {supabaseCallings.map((c) => (
                                                  <option key={c.id} value={c.name}>{c.name}</option>
                                                ))}
                                              </select>
                                            ) : (
                                              <span className="text-sm font-display uppercase tracking-wider text-primary drop-shadow-md">
                                                {calling.name || "—"}
                                              </span>
                                            )}
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

                    {/* Nature - Inside Callings */}
                    <div className="relative mt-3 pt-3 border-t border-primary/15">
                        <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--highlight-purple))]/10 to-transparent border-l-2 border-[hsl(var(--highlight-purple))]/60 rounded-sm" />
                        <div className="relative z-10 px-3 py-2 flex items-center gap-2">
                            <span className="text-[8px] uppercase tracking-widest text-muted-foreground font-code shrink-0">NAT</span>
                            <div className="flex-1 relative">
                                <input 
                                    value={nature} 
                                    onChange={(e) => setNature(e.target.value)}
                                    onFocus={() => editingCombat && setNatureSearchOpen(true)}
                                    onBlur={() => setTimeout(() => setNatureSearchOpen(false), 200)}
                                    onMouseEnter={() => !editingCombat && setShowNatureTooltip(true)}
                                    onMouseLeave={() => setShowNatureTooltip(false)}
                                    className="w-full text-sm font-display uppercase tracking-wider text-[hsl(var(--highlight-purple))] bg-transparent border-none p-0 h-auto focus:ring-0 outline-none placeholder:text-primary/30 cursor-pointer" 
                                    placeholder="SELECT NATURE"
                                    disabled={!editingCombat}
                                />
                                {nature && !editingCombat && showNatureTooltip && (() => {
                                    const natureStr = String(nature || '');
                                    const foundNature = availableNatures.find(n => n.nome?.toLowerCase() === natureStr.toLowerCase());
                                    return foundNature?.definition ? (
                                        <div className="absolute left-0 top-full mt-2 p-2 bg-black/95 border border-primary/30 rounded-sm text-[10px] font-code text-primary/70 max-w-[250px] z-50 pointer-events-none">
                                            <p>{foundNature.definition}</p>
                                            {foundNature.gatilho_forca_vontade && (
                                                <p className="mt-1 text-accent-foreground/70">Gatilho: {foundNature.gatilho_forca_vontade}</p>
                                            )}
                                        </div>
                                    ) : null;
                                })()}
                                {natureSearchOpen && editingCombat && (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-black border border-primary/20 rounded-sm max-h-40 overflow-y-auto z-50 shadow-[0_4px_20px_rgba(0,0,0,0.8)]">
                                        {availableNatures
                                            .filter(n => n.nome?.toLowerCase().includes(String(nature || '').toLowerCase()))
                                            .slice(0, 10)
                                            .map((n, idx) => (
                                                <div
                                                    key={n.nome + idx}
                                                    onClick={() => {
                                                        setNature(n.nome);
                                                        setNatureSearchOpen(false);
                                                    }}
                                                    className="w-full text-left px-2 py-1.5 text-[9px] font-code text-primary/80 hover:bg-primary/20 hover:text-primary transition-colors cursor-pointer"
                                                    title={n.definition || ''}
                                                >
                                                    <span className="block">{n.nome}</span>
                                                    {n.definition && (
                                                        <span className="block text-[8px] text-muted-foreground truncate">{n.definition}</span>
                                                    )}
                                                </div>
                                            ))
                                        }
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </MythicHUDFrame>

            </div>

            {/* RIGHT COLUMN: PRESENCE + VIRTUES (Width 4) */}
            <div className="col-span-12 md:col-span-4 flex flex-col gap-6">

                <MythicHUDFrame title="Presence Profile" icon={User} subHeader="PHYSICAL PRESENCE" isEditing={editingIdentity} {...createEditHandlers(editingIdentity, setEditingIdentity)}>
                    <div className="space-y-2">
                        <div className="grid grid-cols-3 gap-2">
                            <ScionInput 
                                label="Height" 
                                className="h-7 text-xs bg-black/40 border-primary/20"
                                value={presenceProfile.height}
                                onChange={(e) => setPresenceProfile({...presenceProfile, height: e.target.value})}
                                viewMode={!editingIdentity}
                            />
                            <ScionInput 
                                label="Eye Color" 
                                className="h-7 text-xs bg-black/40 border-primary/20"
                                value={presenceProfile.eyeColor}
                                onChange={(e) => setPresenceProfile({...presenceProfile, eyeColor: e.target.value})}
                                viewMode={!editingIdentity}
                            />
                            <ScionInput 
                                label="Hair Color" 
                                className="h-7 text-xs bg-black/40 border-primary/20"
                                value={presenceProfile.hairColor}
                                onChange={(e) => setPresenceProfile({...presenceProfile, hairColor: e.target.value})}
                                viewMode={!editingIdentity}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <ScionInput 
                                label="Aura Signature" 
                                className="h-7 text-xs bg-black/40 border-primary/20 text-[hsl(var(--highlight-blue))]"
                                value={presenceProfile.auraSignature}
                                onChange={(e) => setPresenceProfile({...presenceProfile, auraSignature: e.target.value})}
                                viewMode={!editingIdentity}
                            />
                            <ScionInput 
                                label="Scent / Essence" 
                                className="h-7 text-xs bg-black/40 border-primary/20"
                                value={presenceProfile.scent}
                                onChange={(e) => setPresenceProfile({...presenceProfile, scent: e.target.value})}
                                viewMode={!editingIdentity}
                            />
                        </div>
                        <ScionInput 
                            label="Fashion & Style" 
                            className="h-7 text-xs bg-black/40 border-primary/20"
                            value={presenceProfile.fashion}
                            onChange={(e) => setPresenceProfile({...presenceProfile, fashion: e.target.value})}
                            viewMode={!editingIdentity}
                        />
                        <ScionInput 
                            label="Distinguishing Marks" 
                            className="h-7 text-xs bg-black/40 border-primary/20"
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
                    </div>
                </MythicHUDFrame>

                {/* VIRTUES MODULE - Compact like Callings */}
                <MythicHUDFrame title="Virtue Matrix" icon={Target} subHeader="MORAL COMPASS" className="flex-1" isEditing={editingVirtues} {...createEditHandlers(editingVirtues, setEditingVirtues)}>
                    {/* Virtues Radar Chart - Always 5 points */}
                    <div className="mb-3 pb-3 border-b border-primary/15">
                        <div className="flex justify-center">
                            <ResponsiveContainer width="100%" height={160}>
                                <RadarChart 
                                    data={[
                                        { virtue: virtues[0]?.name?.substring(0, 4).toUpperCase() || 'V1', value: virtues[0]?.value || 0 },
                                        { virtue: virtues[1]?.name?.substring(0, 4).toUpperCase() || 'V2', value: virtues[1]?.value || 0 },
                                        { virtue: virtues[2]?.name?.substring(0, 4).toUpperCase() || 'V3', value: virtues[2]?.value || 0 },
                                        { virtue: virtues[3]?.name?.substring(0, 4).toUpperCase() || 'V4', value: virtues[3]?.value || 0 },
                                        { virtue: virtues[4]?.name?.substring(0, 4).toUpperCase() || 'V5', value: virtues[4]?.value || 0 },
                                    ]}
                                    margin={{ top: 10, right: 25, bottom: 10, left: 25 }}
                                >
                                    <PolarGrid stroke="hsl(var(--primary) / 0.15)" strokeDasharray="3 3" />
                                    <PolarAngleAxis 
                                        dataKey="virtue" 
                                        tick={{ 
                                            fill: 'hsl(var(--primary) / 0.7)', 
                                            fontSize: 8, 
                                            fontFamily: 'Orbitron' 
                                        }}
                                    />
                                    <PolarRadiusAxis 
                                        angle={90} 
                                        domain={[0, 5]} 
                                        tick={false}
                                        axisLine={false}
                                    />
                                    <RechartsRadar
                                        name="Virtudes"
                                        dataKey="value"
                                        stroke="hsl(var(--primary))"
                                        fill="hsl(var(--primary))"
                                        fillOpacity={0.25}
                                        strokeWidth={2}
                                    />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    
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
                                                    <span className="text-[8px] uppercase tracking-widest text-muted-foreground font-code shrink-0">0{idx+1}</span>
                                                    <input 
                                                        value={virtue.name} 
                                                        onChange={(e) => updateVirtue(idx, 'name', e.target.value)}
                                                        onFocus={() => editingVirtues && setVirtueSearchOpen(idx)}
                                                        onBlur={() => setTimeout(() => setVirtueSearchOpen(null), 200)}
                                                        className="text-sm font-display uppercase tracking-wider text-primary bg-transparent border-none p-0 h-auto focus:ring-0 drop-shadow-md outline-none placeholder:text-primary/30" 
                                                        placeholder="VIRTUE"
                                                        disabled={!editingVirtues}
                                                    />
                                                    {/* Description Tooltip on hover */}
                                                    {virtue.name && !editingVirtues && (() => {
                                                        const foundVirtue = availableVirtues.find(v => v.name.toLowerCase() === virtue.name.toLowerCase());
                                                        return foundVirtue?.description ? (
                                                            <div className="absolute left-0 top-full mt-2 p-2 bg-black/95 border border-primary/30 rounded-sm text-[10px] font-code text-primary/70 max-w-[200px] opacity-0 group-hover/virtue:opacity-100 transition-opacity z-50 pointer-events-none">
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
                                                                        className="w-full text-left px-2 py-1.5 text-xs font-code text-primary/80 hover:bg-primary/20 hover:text-primary transition-colors cursor-pointer"
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
        </CyberSection>
        {/* --- TOP 3-COLUMN GRID END --- */}

        {/* COMBAT ROW */}
        <CyberSection title="Combat Profile" collapsed={combatRowCollapsed} onToggle={() => setCombatRowCollapsed(!combatRowCollapsed)} testId="btn-toggle-combat-row" isEditing={editingCombatAll} onEditToggle={() => setEditingCombatAll(!editingCombatAll)}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

            {/* 1. LEGEND + PHYSICAL STATS - Takes 1 column (stacked) */}
            <div className="md:col-span-1 flex flex-col gap-6">
            <MythicHUDFrame title="Legend" icon={Flame} subHeader="DIVINE POWER" isEditing={editingCombatAll}>
                <div className="space-y-3">
                    <div className="flex items-center justify-between p-2 bg-black/40 border-l-2 border-primary/60">
                        <div className="flex items-center gap-2">
                            <Flame className="w-4 h-4 text-primary/60" />
                            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-code">Legend Level</span>
                        </div>
                        <span className="text-xl font-display text-primary drop-shadow-[0_0_10px_gold]">
                            {scionsight?.legend_level || 1}
                        </span>
                    </div>
                    
                    <div className="p-2 bg-black/40 border-l-2 border-[hsl(var(--highlight-orange))]/60">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-code">Legend Pool</span>
                            <span className="text-[8px] text-muted-foreground">(Level² = {scionsight?.legend_pool_total || 1})</span>
                        </div>
                        <div className="flex items-center justify-center gap-3">
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => {
                                        const newVal = Math.max(0, legendPoolCurrent - 1);
                                        setLegendPoolCurrent(newVal);
                                        if (loadedCharacter?.id) {
                                            fetch(`/api/scionsight/${loadedCharacter.id}/legend-current`, {
                                                method: 'PATCH',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ legend_pool_current: newVal })
                                            });
                                        }
                                    }}
                                    className="w-6 h-6 flex items-center justify-center rounded bg-black/60 border border-primary/30 text-primary hover:bg-primary/20 transition-colors"
                                >
                                    <Minus className="w-3 h-3" />
                                </button>
                                <span className="text-2xl font-display text-[hsl(var(--highlight-orange))] min-w-[60px] text-center drop-shadow-[0_0_8px_orange]">
                                    {legendPoolCurrent}
                                </span>
                                <button 
                                    onClick={() => {
                                        const legendTotal = scionsight?.legend_pool_total || Math.pow(scionsight?.legend_level || 1, 2);
                                        const newVal = Math.min(legendTotal, legendPoolCurrent + 1);
                                        setLegendPoolCurrent(newVal);
                                        if (loadedCharacter?.id) {
                                            fetch(`/api/scionsight/${loadedCharacter.id}/legend-current`, {
                                                method: 'PATCH',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ legend_pool_current: newVal })
                                            });
                                        }
                                    }}
                                    className="w-6 h-6 flex items-center justify-center rounded bg-black/60 border border-primary/30 text-primary hover:bg-primary/20 transition-colors"
                                >
                                    <Plus className="w-3 h-3" />
                                </button>
                            </div>
                            
                            <span className="text-xl text-muted-foreground">/</span>
                            
                            <span className="text-2xl font-display text-primary/60">
                                {scionsight?.legend_pool_total || Math.pow(scionsight?.legend_level || 1, 2)}
                            </span>
                        </div>
                    </div>
                </div>
            </MythicHUDFrame>

            <MythicHUDFrame 
                title="Physical Stats" 
                icon={Activity} 
                subHeader="BIOMETRICS & POOLS"
                isEditing={editingCombatAll}
            >
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-2">
                        <div className="bg-black/40 p-2 flex justify-between items-center border-l-2 border-primary/40">
                            <span className="text-[8px] uppercase tracking-wider text-muted-foreground">Dodge DV</span>
                            <span className="font-display text-primary text-sm">{dodgeDV}</span>
                        </div>
                        <div className="bg-black/40 p-2 flex justify-between items-center border-l-2 border-primary/40">
                            <span className="text-[8px] uppercase tracking-wider text-muted-foreground">Parry DV</span>
                            <span className="font-display text-primary text-sm">{parryDV}</span>
                        </div>
                        <div className="bg-black/40 p-2 flex justify-between items-center border-l-2 border-primary/40">
                            <span className="text-[8px] uppercase tracking-wider text-muted-foreground">Armed DV</span>
                            <span className="font-display text-primary text-sm">{armedDV}</span>
                        </div>
                        <div className="bg-black/40 p-2 flex justify-between items-center border-l-2 border-primary/40">
                            <span className="text-[8px] uppercase tracking-wider text-muted-foreground">Join Battle</span>
                            <span className="font-display text-primary text-sm">{joinBattle}</span>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-primary/10">
                        <div className="bg-black/40 p-1.5 flex justify-between items-center border-l-2 border-primary/30">
                            <span className="text-[7px] uppercase tracking-wider text-muted-foreground">Move</span>
                            <span className="font-code text-primary/80 text-xs">{moveSpeed}m</span>
                        </div>
                        <div className="bg-black/40 p-1.5 flex justify-between items-center border-l-2 border-primary/30">
                            <span className="text-[7px] uppercase tracking-wider text-muted-foreground">Dash</span>
                            <span className="font-code text-primary/80 text-xs">{dashSpeed}m</span>
                        </div>
                        <div className="bg-black/40 p-1.5 flex justify-between items-center border-l-2 border-primary/30">
                            <span className="text-[7px] uppercase tracking-wider text-muted-foreground">Jump V/H</span>
                            <span className="font-code text-primary/80 text-xs">{verticalJump}/{horizontalJump}m</span>
                        </div>
                        <div className="bg-black/40 p-1.5 flex justify-between items-center border-l-2 border-primary/30">
                            <span className="text-[7px] uppercase tracking-wider text-muted-foreground">Lift</span>
                            <span className="font-code text-primary/80 text-xs">{liftCapacity}kg</span>
                        </div>
                    </div>
                </div>
            </MythicHUDFrame>
            </div>

            {/* 2. WILLPOWER + RESISTANCE - Takes 1 column (stacked) */}
            <div className="md:col-span-1 flex flex-col gap-6">
                <MythicHUDFrame title="Willpower" icon={Shield} subHeader="MENTAL FORTITUDE" isEditing={editingCombatAll}>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-2 bg-black/40 border-l-2 border-[hsl(var(--highlight-blue))]/60">
                            <div className="flex items-center gap-2">
                                <Shield className="w-4 h-4 text-[hsl(var(--highlight-blue))]/60" />
                                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-code">Total</span>
                            </div>
                            <DotRating value={willpower} max={10} onChange={setWillpower} iconClassName="w-2.5 h-2.5" activeClassName="bg-[hsl(var(--highlight-blue))] shadow-[0_0_4px_hsl(var(--highlight-blue))]" />
                        </div>
                        
                        <div className="p-2 bg-black/40 border-l-2 border-primary/60">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-code">Current Pool</span>
                                <span className="text-[8px] text-muted-foreground">({willpowerCurrent} / {willpower})</span>
                            </div>
                            <div className="flex items-center justify-center gap-3">
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => updateWillpowerCurrent(Math.max(0, willpowerCurrent - 1))}
                                        className="w-6 h-6 flex items-center justify-center rounded bg-black/60 border border-primary/30 text-primary hover:bg-primary/20 transition-colors"
                                    >
                                        <Minus className="w-3 h-3" />
                                    </button>
                                    <span className="text-2xl font-display text-[hsl(var(--highlight-blue))] min-w-[60px] text-center drop-shadow-[0_0_8px_hsl(var(--highlight-blue))]">
                                        {willpowerCurrent}
                                    </span>
                                    <button 
                                        onClick={() => updateWillpowerCurrent(Math.min(willpower, willpowerCurrent + 1))}
                                        className="w-6 h-6 flex items-center justify-center rounded bg-black/60 border border-primary/30 text-primary hover:bg-primary/20 transition-colors"
                                    >
                                        <Plus className="w-3 h-3" />
                                    </button>
                                </div>
                                
                                <span className="text-xl text-muted-foreground">/</span>
                                
                                <span className="text-2xl font-display text-primary/60">
                                    {willpower}
                                </span>
                            </div>
                        </div>
                    </div>
                </MythicHUDFrame>

                <MythicHUDFrame 
                    title="Resistência" 
                    icon={Shield} 
                    subHeader="SOAK & ARMADURA"
                    isEditing={editingCombatAll}
                >
                <div className="space-y-4">
                    {/* Soak Values */}
                    <div className="space-y-2">
                        <div className="text-[10px] font-display uppercase text-primary/70 tracking-widest">Absorção (Soak)</div>
                        <div className="grid grid-cols-3 gap-2">
                            <div className="bg-black/40 p-2 text-center border border-primary/20 rounded-sm">
                                <div className="text-[8px] text-muted-foreground uppercase">Bashing</div>
                                <div className="text-lg font-display text-primary">{totalBashingSoak}</div>
                                <div className="text-[7px] text-muted-foreground">({baseBashingSoak} + {currentArmor.soakB})</div>
                            </div>
                            <div className="bg-black/40 p-2 text-center border border-primary/20 rounded-sm">
                                <div className="text-[8px] text-muted-foreground uppercase">Lethal</div>
                                <div className="text-lg font-display text-primary">{totalLethalSoak}</div>
                                <div className="text-[7px] text-muted-foreground">({baseLethalSoak} + {currentArmor.soakL})</div>
                            </div>
                            <div className="bg-black/40 p-2 text-center border border-red-500/20 rounded-sm">
                                <div className="text-[8px] text-red-400/70 uppercase">Aggravated</div>
                                <div className="text-lg font-display text-red-400">{totalAggSoak}</div>
                                <div className="text-[7px] text-muted-foreground">({baseAggSoak} + {currentArmor.soakA})</div>
                            </div>
                        </div>
                    </div>

                    {/* Armor Selection */}
                    <div className="space-y-2 pt-2 border-t border-primary/10">
                        <div className="text-[10px] font-display uppercase text-primary/70 tracking-widest">Armadura Equipada</div>
                        <select
                            value={selectedArmor}
                            onChange={(e) => setSelectedArmor(e.target.value)}
                            className="w-full bg-black/40 border border-primary/20 text-xs px-2 py-1.5 rounded-sm text-primary focus:border-primary outline-none"
                            data-testid="select-armor"
                        >
                            {ARMOR_OPTIONS.map((armor) => (
                                <option key={armor.name} value={armor.name} className="bg-black text-primary">
                                    {armor.name}
                                </option>
                            ))}
                        </select>

                        {/* Armor Stats Display */}
                        {selectedArmor && selectedArmor !== "Nenhuma" && (
                            <div className="bg-black/30 p-2 rounded-sm border border-primary/10 space-y-1">
                                <div className="grid grid-cols-2 gap-2 text-[9px]">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Soak B/L/A:</span>
                                        <span className="text-primary font-code">{currentArmor.soakB}/{currentArmor.soakL}/{currentArmor.soakA}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Mobilidade:</span>
                                        <span className={cn("font-code", mobilityPenalty < 0 ? "text-red-400" : "text-primary")}>
                                            {mobilityPenalty}
                                        </span>
                                    </div>
                                    <div className="flex justify-between col-span-2">
                                        <span className="text-muted-foreground">Fadiga:</span>
                                        <span className={cn("font-code", fatiguePenalty > 0 ? "text-amber-400" : "text-primary")}>
                                            {fatiguePenalty}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Hardness (for Epic Stamina) */}
                    {epicStamina > 0 && (
                        <div className="pt-2 border-t border-primary/10">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-muted-foreground">Hardness (Epic Stamina):</span>
                                <span className="font-display text-[hsl(var(--highlight-amber))]">{epicStamina}</span>
                            </div>
                        </div>
                    )}
                </div>
                </MythicHUDFrame>
            </div>

            {/* 3. VITALITY + OFFENSIVE - Takes 2 columns (stacked) */}
            <div className="md:col-span-2 flex flex-col gap-6">
                <MythicHUDFrame 
                    title="Vitality" 
                    icon={Heart} 
                    subHeader="NÍVEIS DE VITALIDADE"
                    isEditing={editingCombatAll}
                >
                    <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs font-display uppercase text-primary/70">
                             <span>Níveis de Vitalidade</span>
                             <div className="flex items-center gap-2">
                                 <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
                                     <span className="w-2 h-2 border border-primary/50 bg-black/50 block" /> B
                                     <span className="w-2 h-2 border border-primary/50 bg-black/50 flex items-center justify-center text-[8px]" >x</span> L
                                     <span className="w-2 h-2 border border-red-500/50 bg-black/50 flex items-center justify-center text-[8px] text-red-500" >*</span> A
                                 </div>
                                 <div className="flex items-center gap-1 border-l border-primary/20 pl-2">
                                     <span className="text-[8px] text-muted-foreground">-0:</span>
                                     <button 
                                         onClick={() => setExtraOxBody(Math.max(0, extraOxBody - 1))}
                                         className="w-4 h-4 flex items-center justify-center bg-black/50 border border-primary/30 text-primary/70 hover:bg-primary/20 hover:text-primary rounded-sm text-[10px] transition-colors"
                                         data-testid="btn-decrease-ox"
                                     >-</button>
                                     <span className="text-[9px] font-code text-primary w-4 text-center">{1 + extraOxBody}</span>
                                     <button 
                                         onClick={() => setExtraOxBody(extraOxBody + 1)}
                                         className="w-4 h-4 flex items-center justify-center bg-black/50 border border-primary/30 text-primary/70 hover:bg-primary/20 hover:text-primary rounded-sm text-[10px] transition-colors"
                                         data-testid="btn-increase-ox"
                                     >+</button>
                                 </div>
                             </div>
                         </div>
                         <div className="flex flex-wrap gap-2 justify-center">
                             {currentHealthLevels.map((level, idx) => (
                                 <div key={idx} className="flex flex-col items-center gap-1">
                                     <HealthBox status={healthDamage[idx]} onClick={() => toggleHealth(idx)} />
                                     <span className="text-[9px] font-code text-muted-foreground">{level}</span>
                                 </div>
                             ))}
                         </div>
                    </div>
                </MythicHUDFrame>

                <MythicHUDFrame title="Offensive Capabilities" icon={Sword} subHeader="WEAPONRY & ATTACK VECTORS" isEditing={editingCombatAll}>
                <div className="space-y-2">
                    {/* Search + Categories Row */}
                    <div className="flex items-center gap-2 pb-2 border-b border-primary/10">
                        <div className="relative flex-1">
                            <input 
                                value={offensiveSearch}
                                onChange={e => {
                                    setOffensiveSearch(e.target.value);
                                    setShowOffensiveDropdown(true);
                                }}
                                onFocus={() => setShowOffensiveDropdown(true)}
                                placeholder="Buscar armas do compêndio..." 
                                className="w-full bg-black border border-primary/20 text-[9px] px-2 py-1.5 rounded-sm focus:border-primary text-primary placeholder:text-primary/30 outline-none"
                            />
                            {showOffensiveDropdown && filteredOffensives.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-black border border-primary/20 rounded-sm max-h-[200px] overflow-y-auto z-50 shadow-[0_4px_20px_rgba(0,0,0,0.8)]">
                                    {filteredOffensives.slice(0, 15).map((o, i) => (
                                        <button
                                            key={`${o.offensive_name}-${i}`}
                                            onClick={() => addOffensiveFromDatabase(o)}
                                            className="w-full text-left px-2 py-1.5 text-[9px] font-code hover:bg-primary/20 text-primary transition-colors flex items-center justify-between gap-2 border-b border-primary/10 last:border-0"
                                        >
                                            <div className="flex items-center gap-2">
                                                <Crosshair className="w-3 h-3 text-primary/50" />
                                                <span className="text-primary font-bold">{o.offensive_name}</span>
                                                <span className="text-[7px] text-muted-foreground uppercase px-1 py-0.5 bg-primary/10 rounded">{o.category}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-muted-foreground text-[8px]">
                                                <span>{o.attack_attribute}+{o.attack_ability}</span>
                                                <span className="text-red-400/70">{o.damage}+{o.damage_attribute}</span>
                                            </div>
                                        </button>
                                    ))}
                                    {filteredOffensives.length > 15 && (
                                        <div className="px-2 py-1 text-[8px] text-muted-foreground text-center">
                                            +{filteredOffensives.length - 15} mais resultados...
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        {showOffensiveDropdown && (
                            <button 
                                onClick={() => {
                                    setShowOffensiveDropdown(false);
                                    setOffensiveSearch("");
                                }}
                                className="p-1.5 text-muted-foreground hover:text-primary transition-colors shrink-0"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        )}
                        <div className="flex gap-1 text-[7px] text-muted-foreground shrink-0">
                            <span className="px-1 py-0.5 bg-primary/10 rounded">Melee:{availableOffensives.melee.length}</span>
                            <span className="px-1 py-0.5 bg-primary/10 rounded">Ranged:{availableOffensives.ranged.length}</span>
                            <span className="px-1 py-0.5 bg-primary/10 rounded">Firearms:{availableOffensives.firearms.length}</span>
                        </div>
                    </div>

                    {/* Weapons Table Header - 11 columns */}
                    <div className="grid grid-cols-[1.8fr_0.7fr_0.7fr_0.5fr_0.6fr_0.5fr_0.5fr_0.5fr_0.6fr_0.7fr_auto] gap-1 text-[8px] uppercase tracking-widest text-muted-foreground border-b border-primary/10 pb-1.5 bg-primary/5 p-1.5 rounded-t-sm">
                        <div>Arma</div>
                        <div className="text-center">Atrib Atk</div>
                        <div className="text-center">Habil Atk</div>
                        <div className="text-center">Prec</div>
                        <div className="text-center">Atrib Dano</div>
                        <div className="text-center">Dano</div>
                        <div className="text-center">Def</div>
                        <div className="text-center">Vel</div>
                        <div className="text-center">Alcance</div>
                        <div className="text-center">Tags</div>
                        <div className="w-5"></div>
                    </div>

                    {/* Weapons List */}
                    <div className="space-y-0 max-h-[250px] overflow-y-auto">
                        {weapons.map((w, i) => (
                            <div key={i} className={`grid grid-cols-[1.8fr_0.7fr_0.7fr_0.5fr_0.6fr_0.5fr_0.5fr_0.5fr_0.6fr_0.7fr_auto] gap-1 text-[10px] font-code text-primary/90 items-center py-1.5 px-1 hover:bg-primary/10 transition-colors border-l-2 ${w.isInnate || w.category === 'innate' ? 'border-primary/30 bg-primary/5' : 'border-transparent hover:border-primary'} group`}>
                                <div className="font-bold truncate flex items-center gap-1.5">
                                    <Crosshair className="w-3 h-3 text-primary/50 shrink-0" />
                                    <span className="truncate">{w.name}</span>
                                    <span className="text-[7px] text-muted-foreground/60 uppercase shrink-0 px-1 py-0.5 bg-primary/10 rounded">({w.category?.slice(0,3)})</span>
                                </div>
                                <div className="text-center text-primary/70 text-[9px]">{w.attackAttribute || "-"}</div>
                                <div className="text-center text-primary/70 text-[9px]">{w.attackAbility || "-"}</div>
                                <div className="text-center text-muted-foreground font-bold">{w.accuracy >= 0 ? `+${w.accuracy}` : w.accuracy}</div>
                                <div className="text-center text-primary/70 text-[9px]">{w.damageAttribute || "-"}</div>
                                <div className="text-center text-primary font-bold">{w.damage}</div>
                                <div className="text-center text-primary/80">{w.defense >= 0 ? `+${w.defense}` : w.defense}</div>
                                <div className="text-center text-muted-foreground">{w.speed}</div>
                                <div className="text-center text-muted-foreground/70">{w.range || "-"}</div>
                                <div className="text-center text-[8px] uppercase opacity-70 truncate">{w.tags || "-"}</div>
                                {w.isInnate || w.category === 'innate' ? (
                                    <div className="w-5 h-5 flex items-center justify-center text-primary/40">
                                        <span className="text-[8px]">●</span>
                                    </div>
                                ) : (
                                    <button 
                                        onClick={() => removeWeapon(i)}
                                        className="w-5 h-5 flex items-center justify-center text-red-400/50 hover:text-red-400 hover:bg-red-400/10 rounded-sm transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                )}
                            </div>
                        ))}
                        
                        {/* Empty Row for Custom Offensive */}
                        <div className="grid grid-cols-[1.8fr_0.7fr_0.7fr_0.5fr_0.6fr_0.5fr_0.5fr_0.5fr_0.6fr_0.7fr_auto] gap-1 text-[10px] font-code items-center py-1.5 px-1 border-l-2 border-accent/30 bg-accent/5">
                            <input 
                                value={customOffensive.name || ''}
                                onChange={e => setCustomOffensive({...customOffensive, name: e.target.value})}
                                placeholder="Nova arma..."
                                className="bg-transparent border-b border-primary/20 text-[8px] px-1 py-0.5 text-primary placeholder:text-primary/30 outline-none focus:border-primary"
                            />
                            <select 
                                value={customOffensive.attackAttribute || 'Dexterity'}
                                onChange={e => setCustomOffensive({...customOffensive, attackAttribute: e.target.value})}
                                className="bg-transparent border-b border-primary/20 text-[7px] text-center text-primary/60 outline-none"
                            >
                                <option value="Strength">Str</option>
                                <option value="Dexterity">Dex</option>
                            </select>
                            <select 
                                value={customOffensive.attackAbility || 'Melee'}
                                onChange={e => setCustomOffensive({...customOffensive, attackAbility: e.target.value})}
                                className="bg-transparent border-b border-primary/20 text-[7px] text-center text-primary/60 outline-none"
                            >
                                <option value="Melee">Melee</option>
                                <option value="Brawl">Brawl</option>
                                <option value="Marksmanship">Marks</option>
                                <option value="Thrown">Throw</option>
                            </select>
                            <input 
                                type="number"
                                value={customOffensive.accuracy || 0}
                                onChange={e => setCustomOffensive({...customOffensive, accuracy: parseInt(e.target.value) || 0})}
                                className="bg-transparent border-b border-primary/20 text-[8px] text-center text-muted-foreground outline-none w-full"
                            />
                            <select 
                                value={customOffensive.damageAttribute || 'Strength'}
                                onChange={e => setCustomOffensive({...customOffensive, damageAttribute: e.target.value})}
                                className="bg-transparent border-b border-primary/20 text-[7px] text-center text-primary/60 outline-none"
                            >
                                <option value="Strength">Str</option>
                                <option value="Dexterity">Dex</option>
                                <option value="None">-</option>
                            </select>
                            <input 
                                value={customOffensive.damage || '0L'}
                                onChange={e => setCustomOffensive({...customOffensive, damage: e.target.value})}
                                placeholder="0L"
                                className="bg-transparent border-b border-primary/20 text-[8px] text-center text-primary/80 outline-none w-full"
                            />
                            <input 
                                type="number"
                                value={customOffensive.defense || 0}
                                onChange={e => setCustomOffensive({...customOffensive, defense: parseInt(e.target.value) || 0})}
                                className="bg-transparent border-b border-primary/20 text-[8px] text-center text-primary/70 outline-none w-full"
                            />
                            <input 
                                type="number"
                                value={customOffensive.speed || 5}
                                onChange={e => setCustomOffensive({...customOffensive, speed: parseInt(e.target.value) || 5})}
                                className="bg-transparent border-b border-primary/20 text-[8px] text-center text-muted-foreground outline-none w-full"
                            />
                            <input 
                                value={customOffensive.range || ''}
                                onChange={e => setCustomOffensive({...customOffensive, range: e.target.value || null})}
                                placeholder="-"
                                className="bg-transparent border-b border-primary/20 text-[8px] text-center text-muted-foreground/60 outline-none w-full"
                            />
                            <input 
                                value={customOffensive.tags || ''}
                                onChange={e => setCustomOffensive({...customOffensive, tags: e.target.value || null})}
                                placeholder="-"
                                className="bg-transparent border-b border-primary/20 text-[6px] text-center text-muted-foreground/60 outline-none w-full"
                            />
                            <button 
                                onClick={createCustomOffensive}
                                disabled={!customOffensive.name?.trim()}
                                className={cn(
                                    "w-4 h-4 flex items-center justify-center rounded-sm transition-colors",
                                    customOffensive.name?.trim() 
                                        ? "text-green-400 hover:text-green-300 hover:bg-green-400/10" 
                                        : "text-muted-foreground/30 cursor-not-allowed"
                                )}
                                title="Salvar arma customizada"
                            >
                                <Check className="w-2.5 h-2.5" />
                            </button>
                        </div>
                    </div>
                </div>
                </MythicHUDFrame>
            </div>

        </div>
        </CyberSection>
        {/* --- COMBAT ROW END --- */}

        {/* ATTRIBUTES & ABILITIES */}
        <CyberSection title="Trait Profile" collapsed={attribAbilCollapsed} onToggle={() => setAttribAbilCollapsed(!attribAbilCollapsed)} testId="btn-toggle-attrib-abil">
        <div className="space-y-6">
            <MythicHUDFrame title="Attributes" icon={Dna} className="flex flex-col" titleSize="large" isEditing={editingAttributes} {...createEditHandlers(editingAttributes, setEditingAttributes)}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-1">
                    {(Object.entries(attributes) as [AttributeCategory, Attribute[]][]).map(([category, attrs]) => (
                        <div key={category} className="space-y-1.5 relative">
                            <h4 className="text-[11px] font-display uppercase tracking-[0.2em] text-primary/60 border-b border-primary/20 pb-1.5 mb-2">
                                {category}
                            </h4>
                            {attrs.map((attr, idx) => (
                                <div key={attr.name} className="flex items-center justify-between gap-2 group py-1 px-1 hover:bg-primary/5 rounded-sm transition-colors">
                                    <div className="flex items-center gap-2">
                                        <span className="text-primary/50 text-[10px] w-4">{attr.rune}</span>
                                        <span className="text-[11px] font-bold font-code text-foreground uppercase tracking-wide">
                                            {attr.name}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <DotRating 
                                            value={attr.value} 
                                            onChange={(v) => updateAttribute(category, idx, 'value', v)} 
                                            max={10}
                                            iconClassName="w-2 h-2 rounded-full border border-primary/40"
                                            activeClassName="bg-primary shadow-[0_0_4px_gold] border-primary"
                                            readOnly={!editingAttributes}
                                        />
                                        <span className="text-xs font-display text-primary w-3 text-center">{attr.value}</span>
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

            {/* ABILITIES DATABASE - 3 columns aligned with attributes above */}
            <MythicHUDFrame title="Abilities" icon={Brain} className="flex flex-col" titleSize="large" isEditing={editingAbilities} {...createEditHandlers(editingAbilities, setEditingAbilities)}>
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
                                            "text-[11px] uppercase tracking-wide font-code transition-colors truncate",
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
                                                <span className="text-sm font-display text-primary w-4 text-center">{ability.value || 0}</span>
                                                <button 
                                                    onClick={() => updateAbilityValue(abilityName, Math.min(5, (ability.value || 0) + 1))}
                                                    className="text-primary/40 hover:text-primary"
                                                >
                                                    <Plus className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ) : (
                                            <span className={cn(
                                                "text-sm font-display w-5 text-center",
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
        </CyberSection>


        {/* BOTTOM SECTION: POWERS (Full Width) */}
        <CyberSection title="Legacy Profile" collapsed={legacyCollapsed} onToggle={() => setLegacyCollapsed(!legacyCollapsed)} testId="btn-toggle-legacy">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     {/* Knacks Column */}
                     <div>
                         <h5 className="text-xl font-display text-primary tracking-wide uppercase border-b border-primary/20 pb-1 mb-3">Knacks</h5>
                         <div className="space-y-2">
                             {knacks.length === 0 ? (
                                 <div className="text-[10px] text-muted-foreground/50 italic text-center py-4">
                                     Nenhum knack adicionado. Use a busca abaixo.
                                 </div>
                             ) : (
                                 <div className="grid grid-cols-1 gap-2">
                                     {knacks.map((k) => (
                                         <div key={k.id} className="flex items-start gap-3 p-2 bg-primary/5 border border-primary/20 rounded-sm group hover:bg-primary/10 transition-colors">
                                             {/* Hexagonal Icon */}
                                             <div className="relative shrink-0">
                                                 <svg viewBox="0 0 40 46" className="w-8 h-9">
                                                     <polygon 
                                                         points="20,0 40,11.5 40,34.5 20,46 0,34.5 0,11.5" 
                                                         fill="none" 
                                                         stroke="currentColor" 
                                                         strokeWidth="2"
                                                         className="text-primary/60"
                                                     />
                                                     <polygon 
                                                         points="20,3 37,13 37,33 20,43 3,33 3,13" 
                                                         fill="currentColor" 
                                                         className="text-primary/20"
                                                     />
                                                 </svg>
                                                 <Zap className="w-4 h-4 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                                             </div>
                                             <div className="flex-1 min-w-0">
                                                 <div className="flex items-center justify-between gap-2">
                                                     <span className="text-sm font-bold text-primary truncate">{k.name}</span>
                                                     <button 
                                                         onClick={() => removeKnack(k.id)}
                                                         className="text-red-400/50 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                                                     >
                                                         <X className="w-3 h-3" />
                                                     </button>
                                                 </div>
                                                 <div className="flex items-center gap-2 text-[9px] text-muted-foreground mt-0.5">
                                                     <span className="px-1 py-0.5 bg-primary/10 rounded">{k.attribute}</span>
                                                     <span className="px-1 py-0.5 bg-primary/10 rounded">{k.type}</span>
                                                 </div>
                                                 <p className="text-[9px] text-muted-foreground/70 mt-1 line-clamp-2">{k.description}</p>
                                             </div>
                                         </div>
                                     ))}
                                 </div>
                             )}
                             
                             {/* Knack Search with Attribute Filter */}
                             <div className="pt-3 border-t border-primary/10 relative">
                                 <div className="flex gap-2 mb-2">
                                     <select
                                         value={knackAttributeFilter}
                                         onChange={e => setKnackAttributeFilter(e.target.value)}
                                         className="bg-black border border-primary/20 text-[9px] px-2 py-1.5 rounded-sm focus:border-primary text-primary outline-none"
                                     >
                                         <option value="all" className="bg-black text-primary">Todos Atributos</option>
                                         {knackAttributes.map(attr => (
                                             <option key={attr} value={attr} className="bg-black text-primary">{attr}</option>
                                         ))}
                                     </select>
                                     <input 
                                         value={knackSearch}
                                         onChange={e => {
                                             setKnackSearch(e.target.value);
                                             setShowKnackDropdown(true);
                                         }}
                                         onFocus={() => setShowKnackDropdown(true)}
                                         placeholder="Buscar por nome..."
                                         className="flex-1 bg-black border border-primary/20 text-[9px] px-2 py-1.5 rounded-sm focus:border-primary text-primary placeholder:text-primary/30 outline-none"
                                     />
                                 </div>
                                 <div className="relative">
                                     {showKnackDropdown && filteredKnacks.length > 0 && (
                                         <div className="absolute top-full left-0 right-0 mt-1 bg-black border border-primary/20 rounded-sm max-h-[400px] overflow-y-auto z-50 shadow-[0_4px_20px_rgba(0,0,0,0.8)]">
                                             {filteredKnacks.map((k) => (
                                                 <button
                                                     key={k.id}
                                                     onClick={() => addKnackFromDatabase(k)}
                                                     disabled={knacks.some(kk => kk.id === k.id)}
                                                     className={cn(
                                                         "w-full text-left px-2 py-1.5 text-[9px] font-code transition-colors flex items-center gap-3 border-b border-primary/10 last:border-0",
                                                         knacks.some(kk => kk.id === k.id) 
                                                             ? "opacity-40 cursor-not-allowed" 
                                                             : "hover:bg-primary/20 text-primary"
                                                     )}
                                                 >
                                                     <div className="relative shrink-0">
                                                         <svg viewBox="0 0 40 46" className="w-4 h-5">
                                                             <polygon 
                                                                 points="20,0 40,11.5 40,34.5 20,46 0,34.5 0,11.5" 
                                                                 fill="none" 
                                                                 stroke="currentColor" 
                                                                 strokeWidth="2"
                                                                 className="text-primary/40"
                                                             />
                                                         </svg>
                                                         <Zap className="w-2 h-2 text-primary/60 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                                                     </div>
                                                     <div className="flex-1 min-w-0">
                                                         <span className="text-primary font-bold">{k.name}</span>
                                                         <div className="flex items-center gap-2 text-[8px] text-muted-foreground mt-0.5">
                                                             <span>{k.attribute}</span>
                                                             <span>•</span>
                                                             <span>{k.type}</span>
                                                         </div>
                                                     </div>
                                                 </button>
                                             ))}
                                         </div>
                                     )}
                                 </div>
                                 {showKnackDropdown && (
                                     <button 
                                         onClick={() => {
                                             setShowKnackDropdown(false);
                                             setKnackSearch("");
                                         }}
                                         className="absolute right-2 top-3 p-1 text-muted-foreground hover:text-primary transition-colors"
                                     >
                                         <X className="w-3 h-3" />
                                     </button>
                                 )}
                                 <div className="text-[8px] text-muted-foreground mt-2">
                                     {availableKnacks.length} knacks disponíveis
                                 </div>
                             </div>
                         </div>
                     </div>

                     {/* Boons Column */}
                     <div>
                         <h5 className="text-xl font-display text-primary tracking-wide uppercase border-b border-primary/20 pb-1 mb-3">Boons</h5>
                         <div className="space-y-2">
                             {selectedBoons.length === 0 ? (
                                 <div className="text-[10px] text-muted-foreground/50 italic text-center py-4">
                                     Nenhum boon adicionado. Use a busca abaixo.
                                 </div>
                             ) : (
                                 <div className="grid grid-cols-1 gap-2">
                                     {selectedBoons.map((b) => (
                                         <div key={b.id} className="flex items-start gap-3 p-2 bg-accent/10 border border-accent/20 rounded-sm group hover:bg-accent/20 transition-colors">
                                             <div className="w-6 h-6 rounded-full bg-accent/30 flex items-center justify-center shrink-0">
                                                 <Flame className="w-3 h-3 text-accent-foreground" />
                                             </div>
                                             <div className="flex-1 min-w-0">
                                                 <div className="flex items-center justify-between gap-2">
                                                     <span className="text-sm font-bold text-accent-foreground truncate">{b.name}</span>
                                                     <button 
                                                         onClick={() => removeBoon(b.id)}
                                                         className="text-red-400/50 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                                                     >
                                                         <X className="w-3 h-3" />
                                                     </button>
                                                 </div>
                                                 <div className="flex items-center gap-2 text-[9px] text-muted-foreground mt-0.5">
                                                     <span className="px-1 py-0.5 bg-accent/20 rounded">{b.purview}</span>
                                                     <span className="px-1 py-0.5 bg-accent/20 rounded">Tier {b.tier || b.level || '-'}</span>
                                                 </div>
                                                 <p className="text-[9px] text-muted-foreground/70 mt-1 line-clamp-2">{b.description}</p>
                                             </div>
                                         </div>
                                     ))}
                                 </div>
                             )}
                             
                             {/* Boon Search with Purview Filter */}
                             <div className="pt-3 border-t border-accent/10 relative">
                                 <div className="flex gap-2 mb-2">
                                     <select
                                         value={boonPurviewFilter}
                                         onChange={e => setBoonPurviewFilter(e.target.value)}
                                         className="bg-black border border-accent/20 text-[9px] px-2 py-1.5 rounded-sm focus:border-accent text-accent-foreground outline-none"
                                     >
                                         <option value="all" className="bg-black text-primary">Todos Purviews</option>
                                         {boonPurviews.map(purview => (
                                             <option key={purview} value={purview} className="bg-black text-primary">{purview}</option>
                                         ))}
                                     </select>
                                     <input 
                                         value={boonSearch}
                                         onChange={e => {
                                             setBoonSearch(e.target.value);
                                             setShowBoonDropdown(true);
                                         }}
                                         onFocus={() => setShowBoonDropdown(true)}
                                         placeholder="Buscar por nome..."
                                         className="flex-1 bg-black border border-accent/20 text-[9px] px-2 py-1.5 rounded-sm focus:border-accent text-accent-foreground placeholder:text-accent-foreground/30 outline-none"
                                     />
                                 </div>
                                 <div className="relative">
                                     {showBoonDropdown && filteredBoons.length > 0 && (
                                         <div className="absolute top-full left-0 right-0 mt-1 bg-black border border-accent/20 rounded-sm max-h-[400px] overflow-y-auto z-50 shadow-[0_4px_20px_rgba(0,0,0,0.8)]">
                                             {filteredBoons.map((b) => (
                                                 <button
                                                     key={b.id}
                                                     onClick={() => addBoonFromDatabase(b)}
                                                     disabled={selectedBoons.some(sb => sb.id === b.id)}
                                                     className={cn(
                                                         "w-full text-left px-2 py-1.5 text-[9px] font-code transition-colors flex items-center gap-3 border-b border-accent/10 last:border-0",
                                                         selectedBoons.some(sb => sb.id === b.id) 
                                                             ? "opacity-40 cursor-not-allowed" 
                                                             : "hover:bg-accent/20 text-accent-foreground"
                                                     )}
                                                 >
                                                     <div className="w-4 h-4 rounded-full bg-accent/30 flex items-center justify-center shrink-0">
                                                         <Flame className="w-2 h-2 text-accent-foreground/60" />
                                                     </div>
                                                     <div className="flex-1 min-w-0">
                                                         <span className="text-accent-foreground font-bold">{b.name}</span>
                                                         <div className="flex items-center gap-2 text-[8px] text-muted-foreground mt-0.5">
                                                             <span>{b.purview}</span>
                                                             <span>•</span>
                                                             <span>T{b.tier || b.level || '-'}</span>
                                                         </div>
                                                     </div>
                                                 </button>
                                             ))}
                                         </div>
                                     )}
                                 </div>
                                 {showBoonDropdown && (
                                     <button 
                                         onClick={() => {
                                             setShowBoonDropdown(false);
                                             setBoonSearch("");
                                         }}
                                         className="absolute right-2 top-3 p-1 text-muted-foreground hover:text-accent-foreground transition-colors"
                                     >
                                         <X className="w-3 h-3" />
                                     </button>
                                 )}
                                 <div className="text-[8px] text-muted-foreground mt-2">
                                     {availableBoons.length} boons disponíveis
                                 </div>
                             </div>
                         </div>
                     </div>

                     {/* Birthrights Column */}
                     <div>
                         <h5 className="text-xl font-display text-primary tracking-wide uppercase border-b border-primary/20 pb-1 mb-3">Birthrights</h5>
                         <div className="space-y-4">
                             {(['creatures', 'guides', 'followers', 'relics'] as const).map((category) => {
                                 const labels: Record<string, { icon: string; label: string }> = {
                                     creatures: { icon: '🐺', label: 'Criaturas' },
                                     guides: { icon: '👁', label: 'Guias' },
                                     followers: { icon: '⚔', label: 'Seguidores' },
                                     relics: { icon: '✧', label: 'Relíquias' },
                                 };
                                 const { icon, label } = labels[category];
                                 return (
                                     <div key={category} className="space-y-1.5">
                                         <div className="flex items-center gap-2 border-b border-primary/15 pb-1">
                                             <span className="text-[10px]">{icon}</span>
                                             <span className="text-[9px] font-display uppercase text-primary/70 tracking-widest">{label}</span>
                                         </div>
                                         <div className="space-y-1 max-h-24 overflow-y-auto">
                                             {birthrights[category].map((item, idx) => (
                                                 <div key={idx} className="flex items-start gap-2 p-1 bg-primary/5 border border-primary/10 rounded-sm group">
                                                     <div className="flex-1 min-w-0">
                                                         <div className="flex items-center gap-1">
                                                             <span className="text-[9px] font-bold text-primary truncate">{item.name}</span>
                                                             <span className="text-[7px] text-primary/60">{'●'.repeat(item.dots)}</span>
                                                         </div>
                                                         {item.description && <p className="text-[7px] text-muted-foreground truncate">{item.description}</p>}
                                                     </div>
                                                     <button onClick={() => removeBirthright(category, idx)} className="text-red-400/50 hover:text-red-400 opacity-0 group-hover:opacity-100">
                                                         <X className="w-3 h-3" />
                                                     </button>
                                                 </div>
                                             ))}
                                         </div>
                                         <div className="space-y-1 pt-1 border-t border-primary/10">
                                             <div className="flex gap-1">
                                                 <input
                                                     value={newBirthright[category].name}
                                                     onChange={e => setNewBirthright({...newBirthright, [category]: {...newBirthright[category], name: e.target.value}})}
                                                     placeholder="Nome..."
                                                     className="flex-1 bg-black/30 border border-primary/20 text-[8px] px-1.5 py-1 rounded-sm text-primary placeholder:text-primary/30 outline-none"
                                                 />
                                                 <select
                                                     value={newBirthright[category].dots}
                                                     onChange={e => setNewBirthright({...newBirthright, [category]: {...newBirthright[category], dots: Number(e.target.value)}})}
                                                     className="bg-black border border-primary/20 text-[8px] px-1 py-1 rounded-sm text-primary outline-none w-10"
                                                 >
                                                     {[1,2,3,4,5].map(d => <option key={d} value={d} className="bg-black">{'●'.repeat(d)}</option>)}
                                                 </select>
                                             </div>
                                             <div className="flex gap-1">
                                                 <input
                                                     value={newBirthright[category].description}
                                                     onChange={e => setNewBirthright({...newBirthright, [category]: {...newBirthright[category], description: e.target.value}})}
                                                     placeholder="Descrição..."
                                                     className="flex-1 bg-black/30 border border-primary/20 text-[8px] px-1.5 py-1 rounded-sm text-primary placeholder:text-primary/30 outline-none"
                                                 />
                                                 <button onClick={() => addBirthright(category)} className="px-1.5 py-1 bg-primary/20 hover:bg-primary/30 text-primary text-[8px] rounded-sm">+</button>
                                             </div>
                                         </div>
                                     </div>
                                 );
                             })}
                         </div>
                     </div>
                </div>
        </CyberSection>

        <SectionDivider label="END OF LINE" />

      </div>
    </div>
  );
}
