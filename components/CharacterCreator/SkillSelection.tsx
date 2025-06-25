/**
 * @file SkillSelection.tsx
 * This component allows the player to select a number of skill proficiencies
 * for their character from a list available to their chosen class.
 * For Elves, it also handles the "Keen Senses" skill choice.
 */
import React, { useState, useEffect } from 'react';
import { Class as CharClass, Skill, AbilityScores, Race } from '../../types'; // Aliasing 'Class'
import { SKILLS_DATA } from '../../constants';

interface SkillSelectionProps {
  charClass: CharClass;
  abilityScores: AbilityScores; // Final scores (base + racial) to calculate modifiers
  race: Race; // Added race to handle Keen Senses for Elves
  onSkillsSelect: (skills: Skill[]) => void;
  onBack: () => void; // Function to go back to Ability Score Allocation
}

const KEEN_SENSES_SKILL_IDS = ['insight', 'perception', 'survival'];

/**
 * SkillSelection component.
 * Allows player to choose skill proficiencies based on their class and race (for Keen Senses).
 * @param {SkillSelectionProps} props - Props for the component.
 * @returns {React.FC} The rendered SkillSelection component.
 */
const SkillSelection: React.FC<SkillSelectionProps> = ({ charClass, abilityScores, race, onSkillsSelect, onBack }) => {
  const [selectedClassSkillIds, setSelectedClassSkillIds] = useState<Set<string>>(new Set());
  const [selectedKeenSensesSkillId, setSelectedKeenSensesSkillId] = useState<string | null>(null);
  
  const availableSkillsFromClass = charClass.skillProficienciesAvailable
    .map(id => SKILLS_DATA[id])
    .filter(skill => skill); // Ensure skill exists

  const keenSensesOptions = KEEN_SENSES_SKILL_IDS.map(id => SKILLS_DATA[id]).filter(skill => skill);

  /**
   * Calculates the ability modifier for a given score.
   * @param {number} score - The ability score.
   * @returns {number} The modifier.
   */
  const getAbilityModifier = (score: number): number => Math.floor((score - 10) / 2);

  /**
   * Toggles the selection of a class skill.
   * Prevents selecting more skills than allowed by the character's class.
   * @param {string} skillId - The ID of the skill to toggle.
   */
  const handleClassSkillToggle = (skillId: string) => {
    setSelectedClassSkillIds(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(skillId)) {
        newSelected.delete(skillId); // Deselect if already selected
      } else {
        // Select if not already selected and limit not reached
        if (newSelected.size < charClass.numberOfSkillProficiencies) {
          newSelected.add(skillId);
        }
      }
      return newSelected;
    });
  };

  /**
   * Handles the selection of a Keen Senses skill for Elves.
   * @param {string} skillId - The ID of the selected Keen Senses skill.
   */
  const handleKeenSensesSelect = (skillId: string) => {
    setSelectedKeenSensesSkillId(skillId);
  };

  /**
   * Submits the selected skills if the correct number has been chosen for class skills
   * and Keen Senses (if applicable).
   */
  const handleSubmit = () => {
    let allSelectedSkills: Skill[] = Array.from(selectedClassSkillIds).map(id => SKILLS_DATA[id]);
    
    if (race.id === 'elf' && selectedKeenSensesSkillId) {
      const keenSensesSkill = SKILLS_DATA[selectedKeenSensesSkillId];
      if (keenSensesSkill && !allSelectedSkills.some(s => s.id === keenSensesSkill.id)) { // Avoid duplicates if class also offered it
        allSelectedSkills.push(keenSensesSkill);
      }
    }
    
    // Validate number of class skills
    if (selectedClassSkillIds.size !== charClass.numberOfSkillProficiencies) {
        // console.error("Incorrect number of class skills selected.");
        return; // Or show UI error
    }
    // Validate Keen Senses selection if Elf
    if (race.id === 'elf' && !selectedKeenSensesSkillId) {
        // console.error("Keen Senses skill not selected for Elf.");
        return; // Or show UI error
    }

    onSkillsSelect(allSelectedSkills);
  };
  
  const isSubmitDisabled = selectedClassSkillIds.size !== charClass.numberOfSkillProficiencies || (race.id === 'elf' && !selectedKeenSensesSkillId);

  return (
    <div>
      <h2 className="text-2xl text-sky-300 mb-2 text-center">Select Skills</h2>
      <p className="text-sm text-gray-400 mb-6 text-center">
        As a {charClass.name}, you can choose {charClass.numberOfSkillProficiencies} skill proficiencies from the list below.
      </p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {availableSkillsFromClass.map(skill => (
          <label key={skill.id} className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${selectedClassSkillIds.has(skill.id) ? 'bg-sky-600 ring-2 ring-sky-400' : 'bg-gray-700 hover:bg-gray-600'}`}>
            <input
              type="checkbox"
              checked={selectedClassSkillIds.has(skill.id)}
              onChange={() => handleClassSkillToggle(skill.id)}
              disabled={!selectedClassSkillIds.has(skill.id) && selectedClassSkillIds.size >= charClass.numberOfSkillProficiencies}
              className="form-checkbox h-5 w-5 text-sky-500 bg-gray-800 border-gray-600 rounded focus:ring-sky-500 mr-3"
              aria-label={`Select class skill ${skill.name}`}
            />
            <span className="text-gray-200">
              {skill.name} <span className="text-xs text-gray-400">({skill.ability.substring(0,3)})</span>
              <span className="ml-1 text-xs text-green-400">(Mod: {getAbilityModifier(abilityScores[skill.ability]) >=0 ? '+':''}{getAbilityModifier(abilityScores[skill.ability])})</span>
            </span>
          </label>
        ))}
      </div>
      <p className="text-sm text-gray-400 mb-4 text-center">Class Skills Selected: {selectedClassSkillIds.size} / {charClass.numberOfSkillProficiencies}</p>

      {/* Keen Senses Selection for Elves */}
      {race.id === 'elf' && (
        <div className="my-6 p-4 border border-amber-500 rounded-lg bg-gray-700/30">
          <h3 className="text-lg text-amber-300 mb-3">Keen Senses (Elf Racial Trait)</h3>
          <p className="text-sm text-gray-400 mb-3">Choose one skill proficiency:</p>
          <div className="space-y-2">
            {keenSensesOptions.map(skill => (
              <label key={`keen-${skill.id}`} className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${selectedKeenSensesSkillId === skill.id ? 'bg-amber-600 ring-2 ring-amber-400' : 'bg-gray-700 hover:bg-gray-600'}`}>
                <input
                  type="radio"
                  name="keenSensesSkill"
                  checked={selectedKeenSensesSkillId === skill.id}
                  onChange={() => handleKeenSensesSelect(skill.id)}
                  className="form-radio h-4 w-4 text-amber-500 bg-gray-800 border-gray-600 focus:ring-amber-500 mr-3"
                  aria-label={`Select Keen Senses skill ${skill.name}`}
                />
                <span className="text-gray-200">
                  {skill.name} <span className="text-xs text-gray-400">({skill.ability.substring(0,3)})</span>
                  <span className="ml-1 text-xs text-green-400">(Mod: {getAbilityModifier(abilityScores[skill.ability]) >=0 ? '+':''}{getAbilityModifier(abilityScores[skill.ability])})</span>
                </span>
              </label>
            ))}
          </div>
          {selectedKeenSensesSkillId && <p className="text-xs text-gray-400 mt-2">Selected: {SKILLS_DATA[selectedKeenSensesSkillId]?.name}</p>}
        </div>
      )}


      <div className="flex gap-4 mt-6">
        <button
            onClick={onBack}
            className="w-1/2 bg-gray-600 hover:bg-gray-500 text-white font-semibold py-2 px-4 rounded-lg shadow transition-colors"
            aria-label="Go back to ability score allocation"
        >
            Back
        </button>
        <button
            onClick={handleSubmit}
            disabled={isSubmitDisabled}
            className="w-1/2 bg-green-600 hover:bg-green-500 disabled:bg-gray-500 text-white font-semibold py-2 px-4 rounded-lg shadow transition-colors"
            aria-label="Confirm selected skills"
        >
            Confirm Skills
        </button>
      </div>
    </div>
  );
};

export default SkillSelection;