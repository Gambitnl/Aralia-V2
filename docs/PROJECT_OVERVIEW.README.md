
# Aralia RPG - Project Overview

This document provides a high-level overview of the Aralia RPG project, its goals, architecture, and key development practices. For more detailed information on specific components or features, please refer to their respective README files, indexed in [README_INDEX.md](./README_INDEX.md).

## Core Concept
Aralia RPG is a text-based fantasy role-playing game powered by the Google Gemini API. The game focuses on dynamic storytelling, where player choices significantly impact the narrative and the world around them. **The game is set in the Dragonlance world of Krynn, just before the War of the Lance.**

## Key Features
*   **Dynamic Storytelling**: Leverages Gemini for descriptions, NPC interactions, and outcomes in the Dragonlance setting.
*   **Narrative Game Log**: Player actions are logged with diegetic phrasing (e.g., "You head North." or "You carefully examine the terrain nearby.") rather than mechanical commands, enhancing immersion.
*   **Passage of Time**: An in-game clock advances based on player actions and automatically second by second.
    *   **Automatic Advancement**: During active gameplay (not in menus, modals, or loading states), the game clock advances one second per real-world second.
    *   **Action-Based Advancement**:
        *   Moving within a submap: 30 minutes (1800 seconds).
        *   Moving to a new world map tile: 1 hour (3600 seconds).
        *   Asking the Oracle: 1 hour (3600 seconds).
        *   Inspecting a submap tile: 5 minutes (300 seconds).
    *   Other actions like looking around, talking, or taking items do not cause a fixed time advancement beyond the automatic ticking, reflecting a more "real-time" feel for those interactions.
    *   **(Future)** UI display for current day/date/season.
*   **In-depth Character Creation**: D&D 5e-style character creation process including:
    *   **Race Selection**: Choose from races like Human, Elf, Dwarf, Dragonborn, Aasimar, Gnome, Deep Gnome (Svirfneblin), Goliath, Halfling, Orc, Tiefling, Aarakocra, Air Genasi, Bugbear, Centaur, Changeling, and Duergar.
        *   **Improved UI**: Simplified race cards with a "View Details" button opening a modal for comprehensive race information and tooltips for key terms. Races are displayed alphabetically.
        *   **Human (2024 PHB Style)**: Features traits like 'Skillful' (granting a choice of one skill proficiency) and 'Versatile' (implying an Origin Feat - feats not yet fully implemented). A dedicated `HumanSkillSelection.tsx` step handles the 'Skillful' choice.
        *   **Elf Lineages**: Drow, High Elf, Wood Elf options with unique benefits and spellcasting ability choice.
        *   **Gnome Subraces**: Forest, Rock, and Deep Gnome options (for the standard Gnome race), each with distinct traits and potential magic requiring a spellcasting ability choice.
        *   **Deep Gnome (Svirfneblin) Race**: A distinct race choice with traits like Gift of the Svirfneblin (requiring spellcasting ability choice), Gnomish Magic Resistance, and Svirfneblin Camouflage.
        *   **Duergar**: A distinct dwarven race with Darkvision 120ft, Duergar Magic (Enlarge/Reduce, Invisibility, requiring spellcasting ability choice), Dwarven Resilience, and Psionic Fortitude.
        *   **Dragonborn Ancestries**: Choose an ancestry determining breath weapon and damage resistance.
        *   **Goliath Giant Ancestry**: Choose one of six supernatural boons derived from giant kin.
        *   **Halfling Traits**: Includes Brave, Halfling Nimbleness, Luck, and Naturally Stealthy.
        *   **Orc Traits**: Includes Adrenaline Rush, Darkvision (120ft), and Relentless Endurance.
        *   **Tiefling Fiendish Legacies**: Abyssal, Chthonic, or Infernal, each granting unique resistances and spells, requiring a spellcasting ability choice. Includes Otherworldly Presence trait.
        *   **Aarakocra Traits**: Includes Flight, Talons, and Wind Caller (granting Gust of Wind and requiring choice of spellcasting ability).
        *   **Air Genasi Traits**: Includes Unending Breath, Lightning Resistance, and Mingle with the Wind (granting Shocking Grasp, Feather Fall, Levitate, and requiring choice of spellcasting ability).
        *   **Bugbear Traits**: Includes Sneaky (granting Stealth proficiency), Long-Limbed, Powerful Build, Surprise Attack, Darkvision, and Fey Ancestry.
        *   **Centaur Traits**: Creature Type (Fey), 40ft Speed, Charge, Equine Build, Hooves, and a choice of one skill proficiency (Animal Handling, Medicine, Nature, or Survival) via their Natural Affinity trait.
        *   **Changeling Traits**: Creature Type (Fey), choice of Medium or Small size, 30ft Speed, the Shapechanger ability, and the "Changeling Instincts" trait which grants proficiency in two skills chosen from Deception, Insight, Intimidation, Performance, or Persuasion.
    *   **Class Selection**: Fighter, Cleric, Wizard.
    *   **Ability Score Allocation**: Implements the **Point Buy** system. Players allocate 27 points to raise scores from a base of 8 to a maximum of 15 (before racial modifiers), with higher scores costing more. Includes a **Stat Recommender** based on the selected class. See `../src/components/CharacterCreator/AbilityScoreAllocation.README.md`.
    *   **Skill Selection**: Based on class and racial traits (e.g., Elf 'Keen Senses', Human 'Skillful', Bugbear 'Sneaky', Centaur 'Natural Affinity', Changeling 'Changeling Instincts').
    *   **Class-Specific Features**: Fighting Styles (Fighter), Divine Domains & Spells (Cleric), Spellbook (Wizard).
    *   **Name and Review**: Final overview before starting.
    *   **State Management**: `CharacterCreator.tsx` uses `useReducer` for robust state management, with helper functions for cleaner state reset logic during navigation.
    *   **(Future)** Character Age selection with racial age range guidance.
*   **Character Sheet Modal with Equipment Mannequin**: View detailed character information and equipment slots.
*   **World Map & Submap**:
    *   A visual, grid-based **World Map** (`MapPane.tsx`) with a parchment texture, showing discovered biomes, locations, and player position. Features semi-random generation, Fog of War, and keyboard navigation.
    *   A detailed **Submap** (`SubmapPane.tsx`) providing a "zoomed-in" view of the player's current world map tile, with procedurally generated micro-features and visual variety. Includes a modal-based icon legend and contextual tile tooltips.
    *   **Submap Tile Inspection**: Players can inspect adjacent submap tiles to get detailed descriptions generated by Gemini.
    *   **(Future)** Enhanced procedural visual diversity and pre-inspection tooltip detail for submap tiles.
*   **Save/Load Game**:
    *   Players can save their game progress (including player state, inventory, world state, map data, game log, dynamic item states, `saveVersion`, `saveTimestamp`, `gameTime`) and load it later.
    *   A "Continue" option loads the latest save. "Load Game" allows loading the default save slot.
    *   See `../src/services/saveLoad.README.md`.
*   **Exploration & Interaction**: Navigate through locations via an 8-directional compass, look around to get dynamic descriptions and custom actions, talk to NPCs, and take items.
*   **Tooltips**: Contextual information for keywords in game messages and character creation, enhancing player understanding. See `../src/components/Tooltip.README.md`.
*   **Error Boundaries**: Implemented to catch UI errors gracefully, preventing full application crashes and providing user feedback. See `../src/components/ErrorBoundary.README.md`.
*   **Text-to-Speech**: NPC dialogue and Oracle responses can be synthesized. See `../src/data/settings/TTS_OPTIONS.README.md`.
*   **Scene Visuals (Currently Disabled)**: Configured for image generation (`imagen-3.0-generate-002`) but commented out to manage API usage.
*   **Enhanced Developer Mode**:
    *   A "Dev Menu" button (visible when `USE_DUMMY_CHARACTER_FOR_DEV` is true) provides access to a modal with developer utilities.
    *   **Dev Menu Options**: Go to Main Menu, Go to Character Creator, Force Save Game, Force Load Game, View Gemini Prompt Log.
    *   **Gemini Prompt Log Viewer**: A modal displaying a history of prompts sent to and responses received from the Gemini API, aiding in debugging AI interactions. See `../src/components/DevMenu.README.md` and `../src/components/GeminiLogViewer.README.md`.

## Technology Stack
*   Frontend: React with TypeScript
*   Styling: Tailwind CSS
*   AI: Google Gemini API (`@google/genai`)
*   Build/Environment: ES Modules with `importmap` in `index.html`.

## High-Level Architecture
*   **`src/App.tsx`**: Root component; manages global state (`useReducer`) and game flow. See `../src/App.README.md`.
*   **`src/components/`**: UI components, including `DevMenu.tsx` and `GeminiLogViewer.tsx`.
*   **`src/services/`**: External API interactions (Gemini via `aiClient.ts`, TTS) and core logic (map generation, save/load).
*   **`src/data/`**: Decoupled static game data (races, classes, items, locations, biomes, etc.). See `README_INDEX.md` for links to individual data module READMEs.
*   **`src/constants.ts`**: Global constants (like `GamePhase`, Point Buy values) and re-exporting aggregated game data.
*   **`src/types.ts`**: Core TypeScript type definitions, including `GeminiLogEntry`.
*   **`src/utils/`**: General-purpose utility functions (e.g., `characterUtils.ts`). See `../src/utils/README.md`.

## Documentation Approach
Hierarchical system of uniquely named README files. See [DOCUMENTATION_GUIDE.md](./DOCUMENTATION_GUIDE.md) and [README_INDEX.md](./README_INDEX.md).

## Setup & Running
1.  Ensure you have a modern web browser.
2.  Set up your Gemini API key as an environment variable named `API_KEY`. (The application uses `aiClient.ts` which will throw an error if this is not set).
3.  Open `index.html` in your browser.
    *   If running locally, use a simple HTTP server for ES module imports (e.g., `npx http-server .` or VS Code Live Server).

## Development Practices
*   **Dummy Character**: For quick testing, `USE_DUMMY_CHARACTER_FOR_DEV` in `src/data/dev/dummyCharacter.ts` can be set to `true` to bypass character creation. A "Skip Character Creator (Dev)" button is also available on the main menu. The "Dev Menu" provides further in-game shortcuts.
*   **Code Formatting**: Adhere to established formatting standards (e.g., Prettier, ESLint - assumed).
*   **Modularity & Decoupling**: Data, services, and UI components are kept as modular and decoupled as possible.

### Component Development & Integration
*   **Prop Validation**: When using a component, meticulously ensure all required props defined in its interface are provided. Validate data types and expected values.
*   **Parent-Child Contracts**: Understand that components often form a contract with their parents regarding props and callbacks. Clearly define these interactions. When designing or modifying a component, consider what state or handlers its parent will need to provide.
*   **README First**: For significant component changes (especially to props), consider updating the component's README file first. This can act as a specification and a checklist during implementation and integration.

## Adding a New Race
(Process for adding a new race, including UI components for race-specific choices, state updates in CharacterCreator, and data definitions.)
1.  **Define Race Data (`src/data/races/[race_id].ts`)**: Create the race object with traits, and if needed, structures for specific choices (like `ElvenLineage`).
2.  **Aggregate Race Data (`src/data/races/index.ts`)**: Import and add to `ALL_RACES_DATA`.
3.  **Type Definitions (`src/types.ts`)**: Add new types for unique choices if any. Update `PlayerCharacter` for new state fields.
4.  **Character Creator Logic (`CharacterCreator.tsx`)**:
    *   Add to `CreationStep` enum if a new selection screen is needed.
    *   Update `CharacterCreationState` for new fields.
    *   Update `characterCreatorReducer` (next step logic, `GO_BACK` logic, state resets).
    *   Update final character assembly in `handleNameAndReviewSubmit`.
    *   Add to `renderStep()` to show the new selection component.
5.  **Race-Specific Selection Component (`src/components/CharacterCreator/Race/`)**: Create if needed.
6.  **Documentation**: Update `PROJECT_OVERVIEW.README.md`, create READMEs for new data/components, and update `README_INDEX.md`.

## Future Development & TODOs
See [FEATURES_TODO.md](./FEATURES_TODO.md) and [QOL_TODO.md](./QOL_TODO.md).
