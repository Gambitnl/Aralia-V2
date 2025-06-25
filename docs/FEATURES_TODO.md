
# Aralia RPG - Feature TODO List

This file tracks planned features, enhancements, and tasks for the Aralia RPG project.

## Core Gameplay Systems

*   **Saving and Loading Games**:
    *   **[DONE]** Implement functionality to save game progress (player state, inventory, world state including `mapData`, `subMapCoordinates`, game log, dynamic item states, `saveVersion`, `saveTimestamp`).
    *   **[DONE]** Implement functionality to load saved games from a default slot, including version checking and resetting transient UI states.
    *   **[DONE]** Add a "Continue Game" option on the main menu to load the most recent save.
    *   **[DONE]** Provide "Save Game" button in `ActionPane`.
    *   **[DONE]** Allow "Main Menu" button to save game before exiting (if not in dev dummy mode).
    *   Implement save slots. (Future sub-task)
    *   See `../src/services/saveLoad.README.md` for design considerations.
*   **Character Sheet & Equipment**:
    *   **[DONE]** Display a Character Sheet modal when a party member is clicked.
    *   **[DONE]** Implement a visual Equipment Mannequin UI with slots.
    *   Implement logic for equipping and unequipping items.
    *   Update character stats (AC, etc.) based on equipped items.
*   **Combat System**:
    *   Develop a turn-based or real-time combat system.
    *   Implement mechanics for attacks, damage, defense, and conditions.
    *   Integrate spells and abilities into combat.
*   **Quest System**:
    *   Implement a robust quest system with objectives, tracking, and rewards.
    *   Allow quests to be given by NPCs or discovered in the world.
*   **Character Progression**:
    *   Leveling up system.
    *   Gaining new abilities/spells upon level-up.
    *   Improving stats or choosing feats.
*   **Feat System**:
    *   Integrate feats as part of character creation and progression.
*   **Economy System**:
    *   Introduce currency, shops, and trading.
*   **Rest Mechanics**:
    *   Implement Short Rest and Long Rest mechanics for recovery of HP, spell slots, and feature uses.
*   **Secure Dice Roll Handling**:
    *   Implement server-side or secure client-side dice rolls that are not vulnerable to client-side manipulation. User should be able to trigger rolls via a button.
*   **Party Members**:
    *   Introduce companion NPCs that can join the player's party.
    *   Basic AI and combat capabilities for party members.
*   **Character Age in Creation**:
    *   Add Age selection to Character Creation.
    *   Define and display logical age ranges for each race (e.g., in `src/data/races/`).
    *   Store and display character age.

## World & Exploration

*   **Advanced World Map Features**:
    *   Implement more sophisticated procedural generation algorithms for biome zones (e.g., Perlin noise, cellular automata).
    *   Allow procedural generation of actual `Location` data for unkeyed map tiles, making the world truly dynamic.
    *   Add map markers for various points of interest, discovered locations, current quests, etc.
    *   Implement map panning and zooming.
    *   Explore different grid types (e.g., hexagonal).
*   **Enhanced Submap Tile Descriptiveness**:
    *   Enhance procedural visual diversity of submap tiles (more icons, colors, feature types).
    *   Improve pre-inspection tooltip detail for submap tiles, making non-adjacent tiles more informative based on procedural data.
*   **Points of Interest (POI) System**:
    *   Define a list/data structure for various Points of Interest (e.g., shrines, hidden caves, unique landmarks, minor encounters).
    *   Implement logic to sparsely distribute these POIs across map tiles, potentially during map generation or as discoverable elements.
    *   POIs should be distinct from major, predefined `Location` objects and offer minor interactions or flavor.
*   **Towns & Cities**:
    *   Develop more complex urban environments with unique NPCs, quests, and services.
*   **Enhanced NPCs & Factions**:
    *   Develop NPCs with more depth, including routines, relationships, and affiliations with factions.
    *   Dynamic NPC reactions based on player actions and reputation.
*   **In-Game Day/Date/Season**:
    *   Display current in-game day/date/season in the UI (e.g., in `CompassPane` or a new GameInfoPane).
    *   Implement game mechanics or events tied to specific in-game days/dates/seasons.


## AI & Storytelling (Gemini Integration)

*   **DM (Storyteller) Consistency**:
    *   Improve the consistency of the Gemini-powered storyteller/DM, potentially through better prompting, memory management, or fine-tuning.
*   **Logbook-Fueled Gemini Inference**:
    *   Utilize the game log/player history to provide Gemini with more context, enabling more consistent and evolving NPC personas, backstories, and potentially emergent side quests based on player actions.
*   **Gemini-Generated Custom Actions**:
    *   **[DONE]** After "Look Around", Gemini suggests 3 custom, non-directional actions.
    *   **[DONE]** These actions are displayed in `ActionPane` and can be selected by the player.
*   **Enrich Tile Inspection Prompt**:
    *   Consider adding the generated submap tile tooltip text (or a pre-generated visual summary) to the Gemini inspection prompt for `generateTileInspectionDetails` for even richer context, if beneficial.

## UI/UX Enhancements

*   **Minimap**:
    *   Implement a small, always-visible (or toggleable) version of the main map.
    *   Shows the immediate surroundings of the player.
    *   Could display nearby points of interest or quest indicators.
*   **Map Tile Tooltips**:
    *   On hover over a tile on the main map (and future minimap):
        *   Display a tooltip showing: Biome type, coordinates.
        *   If a predefined location: Location name.
        *   If any POIs are present and known: List or icons for POIs.
*   **Quest Indicators on Map**:
    *   Display visual indicators (icons) on map tiles that are relevant to active quests (e.g., quest objective location, quest giver).
*   **Inventory Management**:
    *   More advanced inventory features (e.g., equipping items, item weight, containers, item comparison).
*   **Sound Effects and Music**:
    *   Add ambient sounds for different biomes and locations.
    *   Implement background music with contextual changes.
*   **Accessibility Improvements**:
    *   **[PARTIALLY DONE]** Current ARIA implementations, keyboard navigation for map, tooltips.
    *   Continue to enhance accessibility (e.g., full keyboard navigation for all interactive elements, screen reader compatibility testing).
*   **Scene Visuals**:
    *   Re-enable and test the `ImagePane` and `generateImageForScene` functionality when API usage/quotas allow.
*   **Tooltips for Keywords**:
    *   **[DONE]** Implemented `Tooltip.tsx` component.
    *   **[DONE]** Integrated into `WorldPane.tsx` for game messages.
    *   **[DONE]** Integrated into `RaceSelection.tsx` (RaceDetailModal) for D&D terms.
*   **Submap Display**:
    *   **[DONE]** Created `SubmapPane.tsx` for detailed local view.
    *   **[DONE]** Integrated toggle button in `ActionPane.tsx`.
*   **Map & Submap Glossary/Legend**:
    *   **[DONE]** Implemented `GlossaryDisplay.tsx`.
    *   **[DONE]** Integrated into `MapPane.tsx` and `SubmapPane.tsx` (modal-based for submap).

## Technical & System

*   **Comprehensive Documentation**:
    *   **[ONGOING]** Continue to create and update uniquely named READMEs for new components, services, and data structures as per [DOCUMENTATION_GUIDE.md](./DOCUMENTATION_GUIDE.md).
    *   **[ONGOING]** Ensure [README_INDEX.md](./README_INDEX.md) is kept meticulously up-to-date.
*   **Error Handling**:
    *   **[DONE]** Implemented `ErrorBoundary.tsx` and wrapped key UI sections.
*   **Code Quality & Refactoring**:
    *   **[PARTIALLY DONE]** Address items from `QOL_TODO.md`.
    *   **[DONE]** Decoupled data definitions from `constants.ts`.
    *   **[DONE]** Centralized AI client initialization in `aiClient.ts`.
    *   **[DONE]** Refactored `CharacterCreator.tsx` to use `useReducer`.
    *   **[DONE]** Centralized utility functions (e.g., `characterUtils.ts`).
    *   **[DONE]** `App.tsx` state management refactored to `useReducer`.
    *   **[DONE]** `App.tsx` action processing refactored into helper functions.
