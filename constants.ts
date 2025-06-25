/**
 * @file constants.ts
 * This file (at the root level) defines global constants and foundational game data
 * for the Aralia RPG application. It includes game phases, D&D related data
 * (ability scores, skills, spells, classes), and initial game world data (items, NPCs, locations).
 * It often aggregates or re-exports data from more specific data modules (e.g., from `src/data/races`).
 */

import { PlayerCharacter, Race, Class as CharClass, AbilityScores, Skill, FightingStyle, AbilityScoreName, Spell, DivineDomain, Location, Item, NPC, ClassFeature, DraconicAncestryInfo, ElvenLineage, ElvenLineageType, GnomeSubrace, GnomeSubraceType, GamePhase } from './src/types'; // Updated import path
import { ALL_RACES_DATA, DRAGONBORN_ANCESTRIES_DATA } from './src/data/races'; // Import from the new data structure

// GamePhase is now imported from ./src/types which re-exports it from ./src/constants
// export enum GamePhase {
//   CHARACTER_CREATION = 'CHARACTER_CREATION',
//   START_SCREEN = 'START_SCREEN', // Will be deprecated by CHARACTER_CREATION
//   PLAYING = 'PLAYING',
//   GAME_OVER = 'GAME_OVER',
//   MAIN_MENU = 'MAIN_MENU', // Added for main menu state
// }

// D&D Data
export const STANDARD_ABILITY_SCORES: number[] = [15, 14, 13, 12, 10, 8];
export const ABILITY_SCORE_NAMES: AbilityScoreName[] = ['Strength', 'Dexterity', 'Constitution', 'Intelligence', 'Wisdom', 'Charisma'];
export const RELEVANT_SPELLCASTING_ABILITIES: AbilityScoreName[] = ['Intelligence', 'Wisdom', 'Charisma'];


export const SKILLS_DATA: Record<string, Skill> = {
  'acrobatics': { id: 'acrobatics', name: 'Acrobatics', ability: 'Dexterity' },
  'animal_handling': { id: 'animal_handling', name: 'Animal Handling', ability: 'Wisdom' },
  'arcana': { id: 'arcana', name: 'Arcana', ability: 'Intelligence' },
  'athletics': { id: 'athletics', name: 'Athletics', ability: 'Strength' },
  'deception': { id: 'deception', name: 'Deception', ability: 'Charisma' },
  'history': { id: 'history', name: 'History', ability: 'Intelligence' },
  'insight': { id: 'insight', name: 'Insight', ability: 'Wisdom' },
  'intimidation': { id: 'intimidation', name: 'Intimidation', ability: 'Charisma' },
  'investigation': { id: 'investigation', name: 'Investigation', ability: 'Intelligence' },
  'medicine': { id: 'medicine', name: 'Medicine', ability: 'Wisdom' },
  'nature': { id: 'nature', name: 'Nature', ability: 'Intelligence' },
  'perception': { id: 'perception', name: 'Perception', ability: 'Wisdom' },
  'performance': { id: 'performance', name: 'Performance', ability: 'Charisma' },
  'persuasion': { id: 'persuasion', name: 'Persuasion', ability: 'Charisma' },
  'religion': { id: 'religion', name: 'Religion', ability: 'Intelligence' },
  'sleight_of_hand': { id: 'sleight_of_hand', name: 'Sleight of Hand', ability: 'Dexterity' },
  'stealth': { id: 'stealth', name: 'Stealth', ability: 'Dexterity' },
  'survival': { id: 'survival', name: 'Survival', ability: 'Wisdom' },
};

export const RACES_DATA: Record<string, Race> = ALL_RACES_DATA;
export { DRAGONBORN_ANCESTRIES_DATA as DRAGONBORN_ANCESTRIES };
// For Elven Lineages, the data is part of the ELF_DATA object within ALL_RACES_DATA
// For Gnome Subraces, the data is part of the GNOME_DATA object within ALL_RACES_DATA


export const SPELLS_DATA: Record<string, Spell> = {
  // Cantrips
  'fire_bolt': { id: 'fire_bolt', name: 'Fire Bolt', level: 0, description: 'Hurl a mote of fire.' },
  'light': { id: 'light', name: 'Light', level: 0, description: 'Make an object shed bright light.' },
  'mage_hand': { id: 'mage_hand', name: 'Mage Hand', level: 0, description: 'Create a spectral, floating hand.' },
  'sacred_flame': { id: 'sacred_flame', name: 'Sacred Flame', level: 0, description: 'Flame-like radiance descends on a creature.' },
  'guidance': { id: 'guidance', name: 'Guidance', level: 0, description: 'Touch one willing creature. Once before the spell ends, the target can roll a d4 and add the number rolled to one ability check of its choice.'},
  'dancing_lights': { id: 'dancing_lights', name: 'Dancing Lights', level: 0, description: 'Create up to four torch-sized lights that hover in the air.' },
  'prestidigitation': { id: 'prestidigitation', name: 'Prestidigitation', level: 0, description: 'You create one of several minor magical effects.' },
  'druidcraft': { id: 'druidcraft', name: 'Druidcraft', level: 0, description: 'You create a tiny, harmless sensory effect that predicts weather or interacts with nature.' },
  'minor_illusion': { id: 'minor_illusion', name: 'Minor Illusion', level: 0, description: 'Create a sound or an image of an object within range that lasts for the duration.' },
  
  // Level 1
  'magic_missile': { id: 'magic_missile', name: 'Magic Missile', level: 1, description: 'Create three glowing darts of magical force.' },
  'shield': { id: 'shield', name: 'Shield', level: 1, description: 'An invisible barrier of magical force appears and protects you.' },
  'cure_wounds': { id: 'cure_wounds', name: 'Cure Wounds', level: 1, description: 'A creature you touch regains hit points.' },
  'bless': { id: 'bless', name: 'Bless', level: 1, description: 'Bless up to three creatures of your choice within range.' },
  'healing_word': {id: 'healing_word', name: 'Healing Word', level: 1, description: 'A creature of your choice that you can see within range regains hit points equal to 1d4 + your spellcasting ability modifier.'},
  'faerie_fire': { id: 'faerie_fire', name: 'Faerie Fire', level: 1, description: 'Outline creatures and objects in dim light. Attacked creatures grant advantage.' },
  'detect_magic': { id: 'detect_magic', name: 'Detect Magic', level: 1, description: 'For the duration, you sense the presence of magic within 30 feet of you.' },
  'longstrider': { id: 'longstrider', name: 'Longstrider', level: 1, description: 'Touch a creature. Its speed increases by 10 feet until the spell ends.' },
  'speak_with_animals': { id: 'speak_with_animals', name: 'Speak with Animals', level: 1, description: 'You gain the ability to comprehend and verbally communicate with beasts for the duration.' },

  // Level 2
  'darkness': { id: 'darkness', name: 'Darkness', level: 2, description: 'Magical darkness spreads from a point you choose within range to fill a 15-foot-radius sphere.' },
  'misty_step': { id: 'misty_step', name: 'Misty Step', level: 2, description: 'Briefly surrounded by silvery mist, you teleport up to 30 feet to an unoccupied space that you can see.' },
  'pass_without_trace': { id: 'pass_without_trace', name: 'Pass without Trace', level: 2, description: 'A veil of shadows and silence radiates from you, masking you and your companions from detection.' },

  // Level 3
  'nondetection': { id: 'nondetection', name: 'Nondetection', level: 3, description: 'For the duration, you hide a target that you touch from divination magic.' },
};

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
const WIZARD_SPELL_LIST = ['fire_bolt', 'light', 'mage_hand', 'magic_missile', 'shield', 'prestidigitation', 'detect_magic', 'misty_step', 'minor_illusion']; // Added Minor Illusion

export const CLASSES_DATA: Record<string, CharClass> = {
  'fighter': {
    id: 'fighter', name: 'Fighter', description: 'Masters of combat, skilled with a variety of weapons and armor.',
    hitDie: 10, primaryAbility: ['Strength', 'Dexterity'], savingThrowProficiencies: ['Strength', 'Constitution'],
    skillProficienciesAvailable: ['acrobatics', 'animal_handling', 'athletics', 'history', 'insight', 'intimidation', 'perception', 'survival'],
    numberOfSkillProficiencies: 2,
    armorProficiencies: ['All armor', 'Shields'], weaponProficiencies: ['Simple weapons', 'Martial weapons'],
    features: [{ id: 'second_wind', name: 'Second Wind', description: 'Regain hit points as a bonus action.', levelAvailable: 1 }],
    fightingStyles: Object.values(FIGHTING_STYLES_DATA)
  },
  'cleric': {
    id: 'cleric', name: 'Cleric', description: 'Warriors of the gods, wielding divine magic.',
    hitDie: 8, primaryAbility: ['Wisdom'], savingThrowProficiencies: ['Wisdom', 'Charisma'],
    skillProficienciesAvailable: ['history', 'insight', 'medicine', 'persuasion', 'religion'],
    numberOfSkillProficiencies: 2,
    armorProficiencies: ['Light armor', 'Medium armor', 'Shields'], weaponProficiencies: ['Simple weapons'],
    features: [], // Domain features are part of the DivineDomain object
    divineDomains: [LIFE_DOMAIN],
    spellcasting: { ability: 'Wisdom', knownCantrips: 3, knownSpellsL1: 2, spellList: CLERIC_SPELL_LIST }
  },
  'wizard': {
    id: 'wizard', name: 'Wizard', description: 'Scholarly magic-users capable of manipulating the fabric of reality.',
    hitDie: 6, primaryAbility: ['Intelligence'], savingThrowProficiencies: ['Intelligence', 'Wisdom'],
    skillProficienciesAvailable: ['arcana', 'history', 'insight', 'investigation', 'medicine', 'religion'],
    numberOfSkillProficiencies: 2,
    armorProficiencies: [], weaponProficiencies: ['Daggers', 'Darts', 'Slings', 'Quarterstaffs', 'Light crossbows'],
    features: [{ id: 'arcane_recovery', name: 'Arcane Recovery', description: 'Recover some spell slots during a short rest.', levelAvailable: 1 }],
    spellcasting: { ability: 'Intelligence', knownCantrips: 3, knownSpellsL1: 2, spellList: WIZARD_SPELL_LIST } 
  }
};

// Game World Data (existing constants)
export const STARTING_LOCATION_ID = 'clearing';

export const ITEMS: Record<string, Item> = {
  'rusty_sword': {
    id: 'rusty_sword',
    name: 'Rusty Sword',
    description: 'An old, pitted sword. It has seen better days.',
    type: 'weapon'
  },
  'healing_potion': {
    id: 'healing_potion',
    name: 'Healing Potion',
    description: 'A vial of glowing red liquid. Looks restorative.',
    type: 'consumable',
    effect: 'heal_25'
  },
  'old_map_fragment': {
    id: 'old_map_fragment',
    name: 'Old Map Fragment',
    description: 'A piece of parchment with faded markings. It seems to show a path leading east.',
    type: 'note',
  },
  'shiny_coin': {
    id: 'shiny_coin',
    name: 'Shiny Coin',
    description: 'A gold coin, surprisingly clean.',
    type: 'treasure'
  }
};

export const NPCS: Record<string, NPC> = {
  'old_hermit': {
    id: 'old_hermit',
    name: 'Old Hermit',
    baseDescription: 'A weathered old man with kind eyes, dressed in simple robes.',
    dialoguePromptSeed: 'The hermit looks up as you approach, a faint smile on his lips.'
  },
  'nervous_scout': {
    id: 'nervous_scout',
    name: 'Nervous Scout',
    baseDescription: 'A young scout, fidgeting and glancing around often.',
    dialoguePromptSeed: 'The scout jumps as you get closer, hand on their dagger.'
  }
};

export const LOCATIONS: Record<string, Location> = {
  'clearing': {
    id: 'clearing',
    name: 'Forest Clearing',
    baseDescription: 'You are in a sun-dappled clearing. Paths lead north and east. A small, almost hidden path goes south. There is a sense of ancient peace here.',
    exits: { 'North': 'forest_path', 'East': 'ancient_ruins_entrance', 'South': 'hidden_grove' },
    itemIds: ['old_map_fragment'],
    mapCoordinates: { x: 15, y: 10 }, 
    biomeId: 'plains',
  },
  'forest_path': {
    id: 'forest_path',
    name: 'Winding Forest Path',
    baseDescription: 'A narrow path winds through dense trees. The air is cool and smells of pine. You can go south back to the clearing or continue north deeper into the woods.',
    exits: { 'South': 'clearing', 'North': 'dark_woods' },
    npcIds: ['nervous_scout'],
    mapCoordinates: { x: 15, y: 9 }, 
    biomeId: 'forest',
  },
  'dark_woods': {
    id: 'dark_woods',
    name: 'Dark Woods',
    baseDescription: 'The trees here are tall and block out most of the light. Strange sounds echo around you. The path continues north, or you can return south.',
    exits: { 'South': 'forest_path', 'North': 'cave_entrance' },
    itemIds: ['rusty_sword'],
    mapCoordinates: { x: 15, y: 8 },
    biomeId: 'forest',
  },
  'ancient_ruins_entrance': {
    id: 'ancient_ruins_entrance',
    name: 'Entrance to Ancient Ruins',
    baseDescription: 'Before you stands a crumbling stone archway, hinting at forgotten structures beyond. A path leads west back to the clearing. The air here feels heavy.',
    exits: { 'West': 'clearing', 'East': 'ruins_courtyard' },
    mapCoordinates: { x: 16, y: 10 },
    biomeId: 'hills', 
  },
  'ruins_courtyard': {
    id: 'ruins_courtyard',
    name: 'Ruins Courtyard',
    baseDescription: 'A dilapidated courtyard, overgrown with vines. Broken statues lie scattered. Passages lead west and deeper into the ruins to the east.',
    exits: { 'West': 'ancient_ruins_entrance', 'East': 'ruins_library' },
    itemIds: ['shiny_coin'],
    npcIds: ['old_hermit'],
    mapCoordinates: { x: 17, y: 10 },
    biomeId: 'hills',
  },
  'ruins_library': {
    id: 'ruins_library',
    name: 'Ruined Library',
    baseDescription: 'This was once a library. Rotten shelves and tattered books are everywhere. A faint magical energy lingers. You can return west.',
    exits: { 'West': 'ruins_courtyard' },
    mapCoordinates: { x: 18, y: 10 },
    biomeId: 'hills',
  },
  'hidden_grove': {
    id: 'hidden_grove',
    name: 'Hidden Grove',
    baseDescription: 'A secluded, peaceful grove with a small, clear pond. Fireflies dance in the air. A path leads north back to the clearing.',
    exits: { 'North': 'clearing' },
    itemIds: ['healing_potion'],
    mapCoordinates: { x: 15, y: 11 },
    biomeId: 'forest',
  },
  'cave_entrance': {
    id: 'cave_entrance',
    name: 'Cave Entrance',
    baseDescription: 'A dark cave mouth gapes in the side of a rocky hill. A chill emanates from within. You can go south back into the woods or venture into the cave.',
    exits: { 'South': 'dark_woods', 'East': 'cave_tunnel' },
    mapCoordinates: { x: 15, y: 7 },
    biomeId: 'mountain',
  },
  'cave_tunnel': {
    id: 'cave_tunnel',
    name: 'Dark Cave Tunnel',
    baseDescription: 'The tunnel is damp and narrow. Water drips from the ceiling. It continues east, or you can go west to exit.',
    exits: { 'West': 'cave_entrance', 'East': 'cave_chamber' },
    mapCoordinates: { x: 16, y: 7 }, 
    biomeId: 'mountain',
  },
  'cave_chamber': {
    id: 'cave_chamber',
    name: 'Echoing Cave Chamber',
    baseDescription: 'A large chamber opens up. The sound of dripping water echoes. There might be something valuable here, or dangerous.',
    exits: { 'West': 'cave_tunnel' },
    mapCoordinates: { x: 17, y: 7 },
    biomeId: 'mountain',
  }
};

// --- START DUMMY CHARACTER FOR DEVELOPMENT ---
const getAbilityModifierValue = (score: number): number => Math.floor((score - 10) / 2);

const DUMMY_BASE_ABILITY_SCORES: AbilityScores = {
  Strength: 15,
  Dexterity: 13,
  Constitution: 14,
  Intelligence: 8,
  Wisdom: 12,
  Charisma: 10,
};

const DUMMY_RACE: Race = RACES_DATA['human'];
const DUMMY_CLASS_DATA: CharClass = CLASSES_DATA['fighter']; // Renamed to avoid conflict with 'class' keyword

const calculateDummyFinalScores = (base: AbilityScores, race: Race): AbilityScores => {
  const final: AbilityScores = { ...base };
  race.abilityBonuses?.forEach(bonus => {
    final[bonus.ability] = (final[bonus.ability] || 0) + bonus.bonus;
  });
  return final;
};
const DUMMY_FINAL_ABILITY_SCORES = calculateDummyFinalScores(DUMMY_BASE_ABILITY_SCORES, DUMMY_RACE);

const DUMMY_SKILLS: Skill[] = [
  SKILLS_DATA['athletics'],
  SKILLS_DATA['perception'],
];

const DUMMY_FIGHTING_STYLE: FightingStyle | undefined = DUMMY_CLASS_DATA.fightingStyles?.find(style => style.id === 'defense');

const DUMMY_MAX_HP = DUMMY_CLASS_DATA.hitDie + getAbilityModifierValue(DUMMY_FINAL_ABILITY_SCORES.Constitution);

export const DUMMY_CHARACTER_FOR_DEV: PlayerCharacter | null = {
  name: "Dev Dummy",
  race: DUMMY_RACE,
  class: DUMMY_CLASS_DATA,
  abilityScores: DUMMY_BASE_ABILITY_SCORES,
  finalAbilityScores: DUMMY_FINAL_ABILITY_SCORES,
  skills: DUMMY_SKILLS,
  hp: DUMMY_MAX_HP,
  maxHp: DUMMY_MAX_HP,
  armorClass: 10 + getAbilityModifierValue(DUMMY_FINAL_ABILITY_SCORES.Dexterity), // This will be recalculated in App.tsx based on equipment
  speed: 30, // Human default, will be recalculated
  darkvisionRange: 0, // Will be recalculated
  selectedFightingStyle: DUMMY_FIGHTING_STYLE,
  selectedDivineDomain: undefined,
  selectedDraconicAncestry: undefined,
  selectedElvenLineageId: undefined,
  elvenLineageSpellcastingAbility: undefined,
  selectedGnomeSubraceId: undefined,
  gnomeSubraceSpellcastingAbility: undefined,
  deepGnomeSpellcastingAbility: undefined,
  selectedGiantAncestryBenefitId: undefined,
  selectedFiendishLegacyId: undefined,
  fiendishLegacySpellcastingAbility: undefined,
  aarakocraSpellcastingAbility: undefined,
  airGenasiSpellcastingAbility: undefined,
  selectedCentaurNaturalAffinitySkillId: undefined,
  selectedChangelingInstinctSkillIds: undefined,
  duergarMagicSpellcastingAbility: undefined,
  knownCantrips: [],
  knownSpells: [],
  equippedItems: {}, // Initialized by App.tsx or later
};

export const USE_DUMMY_CHARACTER_FOR_DEV = true; // Set to true to skip character creation
// --- END DUMMY CHARACTER FOR DEVELOPMENT ---
