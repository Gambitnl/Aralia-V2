
# Changelog

All notable changes to the Aralia RPG project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html) (though it's pre-1.0.0, so API is subject to change).

### Fixed
- **Static Submap Paths & Player Starting Position**:
    - In `useSubmapProceduralData.ts`, removed the `playerSubmapCoordsForPath` prop and its influence on path generation.
    - For the initial starting submap, the path generation now ensures the fixed center coordinates of the submap are part of the main path. This guarantees the player (who also starts at these center coordinates) begins on a path tile, while keeping the path itself static.
    - This resolves an issue where the path on the starting submap would dynamically follow the player's current tile ("road companion" bug). Paths are now truly static once generated for any given submap.
    - Updated `SubmapPane.tsx` to no longer pass player coordinates for path generation to the hook.

## 2025-06-20 - 06:59:21 UTC
### Added & Changed (Summary of Iterative Development Session)

This entry summarizes a significant period of iterative development and refactoring across the Aralia RPG application.

**I. Core Gameplay & Systems:**
    *   **Character Creation Overhaul**:
        *   Implemented a multi-step character creation process (`CharacterCreator.tsx`) using `useReducer` for state management (`src/components/CharacterCreator/state/characterCreatorState.ts`) and a `useCharacterAssembly` hook for logic.
        *   Added new D&D races: Aarakocra, Air Genasi, Bugbear, Centaur, Changeling, Deep Gnome (Svirfneblin), Duergar, Goliath, Halfling, Orc, Tiefling.
        *   Updated existing races (Human, Elf, Gnome, Dragonborn, Dwarf, Aasimar) to reflect 2024 PHB style flexible ASIs and unique traits.
        *   Developed race-specific selection components (e.g., `ElfLineageSelection`, `DragonbornAncestrySelection`, `TieflingLegacySelection`, `AarakocraSpellcastingAbilitySelection`, `DeepGnomeSpellcastingAbilitySelection`, `DuergarMagicSpellcastingAbilitySelection`, etc.).
        *   Implemented a Point Buy system for ability scores (`AbilityScoreAllocation.tsx`) with a class-based Stat Recommender.
        *   Added a `FlexibleAsiSelection.tsx` step for races with flexible ASIs.
        *   Included a `HumanSkillSelection.tsx` step.
        *   Enhanced skill selection to account for racial grants (Elf's Keen Senses, Human's Skillful, Bugbear's Sneaky, Centaur's Natural Affinity, Changeling's Instincts).
    *   **Save/Load System (`saveLoadService.ts`)**: Implemented robust game saving and loading to Local Storage, including versioning, map data, dynamic item states, submap coordinates, game time, and inspected tile descriptions.
    *   **Game Time**: Implemented an in-game clock in `App.tsx` that advances automatically per second and by larger fixed amounts for specific actions. Displayed in `CompassPane.tsx`.
    *   **Error Handling**: Introduced `ErrorBoundary.tsx` to gracefully handle UI errors.
    *   **Utilities**: Created `src/utils/characterUtils.ts` (ability modifiers) and `src/utils/locationUtils.ts` (dynamic NPC determination).

**II. UI & UX Enhancements:**
    *   **Main UI Refactor**: `App.tsx` now uses `PartyPane.tsx` (compact character display) instead of the detailed `PlayerPane.tsx`.
    *   **Character Details**: `CharacterSheetModal.tsx` and `EquipmentMannequin.tsx` for viewing detailed character information.
    *   **World Pane**: `WorldPane.tsx` now features tooltips for keywords.
    *   **Action Pane**: `ActionPane.tsx` displays Gemini-generated custom actions, save game, and dev menu toggle.
    *   **Compass Pane**: `CompassPane.tsx` handles 8-directional navigation, shows current world/submap coordinates, game time, and map/submap toggles.
    *   **Mapping**:
        *   `MapPane.tsx`: World map with Fog of War, keyboard navigation, and modal-based icon glossary (`GlossaryDisplay.tsx`).
        *   `SubmapPane.tsx`: Detailed local view with procedural visuals (via `useSubmapProceduralData.ts` hook), path generation, feature clumping, modal-based icon legend, contextual tooltips, and a tile inspection feature. Inspected tile descriptions are now persistent.
    *   **Tooltips**: Reusable `Tooltip.tsx` component implemented and used throughout.
    *   **Loading Spinner**: Standardized `LoadingSpinner.tsx`.
    *   **Image Pane**: `ImagePane.tsx` for scene visuals (though generation might be temporarily disabled).

**III. AI Integration (Gemini API):**
    *   **Centralized Client**: `aiClient.ts` for shared `GoogleGenAI` instance and API key validation.
    *   **Gemini Service (`geminiService.ts`)**:
        *   Functions now return `GenerateTextResult` (text, prompt, raw response) for improved logging.
        *   Added `generateCustomActions` for dynamic player choices.
        *   Added `generateTileInspectionDetails` for submap exploration, with prompts refined for immersion and to avoid game jargon.
    *   **TTS Service (`ttsService.ts`)**: For Text-to-Speech functionality.
    *   **Developer Tools**:
        *   `DevMenu.tsx`: Modal for developer shortcuts (save, load, navigation, log viewer access).
        *   `GeminiLogViewer.tsx`: Modal to display a history of Gemini API prompts and responses.
        *   Integrated Gemini interaction logging into `appState.ts` and `useGameActions.ts`.

**IV. Architecture & Code Quality:**
    *   **State Management**: `App.tsx` refactored to use `useReducer` with centralized state logic in `src/state/appState.ts`.
    *   **Custom Hooks**: Extracted complex logic into `useGameActions.ts`, `useGameInitialization.ts`, `useAudio.ts`, and `useSubmapProceduralData.ts`.
    *   **Data Decoupling**: Moved static game data (locations, NPCs, items, spells, classes, biomes, TTS options, dummy character) from `constants.ts` into organized subdirectories under `src/data/`.
    *   **Documentation**: Extensive creation and updates to README files for components, services, data modules, and hooks. Updated `PROJECT_OVERVIEW.README.md` and `README_INDEX.md`.

**V. Bug Fixes:**
    *   Fixed an issue where the starting submap's path would dynamically re-align to the player's current position rather than being static.

## YYYY-MM-DD - HH:MM:SS UTC
### Changed
- **Gemini Prompt Enhancement for Submap Tile Inspection**:
    - Updated `geminiService.generateTileInspectionDetails` to provide more descriptive and natural language context to the AI.
    - The system instruction now explicitly tells Gemini to avoid game-specific jargon like 'tile' in its narrative response (this was already present but re-verified).
    - The user prompt context now describes the inspected area more diegetically:
        - Abstract `effectiveTerrainType` values like 'path_adj' or 'path' are translated into more natural descriptions (e.g., "area immediately adjacent to a discernible path").
        - If an inspected tile has an `activeFeatureConfig` with an icon, the prompt now includes the feature's name, its icon, and the icon's meaning from `SUBMAP_ICON_MEANINGS` (if available).
    - This aims to improve the quality and immersion of Gemini-generated descriptions for inspected submap tiles by reducing jargon and providing more evocative input.

## YYYY-MM-DD - HH:MM:SS UTC
### Changed
- **Refined Narrative Player Action Logging for Tile Inspection**: Improved the diegetic message for the "inspect_submap_tile" action in `useGameActions.ts`.
    - Instead of logging "You carefully inspect the area at sub-tile (X, Y).", it now logs a more immersive message like "You carefully examine the terrain nearby."
    - This further enhances the narrative quality of the game log by removing game-specific coordinate terminology from the player's expressed actions.

## YYYY-MM-DD - HH:MM:SS UTC
### Changed
- **Narrative Player Action Logging**: Implemented diegetic (narrative) messages for player actions in the game log within `useGameActions.ts`.
    - Created a new helper function `getDiegeticPlayerActionMessage(action: Action, npcs: Record<string, NPC>, locations: Record<string, Location>): string | null`.
    - This function generates narrative messages like "You head North." or "You carefully inspect the area at sub-tile (14, 11)." instead of "> Move North" or "> Inspect tile (14,11)".
    - The `processAction` function now calls this helper to log player intent before processing the action. System actions or those with custom pre-logging (like 'ask_oracle') will result in `null` from the helper and won't have an additional player log entry from this new mechanism.
    - This enhances immersion by making the game log read more like a story.

## YYYY-MM-DD - HH:MM:SS UTC
### Changed
- **Gemini Prompt Engineering for Tile Inspection**: Refined the prompt for `generateTileInspectionDetails` in `geminiService.ts` to improve immersion.
    - Modified the system instruction to explicitly tell Gemini NOT to use game-specific jargon like 'tile', 'sub-tile', or 'coordinates' in its narrative response.
    - Rephrased the user prompt context to use more diegetic terms like "area," "spot," or "patch of land" when referring to the inspected location, while still providing coordinates and terrain type as background information for the AI.
    - This aims to prevent the AI from leaking game terms into player-facing descriptions.

## YYYY-MM-DD - HH:MM:SS UTC
### Changed
- **Tooltip Component Enhancement**: Updated `Tooltip.tsx` to better handle long content.
    - Removed `whitespace-nowrap` to allow text wrapping.
    - Added `max-w-sm` to limit maximum width and prevent excessively wide tooltips.
    - Added `max-h-60` and `overflow-y-auto` to enable vertical scrolling for content exceeding the max height.
    - Applied `scrollable-content` class for consistent custom scrollbar styling.
    - This makes tooltips, especially those with Gemini-generated descriptions, more readable and user-friendly.

## 2025-06-19 - 23:25:00 UTC
### Added
- **Persistent Inspected Tile Descriptions**:
    - After successfully inspecting a submap tile using the "Inspect Tile" feature, the detailed description generated by Gemini now replaces the tile's tooltip content.
    - This provides persistent, richer information for tiles the player has actively investigated.
    - Added `inspectedTileDescriptions: Record<string, string>` to `GameState` to store these descriptions.
    - Added `UPDATE_INSPECTED_TILE_DESCRIPTION` action to `AppAction` and `appReducer` to update this state.
    - `useGameActions` now dispatches this new action after a successful tile inspection.
    - `SubmapPane.tsx` now uses `inspectedTileDescriptions` prop to prioritize showing these detailed descriptions in tooltips.
