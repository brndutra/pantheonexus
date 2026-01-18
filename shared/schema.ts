import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Characters Table
export const characters = pgTable("characters", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Basic Identity
  name: text("name").notNull(),
  player: text("player").default(""),
  pantheon: text("pantheon").default(""),
  divineParent: text("divine_parent").default(""),
  dateOfBirth: text("date_of_birth").default(""),
  nationality: text("nationality").default(""),
  cityOfOrigin: text("city_of_origin").default(""),
  stateRegion: text("state_region").default(""),
  
  // Core Stats
  legend: integer("legend").notNull().default(1),
  legendPointsCurrent: integer("legend_points_current").notNull().default(1),
  
  // Attributes - stored as JSON for flexibility
  attributes: jsonb("attributes").notNull().default({
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
  }),
  
  // Abilities - stored as JSON object
  abilities: jsonb("abilities").notNull().default({}),
  
  // Callings
  callings: jsonb("callings").notNull().default([
    { id: 1, name: "", title: "", value: 1 },
    { id: 2, name: "", title: "", value: 1 },
    { id: 3, name: "", title: "", value: 1 }
  ]),
  
  // Virtues
  virtues: jsonb("virtues").notNull().default([
    { id: 1, name: "Valor", value: 1 },
    { id: 2, name: "Harmony", value: 1 },
    { id: 3, name: "Order", value: 1 },
    { id: 4, name: "Piety", value: 1 },
    { id: 5, name: "", value: 1 }
  ]),
  
  // Willpower
  willpower: integer("willpower").notNull().default(5),
  willpowerCurrent: integer("willpower_current").notNull().default(5),
  
  // Health
  extraOxBody: integer("extra_ox_body").notNull().default(0),
  healthDamage: jsonb("health_damage").notNull().default([]),
  
  // Powers
  knacks: jsonb("knacks").notNull().default([]),
  boons: jsonb("boons").notNull().default([]),
  
  // Equipment
  weapons: jsonb("weapons").notNull().default([]),
  armorList: jsonb("armor_list").notNull().default([]),
  feats: jsonb("feats").notNull().default([]),
  
  // Portrait
  portrait: text("portrait"),
  
  // Profiles
  psychicProfile: jsonb("psychic_profile").notNull().default({
    analysis: "",
    keywords: "",
    strengths: "",
    behaviors: "",
    weaknesses: "",
    temperament: "",
    cognitiveType: "",
    majorArcana: ""
  }),
  
  presenceProfile: jsonb("presence_profile").notNull().default({
    eyeColor: "",
    hairColor: "",
    height: "",
    auraSignature: "",
    scent: "",
    fashion: "",
    distinguishingMark: "",
    visualNotes: ""
  }),
  
  // Metadata
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertCharacterSchema = createInsertSchema(characters).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertCharacter = z.infer<typeof insertCharacterSchema>;
export type Character = typeof characters.$inferSelect;

// =====================
// COMPENDIUM TABLES
// =====================

// Boons Table - Divine powers granted by gods
export const boons = pgTable("boons", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  purview: text("purview").notNull(), // e.g., "Fire", "Sky", "Death", etc.
  level: integer("level").notNull().default(1), // 1-10 for mortal, 11+ for divine
  cost: text("cost").default(""), // Legend cost to activate
  dicePool: text("dice_pool").default(""), // e.g., "Charisma + Presence"
  description: text("description").default(""),
  effect: text("effect").default(""),
  duration: text("duration").default(""),
  pantheon: text("pantheon").default(""), // If pantheon-specific
  prerequisites: jsonb("prerequisites").default([]), // Required boons
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertBoonSchema = createInsertSchema(boons).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertBoon = z.infer<typeof insertBoonSchema>;
export type Boon = typeof boons.$inferSelect;

// Knacks Table - Epic Attribute powers
export const knacks = pgTable("knacks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  attribute: text("attribute").notNull(), // "Strength", "Dexterity", etc.
  tier: integer("tier").notNull().default(1), // Minimum Epic level required
  cost: text("cost").default(""), // Legend/Willpower cost
  description: text("description").default(""),
  effect: text("effect").default(""),
  duration: text("duration").default(""),
  prerequisites: jsonb("prerequisites").default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertKnackSchema = createInsertSchema(knacks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertKnack = z.infer<typeof insertKnackSchema>;
export type Knack = typeof knacks.$inferSelect;

// Callings Table - Scion roles/archetypes
export const callings = pgTable("callings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").default(""),
  favoredPurviews: jsonb("favored_purviews").default([]), // Array of purview names
  favoredAbilities: jsonb("favored_abilities").default([]), // Array of ability names
  innateAbility: text("innate_ability").default(""), // Special ability granted
  iconPath: text("icon_path").default(""),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertCallingSchema = createInsertSchema(callings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertCalling = z.infer<typeof insertCallingSchema>;
export type Calling = typeof callings.$inferSelect;

// Natures Table - Character personality types
export const natures = pgTable("natures", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").default(""),
  willpowerRecovery: text("willpower_recovery").default(""), // How to regain Willpower
  virtueBonus: text("virtue_bonus").default(""), // Related virtue
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertNatureSchema = createInsertSchema(natures).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertNature = z.infer<typeof insertNatureSchema>;
export type Nature = typeof natures.$inferSelect;

// Attacks Table - Predefined attack types/templates
export const attacks = pgTable("attacks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull().default("melee"), // "melee", "ranged", "unarmed", "special"
  accuracy: text("accuracy").default(""), // Dice pool modifier
  damage: text("damage").default(""), // Damage calculation
  damageType: text("damage_type").default("bashing"), // "bashing", "lethal", "aggravated"
  range: text("range").default(""), // For ranged attacks
  speed: integer("speed").default(5), // Action speed
  defense: text("defense").default(""), // DV modifier when using
  tags: jsonb("tags").default([]), // Special properties
  requirements: text("requirements").default(""), // Attribute/ability requirements
  description: text("description").default(""),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertAttackSchema = createInsertSchema(attacks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertAttack = z.infer<typeof insertAttackSchema>;
export type Attack = typeof attacks.$inferSelect;
