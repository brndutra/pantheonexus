import React, { useState } from "react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { Plus, Trash2, Scroll, Shield, User, Star, LayoutGrid, FileText, Send, Book, Zap, Skull, Heart } from "lucide-react";
import { useArticles } from "@/lib/articles-store";
import { useCharacters } from "@/lib/characters-store";
import { useCompendium } from "@/lib/compendium-store";

// Reusing style components for consistency
const SectionFrame = ({ children, title, className, subHeader }: { children: React.ReactNode, title: string, className?: string, subHeader?: string }) => (
  <div className={cn("p-8 frame-ethereal rounded-sm h-full group", className)}>
    {/* CSS Corner Accents */}
    <div className="frame-corner-tl" />
    <div className="frame-corner-tr" />
    <div className="frame-corner-bl" />
    <div className="frame-corner-br" />

    <div className="flex justify-between items-start mb-6 border-b border-primary/20 pb-2 relative z-10 px-2">
       <div>
          <h3 className="font-mythic text-primary text-xl tracking-[0.15em] uppercase drop-shadow-md">{title}</h3>
          {subHeader && <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] mt-1 font-tech">{subHeader}</p>}
       </div>
    </div>
    <div className="relative z-10 px-2">
      {children}
    </div>
  </div>
);

const ScionInput = ({ label, className, as: Component = "input", ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label?: string, as?: any }) => (
  <div className="flex flex-col gap-1 w-full">
    {label && <label className="text-[10px] uppercase tracking-widest text-primary/70 font-mythic">{label}</label>}
    <Component 
      className={cn(
        "bg-black/50 border border-white/10 rounded-sm px-3 py-2 text-sm font-tech text-foreground outline-none focus:border-primary/50 placeholder:text-muted-foreground/30 transition-colors focus:bg-primary/5",
        className
      )}
      {...props} 
    />
  </div>
);

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"scrolls" | "alleybrary" | "compendium">("scrolls");
  const [compendiumTab, setCompendiumTab] = useState<"knacks" | "boons" | "virtues" | "natures" | "callings">("knacks");

  // Compendium State
  const { 
    knacks, addKnack, deleteKnack,
    boons, addBoon, deleteBoon,
    virtues, addVirtue, deleteVirtue,
    natures, addNature, deleteNature,
    callings, addCalling, deleteCalling
  } = useCompendium();

  const [newKnack, setNewKnack] = useState({ name: "", description: "", epicAttribute: "", prerequisite: "" });
  const [newBoon, setNewBoon] = useState({ name: "", purview: "", level: 1, cost: "", type: "", description: "" });
  const [newVirtue, setNewVirtue] = useState({ name: "", description: "" });
  const [newNature, setNewNature] = useState({ name: "", description: "" });
  const [newCalling, setNewCalling] = useState({ name: "", description: "" });

  const handleAddKnack = () => {
    if (newKnack.name && newKnack.description) {
      addKnack(newKnack);
      setNewKnack({ name: "", description: "", epicAttribute: "", prerequisite: "" });
    }
  };

  const handleAddBoon = () => {
    if (newBoon.name && newBoon.description) {
      addBoon(newBoon);
      setNewBoon({ name: "", purview: "", level: 1, cost: "", type: "", description: "" });
    }
  };

  const handleAddVirtue = () => {
    if (newVirtue.name && newVirtue.description) {
      addVirtue(newVirtue);
      setNewVirtue({ name: "", description: "" });
    }
  };

  const handleAddNature = () => {
    if (newNature.name && newNature.description) {
      addNature(newNature);
      setNewNature({ name: "", description: "" });
    }
  };

  const handleAddCalling = () => {
    if (newCalling.name && newCalling.description) {
      addCalling(newCalling);
      setNewCalling({ name: "", description: "" });
    }
  };

  // Scrolls State
  const { characters: scrolls, addCharacter, deleteCharacter } = useCharacters();

  const [newScroll, setNewScroll] = useState({
    name: "",
    player: "",
    legend: 1,
    pantheon: ""
  });

  // Articles State
  const { articles, addArticle, deleteArticle } = useArticles();
  const [newArticle, setNewArticle] = useState({
    title: "",
    summary: "",
    content: "",
    author: "Admin",
    tags: "",
    coverImage: "",
    portraitImage: ""
  });

  const handleAddScroll = () => {
    if (newScroll.name && newScroll.player) {
      addCharacter({
          name: newScroll.name,
          player: newScroll.player,
          legend: newScroll.legend,
          pantheon: newScroll.pantheon,
      });
      setNewScroll({ name: "", player: "", legend: 1, pantheon: "" });
    }
  };

  const handleDeleteScroll = (id: number) => {
    deleteCharacter(id);
  };


  const handlePublishArticle = () => {
      if (newArticle.title && newArticle.content) {
          addArticle({
              title: newArticle.title,
              summary: newArticle.summary,
              content: newArticle.content,
              author: newArticle.author,
              tags: newArticle.tags.split(',').map(t => t.trim()).filter(Boolean),
              coverImage: newArticle.coverImage,
              portraitImage: newArticle.portraitImage
          });
          setNewArticle({ title: "", summary: "", content: "", author: "Admin", tags: "", coverImage: "", portraitImage: "" });
      }
  };

  // Helper to handle image file to base64
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'coverImage' | 'portraitImage') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewArticle(prev => ({ ...prev, [field]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-mythic-void text-foreground overflow-x-hidden font-tech selection:bg-primary/30 relative">
      <div className="fixed inset-0 pointer-events-none z-10 overlay-vignette opacity-70" />
      <div className="fixed inset-0 pointer-events-none z-10 overlay-scanline opacity-20" />
      <div className="fixed inset-0 pointer-events-none z-10 overlay-noise opacity-30 mix-blend-overlay" />

      <div className="relative z-20 container mx-auto p-4 md:p-8 max-w-7xl">
        {/* Header */}
        <div className="flex justify-between items-end mb-8 border-b border-primary/20 pb-4">
            <div className="flex flex-col">
                <h1 className="font-mythic text-4xl text-primary tracking-[0.2em] drop-shadow-[0_0_15px_rgba(212,175,55,0.5)]">
                    PANTHEON<span className="text-foreground">EXUS</span>
                </h1>
                <div className="flex items-center gap-2">
                    <span className="font-tech text-xs text-muted-foreground tracking-[0.5em] uppercase">Admin Console v2.0</span>
                </div>
            </div>
            <div className="flex gap-4">
              <Link href="/character-sheet/victorious-sun">
                <button className="flex items-center gap-2 text-[10px] font-mythic uppercase tracking-widest text-primary border border-primary/30 px-3 py-1 hover:bg-primary/10 transition-colors rounded-sm">
                  <LayoutGrid className="w-3 h-3" /> Character Sheet
                </button>
              </Link>
              <Link href="/">
                <button className="flex items-center gap-2 text-[10px] font-mythic uppercase tracking-widest text-primary border border-primary/30 px-3 py-1 hover:bg-primary/10 transition-colors rounded-sm">
                   Return Home
                </button>
              </Link>
            </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-4 mb-8">
            <button 
                onClick={() => setActiveTab("scrolls")}
                className={cn(
                    "flex items-center gap-2 px-6 py-2 text-xs uppercase tracking-[0.2em] font-mythic border rounded-sm transition-all",
                    activeTab === "scrolls" 
                        ? "bg-primary/20 border-primary text-primary shadow-[0_0_10px_rgba(212,175,55,0.2)]" 
                        : "bg-black/40 border-white/10 text-muted-foreground hover:border-primary/40 hover:text-primary/70"
                )}
            >
                <Scroll className="w-4 h-4" /> Scroll Management
            </button>
            <button 
                onClick={() => setActiveTab("alleybrary")}
                className={cn(
                    "flex items-center gap-2 px-6 py-2 text-xs uppercase tracking-[0.2em] font-mythic border rounded-sm transition-all",
                    activeTab === "alleybrary" 
                        ? "bg-primary/20 border-primary text-primary shadow-[0_0_10px_rgba(212,175,55,0.2)]" 
                        : "bg-black/40 border-white/10 text-muted-foreground hover:border-primary/40 hover:text-primary/70"
                )}
            >
                <FileText className="w-4 h-4" /> Alleybrary CMS
            </button>
            <button 
                onClick={() => setActiveTab("compendium")}
                className={cn(
                    "flex items-center gap-2 px-6 py-2 text-xs uppercase tracking-[0.2em] font-mythic border rounded-sm transition-all",
                    activeTab === "compendium" 
                        ? "bg-primary/20 border-primary text-primary shadow-[0_0_10px_rgba(212,175,55,0.2)]" 
                        : "bg-black/40 border-white/10 text-muted-foreground hover:border-primary/40 hover:text-primary/70"
                )}
            >
                <Book className="w-4 h-4" /> Compendium Registry
            </button>
        </div>

        {activeTab === "compendium" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Sub-navigation for Compendium */}
                <div className="lg:col-span-12 flex flex-wrap gap-2 mb-4">
                     {[
                         { id: "knacks", label: "Knacks", icon: Zap },
                         { id: "boons", label: "Boons", icon: Star },
                         { id: "virtues", label: "Virtues", icon: Shield },
                         { id: "natures", label: "Natures", icon: Heart },
                         { id: "callings", label: "Callings", icon: Crown }
                     ].map((tab) => (
                         <button
                            key={tab.id}
                            onClick={() => setCompendiumTab(tab.id as any)}
                            className={cn(
                                "flex items-center gap-2 px-4 py-1.5 text-[10px] uppercase tracking-[0.2em] font-mythic border rounded-sm transition-all",
                                compendiumTab === tab.id
                                    ? "bg-primary/20 border-primary text-primary"
                                    : "bg-black/30 border-white/10 text-muted-foreground hover:border-primary/40"
                            )}
                         >
                             <tab.icon className="w-3 h-3" /> {tab.label}
                         </button>
                     ))}
                </div>

                {/* Left Panel: Input Form */}
                <div className="lg:col-span-4">
                    <SectionFrame title={`Register ${compendiumTab}`} subHeader="Database Entry">
                        {compendiumTab === "knacks" && (
                             <div className="space-y-4">
                                <ScionInput label="Knack Name" placeholder="e.g. Cat's Grace" value={newKnack.name} onChange={e => setNewKnack({...newKnack, name: e.target.value})} />
                                <ScionInput label="Epic Attribute" placeholder="e.g. Dexterity" value={newKnack.epicAttribute} onChange={e => setNewKnack({...newKnack, epicAttribute: e.target.value})} />
                                <ScionInput label="Prerequisite" placeholder="e.g. None" value={newKnack.prerequisite} onChange={e => setNewKnack({...newKnack, prerequisite: e.target.value})} />
                                <div className="flex flex-col gap-1 w-full">
                                    <label className="text-[10px] uppercase tracking-widest text-primary/70 font-mythic">Description</label>
                                    <textarea className="bg-black/20 border border-white/10 rounded-sm px-3 py-2 text-sm font-tech text-foreground outline-none focus:border-primary/50 h-24 resize-none" value={newKnack.description} onChange={e => setNewKnack({...newKnack, description: e.target.value})} />
                                </div>
                                <button onClick={handleAddKnack} className="w-full mt-2 bg-primary/10 hover:bg-primary/20 border border-primary/40 text-primary py-2 px-4 rounded-sm flex items-center justify-center gap-2 uppercase tracking-widest font-mythic text-xs"><Plus className="w-3 h-3" /> Add Knack</button>
                             </div>
                        )}
                        {compendiumTab === "boons" && (
                             <div className="space-y-4">
                                <ScionInput label="Boon Name" placeholder="e.g. Sky's Grace" value={newBoon.name} onChange={e => setNewBoon({...newBoon, name: e.target.value})} />
                                <div className="grid grid-cols-2 gap-4">
                                    <ScionInput label="Purview" placeholder="e.g. Sky" value={newBoon.purview} onChange={e => setNewBoon({...newBoon, purview: e.target.value})} />
                                    <div className="flex flex-col gap-1">
                                         <label className="text-[10px] uppercase tracking-widest text-primary/70 font-mythic">Level</label>
                                         <input type="number" min="1" max="10" className="bg-black/20 border border-white/10 rounded-sm px-3 py-2 text-sm font-tech text-foreground" value={newBoon.level} onChange={e => setNewBoon({...newBoon, level: parseInt(e.target.value)})} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <ScionInput label="Cost" placeholder="e.g. 1 Legend" value={newBoon.cost} onChange={e => setNewBoon({...newBoon, cost: e.target.value})} />
                                    <ScionInput label="Type" placeholder="e.g. Reflexive" value={newBoon.type} onChange={e => setNewBoon({...newBoon, type: e.target.value})} />
                                </div>
                                <div className="flex flex-col gap-1 w-full">
                                    <label className="text-[10px] uppercase tracking-widest text-primary/70 font-mythic">Description</label>
                                    <textarea className="bg-black/20 border border-white/10 rounded-sm px-3 py-2 text-sm font-tech text-foreground outline-none focus:border-primary/50 h-24 resize-none" value={newBoon.description} onChange={e => setNewBoon({...newBoon, description: e.target.value})} />
                                </div>
                                <button onClick={handleAddBoon} className="w-full mt-2 bg-primary/10 hover:bg-primary/20 border border-primary/40 text-primary py-2 px-4 rounded-sm flex items-center justify-center gap-2 uppercase tracking-widest font-mythic text-xs"><Plus className="w-3 h-3" /> Add Boon</button>
                             </div>
                        )}
                        {compendiumTab === "virtues" && (
                             <div className="space-y-4">
                                <ScionInput label="Virtue Name" placeholder="e.g. Valor" value={newVirtue.name} onChange={e => setNewVirtue({...newVirtue, name: e.target.value})} />
                                <div className="flex flex-col gap-1 w-full">
                                    <label className="text-[10px] uppercase tracking-widest text-primary/70 font-mythic">Description</label>
                                    <textarea className="bg-black/20 border border-white/10 rounded-sm px-3 py-2 text-sm font-tech text-foreground outline-none focus:border-primary/50 h-24 resize-none" value={newVirtue.description} onChange={e => setNewVirtue({...newVirtue, description: e.target.value})} />
                                </div>
                                <button onClick={handleAddVirtue} className="w-full mt-2 bg-primary/10 hover:bg-primary/20 border border-primary/40 text-primary py-2 px-4 rounded-sm flex items-center justify-center gap-2 uppercase tracking-widest font-mythic text-xs"><Plus className="w-3 h-3" /> Add Virtue</button>
                             </div>
                        )}
                        {compendiumTab === "natures" && (
                             <div className="space-y-4">
                                <ScionInput label="Nature / Archetype" placeholder="e.g. Architect" value={newNature.name} onChange={e => setNewNature({...newNature, name: e.target.value})} />
                                <div className="flex flex-col gap-1 w-full">
                                    <label className="text-[10px] uppercase tracking-widest text-primary/70 font-mythic">Description</label>
                                    <textarea className="bg-black/20 border border-white/10 rounded-sm px-3 py-2 text-sm font-tech text-foreground outline-none focus:border-primary/50 h-24 resize-none" value={newNature.description} onChange={e => setNewNature({...newNature, description: e.target.value})} />
                                </div>
                                <button onClick={handleAddNature} className="w-full mt-2 bg-primary/10 hover:bg-primary/20 border border-primary/40 text-primary py-2 px-4 rounded-sm flex items-center justify-center gap-2 uppercase tracking-widest font-mythic text-xs"><Plus className="w-3 h-3" /> Add Nature</button>
                             </div>
                        )}
                        {compendiumTab === "callings" && (
                             <div className="space-y-4">
                                <ScionInput label="Calling Name" placeholder="e.g. Warrior" value={newCalling.name} onChange={e => setNewCalling({...newCalling, name: e.target.value})} />
                                <div className="flex flex-col gap-1 w-full">
                                    <label className="text-[10px] uppercase tracking-widest text-primary/70 font-mythic">Description</label>
                                    <textarea className="bg-black/20 border border-white/10 rounded-sm px-3 py-2 text-sm font-tech text-foreground outline-none focus:border-primary/50 h-24 resize-none" value={newCalling.description} onChange={e => setNewCalling({...newCalling, description: e.target.value})} />
                                </div>
                                <button onClick={handleAddCalling} className="w-full mt-2 bg-primary/10 hover:bg-primary/20 border border-primary/40 text-primary py-2 px-4 rounded-sm flex items-center justify-center gap-2 uppercase tracking-widest font-mythic text-xs"><Plus className="w-3 h-3" /> Add Calling</button>
                             </div>
                        )}
                    </SectionFrame>
                </div>

                {/* Right Panel: List */}
                <div className="lg:col-span-8">
                    <SectionFrame title={`Registered ${compendiumTab}`} subHeader="Active Records">
                         <div className="space-y-3 max-h-[600px] overflow-y-auto scion-scrollbar pr-2">
                            {compendiumTab === "knacks" && knacks.map(item => (
                                <div key={item.id} className="p-3 bg-black/30 border border-white/5 rounded-sm hover:border-primary/30 group">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-mythic text-primary text-sm">{item.name}</h4>
                                            <div className="flex gap-2 text-[10px] text-muted-foreground uppercase mb-1">
                                                <span>{item.epicAttribute}</span>
                                                {item.prerequisite && <span>• Req: {item.prerequisite}</span>}
                                            </div>
                                            <p className="text-xs text-muted-foreground/80 font-serif">{item.description}</p>
                                        </div>
                                        <button onClick={() => deleteKnack(item.id)} className="text-destructive/50 hover:text-destructive"><Trash2 className="w-3 h-3" /></button>
                                    </div>
                                </div>
                            ))}
                            {compendiumTab === "boons" && boons.map(item => (
                                <div key={item.id} className="p-3 bg-black/30 border border-white/5 rounded-sm hover:border-primary/30 group">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-mythic text-primary text-sm">{item.name} <span className="text-muted-foreground ml-2 text-[10px] tracking-wider">Lvl {item.level}</span></h4>
                                            <div className="flex gap-2 text-[10px] text-muted-foreground uppercase mb-1">
                                                <span className="text-primary/70">{item.purview}</span>
                                                <span>• {item.cost}</span>
                                                <span>• {item.type}</span>
                                            </div>
                                            <p className="text-xs text-muted-foreground/80 font-serif">{item.description}</p>
                                        </div>
                                        <button onClick={() => deleteBoon(item.id)} className="text-destructive/50 hover:text-destructive"><Trash2 className="w-3 h-3" /></button>
                                    </div>
                                </div>
                            ))}
                            {(compendiumTab === "virtues" ? virtues : compendiumTab === "natures" ? natures : compendiumTab === "callings" ? callings : []).map((item: any) => (
                                <div key={item.id} className="p-3 bg-black/30 border border-white/5 rounded-sm hover:border-primary/30 group">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-mythic text-primary text-sm">{item.name}</h4>
                                            <p className="text-xs text-muted-foreground/80 font-serif mt-1">{item.description}</p>
                                        </div>
                                        <button onClick={() => compendiumTab === "virtues" ? deleteVirtue(item.id) : compendiumTab === "natures" ? deleteNature(item.id) : deleteCalling(item.id)} className="text-destructive/50 hover:text-destructive"><Trash2 className="w-3 h-3" /></button>
                                    </div>
                                </div>
                            ))}
                            
                            {/* Empty State */}
                            {((compendiumTab === "knacks" && knacks.length === 0) || 
                              (compendiumTab === "boons" && boons.length === 0) ||
                              (compendiumTab === "virtues" && virtues.length === 0) ||
                              (compendiumTab === "natures" && natures.length === 0) ||
                              (compendiumTab === "callings" && callings.length === 0)) && (
                                <div className="text-center py-8 text-muted-foreground/50 font-tech text-xs uppercase tracking-widest border border-dashed border-white/10">
                                    No records found in this registry.
                                </div>
                            )}
                         </div>
                    </SectionFrame>
                </div>
            </div>
        )}

        {activeTab === "scrolls" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Create New Scroll Panel */}
            <div className="lg:col-span-4">
                <SectionFrame title="Initialize Scroll" subHeader="New Character Entry">
                    <div className="space-y-4">
                    <ScionInput 
                        label="Character Designation" 
                        placeholder="e.g. Victorious Sun" 
                        value={newScroll.name}
                        onChange={(e) => setNewScroll({...newScroll, name: e.target.value})}
                    />
                    <ScionInput 
                        label="Player Identity" 
                        placeholder="Player Name"
                        value={newScroll.player}
                        onChange={(e) => setNewScroll({...newScroll, player: e.target.value})}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <ScionInput 
                            label="Pantheon" 
                            placeholder="e.g. Theoi" 
                            value={newScroll.pantheon}
                            onChange={(e) => setNewScroll({...newScroll, pantheon: e.target.value})}
                        />
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] uppercase tracking-widest text-primary/70 font-mythic">Legend Rank</label>
                            <div className="flex items-center h-[38px] bg-black/20 border border-white/10 rounded-sm px-3">
                            <input 
                                type="range" 
                                min="1" 
                                max="12" 
                                className="w-full accent-primary h-1 bg-primary/20 rounded-lg appearance-none cursor-pointer"
                                value={newScroll.legend}
                                onChange={(e) => setNewScroll({...newScroll, legend: parseInt(e.target.value)})}
                            />
                            <span className="ml-3 font-mythic text-primary text-lg w-6 text-center">{newScroll.legend}</span>
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={handleAddScroll}
                        className="w-full mt-4 bg-primary/10 hover:bg-primary/20 border border-primary/40 text-primary py-3 px-4 rounded-sm flex items-center justify-center gap-2 uppercase tracking-widest font-mythic text-sm transition-all hover:shadow-[0_0_15px_rgba(212,175,55,0.2)]"
                    >
                        <Plus className="w-4 h-4" /> Create Scroll
                    </button>
                    </div>
                </SectionFrame>
            </div>

            {/* Active Scrolls List */}
            <div className="lg:col-span-8">
                <SectionFrame title="Active Scrolls" subHeader="Database Records">
                    <div className="grid grid-cols-1 gap-4">
                    {scrolls.map((scroll) => (
                        <div key={scroll.id} className="group relative flex items-center justify-between p-4 bg-black/30 border border-white/5 hover:border-primary/40 transition-all rounded-sm hover:bg-black/50">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-black/40 border border-primary/20 flex items-center justify-center rounded-sm">
                                <Scroll className="w-6 h-6 text-primary/60" />
                                </div>
                                <div>
                                <h4 className="font-mythic text-lg text-primary tracking-wide">{scroll.name}</h4>
                                <div className="flex items-center gap-4 text-[10px] text-muted-foreground font-code uppercase tracking-wider">
                                    <span className="flex items-center gap-1"><User className="w-3 h-3" /> {scroll.player}</span>
                                    <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> {scroll.pantheon}</span>
                                </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-6">
                                <div className="flex flex-col items-end">
                                <span className="text-[9px] uppercase tracking-widest text-primary/50">Legend</span>
                                <span className="font-mythic text-2xl text-primary">{scroll.legend}</span>
                                </div>
                                
                                <div className="h-8 w-px bg-white/10 mx-2" />
                                
                                <div className="flex gap-2">
                                <Link href={`/character-sheet/${scroll.name.toLowerCase().replace(/\s+/g, '-')}`}>
                                    <button className="p-2 hover:bg-white/5 rounded-sm text-muted-foreground hover:text-primary transition-colors">
                                        <Star className="w-4 h-4" />
                                    </button>
                                </Link>
                                <button 
                                    onClick={() => handleDeleteScroll(scroll.id)}
                                    className="p-2 hover:bg-red-900/20 rounded-sm text-muted-foreground hover:text-destructive transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {scrolls.length === 0 && (
                        <div className="p-8 text-center border border-dashed border-white/10 rounded-sm text-muted-foreground">
                            No scrolls active in the database.
                        </div>
                    )}
                    </div>
                </SectionFrame>
            </div>

            </div>
        )}
        
        {activeTab === "alleybrary" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                 {/* Publish Article Panel */}
                 <div className="lg:col-span-5">
                    <SectionFrame title="Publish to Alleybrary" subHeader="Content Management">
                        <div className="space-y-4">
                            <ScionInput 
                                label="Headline" 
                                placeholder="Article Title"
                                value={newArticle.title}
                                onChange={(e) => setNewArticle({...newArticle, title: e.target.value})}
                            />
                            
                            <div className="flex flex-col gap-1 w-full">
                                <label className="text-[10px] uppercase tracking-widest text-primary/70 font-mythic">Abstract</label>
                                <textarea 
                                    className="bg-black/20 border border-white/10 rounded-sm px-3 py-2 text-sm font-tech text-foreground outline-none focus:border-primary/50 placeholder:text-muted-foreground/30 transition-colors h-20 resize-none"
                                    placeholder="Brief summary..."
                                    value={newArticle.summary}
                                    onChange={(e) => setNewArticle({...newArticle, summary: e.target.value})}
                                />
                            </div>

                            <div className="flex flex-col gap-1 w-full">
                                <label className="text-[10px] uppercase tracking-widest text-primary/70 font-mythic">Full Content</label>
                                <textarea 
                                    className="bg-black/20 border border-white/10 rounded-sm px-3 py-2 text-sm font-tech text-foreground outline-none focus:border-primary/50 placeholder:text-muted-foreground/30 transition-colors h-40 resize-y"
                                    placeholder="Article body content..."
                                    value={newArticle.content}
                                    onChange={(e) => setNewArticle({...newArticle, content: e.target.value})}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <ScionInput 
                                    label="Author Alias" 
                                    placeholder="Admin"
                                    value={newArticle.author}
                                    onChange={(e) => setNewArticle({...newArticle, author: e.target.value})}
                                />
                                <ScionInput 
                                    label="Tags (Comma Separated)" 
                                    placeholder="News, Alert..."
                                    value={newArticle.tags}
                                    onChange={(e) => setNewArticle({...newArticle, tags: e.target.value})}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                               <div className="flex flex-col gap-1 w-full">
                                  <label className="text-[10px] uppercase tracking-widest text-primary/70 font-mythic">Cover Image</label>
                                  <div className="bg-black/20 border border-white/10 rounded-sm p-2 flex items-center justify-between">
                                     <span className="text-[9px] text-muted-foreground truncate w-20">{newArticle.coverImage ? "Image Loaded" : "No Image"}</span>
                                     <label className="cursor-pointer bg-primary/10 hover:bg-primary/20 text-primary px-2 py-1 rounded-sm text-[9px] uppercase tracking-widest transition-colors">
                                        Upload
                                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'coverImage')} />
                                     </label>
                                  </div>
                               </div>
                               <div className="flex flex-col gap-1 w-full">
                                  <label className="text-[10px] uppercase tracking-widest text-primary/70 font-mythic">Portrait Image</label>
                                  <div className="bg-black/20 border border-white/10 rounded-sm p-2 flex items-center justify-between">
                                     <span className="text-[9px] text-muted-foreground truncate w-20">{newArticle.portraitImage ? "Image Loaded" : "No Image"}</span>
                                     <label className="cursor-pointer bg-primary/10 hover:bg-primary/20 text-primary px-2 py-1 rounded-sm text-[9px] uppercase tracking-widest transition-colors">
                                        Upload
                                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'portraitImage')} />
                                     </label>
                                  </div>
                               </div>
                            </div>

                            <button 
                                onClick={handlePublishArticle}
                                className="w-full mt-2 bg-primary/10 hover:bg-primary/20 border border-primary/40 text-primary py-3 px-4 rounded-sm flex items-center justify-center gap-2 uppercase tracking-widest font-mythic text-sm transition-all hover:shadow-[0_0_15px_rgba(212,175,55,0.2)]"
                            >
                                <Send className="w-4 h-4" /> Publish Transmission
                            </button>
                        </div>
                    </SectionFrame>
                 </div>

                 {/* Recent Articles List */}
                 <div className="lg:col-span-7">
                    <SectionFrame title="Transmission Log" subHeader="Recent Posts">
                        <div className="space-y-4 max-h-[600px] overflow-y-auto scion-scrollbar pr-2">
                             {articles.map(article => (
                                 <div key={article.id} className="p-4 bg-black/30 border border-white/5 rounded-sm group hover:border-primary/30 transition-colors">
                                     <div className="flex justify-between items-start mb-2">
                                         <h4 className="font-mythic text-primary tracking-wide text-lg">{article.title}</h4>
                                         <button 
                                            onClick={() => deleteArticle(article.id)}
                                            className="text-destructive/50 hover:text-destructive transition-colors p-1"
                                         >
                                             <Trash2 className="w-4 h-4" />
                                         </button>
                                     </div>
                                     <p className="text-xs text-muted-foreground font-tech mb-3 line-clamp-2">{article.summary}</p>
                                     <div className="flex items-center gap-3 text-[10px] text-primary/50 font-code uppercase">
                                         <span>{article.date}</span>
                                         <span>//</span>
                                         <span>{article.author}</span>
                                         <div className="flex gap-1 ml-auto">
                                             {article.tags.map(t => (
                                                 <span key={t} className="bg-white/5 px-1.5 py-0.5 rounded-[1px]">{t}</span>
                                             ))}
                                         </div>
                                     </div>
                                 </div>
                             ))}
                             {articles.length === 0 && (
                                <div className="text-center py-10 text-muted-foreground/50 font-tech text-xs uppercase tracking-widest">
                                    No transmissions logged.
                                </div>
                             )}
                        </div>
                    </SectionFrame>
                 </div>
            </div>
        )}

      </div>
    </div>
  );
}

