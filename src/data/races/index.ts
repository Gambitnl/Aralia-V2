/**
 * @file src/data/races/index.ts
 * This file serves as an aggregator for all race data defined in the `src/data/races/` directory.
 * It imports individual race data objects (e.g., Human, Elf, Dwarf, Dragonborn) and exports
 * them as a consolidated `ALL_RACES_DATA` object, which maps race IDs to their respective Race data.
 * It also re-exports specific data like `DRAGONBORN_ANCESTRIES_DATA`.
 */
import { HUMAN_DATA } from './human';
import { ELF_DATA } from './elf'; 
import { AASIMAR_DATA } from './aasimar';
import { DWARF_DATA } from './dwarf';
import { DRAGONBORN_DATA, DRAGONBORN_ANCESTRIES_DATA } from './dragonborn';
import { GNOME_DATA } from './gnome';
import { GOLIATH_DATA, GIANT_ANCESTRY_BENEFITS_DATA } from './goliath';
import { HALFLING_DATA } from './halfling';
import { ORC_DATA } from './orc';
import { TIEFLING_DATA, FIENDISH_LEGACIES_DATA } from './tiefling';
import { AARAKOCRA_DATA } from './aarakocra';
import { AIR_GENASI_DATA } from './air_genasi';
import { BUGBEAR_DATA } from './bugbear';
import { CENTAUR_DATA } from './centaur';
import { CHANGELING_DATA } from './changeling';
import { DEEP_GNOME_DATA } from './deep_gnome';
import { DUERGAR_DATA } from './duergar'; // Added Duergar
import { Race } from '../../types'; // Path relative to src/data/races/
import { BIOMES } from '../biomes'; 

/**
 * A record containing all available race data, keyed by race ID.
 */
export const ALL_RACES_DATA: Record<string, Race> = {
  [HUMAN_DATA.id]: HUMAN_DATA,
  [ELF_DATA.id]: ELF_DATA,
  [AASIMAR_DATA.id]: AASIMAR_DATA,
  [DWARF_DATA.id]: DWARF_DATA,
  [DRAGONBORN_DATA.id]: DRAGONBORN_DATA,
  [GNOME_DATA.id]: GNOME_DATA,
  [DEEP_GNOME_DATA.id]: DEEP_GNOME_DATA,
  [GOLIATH_DATA.id]: GOLIATH_DATA,
  [HALFLING_DATA.id]: HALFLING_DATA,
  [ORC_DATA.id]: ORC_DATA,
  [TIEFLING_DATA.id]: TIEFLING_DATA,
  [AARAKOCRA_DATA.id]: AARAKOCRA_DATA,
  [AIR_GENASI_DATA.id]: AIR_GENASI_DATA,
  [BUGBEAR_DATA.id]: BUGBEAR_DATA,
  [CENTAUR_DATA.id]: CENTAUR_DATA,
  [CHANGELING_DATA.id]: CHANGELING_DATA,
  [DUERGAR_DATA.id]: DUERGAR_DATA, // Added Duergar
};

/**
 * Data for Dragonborn ancestries, re-exported for easy access.
 */
export { DRAGONBORN_ANCESTRIES_DATA };

/**
 * Data for Goliath Giant Ancestry benefits, re-exported for easy access.
 */
export { GIANT_ANCESTRY_BENEFITS_DATA };

/**
 * Data for Tiefling Fiendish Legacies, re-exported for easy access.
 */
export { FIENDISH_LEGACIES_DATA as TIEFLING_LEGACIES_DATA };

/**
 * Data for Biomes, re-exported for easy access.
 */
export { BIOMES };
