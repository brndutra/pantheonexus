import { 
  users, characters, boons, knacks, callings, natures, attacks,
  type User, type InsertUser, type Character, type InsertCharacter,
  type Boon, type InsertBoon, type Knack, type InsertKnack,
  type Calling, type InsertCalling, type Nature, type InsertNature,
  type Attack, type InsertAttack
} from "@shared/schema";
import { db } from "./db";
import { eq, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Character operations
  getAllCharacters(): Promise<Character[]>;
  getCharacter(id: string): Promise<Character | undefined>;
  createCharacter(character: InsertCharacter): Promise<Character>;
  updateCharacter(id: string, character: Partial<InsertCharacter>): Promise<Character | undefined>;
  deleteCharacter(id: string): Promise<boolean>;
  
  // Boon operations
  getAllBoons(): Promise<Boon[]>;
  getBoon(id: string): Promise<Boon | undefined>;
  createBoon(boon: InsertBoon): Promise<Boon>;
  updateBoon(id: string, boon: Partial<InsertBoon>): Promise<Boon | undefined>;
  deleteBoon(id: string): Promise<boolean>;
  
  // Knack operations
  getAllKnacks(): Promise<Knack[]>;
  getKnack(id: string): Promise<Knack | undefined>;
  createKnack(knack: InsertKnack): Promise<Knack>;
  updateKnack(id: string, knack: Partial<InsertKnack>): Promise<Knack | undefined>;
  deleteKnack(id: string): Promise<boolean>;
  
  // Calling operations
  getAllCallings(): Promise<Calling[]>;
  getCalling(id: string): Promise<Calling | undefined>;
  createCalling(calling: InsertCalling): Promise<Calling>;
  updateCalling(id: string, calling: Partial<InsertCalling>): Promise<Calling | undefined>;
  deleteCalling(id: string): Promise<boolean>;
  
  // Nature operations
  getAllNatures(): Promise<Nature[]>;
  getNature(id: string): Promise<Nature | undefined>;
  createNature(nature: InsertNature): Promise<Nature>;
  updateNature(id: string, nature: Partial<InsertNature>): Promise<Nature | undefined>;
  deleteNature(id: string): Promise<boolean>;
  
  // Attack operations
  getAllAttacks(): Promise<Attack[]>;
  getAttack(id: string): Promise<Attack | undefined>;
  createAttack(attack: InsertAttack): Promise<Attack>;
  updateAttack(id: string, attack: Partial<InsertAttack>): Promise<Attack | undefined>;
  deleteAttack(id: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }
  
  // Character operations
  async getAllCharacters(): Promise<Character[]> {
    return await db.select().from(characters).orderBy(sql`${characters.updatedAt} DESC`);
  }
  
  async getCharacter(id: string): Promise<Character | undefined> {
    const [character] = await db.select().from(characters).where(eq(characters.id, id));
    return character || undefined;
  }
  
  async createCharacter(insertCharacter: InsertCharacter): Promise<Character> {
    const [character] = await db
      .insert(characters)
      .values(insertCharacter)
      .returning();
    return character;
  }
  
  async updateCharacter(id: string, updates: Partial<InsertCharacter>): Promise<Character | undefined> {
    const [character] = await db
      .update(characters)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(characters.id, id))
      .returning();
    return character || undefined;
  }
  
  async deleteCharacter(id: string): Promise<boolean> {
    const result = await db.delete(characters).where(eq(characters.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }
  
  // Boon operations
  async getAllBoons(): Promise<Boon[]> {
    return await db.select().from(boons).orderBy(sql`${boons.purview}, ${boons.level}`);
  }
  
  async getBoon(id: string): Promise<Boon | undefined> {
    const [boon] = await db.select().from(boons).where(eq(boons.id, id));
    return boon || undefined;
  }
  
  async createBoon(insertBoon: InsertBoon): Promise<Boon> {
    const [boon] = await db.insert(boons).values(insertBoon).returning();
    return boon;
  }
  
  async updateBoon(id: string, updates: Partial<InsertBoon>): Promise<Boon | undefined> {
    const [boon] = await db.update(boons).set({ ...updates, updatedAt: new Date() }).where(eq(boons.id, id)).returning();
    return boon || undefined;
  }
  
  async deleteBoon(id: string): Promise<boolean> {
    const result = await db.delete(boons).where(eq(boons.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }
  
  // Knack operations
  async getAllKnacks(): Promise<Knack[]> {
    return await db.select().from(knacks).orderBy(sql`${knacks.attribute}, ${knacks.tier}`);
  }
  
  async getKnack(id: string): Promise<Knack | undefined> {
    const [knack] = await db.select().from(knacks).where(eq(knacks.id, id));
    return knack || undefined;
  }
  
  async createKnack(insertKnack: InsertKnack): Promise<Knack> {
    const [knack] = await db.insert(knacks).values(insertKnack).returning();
    return knack;
  }
  
  async updateKnack(id: string, updates: Partial<InsertKnack>): Promise<Knack | undefined> {
    const [knack] = await db.update(knacks).set({ ...updates, updatedAt: new Date() }).where(eq(knacks.id, id)).returning();
    return knack || undefined;
  }
  
  async deleteKnack(id: string): Promise<boolean> {
    const result = await db.delete(knacks).where(eq(knacks.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }
  
  // Calling operations
  async getAllCallings(): Promise<Calling[]> {
    return await db.select().from(callings).orderBy(sql`${callings.name}`);
  }
  
  async getCalling(id: string): Promise<Calling | undefined> {
    const [calling] = await db.select().from(callings).where(eq(callings.id, id));
    return calling || undefined;
  }
  
  async createCalling(insertCalling: InsertCalling): Promise<Calling> {
    const [calling] = await db.insert(callings).values(insertCalling).returning();
    return calling;
  }
  
  async updateCalling(id: string, updates: Partial<InsertCalling>): Promise<Calling | undefined> {
    const [calling] = await db.update(callings).set({ ...updates, updatedAt: new Date() }).where(eq(callings.id, id)).returning();
    return calling || undefined;
  }
  
  async deleteCalling(id: string): Promise<boolean> {
    const result = await db.delete(callings).where(eq(callings.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }
  
  // Nature operations
  async getAllNatures(): Promise<Nature[]> {
    return await db.select().from(natures).orderBy(sql`${natures.name}`);
  }
  
  async getNature(id: string): Promise<Nature | undefined> {
    const [nature] = await db.select().from(natures).where(eq(natures.id, id));
    return nature || undefined;
  }
  
  async createNature(insertNature: InsertNature): Promise<Nature> {
    const [nature] = await db.insert(natures).values(insertNature).returning();
    return nature;
  }
  
  async updateNature(id: string, updates: Partial<InsertNature>): Promise<Nature | undefined> {
    const [nature] = await db.update(natures).set({ ...updates, updatedAt: new Date() }).where(eq(natures.id, id)).returning();
    return nature || undefined;
  }
  
  async deleteNature(id: string): Promise<boolean> {
    const result = await db.delete(natures).where(eq(natures.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }
  
  // Attack operations
  async getAllAttacks(): Promise<Attack[]> {
    return await db.select().from(attacks).orderBy(sql`${attacks.type}, ${attacks.name}`);
  }
  
  async getAttack(id: string): Promise<Attack | undefined> {
    const [attack] = await db.select().from(attacks).where(eq(attacks.id, id));
    return attack || undefined;
  }
  
  async createAttack(insertAttack: InsertAttack): Promise<Attack> {
    const [attack] = await db.insert(attacks).values(insertAttack).returning();
    return attack;
  }
  
  async updateAttack(id: string, updates: Partial<InsertAttack>): Promise<Attack | undefined> {
    const [attack] = await db.update(attacks).set({ ...updates, updatedAt: new Date() }).where(eq(attacks.id, id)).returning();
    return attack || undefined;
  }
  
  async deleteAttack(id: string): Promise<boolean> {
    const result = await db.delete(attacks).where(eq(attacks.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }
}

export const storage = new DatabaseStorage();
