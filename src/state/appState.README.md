# App State Module (`src/state/appState.ts`)

## Purpose

The `src/state/appState.ts` module centralizes the core state management logic for the main `App.tsx` component of the Aralia RPG. It defines:

1.  **`AppAction`**: A TypeScript discriminated union type for all possible actions that can be dispatched to modify the game state.
2.  **`initialGameState: GameState`**: The initial state object for the entire application, including game phase, player data, map information, UI flags, etc.
3.  **`appReducer(state: GameState, action: AppAction): GameState`**: The main reducer function that takes the current state and an action, and returns the new state.

This separation of concerns makes `App.tsx` cleaner and state transitions more predictable and easier to manage.

## Structure

### `AppAction`
A comprehensive type defining all actions that can modify the `GameState`. Examples:
*   `SET_GAME_PHASE`
*   `START_NEW_GAME_SETUP`: Now explicitly sets `isLoading: false`.
*   `START_GAME_FOR_DUMMY`: Sets `isLoading: false`.
*   `START_GAME_SUCCESS`: Now explicitly sets `isLoading: false`.
*   `LOAD_GAME_SUCCESS`: Sets `isLoading: false`.
*   `ADD_MESSAGE`
*   `MOVE_PLAYER`
*   `TAKE_ITEM`
*   `TOGGLE_MAP_VISIBILITY`
*   `TOGGLE_SUBMAP_VISIBILITY`
*   `OPEN_CHARACTER_SHEET`
*   `CLOSE_CHARACTER_SHEET`
*   `ADVANCE_TIME`: Action to advance the in-game clock by a specified number of **seconds**. The payload is `{ seconds: number }`.
*   `INSPECT_SUBMAP_TILE`
*   **`TOGGLE_DEV_MENU`**: Action to toggle the visibility of the Developer Menu.
*   **`TOGGLE_GEMINI_LOG_VIEWER`**: Action to toggle the visibility of the Gemini API Log Viewer.
*   **`ADD_GEMINI_LOG_ENTRY`**: Action to add a new entry to the Gemini interaction log. The payload is a `GeminiLogEntry` object.
*   ...and many others.

Each action has a `type` property and an optional `payload` carrying necessary data for the state update.

### `initialGameState`
An object of type `GameState` (defined in `src/types.ts`) that represents the default starting state of the application. It considers factors like `USE_DUMMY_CHARACTER_FOR_DEV` and `SaveLoadService.hasSaveGame()` to determine the initial game phase. It also initializes:
*   `characterSheetModal: { isOpen: false, character: null }`.
*   `gameTime: Date`: The in-game clock, typically initialized to a starting time like 07:00 AM on an arbitrary game date.
*   **`isDevMenuVisible: boolean`**: Initialized to `false`. Controls the visibility of the Dev Menu modal.
*   **`isGeminiLogViewerVisible: boolean`**: Initialized to `false`. Controls the visibility of the Gemini Log Viewer modal.
*   **`geminiInteractionLog: GeminiLogEntry[]`**: Initialized to an empty array. Stores a list of recent Gemini API interactions.

### `appReducer`
A pure function that implements all state transition logic.
*   It takes the `currentState` and an `action` as input.
*   Uses a `switch` statement on `action.type` to determine how to update the state.
*   Returns a new state object, ensuring immutability.
*   Handles resetting transient UI states (like `geminiGeneratedActions`, `isMapVisible`, `isDevMenuVisible`, `isGeminiLogViewerVisible`) when transitioning to certain game phases like `MAIN_MENU` or `CHARACTER_CREATION`.
*   Includes cases for `OPEN_CHARACTER_SHEET` and `CLOSE_CHARACTER_SHEET` to update the `characterSheetModal` part of the state.
*   Includes a case for `ADVANCE_TIME` to increment the `gameTime` in the state using the `seconds` payload (`newTime.setSeconds(newTime.getSeconds() + action.payload.seconds)`).
*   Handles `TOGGLE_DEV_MENU` by toggling `isDevMenuVisible` and ensuring other conflicting modals are closed.
*   Handles `TOGGLE_GEMINI_LOG_VIEWER` by toggling `isGeminiLogViewerVisible` and ensuring the Dev Menu is also closed (as they are opened via the Dev Menu).
*   Handles `ADD_GEMINI_LOG_ENTRY` by prepending the new log entry to `geminiInteractionLog` and trimming the array to a maximum size (e.g., 100 entries).
*   **Loading State Management**: Crucially, actions like `START_NEW_GAME_SETUP`, `START_GAME_FOR_DUMMY`, `START_GAME_SUCCESS`, and `LOAD_GAME_SUCCESS` explicitly set `isLoading: false` upon successful completion of their setup, ensuring loading screens are hidden.

## Usage

*   **`App.tsx`**:
    *   Imports `appReducer` and `initialGameState`.
    *   Uses these with the `useReducer` hook:
        ```typescript
        import { appReducer, initialGameState } from './state/appState';
        // ...
        const [gameState, dispatch] = useReducer(appReducer, initialGameState);
        ```
    *   The `dispatch` function obtained from `useReducer` is then used throughout `App.tsx` and passed to custom hooks (`useGameActions`, `useGameInitialization`) to trigger state updates.

## Benefits

*   **Centralized State Logic**: All state update rules are in one place.
*   **Predictability**: State changes are explicit and traceable through dispatched actions.
*   **Improved `App.tsx` Readability**: Reduces the amount of state-related boilerplate in the main component file.
*   **Testability**: The reducer function can be tested in isolation.

## Dependencies
*   `../types.ts`: For `GameState`, `GamePhase`, `GameMessage`, `PlayerCharacter`, `Item`, `MapData`, `Action`, `GeminiLogEntry` types.
*   `../constants.ts`: For constants like `STARTING_LOCATION_ID`, `DUMMY_CHARACTER_FOR_DEV`, `USE_DUMMY_CHARACTER_FOR_DEV`, `SUBMAP_DIMENSIONS`, `LOCATIONS`.
*   `../services/saveLoadService.ts`: For checking if a save game exists to determine initial phase.
*   `../utils/locationUtils.ts`: For `determineActiveDynamicNpcsForLocation`.