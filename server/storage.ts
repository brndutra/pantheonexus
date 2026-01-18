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
    const { data, error } = await supabase.from('scrolls').select('*').order('updated_at', { ascending: false });
    if (error) throw new Error(error.message);
    return (data || []).map(scroll => this.scrollToCharacter(scroll)) as Character[];
  }

  async getCharacter(id: string): Promise<Character | undefined> {
    const { data, error } = await supabase.from('scrolls').select('*').eq('id', id).single();
    if (error || !data) return undefined;
    return this.scrollToCharacter(data) as Character;
  }

  async createCharacter(character: InsertCharacter): Promise<Character> {
    const scrollData = this.characterToScroll(character);
    const { data, error } = await supabase.from('scrolls').insert(scrollData).select().single();
    if (error) throw new Error(error.message);
    return this.scrollToCharacter(data) as Character;
  }

  async updateCharacter(id: string, updates: Partial<InsertCharacter>): Promise<Character | undefined> {
    const scrollUpdates = this.characterToScroll(updates as any);
    scrollUpdates.updated_at = new Date().toISOString();
    const { data, error } = await supabase.from('scrolls').update(scrollUpdates).eq('id', id).select().single();
    if (error || !data) return undefined;
    return this.scrollToCharacter(data) as Character;
  }

  async deleteCharacter(id: string): Promise<boolean> {
    const { error } = await supabase.from('scrolls').delete().eq('id', id);
    return !error;
  }

  private scrollToCharacter(scroll: any): Character {
    const scrollData = scroll.data || {};
    return {
      id: scroll.id,
      name: scroll.name || "",
      player: scrollData.player || "",
      pantheon: scroll.pantheon || "",
      divineParent: scrollData.divine_parent || "",
      dateOfBirth: scroll.birth_day || "",
      nationality: scroll.origin_country || "",
      cityOfOrigin: scroll.origin_city || "",
      stateRegion: scroll.origin_state || "",
      legend: scrollData.legend || 1,
      legendPointsCurrent: scrollData.legend_points_current || 1,
      attributes: scrollData.attributes || {
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
      abilities: scrollData.abilities || {},
      callings: scrollData.callings || [
        { id: 1, name: "", title: "", value: 1 },
        { id: 2, name: "", title: "", value: 1 },
        { id: 3, name: "", title: "", value: 1 }
      ],
      virtues: scrollData.virtues || [
        { id: 1, name: "Valor", value: 1 },
        { id: 2, name: "Harmony", value: 1 },
        { id: 3, name: "Order", value: 1 },
        { id: 4, name: "Piety", value: 1 },
        { id: 5, name: "", value: 1 }
      ],
      willpower: scrollData.willpower || 5,
      willpowerCurrent: scrollData.willpower_current || 5,
      extraOxBody: scrollData.extra_ox_body || 0,
      healthDamage: scrollData.health_damage || [],
      knacks: scrollData.knacks || [],
      boons: scrollData.boons || [],
      weapons: scrollData.weapons || [],
      armorList: scrollData.armor_list || [],
      feats: scrollData.feats || [],
      portrait: scroll.url_portrait_prism || null,
      portraitCover: scroll.url_prism_cover || null,
      nature: scrollData.nature || "",
      legendaryTitle: scrollData.legendary_title || "",
      birthrights: scrollData.birthrights || { creatures: "", guides: "", followers: "", relics: "" },
      movementFeats: scrollData.movement_feats || { walk: 0, run: 0, jump: 0, lift: 0 },
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
      presenceProfile: scrollData.presence_profile || {
        eyeColor: "", hairColor: "", height: "", auraSignature: "",
        scent: "", fashion: "", distinguishingMark: "", visualNotes: ""
      },
      professionalProfile: {
        educationHistory: scroll.prof_education_history || "",
        mentorInfo: scroll.prof_mentor_info || "",
        pupilInfo: scroll.prof_pupil_info || "",
        interestedPurviews: scroll.prof_interested_purviews || "",
        interestedAttributes: scroll.prof_interested_attributes || "",
        interestedAbilities: scroll.prof_interested_abilities || "",
        professionalNotes: scroll.prof_professional_notes || ""
      },
      createdAt: new Date(scroll.created_at),
      updatedAt: new Date(scroll.updated_at)
    };
  }

  private characterToScroll(char: Partial<InsertCharacter>): any {
    const result: any = {};
    
    if (char.name !== undefined) result.name = char.name;
    if (char.pantheon !== undefined) result.pantheon = char.pantheon;
    if (char.dateOfBirth !== undefined) result.birth_day = char.dateOfBirth;
    if (char.nationality !== undefined) result.origin_country = char.nationality;
    if (char.cityOfOrigin !== undefined) result.origin_city = char.cityOfOrigin;
    if (char.stateRegion !== undefined) result.origin_state = char.stateRegion;
    if (char.isPublic !== undefined) result.is_public = char.isPublic;
    if (char.zodiacSign !== undefined) result.zodiac_sign = char.zodiacSign;
    if (char.playlistLink !== undefined) result.playlist_link = char.playlistLink;
    if (char.biography !== undefined) result.biography = char.biography;
    if (char.serapeumAccountNumber !== undefined) result.serapeum_account_number = char.serapeumAccountNumber;
    if (char.portrait !== undefined) result.url_portrait_prism = char.portrait;
    if (char.portraitCover !== undefined) result.url_prism_cover = char.portraitCover;
    
    if (char.psychicProfile && typeof char.psychicProfile === 'object') {
      const psy = char.psychicProfile as any;
      result.psy_description = psy.analysis || "";
      result.psy_tags = psy.keywords || "";
      result.psy_strengths = psy.strengths || "";
      result.psy_behaviors = psy.behaviors || "";
      result.psy_weaknesses = psy.weaknesses || "";
      result.psy_temperament = psy.temperament || "";
      result.psy_intp = psy.cognitiveType || "";
      result.psy_archetypal_arcana = psy.majorArcana || "";
    }
    
    if (char.professionalProfile && typeof char.professionalProfile === 'object') {
      const prof = char.professionalProfile as any;
      result.prof_education_history = prof.educationHistory || "";
      result.prof_mentor_info = prof.mentorInfo || "";
      result.prof_pupil_info = prof.pupilInfo || "";
      result.prof_interested_purviews = prof.interestedPurviews || "";
      result.prof_interested_attributes = prof.interestedAttributes || "";
      result.prof_interested_abilities = prof.interestedAbilities || "";
      result.prof_professional_notes = prof.professionalNotes || "";
    }
    
    const dataFields: any = {};
    if (char.player !== undefined) dataFields.player = char.player;
    if (char.divineParent !== undefined) dataFields.divine_parent = char.divineParent;
    if (char.legend !== undefined) dataFields.legend = char.legend;
    if (char.legendPointsCurrent !== undefined) dataFields.legend_points_current = char.legendPointsCurrent;
    if (char.attributes !== undefined) dataFields.attributes = char.attributes;
    if (char.abilities !== undefined) dataFields.abilities = char.abilities;
    if (char.callings !== undefined) dataFields.callings = char.callings;
    if (char.virtues !== undefined) dataFields.virtues = char.virtues;
    if (char.willpower !== undefined) dataFields.willpower = char.willpower;
    if (char.willpowerCurrent !== undefined) dataFields.willpower_current = char.willpowerCurrent;
    if (char.extraOxBody !== undefined) dataFields.extra_ox_body = char.extraOxBody;
    if (char.healthDamage !== undefined) dataFields.health_damage = char.healthDamage;
    if (char.knacks !== undefined) dataFields.knacks = char.knacks;
    if (char.boons !== undefined) dataFields.boons = char.boons;
    if (char.weapons !== undefined) dataFields.weapons = char.weapons;
    if (char.armorList !== undefined) dataFields.armor_list = char.armorList;
    if (char.feats !== undefined) dataFields.feats = char.feats;
    if (char.nature !== undefined) dataFields.nature = char.nature;
    if (char.legendaryTitle !== undefined) dataFields.legendary_title = char.legendaryTitle;
    if (char.birthrights !== undefined) dataFields.birthrights = char.birthrights;
    if (char.movementFeats !== undefined) dataFields.movement_feats = char.movementFeats;
    if (char.presenceProfile !== undefined) dataFields.presence_profile = char.presenceProfile;
    
    if (Object.keys(dataFields).length > 0) {
      result.data = dataFields;
    }
    
    return result;
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
