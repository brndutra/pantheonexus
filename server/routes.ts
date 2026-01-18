import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCharacterSchema } from "@shared/schema";
import { fromError } from "zod-validation-error";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Character routes
  
  // Get all characters
  app.get("/api/characters", async (req, res) => {
    try {
      const allCharacters = await storage.getAllCharacters();
      res.json(allCharacters);
    } catch (error) {
      console.error("Error fetching characters:", error);
      res.status(500).json({ error: "Failed to fetch characters" });
    }
  });
  
  // Get a specific character by ID
  app.get("/api/characters/:id", async (req, res) => {
    try {
      const character = await storage.getCharacter(req.params.id);
      if (!character) {
        return res.status(404).json({ error: "Character not found" });
      }
      res.json(character);
    } catch (error) {
      console.error("Error fetching character:", error);
      res.status(500).json({ error: "Failed to fetch character" });
    }
  });
  
  // Create a new character
  app.post("/api/characters", async (req, res) => {
    try {
      const validatedData = insertCharacterSchema.parse(req.body);
      const newCharacter = await storage.createCharacter(validatedData);
      res.status(201).json(newCharacter);
    } catch (error) {
      if (error instanceof Error && error.name === "ZodError") {
        const validationError = fromError(error);
        return res.status(400).json({ error: validationError.toString() });
      }
      console.error("Error creating character:", error);
      res.status(500).json({ error: "Failed to create character" });
    }
  });
  
  // Update an existing character
  app.put("/api/characters/:id", async (req, res) => {
    try {
      const validatedData = insertCharacterSchema.partial().parse(req.body);
      const updatedCharacter = await storage.updateCharacter(req.params.id, validatedData);
      if (!updatedCharacter) {
        return res.status(404).json({ error: "Character not found" });
      }
      res.json(updatedCharacter);
    } catch (error) {
      if (error instanceof Error && error.name === "ZodError") {
        const validationError = fromError(error);
        return res.status(400).json({ error: validationError.toString() });
      }
      console.error("Error updating character:", error);
      res.status(500).json({ error: "Failed to update character" });
    }
  });
  
  // Delete a character
  app.delete("/api/characters/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteCharacter(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Character not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting character:", error);
      res.status(500).json({ error: "Failed to delete character" });
    }
  });

  return httpServer;
}
