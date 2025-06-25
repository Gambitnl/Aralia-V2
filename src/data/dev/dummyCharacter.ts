/**
 * @file src/data/dev/dummyCharacter.ts
 * Defines the dummy character data for development and testing purposes.
 */
import { PlayerCharacter, Race, Class as CharClass, AbilityScores, Skill, FightingStyle, Item, EquipmentSlotType } from '../../types';
import { RACES_DATA, CLASSES_DATA, SKILLS_DATA, ITEMS } from '../../constants'; // Will import from the re-exporting constants.ts
import { getAbilityModifierValue, calculateArmorClass } from '../../utils/characterUtils'; // Import centralized utility

// --- DUMMY CHARACTER FOR DEVELOPMENT ---
const DUMMY_BASE_ABILITY_SCORES: AbilityScores = {
  Strength: 15,
  Dexterity: 13,
  Constitution: 14,
  Intelligence: 8,
  Wisdom: 12,
  Charisma: 10,
};

// Ensure RACES_DATA and CLASSES_DATA are accessed after constants.ts has initialized them
const DUMMY_RACE_ID = 'human'; 
const DUMMY_CLASS_ID = 'fighter';


const calculateDummyFinalScores = (
  base: AbilityScores,
  race: Race | undefined, // Make race potentially undefined for safety during initialization
): AbilityScores => {
  const final: AbilityScores = { ...base };
  if (race && race.abilityBonuses) { // Check if race and abilityBonuses exist
    race.abilityBonuses.forEach((bonus) => {
      final[bonus.ability] = (final[bonus.ability] || 0) + bonus.bonus;
    });
  }
  return final;
};


let DUMMY_RACE: Race | undefined;
let DUMMY_CLASS_DATA: CharClass | undefined;
let DUMMY_FINAL_ABILITY_SCORES: AbilityScores = DUMMY_BASE_ABILITY_SCORES; // Initialize with base
let DUMMY_SKILLS: Skill[] = [];
let DUMMY_FIGHTING_STYLE: FightingStyle | undefined;
let DUMMY_MAX_HP = 10; // Default HP
let DUMMY_DARKVISION = 0;
let DUMMY_EQUIPPED_ITEMS: Partial<Record<EquipmentSlotType, Item>> = {};
let DUMMY_ARMOR_CLASS = 10;

export const initialInventoryForDummyCharacter: Item[] = [
    ITEMS['padded_armor'], ITEMS['leather_armor'], ITEMS['studded_leather_armor'],
    ITEMS['hide_armor'], ITEMS['chain_shirt'], ITEMS['scale_mail'], ITEMS['breastplate'], ITEMS['half_plate_armor'],
    ITEMS['ring_mail'], ITEMS['chain_mail'], ITEMS['splint_armor'], ITEMS['plate_armor'],
    ITEMS['shield_std'], ITEMS['rusty_sword'], ITEMS['healing_potion'],
].filter(Boolean) as Item[];


export function initializeDummyCharacterData(
    allRaces: Record<string, Race>,
    allClasses: Record<string, CharClass>,
    allSkills: Record<string, Skill>
): PlayerCharacter | null {
    DUMMY_RACE = allRaces[DUMMY_RACE_ID];
    DUMMY_CLASS_DATA = allClasses[DUMMY_CLASS_ID];

    if (!DUMMY_RACE || !DUMMY_CLASS_DATA) {
        console.error("Failed to initialize dummy character: Race or Class data missing from constants.")
        return null;
    }

    DUMMY_FINAL_ABILITY_SCORES = calculateDummyFinalScores(
        DUMMY_BASE_ABILITY_SCORES,
        DUMMY_RACE,
    );

    DUMMY_SKILLS = [
        allSkills['athletics'],
        allSkills['perception'],
    ].filter(Boolean) as Skill[];

    DUMMY_FIGHTING_STYLE =
        DUMMY_CLASS_DATA.fightingStyles?.find((style) => style.id === 'defense');

    DUMMY_MAX_HP =
        DUMMY_CLASS_DATA.hitDie +
        getAbilityModifierValue(DUMMY_FINAL_ABILITY_SCORES.Constitution);

    DUMMY_DARKVISION = 0;
    const darkvisionTrait = DUMMY_RACE.traits.find(t => t.toLowerCase().includes('darkvision'));
    if (darkvisionTrait) {
        const match = darkvisionTrait.match(/(\d+) ?ft/i);
        if (match && match[1]) DUMMY_DARKVISION = parseInt(match[1]);
    }
    
    DUMMY_EQUIPPED_ITEMS = {}; // Start with no items equipped for the dummy
    
    const tempCharacterForAC: PlayerCharacter = {
        name: 'Temp',
        race: DUMMY_RACE,
        class: DUMMY_CLASS_DATA,
        abilityScores: DUMMY_BASE_ABILITY_SCORES,
        finalAbilityScores: DUMMY_FINAL_ABILITY_SCORES,
        skills: DUMMY_SKILLS,
        hp: DUMMY_MAX_HP,
        maxHp: DUMMY_MAX_HP,
        armorClass: 10, // Placeholder, will be calculated
        speed: 30,
        darkvisionRange: DUMMY_DARKVISION,
        selectedFightingStyle: DUMMY_FIGHTING_STYLE,
        equippedItems: DUMMY_EQUIPPED_ITEMS, // Pass equipped items
        knownCantrips: [],
        knownSpells: [],
        selectedDivineDomain: undefined,
        selectedDraconicAncestry: undefined,
        selectedElvenLineageId: undefined,
        elvenLineageSpellcastingAbility: undefined,
        selectedGnomeSubraceId: undefined,
        gnomeSubraceSpellcastingAbility: undefined,
        selectedGiantAncestryBenefitId: undefined,
        selectedFiendishLegacyId: undefined,
        fiendishLegacySpellcastingAbility: undefined,
        aarakocraSpellcastingAbility: undefined,
        airGenasiSpellcastingAbility: undefined,
        selectedCentaurNaturalAffinitySkillId: undefined,
        selectedChangelingInstinctSkillIds: undefined,
        deepGnomeSpellcastingAbility: undefined,
        duergarMagicSpellcastingAbility: undefined,
    };
    DUMMY_ARMOR_CLASS = calculateArmorClass(tempCharacterForAC); // Calculate AC with initial empty equipment
    
    return {
        ...tempCharacterForAC, 
        name: 'Dev Dummy',   
        armorClass: DUMMY_ARMOR_CLASS, 
    };
}

export const USE_DUMMY_CHARACTER_FOR_DEV = true;

export let DUMMY_CHARACTER_FOR_DEV: PlayerCharacter | null = null;

export function setInitializedDummyCharacter(character: PlayerCharacter | null) {
    DUMMY_CHARACTER_FOR_DEV = character;
}
