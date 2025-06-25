/**
 * @file aasimar.ts
 * Defines the data for the Aasimar race in the Aralia RPG.
 * This includes their ID, name, description, example ability score bonuses, and unique celestial traits
 * like Healing Hands and Light Bearer.
 */
import { Race } from '../../types'; // Path relative to src/data/races/

export const AASIMAR_DATA: Race = {
  id: 'aasimar',
  name: 'Aasimar',
  description:
    'Mortals who carry a spark of the Upper Planes. They can be Medium or Small (defaults to Medium). ASIs are often flexible; +2 CHA, +1 WIS is a common thematic representation.',
  abilityBonuses: [
    { ability: 'Charisma', bonus: 2 },
    { ability: 'Wisdom', bonus: 1 },
  ], // Example ASIs, could be made flexible
  traits: [
    'Celestial Resistance (Necrotic and Radiant damage)',
    'Darkvision (60ft)',
    'Healing Hands (Action, roll d4s equal to Proficiency Bonus to heal, 1/Long Rest)', // Proficiency Bonus scaling not yet implemented
    'Light Bearer (Light cantrip, Charisma is spellcasting ability)',
    'Celestial Revelation (Gained at Lvl 3: Choose Heavenly Wings, Inner Radiance, or Necrotic Shroud)', // Level 3 feature, not yet implemented
  ],
  // Note: Light cantrip from Light Bearer is handled in CharacterCreator.tsx for now.
};
