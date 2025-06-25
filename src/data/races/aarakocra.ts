/**
 * @file aarakocra.ts
 * Defines the data for the Aarakocra race in the Aralia RPG, based on Mordenkainen Presents: Monsters of the Multiverse, pg. 6,
 * and user-provided updated text.
 * ASIs are handled flexibly during character creation, not as fixed racial bonuses.
 */
import { Race } from '../../types'; // Path relative to src/data/races/

export const AARAKOCRA_DATA: Race = {
  id: 'aarakocra',
  name: 'Aarakocra',
  description:
    'A winged people who originated on the Elemental Plane of Air, aarakocra soar through the sky wherever they wander. The first aarakocra served the Wind Dukes of Aaqa—mighty beings of air—and were imbued with a measure of their masters’ power over winds. Their descendants still command echoes of that power.\n\nFrom below, aarakocra look like large birds and thus are sometimes called birdfolk. Only when they roost on a branch or walk across the ground is their Humanoid nature clear. Standing upright, aarakocra are typically about 5 feet tall, and they have long, narrow legs that taper to sharp talons. Feathers cover their bodies—usually red, orange, yellow, brown, or gray. Their heads are also avian, often resembling those of parrots or eagles.',
  abilityBonuses: [], // Flexible ASIs are handled by the Point Buy system.
  traits: [
    'Creature Type: Humanoid',
    'Size: Medium',
    'Speed: Your walking speed is 30 feet.',
    'Flight: Because of your wings, you have a flying speed equal to your walking speed. You can’t use this flying speed if you’re wearing medium or heavy armor.',
    'Talons: You have talons that you can use to make unarmed strikes. When you hit with them, the strike deals 1d6 + your Strength modifier slashing damage, instead of the bludgeoning damage normal for an unarmed strike.',
    'Wind Caller: Starting at 3rd level, you can cast the gust of wind spell with this trait, without requiring a material component. Once you cast the spell with this trait, you can’t do so again until you finish a long rest. You can also cast the spell using any spell slots you have of 2nd level or higher. Intelligence, Wisdom, or Charisma is your spellcasting ability for it when you cast gust of wind with this trait (choose when you select this race).',
    'Languages: You can speak, read, and write Common and one other language that you and your DM agree is appropriate for your character.',
  ],
  imageUrl: 'https://i.ibb.co/jPRJmQwb/Aarakocra.png',
};
