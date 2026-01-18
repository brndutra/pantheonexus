import { useState, useEffect } from 'react';

export interface Knack {
  id: number;
  name: string;
  description: string;
  prerequisite?: string;
  epicAttribute?: string;
}

export interface Boon {
  id: number;
  name: string;
  purview: string;
  level: number;
  cost: string;
  type: string; // e.g., Simple, Reflexive
  description: string;
}

export interface Virtue {
  id: number;
  name: string;
  description: string;
}

export interface Nature {
  id: number;
  name: string;
  description: string;
}

export interface Calling {
  id: number;
  name: string;
  description: string;
}

const STORAGE_KEY = 'pantheonexus_compendium';

export const useCompendium = () => {
  const [knacks, setKnacks] = useState<Knack[]>([]);
  const [boons, setBoons] = useState<Boon[]>([]);
  const [virtues, setVirtues] = useState<Virtue[]>([]);
  const [natures, setNatures] = useState<Nature[]>([]);
  const [callings, setCallings] = useState<Calling[]>([]);

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      setKnacks(parsed.knacks || []);
      setBoons(parsed.boons || []);
      setVirtues(parsed.virtues || []);
      setNatures(parsed.natures || []);
      setCallings(parsed.callings || []);
    } else {
        // Initialize with some example data if empty
        const initialKnacks = [
            { id: 1, name: "Cat's Grace", description: "The Scion possesses perfect balance and cannot be knocked down.", epicAttribute: "Dexterity" }
        ];
        const initialBoons = [
            { id: 1, name: "Sky's Grace", purview: "Sky", level: 1, cost: "None", type: "Passive", description: "The Scion takes no damage from falling." }
        ];
        const initialCallings = [
            { id: 1, name: "Warrior", description: "One who fights." },
            { id: 2, name: "Guardian", description: "One who protects." },
            { id: 3, name: "Healer", description: "One who mends." },
            { id: 4, name: "Leader", description: "One who commands." },
            { id: 5, name: "Sage", description: "One who knows." },
            { id: 6, name: "Trickster", description: "One who deceives." },
            { id: 7, name: "Judge", description: "One who decides." },
            { id: 8, name: "Hunter", description: "One who pursues." },
            { id: 9, name: "Lover", description: "One who connects." },
            { id: 10, name: "Creator", description: "One who makes." },
        ];
        
        setKnacks(initialKnacks);
        setBoons(initialBoons);
        setCallings(initialCallings);
        
        saveAll(initialKnacks, initialBoons, [], [], initialCallings);
    }
  }, []);

  const saveAll = (newKnacks: Knack[], newBoons: Boon[], newVirtues: Virtue[], newNatures: Nature[], newCallings: Calling[]) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            knacks: newKnacks,
            boons: newBoons,
            virtues: newVirtues,
            natures: newNatures,
            callings: newCallings
        }));
      } catch (e) {
          console.error("Failed to save compendium", e);
          alert("Storage limit exceeded. Data might not persist.");
      }
  };

  const addKnack = (item: Omit<Knack, 'id'>) => {
    const newItem = { ...item, id: Date.now() };
    const updated = [...knacks, newItem];
    setKnacks(updated);
    saveAll(updated, boons, virtues, natures, callings);
  };

  const deleteKnack = (id: number) => {
    const updated = knacks.filter(i => i.id !== id);
    setKnacks(updated);
    saveAll(updated, boons, virtues, natures, callings);
  };

  const addBoon = (item: Omit<Boon, 'id'>) => {
    const newItem = { ...item, id: Date.now() };
    const updated = [...boons, newItem];
    setBoons(updated);
    saveAll(knacks, updated, virtues, natures, callings);
  };

  const deleteBoon = (id: number) => {
    const updated = boons.filter(i => i.id !== id);
    setBoons(updated);
    saveAll(knacks, updated, virtues, natures, callings);
  };

  const addVirtue = (item: Omit<Virtue, 'id'>) => {
    const newItem = { ...item, id: Date.now() };
    const updated = [...virtues, newItem];
    setVirtues(updated);
    saveAll(knacks, boons, updated, natures, callings);
  };

  const deleteVirtue = (id: number) => {
    const updated = virtues.filter(i => i.id !== id);
    setVirtues(updated);
    saveAll(knacks, boons, updated, natures, callings);
  };
  
  const addNature = (item: Omit<Nature, 'id'>) => {
    const newItem = { ...item, id: Date.now() };
    const updated = [...natures, newItem];
    setNatures(updated);
    saveAll(knacks, boons, virtues, updated, callings);
  };

  const deleteNature = (id: number) => {
    const updated = natures.filter(i => i.id !== id);
    setNatures(updated);
    saveAll(knacks, boons, virtues, updated, callings);
  };

  const addCalling = (item: Omit<Calling, 'id'>) => {
    const newItem = { ...item, id: Date.now() };
    const updated = [...callings, newItem];
    setCallings(updated);
    saveAll(knacks, boons, virtues, natures, updated);
  };

  const deleteCalling = (id: number) => {
    const updated = callings.filter(i => i.id !== id);
    setCallings(updated);
    saveAll(knacks, boons, virtues, natures, updated);
  };

  return { 
      knacks, addKnack, deleteKnack,
      boons, addBoon, deleteBoon,
      virtues, addVirtue, deleteVirtue,
      natures, addNature, deleteNature,
      callings, addCalling, deleteCalling
  };
};
