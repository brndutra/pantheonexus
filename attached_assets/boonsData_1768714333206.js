export const PURVIEWS = [
  {
    id: "general",
    name: "Geral",
    icon: "Star",
    boons: [
      { level: 1, name: "Sky's Grace", cost: "None", type: "Passive", description: "O Scion não sofre dano de queda de qualquer altura." },
      { level: 1, name: "Water Breathing", cost: "1 Legend", type: "Scene", description: "Permite respirar embaixo d'água por uma cena." },
      { level: 1, name: "Cat's Grace", cost: "1 Legend", type: "Reflexive", description: "Adiciona perfeição ao equilíbrio e saltos." }
    ]
  },
  {
    id: "war",
    name: "Guerra (War)",
    icon: "Swords",
    boons: [
      { level: 1, name: "Blessing of Bravery", cost: "1 Legend", type: "Supplemental", description: "Inspira coragem em um aliado (+1 dado em Willpower)." },
      { level: 2, name: "Battle Cry", cost: "1 Willpower", type: "Simple", description: "Inimigos devem testar Willpower ou sofrem penalidade de -2 em jogadas." },
      { level: 3, name: "Warrior's Ideal", cost: "3 Legend", type: "Scene", description: "Ganha bônus em todos os ataques e defesas igual ao nível de Legend por uma cena." }
    ]
  },
  {
    id: "sun",
    name: "Sol (Sun)",
    icon: "Sun",
    boons: [
      { level: 1, name: "Penetrating Glare", cost: "1 Legend", type: "Reflexive", description: "Ignora penalidades de escuridão ou camuflagem visual." },
      { level: 2, name: "Divine Radiance", cost: "2 Legend", type: "Simple", description: "Emite luz solar intensa que causa dano a criaturas das trevas." },
      { level: 3, name: "Heavenly Fire", cost: "1 Willpower", type: "Simple", description: "Ataque à distância com raio de luz solar pura (Lethal damage)." }
    ]
  },
  {
    id: "chaos",
    name: "Caos (Chaos)",
    icon: "Zap",
    boons: [
      { level: 1, name: "Eye of the Storm", cost: "1 Legend", type: "Reflexive", description: "Imune a penalidades de confusão ou tumulto." },
      { level: 2, name: "Hornet's Nest", cost: "2 Legend", type: "Simple", description: "Causa frenesi ou confusão em um grupo de mortais." },
      { level: 3, name: "Paralyzing Confusion", cost: "3 Legend", type: "Simple", description: "O alvo perde sua próxima ação devido à indecisão absoluta." }
    ]
  },
  {
    id: "death",
    name: "Morte (Death)",
    icon: "Skull",
    boons: [
      { level: 1, name: "Death Senses", cost: "None", type: "Permanent", description: "Pode ver e ouvir fantasmas." },
      { level: 2, name: "Summon Ghost", cost: "1 Legend", type: "Simple", description: "Convoca um fantasma próximo para conversar ou servir." },
      { level: 3, name: "Rotting Flesh", cost: "2 Legend", type: "Simple", description: "O toque do Scion causa necrose (Aggravated damage em mortais)." }
    ]
  },
  {
    id: "guardian",
    name: "Guardião (Guardian)",
    icon: "Shield",
    boons: [
      { level: 1, name: "Vigil Brand", cost: "1 Legend", type: "Simple", description: "Marca um objeto ou pessoa. O Scion sabe a direção e distância." },
      { level: 2, name: "Aegis", cost: "1 Willpower", type: "Scene", description: "Adiciona +2 ao Soak e DV de um aliado protegido." },
      { level: 3, name: "Warding Bond", cost: "3 Legend", type: "Permanent", description: "Transfere dano sofrido por um protegido para o Scion." }
    ]
  }
];

// Export BOON_DATA as an alias or flattened structure if needed by other components
// For now, we can just export PURVIEWS as BOON_DATA to satisfy the import, 
// or create a flattened list if that's what the component expects.
// Based on usage, it seems to just need the data available.
export const BOON_DATA = PURVIEWS;