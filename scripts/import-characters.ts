import { db } from "../server/db";
import { characters } from "../shared/schema";
import * as fs from "fs";
import * as path from "path";

function parseCSV(content: string): Record<string, string>[] {
  const lines = content.split('\n');
  const headers = parseCSVLine(lines[0]);
  const rows: Record<string, string>[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const values = parseCSVLine(line);
    const row: Record<string, string> = {};
    
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = values[j] || '';
    }
    rows.push(row);
  }
  
  return rows;
}

function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let j = 0; j < line.length; j++) {
    const char = line[j];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current.trim());
  return values;
}

async function importCharacters() {
  console.log("Starting character import...");
  
  const scrollsFile = path.join(process.cwd(), 'attached_assets/scrolls_rows_(2)_1768719840139.csv');
  const scionsightFile = path.join(process.cwd(), 'attached_assets/scionsight_rows_(2)_1768719840138.csv');
  
  const scrollsContent = fs.readFileSync(scrollsFile, 'utf-8');
  const scionsightContent = fs.readFileSync(scionsightFile, 'utf-8');
  
  const scrollsRows = parseCSV(scrollsContent);
  const scionsightRows = parseCSV(scionsightContent);
  
  // Create a map of scionsight data by scion_id
  const scionsightMap = new Map<string, Record<string, string>>();
  for (const row of scionsightRows) {
    scionsightMap.set(row.scion_id, row);
  }
  
  console.log(`Found ${scrollsRows.length} characters to import`);
  
  let imported = 0;
  
  for (const scroll of scrollsRows) {
    const scionId = scroll.id;
    const scionsight = scionsightMap.get(scionId);
    
    try {
      // Parse the JSON data field if it exists
      let dataObj: any = {};
      if (scroll.data) {
        try {
          dataObj = JSON.parse(scroll.data);
        } catch (e) {
          console.log(`Could not parse data for ${scroll.name}`);
        }
      }
      
      // Extract attributes from nested data
      let attributes = {
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
      
      // Try to extract attributes from nested data
      const attrs = dataObj?.attributes || dataObj?.data?.attributes || dataObj?.data?.data?.attributes;
      if (attrs) {
        if (attrs.physical) {
          attributes.Physical[0].value = attrs.physical.strength || 1;
          attributes.Physical[1].value = attrs.physical.dexterity || 1;
          attributes.Physical[2].value = attrs.physical.stamina || 1;
        }
        if (attrs.social) {
          attributes.Social[0].value = attrs.social.charisma || 1;
          attributes.Social[1].value = attrs.social.manipulation || 1;
          attributes.Social[2].value = attrs.social.appearance || 1;
        }
        if (attrs.mental) {
          attributes.Mental[0].value = attrs.mental.perception || 1;
          attributes.Mental[1].value = attrs.mental.intelligence || 1;
          attributes.Mental[2].value = attrs.mental.wits || 1;
        }
      }
      
      // Extract legend from scionsight
      const legend = scionsight ? parseInt(scionsight.legend_level) || 1 : 1;
      const legendPoolTotal = scionsight ? parseInt(scionsight.legend_pool_total) || legend * legend : legend * legend;
      
      // Extract virtues from scionsight
      const virtues = [
        { id: 1, name: scionsight?.virtue_1 || "Valor", value: parseInt(scionsight?.virtue_1_rating) || 1 },
        { id: 2, name: scionsight?.virtue_2 || "Harmony", value: parseInt(scionsight?.virtue_2_rating) || 1 },
        { id: 3, name: scionsight?.virtue_3 || "Order", value: parseInt(scionsight?.virtue_3_rating) || 1 },
        { id: 4, name: scionsight?.virtue_4 || "Piety", value: parseInt(scionsight?.virtue_4_rating) || 1 },
        { id: 5, name: "", value: 1 }
      ];
      
      // Extract callings
      const callings = [
        { id: 1, name: scionsight?.calling_1 || "", title: "", value: parseInt(scionsight?.calling_1_rating) || 1 },
        { id: 2, name: scionsight?.calling_2 || "", title: "", value: parseInt(scionsight?.calling_2_rating) || 1 },
        { id: 3, name: scionsight?.calling_3 || "", title: "", value: parseInt(scionsight?.calling_3_rating) || 1 }
      ];
      
      // Extract divine parent/heritage
      const heritage = dataObj?.heritage || dataObj?.data?.heritage || "";
      
      // Build psychic profile
      const psychicProfile = {
        analysis: scroll.psy_description || "",
        keywords: scroll.psy_tags || "",
        strengths: scroll.psy_strengths || "",
        behaviors: scroll.psy_behaviors || "",
        weaknesses: scroll.psy_weaknesses || "",
        temperament: scroll.psy_temperament || "",
        cognitiveType: scroll.psy_intp || "",
        majorArcana: scroll.psy_archetypal_arcana || ""
      };
      
      // Build presence profile
      const presenceProfile = {
        eyeColor: "",
        hairColor: "",
        height: "",
        auraSignature: "",
        scent: "",
        fashion: "",
        distinguishingMark: "",
        visualNotes: ""
      };
      
      const willpower = scionsight ? parseInt(scionsight.willpower_pool_total) || 5 : 5;
      
      await db.insert(characters).values({
        name: scroll.name || "Unknown",
        player: "",
        pantheon: scroll.pantheon || "",
        divineParent: heritage,
        dateOfBirth: scroll.birth_day || "",
        nationality: scroll.origin_country || "",
        cityOfOrigin: scroll.origin_city || "",
        stateRegion: scroll.origin_state || "",
        legend: legend,
        legendPointsCurrent: 0,
        attributes: attributes,
        abilities: {},
        callings: callings,
        virtues: virtues,
        willpower: willpower,
        willpowerCurrent: willpower,
        extraOxBody: 0,
        healthDamage: [],
        knacks: [],
        boons: [],
        weapons: [],
        armorList: [],
        feats: [],
        portrait: null,
        psychicProfile: psychicProfile,
        presenceProfile: presenceProfile
      });
      
      imported++;
      console.log(`Imported: ${scroll.name} (${scroll.pantheon})`);
      
    } catch (error) {
      console.error(`Error importing "${scroll.name}":`, error);
    }
  }
  
  console.log(`\nImport complete! Imported ${imported} characters.`);
  process.exit(0);
}

importCharacters().catch(console.error);
