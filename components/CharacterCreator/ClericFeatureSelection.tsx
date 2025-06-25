
/**
 * @file ClericFeatureSelection.tsx
 * This component allows a player who has chosen the Cleric class to select
 * a Divine Domain and their initial known cantrips and Level 1 spells.
 */
import React, { useState, useEffect } from 'react';
import { DivineDomain, Spell, Class as CharClass } from '../../types'; // Aliasing Class

interface ClericFeatureSelectionProps {
  domains: DivineDomain[];
  spellcastingInfo: NonNullable<CharClass['spellcasting']>; // Ensured by class selection logic
  allSpells: Record<string, Spell>; // All available spells in the game
  onClericFeaturesSelect: (domain: DivineDomain, cantrips: Spell[], spellsL1: Spell[]) => void;
  onBack: () => void; // Function to go back to Skill Selection
}

/**
 * ClericFeatureSelection component.
 * Handles selection of Divine Domain and spells for Cleric characters.
 * @param {ClericFeatureSelectionProps} props - Props for the component.
 * @returns {React.FC} The rendered ClericFeatureSelection component.
 */
const ClericFeatureSelection: React.FC<ClericFeatureSelectionProps> = ({ 
  domains, spellcastingInfo, allSpells, onClericFeaturesSelect, onBack 
}) => {
  const [selectedDomainId, setSelectedDomainId] = useState<string | null>(null);
  const [selectedCantripIds, setSelectedCantripIds] = useState<Set<string>>(new Set());
  const [selectedSpellL1Ids, setSelectedSpellL1Ids] = useState<Set<string>>(new Set());

  // Filter available cantrips and L1 spells from the cleric's spell list
  const availableCantrips = spellcastingInfo.spellList
    .map(id => allSpells[id])
    .filter(spell => spell && spell.level === 0);
  
  const availableSpellsL1Base = spellcastingInfo.spellList // Spells from general cleric list
    .map(id => allSpells[id])
    .filter(spell => spell && spell.level === 1);

  // Note: Domain spells are automatically known and prepared for Clerics.
  // The selection here is for additional spells they can prepare up to their limit.

  /**
   * Handles the selection of a Divine Domain. Resets spell selections.
   * @param {string} domainId - The ID of the selected domain.
   */
  const handleDomainSelect = (domainId: string) => {
    setSelectedDomainId(domainId);
    // Reset spell selections if domain changes, as it might influence choices or available spells (though not directly here)
    setSelectedCantripIds(new Set());
    setSelectedSpellL1Ids(new Set());
    console.log(`ClericFeatureSelection: Domain selected - ${domainId}`);
  };

  /**
   * Toggles the selection of a spell (cantrip or L1 spell).
   * @param {string} id - The ID of the spell.
   * @param {Set<string>} currentSelection - The current set of selected spell IDs.
   * @param {React.Dispatch<React.SetStateAction<Set<string>>>} setSelection - State setter for the selection.
   * @param {number} limit - The maximum number of spells allowed for this type.
   * @param {string} type - A string descriptor for logging ('cantrip' or 'spell L1').
   */
  const toggleSelection = (id: string, currentSelection: Set<string>, setSelection: React.Dispatch<React.SetStateAction<Set<string>>>, limit: number, type: string) => {
    const newSelection = new Set(currentSelection);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else if (newSelection.size < limit) {
      newSelection.add(id);
    }
    setSelection(newSelection);
    console.log(`ClericFeatureSelection: Toggled ${type} ${id}. New count: ${newSelection.size}/${limit}`);
  };
  
  /**
   * Confirms the selected domain and spells, then calls the onClericFeaturesSelect callback.
   */
  const handleSubmit = () => {
    const domain = selectedDomainId ? domains.find(d => d.id === selectedDomainId) : null;
    if (domain && selectedCantripIds.size === spellcastingInfo.knownCantrips && selectedSpellL1Ids.size === spellcastingInfo.knownSpellsL1) {
      const cantrips = Array.from(selectedCantripIds).map(id => allSpells[id]);
      const spellsL1 = Array.from(selectedSpellL1Ids).map(id => allSpells[id]);
      console.log(`ClericFeatureSelection: Confirming choices. Domain: ${domain.name}, Cantrips: ${cantrips.map(c=>c.name)}, Spells L1: ${spellsL1.map(s=>s.name)}`);
      onClericFeaturesSelect(domain, cantrips, spellsL1);
    } else {
        console.log("ClericFeatureSelection: handleSubmit called but conditions not met.");
        console.log(`ClericFeatureSelection: Domain: ${selectedDomainId}, Cantrips: ${selectedCantripIds.size}/${spellcastingInfo.knownCantrips}, Spells L1: ${selectedSpellL1Ids.size}/${spellcastingInfo.knownSpellsL1}`);
        // Optionally provide UI feedback
    }
  };

  const isButtonDisabled = !selectedDomainId || selectedCantripIds.size !== spellcastingInfo.knownCantrips || selectedSpellL1Ids.size !== spellcastingInfo.knownSpellsL1;
  console.log(`ClericFeatureSelection: Render. Domain: ${selectedDomainId}, Cantrips: ${selectedCantripIds.size}/${spellcastingInfo.knownCantrips}, Spells L1: ${selectedSpellL1Ids.size}/${spellcastingInfo.knownSpellsL1}. Button disabled: ${isButtonDisabled}`);


  return (
    <div>
      <h2 className="text-2xl text-sky-300 mb-4 text-center">Cleric Choices</h2>
      
      {/* Domain Selection */}
      <div className="mb-6">
        <h3 className="text-xl text-amber-300 mb-2">Choose Divine Domain</h3>
        {domains.map(domain => (
          <button
            key={domain.id}
            onClick={() => handleDomainSelect(domain.id)}
            className={`w-full text-left p-3 mb-2 rounded-lg transition-colors border-2 ${
              selectedDomainId === domain.id ? 'bg-sky-700 border-sky-500 ring-2 ring-sky-400' : 'bg-gray-700 hover:bg-gray-600 border-gray-600 hover:border-sky-600'
            }`}
            aria-pressed={selectedDomainId === domain.id}
            aria-label={`Select divine domain: ${domain.name}`}
          >
            <h4 className="font-semibold">{domain.name}</h4>
            <p className="text-sm text-gray-400">{domain.description}</p>
            {domain.domainSpells[1] && <p className="text-xs mt-1 text-sky-200">Domain Spells at Lvl 1: {domain.domainSpells[1].map(id => allSpells[id]?.name).join(', ')}</p>}
          </button>
        ))}
      </div>

      {selectedDomainId && (
        <>
          {/* Cantrip Selection */}
          <div className="mb-6">
            <h3 className="text-xl text-amber-300 mb-2">Select {spellcastingInfo.knownCantrips} Cantrips</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {availableCantrips.map(spell => (
              <label key={spell.id} className={`p-2 rounded-md cursor-pointer transition-colors ${selectedCantripIds.has(spell.id) ? 'bg-sky-600 ring-1 ring-sky-400' : 'bg-gray-700 hover:bg-gray-600'}`}>
                <input 
                  type="checkbox" 
                  className="mr-2 form-checkbox text-sky-500 bg-gray-800 border-gray-600 rounded focus:ring-sky-500" 
                  checked={selectedCantripIds.has(spell.id)} 
                  onChange={() => toggleSelection(spell.id, selectedCantripIds, setSelectedCantripIds, spellcastingInfo.knownCantrips, 'cantrip')} 
                  disabled={!selectedCantripIds.has(spell.id) && selectedCantripIds.size >= spellcastingInfo.knownCantrips}
                  aria-label={`Select cantrip ${spell.name}`}
                />
                {spell.name}
              </label>
            ))}
            </div>
            <p className="text-xs text-gray-400 mt-1">Selected: {selectedCantripIds.size}/{spellcastingInfo.knownCantrips}</p>
          </div>

          {/* Level 1 Spell Selection */}
          <div className="mb-6">
            <h3 className="text-xl text-amber-300 mb-2">Select {spellcastingInfo.knownSpellsL1} Additional Level 1 Spells</h3>
            <p className="text-xs text-gray-400 mb-2">(Domain spells are automatically known and prepared in addition to these.)</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {availableSpellsL1Base.map(spell => (
              <label key={spell.id} className={`p-2 rounded-md cursor-pointer transition-colors ${selectedSpellL1Ids.has(spell.id) ? 'bg-sky-600 ring-1 ring-sky-400' : 'bg-gray-700 hover:bg-gray-600'}`}>
                <input 
                  type="checkbox" 
                  className="mr-2 form-checkbox text-sky-500 bg-gray-800 border-gray-600 rounded focus:ring-sky-500" 
                  checked={selectedSpellL1Ids.has(spell.id)} 
                  onChange={() => toggleSelection(spell.id, selectedSpellL1Ids, setSelectedSpellL1Ids, spellcastingInfo.knownSpellsL1, 'spell L1')} 
                  disabled={!selectedSpellL1Ids.has(spell.id) && selectedSpellL1Ids.size >= spellcastingInfo.knownSpellsL1}
                  aria-label={`Select level 1 spell ${spell.name}`}
                />
                {spell.name}
              </label>
            ))}
            </div>
             <p className="text-xs text-gray-400 mt-1">Selected: {selectedSpellL1Ids.size}/{spellcastingInfo.knownSpellsL1}</p>
          </div>
        </>
      )}

      <div className="flex gap-4 mt-6">
        <button onClick={onBack} className="w-1/2 bg-gray-600 hover:bg-gray-500 text-white font-semibold py-2 px-4 rounded-lg shadow" aria-label="Go back to skill selection">Back</button>
        <button 
            onClick={handleSubmit} 
            disabled={isButtonDisabled}
            className="w-1/2 bg-green-600 hover:bg-green-500 disabled:bg-gray-500 text-white font-semibold py-2 px-4 rounded-lg shadow"
            aria-label="Confirm cleric choices"
        >
            Confirm Choices
        </button>
      </div>
    </div>
  );
};

export default ClericFeatureSelection;