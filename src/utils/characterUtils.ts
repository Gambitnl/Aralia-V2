/**
 * @file src/utils/characterUtils.ts
 * This file contains utility functions related to player characters,
 * such as calculating ability score modifiers, armor class, and armor proficiency.
 */
import { PlayerCharacter, ArmorProficiencyLevel, ArmorCategory, Item, CanEquipResult, AbilityScores } from '../types';

/**
 * Calculates the D&D ability score modifier as a number.
 * @param {number} score - The ability score.
 * @returns {number} The numerical modifier (e.g., 2, -1, 0).
 */
export const getAbilityModifierValue = (score: number): number => {
  return Math.floor((score - 10) / 2);
};

/**
 * Calculates the D&D ability score modifier and returns it as a string.
 * @param {number} score - The ability score.
 * @returns {string} The modifier string (e.g., "+2", "-1", "0").
 */
export const getAbilityModifierString = (score: number): string => {
  const mod = getAbilityModifierValue(score);
  if (mod >= 0) {
    return `+${mod}`;
  }
  return `${mod}`;
};

/**
 * Calculates the Armor Class (AC) for a given character.
 * @param {PlayerCharacter} character - The player character.
 * @returns {number} The calculated Armor Class.
 */
export const calculateArmorClass = (character: PlayerCharacter): number => {
  let ac = 10; // Base AC for unarmored

  const equippedArmor = character.equippedItems?.Torso;
  const equippedShield = character.equippedItems?.OffHand;
  const dexModifier = getAbilityModifierValue(character.finalAbilityScores.Dexterity);

  if (equippedArmor && equippedArmor.type === 'armor' && equippedArmor.baseArmorClass !== undefined) {
    ac = equippedArmor.baseArmorClass;
    if (equippedArmor.addsDexterityModifier) {
      if (equippedArmor.maxDexterityBonus !== undefined) {
        ac += Math.min(dexModifier, equippedArmor.maxDexterityBonus);
      } else {
        ac += dexModifier;
      }
    }
  } else {
    // Unarmored, so base 10 + Dex
    ac += dexModifier;
  }

  if (equippedShield && equippedShield.type === 'armor' && equippedShield.armorCategory === 'Shield' && equippedShield.armorClassBonus) {
    ac += equippedShield.armorClassBonus;
  }

  if (character.selectedFightingStyle?.id === 'defense' && equippedArmor) {
    ac += 1;
  }
  
  // Placeholder for other AC modifiers (e.g. spells, other magic items)
  // For example, a Ring of Protection might add +1.
  // Object.values(character.equippedItems || {}).forEach(item => {
  //   if (item && item.armorClassBonus && item.slot !== 'OffHand' && item.slot !== 'Torso') { // Avoid double counting shield/armor
  //     ac += item.armorClassBonus;
  //   }
  // });

  return ac;
};


/**
 * Determines if a character can equip a given item and why.
 * @param {PlayerCharacter} character - The player character.
 * @param {Item} item - The item to check.
 * @returns {CanEquipResult} An object indicating if the item can be equipped and the reason if not.
 */
export const canEquipItem = (character: PlayerCharacter, item: Item): CanEquipResult => {
  if (!item.slot) {
    return { can: false, reason: "Item cannot be equipped (no slot)." };
  }

  const classProficiencies = character.class.armorProficiencies.map(p => p.toLowerCase());
  const classWeaponProficiencies = character.class.weaponProficiencies.map(p => p.toLowerCase());

  if (item.type === 'armor') {
    // Check Shield Proficiency
    if (item.armorCategory === 'Shield') {
      if (!classProficiencies.includes('shields')) {
        return { can: false, reason: "Not proficient with shields." };
      }
    } else if (item.armorCategory) { // Body Armor
      const categoryLower = item.armorCategory.toLowerCase() as Lowercase<ArmorCategory>;
      if (!classProficiencies.includes('all armor') && !classProficiencies.includes(`${categoryLower} armor` as `${typeof categoryLower} armor`)) {
         // Check if character has specific armor proficiency (e.g. "Plate Armor" string if item name matches)
         // This is a simplified check; a real system might use tags or more granular proficiency lists.
         if (!classProficiencies.includes(item.name.toLowerCase())) {
            return { can: false, reason: `Not proficient with ${item.armorCategory} armor.` };
         }
      }
      // Check Strength Requirement
      if (item.strengthRequirement && character.finalAbilityScores.Strength < item.strengthRequirement) {
        return { can: false, reason: `Requires ${item.strengthRequirement} Strength (you have ${character.finalAbilityScores.Strength}). You'd suffer penalties.` };
      }
    }
  } else if (item.type === 'weapon') {
    const weaponNameLower = item.name.toLowerCase();
    if (item.isMartial) {
      if (!classWeaponProficiencies.includes('martial weapons') && !classWeaponProficiencies.includes(weaponNameLower)) {
        return { can: false, reason: "Not proficient with martial weapons." };
      }
    } else { // Simple weapon
      if (!classWeaponProficiencies.includes('simple weapons') && !classWeaponProficiencies.includes(weaponNameLower)) {
        return { can: false, reason: "Not proficient with simple weapons." };
      }
    }
  }
  // Accessories and other types are generally equippable without specific proficiency unless item itself states otherwise
  return { can: true };
};


/**
 * Gets the character's maximum armor proficiency level (e.g., 'light', 'medium', 'heavy').
 * This is a simplified interpretation. D&D proficiencies can be more granular.
 * @param {PlayerCharacter} character - The player character.
 * @returns {ArmorProficiencyLevel} The highest level of armor proficiency.
 */
export function getCharacterMaxArmorProficiency(character: PlayerCharacter): ArmorProficiencyLevel {
  const proficiencies = character.class.armorProficiencies.map(p => p.toLowerCase());

  if (proficiencies.includes('all armor') || proficiencies.includes('heavy armor')) {
    return 'heavy';
  }
  if (proficiencies.includes('medium armor')) {
    return 'medium';
  }
  if (proficiencies.includes('light armor')) {
    return 'light';
  }
  return 'unarmored';
}

/**
 * Gets a numerical hierarchy value for armor categories to compare proficiency levels.
 * Higher numbers mean heavier armor.
 * @param {ArmorCategory} [category] - The armor category.
 * @returns {number} A numerical value representing the armor category's "heaviness".
 */
export function getArmorCategoryHierarchy(category?: ArmorCategory): number {
  if (!category) return 0; // Unarmored or non-armor
  switch (category) {
    case 'Light': return 1;
    case 'Medium': return 2;
    case 'Heavy': return 3;
    case 'Shield': return 0; // Shields are separate from body armor hierarchy for this purpose
    default: return 0;
  }
}
