/**
 * @file config.ts
 * This file centralizes configuration variables for the Aralia RPG application.
 * It includes preferred model names for text, image generation, and TTS.
 * API keys are sourced directly from process.env.API_KEY in the respective service files
 * via the centralized aiClient.ts.
 *
 * IMPORTANT: In a real application, API keys must be securely managed,
 * typically through environment variables on the server or during the build process.
 * DO NOT commit your actual API keys to version control.
 * For this exercise, process.env.API_KEY is the preferred source.
 */

// Model Configuration
export const GEMINI_MODEL_TEXT = 'gemini-2.5-flash-preview-04-17';
export const GEMINI_MODEL_IMAGE = 'imagen-3.0-generate-002';
export const GEMINI_MODEL_TTS = 'gemini-2.5-flash-preview-tts'; 

// The robust API_KEY check is now handled in src/services/aiClient.ts
// If process.env.API_KEY is not set, aiClient.ts will throw an error,
// preventing the application's AI features from attempting to run without a key.
