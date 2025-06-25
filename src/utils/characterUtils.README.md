# Character Utilities (`src/utils/characterUtils.ts`)

## Purpose

The `characterUtils.ts` module provides helper functions related to player character data and calculations, specifically focusing on D&D 5th Edition mechanics like ability score modifiers, armor class, and armor proficiency.

## Functions

### `getAbilityModifierValue(score: number): number`
*   Calculates the numerical ability score modifier.

### `getAbilityModifierString(score: number): string`
*   Calculates and formats the ability score modifier as a string (e.g., "+2").

### `getCharacterMaxArmorProficiency(character: PlayerCharacter): ArmorProficiencyLevel`
*   **Purpose**: Determines the character's highest level of armor proficiency (unarmored, light, medium, or heavy).
*   **TODO**: Implement full logic based on `character.class.armorProficiencies` and any special class features (e.g., Life Domain Cleric for heavy armor). Will ignore "Shields" proficiency for body armor slots.

### `getArmorCategoryHierarchy(category?: ArmorCategory): number`
*   **Purpose**: Returns a numerical value representing the hierarchy of armor categories (Light, Medium, Heavy). Shields will be handled separately or return 0.
*   **TODO**: Implement the mapping: e.g., Light (1), Medium (2), Heavy (3).
