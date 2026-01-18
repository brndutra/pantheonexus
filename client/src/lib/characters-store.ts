import { useState, useEffect } from 'react';

export interface CharacterScroll {
  id: number;
  name: string;
  player: string;
  legend: number;
  pantheon: string;
  path: string; // The image path or avatar
  status: "active" | "archived";
}

const STORAGE_KEY = 'pantheonexus_characters';

import victorImg from "@assets/generated_images/golden_glowing_sun_god_portrait.png";
import stormImg from "@assets/generated_images/storm_god_viking_portrait.png";
import shadowImg from "@assets/generated_images/shadowy_anubis_scion_portrait.png";

const DEFAULT_CHARACTERS: CharacterScroll[] = [
  { id: 1, name: "Victorious Sun", player: "Helios", legend: 4, pantheon: "Theoi", status: "active", path: victorImg },
  { id: 2, name: "Storm Caller", player: "Thor", legend: 3, pantheon: "Aesir", status: "active", path: stormImg },
  { id: 3, name: "Shadow Walker", player: "Anubis", legend: 5, pantheon: "Netjer", status: "active", path: shadowImg },
];

// Helper to convert name to URL-friendly slug
export const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
};

export const useCharacters = () => {
  const [characters, setCharacters] = useState<CharacterScroll[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setCharacters(JSON.parse(saved));
    } else {
      setCharacters(DEFAULT_CHARACTERS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_CHARACTERS));
    }
  }, []);

  const addCharacter = (character: Omit<CharacterScroll, 'id' | 'status' | 'path'>) => {
    const newChar: CharacterScroll = {
      ...character,
      id: Date.now(),
      status: "active",
      path: ""
    };
    const updated = [...characters, newChar];
    setCharacters(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
        console.error("Storage limit exceeded", error);
        alert("Storage limit exceeded! Character may not persist on reload.");
    }
  };

  const deleteCharacter = (id: number) => {
    const updated = characters.filter(c => c.id !== id);
    setCharacters(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
        console.error("Storage limit exceeded", error);
    }
  };

  const getCharacterBySlug = (slug: string) => {
    return characters.find(c => slugify(c.name) === slug);
  };

  return { characters, addCharacter, deleteCharacter, getCharacterBySlug };
};
