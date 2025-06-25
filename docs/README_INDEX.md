
# Aralia RPG - Documentation Index

This file serves as a central index for all README documentation within the Aralia RPG project. It helps in navigating and understanding the purpose of different documentation files.

## Root Level (Now in `docs/`)

*   **[`PROJECT_OVERVIEW.README.md`](./PROJECT_OVERVIEW.README.md)**: The main entry point for the project. Provides a high-level overview, core features, technology stack, setup instructions, project structure, and links to other key documents.
*   **[`DOCUMENTATION_GUIDE.md`](./DOCUMENTATION_GUIDE.md)**: Explains the project's documentation strategy, README structure guidelines, naming conventions, and how to maintain documentation.
*   **[`CHANGELOG.md`](./CHANGELOG.md)**: Tracks notable changes to the application across versions.
*   **[`README_INDEX.md`](./README_INDEX.md)**: This file. An index of all READMEs.
*   **[`FEATURES_TODO.md`](./FEATURES_TODO.md)**: A comprehensive list of planned features, enhancements, and tasks for future development.
*   **[`QOL_TODO.md`](./QOL_TODO.md)**: Lists Quality of Life improvements and general TODO items identified from code reviews and planning.
*   **[`POTENTIAL_TOOL_INTEGRATIONS.README.md`](./POTENTIAL_TOOL_INTEGRATIONS.README.md)**: Lists potential tools and libraries that could be integrated to enhance the application.

## Guides (`docs/guides/`)
*   **[`docs/guides/CLASS_ADDITION_GUIDE.md`](./guides/CLASS_ADDITION_GUIDE.md)**: A comprehensive guide on how to add a new character class to the Aralia RPG, covering data definitions, type updates, state management, UI components, and character assembly logic.
*   **[`docs/guides/GLOSSARY_ENTRY_DESIGN_GUIDE.md`](./guides/GLOSSARY_ENTRY_DESIGN_GUIDE.md)**: Outlines the structure, content, and styling conventions for creating and updating glossary entries, particularly focusing on class entries as examples.

## Source Code Documentation (`src/`)

### Core Application

*   **[`src/App.README.md`](../src/App.README.md)**: Documents the root React component `App.tsx`, covering its state management (now using centralized state and custom hooks), core functionality, and data dependencies.

### State Management (`src/state/`)
*   **[`src/state/appState.README.md`](../src/state/appState.README.md)**: Details the `appState.ts` module, including the `appReducer`, `initialGameState`, and `AppAction` type definitions.

### Custom Hooks (`src/hooks/`)
*   **[`src/hooks/useAudio.README.md`](../src/hooks/useAudio.README.md)**: Explains the `useAudio.ts` custom hook for managing audio context and PCM playback.
*   **[`src/hooks/useGameActions.README.md`](../src/hooks/useGameActions.README.md)**: Documents the `useGameActions.ts` custom hook, which encapsulates the logic for processing various player actions.
*   **[`src/hooks/useGameInitialization.README.md`](../src/hooks/useGameInitialization.README.md)**: Details the `useGameInitialization.ts` custom hook for handling game start, load, and setup scenarios.
*   **[`src/hooks/useSubmapProceduralData.README.md`](../src/hooks/useSubmapProceduralData.README.md)**: Details the `useSubmapProceduralData.ts` custom hook for generating procedural data (hashes, seeded features, paths) for the `SubmapPane`.


### Components (`src/components/`)

*   **`src/components/CharacterCreator/CharacterCreator.README.md`**: Details the main `CharacterCreator.tsx` component, its step-by-step process, state management (`useReducer`), and how it assembles the final player character.
*   **`src/components/CharacterCreator/RaceSelection.README.md`**: Explains the `RaceSelection.tsx` component, focusing on its display of race cards, the detail modal with tooltips, and alphabetical sorting of races.
*   **`src/components/CharacterCreator/AbilityScoreAllocation.README.md`**: Covers `AbilityScoreAllocation.tsx`, detailing the Point Buy system, display of racial bonuses, final scores, and the Stat Recommender feature.
*   **`src/components/CharacterCreator/SkillSelection.README.md`**: Documents `SkillSelection.tsx`, including selection of class-based skills and handling of racial skill grants (Elf's Keen Senses, Human's Skillful, Bugbear's Sneaky, Centaur's Natural Affinity, Changeling's Instincts).
*   **`src/components/CharacterCreator/NameAndReview.README.md`**: Documents `NameAndReview.tsx`, explaining how it previews the character and handles final naming.
*   **`src/components/CharacterCreator/state/characterCreatorState.README.md`**: Details the state management logic for the Character Creator.
*   **`src/components/CharacterCreator/hooks/useCharacterAssembly.README.md`**: Documents the hook responsible for character assembly logic.
*   **`src/components/CharacterCreator/Race/AarakocraSpellcastingAbilitySelection.README.md`**: Explains the component for Aarakocra characters to select their spellcasting ability for the "Wind Caller" trait.
*   **`src/components/CharacterCreator/Race/AirGenasiSpellcastingAbilitySelection.README.md`**: Explains the component for Air Genasi characters to select their spellcasting ability for the "Mingle with the Wind" trait.
*   **`src/components/CharacterCreator/Race/CentaurNaturalAffinitySkillSelection.README.md`**: Explains the component for Centaur characters to select their "Natural Affinity" skill.
*   **`src/components/CharacterCreator/Race/ChangelingInstinctsSelection.README.md`**: Explains the component for Changeling characters to select their "Changeling Instincts" skills.
*   **`src/components/CharacterCreator/Race/DeepGnomeSpellcastingAbilitySelection.README.md`**: Details the component for Deep Gnome characters to select their spellcasting ability for the "Gift of the Svirfneblin" trait.
*   **`src/components/CharacterCreator/Race/DragonbornAncestrySelection.README.md`**: Details the component for Dragonborn characters to select their Draconic Ancestry.
*   **`src/components/CharacterCreator/Race/DuergarMagicSpellcastingAbilitySelection.README.md`**: Details the component for Duergar characters to select their spellcasting ability for the "Duergar Magic" trait.
*   **`src/components/CharacterCreator/Race/ElfLineageSelection.README.md`**: Documents the component for Elf characters to choose their Elven Lineage and associated spellcasting ability.
*   **`src/components/CharacterCreator/Race/FlexibleAsiSelection.README.md`**: Describes the component for handling flexible ability score increases.
*   **`src/components/CharacterCreator/Race/GiantAncestrySelection.README.md`**: Explains the component for Goliath characters to select their Giant Ancestry benefit.
*   **`src/components/CharacterCreator/Race/GnomeSubraceSelection.README.md`**: Details the component for Gnome characters to select their Gnome Subrace and associated spellcasting ability.
*   **`src/components/CharacterCreator/Race/HumanSkillSelection.README.md`**: Covers the component for Human characters to select one skill proficiency via their "Skillful" trait.
*   **`src/components/CharacterCreator/Race/TieflingLegacySelection.README.md`**: Explains the component for Tiefling characters to choose their Fiendish Legacy and associated spellcasting ability.
*   **`src/components/CharacterCreator/Class/FighterFeatureSelection.README.md`**: Documents the component for Fighter characters to select their Fighting Style.
*   **`src/components/CharacterCreator/Class/ClericFeatureSelection.README.md`**: Details the component for Cleric characters to select their Divine Domain and initial spells.
*   **`src/components/CharacterCreator/Class/WizardFeatureSelection.README.md`**: Covers the component for Wizard characters to select their initial spells.
*   **`src/components/CompassPane.README.md`**: Details the compass navigation UI, including coordinate and game time display.
*   **`src/components/ActionPane.README.md`**: Documents the action button UI, including Gemini custom actions and system actions.
*   **`src/components/MapPane.README.md`**: Documents the `MapPane.tsx` component, covering its props, functionality for displaying the game map (grid, tiles, biomes, fog of war, player position), interaction (including keyboard navigation and glossary), and styling.
*   **`src/components/SubmapPane.README.md`**: Documents the `SubmapPane.tsx` component, its purpose for displaying the visual submap, props, procedural generation of visuals (now using `useSubmapProceduralData` hook and decomposed `getTileVisuals`), and the modal-based icon legend.
*   **`src/components/Tooltip.README.md`**: Explains the reusable `Tooltip.tsx` component, its props, dynamic positioning logic using React Portals, and accessibility features.
*   **`src/components/GlossaryTooltip.README.md`**: Explains the `GlossaryTooltip.tsx` component which wraps the standard `Tooltip` for glossary-specific functionality.
*   **`src/components/PlayerPane.README.md`**: Details the `PlayerPane.tsx` component, covering its role in displaying comprehensive character information (now largely superseded by `PartyPane` and `CharacterSheetModal`).
*   **`src/components/PartyPane.README.md`**: Details the `PartyPane.tsx` component, which displays character buttons with health bars and AC, and opens the Character Sheet Modal on click.
*   **`src/components/CharacterSheetModal.README.md`**: Documents the `CharacterSheetModal.tsx` component used to display detailed character information.
*   **`src/components/CharacterSheet/SkillDetailDisplay.README.md`**: Documents the `SkillDetailDisplay.tsx` component for showing detailed skill stats.
*   **`src/components/EquipmentMannequin.README.md`**: Explains the `EquipmentMannequin.tsx` component for visually displaying character equipment slots, including dynamic icons and proficiency warnings.
*   **`src/components/DynamicMannequinSlotIcon.README.md`**: Details the component for dynamically loading proficiency-based mannequin slot icons.
*   **`src/components/InventoryList.README.md`**: Explains the component for displaying the character's inventory with actions.
*   **`src/components/ErrorBoundary.README.md`**: Documents the `ErrorBoundary.tsx` component, its purpose in catching UI errors, and how it displays a fallback UI.
*   **`src/components/Glossary.README.md`**: Details the `Glossary.tsx` component for displaying the interactive game glossary.
*   **`src/components/GlossaryDisplay.README.md`**: Details the `GlossaryDisplay.tsx` component used for rendering map and submap legends.
*   **`src/components/DevMenu.README.md`**: Explains the `DevMenu.tsx` component, which provides a modal for developer-specific actions like navigation, save/load, and opening the Gemini log.
*   **`src/components/GeminiLogViewer.README.md`**: Documents the `GeminiLogViewer.tsx` component, used to display a history of prompts and responses from the Gemini API.
*   **`src/components/DiscoveryLogPane.README.md`**: Details the `DiscoveryLogPane.tsx` component for displaying the player's discovery journal.

### Services (`src/services/`)

*   **`src/services/aiClient.README.md`**: Details `aiClient.ts`, its role in centralizing Google Gemini API client initialization, API key validation, and exporting the shared client instance.
*   **`src/services/mapService.README.md`**: Documents `mapService.ts`, focusing on the `generateMap` function, its parameters, map generation logic (tile initialization, placing predefined locations, biome clustering), and data dependencies.
*   **`src/services/saveLoad.README.md`**: Details `saveLoadService.ts`, its functions for saving/loading game state (including `mapData`, `dynamicLocationItemIds`, etc.) to Local Storage, versioning, and helper functions.
*   **`src/services/geminiService.README.md`**: Documents `geminiService.ts`, covering its functions for generating text, images, and custom actions using the Gemini API.

### Utilities (`src/utils/`)

*   **[`src/utils/README.md`](../src/utils/README.md)**: Describes the purpose of the `src/utils/` directory for housing general-purpose utility functions.
*   **[`src/utils/characterUtils.README.md`](../src/utils/characterUtils.README.md)**: Documents the utility functions in `characterUtils.ts`, such as those for calculating ability score modifiers.

### Data Definitions (`src/data/`)

*   **`src/data/biomes.README.md`**: Explains the structure of `src/data/biomes.ts`, detailing the `Biome` object properties (id, name, color, icon, description, passability, impassableReason) and its usage.
*   **`src/data/classes/CLASSES.README.md`**: Documents `src/data/classes/index.ts`, detailing the `Class` object properties (hitDie, proficiencies, features, spellcasting, stat recommendations) and its usage.
*   **`src/data/items/ITEMS.README.md`**: Explains the structure of `src/data/items/index.ts`, detailing the `Item` object properties (id, name, description, type, effect, icon, slot, weight, cost, etc.) and its usage.
*   **`src/data/races/deep_gnome.README.md`**: Documents the data structure for the standalone Deep Gnome race in `src/data/races/deep_gnome.ts`.
*   **`src/data/races/duergar.README.md`**: Documents the data structure for the Duergar race in `src/data/races/duergar.ts`.
*   **`src/data/skills/SKILLS.README.md`**: Documents `src/data/skills/index.ts`, detailing the `Skill` object properties (id, name, associated ability) and its usage.
*   **`src/data/spells/SPELLS.README.md`**: Explains the structure of `src/data/spells/index.ts`, detailing the `Spell` object properties (id, name, level, description) and its usage.
*   **`src/data/world/LOCATIONS.README.md`**: Details the structure of `src/data/world/locations.ts`, including `LOCATIONS` and `STARTING_LOCATION_ID`.
*   **`src/data/world/NPCS.README.md`**: Details the structure of `src/data/world/npcs.ts` which defines `NPCS`.
*   **`src/data/settings/TTS_OPTIONS.README.md`**: Details the structure of `src/data/settings/ttsOptions.ts` which defines `TTS_VOICE_OPTIONS`.
*   **`src/data/dev/DUMMY_CHARACTER.README.md`**: Explains `src/data/dev/dummyCharacter.ts`, its purpose, and how `DUMMY_CHARACTER_FOR_DEV` is initialized and used.
*   **Individual Race Data READMEs**: While not every `[race_id].ts` has a dedicated README, complex ones or those introducing unique mechanics may. Refer to comments within individual race files or the general structure described in `docs/PROJECT_OVERVIEW.README.md`.

---
*This index should be updated whenever a new README is added or an existing one is significantly modified.*
