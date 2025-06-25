
# useGameActions Hook (`src/hooks/useGameActions.ts`)

## Purpose

The `useGameActions` custom React hook is designed to encapsulate the complex logic for processing various player actions within the Aralia RPG. It takes the current game state, a dispatch function for state updates, and other necessary callbacks/utility functions as dependencies. It then exposes a single, memoized `processAction` function that `App.tsx` can use to handle any game action triggered by the player.

This hook significantly slims down `App.tsx` by moving the large `switch` statement for action handling and its associated helper functions into a dedicated, more manageable module. It now also handles logging of Gemini API interactions.

**Player Action Logging**:
A key feature of this hook is the generation of more **diegetic (narrative) player action messages** for the game log. Instead of mechanical entries like "> Inspect tile (14,11)", the log will display more immersive text. For example, inspecting a tile logs as "You carefully examine the terrain nearby." This is achieved via an internal helper function `getDiegeticPlayerActionMessage`.

## Interface

```typescript
interface UseGameActionsProps {
  gameState: GameState;
  dispatch: React.Dispatch<AppAction>;
  addMessage: AddMessageFn;
  playPcmAudio: PlayPcmAudioFn;
  getCurrentLocation: GetCurrentLocationFn;
  getCurrentNPCs: GetCurrentNPCsFn;
  getTileTooltipText: GetTileTooltipTextFn;
}

interface UseGameActionsOutput {
  processAction: (action: Action) => Promise<void>;
}

function useGameActions(props: UseGameActionsProps): UseGameActionsOutput;
```

*   **`gameState: GameState`**: The current, complete game state.
*   **`dispatch: React.Dispatch<AppAction>`**: The dispatch function from `App.tsx`'s `useReducer` hook for updating the game state.
*   **`addMessage: AddMessageFn`**: Callback to add messages to the game log.
*   **`playPcmAudio: PlayPcmAudioFn`**: Callback to play PCM audio data (from `useAudio`).
*   **`getCurrentLocation: GetCurrentLocationFn`**: Utility function to get the current `Location` object.
*   **`getCurrentNPCs: GetCurrentNPCsFn`**: Utility function to get NPCs in the current location.
*   **`getTileTooltipText: GetTileTooltipTextFn`**: Utility function to get tooltip text for map tiles.

## Return Value

The hook returns an object containing:

*   **`processAction: (action: Action) => Promise<void>`**:
    *   An asynchronous function that takes an `Action` object as input.
    *   **Diegetic Logging**: It first calls `getDiegeticPlayerActionMessage(action, NPCS, LOCATIONS)`. If a narrative message is returned (e.g., "You carefully examine the terrain nearby." for `inspect_submap_tile`), it's logged to the `WorldPane` via `addMessage` with sender 'player'.
    *   It then contains the main `switch` statement that routes to specific helper functions based on `action.type`.
    *   Helper functions (e.g., `handleMoveAction`, `handleTalkAction`, `handleLookAroundAction`, `handleSaveGameAction`, etc.) are defined within or imported by this hook. These helpers perform the core logic for each action, interact with services (like `GeminiService`, `SaveLoadService`), and use `dispatch` and `addMessage` to update state and provide feedback.
    *   Dispatches of the `ADVANCE_TIME` action now use a payload of `{ seconds: number }`.
    *   **Gemini Interaction Logging**: Helper functions that call `GeminiService` now receive a `GenerateTextResult` object (containing `text`, `promptSent`, `rawResponse`). They then use the internal `addGeminiLog` helper to dispatch an `ADD_GEMINI_LOG_ENTRY` action with these details.
    *   This function is memoized using `useCallback` to ensure stability if passed down to child components.

## Internal Helper Functions

The hook contains several internal `async` helper functions, each responsible for a specific action type:
*   `getDiegeticPlayerActionMessage(action: Action, npcs: Record<string, NPC>, locations: Record<string, Location>): string | null`: Generates narrative player action text.
*   `addGeminiLog` (new internal helper to dispatch log entries)
*   `handleMoveAction`
*   `handleLookAroundAction`
*   `handleTalkAction`
*   `handleTakeItemAction`
*   `handleAskOracleAction`
*   `handleGeminiCustomAction`
*   `handleToggleMapAction` (synchronous, dispatches directly)
*   `handleToggleSubmapAction` (synchronous, dispatches directly)
*   `handleSaveGameAction`
*   `handleGoToMainMenuAction`
*   `handleInspectSubmapTileAction`

These functions utilize the dependencies passed to `useGameActions` (like `dispatch`, `addMessage`, `GeminiService`, etc.) to perform their tasks.

## Usage

```typescript
// In App.tsx
import { useGameActions } from './hooks/useGameActions';
// ... other imports, including gameState, dispatch, addMessage, playPcmAudio, etc.

const App: React.FC = () => {
  // ... gameState, dispatch, addMessage, playPcmAudio, getCurrentLocation, etc. are defined ...

  const { processAction } = useGameActions({
    gameState,
    dispatch,
    addMessage,
    playPcmAudio,
    getCurrentLocation,
    getCurrentNPCs,
    getTileTooltipText,
  });

  // ... pass processAction to ActionPane component ...
  return (
    // ... JSX ...
    <ActionPane onAction={processAction} /* ...other props... */ />
    // ...
  );
};
```

## Benefits

*   **Modularity**: Isolates complex action processing logic from `App.tsx`.
*   **Readability**: Makes `App.tsx` significantly cleaner and easier to understand.
*   **Maintainability**: Action-specific logic is grouped and easier to modify or debug.
*   **Testability**: The hook and its internal helpers can be tested more easily in isolation (though dependencies would need to be mocked).
*   **Memoization**: The returned `processAction` is memoized, which is good practice if it's a prop for other components.
*   **Centralized Logging**: Gemini API interactions are logged consistently.
*   **Improved Immersion**: Narrative player action logging makes the game log read more like a story.

## Dependencies
*   `react`: For `useCallback`.
*   `../types`: For `GameState`, `Action`, `NPC`, `Location`, `MapTile`, `GeminiLogEntry` types.
*   `../state/appState`: For `AppAction` type.
*   `../constants`: For game data like `ITEMS`, `BIOMES`, `DIRECTION_VECTORS`, `NPCS`, `LOCATIONS` etc.
*   `../services/geminiService`: For AI interactions and `GenerateTextResult` type.
*   `../services/ttsService`: For speech synthesis.
*   `../services/saveLoadService`: For saving game state.
