
/**
 * Calculates (Wits + Awareness)
 * @param {number} wits 
 * @param {number} awareness 
 * @returns {number}
 */
export const calculateWitsAwareness = (wits, awareness) => {
    return (parseInt(wits) || 0) + (parseInt(awareness) || 0);
};

/**
 * Calculates Base Initiative: (Dexterity + Awareness + Legend) / 2
 * @param {number} dex 
 * @param {number} awareness 
 * @param {number} legend 
 * @returns {number}
 */
export const calculateBaseInit = (dex, awareness, legend) => {
    const val = (parseInt(dex) || 0) + (parseInt(awareness) || 0) + (parseInt(legend) || 0);
    return Math.floor(val / 2); // Assuming floor for integer result
};

/**
 * Calculates Dodge DV: (Dexterity + Awareness + Legend) / 2
 * @param {number} dex 
 * @param {number} awareness 
 * @param {number} legend 
 * @returns {number}
 */
export const calculateDodgeDV = (dex, awareness, legend) => {
    const val = (parseInt(dex) || 0) + (parseInt(awareness) || 0) + (parseInt(legend) || 0);
    return Math.floor(val / 2);
};

/**
 * Calculates Parry DV: (Dexterity + Melee + WeaponDefense) / 2
 * @param {number} dex 
 * @param {number} melee 
 * @param {number} weaponDefense 
 * @returns {number}
 */
export const calculateParryDV = (dex, melee, weaponDefense) => {
    const val = (parseInt(dex) || 0) + (parseInt(melee) || 0) + (parseInt(weaponDefense) || 0);
    return Math.floor(val / 2);
};

/**
 * Calculates Attack Pool: Attribute + Ability + Stunt
 * @param {number} attribute 
 * @param {number} ability 
 * @param {number} stunt 
 * @returns {number}
 */
export const calculateAttackPool = (attribute, ability, stunt) => {
    return (parseInt(attribute) || 0) + (parseInt(ability) || 0) + (parseInt(stunt) || 0);
};
