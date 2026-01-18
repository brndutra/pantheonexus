import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DotRating } from "@/components/ui/dot-rating";
import { ScionInput } from "@/components/ui/scion-input";
import { cn } from "@/lib/utils";
import { Shield, Zap, Skull, Scroll, Activity, Cpu, Hexagon, Plus, Trash2, Crown, Heart, ChevronRight } from "lucide-react";
import textureBg from "@assets/generated_images/ancient_mythology_meets_cyberpunk_texture.png";
import virtueIcon from "@assets/generated_images/virtue_icon_gold_geometric.png";
import crownIcon from "@assets/generated_images/legendary_title_crown_icon.png";

// --- Types ---
type AttributeCategory = "Physical" | "Social" | "Mental";
type AttributeName = "Strength" | "Dexterity" | "Stamina" | "Charisma" | "Manipulation" | "Appearance" | "Perception" | "Intelligence" | "Wits";

interface Attribute {
  name: AttributeName;
  value: number;
  epic: number;
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
    { name: "Strength", value: 1, epic: 0 },
    { name: "Dexterity", value: 1, epic: 0 },
    { name: "Stamina", value: 1, epic: 0 },
  ],
  Social: [
    { name: "Charisma", value: 1, epic: 0 },
    { name: "Manipulation", value: 1, epic: 0 },
    { name: "Appearance", value: 1, epic: 0 },
  ],
  Mental: [
    { name: "Perception", value: 1, epic: 0 },
    { name: "Intelligence", value: 1, epic: 0 },
    { name: "Wits", value: 1, epic: 0 },
  ],
};

const ABILITIES = [
  "Academics", "Animal Ken", "Art", "Athletics", "Awareness", "Brawl", 
  "Command", "Control", "Craft", "Empathy", "Fortitude", "Integrity", 
  "Investigation", "Larceny", "Marksmanship", "Medicine", "Melee", 
  "Occult", "Politics", "Presence", "Science", "Stealth", "Survival", "Thrown"
];

// --- Components ---

const SectionFrame = ({ children, title, className, icon: Icon, action }: { children: React.ReactNode, title: string, className?: string, icon?: any, action?: React.ReactNode }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={cn("mythic-border-box bg-card/80 p-6 relative backdrop-blur-sm", className)}
  >
    <div className="absolute -top-3 left-6 bg-background px-2 flex items-center gap-2 border border-border/50 rounded shadow-lg z-10">
      {Icon && <Icon className="w-4 h-4 text-primary" />}
      <h3 className="font-mythic text-primary text-lg tracking-widest">{title}</h3>
    </div>
    {action && (
      <div className="absolute -top-3 right-6 z-10">
        {action}
      </div>
    )}
    {children}
  </motion.div>
);

const HealthBox = ({ status, onClick }: { status: DamageType, onClick: () => void }) => {
  return (
    <button 
      onClick={onClick}
      className="w-6 h-6 border border-muted-foreground rounded bg-black/50 flex items-center justify-center hover:border-primary transition-colors focus:outline-none"
    >
      {status === 1 && <div className="w-full h-[2px] bg-green-500 rotate-45" />}
      {status === 2 && (
        <div className="relative w-full h-full flex items-center justify-center">
          <div className="absolute w-full h-[2px] bg-yellow-500 rotate-45" />
          <div className="absolute w-full h-[2px] bg-yellow-500 -rotate-45" />
        </div>
      )}
      {status === 3 && (
        <div className="relative w-full h-full flex items-center justify-center">
          <div className="absolute w-full h-[2px] bg-red-600 rotate-45" />
          <div className="absolute w-full h-[2px] bg-red-600 -rotate-45" />
          <div className="absolute w-[2px] h-full bg-red-600" />
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
  // Default levels: -0, -1, -1, -2, -2, -4, Incap
  // We allow adding extra -0 boxes
  const [extraOxBody, setExtraOxBody] = useState(0);
  const [healthDamage, setHealthDamage] = useState<DamageType[]>(new Array(7 + 10).fill(0)); // Buffer size for potentially many boxes

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

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden font-tech selection:bg-primary/30 relative">
      {/* Background Texture Overlay */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-20 z-0 mix-blend-overlay"
        style={{ backgroundImage: `url(${textureBg})`, backgroundSize: 'cover' }} 
      />
      
      {/* Scanline Effect */}
      <div className="fixed inset-0 pointer-events-none z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,6px_100%] opacity-20" />

      {/* Main Container */}
      <div className="relative z-10 container mx-auto p-4 md:p-8 max-w-5xl">
        
        {/* Header / Identity Card */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 border-b-2 border-primary/30 pb-6 relative"
        >
          <div className="absolute top-0 right-0 font-code text-xs text-secondary opacity-50 flex items-center gap-2">
            <Activity className="w-3 h-3 animate-pulse" />
            SYS.ONLINE // V.1.0.4
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-end gap-6">
            <div>
              <h1 className="text-4xl md:text-6xl font-mythic text-primary text-shadow-glow tracking-tighter">
                SCION
              </h1>
              <p className="text-secondary font-code text-sm tracking-[0.5em] uppercase">Divine Datastream Interface</p>
            </div>
            
            <div className="flex gap-4 w-full md:w-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                <ScionInput label="Name" placeholder="Enter Name..." />
                
                {/* Dynamic Callings Section */}
                <div className="md:col-span-1 space-y-2 relative">
                  <label className="block text-xs uppercase tracking-wider mb-1 font-mythic text-primary/80">
                    Callings
                  </label>
                  {callings.map((calling, i) => (
                    <div key={calling.id} className="relative group">
                      <input 
                        className="w-full bg-black/20 border-b-2 border-muted px-2 py-1 outline-none font-tech text-foreground focus:border-primary focus:bg-primary/5 transition-colors pr-8 text-sm"
                        placeholder={`Calling ${i + 1}`}
                        value={calling.name}
                        onChange={(e) => updateCalling(i, 'name', e.target.value)}
                      />
                      <button 
                         onClick={() => setActiveTitleIndex(activeTitleIndex === i ? null : i)}
                         className={cn(
                           "absolute right-1 top-1/2 -translate-y-1/2 transition-colors",
                           calling.title ? "text-primary opacity-100" : "text-muted-foreground opacity-30 group-hover:opacity-100 hover:text-primary"
                         )}
                         title="Add Legendary Title"
                      >
                         <img src={crownIcon} alt="Title" className="w-4 h-4 grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all" />
                      </button>
                      
                      <AnimatePresence>
                        {activeTitleIndex === i && (
                          <motion.div 
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            className="absolute z-50 left-0 top-full mt-2 w-64 bg-card border border-primary/30 p-2 shadow-xl rounded-sm backdrop-blur-md"
                          >
                             <div className="flex items-center gap-2 mb-1">
                                <Crown className="w-3 h-3 text-primary" />
                                <span className="text-[10px] uppercase tracking-widest text-primary">Legendary Title</span>
                             </div>
                             <input 
                                autoFocus
                                className="w-full bg-black/40 border border-white/10 px-2 py-1 text-sm text-foreground focus:border-primary/50 outline-none rounded-sm font-mythic"
                                placeholder="The God-Slayer..."
                                value={calling.title}
                                onChange={(e) => updateCalling(i, 'title', e.target.value)}
                             />
                             <div className="absolute -top-1 left-4 w-2 h-2 bg-card border-t border-l border-primary/30 rotate-45" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                      {calling.title && activeTitleIndex !== i && (
                        <div className="absolute top-full left-0 text-[10px] text-primary/70 font-mythic italic truncate w-full px-2 pointer-events-none">
                          "{calling.title}"
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <ScionInput label="Pantheon" placeholder="Aesir/Pesedjet..." />
                <ScionInput label="Nature" placeholder="Personality..." />
              </div>
            </div>
          </div>
        </motion.header>

        {/* Navigation Tabs */}
        <div className="flex gap-4 mb-8 border-b border-white/10 overflow-x-auto pb-2">
          {[
            { id: "sheet", label: "Attributes & Abilities", icon: Shield },
            { id: "powers", label: "Knacks & Boons", icon: Zap },
            { id: "bio", label: "Biography & Notes", icon: Scroll },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "pb-2 px-4 flex items-center gap-2 transition-all duration-300 relative overflow-hidden group whitespace-nowrap",
                activeTab === tab.id 
                  ? "text-primary border-b-2 border-primary" 
                  : "text-muted-foreground hover:text-secondary hover:border-b-2 hover:border-secondary/50"
              )}
            >
              <tab.icon className="w-4 h-4" />
              <span className="font-mythic tracking-wide uppercase text-sm">{tab.label}</span>
              
              {/* Hover Effect */}
              <div className="absolute inset-0 bg-white/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none" />
            </button>
          ))}
        </div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          {activeTab === "sheet" && (
            <motion.div 
              key="sheet"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="grid grid-cols-1 md:grid-cols-12 gap-8"
            >
              {/* Left Column: Attributes & Abilities */}
              <div className="md:col-span-8 space-y-8">
                <SectionFrame title="Attributes" icon={Hexagon}>
                  <div className="grid md:grid-cols-3 gap-8">
                    {(Object.entries(attributes) as [AttributeCategory, Attribute[]][]).map(([category, attrs]) => (
                      <div key={category} className="space-y-4">
                        <h4 className="text-center font-code text-secondary text-sm uppercase tracking-widest border-b border-secondary/20 pb-1 mb-4">
                          {category}
                        </h4>
                        {attrs.map((attr, idx) => (
                          <div key={attr.name} className="space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="font-mythic text-sm text-foreground/90">{attr.name}</span>
                              <DotRating 
                                value={attr.value} 
                                max={5} // Scion attributes go higher, but let's stick to 5 for mockup base
                                onChange={(v) => updateAttribute(category, idx, 'value', v)} 
                              />
                            </div>
                            {/* Epic Attribute Row */}
                            {attr.value >= 1 && (
                              <div className="flex justify-between items-center pl-2 border-l-2 border-secondary/30">
                                <span className="font-code text-xs text-secondary">EPIC</span>
                                <DotRating 
                                  value={attr.epic} 
                                  max={5} 
                                  variant="tech"
                                  className="scale-90 origin-right"
                                  onChange={(v) => updateAttribute(category, idx, 'epic', v)} 
                                />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </SectionFrame>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <SectionFrame title="Abilities" icon={Cpu} className="md:col-span-2">
                     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-2">
                        {ABILITIES.map(ability => (
                          <div key={ability} className="flex justify-between items-center group hover:bg-white/5 p-1 rounded transition-colors">
                             <span className="text-sm font-tech text-muted-foreground group-hover:text-primary transition-colors">{ability}</span>
                             <DotRating 
                                value={abilities[ability]} 
                                max={5}
                                className="scale-75 origin-right"
                                onChange={(v) => setAbilities({...abilities, [ability]: v})}
                             />
                          </div>
                        ))}
                     </div>
                  </SectionFrame>
                  
                  {/* Virtues Section */}
                  <SectionFrame title="Virtues" icon={Heart} className="md:col-span-2">
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                        {virtues.map((virtue, idx) => (
                           <div key={virtue.id} className="flex flex-col items-center gap-2 p-3 border border-white/5 bg-white/5 rounded relative group hover:border-primary/30 transition-colors">
                              <img src={virtueIcon} alt="Virtue" className="w-8 h-8 opacity-50 group-hover:opacity-100 transition-opacity" />
                              <input 
                                className="w-full bg-transparent text-center font-mythic text-sm border-b border-transparent focus:border-primary outline-none"
                                value={virtue.name}
                                placeholder="Virtue Name"
                                onChange={(e) => updateVirtue(idx, 'name', e.target.value)}
                              />
                              <DotRating 
                                value={virtue.value} 
                                max={5}
                                className="scale-90"
                                onChange={(v) => updateVirtue(idx, 'value', v)}
                              />
                           </div>
                        ))}
                     </div>
                  </SectionFrame>
                </div>
              </div>

              {/* Right Column: Vitals */}
              <div className="md:col-span-4 space-y-8">
                <SectionFrame title="Legend" icon={Zap} className="border-secondary/50">
                   <div className="flex flex-col items-center gap-4">
                      <div className="relative w-24 h-24 flex items-center justify-center">
                         <div className="absolute inset-0 border-4 border-primary/20 rounded-full animate-spin-slow" />
                         <span className="text-4xl font-mythic text-primary text-shadow-glow">{legend}</span>
                      </div>
                      <DotRating value={legend} max={10} onChange={setLegend} variant="mythic" />
                      <div className="flex gap-2 text-xs font-code text-secondary">
                        <span>L.POINTS: {legend * legend}</span>
                      </div>
                   </div>
                </SectionFrame>

                <SectionFrame title="Willpower" icon={Shield}>
                   <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm uppercase tracking-wider">Perm</span>
                        <DotRating value={willpower} max={10} onChange={setWillpower} />
                      </div>
                      <div className="flex justify-between items-center">
                         <span className="text-sm uppercase tracking-wider text-muted-foreground">Temp</span>
                         <div className="flex gap-1 flex-wrap justify-end">
                            {Array.from({length: 10}).map((_, i) => (
                               <button 
                                key={i}
                                onClick={() => setWillpowerTemp(i + 1 === willpowerTemp ? 0 : i + 1)}
                                className={cn(
                                  "w-3 h-3 border border-secondary/50 rounded-sm transition-all",
                                  i < willpowerTemp ? "bg-secondary shadow-[0_0_5px_silver]" : "bg-transparent"
                                )}
                               />
                            ))}
                         </div>
                      </div>
                   </div>
                </SectionFrame>

                <SectionFrame 
                  title="Health" 
                  icon={Skull}
                  action={
                    <button 
                      onClick={() => setExtraOxBody(prev => Math.min(prev + 1, 5))}
                      className="text-[10px] flex items-center gap-1 border border-secondary/50 px-2 py-0.5 rounded hover:bg-secondary/10 text-secondary transition-colors"
                      title="Add Ox-Body Level (-0)"
                    >
                      <Plus className="w-3 h-3" /> OxBody
                    </button>
                  }
                >
                   <div className="space-y-2">
                      {currentHealthLevels.map((level, i) => (
                         <div key={i} className="flex items-center justify-between bg-black/40 p-2 rounded border border-white/5">
                            <span className={cn(
                              "font-code w-12 text-right",
                              level === "Incap" ? "text-red-500 font-bold" : "text-foreground/70"
                            )}>
                              {level}
                            </span>
                            <div className="flex-1 ml-4 border-b border-dashed border-white/10 mx-2" />
                            <HealthBox status={healthDamage[i]} onClick={() => toggleHealth(i)} />
                            
                            {/* Remove button for extra ox-body levels only */}
                            {i < extraOxBody && (
                              <button 
                                onClick={() => {
                                  setExtraOxBody(prev => prev - 1);
                                  // Shift damage down
                                  const newDamage = [...healthDamage];
                                  newDamage.splice(i, 1);
                                  newDamage.push(0); // Add empty at end
                                  setHealthDamage(newDamage);
                                }}
                                className="ml-2 text-destructive hover:text-white"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                         </div>
                      ))}
                   </div>
                   <div className="mt-4 text-[10px] text-muted-foreground flex justify-between font-code px-2">
                      <span>/ Bashing</span>
                      <span>X Lethal</span>
                      <span>* Aggravated</span>
                   </div>
                </SectionFrame>
              </div>
            </motion.div>
          )}

          {activeTab === "powers" && (
            <motion.div
               key="powers"
               initial={{ opacity: 0, x: -10 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: 10 }}
               className="py-8"
            >
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <SectionFrame title="Epic Knacks" icon={Zap}>
                    <div className="flex gap-2 mb-4">
                      <ScionInput 
                        value={newKnack} 
                        onChange={(e) => setNewKnack(e.target.value)} 
                        placeholder="Add new knack..." 
                        variant="tech"
                        onKeyDown={(e) => e.key === 'Enter' && addKnack()}
                      />
                      <button onClick={addKnack} className="p-2 border border-secondary text-secondary hover:bg-secondary/10 rounded">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="space-y-2">
                      {knacks.map((k, i) => (
                        <div key={i} className="flex justify-between items-center p-2 bg-white/5 rounded border border-white/10">
                          <span className="font-tech text-foreground/90">{k}</span>
                          <button onClick={() => setKnacks(knacks.filter((_, idx) => idx !== i))} className="text-destructive hover:text-destructive/80">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      {knacks.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground font-code text-xs">NO DATA RECORDED</div>
                      )}
                    </div>
                  </SectionFrame>

                  <SectionFrame title="Boons" icon={Hexagon}>
                    <div className="flex gap-2 mb-4">
                      <ScionInput 
                        value={newBoon} 
                        onChange={(e) => setNewBoon(e.target.value)} 
                        placeholder="Add new boon..." 
                        variant="mythic"
                        onKeyDown={(e) => e.key === 'Enter' && addBoon()}
                      />
                      <button onClick={addBoon} className="p-2 border border-primary text-primary hover:bg-primary/10 rounded">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="space-y-2">
                      {boons.map((b, i) => (
                        <div key={i} className="flex justify-between items-center p-2 bg-white/5 rounded border border-primary/20">
                          <span className="font-mythic text-primary/90 text-sm tracking-wide">{b}</span>
                          <button onClick={() => setBoons(boons.filter((_, idx) => idx !== i))} className="text-destructive hover:text-destructive/80">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      {boons.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground font-code text-xs">NO DATA RECORDED</div>
                      )}
                    </div>
                  </SectionFrame>
               </div>
            </motion.div>
          )}

          {activeTab === "bio" && (
             <motion.div
                key="bio"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
             >
                <SectionFrame title="Character Biography">
                   <textarea 
                      className="w-full bg-black/30 border border-white/10 p-4 min-h-[400px] font-tech text-lg text-foreground/80 focus:outline-none focus:border-primary/50 transition-colors rounded resize-none"
                      placeholder="Enter legend here..."
                   />
                </SectionFrame>
             </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
