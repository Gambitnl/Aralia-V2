/**
 * @file GnomeSubraceSelection.tsx
 * This component is part of the character creation process for Gnome characters.
 * It allows the player to choose their Gnome Subrace (Forest, Rock, or Deep Gnome)
 * and the spellcasting ability for spells granted by that subrace.
 */
import React, { useState } from 'react';
import { GnomeSubrace, GnomeSubraceType, AbilityScoreName } from '../../types';
import { RELEVANT_SPELLCASTING_ABILITIES, SPELLS_DATA } from '../../constants';

interface GnomeSubraceSelectionProps {
  subraces: GnomeSubrace[];
  onSubraceSelect: (subraceId: GnomeSubraceType, spellcastingAbility: AbilityScoreName) => void;
  onBack: () => void;
}

const GnomeSubraceSelection: React.FC<GnomeSubraceSelectionProps> = ({ subraces, onSubraceSelect, onBack }) => {
  const [selectedSubraceId, setSelectedSubraceId] = useState<GnomeSubraceType | null>(null);
  const [selectedSpellcastingAbility, setSelectedSpellcastingAbility] = useState<AbilityScoreName | null>(null);

  const selectedSubraceDetails = selectedSubraceId ? subraces.find(sr => sr.id === selectedSubraceId) : null;
  const needsSpellcastingAbilityChoice = selectedSubraceDetails && (selectedSubraceDetails.grantedCantrip || selectedSubraceDetails.grantedSpell);

  const handleSubmit = () => {
    if (selectedSubraceId) {
      if (needsSpellcastingAbilityChoice && selectedSpellcastingAbility) {
        onSubraceSelect(selectedSubraceId, selectedSpellcastingAbility);
      } else if (!needsSpellcastingAbilityChoice) {
        // If no spells are granted, default to Intelligence or any relevant ability as placeholder
        // This ensures onSubraceSelect always receives a spellcasting ability.
        onSubraceSelect(selectedSubraceId, selectedSpellcastingAbility || 'Intelligence');
      }
    }
  };

  return (
    <div>
      <h2 className="text-2xl text-sky-300 mb-6 text-center">Choose Your Gnome Subrace</h2>
      
      <div className="mb-6">
        <h3 className="text-xl text-amber-300 mb-3">Select Subrace:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {subraces.map((subrace) => (
            <button
              key={subrace.id}
              onClick={() => {
                setSelectedSubraceId(subrace.id);
                // Reset spellcasting ability if the new subrace doesn't need one or if it's a new choice
                if (!(subrace.grantedCantrip || subrace.grantedSpell)) {
                    setSelectedSpellcastingAbility(null);
                } else {
                    // If the subrace does grant spells, pre-select Intelligence as a sensible default, or clear to force choice
                    setSelectedSpellcastingAbility('Intelligence'); 
                }
              }}
              className={`w-full text-left p-4 rounded-lg transition-colors border-2 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-opacity-75 ${
                selectedSubraceId === subrace.id
                  ? 'bg-sky-700 border-sky-500 ring-sky-500'
                  : 'bg-gray-700 hover:bg-gray-600 border-gray-600 hover:border-sky-600 ring-transparent'
              }`}
              aria-pressed={selectedSubraceId === subrace.id}
              aria-label={`Select ${subrace.name} subrace`}
            >
              <h4 className="font-semibold text-amber-400 text-lg">{subrace.name}</h4>
              <p className="text-sm text-gray-300 mt-1" style={{ minHeight: '3em' }}>{subrace.description}</p>
              <ul className="text-xs text-sky-200 mt-2 list-disc list-inside">
                {subrace.traits.slice(0, 2).map(trait => (
                  <li key={`${subrace.id}-${trait}`}>{trait.length > 50 ? trait.substring(0, 47) + '...' : trait}</li>
                ))}
                 {subrace.grantedCantrip && <li>Grants: {SPELLS_DATA[subrace.grantedCantrip.id]?.name}</li>}
                 {subrace.grantedSpell && <li>Grants: {SPELLS_DATA[subrace.grantedSpell.id]?.name}</li>}
                 {subrace.superiorDarkvision && <li>Superior Darkvision (120ft)</li>}
              </ul>
            </button>
          ))}
        </div>
      </div>

      {selectedSubraceId && needsSpellcastingAbilityChoice && (
        <div className="mb-6">
          <h3 className="text-xl text-amber-300 mb-3">Select Spellcasting Ability for Subrace Spells:</h3>
          <div className="flex flex-wrap gap-2">
            {RELEVANT_SPELLCASTING_ABILITIES.map((ability) => (
              <button
                key={ability}
                onClick={() => setSelectedSpellcastingAbility(ability)}
                className={`px-4 py-2 rounded-md transition-colors border ${
                  selectedSpellcastingAbility === ability
                    ? 'bg-green-600 border-green-500 text-white'
                    : 'bg-gray-600 hover:bg-gray-500 border-gray-500 text-gray-300'
                }`}
                aria-pressed={selectedSpellcastingAbility === ability}
                aria-label={`Select ${ability} as spellcasting ability`}
              >
                {ability}
              </button>
            ))}
          </div>
           {selectedSpellcastingAbility && <p className="text-xs text-gray-400 mt-2">Selected: {selectedSpellcastingAbility}</p>}
        </div>
      )}
      
      <div className="flex gap-4 mt-8">
        <button
          onClick={onBack}
          className="w-1/2 bg-gray-600 hover:bg-gray-500 text-white font-semibold py-3 px-4 rounded-lg shadow transition-colors"
          aria-label="Go back to race selection"
        >
          Back to Race
        </button>
        <button
          onClick={handleSubmit}
          disabled={!selectedSubraceId || (needsSpellcastingAbilityChoice && !selectedSpellcastingAbility)}
          className="w-1/2 bg-green-600 hover:bg-green-500 disabled:bg-gray-500 text-white font-semibold py-3 px-4 rounded-lg shadow transition-colors"
          aria-label="Confirm selected gnome subrace and ability"
        >
          Confirm Subrace
        </button>
      </div>
    </div>
  );
};

export default GnomeSubraceSelection;