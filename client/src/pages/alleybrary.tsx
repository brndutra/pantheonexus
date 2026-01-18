import React, { useState } from "react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { ArrowLeft, BookOpen, Search, Tag, Calendar, User } from "lucide-react";
import { useArticles } from "@/lib/articles-store";
import textureBg from "@assets/generated_images/minimalist_gold_grid_background.png";
import cornerOrnament from "@assets/generated_images/mythological_corner_ornament.png";
import darkGoldTexture from "@assets/generated_images/dark_gold_texture_background.png";

const SectionFrame = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={cn("border border-primary/20 rounded-sm p-8 relative bg-black/60 backdrop-blur-md shadow-2xl overflow-hidden", className)}>
    <img src={cornerOrnament} className="absolute top-0 left-0 w-12 h-12 opacity-30 rotate-0 pointer-events-none" alt="" />
    <img src={cornerOrnament} className="absolute top-0 right-0 w-12 h-12 opacity-30 rotate-90 pointer-events-none" alt="" />
    <img src={cornerOrnament} className="absolute bottom-0 right-0 w-12 h-12 opacity-30 rotate-180 pointer-events-none" alt="" />
    <img src={cornerOrnament} className="absolute bottom-0 left-0 w-12 h-12 opacity-30 -rotate-90 pointer-events-none" alt="" />
    <div className="relative z-10">{children}</div>
  </div>
);

export default function Alleybrary() {
  const { articles } = useArticles();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Get all unique tags
  const allTags = Array.from(new Set(articles.flatMap(a => a.tags)));

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          article.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = selectedTag ? article.tags.includes(selectedTag) : true;
    return matchesSearch && matchesTag;
  });

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

      <div className="relative z-20 container mx-auto p-4 md:p-8 max-w-5xl">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-12 border-b border-primary/20 pb-6">
            <div className="flex flex-col">
                <h1 className="font-mythic text-4xl md:text-5xl text-primary tracking-[0.2em] drop-shadow-[0_0_15px_rgba(212,175,55,0.5)] flex items-center gap-4">
                    <BookOpen className="w-10 h-10" />
                    ALLEY<span className="text-foreground">BRARY</span>
                </h1>
                <p className="font-tech text-xs text-muted-foreground tracking-[0.4em] uppercase mt-2 ml-1">
                    Forbidden Archives // Access Granted
                </p>
            </div>
            <Link href="/">
              <button className="flex items-center gap-2 text-[10px] font-mythic uppercase tracking-widest text-primary border border-primary/30 px-4 py-2 hover:bg-primary/10 transition-colors rounded-sm group">
                <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" /> Return
              </button>
            </Link>
        </div>

        {/* Search & Filter */}
        <div className="mb-8 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
           <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/50" />
              <input 
                 className="w-full bg-black/40 border border-primary/20 rounded-sm pl-10 pr-4 py-3 text-sm font-tech text-foreground outline-none focus:border-primary/50 placeholder:text-muted-foreground/30 transition-all focus:bg-black/60 focus:shadow-[0_0_15px_rgba(212,175,55,0.1)]"
                 placeholder="Search the archives..."
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
           
           <div className="flex flex-wrap gap-2">
              <button 
                 onClick={() => setSelectedTag(null)}
                 className={cn(
                    "px-3 py-1 text-[10px] uppercase tracking-wider font-mythic border rounded-sm transition-all",
                    selectedTag === null ? "bg-primary/20 border-primary text-primary" : "bg-black/20 border-white/10 text-muted-foreground hover:border-primary/30"
                 )}
              >
                 All
              </button>
              {allTags.map(tag => (
                 <button 
                    key={tag}
                    onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                    className={cn(
                       "px-3 py-1 text-[10px] uppercase tracking-wider font-mythic border rounded-sm transition-all",
                       selectedTag === tag ? "bg-primary/20 border-primary text-primary" : "bg-black/20 border-white/10 text-muted-foreground hover:border-primary/30"
                    )}
                 >
                    {tag}
                 </button>
              ))}
           </div>
        </div>

        {/* Articles Feed */}
        <div className="space-y-6">
           {filteredArticles.length > 0 ? (
             filteredArticles.map((article) => (
                <SectionFrame key={article.id} className="group hover:border-primary/40 transition-colors">
                   <div className="flex flex-col gap-4">
                      <div className="flex justify-between items-start border-b border-white/5 pb-4">
                         <div>
                            <div className="flex gap-2 mb-2">
                               {article.tags.map(tag => (
                                  <span key={tag} className="text-[9px] font-code bg-primary/10 text-primary px-2 py-0.5 rounded-sm uppercase tracking-wider border border-primary/20">
                                     {tag}
                                  </span>
                               ))}
                            </div>
                            <h2 className="font-mythic text-2xl text-primary tracking-wide mb-1 group-hover:text-white transition-colors">
                               {article.title}
                            </h2>
                            <p className="font-tech text-sm text-muted-foreground/80 italic">
                               {article.summary}
                            </p>
                         </div>
                         <div className="text-right">
                            <div className="flex items-center justify-end gap-1 text-[10px] text-primary/60 font-code uppercase mb-1">
                               <Calendar className="w-3 h-3" /> {article.date}
                            </div>
                            <div className="flex items-center justify-end gap-1 text-[10px] text-muted-foreground/60 font-code uppercase">
                               <User className="w-3 h-3" /> {article.author}
                            </div>
                         </div>
                      </div>
                      
                      <div className="font-serif text-foreground/80 leading-relaxed text-sm md:text-base whitespace-pre-wrap">
                         {article.content}
                      </div>
                   </div>
                </SectionFrame>
             ))
           ) : (
             <div className="text-center py-20 border border-dashed border-primary/20 rounded-sm bg-black/20">
                <BookOpen className="w-12 h-12 text-primary/20 mx-auto mb-4" />
                <p className="font-mythic text-xl text-primary/40 tracking-widest uppercase">No Records Found</p>
                <p className="font-tech text-xs text-muted-foreground mt-2">Adjust your search parameters or query the Oracle.</p>
             </div>
           )}
        </div>
        
      </div>
    </div>
  );
}
