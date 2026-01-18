import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { supabase } from "./supabase";
import { 
  insertCharacterSchema, insertBoonSchema, insertKnackSchema,
  insertCallingSchema, insertNatureSchema, insertAttackSchema
} from "@shared/schema";
import { fromError } from "zod-validation-error";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Migration endpoint to create rows in scion_attributes and scion_abilities
  app.post("/api/migrate/create-character-rows", async (req, res) => {
    try {
      const { data: scrolls, error: scrollsError } = await supabase.from('scrolls').select('id, name');
      if (scrollsError) throw scrollsError;
      
      let attributesCreated = 0;
      let abilitiesCreated = 0;
      let scionsightCreated = 0;
      const errors: string[] = [];
      
      for (const scroll of scrolls || []) {
        // Create scion_attributes row
        const { data: existingAttr } = await supabase
          .from('scion_attributes')
          .select('id')
          .eq('scion_id', scroll.id)
          .single();
        
        if (!existingAttr) {
          const { error: attrError } = await supabase.from('scion_attributes').insert({
            scion_id: scroll.id,
            attribute_strength: 1,
            attribute_dexterity: 1,
            attribute_stamina: 1,
            attribute_charisma: 1,
            attribute_manipulation: 1,
            attribute_appearance: 1,
            attribute_perception: 1,
            attribute_intelligence: 1,
            attribute_wit: 1,
            attribute_epic_strength: 0,
            attribute_epic_dexterity: 0,
            attribute_epic_stamina: 0,
            attribute_epic_charisma: 0,
            attribute_epic_manipulation: 0,
            attribute_epic_appearance: 0,
            attribute_epic_perception: 0,
            attribute_epic_intelligence: 0,
            attribute_epic_wit: 0
          });
          if (attrError) {
            errors.push(`Attr ${scroll.name}: ${attrError.message}`);
          } else {
            attributesCreated++;
          }
        }
        
        // Create scion_abilities row
        const { data: existingAbil } = await supabase
          .from('scion_abilities')
          .select('id')
          .eq('scion_id', scroll.id)
          .single();
        
        if (!existingAbil) {
          const { error: abilError } = await supabase.from('scion_abilities').insert({
            scion_id: scroll.id
          });
          if (abilError) {
            errors.push(`Abil ${scroll.name}: ${abilError.message}`);
          } else {
            abilitiesCreated++;
          }
        }
        
        // Create scionsight row
        const { data: existingScion } = await supabase
          .from('scionsight')
          .select('id')
          .eq('scion_id', scroll.id)
          .single();
        
        if (!existingScion) {
          const { error: scionError } = await supabase.from('scionsight').insert({
            scion_id: scroll.id
          });
          if (scionError) {
            errors.push(`Scionsight ${scroll.name}: ${scionError.message}`);
          } else {
            scionsightCreated++;
          }
        }
      }
      
      // Get counts of existing rows
      const { count: attrCount } = await supabase.from('scion_attributes').select('*', { count: 'exact', head: true });
      const { count: abilCount } = await supabase.from('scion_abilities').select('*', { count: 'exact', head: true });
      const { count: scionCount } = await supabase.from('scionsight').select('*', { count: 'exact', head: true });
      
      res.json({
        success: true,
        message: `Created ${attributesCreated} attribute rows, ${abilitiesCreated} ability rows, ${scionsightCreated} scionsight rows`,
        totalCharacters: scrolls?.length || 0,
        existingCounts: {
          scion_attributes: attrCount,
          scion_abilities: abilCount,
          scionsight: scionCount
        },
        errors: errors.length > 0 ? errors : undefined
      });
    } catch (error) {
      console.error("Migration error:", error);
      res.status(500).json({ error: "Migration failed", details: String(error) });
    }
  });
  
  // Get scion_abilities schema (column names for abilities list)
  app.get("/api/abilities-schema", async (req, res) => {
    try {
      // Fetch one row to get column names
      const { data, error } = await supabase
        .from('scion_abilities')
        .select('*')
        .limit(1);
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        // Extract column names, filter out id, scion_id, created_at, updated_at
        // Also filter to only get _rating columns, then extract base ability name
        const excludeColumns = ['id', 'scion_id', 'created_at', 'updated_at'];
        const allColumns = Object.keys(data[0]).filter(col => !excludeColumns.includes(col));
        
        // Find base ability names from _rating columns (excluding specialties and sparks)
        const ratingColumns = allColumns.filter(col => 
          col.endsWith('_rating') && !col.includes('specialties') && !col.includes('sparks')
        );
        
        // Build ability info with sparks and heritage columns
        const abilities = ratingColumns.map(col => {
          const baseName = col.replace('_rating', '');
          const displayName = baseName.replace('ability_', '').split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ');
          
          return {
            name: displayName,
            ratingColumn: col,
            sparksColumn: baseName + '_sparks_rating',
            heritageColumn: baseName + '_heritage_fav',
            specialtiesColumn: baseName + '_specialties_rating'
          };
        });
        
        res.json({ abilities, raw_columns: ratingColumns });
      } else {
        res.json({ abilities: [] });
      }
    } catch (error) {
      console.error("Error fetching abilities schema:", error);
      res.status(500).json({ error: "Failed to fetch abilities schema" });
    }
  });

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

  // =====================
  // COMPENDIUM ROUTES
  // =====================
  
  // BOONS
  app.get("/api/boons", async (req, res) => {
    try {
      const allBoons = await storage.getAllBoons();
      res.json(allBoons);
    } catch (error) {
      console.error("Error fetching boons:", error);
      res.status(500).json({ error: "Failed to fetch boons" });
    }
  });
  
  app.get("/api/boons/:id", async (req, res) => {
    try {
      const boon = await storage.getBoon(req.params.id);
      if (!boon) return res.status(404).json({ error: "Boon not found" });
      res.json(boon);
    } catch (error) {
      console.error("Error fetching boon:", error);
      res.status(500).json({ error: "Failed to fetch boon" });
    }
  });
  
  app.post("/api/boons", async (req, res) => {
    try {
      const validatedData = insertBoonSchema.parse(req.body);
      const newBoon = await storage.createBoon(validatedData);
      res.status(201).json(newBoon);
    } catch (error) {
      if (error instanceof Error && error.name === "ZodError") {
        return res.status(400).json({ error: fromError(error).toString() });
      }
      console.error("Error creating boon:", error);
      res.status(500).json({ error: "Failed to create boon" });
    }
  });
  
  app.put("/api/boons/:id", async (req, res) => {
    try {
      const validatedData = insertBoonSchema.partial().parse(req.body);
      const updated = await storage.updateBoon(req.params.id, validatedData);
      if (!updated) return res.status(404).json({ error: "Boon not found" });
      res.json(updated);
    } catch (error) {
      if (error instanceof Error && error.name === "ZodError") {
        return res.status(400).json({ error: fromError(error).toString() });
      }
      console.error("Error updating boon:", error);
      res.status(500).json({ error: "Failed to update boon" });
    }
  });
  
  app.delete("/api/boons/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteBoon(req.params.id);
      if (!deleted) return res.status(404).json({ error: "Boon not found" });
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting boon:", error);
      res.status(500).json({ error: "Failed to delete boon" });
    }
  });
  
  // KNACKS
  app.get("/api/knacks", async (req, res) => {
    try {
      const allKnacks = await storage.getAllKnacks();
      res.json(allKnacks);
    } catch (error) {
      console.error("Error fetching knacks:", error);
      res.status(500).json({ error: "Failed to fetch knacks" });
    }
  });
  
  app.get("/api/knacks/:id", async (req, res) => {
    try {
      const knack = await storage.getKnack(req.params.id);
      if (!knack) return res.status(404).json({ error: "Knack not found" });
      res.json(knack);
    } catch (error) {
      console.error("Error fetching knack:", error);
      res.status(500).json({ error: "Failed to fetch knack" });
    }
  });
  
  app.post("/api/knacks", async (req, res) => {
    try {
      const validatedData = insertKnackSchema.parse(req.body);
      const newKnack = await storage.createKnack(validatedData);
      res.status(201).json(newKnack);
    } catch (error) {
      if (error instanceof Error && error.name === "ZodError") {
        return res.status(400).json({ error: fromError(error).toString() });
      }
      console.error("Error creating knack:", error);
      res.status(500).json({ error: "Failed to create knack" });
    }
  });
  
  app.put("/api/knacks/:id", async (req, res) => {
    try {
      const validatedData = insertKnackSchema.partial().parse(req.body);
      const updated = await storage.updateKnack(req.params.id, validatedData);
      if (!updated) return res.status(404).json({ error: "Knack not found" });
      res.json(updated);
    } catch (error) {
      if (error instanceof Error && error.name === "ZodError") {
        return res.status(400).json({ error: fromError(error).toString() });
      }
      console.error("Error updating knack:", error);
      res.status(500).json({ error: "Failed to update knack" });
    }
  });
  
  app.delete("/api/knacks/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteKnack(req.params.id);
      if (!deleted) return res.status(404).json({ error: "Knack not found" });
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting knack:", error);
      res.status(500).json({ error: "Failed to delete knack" });
    }
  });
  
  // CALLINGS
  app.get("/api/callings", async (req, res) => {
    try {
      const allCallings = await storage.getAllCallings();
      res.json(allCallings);
    } catch (error) {
      console.error("Error fetching callings:", error);
      res.status(500).json({ error: "Failed to fetch callings" });
    }
  });
  
  app.get("/api/callings/:id", async (req, res) => {
    try {
      const calling = await storage.getCalling(req.params.id);
      if (!calling) return res.status(404).json({ error: "Calling not found" });
      res.json(calling);
    } catch (error) {
      console.error("Error fetching calling:", error);
      res.status(500).json({ error: "Failed to fetch calling" });
    }
  });
  
  app.post("/api/callings", async (req, res) => {
    try {
      const validatedData = insertCallingSchema.parse(req.body);
      const newCalling = await storage.createCalling(validatedData);
      res.status(201).json(newCalling);
    } catch (error) {
      if (error instanceof Error && error.name === "ZodError") {
        return res.status(400).json({ error: fromError(error).toString() });
      }
      console.error("Error creating calling:", error);
      res.status(500).json({ error: "Failed to create calling" });
    }
  });
  
  app.put("/api/callings/:id", async (req, res) => {
    try {
      const validatedData = insertCallingSchema.partial().parse(req.body);
      const updated = await storage.updateCalling(req.params.id, validatedData);
      if (!updated) return res.status(404).json({ error: "Calling not found" });
      res.json(updated);
    } catch (error) {
      if (error instanceof Error && error.name === "ZodError") {
        return res.status(400).json({ error: fromError(error).toString() });
      }
      console.error("Error updating calling:", error);
      res.status(500).json({ error: "Failed to update calling" });
    }
  });
  
  app.delete("/api/callings/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteCalling(req.params.id);
      if (!deleted) return res.status(404).json({ error: "Calling not found" });
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting calling:", error);
      res.status(500).json({ error: "Failed to delete calling" });
    }
  });
  
  // NATURES
  app.get("/api/natures", async (req, res) => {
    try {
      const allNatures = await storage.getAllNatures();
      res.json(allNatures);
    } catch (error) {
      console.error("Error fetching natures:", error);
      res.status(500).json({ error: "Failed to fetch natures" });
    }
  });
  
  app.get("/api/natures/:id", async (req, res) => {
    try {
      const nature = await storage.getNature(req.params.id);
      if (!nature) return res.status(404).json({ error: "Nature not found" });
      res.json(nature);
    } catch (error) {
      console.error("Error fetching nature:", error);
      res.status(500).json({ error: "Failed to fetch nature" });
    }
  });
  
  app.post("/api/natures", async (req, res) => {
    try {
      const validatedData = insertNatureSchema.parse(req.body);
      const newNature = await storage.createNature(validatedData);
      res.status(201).json(newNature);
    } catch (error) {
      if (error instanceof Error && error.name === "ZodError") {
        return res.status(400).json({ error: fromError(error).toString() });
      }
      console.error("Error creating nature:", error);
      res.status(500).json({ error: "Failed to create nature" });
    }
  });
  
  app.put("/api/natures/:id", async (req, res) => {
    try {
      const validatedData = insertNatureSchema.partial().parse(req.body);
      const updated = await storage.updateNature(req.params.id, validatedData);
      if (!updated) return res.status(404).json({ error: "Nature not found" });
      res.json(updated);
    } catch (error) {
      if (error instanceof Error && error.name === "ZodError") {
        return res.status(400).json({ error: fromError(error).toString() });
      }
      console.error("Error updating nature:", error);
      res.status(500).json({ error: "Failed to update nature" });
    }
  });
  
  app.delete("/api/natures/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteNature(req.params.id);
      if (!deleted) return res.status(404).json({ error: "Nature not found" });
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting nature:", error);
      res.status(500).json({ error: "Failed to delete nature" });
    }
  });
  
  // VIRTUES - Fetch from Supabase virtues_reference table
  app.get("/api/virtues", async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('virtues_reference')
        .select('*')
        .order('name');
      
      if (error) throw error;
      res.json(data || []);
    } catch (error) {
      console.error("Error fetching virtues:", error);
      res.status(500).json({ error: "Failed to fetch virtues" });
    }
  });
  
  // NATURES - Fetch from Supabase list_nature table
  app.get("/api/list-natures", async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('list_nature')
        .select('*')
        .order('nome');
      
      if (error) throw error;
      res.json(data || []);
    } catch (error) {
      console.error("Error fetching natures:", error);
      res.status(500).json({ error: "Failed to fetch natures" });
    }
  });
  
  // OFFENSIVES - Fetch from Supabase offensives tables (melee, ranged, unarmed, special)
  app.get("/api/offensives/melee", async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('offensives_meelee')
        .select('*');
      
      if (error) throw error;
      res.json(data || []);
    } catch (error) {
      console.error("Error fetching melee offensives:", error);
      res.status(500).json({ error: "Failed to fetch melee offensives" });
    }
  });
  
  app.get("/api/offensives/ranged", async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('offensives_ranged')
        .select('*');
      
      if (error) throw error;
      res.json(data || []);
    } catch (error) {
      console.error("Error fetching ranged offensives:", error);
      res.status(500).json({ error: "Failed to fetch ranged offensives" });
    }
  });
  
  app.get("/api/offensives/unarmed", async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('offensives_unarmed')
        .select('*');
      
      if (error) throw error;
      res.json(data || []);
    } catch (error) {
      console.error("Error fetching unarmed offensives:", error);
      res.status(500).json({ error: "Failed to fetch unarmed offensives" });
    }
  });
  
  app.get("/api/offensives/special", async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('offensives_special')
        .select('*');
      
      if (error) throw error;
      res.json(data || []);
    } catch (error) {
      console.error("Error fetching special offensives:", error);
      res.status(500).json({ error: "Failed to fetch special offensives" });
    }
  });
  
  // SCIONSIGHT - Fetch legend data from Supabase scionsight table
  app.get("/api/scionsight/:scionId", async (req, res) => {
    try {
      const { scionId } = req.params;
      const { data, error } = await supabase
        .from('scionsight')
        .select('*')
        .eq('scion_id', scionId)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "not found"
      res.json(data || null);
    } catch (error) {
      console.error("Error fetching scionsight:", error);
      res.status(500).json({ error: "Failed to fetch scionsight" });
    }
  });
  
  // Update scionsight legend_pool_current
  app.patch("/api/scionsight/:scionId/legend-current", async (req, res) => {
    try {
      const { scionId } = req.params;
      const { legend_pool_current } = req.body;
      
      const { data, error } = await supabase
        .from('scionsight')
        .update({ legend_pool_current })
        .eq('scion_id', scionId)
        .select()
        .single();
      
      if (error) throw error;
      res.json(data);
    } catch (error) {
      console.error("Error updating legend pool:", error);
      res.status(500).json({ error: "Failed to update legend pool" });
    }
  });
  
  // Update scionsight offensives (selected weapons array)
  app.patch("/api/scionsight/:scionId/offensives", async (req, res) => {
    try {
      const { scionId } = req.params;
      const { offensives } = req.body;
      
      const { data, error } = await supabase
        .from('scionsight')
        .update({ offensives })
        .eq('scion_id', scionId)
        .select()
        .single();
      
      if (error) throw error;
      res.json(data);
    } catch (error) {
      console.error("Error updating offensives:", error);
      res.status(500).json({ error: "Failed to update offensives" });
    }
  });
  
  // Update scionsight knacks_selected
  app.patch("/api/scionsight/:scionId/knacks", async (req, res) => {
    try {
      const { scionId } = req.params;
      const { knacks_selected } = req.body;
      
      const { data, error } = await supabase
        .from('scionsight')
        .update({ knacks_selected })
        .eq('scion_id', scionId)
        .select()
        .single();
      
      if (error) throw error;
      res.json(data);
    } catch (error) {
      console.error("Error updating knacks:", error);
      res.status(500).json({ error: "Failed to update knacks" });
    }
  });
  
  // Update scionsight boons_selected
  app.patch("/api/scionsight/:scionId/boons", async (req, res) => {
    try {
      const { scionId } = req.params;
      const { boons_selected } = req.body;
      
      const { data, error } = await supabase
        .from('scionsight')
        .update({ boons_selected })
        .eq('scion_id', scionId)
        .select()
        .single();
      
      if (error) throw error;
      res.json(data);
    } catch (error) {
      console.error("Error updating boons:", error);
      res.status(500).json({ error: "Failed to update boons" });
    }
  });
  
  // Get boons from Supabase (combining boons_capitals and boons_specials only)
  app.get("/api/supabase-boons", async (req, res) => {
    try {
      // Fetch from boons_capitals and boons_specials only
      const [capitalsResult, specialsResult] = await Promise.all([
        supabase.from('boons_capitals').select('*').order('purview'),
        supabase.from('boons_specials').select('*').order('purview')
      ]);
      
      // Log errors if any
      if (capitalsResult.error) console.error("Error fetching boons_capitals:", capitalsResult.error);
      if (specialsResult.error) console.error("Error fetching boons_specials:", specialsResult.error);
      
      // Map the data - use 'name' field or 'boon_name' if 'name' doesn't exist
      const capitals = (capitalsResult.data || []).map((b: any) => ({ 
        ...b, 
        name: b.name || b.boon_name || b.nome,
        type: 'capital' 
      }));
      const specials = (specialsResult.data || []).map((b: any) => ({ 
        ...b, 
        name: b.name || b.boon_name || b.nome,
        type: 'special' 
      }));
      
      // Combine capitals and specials
      const allBoons = [...capitals, ...specials];
      
      console.log(`Boons loaded: ${capitals.length} capitals, ${specials.length} specials`);
      
      res.json(allBoons);
    } catch (error) {
      console.error("Error fetching boons from Supabase:", error);
      res.status(500).json({ error: "Failed to fetch boons" });
    }
  });
  
  // CUSTOM OFFENSIVES - Table for personalized weapons
  app.get("/api/offensives-custom", async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('offensives_custom')
        .select('*');
      
      if (error) throw error;
      res.json(data || []);
    } catch (error) {
      console.error("Error fetching custom offensives:", error);
      res.status(500).json({ error: "Failed to fetch custom offensives" });
    }
  });
  
  app.post("/api/offensives-custom", async (req, res) => {
    try {
      const { offensive_name, category, accuracy, attack_attribute, attack_ability, damage, damage_attribute, defense, range, clip, speed, tags, scion_id } = req.body;
      
      const { data, error } = await supabase
        .from('offensives_custom')
        .insert({
          offensive_name,
          category: category || 'custom',
          accuracy: accuracy || 0,
          attack_attribute: attack_attribute || 'Dexterity',
          attack_ability: attack_ability || 'Melee',
          damage: damage || '0L',
          damage_attribute: damage_attribute || 'Strength',
          defense: defense || 0,
          range: range || null,
          clip: clip || null,
          speed: speed || 5,
          tags: tags || null,
          scion_id: scion_id || null
        })
        .select()
        .single();
      
      if (error) throw error;
      res.json(data);
    } catch (error) {
      console.error("Error creating custom offensive:", error);
      res.status(500).json({ error: "Failed to create custom offensive" });
    }
  });
  
  // KNACKS - Fetch from Supabase knacks table
  app.get("/api/supabase-knacks", async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('knacks')
        .select('*');
      
      if (error) throw error;
      res.json(data || []);
    } catch (error) {
      console.error("Error fetching knacks from Supabase:", error);
      res.status(500).json({ error: "Failed to fetch knacks" });
    }
  });
  
  // Innate offensives endpoint
  app.get("/api/offensives/innate", async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('offensives_innate')
        .select('*');
      
      if (error) throw error;
      res.json(data || []);
    } catch (error) {
      console.error("Error fetching innate offensives:", error);
      res.status(500).json({ error: "Failed to fetch innate offensives" });
    }
  });
  
  // Combined offensives endpoint
  app.get("/api/offensives", async (req, res) => {
    try {
      const [melee, ranged, firearms, innate] = await Promise.all([
        supabase.from('offensives_meelee').select('*'),
        supabase.from('offensives_ranged').select('*'),
        supabase.from('offensives_firearms').select('*'),
        supabase.from('offensives_innate').select('*'),
      ]);
      
      res.json({
        melee: melee.data || [],
        ranged: ranged.data || [],
        firearms: firearms.data || [],
        innate: innate.data || [],
      });
    } catch (error) {
      console.error("Error fetching all offensives:", error);
      res.status(500).json({ error: "Failed to fetch offensives" });
    }
  });
  
  // ATTACKS
  app.get("/api/attacks", async (req, res) => {
    try {
      const allAttacks = await storage.getAllAttacks();
      res.json(allAttacks);
    } catch (error) {
      console.error("Error fetching attacks:", error);
      res.status(500).json({ error: "Failed to fetch attacks" });
    }
  });
  
  app.get("/api/attacks/:id", async (req, res) => {
    try {
      const attack = await storage.getAttack(req.params.id);
      if (!attack) return res.status(404).json({ error: "Attack not found" });
      res.json(attack);
    } catch (error) {
      console.error("Error fetching attack:", error);
      res.status(500).json({ error: "Failed to fetch attack" });
    }
  });
  
  app.post("/api/attacks", async (req, res) => {
    try {
      const validatedData = insertAttackSchema.parse(req.body);
      const newAttack = await storage.createAttack(validatedData);
      res.status(201).json(newAttack);
    } catch (error) {
      if (error instanceof Error && error.name === "ZodError") {
        return res.status(400).json({ error: fromError(error).toString() });
      }
      console.error("Error creating attack:", error);
      res.status(500).json({ error: "Failed to create attack" });
    }
  });
  
  app.put("/api/attacks/:id", async (req, res) => {
    try {
      const validatedData = insertAttackSchema.partial().parse(req.body);
      const updated = await storage.updateAttack(req.params.id, validatedData);
      if (!updated) return res.status(404).json({ error: "Attack not found" });
      res.json(updated);
    } catch (error) {
      if (error instanceof Error && error.name === "ZodError") {
        return res.status(400).json({ error: fromError(error).toString() });
      }
      console.error("Error updating attack:", error);
      res.status(500).json({ error: "Failed to update attack" });
    }
  });
  
  app.delete("/api/attacks/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteAttack(req.params.id);
      if (!deleted) return res.status(404).json({ error: "Attack not found" });
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting attack:", error);
      res.status(500).json({ error: "Failed to delete attack" });
    }
  });

  // =====================
  // IMPORT FROM SCROLLS
  // =====================
  
  app.post("/api/import-scrolls", async (req, res) => {
    try {
      const { data: scrolls, error } = await supabase
        .from('scrolls')
        .select('*');
      
      if (error) {
        console.error("Error fetching scrolls:", error);
        return res.status(500).json({ error: "Failed to fetch scrolls from Supabase" });
      }
      
      if (!scrolls || scrolls.length === 0) {
        return res.json({ message: "No scrolls found to import", imported: 0 });
      }
      
      const importedCharacters = [];
      
      for (const scroll of scrolls) {
        const characterData = {
          name: scroll.name || "Unknown",
          player: "",
          pantheon: scroll.pantheon || "",
          divineParent: "",
          dateOfBirth: scroll.birth_day || "",
          nationality: scroll.origin_country || "",
          cityOfOrigin: scroll.origin_city || "",
          stateRegion: scroll.origin_state || "",
          legend: 1,
          legendPointsCurrent: 1,
          attributes: {
            Physical: [
              { name: "Strength", value: 1, epic: 0, rune: "ᚠ" },
              { name: "Dexterity", value: 1, epic: 0, rune: "ᚢ" },
              { name: "Stamina", value: 1, epic: 0, rune: "ᚦ" }
            ],
            Social: [
              { name: "Charisma", value: 1, epic: 0, rune: "ᚨ" },
              { name: "Manipulation", value: 1, epic: 0, rune: "ᚱ" },
              { name: "Appearance", value: 1, epic: 0, rune: "ᚲ" }
            ],
            Mental: [
              { name: "Perception", value: 1, epic: 0, rune: "ᚷ" },
              { name: "Intelligence", value: 1, epic: 0, rune: "ᚹ" },
              { name: "Wits", value: 1, epic: 0, rune: "ᚺ" }
            ]
          },
          abilities: {},
          callings: [
            { id: 1, name: "", title: "", value: 1 },
            { id: 2, name: "", title: "", value: 1 },
            { id: 3, name: "", title: "", value: 1 }
          ],
          virtues: [
            { id: 1, name: "Valor", value: 1 },
            { id: 2, name: "Harmony", value: 1 },
            { id: 3, name: "Order", value: 1 },
            { id: 4, name: "Piety", value: 1 },
            { id: 5, name: "", value: 1 }
          ],
          willpower: 5,
          willpowerCurrent: 5,
          extraOxBody: 0,
          healthDamage: [],
          knacks: [],
          boons: [],
          weapons: [],
          armorList: [],
          feats: [],
          portrait: scroll.url_portrait_prism || null,
          portraitCover: scroll.url_prism_cover || null,
          nature: "",
          legendaryTitle: "",
          birthrights: {
            creatures: "",
            guides: "",
            followers: "",
            relics: ""
          },
          movementFeats: { walk: 0, run: 0, jump: 0, lift: 0 },
          isPublic: scroll.is_public || "true",
          zodiacSign: scroll.zodiac_sign || "",
          playlistLink: scroll.playlist_link || "",
          biography: scroll.biography || "",
          serapeumAccountNumber: scroll.serapeum_account_number || "",
          psychicProfile: {
            analysis: scroll.psy_description || "",
            keywords: scroll.psy_tags || "",
            strengths: scroll.psy_strengths || "",
            behaviors: scroll.psy_behaviors || "",
            weaknesses: scroll.psy_weaknesses || "",
            temperament: scroll.psy_temperament || "",
            cognitiveType: scroll.psy_intp || "",
            majorArcana: scroll.psy_archetypal_arcana || ""
          },
          presenceProfile: {
            eyeColor: "",
            hairColor: "",
            height: "",
            auraSignature: "",
            scent: "",
            fashion: "",
            distinguishingMark: "",
            visualNotes: ""
          },
          professionalProfile: {
            educationHistory: scroll.prof_education_history || "",
            mentorInfo: scroll.prof_mentor_info || "",
            pupilInfo: scroll.prof_pupil_info || "",
            interestedPurviews: scroll.prof_interested_purviews || "",
            interestedAttributes: scroll.prof_interested_attributes || "",
            interestedAbilities: scroll.prof_interested_abilities || "",
            professionalNotes: scroll.prof_professional_notes || ""
          }
        };
        
        try {
          const created = await storage.createCharacter(characterData);
          importedCharacters.push(created);
        } catch (err) {
          console.error(`Failed to import scroll ${scroll.name}:`, err);
        }
      }
      
      res.json({ 
        message: `Successfully imported ${importedCharacters.length} characters from scrolls`,
        imported: importedCharacters.length,
        characters: importedCharacters
      });
    } catch (error) {
      console.error("Error importing scrolls:", error);
      res.status(500).json({ error: "Failed to import scrolls" });
    }
  });

  // Get scrolls directly from Supabase
  app.get("/api/scrolls", async (req, res) => {
    try {
      const { data, error } = await supabase.from('scrolls').select('*');
      if (error) throw new Error(error.message);
      res.json(data || []);
    } catch (error) {
      console.error("Error fetching scrolls:", error);
      res.status(500).json({ error: "Failed to fetch scrolls" });
    }
  });

  return httpServer;
}
