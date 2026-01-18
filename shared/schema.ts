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
