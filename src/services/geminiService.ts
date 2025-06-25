
/**
 * @file geminiService.ts
 * This service module handles all interactions with the Google Gemini API.
 * It provides functions to generate various types of text content for the RPG,
 * such as location descriptions, NPC responses, and action outcomes.
 * It also includes functions for image generation.
 * It uses the centralized AI client from aiClient.ts.
 */
import { GenerateContentResponse } from "@google/genai";
import { ai } from './aiClient'; // Import the shared AI client
import {
  GEMINI_MODEL_TEXT,
  GEMINI_MODEL_IMAGE,
} from '../config'; // Path relative to src/services/
import { Action, PlayerCharacter, InspectSubmapTilePayload, SeededFeatureConfig } from "../types"; // Added InspectSubmapTilePayload, SeededFeatureConfig
import { SUBMAP_ICON_MEANINGS } from '../data/glossaryData'; // Added import for glossary

const textModel = GEMINI_MODEL_TEXT;
const imageModel = GEMINI_MODEL_IMAGE;

const defaultSystemInstruction =
  "You are a storyteller for a text-based high fantasy RPG set in a world of dragons, ancient magic, and looming conflict (like Krynn). Your responses MUST be EXTREMELY BRIEF, MAXIMUM 1-2 sentences. Provide ONLY essential 'breadcrumb' details. Focus on atmosphere and key information. NO long descriptions. Be concise.";

export interface GenerateTextResult {
  text: string;
  promptSent: string;
  rawResponse: string;
}
/**
 * Generic function to generate text content using the Gemini API.
 * @param {string} promptContent - The prompt content to send to the model.
 * @param {string} [systemInstruction] - Optional system instruction to guide the model's behavior. Defaults to a general RPG storyteller instruction.
 * @param {boolean} [expectJson=false] - Whether to expect a JSON response and configure responseMimeType.
 * @param {string} [functionName='generateText'] - Name of the calling function for logging.
 * @returns {Promise<GenerateTextResult>} A promise that resolves to an object containing the generated text, the prompt sent, and the raw response.
 * @throws {Error} If the API call fails.
 */
async function generateText(
  promptContent: string,
  systemInstruction?: string,
  expectJson: boolean = false,
  functionName: string = 'generateText' // For logging context
): Promise<GenerateTextResult> {
  const fullPromptForLogging = `System Instruction: ${systemInstruction || defaultSystemInstruction}\nUser Prompt: ${promptContent}`;
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: textModel,
      contents: promptContent,
      config: {
        systemInstruction: systemInstruction || defaultSystemInstruction,
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        responseMimeType: expectJson ? "application/json" : undefined,
      },
    });
    const responseText = response.text.trim();
    if (!responseText && !expectJson) { // If after trimming, the text is empty and we weren't expecting JSON (which can be validly empty like "[]")
        console.warn(`Gemini returned an empty response for function: ${functionName}. Prompt: ${promptContent}`);
        return {
            text: "You notice nothing particularly remarkable.", // Default message for empty non-JSON responses
            promptSent: fullPromptForLogging,
            rawResponse: JSON.stringify(response)
        };
    }
    return {
      text: responseText,
      promptSent: fullPromptForLogging,
      rawResponse: JSON.stringify(response) // Storing the stringified full response object
    };
  } catch (error) {
    console.error(`Gemini API error in ${functionName}:`, error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    // Return error details in the structure too, for logging purposes
    return {
        text: `Error in ${functionName}: ${errorMessage}`,
        promptSent: fullPromptForLogging,
        rawResponse: JSON.stringify(error, Object.getOwnPropertyNames(error))
    };
    // throw new Error(`Failed to generate text from Gemini in ${functionName}: ${errorMessage}`);
  }
}

export async function generateLocationDescription(
  locationName: string,
  context: string,
): Promise<GenerateTextResult> {
  const systemInstruction =
    "Describe a new location in a high fantasy RPG (like Krynn). Response MUST be EXTREMELY BRIEF: 1-2 sentences MAX. Give ONLY key sights, sounds, or atmosphere. No fluff.";
  const prompt = `Player arrives at "${locationName}". Context: ${context}. Provide an EXTREMELY BRIEF description (1-2 sentences MAX) of the area's key features or atmosphere.`;
  return generateText(prompt, systemInstruction, false, 'generateLocationDescription');
}

export async function generateWildernessLocationDescription(
  biomeName: string,
  worldMapCoords: { x: number; y: number },
  subMapCoords: { x: number; y: number },
  playerContext: string,
  worldMapTileTooltip: string | null = null,
): Promise<GenerateTextResult> {
  const systemInstruction =
    "You are a storyteller for a text-based high fantasy RPG (like Krynn). Describe a specific, unnamed spot within a larger biome area. The player is at precise sub-coordinates within a larger map tile. Response MUST be 2-3 evocative sentences. Focus on immediate sensory details (sights, sounds, smells) relevant to this specific spot and the biome. Avoid mentioning specific named landmarks unless very generic (e.g., 'a gnarled oak tree' in a forest). Do NOT imply it's a special named location unless the broader context suggests it.";
  
  let prompt = `Player is exploring an uncharted area.
World Map Tile Biome: ${biomeName} at world map coordinates (${worldMapCoords.x},${worldMapCoords.y}).
Player's precise location within this tile (submap coordinates): (${subMapCoords.x},${subMapCoords.y}).
Player Context: ${playerContext}.`;

  if (worldMapTileTooltip) {
    prompt += `\nBroader context for the ${biomeName} world map tile: "${worldMapTileTooltip}".`;
  }
  
  prompt += `\nProvide a 2-3 sentence description of what the player observes at their precise submap location (${subMapCoords.x},${subMapCoords.y}) within the ${biomeName} world map tile.`;
  
  return generateText(prompt, systemInstruction, false, 'generateWildernessLocationDescription');
}


export async function generateNPCResponse(
  npcName: string,
  playerAction: string,
  context: string,
  isFollowUp: boolean = false,
  previousResponse?: string,
): Promise<GenerateTextResult> {
  let systemInstruction: string;
  let prompt: string;

  if (isFollowUp) {
    systemInstruction = `You are roleplaying as ${npcName} in a high fantasy world (like Krynn). The player is speaking to you again. Respond naturally and briefly to a continued conversation. Your response MUST be EXTREMELY BRIEF: 1-2 sentences MAX.`;
    prompt = `NPC: ${npcName}. Player interacts again. Context: ${context}.`;
    if (previousResponse) {
      prompt += ` Your previous response was: "${previousResponse}".`;
    }
    prompt += ` ${npcName}'s EXTREMELY BRIEF follow-up response (1-2 sentences MAX):`;
  } else {
    systemInstruction = `You are roleplaying as ${npcName} in a high fantasy world (like Krynn). Your response MUST be EXTREMELY BRIEF: 1-2 sentences MAX. Respond directly and concisely to the initial interaction.`;
    prompt = `NPC: ${npcName}. Player action: "${playerAction}". Context: ${context}. ${npcName}'s EXTREMELY BRIEF initial response (1-2 sentences MAX):`;
  }
  return generateText(prompt, systemInstruction, false, 'generateNPCResponse');
}

export async function generateActionOutcome(
  playerAction: string,
  context: string,
  isCustomGeminiAction: boolean = false,
  worldMapTileTooltip: string | null = null,
): Promise<GenerateTextResult> {
  let systemInstruction = "";
  let prompt = "";

  if (playerAction.toLowerCase().includes("look around") && !isCustomGeminiAction) {
    systemInstruction = "Player is looking around or performing a general observation in a high fantasy world (like Krynn). Describe what they see, hear, or sense in 2-3 evocative sentences. Focus on key details, atmosphere, and any significant objects or features directly perceivable from their current precise spot. Be descriptive but concise.";
    prompt = `Player action: "${playerAction}". Current precise context: ${context}.`;
    if (worldMapTileTooltip) {
      prompt += `\nGeneral information about the wider area (world map tile): "${worldMapTileTooltip}".`;
    }
    prompt += `\nWhat does the player observe in detail (2-3 sentences)?`;
  } else { 
    systemInstruction = "Describe the result of the player's specific, chosen action in a high fantasy world (like Krynn). Response should be 2-3 evocative sentences. Focus on direct consequences, sensory details, or new information revealed by the action. Avoid suggesting further standard directional movements unless it's a direct outcome of the specific action (e.g., 'The passage you cleared leads North').";
    prompt = `Player action: "${playerAction}". Context: ${context}. What is the outcome of this specific action (2-3 sentences)?`;
  }
  
  return generateText(prompt, systemInstruction, false, 'generateActionOutcome');
}

export async function generateDynamicEvent(
  currentLocationName: string,
  context: string,
): Promise<GenerateTextResult> {
  const systemInstruction =
    'Introduce a small, unexpected event in a high fantasy world (like Krynn). Response MUST be EXTREMELY BRIEF: 1-2 sentences MAX. Focus on a single detail.';
  const prompt = `Player is in ${currentLocationName}. Context: ${context}. Describe an EXTREMELY BRIEF dynamic event (1-2 sentences MAX).`;
  return generateText(prompt, systemInstruction, false, 'generateDynamicEvent');
}

export async function generateOracleResponse(
  playerQuery: string,
  context: string,
): Promise<GenerateTextResult> {
  const systemInstruction =
    "You ARE the Oracle in a high fantasy world (like Krynn). Speak DIRECTLY to the adventurer in first person. Your response MUST be EXTREMELY BRIEF and enigmatic: 1-2 sentences MAX. Offer cryptic guidance. NO narration like 'The Oracle says'.";
  const prompt = `An adventurer asks me, the Oracle: "${playerQuery}". Context: ${context}. My EXTREMELY BRIEF and cryptic response (1-2 sentences MAX) is:`;
  return generateText(prompt, systemInstruction, false, 'generateOracleResponse');
}

interface CustomActionsResult extends GenerateTextResult {
  actions: Action[]; // Parsed actions
}

export async function generateCustomActions(sceneDescription: string, context: string): Promise<CustomActionsResult> {
  const systemInstruction = "You are an assistant for a text-based high fantasy RPG (like Krynn). Based on the provided scene description and context, suggest 3 distinct, brief, and actionable choices for the player. The choices should be things the player can *do* in the environment. These actions should be specific interactions with the described environment, elements, or NPCs. **Do NOT suggest general directional movement actions like 'Go North', 'Explore East', 'Move West', 'Head South' if these are standard navigation options available via a compass.** Focus on unique verbs or interactions. Return them as a valid JSON array of objects, where each object has a 'label' (max 4 words, for a button) and a 'prompt' (a short third-person phrase describing what the player does, e.g., 'Player examines the old tome'). Ensure the 'prompt' is a player action, not an outcome. If no distinct, non-navigational actions are suitable, return an empty array. CRITICAL: Your entire response MUST be ONLY the valid JSON array of objects (or an empty array [] if no actions are suitable). Do not include any other text, explanations, apologies, or markdown formatting such as ```json ... ``` around the JSON array itself. The output must be directly parsable as JSON.";
  const promptContent = `Scene: "${sceneDescription}". Context: "${context}". Provide 3 custom actions as a JSON array:`;

  const result = await generateText(promptContent, systemInstruction, true, 'generateCustomActions');
  
  let parsedActions: any[] = [];
  let actions: Action[] = [];

  if (result.text.startsWith("Error in")) { // If generateText itself returned an error string
    console.error("Error generating custom actions (from generateText wrapper):", result.text);
    return { ...result, actions: [] };
  }
  
  try {
    let cleanJsonString = result.text.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = cleanJsonString.match(fenceRegex);
    if (match && match[2]) {
      cleanJsonString = match[2].trim();
    }

    parsedActions = JSON.parse(cleanJsonString);

    if (!Array.isArray(parsedActions)) {
      console.warn("Gemini did not return a valid array of actions. Parsed:", parsedActions);
      actions = [];
    } else if (parsedActions.length === 0) {
      actions = [];
    } else {
      actions = parsedActions.slice(0, 3).map((action: any, index: number): Action => {
        if (typeof action.label !== 'string' || typeof action.prompt !== 'string') {
          console.warn(`Invalid action structure at index ${index}:`, action);
          return {
            type: 'gemini_custom_action',
            label: 'Invalid Action',
            payload: { geminiPrompt: 'Error: Invalid action data from AI.' },
          };
        }
        return {
          type: 'gemini_custom_action',
          label: action.label.substring(0, 30), 
          payload: { geminiPrompt: action.prompt },
        };
      }).filter(action => action.label !== 'Invalid Action');
    }
  } catch (e) {
    console.error("Failed to parse JSON response for custom actions:", e, "Raw string from Gemini:", result.text);
    actions = []; // Return empty array on parse failure
  }
  
  return { ...result, actions };
}


export async function generateImageForScene(description: string): Promise<string> {
  // This function does not use the new GenerateTextResult structure as it directly uses generateImages.
  // Logging for this would need to be handled separately if required.
  console.log('[geminiService] Attempting to generate image with Imagen model:', imageModel);
  const imagePrompt = `A detailed fantasy RPG scene depicting: ${description}. Style: digital painting, atmospheric, vibrant colors, detailed environment, cinematic lighting. Focus on the visual elements of the description. Setting: Dragonlance/Krynn.`;
  console.log('[geminiService] Image request prompt for generateImages:', imagePrompt);

  try {
    const response = await ai.models.generateImages({
        model: imageModel, 
        prompt: imagePrompt,
        config: { numberOfImages: 1, outputMimeType: 'image/jpeg', aspectRatio: "16:9" },
    });

    if (response.generatedImages && response.generatedImages.length > 0 && response.generatedImages[0].image?.imageBytes) {
      console.log('[geminiService] Image generated successfully with Imagen model.');
      return response.generatedImages[0].image.imageBytes;
    } else {
      console.error("[geminiService] Imagen API response missing image data. Response:", JSON.stringify(response, null, 2));
      throw new Error("Failed to generate image: Imagen API response did not include image data.");
    }
  } catch (error: any) {
    console.error("[geminiService] Imagen API error in generateImageForScene (generateImages). Error Name:", error.name);
    console.error("[geminiService] Error Message:", error.message);
    if (error.status) {
      console.error("[geminiService] Error Status:", error.status);
    }
    console.error("[geminiService] Full error object:", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    
    const errorMessage = error.message || String(error);
    throw new Error(`Failed to generate image from Imagen (generateImages): ${errorMessage}`);
  }
}

export async function generateTileInspectionDetails(
  tileDetails: InspectSubmapTilePayload,
  playerCharacter: PlayerCharacter,
  gameTime: string,
): Promise<GenerateTextResult> {
  const { tileX, tileY, effectiveTerrainType, worldBiomeId, parentWorldMapCoords, activeFeatureConfig } = tileDetails;

  const systemInstruction = `You are a Dungeon Master for a text-based high fantasy RPG (like Dragonlance's Krynn).
The player is inspecting an adjacent area of land.
Your response should be an evocative, 2-3 sentence description of what the character perceives or discovers.
Consider the character's general capabilities (no specific skill checks needed, just awareness).
Describe sights, sounds, smells, or subtle clues.
If the area is generic terrain, simulate a "discovery roll": low chance of nothing, medium for minor detail, small chance for something interesting/a clue.
If the area has a specific feature (e.g., pond, monolith, creature sign), focus the description on that.
Hint at potential interactions if logical (e.g., 'tracks leading north', 'a glint of metal under leaves', 'edible berries').
Do NOT explicitly state dice rolls. Be narrative.
CRITICAL: In your descriptive response to the player, DO NOT use game-specific jargon like 'tile', 'sub-tile', 'coordinates', 'grid', or 'sector'. Describe the location naturally from the character's perspective.`;

  let tileContext = `This specific spot (local reference within its larger area: ${tileX},${tileY}) is part of a larger ${worldBiomeId} biome (this biome is at world map region reference: ${parentWorldMapCoords.x},${parentWorldMapCoords.y}).\n`;

  if (activeFeatureConfig) {
    tileContext += `This spot prominently features a ${activeFeatureConfig.name || activeFeatureConfig.id}`;
    if (activeFeatureConfig.icon) {
      tileContext += ` (visually represented by ${activeFeatureConfig.icon}).`;
      const iconMeaning = SUBMAP_ICON_MEANINGS[activeFeatureConfig.icon];
      if (iconMeaning) {
        tileContext += ` The ${activeFeatureConfig.icon} symbol often indicates: "${iconMeaning}".`;
      }
    } else {
      tileContext += ".";
    }
    if (activeFeatureConfig.generatesEffectiveTerrainType) {
      tileContext += ` Due to this feature, the immediate area feels like a '${activeFeatureConfig.generatesEffectiveTerrainType}' environment.`;
    }
    tileContext += "\n";
  }
  
  // Describe the base effective terrain more naturally
  if (effectiveTerrainType === 'path') {
    tileContext += `The ground here forms a discernible path.`;
  } else if (effectiveTerrainType === 'path_adj') {
    tileContext += `This area is immediately adjacent to a discernible path.`;
  } else if (effectiveTerrainType === 'default' || !activeFeatureConfig ) { 
    tileContext += `It appears to be a typical patch of terrain within this ${worldBiomeId} biome.`;
  } else if (activeFeatureConfig && effectiveTerrainType !== activeFeatureConfig.generatesEffectiveTerrainType) {
    // If a feature exists, but the effectiveTerrainType is something else (e.g. base biome under a scatter feature not overriding terrain type)
    tileContext += `The underlying terrain here is characteristic of '${effectiveTerrainType.replace(/_/g, ' ')}'.`;
  }
  // If activeFeatureConfig generated an effectiveTerrainType, that was already described as part of the feature context.

  const promptContent = `Player: ${playerCharacter.name} the ${playerCharacter.race.name} ${playerCharacter.class.name}.
Game Time: ${gameTime}.
Context of the Inspected Area: ${tileContext.trim()}
The player takes a moment to carefully examine this adjacent patch of land, trying to discern more information by scanning the horizon, looking for tracks, checking maps (if they had any), listening intently, or sensing the environment.
What do they perceive or discover?`;
  
  return generateText(promptContent, systemInstruction, false, 'generateTileInspectionDetails');
}
