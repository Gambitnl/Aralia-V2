/**
 * @file src/types.ts
 * This file contains all the core TypeScript type definitions and interfaces
 * used throughout the Aralia RPG application. It defines the structure of
 * game entities such as PlayerCharacter, Race, Class, Item, Location, NPC,
 * as well as game state and actions.
 */
import { GamePhase } from './constants';
export { GamePhase } from './constants'; // Re-export GamePhase

// Core D&D Attributes
export type AbilityScoreName =
  | 'Strength'
  | 'Dexterity'
  | 'Constitution'
  | 'Intelligence'
  | 'Wisdom'
  | 'Charisma';

export interface AbilityScores {
  Strength: number;
  Dexterity: number;
  Constitution: number;
  Intelligence: number;
  Wisdom: number;
  Charisma: number;
}

export interface Skill {
  id: string;
  name: string;
  ability: AbilityScoreName;
}

export interface RacialAbilityBonus {
  ability: AbilityScoreName;
  bonus: number;
}

export type ElvenLineageType = 'drow' | 'high_elf' | 'wood_elf';

export interface ElvenLineageBenefit {
  level: number;
  description?: string;
  cantripId?: string;
  spellId?: string; // For higher-level spells gained via lineage
  speedIncrease?: number;
  darkvisionRange?: number; // Specific for Drow to set 120ft
  canSwapCantrip?: boolean; // For High Elf
  swappableCantripSource?: 'wizard'; // For High Elf
}

export interface ElvenLineage {
  id: ElvenLineageType;
  name: string;
  description: string;
  benefits: ElvenLineageBenefit[];
}

export type GnomeSubraceType = 'forest_gnome' | 'rock_gnome' | 'deep_gnome'; // Note: This 'deep_gnome' is for the subrace of standard Gnome. The new Deep Gnome is a separate base race.

export interface GnomeSubrace {
  id: GnomeSubraceType;
  name: string;
  description: string;
  traits: string[]; // Includes ASI description and other text-based traits
  grantedCantrip?: { id: string; spellcastingAbilitySource: 'subrace_choice' };
  grantedSpell?: {
    id: string;
    spellcastingAbilitySource: 'subrace_choice';
    usesDescription: string;
    level: number;
  };
  superiorDarkvision?: boolean; // If true, sets Darkvision to 120ft
}

export type GiantAncestryType = 'Cloud' | 'Fire' | 'Frost' | 'Hill' | 'Stone' | 'Storm';

export interface GiantAncestryBenefit {
  id: GiantAncestryType;
  name: string; // e.g., "Cloud's Jaunt"
  description: string;
  // Future: Add more structured data, e.g., damageType for Fire's Burn, condition for Hill's Tumble
}

export type FiendishLegacyType = 'abyssal' | 'chthonic' | 'infernal';

export interface FiendishLegacy {
  id: FiendishLegacyType;
  name: string;
  description: string;
  level1Benefit: {
    resistanceType: string; // e.g., "Poison", "Necrotic", "Fire"
    cantripId: string;
  };
  level3SpellId: string;
  level5SpellId: string;
}


export interface Race {
  id: string;
  name: string;
  description: string;
  abilityBonuses?: RacialAbilityBonus[];
  traits: string[];
  elvenLineages?: ElvenLineage[];
  gnomeSubraces?: GnomeSubrace[];
  giantAncestryChoices?: GiantAncestryBenefit[]; // For Goliaths
  fiendishLegacies?: FiendishLegacy[]; // For Tieflings
  imageUrl?: string; // Optional URL or Base64 data string for race image
}

export type DraconicAncestorType =
  | 'Black'
  | 'Blue'
  | 'Brass'
  | 'Bronze'
  | 'Copper'
  | 'Gold'
  | 'Green'
  | 'Red'
  | 'Silver'
  | 'White';
export type DraconicDamageType =
  | 'Acid'
  | 'Lightning'
  | 'Fire'
  | 'Poison'
  | 'Cold';

export interface DraconicAncestryInfo {
  type: DraconicAncestorType;
  damageType: DraconicDamageType;
}

export interface Spell {
  id: string;
  name: string;
  level: number; // 0 for cantrip
  description: string;
  // Potentially add school, casting time, range, components, duration
}

export interface ClassFeature {
  id: string; // Added ID property
  name: string;
  description: string;
  levelAvailable: number;
}

export interface FightingStyle extends ClassFeature {}
export interface DivineDomain extends ClassFeature {
  domainSpells: { [level: number]: string[] }; // Spell IDs
  features?: ClassFeature[]; // Features granted by this domain
}

export type ArmorProficiencyLevel = 'unarmored' | 'light' | 'medium' | 'heavy';

export interface Class {
  id: string;
  name: string;
  description: string;
  hitDie: number; // e.g., 6 for d6, 8 for d8, etc.
  primaryAbility: AbilityScoreName[];
  savingThrowProficiencies: AbilityScoreName[];
  skillProficienciesAvailable: string[]; // List of skill IDs to choose from
  numberOfSkillProficiencies: number;
  armorProficiencies: string[]; // e.g., "Light Armor", "Shields"
  weaponProficiencies: string[]; // e.g., "Simple weapons", "Martial weapons"
  startingEquipment?: string[]; // Simplified
  features: ClassFeature[]; // General class features by level
  
  // Class-specific choices at level 1
  fightingStyles?: FightingStyle[]; // For Fighters
  divineDomains?: DivineDomain[]; // For Clerics
  spellcasting?: {
    ability: AbilityScoreName;
    knownCantrips: number;
    knownSpellsL1: number;
    spellList: string[]; // IDs of spells available to this class
  };

  // Stat Recommender fields
  statRecommendationFocus?: AbilityScoreName[]; // Key abilities to prioritize
  statRecommendationDetails?: string; // Textual tip for stat allocation
  recommendedPointBuyPriorities?: AbilityScoreName[]; // Order of abilities for recommended point buy
}

export type EquipmentSlotType = 
  | 'Head' | 'Neck' | 'Torso' | 'Cloak' | 'Belt' 
  | 'MainHand' | 'OffHand' | 'Wrists' | 'Ring1' | 'Ring2' | 'Feet';

export interface PlayerCharacter {
  name: string;
  race: Race;
  class: Class;
  abilityScores: AbilityScores;
  finalAbilityScores: AbilityScores;
  skills: Skill[];
  hp: number;
  maxHp: number;
  armorClass: number;
  speed: number;
  darkvisionRange: number; // Added for final calculated darkvision

  // Class specific selections
  selectedFightingStyle?: FightingStyle;
  selectedDivineDomain?: DivineDomain;
  selectedDraconicAncestry?: DraconicAncestryInfo;

  // Elf specific selections
  selectedElvenLineageId?: ElvenLineageType;
  elvenLineageSpellcastingAbility?: AbilityScoreName;

  // Gnome specific selections (for the standard Gnome race's subraces)
  selectedGnomeSubraceId?: GnomeSubraceType;
  gnomeSubraceSpellcastingAbility?: AbilityScoreName;

  // Goliath specific selection
  selectedGiantAncestryBenefitId?: GiantAncestryType;
  
  // Tiefling specific selections
  selectedFiendishLegacyId?: FiendishLegacyType;
  fiendishLegacySpellcastingAbility?: AbilityScoreName;

  // Aarakocra specific selection
  aarakocraSpellcastingAbility?: AbilityScoreName;

  // Air Genasi specific selection
  airGenasiSpellcastingAbility?: AbilityScoreName;

  // Centaur specific selection
  selectedCentaurNaturalAffinitySkillId?: string;

  // Changeling specific selection
  selectedChangelingInstinctSkillIds?: string[];

  // Deep Gnome (standalone race) specific selection
  deepGnomeSpellcastingAbility?: AbilityScoreName;

  // Duergar specific selection
  duergarMagicSpellcastingAbility?: AbilityScoreName;

  knownCantrips: Spell[];
  knownSpells: Spell[];

  equippedItems: Partial<Record<EquipmentSlotType, Item>>; 
  
  // Note: Player's main inventory is managed in GameState.inventory
  // Could add level, experience, alignment, background etc. for more depth
}

export interface CanEquipResult {
  can: boolean;
  reason?: string;
}

export type ArmorCategory = 'Light' | 'Medium' | 'Heavy' | 'Shield';


export interface Item {
  id: string;
  name: string;
  description: string;
  type: 'weapon' | 'consumable' | 'key' | 'treasure' | 'note' | 'armor' | 'accessory';
  icon?: string; // Optional: Emoji or SVG path data for UI
  slot?: EquipmentSlotType; // e.g., 'MainHand', 'Torso', 'Head'
  effect?: string; // e.g., "heal_25", "strength_plus_1"

  // Armor-specific properties
  armorCategory?: ArmorCategory;
  baseArmorClass?: number;          // For armor: e.g., 11 for Padded, 16 for Chain Mail
  addsDexterityModifier?: boolean;  // For armor: true if Dex mod is added to AC
  maxDexterityBonus?: number;     // For armor: e.g., 2 for Medium Armor, undefined for Light, 0 for Heavy
  strengthRequirement?: number;   // For armor: e.g., 13 for Chain Mail, 15 for Plate
  stealthDisadvantage?: boolean;  // For armor: true if imposes disadvantage on Stealth
  armorClassBonus?: number;       // For Shields (+2) or other AC-enhancing items
  
  // Weapon-specific properties
  damageDice?: string; // e.g., "1d8"
  damageType?: string; // e.g., "Slashing", "Piercing", "Bludgeoning"
  properties?: string[]; // e.g., ["Finesse", "Light", "Two-Handed"]
  isMartial?: boolean; // True if martial weapon, false if simple

  donTime?: string;               // Time to put on armor (e.g., "1 minute", "10 minutes")
  doffTime?: string;              // Time to take off armor (e.g., "1 minute", "5 minutes")
  weight?: number;                // Weight in pounds
  cost?: string;                  // Cost in GP (e.g., "50 GP")
}

export interface LocationDynamicNpcConfig {
  possibleNpcIds: string[]; // Pool of NPC IDs that can spawn
  maxSpawnCount: number;    // Maximum number of NPCs to spawn from the pool
  baseSpawnChance: number;  // Chance (0.0 to 1.0) that any dynamic NPCs will spawn
}

export interface Location {
  id: string;
  name: string;
  baseDescription: string; // Fallback or initial description
  exits: { [direction: string]: string }; // e.g., { "North": "forest_path_id" }
  itemIds?: string[]; // item IDs potentially found here
  npcIds?: string[]; // Static NPC IDs present here
  dynamicNpcConfig?: LocationDynamicNpcConfig; // Configuration for dynamic NPCs
  mapCoordinates: { x: number; y: number }; // Coordinates on the world map - Now non-optional
  biomeId: string; // ID of the biome this location is primarily in - Now non-optional
}

export interface TTSVoiceOption {
  name: string; // The voice_name identifier used by the API
  characteristic: string; // A descriptive characteristic (e.g., "Bright", "Firm")
}


export interface NPC {
  id: string;
  name: string;
  baseDescription: string; // Basic description
  dialoguePromptSeed?: string; // A seed phrase for Gemini to start dialogue
  voice?: TTSVoiceOption; // Optional: To store assigned voice
}

export interface GameMessage {
  id: number;
  text: string;
  sender: 'system' | 'player' | 'npc';
  timestamp: Date;
}

export interface Biome {
  id: string;
  name: string;
  color: string; // Tailwind CSS color class, e.g., 'bg-green-700'
  icon?: string; // Emoji or SVG path data
  description: string;
  passable: boolean;
  impassableReason?: string; // Optional: Message explaining why it's impassable
}

export interface MapTile {
  x: number;
  y: number;
  biomeId: string;
  locationId?: string; // ID of a predefined Location at this tile
  discovered: boolean;
  isPlayerCurrent: boolean;
}

export interface MapData {
  gridSize: { rows: number; cols: number };
  tiles: MapTile[][]; // tiles[row][col]
}

export interface GeminiLogEntry {
  timestamp: Date;
  functionName: string; // e.g., 'generateTileInspectionDetails', 'generateNPCResponse'
  prompt: string;
  response: string;
}

export type ActionType =
  | 'move'
  | 'look_around'
  | 'talk'
  | 'take_item'
  | 'use_item'
  | 'custom' // For general custom UI-driven actions
  | 'ask_oracle'
  | 'toggle_map'
  | 'toggle_submap_visibility' 
  | 'gemini_custom_action'
  | 'save_game'
  | 'go_to_main_menu' 
  | 'inspect_submap_tile'
  | 'toggle_dev_menu' 
  | 'toggle_gemini_log_viewer'
  | 'UPDATE_INSPECTED_TILE_DESCRIPTION'
  | 'TOGGLE_DISCOVERY_LOG'
  | 'TOGGLE_GLOSSARY_VISIBILITY'
  | 'EQUIP_ITEM' 
  | 'UNEQUIP_ITEM' 
  | 'DROP_ITEM'
  | 'SET_LOADING'; // For SET_LOADING with richer payload


export enum DiscoveryType {
  LOCATION_DISCOVERY = 'Location Discovery',
  NPC_INTERACTION = 'NPC Interaction',
  ITEM_ACQUISITION = 'Item Acquired',
  ITEM_USED = 'Item Used',
  ITEM_EQUIPPED = 'Item Equipped',
  ITEM_UNEQUIPPED = 'Item Unequipped',
  ITEM_DROPPED = 'Item Dropped',
  LORE_DISCOVERY = 'Lore Uncovered',
  QUEST_UPDATE = 'Quest Update',
  MISC_EVENT = 'Miscellaneous Event',
}

export interface DiscoveryFlag {
  key: string;
  value: string | number | boolean;
  label?: string; // Optional user-friendly label for the flag
}

export interface DiscoverySource {
  type: 'LOCATION' | 'NPC' | 'ITEM' | 'SYSTEM' | 'QUEST' | 'PLAYER_ACTION';
  id?: string; // ID of the source entity (e.g., locationId, npcId)
  name?: string; // Name of the source entity
}

export interface DiscoveryEntry {
  id: string; // Unique ID for the entry
  timestamp: number; // Timestamp of discovery (Date.now())
  gameTime: string; // In-game time string when discovered
  type: DiscoveryType;
  title: string;
  content: string; // Detailed description or notes
  source: DiscoverySource;
  flags: DiscoveryFlag[]; // For filtering, linking, e.g., [{key: "relatedCharacter", value: "npc_hermit"}]
  isRead: boolean;
  isQuestRelated?: boolean; // Optional: true if this entry is part of a quest
  questId?: string; // Optional: ID of the associated quest
  questStatus?: string; // Optional: Current status of the associated quest part
  worldMapCoordinates?: { x: number; y: number }; // Optional: World map coords if relevant
  associatedLocationId?: string; // Optional: Specific location ID
}

export interface GameState {
  phase: GamePhase;
  playerCharacter: PlayerCharacter | null; // Null during character creation
  inventory: Item[];
  currentLocationId: string; // Can be a predefined location ID or a world map tile ID "coord_X_Y"
  subMapCoordinates: { x: number; y: number } | null; // Player's coordinates within the submap of currentLocationId
  messages: GameMessage[];
  isLoading: boolean;
  loadingMessage: string | null; // For contextual loading messages
  isImageLoading: boolean;
  error: string | null;
  mapData: MapData | null; 
  isMapVisible: boolean; 
  isSubmapVisible: boolean; 
  dynamicLocationItemIds: Record<string, string[]>; 
  currentLocationActiveDynamicNpcIds: string[] | null; // IDs of dynamic NPCs currently active
  geminiGeneratedActions: Action[] | null;
  characterSheetModal: { 
    isOpen: boolean;
    character: PlayerCharacter | null;
  };
  gameTime: Date; // For passage of time
  
  // Dev Mode specific state
  isDevMenuVisible: boolean;
  isGeminiLogViewerVisible: boolean;
  geminiInteractionLog: GeminiLogEntry[];

  // Fields for save/load
  saveVersion?: string; // Version of the save game format
  saveTimestamp?: number; // Timestamp of when the game was saved

  // NPC interaction context
  lastInteractedNpcId: string | null;
  lastNpcResponse: string | null;

  inspectedTileDescriptions: Record<string, string>; 

  // Discovery Journal State
  discoveryLog: DiscoveryEntry[];
  unreadDiscoveryCount: number;
  isDiscoveryLogVisible: boolean;
  isGlossaryVisible: boolean; 
  selectedGlossaryTermForModal?: string; // Added for Glossary navigation
}

export interface InspectSubmapTilePayload {
  tileX: number;
  tileY: number;
  effectiveTerrainType: string;
  worldBiomeId: string;
  parentWorldMapCoords: { x: number; y: number };
  activeFeatureConfig?: { id: string; name?: string; icon: string; generatesEffectiveTerrainType?: string }; 
}

export interface UpdateInspectedTileDescriptionPayload { 
    tileKey: string; // e.g., "worldX_worldY_subX_subY"
    description: string;
}

export interface EquipItemPayload {
  itemId: string;
}
export interface UnequipItemPayload {
  slot: EquipmentSlotType;
}
export interface DropItemPayload {
  itemId: string;
}
export interface UseItemPayload {
  itemId: string;
}

export interface SetLoadingPayload { // For the SET_LOADING action
  isLoading: boolean;
  message?: string | null;
}


export interface Action {
  type: ActionType;
  label: string; // Text on the button
  targetId?: string; // ID of location, NPC, item, coordinate string like "coord_X_Y", or direction string for submap moves.
  payload?: {
    query?: string; // For 'ask_oracle'
    geminiPrompt?: string; // For 'gemini_custom_action', the prompt for Gemini to execute this action
    inspectTileDetails?: InspectSubmapTilePayload; // For 'inspect_submap_tile'
    itemId?: string; // For EQUIP_ITEM, USE_ITEM, DROP_ITEM
    slot?: EquipmentSlotType; // For UNEQUIP_ITEM
    initialTermId?: string; // For TOGGLE_GLOSSARY_VISIBILITY
    [key: string]: any; // Allow other payload properties
  };
}

// GlossaryItem is used by GlossaryDisplay
export interface GlossaryDisplayItem { 
  icon: string;
  meaning: string;
  category?: string;
}

// GlossaryIndexEntry is for the new file-based glossary index from context
// This is now the primary definition of a glossary entry's structure.
export interface GlossaryIndexEntry {
  id: string;
  title: string;
  category: string;
  tags?: string[];
  excerpt?: string; 
  aliases?: string[]; 
  seeAlso?: string[]; 
  filePath: string; 
}


export interface SeededFeatureConfig {
  id: string;
  name?: string;
  icon: string;
  color: string;
  sizeRange: [number, number]; // min, max size (e.g. radius or half-width)
  numSeedsRange: [number, number]; // min, max number of seeds for this feature type
  adjacency?: { // Optional visual cues for tiles adjacent to the feature
    icon?: string;
    color?: string;
  };
  zOffset?: number; // For layering, higher zOffset means it draws on top
  scatterOverride?: Array<{ icon: string; density: number; color?: string; allowedOn?: string[] }>; // Overrides biome scatter within feature
  generatesEffectiveTerrainType?: string; // Terrain type this feature imposes (for hints, etc.)
  shapeType?: 'circular' | 'rectangular'; // Shape of the feature
}

export interface GlossaryTooltipProps { 
  termId: string;
  onNavigateToGlossary?: (termId: string) => void; // Callback to open main glossary
}

export interface GlossaryProps { // For the main Glossary modal
  isOpen: boolean;
  onClose: () => void;
  initialTermId?: string; // To open the glossary to a specific term
}