/**
 * @file src/data/classes/index.ts
 * Defines all class data for the Aralia RPG.
 */
import { Class as CharClass, FightingStyle, DivineDomain, ClassFeature, AbilityScoreName } from '../types';

const FIGHTING_STYLES_DATA: Record<string, FightingStyle> = {
  'archery': { id: 'archery', name: 'Archery', description: '+2 bonus to attack rolls with ranged weapons.', levelAvailable: 1 },
  'defense': { id: 'defense', name: 'Defense', description: '+1 bonus to AC while wearing armor.', levelAvailable: 1 },
  'dueling': { id: 'dueling', name: 'Dueling', description: '+2 damage with a melee weapon in one hand and no other weapon.', levelAvailable: 1 },
  'great_weapon_fighting': { id: 'great_weapon_fighting', name: 'Great Weapon Fighting', description: 'Reroll 1s and 2s on damage dice with two-handed melee weapons.', levelAvailable: 1 }
};

const LIFE_DOMAIN_FEATURES: ClassFeature[] = [
    { id: 'life_bonus_proficiency', name: 'Bonus Proficiency (Heavy Armor)', description: 'You gain proficiency with heavy armor.', levelAvailable: 1},
    { id: 'life_disciple', name: 'Disciple of Life', description: 'Your healing spells are more effective. Whenever you use a spell of 1st level or higher to restore hit points to a creature, the creature regains additional hit points equal to 2 + the spell’s level.', levelAvailable: 1}
];

const LIFE_DOMAIN: DivineDomain = {
  id: 'life_domain', name: 'Life Domain', description: 'The Life domain focuses on the vibrant positive energy – one of the fundamental forces of the universe – that sustains all life.', levelAvailable: 1,
  domainSpells: { 1: ['bless', 'cure_wounds'] }, // Spell IDs
  features: LIFE_DOMAIN_FEATURES
};

const CLERIC_SPELL_LIST = ['sacred_flame', 'light', 'guidance', 'cure_wounds', 'healing_word', 'bless']; // IDs
const WIZARD_SPELL_LIST = ['fire_bolt', 'light', 'mage_hand', 'magic_missile', 'shield', 'prestidigitation', 'detect_magic', 'misty_step', 'minor_illusion']; // IDs

export const CLASSES_DATA: Record<string, CharClass> = {
  'fighter': {
    id: 'fighter', name: 'Fighter', description: 'Masters of combat, skilled with a variety of weapons and armor.',
    hitDie: 10, primaryAbility: ['Strength', 'Dexterity'], savingThrowProficiencies: ['Strength', 'Constitution'],
    skillProficienciesAvailable: ['acrobatics', 'animal_handling', 'athletics', 'history', 'insight', 'intimidation', 'perception', 'survival'],
    numberOfSkillProficiencies: 2,
    armorProficiencies: ['All armor', 'Shields'], weaponProficiencies: ['Simple weapons', 'Martial weapons'],
    features: [{ id: 'second_wind', name: 'Second Wind', description: 'Regain hit points as a bonus action.', levelAvailable: 1 }],
    fightingStyles: Object.values(FIGHTING_STYLES_DATA),
    statRecommendationFocus: ['Strength', 'Dexterity', 'Constitution'],
    statRecommendationDetails: "Prioritize Strength (for heavy weapons/armor) OR Dexterity (for finesse/ranged weapons). Constitution is vital for hit points. Choose based on your intended combat style and selected Fighting Style.",
    recommendedPointBuyPriorities: ['Strength', 'Constitution', 'Dexterity', 'Wisdom', 'Charisma', 'Intelligence'], // Example, could vary based on common fighter builds
  },
  'cleric': {
    id: 'cleric', name: 'Cleric', description: 'Warriors of the gods, wielding divine magic.',
    hitDie: 8, primaryAbility: ['Wisdom'], savingThrowProficiencies: ['Wisdom', 'Charisma'],
    skillProficienciesAvailable: ['history', 'insight', 'medicine', 'persuasion', 'religion'],
    numberOfSkillProficiencies: 2,
    armorProficiencies: ['Light armor', 'Medium armor', 'Shields'], weaponProficiencies: ['Simple weapons'],
    features: [], // Domain features are part of the DivineDomain object
    divineDomains: [LIFE_DOMAIN],
    spellcasting: { ability: 'Wisdom', knownCantrips: 3, knownSpellsL1: 2, spellList: CLERIC_SPELL_LIST },
    statRecommendationFocus: ['Wisdom', 'Constitution', 'Strength'],
    statRecommendationDetails: "Wisdom is crucial for your spellcasting. Constitution increases your survivability. Strength can be useful if you plan to engage in melee, especially with heavier armor from certain domains.",
    recommendedPointBuyPriorities: ['Wisdom', 'Constitution', 'Strength', 'Dexterity', 'Charisma', 'Intelligence'],
  },
  'wizard': {
    id: 'wizard', name: 'Wizard', description: 'Scholarly magic-users capable of manipulating the fabric of reality.',
    hitDie: 6, primaryAbility: ['Intelligence'], savingThrowProficiencies: ['Intelligence', 'Wisdom'],
    skillProficienciesAvailable: ['arcana', 'history', 'insight', 'investigation', 'medicine', 'religion'],
    numberOfSkillProficiencies: 2,
    armorProficiencies: [], weaponProficiencies: ['Daggers', 'Darts', 'Slings', 'Quarterstaffs', 'Light crossbows'],
    features: [{ id: 'arcane_recovery', name: 'Arcane Recovery', description: 'Recover some spell slots during a short rest.', levelAvailable: 1 }],
    spellcasting: { ability: 'Intelligence', knownCantrips: 3, knownSpellsL1: 2, spellList: WIZARD_SPELL_LIST },
    statRecommendationFocus: ['Intelligence', 'Constitution', 'Dexterity'],
    statRecommendationDetails: "Intelligence is paramount for your spellcasting effectiveness. Constitution helps with concentration and hit points. Dexterity can improve your Armor Class, as wizards typically wear no armor.",
    recommendedPointBuyPriorities: ['Intelligence', 'Constitution', 'Dexterity', 'Wisdom', 'Charisma', 'Strength'],
  }
};