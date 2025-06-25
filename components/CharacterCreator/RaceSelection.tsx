
/**
 * @file RaceSelection.tsx
 * This component allows the player to select a race for their character
 * from a list of available D&D races. Each race card displays key information.
 */
import React from 'react';
import { Race } from '../../types';

interface RaceSelectionProps {
  races: Race[];
  onRaceSelect: (raceId: string) => void;
}

/**
 * RaceSelection component.
 * Displays a grid of selectable race cards.
 * @param {RaceSelectionProps} props - Props for the component.
 * @returns {React.FC} The rendered RaceSelection component.
 */
const RaceSelection: React.FC<RaceSelectionProps> = ({ races, onRaceSelect }) => {
  return (
    <div>
      <h2 className="text-2xl text-sky-300 mb-6 text-center">Choose Your Race</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {races.map((race) => (
          <button
            key={race.id}
            onClick={() => onRaceSelect(race.id)}
            className="bg-gray-700 hover:bg-sky-700 text-left p-4 rounded-lg shadow transition-all duration-150 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-sky-500"
            aria-label={`Select ${race.name}`}
          >
            <h3 className="text-xl font-semibold text-amber-400 mb-2">{race.name}</h3>
            <p className="text-sm text-gray-400 mb-2" style={{ minHeight: '3em' }}>{race.description}</p> {/* Ensure consistent height for description */}
            <ul className="text-xs text-gray-500 list-disc list-inside">
              {race.abilityBonuses && race.abilityBonuses.length > 0 && race.abilityBonuses.map(ab => (
                <li key={`${race.id}-${ab.ability}`}>+{ab.bonus} {ab.ability}</li>
              ))}
              {/* Display a few key traits */}
              {race.traits.slice(0,2).map(trait => <li key={`${race.id}-${trait}`}>{trait.length > 30 ? trait.substring(0,27) + '...' : trait}</li>)} 
              {race.traits.length > 2 && <li key={`${race.id}-more`}>And more...</li>}
            </ul>
          </button>
        ))}
      </div>
    </div>
  );
};

export default RaceSelection;
