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

const DEFAULT_CHARACTERS: CharacterScroll[] = [
  { id: 1, name: "Victorious Sun", player: "Helios", legend: 4, pantheon: "Theoi", status: "active", path: "" },
  { id: 2, name: "Storm Caller", player: "Thor", legend: 3, pantheon: "Aesir", status: "active", path: "" },
  { id: 3, name: "Shadow Walker", player: "Anubis", legend: 5, pantheon: "Netjer", status: "active", path: "" },
];

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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const deleteCharacter = (id: number) => {
    const updated = characters.filter(c => c.id !== id);
    setCharacters(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  return { characters, addCharacter, deleteCharacter };
};
