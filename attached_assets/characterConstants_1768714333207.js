export const SKILL_GROUPS = {
  physical: [
    "athletics", "brawl", "drive", "firearms", "larceny", "stealth", "survival", "weaponry"
  ],
  social: [
    "animal_ken", "empathy", "expression", "intimidation", "persuasion", "socialize", "streetwise", "subterfuge"
  ],
  mental: [
    "academics", "computer", "crafts", "investigation", "medicine", "occult", "politics", "science"
  ]
};

// Legacy aliases for UI components expecting column layout
SKILL_GROUPS.column1 = SKILL_GROUPS.physical;
SKILL_GROUPS.column2 = SKILL_GROUPS.social;
SKILL_GROUPS.column3 = SKILL_GROUPS.mental;

export const ATTRIBUTES = {
  physical: ["Strength", "Dexterity", "Stamina"], // Changed "Vigor" to "Stamina"
  social: ["Charisma", "Manipulation", "Appearance"],
  mental: ["Perception", "Intelligence", "Wits"]
};

export const ATTRIBUTE_MAP = {
  "Strength": "strength", "Dexterity": "dexterity", "Stamina": "stamina", // Changed "Vigor" to "Stamina"
  "Charisma": "charisma", "Manipulation": "manipulation", "Appearance": "appearance",
  "Perception": "perception", "Intelligence": "intelligence", "Wits": "wits"
};

export const PANTHEONS = [
  "Aesir", "Theoi", "Netjer", "Kami", "Tuatha", "Atzlánti", "Loa", "Deva", "Amatsukami", "Yazata", "Deos", "Mexica"
];

export const NATURES = [
  "Architect", "Autocrat", "Bravo", "Caregiver", "Celebrant", "Competitor", "Confidant", "Cynic", 
  "Fanatic", "Gallant", "Judge", "Loner", "Martyr", "Masochist", "Monster", "Pedagogue", 
  "Penitent", "Perfectionist", "Rebel", "Rogue", "Survivor", "Traditionalist", "Visionary"
];

export const VIRTUES_LIST = [
  "Ambition", "Courage", "Endurance", "Expression", "Loyalty"
];

export const CALLING_PRESETS = [
  "Creator", "Destroyer", "Guardian", "Guide", "Healer", "Hunter", "Judge", "Leader", "Lover", "Sage", "Trickster", "Warrior"
];

export const getLegendTier = (level) => {
  if (level >= 9) return "God";
  if (level >= 5) return "Demigod";
  return "Hero";
};

export const getZodiacSign = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.getMonth() + 1;

  if ((month === 1 && day <= 20) || (month === 12 && day >= 22)) return "Capricorn";
  if ((month === 1 && day >= 21) || (month === 2 && day <= 18)) return "Aquarius";
  if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return "Pisces";
  if ((month === 3 && day >= 21) || (month === 4 && day <= 20)) return "Aries";
  if ((month === 4 && day >= 21) || (month === 5 && day <= 20)) return "Taurus";
  if ((month === 5 && day >= 21) || (month === 6 && day <= 21)) return "Gemini";
  if ((month === 6 && day >= 22) || (month === 7 && day <= 22)) return "Cancer";
  if ((month === 7 && day >= 23) || (month === 8 && day <= 23)) return "Leo";
  if ((month === 8 && day >= 24) || (month === 9 && day <= 23)) return "Virgo";
  if ((month === 9 && day >= 24) || (month === 10 && day <= 23)) return "Libra";
  if ((month === 10 && day >= 24) || (month === 11 && day <= 22)) return "Scorpio";
  if ((month === 11 && day >= 23) || (month === 12 && day <= 21)) return "Sagittarius";
  return "";
};

export const lookupState = (city) => {
  const cityMap = {
    "New York": "NY", "Los Angeles": "CA", "Chicago": "IL", "Houston": "TX",
    "Phoenix": "AZ", "Philadelphia": "PA", "San Antonio": "TX", "San Diego": "CA",
    "Dallas": "TX", "San Jose": "CA", "Austin": "TX", "Jacksonville": "FL",
    "Fort Worth": "TX", "Columbus": "OH", "San Francisco": "CA", "Charlotte": "NC",
    "Indianapolis": "IN", "Seattle": "WA", "Denver": "CO", "Washington": "DC"
  };
  return cityMap[city] || "";
};