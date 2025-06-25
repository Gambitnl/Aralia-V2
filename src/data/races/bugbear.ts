/**
 * @file bugbear.ts
 * Defines the data for the Bugbear race in the Aralia RPG, based on Mordenkainen Presents: Monsters of the Multiverse, pg. 8.
 */
import { Race } from '../../types'; // Path relative to src/data/races/

export const BUGBEAR_DATA: Race = {
  id: 'bugbear',
  name: 'Bugbear',
  description:
    'Neither bugs nor bears, bugbears are the hulking cousins of goblins and hobgoblins. With roots in the Feywild, early bugbears resided in hidden places, in hard-to-reach and shadowed spaces. Centuries later, they still bear a fey gift for lurking just out of sight.',
  abilityBonuses: [], // Flexible ASIs: "When determining your character’s ability scores, increase one score by 2 and increase a different score by 1, or increase three different scores by 1." - Handled by player choice during ability score allocation.
  traits: [
    'Creature Type: Humanoid. You are also considered a goblinoid for any prerequisite or effect that requires you to be a goblinoid.',
    'Size: Medium (Typically 6 to 8 feet tall).',
    'Speed: 30 feet',
    'Darkvision: You can see in dim light within 60 feet of you as if it were bright light and in darkness as if it were dim light. You discern colors in that darkness only as shades of gray.',
    'Fey Ancestry: You have advantage on saving throws you make to avoid or end the charmed condition on yourself.',
    'Long-Limbed: When you make a melee attack on your turn, your reach for it is 5 feet greater than normal.',
    'Powerful Build: You count as one size larger when determining your carrying capacity and the weight you can push, drag, or lift.',
    'Sneaky: You are proficient in the Stealth skill. In addition, without squeezing, you can move through and stop in a space large enough for a Small creature.',
    'Surprise Attack: If you hit a creature with an attack roll, the creature takes an extra 2d6 damage if it hasn’t taken a turn yet in the current combat. (Note: Damage effect not yet mechanically implemented in combat).',
    'Languages: Common and Goblin.',
    'Ability Score Increases: When determining your character’s ability scores, increase one score by 2 and increase a different score by 1, or increase three different scores by 1. (Handled during Point Buy).',
  ],
};
