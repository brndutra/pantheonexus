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
    const { data: scrolls, error } = await supabase.from('scrolls').select('*').order('updated_at', { ascending: false });
    if (error) throw new Error(error.message);
    
    const { data: scionsights } = await supabase.from('scionsight').select('*');
    const scionsightMap = new Map((scionsights || []).map(s => [s.scion_id, s]));
    
    const { data: scionAttributes } = await supabase.from('scion_attributes').select('*');
    const attributesMap = new Map((scionAttributes || []).map(a => [a.scion_id, a]));
    
    return (scrolls || []).map(scroll => {
      const scionsight = scionsightMap.get(scroll.id);
      const attrs = attributesMap.get(scroll.id);
      return this.scrollToCharacter(scroll, scionsight, attrs);
    }) as Character[];
  }

  async getCharacter(id: string): Promise<Character | undefined> {
    const { data: scroll, error } = await supabase.from('scrolls').select('*').eq('id', id).single();
    if (error || !scroll) return undefined;
    
    const { data: scionsight } = await supabase.from('scionsight').select('*').eq('scion_id', id).single();
    const { data: scionAttrs } = await supabase.from('scion_attributes').select('*').eq('scion_id', id).single();
    
    return this.scrollToCharacter(scroll, scionsight, scionAttrs) as Character;
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
    const { data: scrollData, error } = await supabase.from('scrolls').update(scrollUpdates).eq('id', id).select().single();
    if (error || !scrollData) return undefined;
    
    // NOTE: scionsight is a VIEW in Supabase, not a table - it reads from scrolls.data
    // All character data is saved in scrolls.data JSONB column, which the view reflects
    // No need to update scionsight directly
    
    const attributeUpdates = this.characterToScionAttributes(updates as any);
    if (Object.keys(attributeUpdates).length > 0) {
      attributeUpdates.updated_at = new Date().toISOString();
      const { data: existingAttrs } = await supabase.from('scion_attributes').select('id').eq('scion_id', id).single();
      
      if (existingAttrs) {
        await supabase.from('scion_attributes').update(attributeUpdates).eq('scion_id', id);
      } else {
        attributeUpdates.scion_id = id;
        await supabase.from('scion_attributes').insert(attributeUpdates);
      }
    }
    
    const { data: scionsight } = await supabase.from('scionsight').select('*').eq('scion_id', id).single();
    const { data: scionAttrs } = await supabase.from('scion_attributes').select('*').eq('scion_id', id).single();
    return this.scrollToCharacter(scrollData, scionsight, scionAttrs) as Character;
  }

  async deleteCharacter(id: string): Promise<boolean> {
    const { error } = await supabase.from('scrolls').delete().eq('id', id);
    return !error;
  }

  private normalizeAttributes(attrs: any): any {
    const defaultAttrs = {
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
    };

    if (!attrs) return defaultAttrs;
    
    if (attrs.Physical && Array.isArray(attrs.Physical)) {
      return attrs;
    }
    
    if (attrs.physical && typeof attrs.physical === 'object' && !Array.isArray(attrs.physical)) {
      return {
        Physical: [
          { name: "Strength", value: attrs.physical?.strength || 1, epic: 0, rune: "ᚠ" },
          { name: "Dexterity", value: attrs.physical?.dexterity || 1, epic: 0, rune: "ᚢ" },
          { name: "Stamina", value: attrs.physical?.stamina || 1, epic: 0, rune: "ᚦ" }
        ],
        Social: [
          { name: "Charisma", value: attrs.social?.charisma || 1, epic: 0, rune: "ᚨ" },
          { name: "Manipulation", value: attrs.social?.manipulation || 1, epic: 0, rune: "ᚱ" },
          { name: "Appearance", value: attrs.social?.appearance || 1, epic: 0, rune: "ᚲ" }
        ],
        Mental: [
          { name: "Perception", value: attrs.mental?.perception || 1, epic: 0, rune: "ᚷ" },
          { name: "Intelligence", value: attrs.mental?.intelligence || 1, epic: 0, rune: "ᚹ" },
          { name: "Wits", value: attrs.mental?.wits || 1, epic: 0, rune: "ᚺ" }
        ]
      };
    }
    
    return defaultAttrs;
  }

  private normalizeCallings(callings: any, ss: any): any[] {
    if (ss.calling_1) {
      return [
        { id: 1, name: ss.calling_1 || "", title: "", value: ss.calling_1_rating || 1 },
        { id: 2, name: ss.calling_2 || "", title: "", value: ss.calling_2_rating || 1 },
        { id: 3, name: ss.calling_3 || "", title: "", value: ss.calling_3_rating || 1 }
      ];
    }
    
    if (!callings || !Array.isArray(callings)) {
      return [
        { id: 1, name: "", title: "", value: 1 },
        { id: 2, name: "", title: "", value: 1 },
        { id: 3, name: "", title: "", value: 1 }
      ];
    }
    
    return callings.map((c: any, idx: number) => ({
      id: c.id || idx + 1,
      name: c.name || "",
      title: c.title || "",
      value: c.value || c.dots || c.rating || 1
    }));
  }

  private normalizeVirtues(virtues: any, ss: any): any[] {
    if (ss.virtue_1 || ss.virtue_5_name) {
      return [
        { id: 1, name: ss.virtue_1 || "Valor", value: ss.virtue_1_rating || 1 },
        { id: 2, name: ss.virtue_2 || "Harmony", value: ss.virtue_2_rating || 1 },
        { id: 3, name: ss.virtue_3 || "Order", value: ss.virtue_3_rating || 1 },
        { id: 4, name: ss.virtue_4 || "Piety", value: ss.virtue_4_rating || 1 },
        { id: 5, name: ss.virtue_5_name || "", value: ss.virtue_5_rating || 1 }
      ];
    }
    
    if (!virtues) {
      return [
        { id: 1, name: "Valor", value: 1 },
        { id: 2, name: "Harmony", value: 1 },
        { id: 3, name: "Order", value: 1 },
        { id: 4, name: "Piety", value: 1 },
        { id: 5, name: "", value: 1 }
      ];
    }
    
    if (Array.isArray(virtues)) {
      return virtues.map((v: any, idx: number) => ({
        id: v.id || idx + 1,
        name: v.name || "",
        value: v.value || 1
      }));
    }
    
    if (typeof virtues === 'object') {
      const entries = Object.entries(virtues);
      return entries.map(([name, value], idx) => ({
        id: idx + 1,
        name: name,
        value: typeof value === 'number' ? value : 1
      }));
    }
    
    return [
      { id: 1, name: "Valor", value: 1 },
      { id: 2, name: "Harmony", value: 1 },
      { id: 3, name: "Order", value: 1 },
      { id: 4, name: "Piety", value: 1 },
      { id: 5, name: "", value: 1 }
    ];
  }

  private scionAttributesToCharacter(sa: any): any {
    if (!sa) return null;
    
    return {
      Physical: [
        { name: "Strength", value: sa.attribute_strength || 1, epic: sa.attribute_epic_strength || 0, rune: "ᚠ" },
        { name: "Dexterity", value: sa.attribute_dexterity || 1, epic: sa.attribute_epic_dexterity || 0, rune: "ᚢ" },
        { name: "Stamina", value: sa.attribute_stamina || 1, epic: sa.attribute_epic_stamina || 0, rune: "ᚦ" }
      ],
      Social: [
        { name: "Charisma", value: sa.attribute_charisma || 1, epic: sa.attribute_epic_charisma || 0, rune: "ᚨ" },
        { name: "Manipulation", value: sa.attribute_manipulation || 1, epic: sa.attribute_epic_manipulation || 0, rune: "ᚱ" },
        { name: "Appearance", value: sa.attribute_appearance || 1, epic: sa.attribute_epic_appearance || 0, rune: "ᚲ" }
      ],
      Mental: [
        { name: "Perception", value: sa.attribute_perception || 1, epic: sa.attribute_epic_perception || 0, rune: "ᚷ" },
        { name: "Intelligence", value: sa.attribute_intelligence || 1, epic: sa.attribute_epic_intelligence || 0, rune: "ᚹ" },
        { name: "Wits", value: sa.attribute_wit || 1, epic: sa.attribute_epic_wit || 0, rune: "ᚺ" }
      ]
    };
  }

  private characterToScionAttributes(char: Partial<InsertCharacter>): any {
    if (!char.attributes) return {};
    
    const attrs = char.attributes as any;
    const result: any = {};
    
    if (attrs.Physical && Array.isArray(attrs.Physical)) {
      const physical = attrs.Physical;
      const str = physical.find((a: any) => a.name === "Strength");
      const dex = physical.find((a: any) => a.name === "Dexterity");
      const sta = physical.find((a: any) => a.name === "Stamina");
      
      if (str) { result.attribute_strength = str.value; result.attribute_epic_strength = str.epic || 0; }
      if (dex) { result.attribute_dexterity = dex.value; result.attribute_epic_dexterity = dex.epic || 0; }
      if (sta) { result.attribute_stamina = sta.value; result.attribute_epic_stamina = sta.epic || 0; }
    }
    
    if (attrs.Social && Array.isArray(attrs.Social)) {
      const social = attrs.Social;
      const cha = social.find((a: any) => a.name === "Charisma");
      const man = social.find((a: any) => a.name === "Manipulation");
      const app = social.find((a: any) => a.name === "Appearance");
      
      if (cha) { result.attribute_charisma = cha.value; result.attribute_epic_charisma = cha.epic || 0; }
      if (man) { result.attribute_manipulation = man.value; result.attribute_epic_manipulation = man.epic || 0; }
      if (app) { result.attribute_appearance = app.value; result.attribute_epic_appearance = app.epic || 0; }
    }
    
    if (attrs.Mental && Array.isArray(attrs.Mental)) {
      const mental = attrs.Mental;
      const per = mental.find((a: any) => a.name === "Perception");
      const int = mental.find((a: any) => a.name === "Intelligence");
      const wit = mental.find((a: any) => a.name === "Wits");
      
      if (per) { result.attribute_perception = per.value; result.attribute_epic_perception = per.epic || 0; }
      if (int) { result.attribute_intelligence = int.value; result.attribute_epic_intelligence = int.epic || 0; }
      if (wit) { result.attribute_wit = wit.value; result.attribute_epic_wit = wit.epic || 0; }
    }
    
    return result;
  }

  private scrollToCharacter(scroll: any, scionsight?: any, scionAttrs?: any): Character {
    const scrollData = scroll.data || {};
    const ss = scionsight || {};
    
    const callings = this.normalizeCallings(scrollData.callings, ss);
    const virtues = this.normalizeVirtues(scrollData.virtues, ss);
    
    const attrsFromTable = this.scionAttributesToCharacter(scionAttrs);
    const attributes = attrsFromTable || this.normalizeAttributes(scrollData.attributes);
    
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
      legend: ss.legend_level || scrollData.legend || 1,
      legendPointsCurrent: ss.legend_pool_total || scrollData.legend_points_current || 1,
      attributes: attributes,
      abilities: scrollData.abilities || {},
      callings: callings,
      virtues: virtues,
      willpower: ss.willpower_pool_total || scrollData.willpower || 5,
      willpowerCurrent: ss.willpower_pool_current || scrollData.willpower_current || 5,
      extraOxBody: scrollData.extra_ox_body || 0,
      healthDamage: scrollData.health_damage || [],
      knacks: ss.knacks || scrollData.knacks || [],
      boons: ss.boons || scrollData.boons || [],
      weapons: scrollData.weapons || [],
      armorList: scrollData.armor_list || [],
      feats: scrollData.feats || [],
      portrait: scroll.url_portrait_prism || null,
      portraitCover: scroll.url_prism_cover || null,
      nature: ss.nature || scrollData.nature || "",
      legendaryTitle: ss.legendary_title || scrollData.legendary_title || "",
      birthrights: ss.birthrights_creatures ? {
        creatures: this.parseBirthrightField(ss.birthrights_creatures),
        guides: this.parseBirthrightField(ss.birthrights_guides),
        followers: this.parseBirthrightField(ss.birthrights_followers),
        relics: this.parseBirthrightField(ss.birthrights_relics)
      } : scrollData.birthrights || { creatures: [], guides: [], followers: [], relics: [] },
      movementFeats: ss.feats_walk !== undefined ? {
        walk: ss.feats_walk || 0,
        run: ss.feats_run || 0,
        jump: ss.feats_jump || 0,
        lift: ss.feats_lift || 0
      } : scrollData.movement_feats || { walk: 0, run: 0, jump: 0, lift: 0 },
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
      presenceProfile: scroll.pres_eye_color ? {
        eyeColor: scroll.pres_eye_color || "",
        hairColor: scroll.pres_hair_color || "",
        height: scroll.pres_height || "",
        auraSignature: scroll.pres_aura_signature || "",
        scent: scroll.pres_scent || "",
        fashion: scroll.pres_fashion || "",
        distinguishingMark: scroll.pres_distinguishing_mark || "",
        visualNotes: scroll.pres_visual_notes || ""
      } : scrollData.presence_profile || {
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
    
    if (char.presenceProfile && typeof char.presenceProfile === 'object') {
      const pres = char.presenceProfile as any;
      result.pres_eye_color = pres.eyeColor || "";
      result.pres_hair_color = pres.hairColor || "";
      result.pres_height = pres.height || "";
      result.pres_aura_signature = pres.auraSignature || "";
      result.pres_scent = pres.scent || "";
      result.pres_fashion = pres.fashion || "";
      result.pres_distinguishing_mark = pres.distinguishingMark || "";
      result.pres_visual_notes = pres.visualNotes || "";
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

  private parseBirthrightField(value: string | undefined): any[] {
    if (!value) return [];
    // Try to parse as JSON array first
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {
      // Not JSON, return empty array (old string format is ignored)
    }
    return [];
  }

  private characterToScionsight(char: Partial<InsertCharacter>): any {
    const result: any = {};
    
    // NOTE: legend_level is computed/read-only in Supabase, don't update it
    if (char.legendPointsCurrent !== undefined) result.legend_pool_total = char.legendPointsCurrent;
    if (char.willpower !== undefined) result.willpower_pool_total = char.willpower;
    if (char.willpowerCurrent !== undefined) result.willpower_pool_current = char.willpowerCurrent;
    if (char.nature !== undefined) result.nature = char.nature;
    if (char.legendaryTitle !== undefined) result.legendary_title = char.legendaryTitle;
    if (char.knacks !== undefined) result.knacks = char.knacks;
    if (char.boons !== undefined) result.boons = char.boons;
    
    if (char.callings && Array.isArray(char.callings)) {
      const callings = char.callings as any[];
      if (callings[0]) {
        result.calling_1 = callings[0].name || "";
        result.calling_1_rating = callings[0].value || 1;
      }
      if (callings[1]) {
        result.calling_2 = callings[1].name || "";
        result.calling_2_rating = callings[1].value || 1;
      }
      if (callings[2]) {
        result.calling_3 = callings[2].name || "";
        result.calling_3_rating = callings[2].value || 1;
      }
    }
    
    if (char.virtues && Array.isArray(char.virtues)) {
      const virtues = char.virtues as any[];
      if (virtues[0]) {
        result.virtue_1_name = virtues[0].name || "";
        result.virtue_1_rating = virtues[0].value || 1;
      }
      if (virtues[1]) {
        result.virtue_2_name = virtues[1].name || "";
        result.virtue_2_rating = virtues[1].value || 1;
      }
      if (virtues[2]) {
        result.virtue_3_name = virtues[2].name || "";
        result.virtue_3_rating = virtues[2].value || 1;
      }
      if (virtues[3]) {
        result.virtue_4_name = virtues[3].name || "";
        result.virtue_4_rating = virtues[3].value || 1;
      }
      if (virtues[4]) {
        result.virtue_5_name = virtues[4].name || "";
        result.virtue_5_rating = virtues[4].value || 1;
      }
    }
    
    if (char.birthrights && typeof char.birthrights === 'object') {
      const br = char.birthrights as any;
      // Support both string and array formats - serialize arrays to JSON for scionsight
      result.birthrights_creatures = Array.isArray(br.creatures) ? JSON.stringify(br.creatures) : (br.creatures || "");
      result.birthrights_guides = Array.isArray(br.guides) ? JSON.stringify(br.guides) : (br.guides || "");
      result.birthrights_followers = Array.isArray(br.followers) ? JSON.stringify(br.followers) : (br.followers || "");
      result.birthrights_relics = Array.isArray(br.relics) ? JSON.stringify(br.relics) : (br.relics || "");
    }
    
    if (char.movementFeats && typeof char.movementFeats === 'object') {
      const mf = char.movementFeats as any;
      result.feats_walk = mf.walk || 0;
      result.feats_run = mf.run || 0;
      result.feats_jump = mf.jump || 0;
      result.feats_lift = mf.lift || 0;
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
