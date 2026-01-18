import React, { useState } from "react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { Plus, Trash2, Scroll, Shield, User, Star, LayoutGrid, FileText, Send } from "lucide-react";
import { useArticles } from "@/lib/articles-store";
import { useCharacters } from "@/lib/characters-store";
import textureBg from "@assets/generated_images/minimalist_gold_grid_background.png";
import cornerOrnament from "@assets/generated_images/tech_mythic_corner_ornament.png";
import darkGoldTexture from "@assets/generated_images/dark_gold_texture_background.png";

// Reusing style components for consistency
const SectionFrame = ({ children, title, className, subHeader }: { children: React.ReactNode, title: string, className?: string, subHeader?: string }) => (
  <div className={cn("border-2 border-primary/20 rounded-sm p-6 relative bg-black/40 backdrop-blur-md shadow-2xl overflow-hidden h-full", className)}>
    <img src={cornerOrnament} className="absolute top-0 left-0 w-16 h-16 opacity-30 rotate-0 pointer-events-none" alt="" />
    <img src={cornerOrnament} className="absolute top-0 right-0 w-16 h-16 opacity-30 rotate-90 pointer-events-none" alt="" />
    <img src={cornerOrnament} className="absolute bottom-0 right-0 w-16 h-16 opacity-30 rotate-180 pointer-events-none" alt="" />
    <img src={cornerOrnament} className="absolute bottom-0 left-0 w-16 h-16 opacity-30 -rotate-90 pointer-events-none" alt="" />

    <div className="flex justify-between items-start mb-6 border-b border-primary/30 pb-2 relative z-10">
       <div>
          <h3 className="font-mythic text-primary text-xl tracking-[0.15em] uppercase drop-shadow-md">{title}</h3>
          {subHeader && <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] mt-1 font-tech">{subHeader}</p>}
       </div>
    </div>
    <div className="relative z-10">
      {children}
    </div>
  </div>
);

const ScionInput = ({ label, className, as: Component = "input", ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label?: string, as?: any }) => (
  <div className="flex flex-col gap-1 w-full">
    {label && <label className="text-[10px] uppercase tracking-widest text-primary/70 font-mythic">{label}</label>}
    <Component 
      className={cn(
        "bg-black/20 border border-white/10 rounded-sm px-3 py-2 text-sm font-tech text-foreground outline-none focus:border-primary/50 placeholder:text-muted-foreground/30 transition-colors",
        className
      )}
      {...props} 
    />
  </div>
);

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"scrolls" | "alleybrary">("scrolls");

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
    <div 
      className="min-h-screen bg-black text-foreground overflow-x-hidden font-tech selection:bg-primary/30 relative"
      style={{
        backgroundImage: `url(${darkGoldTexture})`,
        backgroundSize: 'cover',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="fixed inset-0 pointer-events-none z-10 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_90%)]" />

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
        </div>

        {activeTab === "scrolls" ? (
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
                                <button className="p-2 hover:bg-white/5 rounded-sm text-muted-foreground hover:text-primary transition-colors">
                                    <Star className="w-4 h-4" />
                                </button>
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
        ) : (
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

