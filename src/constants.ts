/**
 * @file src/constants.ts
 * This file (now at src/constants.ts) defines global constants and foundational game data
 * for the Aralia RPG application. It includes game phases, D&D related data
 * (ability scores, skills, spells, classes), initial game world data (items, NPCs, locations),
 * and TTS voice options.
 * It often aggregates or re-exports data from more specific data modules (e.g., from src/data/races).
 */

import {
  PlayerCharacter,
  Race,
  Class as CharClass,
  AbilityScores,
  Skill,
  FightingStyle,
  AbilityScoreName,
  Spell,
  DivineDomain,
  Location,
  Item,
  NPC,
  ClassFeature,
  DraconicAncestryInfo,
  ElvenLineage,
  ElvenLineageType,
  GnomeSubrace,
  GnomeSubraceType,
  TTSVoiceOption,
  GiantAncestryBenefit, 
  GiantAncestryType,
  FiendishLegacy, 
  FiendishLegacyType,
  // MapTile and Biome types are imported where needed (e.g. App.tsx, mapService.ts) directly from ../types
} from './types'; 

// Import aggregated data from specialized modules
import { ALL_RACES_DATA, DRAGONBORN_ANCESTRIES_DATA, GIANT_ANCESTRY_BENEFITS_DATA, TIEFLING_LEGACIES_DATA } from './data/races'; 
import { BIOMES } from './data/biomes'; 
import { SPELLS_DATA } from './data/spells';
import { ITEMS } from './data/items';
import { SKILLS_DATA } from './data/skills';
import { CLASSES_DATA } from './data/classes';

// Import newly separated data modules
import { LOCATIONS, STARTING_LOCATION_ID } from './data/world/locations';
import { NPCS } from './data/world/npcs';
import { TTS_VOICE_OPTIONS } from './data/settings/ttsOptions';
import { USE_DUMMY_CHARACTER_FOR_DEV, initializeDummyCharacterData, setInitializedDummyCharacter } from './data/dev/dummyCharacter';


// Define RACES_DATA using the imported ALL_RACES_DATA
const RACES_DATA = ALL_RACES_DATA;

export enum GamePhase {
  CHARACTER_CREATION = 'CHARACTER_CREATION',
  START_SCREEN = 'START_SCREEN', 
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER',
  MAIN_MENU = 'MAIN_MENU', 
}

// D&D Data
export const ABILITY_SCORE_NAMES: AbilityScoreName[] = [
  'Strength',
  'Dexterity',
  'Constitution',
  'Intelligence',
  'Wisdom',
  'Charisma',
];
export const RELEVANT_SPELLCASTING_ABILITIES: AbilityScoreName[] = [
  'Intelligence',
  'Wisdom',
  'Charisma',
];

// Point Buy System Constants
export const POINT_BUY_TOTAL_POINTS = 27;
export const POINT_BUY_MIN_SCORE = 8;
export const POINT_BUY_MAX_SCORE = 15;
export const ABILITY_SCORE_COST: Record<number, number> = {
  8: 0,
  9: 1,
  10: 2,
  11: 3,
  12: 4,
  13: 5,
  14: 7,
  15: 9,
};

// Initialize DUMMY_CHARACTER_FOR_DEV after all its dependencies (RACES_DATA, etc.) are defined.
const initializedDummyChar = initializeDummyCharacterData(RACES_DATA, CLASSES_DATA, SKILLS_DATA);
setInitializedDummyCharacter(initializedDummyChar);
// Now DUMMY_CHARACTER_FOR_DEV is populated in dummyCharacter.ts and can be re-exported.
export { DUMMY_CHARACTER_FOR_DEV } from './data/dev/dummyCharacter';


// Re-export data imported from specialized modules
export { 
  SKILLS_DATA, 
  RACES_DATA, 
  DRAGONBORN_ANCESTRIES_DATA as DRAGONBORN_ANCESTRIES, 
  GIANT_ANCESTRY_BENEFITS_DATA as GIANT_ANCESTRIES, 
  TIEFLING_LEGACIES_DATA as TIEFLING_LEGACIES, 
  SPELLS_DATA, 
  CLASSES_DATA, 
  ITEMS,
  BIOMES,
  LOCATIONS, // Re-export from new location
  STARTING_LOCATION_ID, // Re-export from new location
  NPCS, // Re-export from new location
  TTS_VOICE_OPTIONS, // Re-export from new location
  USE_DUMMY_CHARACTER_FOR_DEV, // Re-export from new location
};

// Map Configuration
export const MAP_GRID_SIZE = { rows: 20, cols: 30 };
export const SUBMAP_DIMENSIONS = { rows: 20, cols: 30 }; // Updated dimensions

// Compass Direction Vectors
export interface DirectionVector {
  dx: number;
  dy: number;
  opposite: string; // Opposite direction key
}
export const DIRECTION_VECTORS: Record<string, DirectionVector> = {
  North:     { dx: 0,  dy: -1, opposite: 'South' },
  NorthEast: { dx: 1,  dy: -1, opposite: 'SouthWest' },
  East:      { dx: 1,  dy: 0,  opposite: 'West' },
  SouthEast: { dx: 1,  dy: 1,  opposite: 'NorthWest' },
  South:     { dx: 0,  dy: 1,  opposite: 'North' },
  SouthWest: { dx: -1, dy: 1,  opposite: 'NorthEast' },
  West:      { dx: -1, dy: 0,  opposite: 'East' },
  NorthWest: { dx: -1, dy: -1, opposite: 'SouthEast' },
};