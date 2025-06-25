
# Aralia RPG - Quality of Life Improvements & TODO List

This file lists Quality of Life improvements and TODO items identified
from code reviews and feature planning. Each item is rated by urgency/impact.

## High Urgency / High Impact
1.  **[High Urgency - Project Management] Update `FEATURES_TODO.md` (Review Rec #14)**:
    *   **Description**: After the comprehensive review (June 2025), update `docs/FEATURES_TODO.md` to mark completed items, adjust priorities, and add any new major features identified or implied.
    *   **Status**: PENDING

## Medium Urgency / Medium Impact
1.  **[Medium Urgency - Architecture] Clarify Data Aggregation (Review Rec #1)**:
    *   **Description**: Resolve ambiguity between `src/data/races/index.ts` and `src/constants.ts`. Aim for `src/constants.ts` as the single, primary aggregator of all game data from `src/data/**` modules. For example, `BIOMES` should be imported directly by `src/constants.ts` from `src/data/biomes.ts`. `src/data/races/index.ts` should primarily export `ALL_RACES_DATA` and truly race-specific constants.
    *   **Status**: PENDING
2.  **[Medium Urgency - Data] Centralize Biome Color Definitions (Review Rec #8)**:
    *   **Description**: Move the direct `rgba` color definitions for biomes from `MapPane.tsx`'s local `colorMap` into the `Biome` type definition within `src/data/biomes.ts` (e.g., add `rgbaColor: string` to `Biome` type). Update `MapPane.tsx` to use this directly.
    *   **Status**: PENDING
3.  **[Medium Urgency - UI/UX] `ActionPane` Layout Scalability (Review Rec #5)**:
    *   **Description**: As more actions (Gemini-suggested, system actions) are added to `ActionPane.tsx`, monitor for UI crowding. Consider grouping less frequently used actions (e.g., Save Game, Main Menu) under a "System" or "Menu" sub-button/modal if needed.
    *   **Status**: PENDING
4.  **[Medium Urgency - Documentation] Add Visuals to UI Component READMEs (Review Rec #11)**:
    *   **Description**: Enhance documentation for UI components (e.g., `MapPane.tsx`, `SubmapPane.tsx`, `CharacterCreator.tsx`) by adding screenshots or diagrams to their respective README files.
    *   **Status**: PENDING
5.  **[Medium Urgency - Project Adherence] Clarify "Scene Visuals" Status (Review Rec #12)**:
    *   **Description**: Update `PROJECT_OVERVIEW.README.md` and other relevant docs to accurately reflect the current status (disabled) of the "Scene Visuals" feature and `ImagePane.tsx`. Note the reason if applicable (e.g., API quota management).
    *   **Status**: PENDING
6.  **[Medium Urgency - Project Adherence] Detail Feat System Implementation (Review Rec #13)**:
    *   **Description**: Clarify in `PROJECT_OVERVIEW.README.md` the current state of the Feat System beyond the descriptive "Versatile" trait for Humans. Outline any foundational work or planned next steps.
    *   **Status**: PENDING
7.  **[Medium Urgency - UI Polish] Review User-Facing Error Messages (Existing #11, still valid)**:
    *   **Description**: Review user-facing error messages in `App.tsx` and `saveLoadService.ts` (alerts) to ensure they are helpful and clear, without exposing excessive internal details. Consider a more integrated notification system instead of `alert()`.
    *   **Status**: PENDING

## Low Urgency / Polish & Minor Refactors
1.  **[Low Urgency - Code Quality] Enhance Type Specificity (Long-Term) (Review Rec #2)**:
    *   **Description**:
        *   Consider more specific types for `Location.exits` beyond `string` if a defined set of compass directions or custom exit types emerges.
        *   Evolve `Item.effect` from `string` to a structured type (e.g., `{ type: 'heal', amount: 10 }`) as item complexity grows.
    *   **Status**: PENDING
2.  **[Low Urgency - Performance] Monitor `SubmapPane.tsx` Rendering (Review Rec #3)**:
    *   **Description**: If performance issues arise with `SubmapPane.tsx`'s `getTileVisuals` function on larger/more complex submaps, investigate memoizing individual tile components or optimizing feature checking logic.
    *   **Status**: PENDING
3.  **[Low Urgency - UX] Character Creator Back Navigation Review (Review Rec #4)**:
    *   **Description**: Evaluate if the current "reset all subsequent choices" behavior on back navigation in Character Creator feels overly punitive for minor corrections. Consider if more granular "undo" or partial resets are feasible for specific steps (low priority QOL).
    *   **Status**: PENDING
4.  **[Low Urgency - Performance] Monitor Submap Hover Effects (Review Rec #6)**:
    *   **Description**: Ensure the `submap-tile-hover` CSS effect in `SubmapPane.tsx` doesn't cause performance degradation on lower-end devices, especially with large grids.
    *   **Status**: PENDING
5.  **[Low Urgency - State Management] Reducer Complexity (Future) (Review Rec #7)**:
    *   **Description**: If `appReducer` or `characterCreatorReducer` become excessively large and difficult to manage in the future, consider refactoring parts into composable sub-reducers.
    *   **Status**: PENDING
6.  **[Low Urgency - Documentation] Scrub `README_INDEX.md` (Review Rec #9)**:
    *   **Description**: Periodically review `docs/README_INDEX.md` for broken links, incorrect paths, or outdated entries due to refactoring.
    *   **Status**: PENDING
7.  **[Low Urgency - Documentation] Ensure Hook READMEs are Current (Review Rec #10)**:
    *   **Description**: Verify all custom hooks in `src/hooks/` have comprehensive and up-to-date README files.
    *   **Status**: PENDING
8.  **[Low Urgency - UI Polish] UI Button Consistency (Existing #12, still valid)**:
    *   **Description**: Perform a quick UI review to ensure high consistency in button styling (padding, font size, hover/focus states) across the application, especially in character creation steps.
    *   **Status**: PENDING
9.  **[Low Urgency - UI Polish] Refine Tooltip.tsx Positioning (Existing #13, still valid)**:
    *   **Description**: The current dynamic positioning in `Tooltip.tsx` is generally good. If specific edge cases with very long trigger texts or extreme viewport edge proximity become problematic during extensive testing, the positioning logic might need further refinement. (Currently considered stable).
    *   **Status**: PENDING
10. **[Low Urgency - Future Consideration] Performance Review of App.tsx Callbacks (Existing #15, still valid)**:
    *   **Description**: Review the dependency arrays of `useCallback` hooks in `App.tsx` (e.g., `processAction`, `startGame`, action helpers). Only refactor if performance issues are observed or if the dependencies are clearly incorrect/suboptimal. (Current structure with `useReducer` and memoized action handlers should be reasonably performant).
    *   **Status**: PENDING


## Resolved / Scrapped Items (from previous versions of this file)
*   **ITEM #1 (Data Decoupling & Utils)**: RESOLVED - Data definitions decoupled; `src/utils` created; `App.tsx` and `CharacterCreator.tsx` refactored. Documentation updated.
*   **ITEM #2 (Centralize getAbilityModifier)**: SCRAPPED - Retaining local use where simple, `characterUtils.ts` provides broader utilities.
*   **ITEM #3 (Audit @google/genai SDK)**: RESOLVED - SDK usage audited and found compliant. `aiClient.ts` centralizes initialization.
*   **ITEM #4 (Centralize Compass Constants)**: RESOLVED - Centralized `DIRECTION_VECTORS` in `src/constants.ts`.
*   **ITEM #5 (MapPane Keyboard Navigation)**: RESOLVED - Implemented roving tabindex and arrow key navigation in `MapPane.tsx`.
*   **ITEM #6 (Standardize Data README Filenames)**: RESOLVED - Standardized Data README filenames (e.g. `SPELLS.README.md`).
*   **ITEM #7 (HumanSkillSelection File Location)**: RESOLVED - Moved `HumanSkillSelection.tsx` to `src/components/CharacterCreator/Race/`.
*   **ITEM #8 (TypeScript Refinement in TTS Service)**: RESOLVED - Refined TypeScript usage in `ttsService.ts` by defining `AudioResponseModality` type.
*   **ITEM #9 (Constants for Audio Magic Numbers)**: RESOLVED - Defined magic numbers for audio processing as constants in `App.tsx`'s `playPcmAudio`.
*   **ITEM #10 (Refined Tooltip Positioning - Advanced)**: SCRAPPED - Current tooltip solution is robust enough.
*   **ITEM #14 (Error Boundaries)**: RESOLVED - Implemented React `ErrorBoundary.tsx` and wrapped key UI sections.

*Note: This is not an exhaustive list and can be expanded as the project evolves.
Items should be reviewed and prioritized regularly.*
