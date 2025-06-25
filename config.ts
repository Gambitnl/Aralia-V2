/**
 * @file config.ts
 * This file centralizes configuration variables for the Aralia RPG application.
 * It includes the Gemini API key (sourced from environment variables) and
 * preferred model names for text and image generation.
 *
 * IMPORTANT: In a real application, API keys must be securely managed,
 * typically through environment variables on the server or during the build process.
 * DO NOT commit your actual API keys to version control.
 * For this exercise, process.env.API_KEY is the preferred source.
 */

// Gemini API Configuration
export const GEMINI_API_KEY = process.env.API_KEY || ""; 
export const GEMINI_MODEL_TEXT = 'gemini-2.5-flash-preview-04-17';
export const GEMINI_MODEL_IMAGE = 'imagen-3.0-generate-002';
export const GEMINI_MODEL_TTS = 'gemini-2.5-flash-preview-tts'; // Model for native Text-to-Speech

if (!GEMINI_API_KEY) {
  console.warn(
    "Gemini API Key (API_KEY) is not set in the environment. " +
    "Features requiring the Gemini API will not function correctly. " +
    "Please ensure the API_KEY environment variable is configured."
  );
}
