/**
 * @file ttsService.ts
 * This service module handles interactions with the Google Gemini API for Text-to-Speech.
 * It provides functions to synthesize text into speech audio data.
 * It uses the centralized AI client from aiClient.ts.
 */
import { GenerateContentResponse } from '@google/genai';
import { ai } from './aiClient'; // Import the shared AI client
import { GEMINI_MODEL_TTS } from '../config'; // Path relative to src/services/

const model = GEMINI_MODEL_TTS;
const DEFAULT_VOICE_NAME = 'Kore'; // A default Gemini TTS voice

// Define a specific type for the audio response modality
type AudioResponseModality = 'AUDIO';

/**
 * Synthesizes speech from text using the Gemini API's native TTS.
 * @param {string} text - The text to synthesize.
 * @param {string} [voiceName=DEFAULT_VOICE_NAME] - The name of the Gemini prebuilt voice to use (e.g., 'Kore', 'Puck').
 * @returns {Promise<string>} A promise that resolves to the base64 encoded audio string (PCM format).
 * @throws {Error} If the API call fails or valid audio data is not returned.
 */
export async function synthesizeSpeech(
  text: string,
  voiceName: string = DEFAULT_VOICE_NAME,
): Promise<string> {
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: model,
      contents: text, 
      config: {
        responseModalities: ['AUDIO' as AudioResponseModality], 
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: voiceName,
            },
          },
        },
      },
    });

    const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (typeof audioData === 'string' && audioData.length > 0) {
      return audioData;
    } else {
      console.error("Gemini TTS API response missing valid audioContent in inlineData.data. Response:", JSON.stringify(response, null, 2));
      // Construct a more informative error from the response if possible
      let detail = "Response structure was not as expected or audio data was empty/invalid.";
      if (response.candidates && response.candidates.length > 0 && response.candidates[0].finishReason) {
        detail += ` Finish Reason: ${response.candidates[0].finishReason}.`;
      }
      if (response.promptFeedback && response.promptFeedback.blockReason) {
        detail += ` Prompt Feedback Block Reason: ${response.promptFeedback.blockReason}.`;
      }
      // Check for specific safety ratings or other indicators if available in the response structure
      const safetyRatings = response.candidates?.[0]?.safetyRatings;
      if (safetyRatings && safetyRatings.length > 0) {
        detail += ` Safety Ratings: ${JSON.stringify(safetyRatings)}.`;
      }

      throw new Error(
        `Failed to synthesize speech: API response did not include valid audioContent. ${detail}`,
      );
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error in synthesizeSpeech with Gemini TTS:', errorMessage, error);
    // Re-throw the error so it can be caught by the caller
    throw new Error(`Gemini TTS synthesizeSpeech failed: ${errorMessage}`);
  }
}