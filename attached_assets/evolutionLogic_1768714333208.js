export const COST_CONFIG = {
    INCREASE: {
        // Multipliers based on Current Rating
        attribute: { label: "Atributo", multiplier: 4 },
        ability_favored: { label: "Habilidade (Favorecida)", formula: (current) => (current * 2) - 1 },
        ability_standard: { label: "Habilidade", multiplier: 2 },
        virtue: { label: "Virtude", multiplier: 3 },
        willpower: { label: "Força de Vontade", multiplier: 2 },
        legend: { label: "Lenda", multiplier: 8 },
        
        // Epic Attributes
        epic_favored: { label: "Atributo Épico (Favorecido)", multiplier: 4 },
        epic_standard: { label: "Atributo Épico (Padrão)", multiplier: 5 },
        
        // Boons (Esferas)
        boon_pantheon: { label: "Esfera Específica do Panteão", multiplier: 4 },
        boon_favored: { label: "Esfera Especial (Favorecida)", multiplier: 4 },
        boon_standard: { label: "Esfera Especial (Padrão)", multiplier: 5 }
    },
    NEW: {
        // Costs for New Level 1 or Flat costs
        ability: { label: "Habilidade", flat: 3 },
        
        epic_favored: { label: "Atributo Épico (Favorecido)", flat: 8 },
        epic_standard: { label: "Atributo Épico (Padrão)", flat: 10 },
        
        knack: { label: "Truque (Knack)", flat: 5 },
        
        boon_favored_multi: { label: "Dádiva (Favorecida)", multiplier: 4 }, 
        boon_standard_multi: { label: "Dádiva (Padrão)", multiplier: 5 },
        
        boon_pantheon: { label: "Esfera Específica do Panteão", flat: 3 },
        boon_favored: { label: "Esfera Especial (Favorecida)", flat: 3 },
        boon_standard: { label: "Esfera Especial (Padrão)", flat: 4 },
        
        spell_favored: { label: "Feitiço (Favorecido)", multiplier: 4 },
        spell_standard: { label: "Feitiço (Padrão)", multiplier: 5 }
    }
};

/**
 * Calculates XP cost based on the provided table.
 * @param {string} category - The key from COST_CONFIG (e.g., 'attribute', 'knack').
 * @param {number} currentRating - The rating the character HAS currently.
 * @param {boolean} isNew - Whether this is a new acquisition (0 to 1) or separate purchase.
 * @param {number} targetRating - The rating being purchased (usually current + 1).
 */
export const calculateEvolutionCost = (category, currentRating, isNew, targetRating) => {
    let cost = 0;

    if (isNew) {
        const config = COST_CONFIG.NEW[category];
        if (!config) return 0;
        
        if (config.flat) return config.flat;
        // The table says "Usa Nova Classificação" for new traits that are scaled
        if (config.multiplier) return targetRating * config.multiplier;
        
    } else {
        const config = COST_CONFIG.INCREASE[category];
        if (!config) return 0;

        // The table says "Usa a classificação ATUAL" for increases
        if (config.formula) return config.formula(currentRating);
        if (config.multiplier) return currentRating * config.multiplier;
    }

    return Math.floor(cost);
};

export const EVOLUTION_CATEGORIES = [
    { value: 'attribute', label: 'Atributo (Increase)' },
    { value: 'ability_favored', label: 'Habilidade Favorecida (Increase)' },
    { value: 'ability_standard', label: 'Habilidade (Increase)' },
    { value: 'epic_favored', label: 'Atributo Épico Favorecido (Increase)' },
    { value: 'epic_standard', label: 'Atributo Épico (Increase)' },
    { value: 'virtue', label: 'Virtude (Increase)' },
    { value: 'willpower', label: 'Força de Vontade (Increase)' },
    { value: 'legend', label: 'Lenda (Increase)' },
    { value: 'boon_pantheon', label: 'Esfera Panteão (Increase)' },
    { value: 'boon_favored', label: 'Esfera Favorecida (Increase)' },
    { value: 'boon_standard', label: 'Esfera (Increase)' },
    // New
    { value: 'new_ability', label: 'Nova Habilidade (Flat)', ref: 'ability', isNew: true },
    { value: 'new_knack', label: 'Novo Truque (Flat)', ref: 'knack', isNew: true },
    { value: 'new_epic_fav', label: 'Novo Épico Favorecido (Flat)', ref: 'epic_favored', isNew: true },
    { value: 'new_epic_std', label: 'Novo Épico (Flat)', ref: 'epic_standard', isNew: true },
    { value: 'new_boon_pan', label: 'Nova Esfera Panteão (Flat)', ref: 'boon_pantheon', isNew: true },
    { value: 'new_boon_fav', label: 'Nova Esfera Favorecida (Flat)', ref: 'boon_favored', isNew: true },
    { value: 'new_boon_std', label: 'Nova Esfera (Flat)', ref: 'boon_standard', isNew: true },
    { value: 'new_spell_fav', label: 'Novo Feitiço Favorecido', ref: 'spell_favored', isNew: true },
    { value: 'new_spell_std', label: 'Novo Feitiço', ref: 'spell_standard', isNew: true },
];

// Aliases for backward compatibility with EvolutionModal.jsx if needed, 
// though we will update the component to use the new names.
export const TRAIT_TYPES = EVOLUTION_CATEGORIES;
export const calculateCost = (category, currentRating, isNew) => calculateEvolutionCost(category, currentRating, isNew, currentRating + 1);