import type { Character, InsertCharacter } from "@shared/schema";

const API_BASE = "/api";

export const charactersApi = {
  // Get all characters
  getAll: async (): Promise<Character[]> => {
    const response = await fetch(`${API_BASE}/characters`);
    if (!response.ok) {
      throw new Error("Failed to fetch characters");
    }
    return response.json();
  },

  // Get a single character by ID
  get: async (id: string): Promise<Character> => {
    const response = await fetch(`${API_BASE}/characters/${id}`);
    if (!response.ok) {
      throw new Error("Failed to fetch character");
    }
    return response.json();
  },

  // Create a new character
  create: async (character: InsertCharacter): Promise<Character> => {
    const response = await fetch(`${API_BASE}/characters`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(character),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create character");
    }
    return response.json();
  },

  // Update a character
  update: async (id: string, updates: Partial<InsertCharacter>): Promise<Character> => {
    const response = await fetch(`${API_BASE}/characters/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to update character");
    }
    return response.json();
  },

  // Delete a character
  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/characters/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error("Failed to delete character");
    }
  },
};
