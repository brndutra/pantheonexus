import { 
  type User, type InsertUser, type Character, type InsertCharacter,
  type Boon, type InsertBoon, type Knack, type InsertKnack,
  type Calling, type InsertCalling, type Nature, type InsertNature,
  type Attack, type InsertAttack
} from "@shared/schema";
import { supabase } from "./supabase";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getAllCharacters(): Promise<Character[]>;
  getCharacter(id: string): Promise<Character | undefined>;
  createCharacter(character: InsertCharacter): Promise<Character>;
  updateCharacter(id: string, character: Partial<InsertCharacter>): Promise<Character | undefined>;
  deleteCharacter(id: string): Promise<boolean>;
  
  getAllBoons(): Promise<Boon[]>;
  getBoon(id: string): Promise<Boon | undefined>;
  createBoon(boon: InsertBoon): Promise<Boon>;
  updateBoon(id: string, boon: Partial<InsertBoon>): Promise<Boon | undefined>;
  deleteBoon(id: string): Promise<boolean>;
  
  getAllKnacks(): Promise<Knack[]>;
  getKnack(id: string): Promise<Knack | undefined>;
  createKnack(knack: InsertKnack): Promise<Knack>;
  updateKnack(id: string, knack: Partial<InsertKnack>): Promise<Knack | undefined>;
  deleteKnack(id: string): Promise<boolean>;
  
  getAllCallings(): Promise<Calling[]>;
  getCalling(id: string): Promise<Calling | undefined>;
  createCalling(calling: InsertCalling): Promise<Calling>;
  updateCalling(id: string, calling: Partial<InsertCalling>): Promise<Calling | undefined>;
  deleteCalling(id: string): Promise<boolean>;
  
  getAllNatures(): Promise<Nature[]>;
  getNature(id: string): Promise<Nature | undefined>;
  createNature(nature: InsertNature): Promise<Nature>;
  updateNature(id: string, nature: Partial<InsertNature>): Promise<Nature | undefined>;
  deleteNature(id: string): Promise<boolean>;
  
  getAllAttacks(): Promise<Attack[]>;
  getAttack(id: string): Promise<Attack | undefined>;
  createAttack(attack: InsertAttack): Promise<Attack>;
  updateAttack(id: string, attack: Partial<InsertAttack>): Promise<Attack | undefined>;
  deleteAttack(id: string): Promise<boolean>;
}

function snakeToCamel(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(snakeToCamel);
  if (typeof obj !== 'object') return obj;
  
  const newObj: any = {};
  for (const key in obj) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    newObj[camelKey] = obj[key];
  }
  return newObj;
}

function camelToSnake(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(camelToSnake);
  if (typeof obj !== 'object') return obj;
  
  const newObj: any = {};
  for (const key in obj) {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    newObj[snakeKey] = obj[key];
  }
  return newObj;
}

export class SupabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
    if (error || !data) return undefined;
    return snakeToCamel(data) as User;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const { data, error } = await supabase.from('users').select('*').eq('username', username).single();
    if (error || !data) return undefined;
    return snakeToCamel(data) as User;
  }

  async createUser(user: InsertUser): Promise<User> {
    const { data, error } = await supabase.from('users').insert(camelToSnake(user)).select().single();
    if (error) throw new Error(error.message);
    return snakeToCamel(data) as User;
  }

  async getAllCharacters(): Promise<Character[]> {
    const { data, error } = await supabase.from('characters').select('*').order('updated_at', { ascending: false });
    if (error) throw new Error(error.message);
    return (data || []).map(snakeToCamel) as Character[];
  }

  async getCharacter(id: string): Promise<Character | undefined> {
    const { data, error } = await supabase.from('characters').select('*').eq('id', id).single();
    if (error || !data) return undefined;
    return snakeToCamel(data) as Character;
  }

  async createCharacter(character: InsertCharacter): Promise<Character> {
    const { data, error } = await supabase.from('characters').insert(camelToSnake(character)).select().single();
    if (error) throw new Error(error.message);
    return snakeToCamel(data) as Character;
  }

  async updateCharacter(id: string, updates: Partial<InsertCharacter>): Promise<Character | undefined> {
    const snakeUpdates = camelToSnake(updates);
    snakeUpdates.updated_at = new Date().toISOString();
    const { data, error } = await supabase.from('characters').update(snakeUpdates).eq('id', id).select().single();
    if (error || !data) return undefined;
    return snakeToCamel(data) as Character;
  }

  async deleteCharacter(id: string): Promise<boolean> {
    const { error } = await supabase.from('characters').delete().eq('id', id);
    return !error;
  }

  async getAllBoons(): Promise<Boon[]> {
    const { data, error } = await supabase.from('boons').select('*').order('purview').order('level');
    if (error) throw new Error(error.message);
    return (data || []).map(snakeToCamel) as Boon[];
  }

  async getBoon(id: string): Promise<Boon | undefined> {
    const { data, error } = await supabase.from('boons').select('*').eq('id', id).single();
    if (error || !data) return undefined;
    return snakeToCamel(data) as Boon;
  }

  async createBoon(boon: InsertBoon): Promise<Boon> {
    const { data, error } = await supabase.from('boons').insert(camelToSnake(boon)).select().single();
    if (error) throw new Error(error.message);
    return snakeToCamel(data) as Boon;
  }

  async updateBoon(id: string, updates: Partial<InsertBoon>): Promise<Boon | undefined> {
    const snakeUpdates = camelToSnake(updates);
    snakeUpdates.updated_at = new Date().toISOString();
    const { data, error } = await supabase.from('boons').update(snakeUpdates).eq('id', id).select().single();
    if (error || !data) return undefined;
    return snakeToCamel(data) as Boon;
  }

  async deleteBoon(id: string): Promise<boolean> {
    const { error } = await supabase.from('boons').delete().eq('id', id);
    return !error;
  }

  async getAllKnacks(): Promise<Knack[]> {
    const { data, error } = await supabase.from('knacks').select('*').order('attribute').order('tier');
    if (error) throw new Error(error.message);
    return (data || []).map(snakeToCamel) as Knack[];
  }

  async getKnack(id: string): Promise<Knack | undefined> {
    const { data, error } = await supabase.from('knacks').select('*').eq('id', id).single();
    if (error || !data) return undefined;
    return snakeToCamel(data) as Knack;
  }

  async createKnack(knack: InsertKnack): Promise<Knack> {
    const { data, error } = await supabase.from('knacks').insert(camelToSnake(knack)).select().single();
    if (error) throw new Error(error.message);
    return snakeToCamel(data) as Knack;
  }

  async updateKnack(id: string, updates: Partial<InsertKnack>): Promise<Knack | undefined> {
    const snakeUpdates = camelToSnake(updates);
    snakeUpdates.updated_at = new Date().toISOString();
    const { data, error } = await supabase.from('knacks').update(snakeUpdates).eq('id', id).select().single();
    if (error || !data) return undefined;
    return snakeToCamel(data) as Knack;
  }

  async deleteKnack(id: string): Promise<boolean> {
    const { error } = await supabase.from('knacks').delete().eq('id', id);
    return !error;
  }

  async getAllCallings(): Promise<Calling[]> {
    const { data, error } = await supabase.from('callings').select('*').order('name');
    if (error) throw new Error(error.message);
    return (data || []).map(snakeToCamel) as Calling[];
  }

  async getCalling(id: string): Promise<Calling | undefined> {
    const { data, error } = await supabase.from('callings').select('*').eq('id', id).single();
    if (error || !data) return undefined;
    return snakeToCamel(data) as Calling;
  }

  async createCalling(calling: InsertCalling): Promise<Calling> {
    const { data, error } = await supabase.from('callings').insert(camelToSnake(calling)).select().single();
    if (error) throw new Error(error.message);
    return snakeToCamel(data) as Calling;
  }

  async updateCalling(id: string, updates: Partial<InsertCalling>): Promise<Calling | undefined> {
    const snakeUpdates = camelToSnake(updates);
    snakeUpdates.updated_at = new Date().toISOString();
    const { data, error } = await supabase.from('callings').update(snakeUpdates).eq('id', id).select().single();
    if (error || !data) return undefined;
    return snakeToCamel(data) as Calling;
  }

  async deleteCalling(id: string): Promise<boolean> {
    const { error } = await supabase.from('callings').delete().eq('id', id);
    return !error;
  }

  async getAllNatures(): Promise<Nature[]> {
    const { data, error } = await supabase.from('natures').select('*').order('name');
    if (error) throw new Error(error.message);
    return (data || []).map(snakeToCamel) as Nature[];
  }

  async getNature(id: string): Promise<Nature | undefined> {
    const { data, error } = await supabase.from('natures').select('*').eq('id', id).single();
    if (error || !data) return undefined;
    return snakeToCamel(data) as Nature;
  }

  async createNature(nature: InsertNature): Promise<Nature> {
    const { data, error } = await supabase.from('natures').insert(camelToSnake(nature)).select().single();
    if (error) throw new Error(error.message);
    return snakeToCamel(data) as Nature;
  }

  async updateNature(id: string, updates: Partial<InsertNature>): Promise<Nature | undefined> {
    const snakeUpdates = camelToSnake(updates);
    snakeUpdates.updated_at = new Date().toISOString();
    const { data, error } = await supabase.from('natures').update(snakeUpdates).eq('id', id).select().single();
    if (error || !data) return undefined;
    return snakeToCamel(data) as Nature;
  }

  async deleteNature(id: string): Promise<boolean> {
    const { error } = await supabase.from('natures').delete().eq('id', id);
    return !error;
  }

  async getAllAttacks(): Promise<Attack[]> {
    const { data, error } = await supabase.from('attacks').select('*').order('type').order('name');
    if (error) throw new Error(error.message);
    return (data || []).map(snakeToCamel) as Attack[];
  }

  async getAttack(id: string): Promise<Attack | undefined> {
    const { data, error } = await supabase.from('attacks').select('*').eq('id', id).single();
    if (error || !data) return undefined;
    return snakeToCamel(data) as Attack;
  }

  async createAttack(attack: InsertAttack): Promise<Attack> {
    const { data, error } = await supabase.from('attacks').insert(camelToSnake(attack)).select().single();
    if (error) throw new Error(error.message);
    return snakeToCamel(data) as Attack;
  }

  async updateAttack(id: string, updates: Partial<InsertAttack>): Promise<Attack | undefined> {
    const snakeUpdates = camelToSnake(updates);
    snakeUpdates.updated_at = new Date().toISOString();
    const { data, error } = await supabase.from('attacks').update(snakeUpdates).eq('id', id).select().single();
    if (error || !data) return undefined;
    return snakeToCamel(data) as Attack;
  }

  async deleteAttack(id: string): Promise<boolean> {
    const { error } = await supabase.from('attacks').delete().eq('id', id);
    return !error;
  }
}

export const storage = new SupabaseStorage();
