/**
 * @file src/data/world/npcs.ts
 * Defines all NPC data for the Aralia RPG.
 */
import { NPC } from '../../types'; // TTSVoiceOption is part of NPC type if used

export const NPCS: Record<string, NPC> = {
  'old_hermit': {
    id: 'old_hermit',
    name: 'Old Hermit',
    baseDescription: 'A weathered old man with kind eyes, dressed in simple robes.',
    dialoguePromptSeed: 'The hermit looks up as you approach, a faint smile on his lips.'
    // voice: TTS_VOICE_OPTIONS.find(v => v.name === 'Charon') // Example if voices were assigned directly
  },
  'nervous_scout': {
    id: 'nervous_scout',
    name: 'Nervous Scout',
    baseDescription: 'A young scout, fidgeting and glancing around often.',
    dialoguePromptSeed: 'The scout jumps as you get closer, hand on their dagger.'
    // voice: TTS_VOICE_OPTIONS.find(v => v.name === 'Puck')
  },
  'villager_generic': {
    id: 'villager_generic',
    name: 'Villager',
    baseDescription: 'A common villager, perhaps running errands or enjoying the day.',
    dialoguePromptSeed: 'The villager offers a polite nod as you pass by.',
    voice: { name: 'Aoede', characteristic: 'Breezy' } 
  },
  'merchant_generic': {
    id: 'merchant_generic',
    name: 'Street Merchant',
    baseDescription: 'A merchant stands by a small cart of wares, keenly observing passersby.',
    dialoguePromptSeed: 'The merchant calls out, "Looking for a good deal, traveler?"',
    voice: { name: 'Charon', characteristic: 'Informative' }
  },
  'guard_generic': {
    id: 'guard_generic',
    name: 'Town Guard',
    baseDescription: 'A guard in simple livery stands at attention, keeping a watchful eye on the surroundings.',
    dialoguePromptSeed: 'The guard gives a curt nod, their gaze assessing.',
    voice: { name: 'Kore', characteristic: 'Firm' }
  }
};