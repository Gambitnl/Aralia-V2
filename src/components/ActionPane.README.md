# ActionPane Component (`src/components/ActionPane.tsx`)

## Purpose

The `ActionPane.tsx` component is responsible for displaying available actions to the player, excluding the 8-directional compass navigation which is now handled by `CompassPane.tsx`. It provides options for:

*   Interacting with NPCs (e.g., "Talk to [NPC Name]").
*   Interacting with items (e.g., "Take [Item Name]").
*   Handling custom "special" exits from a location that are not standard compass directions (e.g., "Enter the Cave").
*   Toggling the World Map and Submap visibility.
*   Asking the Oracle a question.
*   Displaying custom, context-aware actions generated by the Gemini AI after a "Look Around" action (if any).
*   Saving the game.
*   Returning to the main menu (with a save prompt if not in dev dummy mode).
*   **If `isDevDummyActive` is true, a "Dev Menu" button is displayed instead of "Main Menu (Save & Exit)", which toggles the Developer Menu modal by dispatching a `toggle_dev_menu` action.**

## Props

*   **`currentLocation: Location`**:
    *   **Type**: `Location` (from `src/types.ts`)
    *   **Purpose**: The character's current location object. Used to determine available NPCs, items, and special exits.
    *   **Required**: Yes

*   **`npcsInLocation: NPC[]`**:
    *   **Type**: Array of `NPC` objects (from `src/types.ts`)
    *   **Purpose**: A list of NPCs currently present in the `currentLocation`.
    *   **Required**: Yes

*   **`itemsInLocation: Item[]`**:
    *   **Type**: Array of `Item` objects (from `src/types.ts`)
    *   **Purpose**: A list of items currently available to be taken from the `currentLocation`.
    *   **Required**: Yes

*   **`onAction: (action: Action) => void`**:
    *   **Type**: Function
    *   **Purpose**: A callback function invoked when any action button (excluding compass buttons) is clicked. It passes the corresponding `Action` object.
    *   **Required**: Yes

*   **`disabled: boolean`**:
    *   **Type**: `boolean`
    *   **Purpose**: If `true`, all action buttons in this pane are disabled. This is typically used when another action is being processed or the game is in a loading state.
    *   **Required**: Yes

*   **`geminiGeneratedActions: Action[] | null`**:
    *   **Type**: Array of `Action` objects or `null`
    *   **Purpose**: A list of custom actions suggested by the Gemini AI, usually after a "Look Around" action. If `null` or empty, this section is not displayed.
    *   **Required**: Yes

*   **`isDevDummyActive: boolean`**:
    *   **Type**: `boolean`
    *   **Purpose**: Indicates if the development dummy character is active. Used to modify the label and behavior of the main menu/dev menu button. If `true`, a "Dev Menu" button is shown, which dispatches a `toggle_dev_menu` action. Otherwise, a "Main Menu (Save & Exit)" button is shown, dispatching a `go_to_main_menu` action.
    *   **Required**: Yes

## State Management (Internal)

*   **`isOracleInputVisible: boolean`**: Controls the visibility of the input field for asking the Oracle a question.
*   **`oracleQuery: string`**: Stores the text entered by the player for their Oracle query.

## Core Functionality

1.  **Dynamic Action Generation**:
    *   **NPC Interaction**: Creates "Talk to [NPC Name]" buttons for each NPC in `npcsInLocation`.
    *   **Item Interaction**: Creates "Take [Item Name]" buttons for each item in `itemsInLocation`.
    *   **Special Exits**: Creates buttons for non-compass exits defined in `currentLocation.exits`.

2.  **Oracle Interaction**:
    *   "Ask the Oracle" button toggles visibility of an input field.
    *   Player can type a query and submit it, which calls `onAction` with an `ask_oracle` type.

3.  **Gemini Custom Actions**:
    *   If `geminiGeneratedActions` is provided and not empty, this section is displayed with buttons for each suggested action. These actions typically have a `type` of `gemini_custom_action`.

4.  **System Actions**:
    *   Buttons for "World Map", "Submap", "Save Game".
    *   A conditional button: **"Dev Menu"** (if `isDevDummyActive` is true, dispatches `toggle_dev_menu`) or "Main Menu (Save & Exit)" (if `isDevDummyActive` is false, dispatches `go_to_main_menu`).

5.  **Button Styling**:
    *   Uses a shared `ActionButton` sub-component for consistent styling.
    *   Different action types (e.g., save, main menu, dev menu, Gemini actions, Oracle) can have distinct button colors.

## Layout
The pane has a main title "Interactions & System".
Map/Submap toggles are grouped.
Oracle, Save, and Main Menu/Dev Menu buttons are grouped.
Gemini-suggested actions and general NPC/item actions are displayed in separate, clearly headed sections if available.
It is typically displayed **horizontally alongside** `CompassPane`, growing to fill the available space next to the `CompassPane`.

## Data Dependencies
*   `src/types.ts`: For `Location`, `Action`, `NPC`, `Item` types.
*   It does **not** directly depend on `mapData` or `currentSubMapCoordinates` anymore, as compass logic is in `CompassPane.tsx`.

## Styling
*   Uses Tailwind CSS for styling of the pane and buttons.
*   Actions are grouped logically for better usability.

## Accessibility
*   All buttons have `aria-label` attributes.
*   The "Ask the Oracle" input field is properly labeled.
*   Buttons are disabled when appropriate, providing visual feedback.
*   Headings are used to structure different action sections.