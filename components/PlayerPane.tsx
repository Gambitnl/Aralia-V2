/**
 * @file PlayerPane.tsx
 * This component is responsible for displaying the player character's information,
 * including their name, race, class, vitals (HP, AC), ability scores, skills,
 * selected class features (like fighting style or divine domain), spells, and inventory.
 * It also displays specific racial traits like Elven Lineage or Gnome Subrace.
 */
import React from 'react';
import { PlayerCharacter, Item, AbilityScoreName, Spell } from '../types';
import { RACES_DATA, SPELLS_DATA } from '../constants'; 

interface PlayerPaneProps {
  playerCharacter: PlayerCharacter;
  inventory: Item[];
}

const getAbilityModifier = (score: number): string => {
    const mod = Math.floor((score - 10) / 2);
    return mod >= 0 ? `+${mod}` : `${mod}`;
};

const PlayerPane: React.FC<PlayerPaneProps> = ({ playerCharacter, inventory }) => {
  const { 
    name, race, class: charClass, finalAbilityScores, skills, hp, maxHp, armorClass, speed,
    knownCantrips, knownSpells, selectedFightingStyle, selectedDivineDomain, 
    selectedDraconicAncestry, selectedElvenLineageId, elvenLineageSpellcastingAbility,
    selectedGnomeSubraceId, gnomeSubraceSpellcastingAbility 
  } = playerCharacter;

  const elvenLineageDetails = race.id === 'elf' && selectedElvenLineageId 
    ? RACES_DATA['elf']?.elvenLineages?.find(l => l.id === selectedElvenLineageId) 
    : null;
  
  const gnomeSubraceDetails = race.id === 'gnome' && selectedGnomeSubraceId
    ? RACES_DATA['gnome']?.gnomeSubraces?.find(sr => sr.id === selectedGnomeSubraceId)
    : null;

  let darkvisionRange = 0;
  const baseDarkvisionTrait = race.traits.find(t => t.toLowerCase().includes('darkvision'));
  if (baseDarkvisionTrait) {
      const match = baseDarkvisionTrait.match(/(\d+) ?ft/i); // Made ft matching optional and case-insensitive
      if (match && match[1]) darkvisionRange = parseInt(match[1]);
  }

  if (elvenLineageDetails?.id === 'drow') {
    const drowBenefit = elvenLineageDetails.benefits.find(b => b.level === 1 && b.darkvisionRange);
    if (drowBenefit && drowBenefit.darkvisionRange) {
        darkvisionRange = drowBenefit.darkvisionRange;
    }
  } else if (gnomeSubraceDetails?.superiorDarkvision) { // Handles Deep Gnome
    darkvisionRange = 120;
  } else if (race.id === 'dwarf' && baseDarkvisionTrait) { 
    // Dwarves might have a specific darkvision in their trait list (e.g., 120ft). Handled by baseDarkvisionTrait for now.
    // If Dwarf always means 120ft and isn't captured by baseDarkvisionTrait parsing, specific logic like for Deep Gnome needed.
    // Current DWARF_DATA sets "Darkvision (120ft)" which should be caught by baseDarkvisionTrait.
  }
  // Dragonborn Darkvision check
  else if (race.id === 'dragonborn' && baseDarkvisionTrait) {
     // Already handled by baseDarkvisionTrait logic
  } else if (race.id === 'aasimar' && baseDarkvisionTrait) {
     // Already handled by baseDarkvisionTrait logic
  }

  // Combine class-selected spells with racially granted ones for display
  let displayCantrips: Spell[] = [...knownCantrips];
  let displaySpells: Spell[] = [...knownSpells]; 

  // Add Aasimar Light cantrip if not already present
  if (race.id === 'aasimar') {
      const lightCantrip = SPELLS_DATA['light'];
      if (lightCantrip && !displayCantrips.some(c => c.id === lightCantrip.id)) {
          displayCantrips.push(lightCantrip);
      }
  }
  // Add Elf Lineage Cantrip and Spells
  if (elvenLineageDetails) {
      elvenLineageDetails.benefits.forEach(benefit => {
          if (benefit.cantripId) {
              const cantrip = SPELLS_DATA[benefit.cantripId];
              if (cantrip && !displayCantrips.some(c => c.id === cantrip.id)) {
                  displayCantrips.push(cantrip);
              }
          }
          if (benefit.spellId) { 
              const spell = SPELLS_DATA[benefit.spellId];
              if (spell && !displaySpells.some(s => s.id === spell.id)) {
                  displaySpells.push(spell);
              }
          }
      });
  }
  // Add Gnome Subrace spells
  if (gnomeSubraceDetails) {
      if (gnomeSubraceDetails.grantedCantrip) {
          const cantrip = SPELLS_DATA[gnomeSubraceDetails.grantedCantrip.id];
          if (cantrip && !displayCantrips.some(c => c.id === cantrip.id)) {
              displayCantrips.push(cantrip);
          }
      }
      if (gnomeSubraceDetails.grantedSpell) {
          const spell = SPELLS_DATA[gnomeSubraceDetails.grantedSpell.id];
          if (spell && !displaySpells.some(s => s.id === spell.id)) {
              displaySpells.push(spell);
          }
      }
  }
  // Remove duplicates just in case and sort
  displayCantrips = Array.from(new Set(displayCantrips.map(c => c.id))).map(id => displayCantrips.find(c => c.id === id)!).sort((a,b) => a.name.localeCompare(b.name));
  displaySpells = Array.from(new Set(displaySpells.map(s => s.id))).map(id => displaySpells.find(s => s.id === id)!).sort((a,b) => a.level - b.level || a.name.localeCompare(b.name));


  return (
    <div className="md:w-1/3 lg:w-1/4 bg-gray-800 p-6 rounded-lg shadow-xl h-full md:max-h-screen overflow-y-auto scrollable-content border border-gray-700">
      <div className="border-b-2 border-amber-500 pb-3 mb-6">
        <h2 className="text-3xl font-bold text-amber-400 font-cinzel tracking-wide">{name}</h2>
        <p className="text-sky-300 text-lg">
          {race.name}
          {gnomeSubraceDetails ? ` (${gnomeSubraceDetails.name})` : ''}
          {elvenLineageDetails ? ` (${elvenLineageDetails.name})` : ''}
          {selectedDraconicAncestry ? ` (${selectedDraconicAncestry.type} Dragonborn)` : ''}
          {' '}{charClass.name}
        </p>
      </div>
      
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-sky-400 mb-2">Vitals</h3>
        <p className="text-gray-300">HP: <span className="font-semibold text-green-400">{hp}</span> / {maxHp}</p>
        <p className="text-gray-300">AC: <span className="font-semibold text-blue-400">{armorClass}</span></p>
        <p className="text-gray-300">Speed: <span className="font-semibold text-blue-400">{speed}ft</span></p>
        {darkvisionRange > 0 && <p className="text-gray-300 text-sm">Darkvision: {darkvisionRange}ft</p>}
      </div>

      <div className="mb-6">
        <h3 className="text-xl font-semibold text-sky-400 mb-2">Ability Scores</h3>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-gray-300">
          {Object.entries(finalAbilityScores).map(([key, value]: [string, number]) => (
            <p key={key}>{key.substring(0,3)}: <span className="font-semibold text-amber-300">{value}</span> ({getAbilityModifier(value)})</p>
          ))}
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-sky-400 mb-2">Skills Proficiencies</h3>
        {skills.length > 0 ? (
          <ul className="list-disc list-inside text-gray-300 text-sm pl-1">
            {skills.map(skill => (
              <li key={skill.id}>{skill.name} ({skill.ability.substring(0,3)})</li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 italic text-sm">No skill proficiencies.</p>
        )}
      </div>

      {/* Racial Features Display */}
      {elvenLineageDetails && (
        <div className="mb-6">
            <h3 className="text-xl font-semibold text-sky-400 mb-1">Elven Lineage: {elvenLineageDetails.name}</h3>
            {elvenLineageSpellcastingAbility && <p className="text-xs text-gray-400"> (Spell Ability: {elvenLineageSpellcastingAbility.substring(0,3)})</p>}
            {elvenLineageDetails.benefits.filter(b => b.level === 1).map(benefit => {
                let benefitText = benefit.description || "";
                if (benefit.cantripId) {
                    const cantripName = SPELLS_DATA[benefit.cantripId]?.name || benefit.cantripId;
                    benefitText += ` (Gained Cantrip: ${cantripName})`;
                }
                return <p key={`${elvenLineageDetails.id}-${benefit.level}-${benefit.cantripId || benefit.description}`} className="text-gray-300 text-sm">{benefitText}</p>;
            })}
             <p className="text-xs text-gray-400 mt-1">Fey Ancestry, Trance, Keen Senses</p>
        </div>
      )}
       {gnomeSubraceDetails && (
        <div className="mb-6">
            <h3 className="text-xl font-semibold text-sky-400 mb-1">Gnome Subrace: {gnomeSubraceDetails.name}</h3>
            {gnomeSubraceSpellcastingAbility && (gnomeSubraceDetails.grantedCantrip || gnomeSubraceDetails.grantedSpell) && 
                <p className="text-xs text-gray-400"> (Spell Ability: {gnomeSubraceSpellcastingAbility.substring(0,3)})</p>
            }
            {gnomeSubraceDetails.traits.map(trait => (
                <p key={`${gnomeSubraceDetails.id}-${trait}`} className="text-gray-300 text-sm" title={trait.length > 50 ? trait : undefined}>
                    {trait.length > 50 ? trait.substring(0, 47) + '...' : trait}
                </p>
            ))}
            <p className="text-xs text-gray-400 mt-1">Gnomish Cunning, Speak with Small Beasts</p>
        </div>
      )}
      {selectedDraconicAncestry && ( 
        <div className="mb-6">
            <h3 className="text-xl font-semibold text-sky-400 mb-1">Draconic Ancestry</h3>
            <p className="text-gray-300 text-sm">{selectedDraconicAncestry.type} ({selectedDraconicAncestry.damageType} Resistance, Breath Weapon)</p>
        </div>
      )}


      {/* Class Features Display */}
      {selectedFightingStyle && (
        <div className="mb-6">
            <h3 className="text-xl font-semibold text-sky-400 mb-1">Fighting Style</h3>
            <p className="text-gray-300 text-sm">{selectedFightingStyle.name}</p>
        </div>
      )}
      {selectedDivineDomain && (
        <div className="mb-6">
            <h3 className="text-xl font-semibold text-sky-400 mb-1">Divine Domain</h3>
            <p className="text-gray-300 text-sm">{selectedDivineDomain.name}</p>
             {selectedDivineDomain.features?.map(feature => (
                <p key={feature.id} className="text-xs text-gray-400 ml-2" title={feature.description}>- {feature.name}</p>
            ))}
        </div>
      )}


      {(displayCantrips.length > 0 || displaySpells.length > 0) && (
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-sky-400 mb-2">Spells</h3>
          {displayCantrips.length > 0 && (
            <div className="mb-2">
              <h4 className="text-md font-medium text-amber-300">Cantrips:</h4>
              <ul className="list-disc list-inside text-gray-300 text-sm pl-1">
                {displayCantrips.map(spell => <li key={spell.id} title={spell.description}>{spell.name}</li>)}
              </ul>
            </div>
          )}
          {displaySpells.length > 0 && (
            <div>
              <h4 className="text-md font-medium text-amber-300">Known Spells:</h4>
              <ul className="list-disc list-inside text-gray-300 text-sm pl-1">
                {displaySpells.map(spell => <li key={spell.id} title={spell.description}>{spell.name} (L{spell.level})</li>)}
              </ul>
            </div>
          )}
        </div>
      )}


      <div>
        <h3 className="text-xl font-semibold text-sky-400 mb-3">Inventory</h3>
        {inventory.length > 0 ? (
          <ul className="space-y-2">
            {inventory.map(item => (
              <li key={item.id} className="p-3 bg-gray-700 rounded shadow hover:bg-gray-600 transition-colors cursor-pointer group" title={item.description}>
                <p className="font-semibold text-amber-300">{item.name}</p>
                <p className="text-sm text-gray-400 group-hover:text-gray-300 truncate">{item.description}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 italic">Your pockets are empty.</p>
        )}
      </div>
    </div>
  );
};

export default PlayerPane;
