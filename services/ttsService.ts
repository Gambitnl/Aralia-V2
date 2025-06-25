/**
 * @file ttsService.ts
 * This service module handles interactions with the Google Gemini API for Text-to-Speech.
 * It provides functions to synthesize text into speech audio data.
 */
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { GEMINI_API_KEY, GEMINI_MODEL_TTS } from '../config';

const apiKey = GEMINI_API_KEY || process.env.API_KEY;

if (!apiKey) {
  console.error("Gemini API Key is not set. TTS features will not work.");
}

const ai = new GoogleGenAI({ apiKey: apiKey! });
const model = GEMINI_MODEL_TTS;

const DEFAULT_VOICE_NAME = 'Kore'; // A default Gemini TTS voice

/**
 * Synthesizes speech from text using the Gemini API's native TTS.
 * @param {string} text - The text to synthesize.
 * @param {string} [voiceName=DEFAULT_VOICE_NAME] - The name of the Gemini prebuilt voice to use (e.g., 'Kore', 'Puck').
 * @returns {Promise<string>} A promise that resolves to the base64 encoded audio string (PCM format).
 * @throws {Error} If the API key is not configured or if the API call fails.
 */
export async function synthesizeSpeech(
  text: string,
  voiceName: string = DEFAULT_VOICE_NAME
): Promise<string> {
  if (!apiKey) {
    const errorMsg = "Gemini API Key is not configured. Cannot synthesize speech.";
    console.error(errorMsg);
    return Promise.reject(new Error(errorMsg));
  }

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: model,
      contents: text, // The prompt for TTS can include style guidance, e.g., "Say cheerfully: Hello world!"
      config: {
        // According to documentation, responseModalities should be an array of strings.
        // Cast to 'any' temporarily if specific types are not readily available or cause issues.
        responseModalities: ['AUDIO' as any], // 'AUDIO' indicates the desired response type
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: voiceName,
            },
          },
          // Output format defaults to PCM (24kHz, 16-bit, mono) based on documentation examples.
          // If other formats (like MP3) were supported, they'd be specified here.
        },
      },
    });

    // Extract the audio data
    // Based on Gemini API structure for audio responses
    if (response.candidates && response.candidates.length > 0 &&
        response.candidates[0].content && response.candidates[0].content.parts &&
        response.candidates[0].content.parts.length > 0 &&
        response.candidates[0].content.parts[0].inlineData) {
      return response.candidates[0].content.parts[0].inlineData.data;
    } else {
      console.error("Gemini TTS API response missing audioContent.", response);
      throw new Error("Failed to synthesize speech: API response did not include audioContent.");
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error in synthesizeSpeech with Gemini TTS:", errorMessage, error);
    // Re-throw the error so it can be caught by the caller
    throw new Error(`Gemini TTS synthesizeSpeech failed: ${errorMessage}`);
  }
}
