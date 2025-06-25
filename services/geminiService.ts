/**
 * @file geminiService.ts
 * This service module handles all interactions with the Google Gemini API.
 * It provides functions to generate various types of text content for the RPG,
 * such as location descriptions, NPC responses, and action outcomes.
 * It also includes functions for image generation.
 * It initializes the Gemini client with the API key from `config.ts` (or environment variables).
 */
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { GEMINI_API_KEY, GEMINI_MODEL_TEXT, GEMINI_MODEL_IMAGE } from '../config'; // Using a config file for API key and model

// The API key is sourced from config.ts, which should prioritize process.env.API_KEY.
const apiKey = GEMINI_API_KEY || process.env.API_KEY;

if (!apiKey) {
  console.error("Gemini API Key is not set. Please set the API_KEY environment variable or ensure it's available via config.ts. AI features will not work.");
}

// Initialize the GoogleGenAI client.
// The '!' asserts apiKey is non-null after the check, or if it's guaranteed by the build process/environment.
const ai = new GoogleGenAI({ apiKey: apiKey! });
const textModel = GEMINI_MODEL_TEXT; // Use the text model specified in config
const imageModel = GEMINI_MODEL_IMAGE; // Use the image model specified in config

const defaultSystemInstruction = "You are a storyteller for a text-based fantasy RPG. Your responses MUST be EXTREMELY BRIEF, MAXIMUM 1-2 sentences. Provide ONLY essential 'breadcrumb' details. Focus on atmosphere and key information. NO long descriptions. Be concise.";

/**
 * Generic function to generate text content using the Gemini API.
 * @param {string} prompt - The prompt to send to the model.
 * @param {string} [systemInstruction] - Optional system instruction to guide the model's behavior. Defaults to a general RPG storyteller instruction.
 * @returns {Promise<string>} A promise that resolves to the generated text.
 * @throws {Error} If the API key is not configured or if the API call fails.
 */
async function generateText(prompt: string, systemInstruction?: string): Promise<string> {
  if (!apiKey) {
    console.error("Gemini API Key not configured. Cannot generate text.");
    return Promise.reject(new Error("Gemini API Key not configured."));
  }
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: textModel,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction || defaultSystemInstruction,
        temperature: 0.7, 
        topK: 40,
        topP: 0.95,
      }
    });
    return response.text.trim();
  } catch (error) {
    console.error("Gemini API error in generateText:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to generate text from Gemini: ${errorMessage}`);
  }
}

/**
 * Generates a description for a game location.
 * @param {string} locationName - The name of the location.
 * @param {string} context - Contextual information about the player and situation.
 * @returns {Promise<string>} A promise that resolves to the location description.
 */
export async function generateLocationDescription(locationName: string, context: string): Promise<string> {
  const systemInstruction = "Describe a new location in a fantasy RPG. Response MUST be EXTREMELY BRIEF: 1-2 sentences MAX. Give ONLY key sights, sounds, or atmosphere. No fluff.";
  const prompt = `Player arrives at "${locationName}". Context: ${context}. Provide an EXTREMELY BRIEF description (1-2 sentences MAX) of the area's key features or atmosphere.`;
  return generateText(prompt, systemInstruction);
}

/**
 * Generates a response for an NPC based on player interaction.
 * @param {string} npcName - The name of the NPC.
 * @param {string} playerAction - The player's action or query towards the NPC.
 * @param {string} context - Contextual information about the player and situation.
 * @returns {Promise<string>} A promise that resolves to the NPC's response.
 */
export async function generateNPCResponse(npcName: string, playerAction: string, context: string): Promise<string> {
  const systemInstruction = `You are roleplaying as ${npcName}. Your response MUST be EXTREMELY BRIEF: 1-2 sentences MAX. Respond directly and concisely.`;
  const prompt = `NPC: ${npcName}. Player action: "${playerAction}". Context: ${context}. ${npcName}'s EXTREMELY BRIEF response (1-2 sentences MAX):`;
  return generateText(prompt, systemInstruction);
}

/**
 * Generates an outcome or observation based on a player's action.
 * @param {string} playerAction - The action performed by the player.
 * @param {string} context - Contextual information about the player and situation.
 * @returns {Promise<string>} A promise that resolves to the description of the action's outcome.
 */
export async function generateActionOutcome(playerAction: string, context: string): Promise<string> {
  const systemInstruction = "Describe the result of a player's action. Response MUST be EXTREMELY BRIEF: 1-2 sentences MAX. ONLY state the key outcome or observation.";
  const prompt = `Player action: "${playerAction}". Context: ${context}. What is the EXTREMELY BRIEF outcome (1-2 sentences MAX)?`;
  return generateText(prompt, systemInstruction);
}

/**
 * Generates a minor dynamic event to add flavor to the current scene.
 * @param {string} currentLocationName - The name of the player's current location.
 * @param {string} context - Contextual information about the player and situation.
 * @returns {Promise<string>} A promise that resolves to the description of the dynamic event.
 */
export async function generateDynamicEvent(currentLocationName: string, context: string): Promise<string> {
  const systemInstruction = "Introduce a small, unexpected event. Response MUST be EXTREMELY BRIEF: 1-2 sentences MAX. Focus on a single detail.";
  const prompt = `Player is in ${currentLocationName}. Context: ${context}. Describe an EXTREMELY BRIEF dynamic event (1-2 sentences MAX).`;
  return generateText(prompt, systemInstruction);
}

/**
 * Generates a response from the Oracle based on the player's query.
 * The response will be direct first-person speech from the Oracle.
 * @param {string} playerQuery - The question the player asks the Oracle.
 * @param {string} context - Contextual information about the player's situation when asking.
 * @returns {Promise<string>} A promise that resolves to the Oracle's mystical response, spoken in first person.
 */
export async function generateOracleResponse(playerQuery: string, context: string): Promise<string> {
  const systemInstruction = "You ARE the Oracle. Speak DIRECTLY to the adventurer in first person. Your response MUST be EXTREMELY BRIEF and enigmatic: 1-2 sentences MAX. Offer cryptic guidance. NO narration like 'The Oracle says'.";
  const prompt = `An adventurer asks me, the Oracle: "${playerQuery}". Context: ${context}. My EXTREMELY BRIEF and cryptic response (1-2 sentences MAX) is:`;
  return generateText(prompt, systemInstruction);
}

/**
 * Generates an image for a scene based on its text description using Imagen 3.
 * @param {string} description - The text description of the scene.
 * @returns {Promise<string>} A promise that resolves to the base64 encoded image string (JPEG format).
 * @throws {Error} If the API key is not configured or if the API call fails.
 */
export async function generateImageForScene(description: string): Promise<string> {
  if (!apiKey) {
    throw new Error("Gemini API Key not configured. Cannot generate image.");
  }
  try {
    const imagePrompt = `A detailed fantasy RPG scene depicting: ${description}. Style: digital painting, atmospheric, vibrant colors, detailed environment, cinematic lighting.`;
    
    const response = await ai.models.generateImages({
        model: imageModel, // 'imagen-3.0-generate-002'
        prompt: imagePrompt,
        config: { numberOfImages: 1, outputMimeType: 'image/jpeg', aspectRatio: "16:9" },
    });

    if (response.generatedImages && response.generatedImages.length > 0 && response.generatedImages[0].image?.imageBytes) {
      return response.generatedImages[0].image.imageBytes;
    } else {
      console.error("Imagen API response missing image data.", response);
      throw new Error("Failed to generate image: API response did not include image data.");
    }
  } catch (error) {
    console.error("Imagen API error in generateImageForScene:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to generate image from Imagen: ${errorMessage}`);
  }
}
