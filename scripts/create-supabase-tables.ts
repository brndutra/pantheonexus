import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xokduhssevaaxzmhcpxf.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY

if (!supabaseKey) {
  throw new Error('Missing SUPABASE_KEY environment variable')
}

const supabase = createClient(supabaseUrl, supabaseKey)

const createTablesSql = `
-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL
);

-- Characters Table
CREATE TABLE IF NOT EXISTS characters (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  player TEXT DEFAULT '',
  pantheon TEXT DEFAULT '',
  divine_parent TEXT DEFAULT '',
  date_of_birth TEXT DEFAULT '',
  nationality TEXT DEFAULT '',
  city_of_origin TEXT DEFAULT '',
  state_region TEXT DEFAULT '',
  legend INTEGER NOT NULL DEFAULT 1,
  legend_points_current INTEGER NOT NULL DEFAULT 1,
  attributes JSONB NOT NULL DEFAULT '{"Physical":[{"name":"Strength","value":1,"epic":0,"rune":"ᚠ"},{"name":"Dexterity","value":1,"epic":0,"rune":"ᚢ"},{"name":"Stamina","value":1,"epic":0,"rune":"ᚦ"}],"Social":[{"name":"Charisma","value":1,"epic":0,"rune":"ᚨ"},{"name":"Manipulation","value":1,"epic":0,"rune":"ᚱ"},{"name":"Appearance","value":1,"epic":0,"rune":"ᚲ"}],"Mental":[{"name":"Perception","value":1,"epic":0,"rune":"ᚷ"},{"name":"Intelligence","value":1,"epic":0,"rune":"ᚹ"},{"name":"Wits","value":1,"epic":0,"rune":"ᚺ"}]}',
  abilities JSONB NOT NULL DEFAULT '{}',
  callings JSONB NOT NULL DEFAULT '[{"id":1,"name":"","title":"","value":1},{"id":2,"name":"","title":"","value":1},{"id":3,"name":"","title":"","value":1}]',
  virtues JSONB NOT NULL DEFAULT '[{"id":1,"name":"Valor","value":1},{"id":2,"name":"Harmony","value":1},{"id":3,"name":"Order","value":1},{"id":4,"name":"Piety","value":1},{"id":5,"name":"","value":1}]',
  willpower INTEGER NOT NULL DEFAULT 5,
  willpower_current INTEGER NOT NULL DEFAULT 5,
  extra_ox_body INTEGER NOT NULL DEFAULT 0,
  health_damage JSONB NOT NULL DEFAULT '[]',
  knacks JSONB NOT NULL DEFAULT '[]',
  boons JSONB NOT NULL DEFAULT '[]',
  weapons JSONB NOT NULL DEFAULT '[]',
  armor_list JSONB NOT NULL DEFAULT '[]',
  feats JSONB NOT NULL DEFAULT '[]',
  portrait TEXT,
  portrait_cover TEXT,
  nature TEXT DEFAULT '',
  legendary_title TEXT DEFAULT '',
  birthrights JSONB NOT NULL DEFAULT '{"creatures":"","guides":"","followers":"","relics":""}',
  movement_feats JSONB NOT NULL DEFAULT '{"walk":0,"run":0,"jump":0,"lift":0}',
  is_public TEXT DEFAULT 'true',
  zodiac_sign TEXT DEFAULT '',
  playlist_link TEXT DEFAULT '',
  biography TEXT DEFAULT '',
  serapeum_account_number TEXT DEFAULT '',
  psychic_profile JSONB NOT NULL DEFAULT '{"analysis":"","keywords":"","strengths":"","behaviors":"","weaknesses":"","temperament":"","cognitiveType":"","majorArcana":"","zodiacSign":"","lastSynced":""}',
  presence_profile JSONB NOT NULL DEFAULT '{"eyeColor":"","hairColor":"","height":"","auraSignature":"","scent":"","fashion":"","distinguishingMark":"","visualNotes":""}',
  professional_profile JSONB NOT NULL DEFAULT '{"educationHistory":"","mentorInfo":"","pupilInfo":"","interestedPurviews":"","interestedAttributes":"","interestedAbilities":"","professionalNotes":""}',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Boons Table (Compendium)
CREATE TABLE IF NOT EXISTS boons (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  purview TEXT NOT NULL,
  level INTEGER NOT NULL DEFAULT 1,
  cost TEXT DEFAULT '',
  dice_pool TEXT DEFAULT '',
  description TEXT DEFAULT '',
  effect TEXT DEFAULT '',
  duration TEXT DEFAULT '',
  pantheon TEXT DEFAULT '',
  prerequisites JSONB DEFAULT '[]',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Knacks Table (Compendium)
CREATE TABLE IF NOT EXISTS knacks (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  attribute TEXT NOT NULL,
  tier INTEGER NOT NULL DEFAULT 1,
  cost TEXT DEFAULT '',
  description TEXT DEFAULT '',
  effect TEXT DEFAULT '',
  duration TEXT DEFAULT '',
  prerequisites JSONB DEFAULT '[]',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Callings Table (Compendium)
CREATE TABLE IF NOT EXISTS callings (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  favored_purviews JSONB DEFAULT '[]',
  favored_abilities JSONB DEFAULT '[]',
  innate_ability TEXT DEFAULT '',
  icon_path TEXT DEFAULT '',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Virtues Table (Compendium)
CREATE TABLE IF NOT EXISTS virtues (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  pantheons JSONB DEFAULT '[]',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Natures Table (Compendium)
CREATE TABLE IF NOT EXISTS natures (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  willpower_recovery TEXT DEFAULT '',
  virtue_bonus TEXT DEFAULT '',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Attacks Table (Compendium)
CREATE TABLE IF NOT EXISTS attacks (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'melee',
  accuracy TEXT DEFAULT '',
  damage TEXT DEFAULT '',
  damage_type TEXT DEFAULT 'bashing',
  range TEXT DEFAULT '',
  speed INTEGER DEFAULT 5,
  defense TEXT DEFAULT '',
  tags JSONB DEFAULT '[]',
  requirements TEXT DEFAULT '',
  description TEXT DEFAULT '',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Scionsight Table (Legacy)
CREATE TABLE IF NOT EXISTS scionsight (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  scion_id VARCHAR NOT NULL,
  legend_level INTEGER DEFAULT 1,
  legend_pool_total INTEGER DEFAULT 1,
  willpower_pool_current INTEGER DEFAULT 0,
  willpower_pool_total INTEGER DEFAULT 1,
  defense_dodge INTEGER DEFAULT 0,
  defense_parry INTEGER DEFAULT 0,
  soak_bash INTEGER DEFAULT 0,
  soak_lethal INTEGER DEFAULT 0,
  soak_aggravated INTEGER DEFAULT 0,
  boons JSONB DEFAULT '[]',
  knacks JSONB DEFAULT '[]',
  feats_walk INTEGER DEFAULT 0,
  feats_run INTEGER DEFAULT 0,
  feats_jump INTEGER DEFAULT 0,
  feats_lift INTEGER DEFAULT 0,
  birthrights_creatures TEXT DEFAULT '',
  birthrights_guides TEXT DEFAULT '',
  birthrights_followers TEXT DEFAULT '',
  birthrights_relics TEXT DEFAULT '',
  nature TEXT DEFAULT '',
  calling_1 TEXT DEFAULT '',
  calling_1_rating INTEGER DEFAULT 1,
  calling_2 TEXT DEFAULT '',
  calling_2_rating INTEGER DEFAULT 1,
  calling_3 TEXT DEFAULT '',
  calling_3_rating INTEGER DEFAULT 1,
  legendary_title TEXT DEFAULT '',
  virtue_1 TEXT DEFAULT '',
  virtue_1_rating INTEGER DEFAULT 1,
  virtue_2 TEXT DEFAULT '',
  virtue_2_rating INTEGER DEFAULT 1,
  virtue_3 TEXT DEFAULT '',
  virtue_3_rating INTEGER DEFAULT 1,
  virtue_4 TEXT DEFAULT '',
  virtue_4_rating INTEGER DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Scrolls Table (Legacy)
CREATE TABLE IF NOT EXISTS scrolls (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id VARCHAR DEFAULT '',
  name TEXT NOT NULL,
  pantheon TEXT DEFAULT '',
  is_public TEXT DEFAULT 'true',
  data JSONB DEFAULT '{}',
  zodiac_sign TEXT DEFAULT '',
  playlist_link TEXT DEFAULT '',
  aether_percentage INTEGER DEFAULT 0,
  origin_city TEXT DEFAULT '',
  origin_state TEXT DEFAULT '',
  origin_country TEXT DEFAULT '',
  birth_day TEXT DEFAULT '',
  biography TEXT DEFAULT '',
  serapeum_account_number TEXT DEFAULT '',
  effigy TEXT DEFAULT '',
  psy_description TEXT DEFAULT '',
  psy_tags TEXT DEFAULT '',
  psy_strengths TEXT DEFAULT '',
  psy_weaknesses TEXT DEFAULT '',
  psy_behaviors TEXT DEFAULT '',
  psy_temperament TEXT DEFAULT '',
  psy_intp TEXT DEFAULT '',
  psy_archetypal_arcana TEXT DEFAULT '',
  psy_last_synced TEXT DEFAULT '',
  prof_education_history TEXT DEFAULT '',
  prof_mentor_info TEXT DEFAULT '',
  prof_pupil_info TEXT DEFAULT '',
  prof_interested_purviews TEXT DEFAULT '',
  prof_interested_attributes TEXT DEFAULT '',
  prof_interested_abilities TEXT DEFAULT '',
  prof_professional_notes TEXT DEFAULT '',
  url_prism_cover TEXT DEFAULT '',
  url_portrait_prism TEXT DEFAULT '',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
`

async function createTables() {
  console.log('Creating tables in Supabase...')
  
  const statements = createTablesSql.split(';').filter(s => s.trim().length > 0)
  
  for (const statement of statements) {
    const trimmed = statement.trim()
    if (!trimmed) continue
    
    const tableMatch = trimmed.match(/CREATE TABLE IF NOT EXISTS (\w+)/)
    const tableName = tableMatch ? tableMatch[1] : 'unknown'
    
    console.log(`Creating table: ${tableName}...`)
    
    const { error } = await supabase.rpc('exec_sql', { sql: trimmed + ';' })
    
    if (error) {
      console.error(`Error creating ${tableName}:`, error.message)
    } else {
      console.log(`✓ ${tableName} created successfully`)
    }
  }
  
  console.log('\nDone!')
}

createTables().catch(console.error)
