# App Component (`src/App.tsx`)

## Purpose

The `App.tsx` component is the root React component for the Aralia RPG. It serves as the central hub for managing the overall game state, orchestrating UI changes based on game phases, handling user actions, and interacting with various services. It has been refactored to delegate significant portions of its logic to custom hooks and a centralized state module for better organization and maintainability.

## State Management (`gameState` with `useReducer`)

The `App` component manages a comprehensive `gameState` object using the `useReducer` hook. The reducer logic (`appReducer`), initial state (`initialGameState`), and action types (`AppAction`) are now defined in **`src/state/appState.ts`**.

The `gameState` (defined in `src/types.ts`) includes:
*   Player character data, inventory, location, submap coordinates.
*   Game messages, loading/error states.
*   World map data, map/submap visibility flags.
*   Dynamic item states and Gemini-generated custom actions.
*   **Character Sheet Modal State**: `characterSheetModal: { isOpen: boolean; character: PlayerCharacter | null; }` for managing the visibility and content of the character details modal.
*   Save game version and timestamp (when loaded).
*   **`gameTime: Date`**: The current in-game time. This clock now advances automatically second by second during active gameplay, in addition to manual advancements from specific player actions.
*   **Developer Mode State**:
    *   `isDevMenuVisible: boolean`: Controls the visibility of the Developer Menu modal.
    *   `isGeminiLogViewerVisible: boolean`: Controls the visibility of the Gemini API Log Viewer modal.
    *   `geminiInteractionLog: GeminiLogEntry[]`: An array storing recent Gemini API interaction logs (prompt, response, timestamp, function name).

## Core Functionality (Orchestrated via Hooks)

1.  **Game Phase Management**:
    *   Renders different UI views (`MainMenu`, `CharacterCreator`, main game interface) based on `gameState.phase`.
    *   Transitions between phases by dispatching actions to `appReducer`.

2.  **Game Initialization (via `useGameInitialization` hook)**:
    *   The `useGameInitialization` hook provides memoized callbacks:
        *   `handleNewGame`: Sets up for character creation.
        *   `handleSkipCharacterCreator`: Starts with a dummy character (dev mode).
        *   `handleLoadGameFlow`: Loads a saved game.
        *   `startGame`: Finalizes character creation and begins play.
        *   `initializeDummyPlayerState`: Handles auto-start with dummy character logic.
    *   `App.tsx` calls these functions based on user interaction or initial load conditions.

3.  **Action Processing (via `useGameActions` hook)**:
    *   The `useGameActions` hook provides a memoized `processAction` callback.
    *   This callback is passed to `ActionPane` and `CompassPane` to handle all player actions (move, look, talk, take item, oracle, map toggles, custom Gemini actions, save game, go to main menu, `toggle_dev_menu`).
    *   The complex logic for each action type is encapsulated within the `useGameActions` hook and its internal helper functions.

4.  **Audio Management (via `useAudio` hook)**:
    *   The `useAudio` hook provides `playPcmAudio` for TTS output and `cleanupAudioContext` for resource management.
    *   `App.tsx` uses an effect to call `cleanupAudioContext` on unmount.

5.  **Automatic Game Clock (via `useEffect` in `App.tsx`)**:
    *   A `useEffect` hook is implemented in `App.tsx` to manage an interval timer.
    *   This timer runs every real-world second and dispatches an `ADVANCE_TIME` action (with a payload of `{ seconds: 1 }`) if the game is in the `PLAYING` phase and not in a loading state or an overlay modal (map, submap, character sheet, dev menu, log viewer).
    *   The effect's cleanup function clears the interval when conditions are no longer met or the component unmounts.

6.  **Message Handling (`addMessage`)**:
    *   A stable `useCallback` to dispatch `ADD_MESSAGE`, passed as a dependency to hooks that need to log messages.

7.  **Location and NPC Data Access**:
    *   `getCurrentLocation()`: Utility function in `App.tsx` to retrieve `Location` data, handling both predefined and dynamic wilderness locations.
    *   `getCurrentNPCs()`: Utility function in `App.tsx` to retrieve NPCs for predefined locations.
    *   These are passed as dependencies to `useGameActions`.

8.  **Map & Submap Interaction**:
    *   `handleTileClick`: Callback passed to `MapPane` for world map tile interactions.
    *   `getTileTooltipText`: Utility function in `App.tsx` for map tile descriptions, passed to `useGameActions`.
    *   Map/Submap visibility toggles are handled by actions dispatched via `processAction` in `useGameActions`.
    *   **`SubmapPane` Disabled State**: A specific `submapPaneDisabled` boolean is calculated and passed to `SubmapPane`. This ensures the submap's internal controls (like "Inspect Tile") are only disabled by game loading states or other *overlying* modals (Map, Character Sheet, Dev Menu, Log Viewer), not by the submap itself being visible.
    *   The general **`isUIInteractive`** flag correctly disables `ActionPane` and `CompassPane` when overlays like `MapPane`, `SubmapPane`, `CharacterSheetModal`, `DevMenu`, or `GeminiLogViewer` are active.

9.  **Character Sheet Modal Management**:
    *   `handleOpenCharacterSheet` and `handleCloseCharacterSheet` callbacks dispatch `OPEN_CHARACTER_SHEET` and `CLOSE_CHARACTER_SHEET` actions respectively.
    *   `handleOpenCharacterSheet` is passed to `PartyPane` as `onViewCharacterSheet`.
    *   `CharacterSheetModal` is conditionally rendered based on `gameState.characterSheetModal.isOpen`.

10. **Developer Tools Management**:
    *   Conditionally renders `DevMenu` and `GeminiLogViewer` modals based on `gameState.isDevMenuVisible`, `gameState.isGeminiLogViewerVisible`, and the `USE_DUMMY_CHARACTER_FOR_DEV` flag.
    *   The `handleDevMenuAction` callback in `App.tsx` handles actions dispatched from the `DevMenu` component (e.g., force save/load, navigate to main menu/char creator, toggle log viewer). This function receives an `actionType` and dispatches the appropriate `AppAction` or calls existing handlers like `handleNewGame` or `processAction`.
    *   Props passed to `DevMenu`: `isOpen={gameState.isDevMenuVisible}`, `onClose={() => dispatch({ type: 'TOGGLE_DEV_MENU' })}`, `onDevAction={handleDevMenuAction}`.
    *   Props passed to `GeminiLogViewer`: `isOpen={gameState.isGeminiLogViewerVisible}`, `onClose={() => dispatch({ type: 'TOGGLE_GEMINI_LOG_VIEWER' })}`, `logEntries={gameState.geminiInteractionLog}`.

11. **Save/Load Integration**:
    *   Handled by `useGameInitialization` (for loading) and `useGameActions` (for saving). Developer menu actions for save/load also use these pathways.

12. **Error Handling**:
    *   Uses `ErrorBoundary` components to wrap major UI sections.

13. **UI Rendering**:
    *   Conditionally renders `LoadingSpinner`.
    *   During the `PLAYING` phase, it renders:
        *   `PartyPane`.
        *   A main content area with `WorldPane`, `CompassPane`, and `ActionPane`.
    *   Conditionally renders `MapPane`, `SubmapPane`, `CharacterSheetModal`, `DevMenu`, and `GeminiLogViewer` overlays.
    *   Displays global error messages via `gameState.error`.

## Data Dependencies & Hooks

*   `src/state/appState.ts`: For `appReducer`, `initialGameState`.
*   `src/hooks/useAudio.ts`: For audio playback.
*   `src/hooks/useGameActions.ts`: For processing player actions.
*   `src/hooks/useGameInitialization.ts`: For game setup and loading.
*   `../types.ts`: Core type definitions including `GeminiLogEntry`.
*   `../constants.ts`: Game constants and aggregated static data.
*   Services (indirectly via hooks): `../services/geminiService.ts`, `../services/ttsService.ts`, `../services/mapService.ts`, `../services/saveLoadService.ts`.
*   Child UI Components including `CharacterSheetModal.tsx`, `DevMenu.tsx`, `GeminiLogViewer.tsx`.
