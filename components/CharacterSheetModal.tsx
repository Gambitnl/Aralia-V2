/**
 * @file CharacterSheetModal.tsx
 * This component displays a modal with detailed character information,
 * including stats, skills, spells, an equipment mannequin, and inventory with actions.
 * Inventory display is now handled by the InventoryList component.
 * SkillDetailDisplay is now a separate overlay triggered from this modal.
 */
import React, { useEffect, useMemo, useState } from 'react'; // Added useState
import { PlayerCharacter, Item, EquipmentSlotType, Action, AbilityScoreName } from '../types';
import EquipmentMannequin from './EquipmentMannequin';
import InventoryList from './InventoryList'; 
import SkillDetailDisplay from './CharacterSheet/SkillDetailDisplay';
import { getAbilityModifierString } from '../utils/characterUtils';
import { RACES_DATA, SPELLS_DATA, GIANT_ANCESTRIES, TIEFLING_LEGACIES } from '../constants';


interface CharacterSheetModalProps {
  isOpen: boolean;
  character: PlayerCharacter | null;
  inventory: Item[]; 
  onClose: () => void;
  onAction: (action: Action) => void; 
  onNavigateToGlossary?: (termId: string) => void; // For glossary navigation
}

const CharacterSheetModal: React.FC<CharacterSheetModalProps> = ({ 
  isOpen, 
  character, 
  inventory, 
  onClose, 
  onAction,
  onNavigateToGlossary 
}) => {
  const [isSkillDetailOverlayOpen, setIsSkillDetailOverlayOpen] = useState(false);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isSkillDetailOverlayOpen) {
          setIsSkillDetailOverlayOpen(false);
        } else {
          onClose();
        }
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
    }
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose, isSkillDetailOverlayOpen]);

  const handleSlotClick = (slot: EquipmentSlotType, item?: Item) => {
    if (item) { 
      onAction({ type: 'UNEQUIP_ITEM', label: `Unequip ${item.name}`, payload: { slot }});
    }
  };

  if (!isOpen || !character) {
    return null;
  }

  const {
    name,
    race, class: charClass, finalAbilityScores, skills, hp, maxHp, armorClass, speed, 
    darkvisionRange = 0, 
    knownCantrips, knownSpells, 
    selectedFightingStyle = null, 
    selectedDivineDomain = null,
    selectedDraconicAncestry,
    selectedElvenLineageId = null, 
    elvenLineageSpellcastingAbility,
    selectedGnomeSubraceId = null, 
    gnomeSubraceSpellcastingAbility,
    deepGnomeSpellcastingAbility,
    selectedGiantAncestryBenefitId = null, 
    selectedFiendishLegacyId = null,
    fiendishLegacySpellcastingAbility,
    aarakocraSpellcastingAbility,
    airGenasiSpellcastingAbility,
    duergarMagicSpellcastingAbility,
  } = character;

  const elvenLineageDetails = race?.id === 'elf' && selectedElvenLineageId
    ? RACES_DATA['elf']?.elvenLineages?.find(l => l.id === selectedElvenLineageId) : null;
  const gnomeSubraceDetails = race?.id === 'gnome' && selectedGnomeSubraceId
    ? RACES_DATA['gnome']?.gnomeSubraces?.find(sr => sr.id === selectedGnomeSubraceId) : null;
  const giantAncestryDetails = race?.id === 'goliath' && selectedGiantAncestryBenefitId
    ? GIANT_ANCESTRIES.find(g => g.id === selectedGiantAncestryBenefitId) : null;
  const fiendishLegacyDetails = race?.id === 'tiefling' && selectedFiendishLegacyId
    ? TIEFLING_LEGACIES.find(fl => fl.id === selectedFiendishLegacyId) : null;


  return (
    <>
      <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          aria-modal="true"
          role="dialog"
          aria-labelledby="character-sheet-title"
      >
        <div className="bg-gray-800 p-6 rounded-xl shadow-2xl border border-gray-700 w-full max-w-6xl max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-700">
            <h2 id="character-sheet-title" className="text-3xl font-bold text-amber-400 font-cinzel tracking-wider">
              {character.name}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-200 text-3xl p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-400"
              aria-label="Close character sheet"
            >
              &times;
            </button>
          </div>

          {/* Main Content Area */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-6 gap-y-4 flex-grow overflow-hidden min-h-0">
            {/* Column 1: Core Stats & Features */}
            <div className="lg:col-span-1 space-y-4 overflow-y-auto scrollable-content p-1 pr-2">
              <p className="text-lg text-sky-300">{race.name} {elvenLineageDetails ? `(${elvenLineageDetails.name})` : gnomeSubraceDetails ? `(${gnomeSubraceDetails.name})` : selectedDraconicAncestry ? `(${selectedDraconicAncestry.type} Dragonborn)`: fiendishLegacyDetails ? `(${fiendishLegacyDetails.name})` : ''} {charClass.name}</p>
              
              {/* Vitals */}
              <div className="p-3 bg-gray-700/50 rounded-md border border-gray-600/60">
                <h4 className="text-lg font-semibold text-sky-300 mb-1.5">Vitals</h4>
                <p className="text-sm">HP: <span className="font-semibold text-green-400">{hp}</span> / {maxHp}</p>
                <p className="text-sm">AC: <span className="font-semibold text-blue-400">{armorClass}</span></p>
                <p className="text-sm">Speed: <span className="font-semibold">{speed}ft</span></p>
                {darkvisionRange > 0 && <p className="text-sm">Darkvision: {darkvisionRange}ft</p>}
              </div>

              {/* Ability Scores */}
              <div className="p-3 bg-gray-700/50 rounded-md border border-gray-600/60">
                <h4 className="text-lg font-semibold text-sky-300 mb-1.5">Ability Scores</h4>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-sm">
                  {Object.entries(finalAbilityScores).map(([key, value]) => (
                    <p key={key}>{key.substring(0,3)}: <span className="font-semibold text-amber-300">{value}</span> ({getAbilityModifierString(value)})</p>
                  ))}
                </div>
              </div>
              
              {/* Class & Racial Features */}
               {(selectedFightingStyle || selectedDivineDomain || elvenLineageDetails || gnomeSubraceDetails || giantAncestryDetails || fiendishLegacyDetails || character.race.id === 'aarakocra' || character.race.id === 'air_genasi' || character.race.id === 'deep_gnome' || character.race.id === 'duergar') && (
                <div className="p-3 bg-gray-700/50 rounded-md border border-gray-600/60">
                  <h4 className="text-lg font-semibold text-sky-300 mb-1.5">Key Features</h4>
                  {selectedFightingStyle && <p className="text-sm"><strong>Fighting Style:</strong> {selectedFightingStyle.name}</p>}
                  {selectedDivineDomain && <p className="text-sm"><strong>Divine Domain:</strong> {selectedDivineDomain.name}</p>}
                  {elvenLineageDetails && elvenLineageSpellcastingAbility && <p className="text-sm"><strong>Elven Lineage ({elvenLineageDetails.name}) Spell Ability:</strong> {elvenLineageSpellcastingAbility}</p>}
                  {gnomeSubraceDetails && gnomeSubraceSpellcastingAbility && (gnomeSubraceDetails.grantedCantrip || gnomeSubraceDetails.grantedSpell) && <p className="text-sm"><strong>Gnome Subrace ({gnomeSubraceDetails.name}) Spell Ability:</strong> {gnomeSubraceSpellcastingAbility}</p>}
                  {character.race.id === 'deep_gnome' && deepGnomeSpellcastingAbility && <p className="text-sm"><strong>Gift of the Svirfneblin Spell Ability:</strong> {deepGnomeSpellcastingAbility}</p>}
                  {giantAncestryDetails && <p className="text-sm"><strong>Giant Ancestry:</strong> {giantAncestryDetails.name}</p>}
                  {fiendishLegacyDetails && fiendishLegacySpellcastingAbility && <p className="text-sm"><strong>Fiendish Legacy ({fiendishLegacyDetails.name}) Spell Ability:</strong> {fiendishLegacySpellcastingAbility}</p>}
                  {character.race.id === 'aarakocra' && aarakocraSpellcastingAbility && <p className="text-sm"><strong>Wind Caller Spell Ability:</strong> {aarakocraSpellcastingAbility}</p>}
                  {character.race.id === 'air_genasi' && airGenasiSpellcastingAbility && <p className="text-sm"><strong>Mingle with the Wind Spell Ability:</strong> {airGenasiSpellcastingAbility}</p>}
                  {character.race.id === 'duergar' && duergarMagicSpellcastingAbility && <p className="text-sm"><strong>Duergar Magic Spell Ability:</strong> {duergarMagicSpellcastingAbility}</p>}
                </div>
              )}

              {/* Spells */}
              {(knownCantrips.length > 0 || knownSpells.length > 0) && (
                <div className="p-3 bg-gray-700/50 rounded-md border border-gray-600/60">
                  <h4 className="text-lg font-semibold text-sky-300 mb-1.5">Spells</h4>
                  {knownCantrips.length > 0 && (
                    <div className="mb-1.5">
                      <h5 className="text-sm font-medium text-amber-300">Cantrips:</h5>
                      <ul className="list-disc list-inside text-xs text-gray-300 pl-2">
                        {knownCantrips.map(spell => <li key={spell.id} title={spell.description}>{spell.name}</li>)}
                      </ul>
                    </div>
                  )}
                  {knownSpells.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium text-amber-300">Known Spells:</h5>
                      <ul className="list-disc list-inside text-xs text-gray-300 pl-2">
                        {knownSpells.map(spell => <li key={spell.id} title={spell.description}>{spell.name} (L{spell.level})</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              )}
              {/* Skill Details Button */}
                <div className="mt-4">
                    <button 
                        onClick={() => setIsSkillDetailOverlayOpen(true)}
                        className="w-full bg-teal-600 hover:bg-teal-500 text-white font-semibold py-2 px-4 rounded-lg shadow transition-colors focus:outline-none focus:ring-2 focus:ring-teal-400"
                    >
                        View Skill Details
                    </button>
                </div>

            </div>

            {/* Column 2: Equipment */}
            <div className="lg:col-span-1 space-y-4 p-1 flex flex-col items-center justify-start">
              <EquipmentMannequin character={character} onSlotClick={handleSlotClick} />
            </div>

            {/* Column 3: Inventory */}
            <div className="lg:col-span-1 space-y-4 overflow-y-auto scrollable-content p-1 pr-2">
              <InventoryList inventory={inventory} character={character} onAction={onAction} />
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-gray-700 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-lg shadow transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400"
              aria-label="Close character sheet"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Skill Detail Overlay */}
      {character && (
        <SkillDetailDisplay 
          isOpen={isSkillDetailOverlayOpen}
          onClose={() => setIsSkillDetailOverlayOpen(false)}
          character={character}
          onNavigateToGlossary={onNavigateToGlossary} 
        />
      )}
    </>
  );
};

export default CharacterSheetModal;