# PlayerPane Component

## Purpose

The `PlayerPane.tsx` component is responsible for displaying the player character's detailed information. This includes:

*   Character's name, race (including subrace/lineage/ancestry if applicable), and class.
*   Vital statistics: Current HP, Max HP, Armor Class (AC), Speed, and Darkvision range.
*   Ability Scores: Final calculated scores (e.g., Strength, Dexterity) and their modifiers.
*   Skill Proficiencies: A list of skills the character is proficient in.
*   Racial Features: Displays key racial traits and selections, such as Elven Lineage details, Deep Gnome traits, Giant Ancestry Boon, Fiendish Legacy, Aarakocra traits, Air Genasi traits, Bugbear traits, Centaur traits, and Changeling traits.
*   Class Features: Displays selected class features like Fighting Style (Fighter) or Divine Domain details (Cleric).
*   Spells: Lists known Cantrips and other Known Spells, including their level and source if racially granted (e.g., "L3 via Wind Caller").
*   Inventory: Shows items currently carried by the player.

**Note**: The role of `PlayerPane` as the primary character display on the main game screen has been replaced by **`PartyPane.tsx`**, which offers a more compact view (name and health bar). `PlayerPane` is currently not rendered in the main game UI but is kept in the codebase as it contains the logic for displaying comprehensive character details, which could be repurposed for a detailed character sheet modal or a different view in the future.

The "Current Position" (world/submap coordinates) display, previously considered for this pane, has been moved to `CompassPane.tsx`.

**Key Design Principle (Original)**: `PlayerPane.tsx` acts primarily as a presentation component for character data. It receives a fully assembled `PlayerCharacter` object where complex calculations (like final darkvision range, aggregated spell lists, final speed, max HP, armorClass) have already been performed. This ensures a single source of truth for character data.

## Props

*   **`playerCharacter: PlayerCharacter`**:
    *   **Type**: `PlayerCharacter` (from `src/types.ts`)
    *   **Purpose**: The complete data object for the player character. Expected to contain all finalized stats including `darkvisionRange`, `speed`, `maxHp`, `armorClass`, and fully aggregated `knownCantrips` and `knownSpells`.
    *   **Required**: Yes

*   **`inventory: Item[]`**:
    *   **Type**: Array of `Item` objects (from `src/types.ts`)
    *   **Purpose**: List of items in the player's inventory.
    *   **Required**: Yes

## Core Functionality

1.  **Data Display**:
    *   Destructures `playerCharacter` to access information.
    *   Directly displays pre-calculated stats (`hp`, `maxHp`, `armorClass`, `speed`, `darkvisionRange`).
    *   Directly displays aggregated `knownCantrips` and `knownSpells` from `playerCharacter`.
    *   Looks up details for specific racial choices (e.g., Elven Lineage name, Deep Gnome traits, Giant Ancestry description) based on IDs in `playerCharacter` using data from `src/constants.ts`.
    *   Formats ability scores with modifiers using `getAbilityModifierString` from `src/utils/characterUtils.ts`.
    *   Lists skill proficiencies, indicating source if from specific racial traits like Centaur's Natural Affinity or Changeling Instincts.
    *   Conditionally renders sections for specific racial traits (e.g., Aarakocra, Air Genasi, Bugbear, Centaur, Changeling) and class features.
    *   Displays inventory items.

2.  **Layout and Styling**:
    *   Uses Tailwind CSS for a clear, thematic RPG presentation.
    *   Scrollable if content exceeds height.
    *   Prominently displays character name and vitals.

## Data Dependencies

*   `src/types.ts`: For `PlayerCharacter`, `Item`, `Spell`, `Skill` types.
*   `src/constants.ts`: For `RACES_DATA`, `SPELLS_DATA`, `GIANT_ANCESTRIES`, `TIEFLING_LEGACIES`, `SKILLS_DATA` (to get display names/details).
*   `src/utils/characterUtils.ts`: For `getAbilityModifierString`.

## No Internal Calculations for Core Stats/Spells

`PlayerPane` **does not perform complex calculations** for final stats like darkvision, spell lists, speed, HP, or AC. These are pre-calculated in `CharacterCreator.tsx` and provided via the `playerCharacter` prop.
