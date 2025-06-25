/**
 * @file StartScreen.tsx
 * Placeholder for a start screen component.
 * This component is currently not in use and has been superseded by
 * the MainMenu and CharacterCreator components for game initialization.
 */
import React from 'react';

const StartScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col items-center justify-center p-8">
      <div className="bg-gray-800 p-8 md:p-12 rounded-xl shadow-2xl border border-gray-700 w-full max-w-md text-center">
        <h1 className="text-4xl font-bold text-amber-400 mb-8 font-cinzel">Start Screen</h1>
        <p className="text-gray-400">This component is a placeholder and not currently in use.</p>
        <p className="text-xs text-gray-500 mt-6">Superseded by Main Menu and Character Creator.</p>
      </div>
    </div>
  );
};

export default StartScreen;