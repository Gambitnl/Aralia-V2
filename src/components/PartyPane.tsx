/**
 * @file PlayerPane.tsx
 * This component is responsible for displaying the player character's information,
 * including their name, race, class, vitals (HP, AC), ability scores, skills,
 * selected class features (like fighting style or divine domain), spells, and inventory.
 * It also displays specific racial traits like Elven Lineage or Gnome Subrace.
 * It now directly uses pre-calculated stats like darkvisionRange and fully aggregated spell lists
 * from the PlayerCharacter prop, and displays current world/submap coordinates.
 */
import React from 'react';
import { PlayerCharacter, Item, AbilityScoreName, Spell } from '../types'; // Path relative to src/components/
import { RACES_DATA, SPELLS_DATA, GIANT_ANCESTRIES, TIEFLING_LEGACIES, SKILLS_DATA } from '../constants'; // Path relative to src/components/
import { getAbilityModifierString } from '../utils/characterUtils'; // Import centralized utility


interface PartyCharacterButtonProps {
  character: PlayerCharacter;
  onClick: () => void;
}

const PartyCharacterButton: React.FC<PartyCharacterButtonProps> = ({ character, onClick }) => {
  const healthPercentage = (character.hp / character.maxHp) * 100;

  return (
    <button
      onClick={onClick}
      className="w-full bg-gray-700 hover:bg-gray-600 p-3 rounded-lg shadow-md transition-colors border border-gray-600 focus:outline-none focus:ring-2 focus:ring-sky-500"
      aria-label={`View details for ${character.name}, AC: ${character.armorClass}, HP: ${character.hp}/${character.maxHp}`}
    >
      <div className="flex justify-between items-center mb-1.5">
        <p className="text-lg font-semibold text-amber-300 truncate" title={character.name}>{character.name}</p>
        <div className="flex items-center relative text-xs text-white group" title={`Armor Class: ${character.armorClass}`}>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 20 20" 
            fill="currentColor" 
            className="w-6 h-6 text-gray-500 group-hover:text-sky-400 transition-colors"
            aria-hidden="true"
          >
            <path d="M10 2L3 5v6.11C3 15.64 6.13 20 10 20c3.87 0 7-4.36 7-8.89V5l-7-3z" />
          </svg>
          <span 
            className="absolute inset-0 flex items-center justify-center text-white font-bold text-[10px] drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)] group-hover:text-yellow-300 transition-colors"
            aria-hidden="true" // Value is in the main aria-label
          >
            {character.armorClass}
          </span>
        </div>
      </div>

      <div className="w-full bg-gray-500 rounded-full h-6 shadow-inner overflow-hidden relative border border-gray-400">
        <div
          className="bg-red-600 h-full rounded-full transition-all duration-300 ease-out flex items-center justify-center"
          style={{ width: `${healthPercentage}%` }}
          role="progressbar"
          aria-valuenow={character.hp}
          aria-valuemin={0}
          aria-valuemax={character.maxHp}
        >
          {/* Text on the bar */}
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-xs font-medium text-white drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]">
            {character.hp} / {character.maxHp} HP
          </p>
        </div>
      </div>
       <p className="text-xs text-sky-300 mt-1 text-center">{character.race.name} {character.class.name}</p>
    </button>
  );
};

interface PartyPaneProps {
  playerCharacter: PlayerCharacter;
  onViewCharacterSheet: (character: PlayerCharacter) => void;
}

const PartyPane: React.FC<PartyPaneProps> = ({ playerCharacter, onViewCharacterSheet }) => {
  return (
    <div className="w-full bg-gray-800 p-4 rounded-lg shadow-xl border border-gray-700">
      <div className="border-b-2 border-amber-500 pb-2 mb-4">
        <h2 className="text-2xl font-bold text-amber-400 font-cinzel text-center tracking-wide">Party</h2>
      </div>
      <div className="space-y-3">
        {/* Render the main player character */}
        <PartyCharacterButton 
            character={playerCharacter} 
            onClick={() => onViewCharacterSheet(playerCharacter)} 
        />

        {/* Future: Map over other party members here */}
        {/* partyMembers.map(member => (
          <PartyCharacterButton key={member.id} character={member} onClick={() => onViewCharacterSheet(member)} />
        ))*/}
      </div>
       {/* Placeholder for if inventory or other details are added back here later */}
    </div>
  );
};

export default PartyPane;
