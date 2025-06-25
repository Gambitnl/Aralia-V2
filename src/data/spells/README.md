
# Spells Data (`src/data/spells/index.ts`)

## Purpose

The `src/data/spells/index.ts` file is the central repository for all spell definitions used in the Aralia RPG. This data is essential for character creation (Wizards, Clerics, and races with innate spellcasting selecting spells), displaying spell information in the UI (e.g., `PlayerPane.tsx`), and potentially for future game mechanics involving spellcasting.

## Structure

The file exports a single constant:

*   **`SPELLS_DATA: Record<string, Spell>`**
    *   This is an object where each key is a unique string identifier for a spell (e.g., `'fire_bolt'`, `'magic_missile'`). This ID is used internally to reference the spell.
    *   The value for each key is a `Spell` object, defined in `src/types.ts`.

### `Spell` Object Properties

Each `Spell` object has the following properties:

*   **`id: string`**: The unique identifier for the spell (should match the key in the `SPELLS_DATA` record).
    *   Example: `"fire_bolt"`
*   **`name: string`**: The display name of the spell.
    *   Example: `"Fire Bolt"`
*   **`level: number`**: The spell's level. `0` indicates a cantrip.
    *   Example: `0` for Fire Bolt, `1` for Magic Missile.
*   **`description: string`**: A textual description of the spell's effect.
    *   Example: `"Hurl a mote of fire."` for Fire Bolt.

*Future properties could include*: School of magic, casting time, range, components (V, S, M), duration, damage type, dice, area of effect, etc., if the game mechanics require more detailed spell information.

## Example Entry

```typescript
// From src/data/spells/index.ts
export const SPELLS_DATA: Record<string, Spell> = {
  // Cantrips
  'fire_bolt': { 
    id: 'fire_bolt', 
    name: 'Fire Bolt', 
    level: 0, 
    description: 'Hurl a mote of fire.' 
  },
  'light': { 
    id: 'light', 
    name: 'Light', 
    level: 0, 
    description: 'Make an object shed bright light.' 
  },
  // Level 1
  'magic_missile': { 
    id: 'magic_missile', 
    name: 'Magic Missile', 
    level: 1, 
    description: 'Create three glowing darts of magical force.' 
  },
  // ... more spells
};
```

## Usage

*   **Character Creation (`src/components/CharacterCreator/`)**:
    *   Used by `ClericFeatureSelection.tsx` and `WizardFeatureSelection.tsx` to populate lists of available spells for players to choose from.
    *   Referenced by race-specific selection components (e.g., `ElvenLineageSelection.tsx`, `TieflingLegacySelection.tsx`) to identify spells granted by racial traits.
    *   `NameAndReview.tsx` uses it to display the names of known spells.
*   **`PlayerPane.tsx`**: Displays the names and details (like descriptions via tooltips or a dedicated spellbook view in the future) of the character's known spells.
*   **`src/constants.ts`**: Imports and re-exports `SPELLS_DATA` for global access.
*   Game Mechanics (Future): Would be used to determine spell effects, damage, saving throws, etc., during gameplay.

## Adding a New Spell

1.  Define a new entry in the `SPELLS_DATA` object in `src/data/spells/index.ts`.
2.  Ensure the `id` is unique and follows a consistent naming convention (e.g., lowercase with underscores).
3.  Provide the `name`, `level`, and `description`.
4.  If the spell is intended to be part of a class's spell list or a racial trait, update the relevant data in `src/data/classes/index.ts` or the specific race file in `src/data/races/` to include the new spell's `id`.
