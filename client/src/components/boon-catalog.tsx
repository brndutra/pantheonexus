import React, { useState, useEffect } from 'react';
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Sparkles, Dice5, Zap, Plus, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { Boon } from "@shared/schema";

const isValid = (val: any) => {
    if (val === null || val === undefined) return false;
    if (typeof val === 'string') {
        const trimmed = val.trim();
        return trimmed !== '' && trimmed !== '—' && trimmed !== '-' && trimmed.toLowerCase() !== 'none';
    }
    return true;
};

interface BoonCardProps {
    boon: Boon;
    onSelect?: (boon: Boon) => void;
    isSelected?: boolean;
}

export const BoonCard = ({ boon, onSelect, isSelected }: BoonCardProps) => {
    const name = boon.name || "Unknown Boon";
    const tier = boon.level || 1;
    const cost = boon.cost;
    const dicePool = boon.dicePool;
    const description = boon.description || boon.effect;
    const duration = boon.duration;
    const purview = boon.purview;

    return (
        <div className={cn(
            "bg-[#1c1917] border p-5 rounded-sm mb-4 transition-colors group relative overflow-hidden flex flex-col gap-4",
            isSelected ? "border-green-500/50 bg-green-900/10" : "border-[#333] hover:border-[#E3963E]/50"
        )}>
            
            {onSelect && (
                <div className="absolute top-4 right-4 z-20">
                    <Button 
                        size="sm" 
                        variant={isSelected ? "default" : "secondary"}
                        onClick={() => onSelect(boon)}
                        className={cn(
                            "h-7 text-xs uppercase font-bold tracking-wider",
                            isSelected ? "bg-green-600 hover:bg-green-700 text-white" : "bg-[#333] hover:bg-[#E3963E] text-gray-300 hover:text-black"
                        )}
                    >
                        {isSelected ? <><Check size={12} className="mr-1" /> Added</> : <><Plus size={12} className="mr-1" /> Select</>}
                    </Button>
                </div>
            )}

            <div className="flex justify-between items-start border-b border-[#333] pb-3 pr-24">
                <div>
                    <h4 className="text-[#E3963E] font-display text-xl uppercase tracking-wider leading-none flex items-center gap-2">
                        {name}
                    </h4>
                    <span className="text-[10px] text-gray-500 font-code uppercase tracking-widest mt-1 block">
                        Level {tier} {purview && `// ${purview}`} {duration && `// ${duration}`}
                    </span>
                </div>
                {purview && (
                     <Badge variant="outline" className="text-[9px] border-[#E3963E]/30 text-[#E3963E]">{purview}</Badge>
                )}
            </div>

            <div className="flex gap-2">
                <div className="flex-1 bg-black/40 rounded border border-[#333] p-2 flex flex-col items-center justify-center min-h-[60px]">
                    <div className="flex items-center gap-1 mb-1">
                        <Zap size={12} className="text-[#E3963E]" />
                        <span className="text-[9px] text-gray-500 uppercase font-bold">Cost</span>
                    </div>
                    <span className="text-xs text-white font-mono text-center leading-tight">
                        {isValid(cost) ? cost : "None"}
                    </span>
                </div>
                
                <div className="flex-1 bg-black/40 rounded border border-[#333] p-2 flex flex-col items-center justify-center min-h-[60px]">
                    <div className="flex items-center gap-1 mb-1">
                        <Dice5 size={12} className="text-blue-400" />
                        <span className="text-[9px] text-gray-500 uppercase font-bold">Dice Pool</span>
                    </div>
                    <span className="text-xs text-white font-mono text-center leading-tight">
                        {isValid(dicePool) ? dicePool : "None"}
                    </span>
                </div>

            </div>

            <div className="text-sm text-gray-300 leading-relaxed font-serif whitespace-pre-wrap bg-[#0c0a09]/50 p-3 rounded border border-[#333]/50">
                {description || "No description provided."}
            </div>
            
            {(() => {
                const prereqs = boon.prerequisites as any[] | null;
                if (!prereqs || !Array.isArray(prereqs) || prereqs.length === 0) return null;
                const prereqStr = prereqs.map((p: any) => typeof p === 'object' ? String(p.name) : String(p)).join(", ");
                return (
                    <div className="text-[10px] text-gray-500 font-mono pt-2 border-t border-[#333]/50">
                        REQ: {prereqStr}
                    </div>
                );
            })()}
        </div>
    );
};

interface BoonsCatalogModalProps {
    isOpen: boolean;
    onClose: (open: boolean) => void;
    purview?: string;
    onAddBoon?: (boon: Boon) => void;
    currentBoons?: string[];
}

export const BoonsCatalogModal = ({ isOpen, onClose, purview, onAddBoon, currentBoons = [] }: BoonsCatalogModalProps) => {
    const [boons, setBoons] = useState<Boon[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [filterPurview, setFilterPurview] = useState(purview || 'All');
    const [availablePurviews, setAvailablePurviews] = useState<string[]>([]);

    useEffect(() => {
        if (isOpen) {
            setFilterPurview(purview || 'All');
            fetchBoons();
        } else {
            setBoons([]);
            setError(null);
        }
    }, [isOpen, purview]);

    const fetchBoons = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/boons');
            if (!response.ok) throw new Error('Failed to fetch boons');
            const data = await response.json();
            setBoons(data || []);
            
            const purviewSet = new Set<string>();
            data.forEach((b: Boon) => { if (b.purview) purviewSet.add(b.purview); });
            const purviews = Array.from(purviewSet).sort();
            setAvailablePurviews(purviews);

        } catch (err: any) {
            console.error("Error fetching boons:", err);
            setError(`Failed to load boons: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const filteredBoons = boons.filter(b => {
        const matchesSearch = !search || 
            b.name.toLowerCase().includes(search.toLowerCase()) || 
            (b.description && b.description.toLowerCase().includes(search.toLowerCase()));
        
        const matchesPurview = filterPurview === 'All' || 
            (b.purview && b.purview.toLowerCase().includes(filterPurview.toLowerCase()));

        return matchesSearch && matchesPurview;
    });

    const handleSelect = (boon: Boon) => {
        if (onAddBoon) {
            onAddBoon(boon);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl h-[85vh] bg-[#0c0a09] border-[#333] p-0 flex flex-col overflow-hidden text-white shadow-2xl shadow-black/90 z-[9999]">
                <DialogHeader className="p-6 border-b border-[#333] bg-[#111] flex-shrink-0">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                             <div className="w-12 h-12 rounded-full bg-[#E3963E]/10 flex items-center justify-center border border-[#E3963E]/30 shadow-[0_0_15px_rgba(227,150,62,0.2)]">
                                <Sparkles size={24} className="text-[#E3963E]" />
                             </div>
                             <div>
                                <DialogTitle className="text-3xl font-display uppercase tracking-widest text-white">
                                    Divine <span className="text-[#E3963E]">Boons</span>
                                </DialogTitle>
                                <DialogDescription className="text-gray-500 font-code uppercase tracking-wider text-xs">
                                    Capital Domain Registry
                                </DialogDescription>
                             </div>
                        </div>

                        <div className="flex gap-2 items-center">
                            <Select value={filterPurview} onValueChange={setFilterPurview}>
                                <SelectTrigger className="w-[160px] bg-[#000] border-[#333] text-xs h-9 uppercase font-bold">
                                    <SelectValue placeholder="All Domains" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#111] border-[#333] max-h-[300px]">
                                    <SelectItem value="All">All Domains</SelectItem>
                                    {availablePurviews.map(p => (
                                        <SelectItem key={p} value={p}>{p}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <div className="relative w-48">
                                <Input 
                                    placeholder="Search power..." 
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="bg-[#000] border-[#333] text-xs h-9 pr-8"
                                />
                                <div className="absolute right-2 top-2.5 text-gray-500 pointer-events-none">
                                    <Sparkles size={12} />
                                </div>
                            </div>
                        </div>
                    </div>
                </DialogHeader>
                
                <ScrollArea className="flex-1 p-6">
                    {loading && (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-8 h-8 animate-spin text-[#E3963E]" />
                        </div>
                    )}
                    
                    {error && (
                        <div className="text-red-400 text-center py-10">
                            {error}
                        </div>
                    )}
                    
                    {!loading && !error && filteredBoons.length === 0 && (
                        <div className="text-gray-500 text-center py-10">
                            No boons found matching your criteria.
                        </div>
                    )}
                    
                    {!loading && !error && filteredBoons.map(boon => (
                        <BoonCard 
                            key={boon.id} 
                            boon={boon} 
                            onSelect={onAddBoon ? handleSelect : undefined}
                            isSelected={currentBoons.includes(boon.name)}
                        />
                    ))}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
};

export default BoonsCatalogModal;
