/**
 * @file src/data/spells/index.ts
 * Defines all spell data for the Aralia RPG.
 */
import { Spell } from '../types';

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
  'poison_spray': { id: 'poison_spray', name: 'Poison Spray', level: 0, description: 'You extend your hand toward a creature you can see within range and project a puff of noxious gas from your palm.' },
  'chill_touch': { id: 'chill_touch', name: 'Chill Touch', level: 0, description: 'You create a ghostly, skeletal hand in the space of a creature within range. Make a ranged spell attack against the creature to assail it with the chill of the grave.' },
  'thaumaturgy': { id: 'thaumaturgy', name: 'Thaumaturgy', level: 0, description: 'You manifest a minor wonder, a sign of supernatural power, within range.' },
  'shocking_grasp': { id: 'shocking_grasp', name: 'Shocking Grasp', level: 0, description: 'Lightning springs from your hand to deliver a shock to a creature you try to touch. You have advantage on the attack roll if the target is wearing armor made of metal.' },
  
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
  'ray_of_sickness': { id: 'ray_of_sickness', name: 'Ray of Sickness', level: 1, description: 'A ray of sickening greenish energy lances out toward a creature within range.' },
  'false_life': { id: 'false_life', name: 'False Life', level: 1, description: 'Bolstering yourself with a necromantic facsimile of life, you gain 1d4 + 4 temporary hit points for the duration.' },
  'hellish_rebuke': { id: 'hellish_rebuke', name: 'Hellish Rebuke', level: 1, description: 'You point your finger, and the creature that damaged you is momentarily surrounded by hellish flames.' },
  'feather_fall': {id: 'feather_fall', name: 'Feather Fall', level: 1, description: 'Choose up to five falling creatures within range. A falling creature’s rate of descent slows to 60 feet per round until the spell ends.'},
  'disguise_self': { id: 'disguise_self', name: 'Disguise Self', level: 1, description: 'You make yourself—including your clothing, armor, weapons, and other belongings on your person—look different until the spell ends or until you use your action to dismiss it. You can seem 1 foot shorter or taller and can appear thin, fat, or in between. You can’t change your body type, so you must adopt a form that has the same basic arrangement of limbs. Otherwise, the extent of the illusion is up to you.'},

  // Level 2
  'darkness': { id: 'darkness', name: 'Darkness', level: 2, description: 'Magical darkness spreads from a point you choose within range to fill a 15-foot-radius sphere.' },
  'misty_step': { id: 'misty_step', name: 'Misty Step', level: 2, description: 'Briefly surrounded by silvery mist, you teleport up to 30 feet to an unoccupied space that you can see.' },
  'pass_without_trace': { id: 'pass_without_trace', name: 'Pass without Trace', level: 2, description: 'A veil of shadows and silence radiates from you, masking you and your companions from detection.' },
  'hold_person': { id: 'hold_person', name: 'Hold Person', level: 2, description: 'Choose a humanoid that you can see within range. The target must succeed on a Wisdom saving throw or be paralyzed for the duration.' },
  'ray_of_enfeeblement': { id: 'ray_of_enfeeblement', name: 'Ray of Enfeeblement', level: 2, description: 'A black beam of enervating energy springs from your finger toward a creature within range.' },
  'gust_of_wind': {id: 'gust_of_wind', name: 'Gust of Wind', level: 2, description: 'A line of strong wind 60 feet long and 10 feet wide blasts from you, pushing creatures and impeding movement.'},
  'levitate': { id: 'levitate', name: 'Levitate', level: 2, description: 'One creature or object of your choice that you can see within range rises vertically, up to 20 feet, and remains suspended there for the duration. The spell can levitate a target that weighs up to 500 pounds.'},
  'enlarge_reduce': { id: 'enlarge_reduce', name: 'Enlarge/Reduce', level: 2, description: 'You cause a creature or an object you can see within range to grow larger or smaller for the duration. Choose either a creature or an object that is neither worn nor carried. If the target is unwilling, it can make a Constitution saving throw. On a success, the spell has no effect.' },
  'invisibility': { id: 'invisibility', name: 'Invisibility', level: 2, description: 'A creature you touch becomes invisible until the spell ends. Anything the target is wearing or carrying is invisible as long as it is on the target’s person. The spell ends for a target that attacks or casts a spell.' },

  // Level 3
  'nondetection': { id: 'nondetection', name: 'Nondetection', level: 3, description: 'For the duration, you hide a target that you touch from divination magic. The target can be a willing creature or a place or an object no larger than 10 feet in any dimension. The target can’t be targeted by any divination magic or perceived through magical scrying sensors.' },
};
