
/**
 * @file AbilityScoreAllocation.tsx
 * This component allows the player to assign standard array ability scores (e.g., 15, 14, 13, 12, 10, 8)
 * to their character's six abilities (Strength, Dexterity, etc.).
 * It displays the base scores, racial bonuses, and final calculated scores.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { AbilityScores, Race, AbilityScoreName } from '../../types';
import { ABILITY_SCORE_NAMES } from '../../constants';

interface AbilityScoreAllocationProps {
  race: Race;
  standardScores: number[];
  onAbilityScoresSet: (scores: AbilityScores) => void;
  onBack: () => void; // Function to go back to Class Selection
}

/**
 * AbilityScoreAllocation component.
 * Allows assignment of standard D&D ability scores.
 * @param {AbilityScoreAllocationProps} props - Props for the component.
 * @returns {React.FC} The rendered AbilityScoreAllocation component.
 */
const AbilityScoreAllocation: React.FC<AbilityScoreAllocationProps> = ({ race, standardScores, onAbilityScoresSet, onBack }) => {
  // Initialize base scores for all abilities to a default (e.g., 0 or 8)
  const initialScores = ABILITY_SCORE_NAMES.reduce((acc, name) => {
    acc[name] = 0; // Or a sensible default like the lowest standard score if pre-filling logic changes
    return acc;
  }, {} as AbilityScores);

  const [baseScores, setBaseScores] = useState<AbilityScores>(initialScores);
  const [remainingScores, setRemainingScores] = useState<number[]>([...standardScores].sort((a,b) => b-a)); // Scores yet to be assigned
  const [assignedScores, setAssignedScores] = useState<Partial<Record<AbilityScoreName, number>>>({}); // Tracks which score is assigned to which ability

  /**
   * Calculates the final ability score including racial bonuses.
   * @param {AbilityScoreName} abilityName - The name of the ability.
   * @param {number} baseVal - The base score assigned by the player.
   * @returns {number} The final score after applying racial bonus.
   */
  const calculateFinalScore = useCallback((abilityName: AbilityScoreName, baseVal: number): number => {
    const racialBonus = race.abilityBonuses?.find(b => b.ability === abilityName)?.bonus || 0;
    return baseVal + racialBonus;
  }, [race.abilityBonuses]);

  /**
   * Assigns a score from the remaining standard scores to an ability.
   * If the ability already has an assigned score, it's unassigned first.
   * @param {AbilityScoreName} abilityName - The ability to assign the score to.
   * @param {number} scoreValue - The score value to assign.
   */
  const handleAssignScore = (abilityName: AbilityScoreName, scoreValue: number) => {
    // If this ability already has a score, return it to remainingScores
    if (assignedScores[abilityName]) {
        const oldScore = assignedScores[abilityName]!;
        setRemainingScores(prev => [...prev, oldScore].sort((a,b)=>b-a));
    }

    setAssignedScores(prev => ({ ...prev, [abilityName]: scoreValue }));
    setRemainingScores(prev => prev.filter(s => s !== scoreValue).sort((a,b)=>b-a)); // Remove from remaining
    setBaseScores(prev => ({ ...prev, [abilityName]: scoreValue })); // Update the actual base score
  };

  /**
   * Unassigns a score from an ability, returning it to the list of remaining scores.
   * @param {AbilityScoreName} abilityName - The ability to unassign the score from.
   */
  const handleUnassignScore = (abilityName: AbilityScoreName) => {
    const scoreToReturn = assignedScores[abilityName];
    if (scoreToReturn !== undefined) { // Check if a score was actually assigned
      setRemainingScores(prev => [...prev, scoreToReturn].sort((a,b) => b-a)); // Add back to remaining
      setAssignedScores(prev => {
        const newAssigned = { ...prev };
        delete newAssigned[abilityName]; // Remove from assigned
        return newAssigned;
      });
      setBaseScores(prev => ({...prev, [abilityName]: 0})); // Reset the base score for this ability
    }
  };

  // Check if all abilities have been assigned a score
  const allScoresAssigned = ABILITY_SCORE_NAMES.every(name => assignedScores[name] !== undefined);

  /**
   * Submits the allocated base scores if all scores have been assigned.
   */
  const handleSubmit = () => {
    console.log("AbilityScoreAllocation: handleSubmit called.");
    console.log("AbilityScoreAllocation: allScoresAssigned:", allScoresAssigned);
    console.log("AbilityScoreAllocation: baseScores being submitted:", baseScores);
    if (allScoresAssigned) {
      // Ensure all baseScores are numbers, not potentially undefined from initial state issues
      const completeBaseScores = ABILITY_SCORE_NAMES.reduce((acc, name) => {
        acc[name] = baseScores[name] || 0; // Default to 0 if somehow undefined
        return acc;
      }, {} as AbilityScores);
      onAbilityScoresSet(completeBaseScores);
    } else {
      console.log("AbilityScoreAllocation: Scores not all assigned. Cannot submit.");
      // Optionally, provide UI feedback if submission is attempted incorrectly
    }
  };
  
  return (
    <div>
      <h2 className="text-2xl text-sky-300 mb-2 text-center">Allocate Ability Scores</h2>
      <p className="text-sm text-gray-400 mb-4 text-center">Assign the Standard Array scores ({standardScores.join(', ')}) to your abilities. Racial bonuses for {race.name} will be applied if applicable.</p>
      
      <div className="mb-6 p-3 bg-gray-700 rounded">
        <h3 className="text-lg text-amber-300 mb-2">Scores to Assign:</h3>
        <div className="flex flex-wrap gap-2 min-h-[2.5rem]"> {/* Min height to prevent layout shift */}
            {remainingScores.map((score, index) => (
                <span key={`remaining-${score}-${index}`} className="px-3 py-1 bg-sky-600 text-white rounded-full text-sm font-medium">
                    {score}
                </span>
            ))}
            {remainingScores.length === 0 && <p className="text-gray-400 italic">All scores assigned.</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {ABILITY_SCORE_NAMES.map(abilityName => (
          <div key={abilityName} className="p-4 bg-gray-700 rounded-lg">
            <h4 className="text-lg font-semibold text-amber-400">{abilityName}</h4>
            {assignedScores[abilityName] !== undefined ? (
              <>
                <p className="text-gray-300">Base: {assignedScores[abilityName]}</p>
                {/* Only display racial bonus if abilityBonuses exist and a bonus is found for the current ability */}
                {(race.abilityBonuses && race.abilityBonuses.find(b => b.ability === abilityName)) && (
                    <p className="text-gray-400 text-xs">Racial Bonus: +{race.abilityBonuses?.find(b => b.ability === abilityName)?.bonus || 0}</p>
                )}
                <p className="text-xl text-green-400 font-bold mt-1">Final: {calculateFinalScore(abilityName, assignedScores[abilityName]!)}</p>
                <button 
                    onClick={() => handleUnassignScore(abilityName)}
                    className="mt-2 text-xs bg-red-600 hover:bg-red-500 text-white py-1 px-2 rounded"
                    aria-label={`Clear score from ${abilityName}`}
                >
                    Clear
                </button>
              </>
            ) : (
              <div className="mt-2 space-x-1 flex flex-wrap gap-1"> {/* Flex wrap for smaller screens */}
                {remainingScores.map(scoreValue => (
                  <button
                    key={`assign-${abilityName}-${scoreValue}`}
                    onClick={() => handleAssignScore(abilityName, scoreValue)}
                    className="bg-sky-700 hover:bg-sky-600 text-white text-xs py-1 px-2 rounded"
                    aria-label={`Assign ${scoreValue} to ${abilityName}`}
                  >
                    Set {scoreValue}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-4 mt-6">
        <button
            onClick={onBack}
            className="w-1/2 bg-gray-600 hover:bg-gray-500 text-white font-semibold py-2 px-4 rounded-lg shadow transition-colors"
            aria-label="Go back to class selection"
        >
            Back
        </button>
        <button
            onClick={handleSubmit}
            disabled={!allScoresAssigned}
            className="w-1/2 bg-green-600 hover:bg-green-500 disabled:bg-gray-500 text-white font-semibold py-2 px-4 rounded-lg shadow transition-colors"
            aria-label="Confirm ability scores"
        >
            Confirm Scores
        </button>
      </div>
    </div>
  );
};

export default AbilityScoreAllocation;
