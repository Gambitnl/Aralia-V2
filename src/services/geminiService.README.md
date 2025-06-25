# Gemini Service (`src/services/geminiService.ts`)

## Purpose

The `geminiService.ts` module is responsible for all direct interactions with the Google Gemini API for text and image generation. It encapsulates the logic for constructing prompts, calling the API (via the shared `aiClient`), and processing responses. All text-generating functions now return a more detailed object including the prompt sent and the raw response, primarily for logging purposes.

## Core Functionality

The service exports several asynchronous functions, each tailored for a specific type of content generation:

1.  **`generateText(promptContent: string, systemInstruction?: string, expectJson?: boolean, functionName?: string): Promise<GenerateTextResult>`**
    *   A generic internal function to make calls to the Gemini text model (`gemini-2.5-flash-preview-04-17`).
    *   It takes a main `promptContent` and an optional `systemInstruction` to guide the model's behavior.
    *   `expectJson`: If true, sets `responseMimeType: "application/json"` in the config.
    *   `functionName`: For logging context.
    *   Handles API errors and extracts the `.text` from the `GenerateContentResponse`.
    *   **Returns**: `Promise<GenerateTextResult>`, where `GenerateTextResult` is `{ text: string, promptSent: string, rawResponse: string }`.

2.  **`generateLocationDescription(locationName: string, context: string): Promise<GenerateTextResult>`**
    *   Generates a brief (1-2 sentences) atmospheric description for a named game location.
    *   Returns `GenerateTextResult`.

3.  **`generateWildernessLocationDescription(biomeName, worldMapCoords, subMapCoords, playerContext, worldMapTileTooltip?): Promise<GenerateTextResult>`**
    *   Generates a 2-3 sentence description for an unnamed spot within a larger biome, based on world and submap coordinates, focusing on immediate sensory details.
    *   Returns `GenerateTextResult`.

4.  **`generateNPCResponse(npcName: string, playerAction: string, context: string, isFollowUp?: boolean, previousResponse?: string): Promise<GenerateTextResult>`**
    *   Generates a brief (1-2 sentences) dialogue response for an NPC, considering if it's a follow-up conversation.
    *   Returns `GenerateTextResult`.

5.  **`generateActionOutcome(playerAction: string, context: string, isCustomGeminiAction?: boolean, worldMapTileTooltip?: string | null): Promise<GenerateTextResult>`**
    *   Generates a 2-3 sentence outcome or observation based on a player's action.
    *   Handles "Look Around" actions differently by focusing on perceivable details from the current spot, potentially using `worldMapTileTooltip` for broader context.
    *   Returns `GenerateTextResult`.

6.  **`generateDynamicEvent(currentLocationName: string, context: string): Promise<GenerateTextResult>`**
    *   Generates a brief (1-2 sentences) minor, unexpected event to add flavor to a scene.
    *   Returns `GenerateTextResult`.

7.  **`generateOracleResponse(playerQuery: string, context: string): Promise<GenerateTextResult>`**
    *   Generates a brief (1-2 sentences), enigmatic, first-person response from the Oracle.
    *   Returns `GenerateTextResult`.

8.  **`generateCustomActions(sceneDescription: string, context: string): Promise<CustomActionsResult>`**
    *   Generates up to 3 distinct, non-navigational custom actions for the player based on the current scene and context.
    *   **CRITICAL**: Expects a valid JSON array of objects (or an empty array) directly from the Gemini API. It includes logic to strip common markdown fences (like ` ```json ... ``` `) before parsing.
    *   Each action object should have a `label` (for UI button) and a `prompt` (for Gemini when the action is taken).
    *   Returns `CustomActionsResult` which extends `GenerateTextResult` and includes an `actions: Action[]` field.

9.  **`generateImageForScene(description: string): Promise<string>`**
    *   Generates a base64 encoded JPEG image using the Imagen model (`imagen-3.0-generate-002`) based on a scene description.
    *   **Note**: This function does not use the `GenerateTextResult` structure as it calls `ai.models.generateImages`. Logging for this is handled separately if needed.

10. **`generateTileInspectionDetails(tileDetails: InspectSubmapTilePayload, playerCharacter: PlayerCharacter, gameTime: string): Promise<GenerateTextResult>`**
    *   Generates a detailed, evocative description for a submap tile (referred to as "area" or "spot" in the prompt) being inspected by the player.
    *   **Prompting Strategy**: Includes a critical system instruction for the AI to *avoid* using game-specific jargon like 'tile', 'coordinates', etc., in its narrative response to the player. The user prompt context is enhanced to:
        *   Translate abstract `effectiveTerrainType` values (like 'path_adj' or 'path') into more natural descriptions (e.g., "area immediately adjacent to a discernible path").
        *   If an inspected tile has an `activeFeatureConfig` with an icon, the prompt includes the feature's name, its icon, and the icon's meaning from `SUBMAP_ICON_MEANINGS` (if available from `src/data/glossaryData.ts`).
    *   This aims to improve the quality and immersion of Gemini-generated descriptions by reducing jargon and providing more evocative input.
    *   Returns `GenerateTextResult`.

## System Instructions & Prompt Engineering

*   Each function uses specific `systemInstruction` and prompt structures tailored to its purpose.
*   All functions use the shared `ai` client instance from `aiClient.ts`.

## Error Handling & Logging

*   The core `generateText` function includes a `try/catch` block. If an error occurs, it logs it and returns a `GenerateTextResult` object where the `text` field contains the error message and `rawResponse` contains the stringified error. This allows calling functions (like in `useGameActions`) to receive structured error information for logging via `ADD_GEMINI_LOG_ENTRY`.
*   Functions expecting JSON (like `generateCustomActions`) include robust parsing and error handling for malformed responses.

## Dependencies

*   `@google/genai`: For `GenerateContentResponse` type.
*   `./aiClient`: For the shared `ai` client instance.
*   `../config`: For model name constants (`GEMINI_MODEL_TEXT`, `GEMINI_MODEL_IMAGE`).
*   `../types`: For `Action`, `PlayerCharacter`, `InspectSubmapTilePayload`, and `SeededFeatureConfig` types.
*   `../data/glossaryData`: For `SUBMAP_ICON_MEANINGS`.

## Future Considerations

*   Implement streaming for text generation to improve perceived responsiveness.
*   More sophisticated context management for longer interactions or memory between calls.
*   Rate limiting or queueing if API call frequency becomes an issue.
