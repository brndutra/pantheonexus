import { db } from "../server/db";
import { boons } from "../shared/schema";
import * as fs from "fs";
import * as path from "path";

interface BoonRow {
  purview: string;
  name: string;
  cost: string;
  dice_pool: string;
  resistance: string;
  description: string;
  id: string;
  tier: string;
  action: string;
  duration: string;
  prerequisites: string;
  tags: string;
}

function parseCSV(content: string): BoonRow[] {
  const lines = content.split('\n');
  const headers = lines[0].split(',');
  const rows: BoonRow[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
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
    
    if (values.length >= 6 && values[1]) {
      rows.push({
        purview: values[0] || '',
        name: values[1] || '',
        cost: values[2] || '',
        dice_pool: values[3] || '',
        resistance: values[4] || '',
        description: values[5] || '',
        id: values[6] || '',
        tier: values[7] || '1',
        action: values[8] || '',
        duration: values[9] || '',
        prerequisites: values[10] || '[]',
        tags: values[11] || '[]'
      });
    }
  }
  
  return rows;
}

async function importBoons() {
  console.log("Starting boon import...");
  
  const file1 = path.join(process.cwd(), 'attached_assets/boons_capitals_rows_(1)_1768719705290.csv');
  const file2 = path.join(process.cwd(), 'attached_assets/boons_specials_rows_1768719705290.csv');
  
  const content1 = fs.readFileSync(file1, 'utf-8');
  const content2 = fs.readFileSync(file2, 'utf-8');
  
  const rows1 = parseCSV(content1);
  const rows2 = parseCSV(content2);
  
  const allRows = [...rows1, ...rows2];
  console.log(`Found ${allRows.length} boons to import`);
  
  let imported = 0;
  let skipped = 0;
  
  for (const row of allRows) {
    try {
      const tierNum = parseInt(row.tier) || 1;
      const prereqs = row.prerequisites === '[]' ? [] : JSON.parse(row.prerequisites);
      
      await db.insert(boons).values({
        name: row.name,
        purview: row.purview,
        level: tierNum,
        cost: row.cost === '—' ? '' : row.cost,
        dicePool: row.dice_pool === '—' ? '' : row.dice_pool,
        description: row.description,
        effect: '',
        duration: row.duration,
        pantheon: '',
        prerequisites: prereqs
      });
      
      imported++;
      if (imported % 50 === 0) {
        console.log(`Imported ${imported} boons...`);
      }
    } catch (error) {
      console.error(`Error importing "${row.name}":`, error);
      skipped++;
    }
  }
  
  console.log(`\nImport complete!`);
  console.log(`Imported: ${imported}`);
  console.log(`Skipped: ${skipped}`);
  
  process.exit(0);
}

importBoons().catch(console.error);
