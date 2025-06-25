/**
 * @file NameAndReview.tsx
 * This component is the final step in character creation. It allows the player
 * to name their character and review all their selections (race, class, ability scores,
 * skills, features, spells) before finalizing the character.
 */
import React, { useState, useEffect } from 'react';
import { PlayerCharacter, AbilityScoreName, Spell } from '../../types';
import { RACES_DATA, SPELLS_DATA } from '../../constants'; // For lineage/subrace name and cantrip display

interface NameAndReviewProps {
  characterPreview: PlayerCharacter; // A temporary PlayerCharacter object with all selections made so far
  onConfirm: (name: string) => void; // Callback when character is confirmed
  onBack: () => void; // Function to go back to the previous step
  initialName?: string; // Optional initial name for the input field
}

/**
 * Calculates the D&D ability score modifier and returns it as a string.
 * @param {number} score - The ability score.
 * @returns {string} The modifier string (e.g., "+2", "-1").
 */
const getAbilityModifier = (score: number): string => {
    const mod = Math.floor((score - 10) / 2);
    return mod >= 0 ? `+${mod}` : `${mod}`;
};

/**
 * NameAndReview component.
 * Allows final review of character details and naming before creation.
 * @param {NameAndReviewProps} props - Props for the component.
 * @returns {React.FC} The rendered NameAndReview component.
 */
const NameAndReview: React.FC<NameAndReviewProps> = ({ characterPreview, onConfirm, onBack, initialName = '' }) => {
  const [name, setName] = useState(initialName);
  const { 
    race, 
    class: charClass, 
    finalAbilityScores, 
    skills, 
    selectedFightingStyle, 
    selectedDivineDomain, 
    selectedDraconicAncestry,
    selectedElvenLineageId,
    elvenLineageSpellcastingAbility, 
    selectedGnomeSubraceId,
    gnomeSubraceSpellcastingAbility,
    knownCantrips, 
    knownSpells,
    speed
  } = characterPreview;

  useEffect(() => {
    setName(initialName);
  }, [initialName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onConfirm(name.trim());
    }
  };
  
  const elvenLineageDetails = selectedElvenLineageId ? RACES_DATA['elf']?.elvenLineages?.find(l => l.id === selectedElvenLineageId) : null;
  const gnomeSubraceDetails = selectedGnomeSubraceId ? RACES_DATA['gnome']?.gnomeSubraces?.find(sr => sr.id === selectedGnomeSubraceId) : null;

  let racialCantrips: Spell[] = [];
  let racialSpells: Spell[] = [];

  if (elvenLineageDetails) {
    const benefit = elvenLineageDetails.benefits.find(b => b.level === 1 && b.cantripId);
    if (benefit && benefit.cantripId) {
        const cantrip = SPELLS_DATA[benefit.cantripId];
        if (cantrip) racialCantrips.push(cantrip);
    }
    // Handle higher level elven lineage spells
    elvenLineageDetails.benefits.forEach(benefit => {
        if (benefit.spellId && benefit.level > 0) { // Assuming level 0 are cantrips
            const spell = SPELLS_DATA[benefit.spellId];
            if (spell && !racialSpells.some(s => s.id === spell.id)) {
                racialSpells.push(spell);
            }
        }
    });
  }
  if (gnomeSubraceDetails) {
    if (gnomeSubraceDetails.grantedCantrip) {
        const cantrip = SPELLS_DATA[gnomeSubraceDetails.grantedCantrip.id];
        if (cantrip) racialCantrips.push(cantrip);
    }
    if (gnomeSubraceDetails.grantedSpell) {
        const spell = SPELLS_DATA[gnomeSubraceDetails.grantedSpell.id];
        if (spell && !racialSpells.some(s => s.id === spell.id)) {
             racialSpells.push(spell);
        }
    }
  }
   if (characterPreview.race.id === 'aasimar') { // Aasimar Light Bearer
      const lightCantrip = SPELLS_DATA['light'];
      if (lightCantrip) racialCantrips.push(lightCantrip);
  }


  const allKnownCantrips = [...new Set([...knownCantrips.map(c => c.id), ...racialCantrips.map(c => c.id)])]
                            .map(id => knownCantrips.find(c => c.id === id) || racialCantrips.find(c => c.id === id)!);
  const allKnownSpells = [...new Set([...knownSpells.map(s => s.id), ...racialSpells.map(s => s.id)])]
                           .map(id => knownSpells.find(s => s.id === id) || racialSpells.find(s => s.id === id)!);
  allKnownSpells.sort((a,b) => a.level - b.level || a.name.localeCompare(b.name));


  return (
    <div>
      <h2 className="text-2xl text-sky-300 mb-6 text-center">Name Your Character & Review</h2>
      
      <div className="bg-gray-700 p-4 rounded-lg mb-6 max-h-72 overflow-y-auto scrollable-content border border-gray-600">
        <h3 className="text-xl font-semibold text-amber-400 mb-3">Character Summary</h3>
        <p><strong>Race:</strong> {race.name}
          {gnomeSubraceDetails ? ` (${gnomeSubraceDetails.name})` : ''}
          {elvenLineageDetails ? ` (${elvenLineageDetails.name})` : ''}
          {selectedDraconicAncestry ? ` (${selectedDraconicAncestry.type} Dragonborn)` : ''}
        </p>

        {selectedDraconicAncestry && (
          <p className="text-sm ml-2">
            <strong>Draconic Ancestry:</strong> {selectedDraconicAncestry.type} Dragon ({selectedDraconicAncestry.damageType} resistance)
          </p>
        )}
        {elvenLineageDetails && (
          <div className="text-sm ml-2">
            <p><strong>Elven Lineage:</strong> {elvenLineageDetails.name}</p>
            {elvenLineageSpellcastingAbility && <p className="text-xs"> (Spellcasting Ability: {elvenLineageSpellcastingAbility})</p>}
            {elvenLineageDetails.benefits.filter(b => b.level === 1).map(benefit => (
              <p key={`${elvenLineageDetails.id}-${benefit.cantripId || benefit.description}`} className="text-xs text-gray-400">
                - {benefit.description}
                {benefit.cantripId && ` Cantrip: ${SPELLS_DATA[benefit.cantripId]?.name || benefit.cantripId}.`}
                {benefit.speedIncrease && ` Speed increased by ${benefit.speedIncrease}ft.`}
                {benefit.darkvisionRange && ` Darkvision ${benefit.darkvisionRange}ft.`}
              </p>
            ))}
          </div>
        )}
        {gnomeSubraceDetails && (
          <div className="text-sm ml-2">
            <p><strong>Gnome Subrace:</strong> {gnomeSubraceDetails.name}</p>
            {(gnomeSubraceDetails.grantedCantrip || gnomeSubraceDetails.grantedSpell) && gnomeSubraceSpellcastingAbility &&
              <p className="text-xs"> (Spellcasting Ability: {gnomeSubraceSpellcastingAbility})</p>
            }
            {gnomeSubraceDetails.traits.map(trait => (
              <p key={`${gnomeSubraceDetails.id}-${trait}`} className="text-xs text-gray-400" title={trait.length > 50 ? trait : undefined}>
                - {trait.length > 50 ? trait.substring(0, 47) + "..." : trait}
              </p>
            ))}
             {gnomeSubraceDetails.superiorDarkvision && <p className="text-xs text-gray-400">- Darkvision: 120ft</p>}
             {/* Base Gnome traits like Gnomish Cunning are part of characterPreview.race.traits and not explicitly iterated here but are included in the final character object */}
          </div>
        )}

        <p><strong>Class:</strong> {charClass.name}</p>
        <div className="my-2">
            <strong>Ability Scores:</strong>
            <ul className="list-disc list-inside ml-4 text-sm">
            {Object.entries(finalAbilityScores).map(([key, value]: [string, number]) => (
                <li key={key}>{key as AbilityScoreName}: {value} ({getAbilityModifier(value)})</li>
            ))}
            </ul>
        </div>
        <div className="my-2">
            <strong>Skills:</strong> {skills.length > 0 ? skills.map(s => `${s.name} (${s.ability.substring(0,3)})`).join(', ') : 'None selected'}
        </div>
        {selectedFightingStyle && <p><strong>Fighting Style:</strong> {selectedFightingStyle.name}</p>}
        {selectedDivineDomain && 
            <div>
                <p><strong>Divine Domain:</strong> {selectedDivineDomain.name}</p>
                {selectedDivineDomain.features?.map(f => <p key={f.id} className="text-xs ml-2 text-gray-400" title={f.description}>- {f.name}</p>)}
            </div>
        }
        { (allKnownCantrips.length > 0 || allKnownSpells.length > 0) &&
            <div className="my-2">
                <strong>Spells:</strong>
                {allKnownCantrips.length > 0 && <p className="text-xs">Cantrips: {allKnownCantrips.map(s => s.name).join(', ')}</p>}
                {allKnownSpells.length > 0 && <p className="text-xs">Known Spells: {allKnownSpells.map(s => `${s.name} (L${s.level})`).join(', ')}</p>}
            </div>
        }
         <p className="text-sm mt-1"><strong>HP:</strong> {characterPreview.maxHp}</p>
         <p className="text-sm"><strong>AC:</strong> {characterPreview.armorClass}</p>
         <p className="text-sm"><strong>Speed:</strong> {speed}ft</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="characterName" className="block text-md font-medium text-gray-300 mb-1">
            Character Name:
          </label>
          <input
            type="text"
            id="characterName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
            placeholder="E.g., Valerius Stonebeard"
            required
            aria-required="true"
            aria-label="Enter your character's name"
          />
        </div>
        
        <div className="flex gap-4 pt-2">
            <button
                type="button"
                onClick={onBack}
                className="w-1/2 bg-gray-600 hover:bg-gray-500 text-white font-semibold py-3 px-4 rounded-lg shadow transition-colors"
                aria-label="Go back to previous step"
            >
                Back
            </button>
            <button
                type="submit"
                disabled={!name.trim()}
                className="w-1/2 bg-green-600 hover:bg-green-500 disabled:bg-gray-500 text-white font-bold py-3 px-4 rounded-lg shadow transition-all duration-150 ease-in-out"
                aria-label="Confirm character and begin adventure"
            >
                Begin Adventure!
            </button>
        </div>
      </form>
    </div>
  );
};

export default NameAndReview;
