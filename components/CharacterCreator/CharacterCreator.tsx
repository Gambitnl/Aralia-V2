/**
 * @file CharacterCreator.tsx
 * This is the main component for the character creation process in Aralia RPG.
 * It guides the user through several steps: Race Selection, Class Selection,
 * Ability Score Allocation, Skill Selection, Class-Specific Feature Selection (e.g., Fighting Style, Divine Domain, Spells),
 * and finally Naming and Reviewing the character.
 * It manages the state for each step and assembles the final PlayerCharacter object.
 */
import React, { useState, useCallback } from 'react';
import { PlayerCharacter, Race, Class as CharClass, AbilityScores, Skill, Spell, FightingStyle, DivineDomain, AbilityScoreName, DraconicAncestryInfo, ElvenLineageType, GnomeSubraceType } from '../../types';
import { RACES_DATA, CLASSES_DATA, STANDARD_ABILITY_SCORES, SKILLS_DATA, ABILITY_SCORE_NAMES, SPELLS_DATA, DRAGONBORN_ANCESTRIES } from '../../constants';
import RaceSelection from './RaceSelection';
import ClassSelection from './ClassSelection';
import AbilityScoreAllocation from './AbilityScoreAllocation';
import SkillSelection from './SkillSelection';
import FighterFeatureSelection from './FighterFeatureSelection';
import ClericFeatureSelection from './ClericFeatureSelection';
import WizardFeatureSelection from './WizardFeatureSelection';
import DragonbornAncestrySelection from '../../src/components/CharacterCreator/DragonbornAncestrySelection';
import ElvenLineageSelection from '../../src/components/CharacterCreator/ElvenLineageSelection';
import GnomeSubraceSelection from './GnomeSubraceSelection';
import NameAndReview from './NameAndReview';

interface CharacterCreatorProps {
  onCharacterCreate: (character: PlayerCharacter) => void;
}

/**
 * Defines the steps in the character creation process.
 */
enum CreationStep {
  Race,
  DragonbornAncestry,
  ElvenLineage,
  GnomeSubrace,
  Class,
  AbilityScores,
  Skills, 
  ClassFeatures,
  NameAndReview,
}

/**
 * Calculates the D&D ability score modifier.
 * @param {number} score - The ability score.
 * @returns {number} The modifier.
 */
const getAbilityModifier = (score: number): number => Math.floor((score - 10) / 2);

// Helper function to calculate darkvision, adapted from the newer CharacterCreator version
const calculateFinalDarkvision = (
    selectedRace: Race | null,
    selectedElvenLineageId?: ElvenLineageType | null,
    selectedGnomeSubraceId?: GnomeSubraceType | null
): number => {
    if (!selectedRace) return 0;

    let finalDarkvisionRange = 0;
    const baseDarkvisionTrait = selectedRace.traits.find(t => t.toLowerCase().includes('darkvision'));
    if (baseDarkvisionTrait) {
        const match = baseDarkvisionTrait.match(/(\d+) ?ft/i);
        if (match && match[1]) finalDarkvisionRange = parseInt(match[1]);
    }

    if (selectedRace.id === 'elf' && selectedElvenLineageId === 'drow') {
        const drowLineage = RACES_DATA['elf']?.elvenLineages?.find(l => l.id === 'drow');
        const drowBenefit = drowLineage?.benefits.find(b => b.level === 1 && b.darkvisionRange);
        if (drowBenefit?.darkvisionRange) finalDarkvisionRange = drowBenefit.darkvisionRange;
    } else if (selectedRace.id === 'gnome' && selectedGnomeSubraceId) { // Standard Gnome subrace
        const gnomeData = RACES_DATA['gnome'];
        const subrace = gnomeData?.gnomeSubraces?.find(sr => sr.id === selectedGnomeSubraceId);
        if (subrace?.superiorDarkvision) finalDarkvisionRange = 120;
    } else if (selectedRace.id === 'deep_gnome' || selectedRace.id === 'duergar') { 
        // Note: This CharacterCreator (the older one) doesn't handle Deep Gnome or Duergar as separate races.
        // This logic is more for completeness if used in a context where these races are selected.
        // For this specific file's current structure, these conditions might not be met.
        const specificDarkvisionTrait = selectedRace.traits.find(t => t.toLowerCase().includes("darkvision: 120 feet") || t.toLowerCase().includes("darkvision within 120 feet"));
        if (specificDarkvisionTrait) finalDarkvisionRange = 120;
    } else if (selectedRace.id === 'orc' || selectedRace.id === 'dwarf') {
        finalDarkvisionRange = Math.max(finalDarkvisionRange, 120); 
    }
    return finalDarkvisionRange;
};


/**
 * CharacterCreator component.
 * Manages the multi-step process of creating a new player character.
 * @param {CharacterCreatorProps} props - Props for the component.
 * @returns {React.FC} The rendered CharacterCreator component.
 */
const CharacterCreator: React.FC<CharacterCreatorProps> = ({ onCharacterCreate }) => {
  const [step, setStep] = useState<CreationStep>(CreationStep.Race);
  const [selectedRace, setSelectedRace] = useState<Race | null>(null);
  const [selectedDraconicAncestry, setSelectedDraconicAncestry] = useState<DraconicAncestryInfo | null>(null);
  const [selectedElvenLineageId, setSelectedElvenLineageId] = useState<ElvenLineageType | null>(null);
  const [elvenLineageSpellcastingAbility, setElvenLineageSpellcastingAbility] = useState<AbilityScoreName | null>(null);
  const [selectedGnomeSubraceId, setSelectedGnomeSubraceId] = useState<GnomeSubraceType | null>(null);
  const [gnomeSubraceSpellcastingAbility, setGnomeSubraceSpellcastingAbility] = useState<AbilityScoreName | null>(null);
  const [selectedClass, setSelectedClass] = useState<CharClass | null>(null);
  const [baseAbilityScores, setBaseAbilityScores] = useState<AbilityScores | null>(null);
  const [finalAbilityScores, setFinalAbilityScores] = useState<AbilityScores | null>(null);
  const [selectedSkills, setSelectedSkills] = useState<Skill[]>([]); 
  const [selectedFightingStyle, setSelectedFightingStyle] = useState<FightingStyle | null>(null);
  const [selectedDivineDomain, setSelectedDivineDomain] = useState<DivineDomain | null>(null);
  const [selectedCantrips, setSelectedCantrips] = useState<Spell[]>([]);
  const [selectedSpellsL1, setSelectedSpellsL1] = useState<Spell[]>([]);
  const [characterName, setCharacterName] = useState<string>('');

  /**
   * Calculates final ability scores by applying racial bonuses to base scores.
   * For races like new Elf or Gnome, there are no direct racial ASIs.
   * @param {AbilityScores} baseScores - The base ability scores assigned by the player.
   * @param {Race} race - The selected player race.
   * @returns {AbilityScores} The final ability scores including racial bonuses.
   */
  const calculateFinalAbilityScores = useCallback((baseScores: AbilityScores, race: Race): AbilityScores => {
    const finalScores: AbilityScores = { ...baseScores };
    if (race.abilityBonuses) {
        race.abilityBonuses.forEach(bonus => {
            finalScores[bonus.ability] = (finalScores[bonus.ability] || 0) + bonus.bonus;
        });
    }
    return finalScores;
  }, []);
  
  /**
   * Handles race selection. Updates state and moves to the next appropriate step.
   * @param {string} raceId - The ID of the selected race.
   */
  const handleRaceSelect = (raceId: string) => {
    const race = RACES_DATA[raceId];
    setSelectedRace(race);
    // Reset downstream selections
    setSelectedDraconicAncestry(null);
    setSelectedElvenLineageId(null);
    setElvenLineageSpellcastingAbility(null);
    setSelectedGnomeSubraceId(null);
    setGnomeSubraceSpellcastingAbility(null);
    setSelectedClass(null);
    setBaseAbilityScores(null);
    setFinalAbilityScores(null);
    setSelectedSkills([]);
    setSelectedFightingStyle(null);
    setSelectedDivineDomain(null);
    setSelectedCantrips([]);
    setSelectedSpellsL1([]);
    setCharacterName('');

    if (race.id === 'dragonborn') {
        setStep(CreationStep.DragonbornAncestry);
    } else if (race.id === 'elf') {
        setStep(CreationStep.ElvenLineage);
    } else if (race.id === 'gnome') {
        setStep(CreationStep.GnomeSubrace);
    } else {
        setStep(CreationStep.Class);
    }
  };

  const handleDragonbornAncestrySelect = (ancestry: DraconicAncestryInfo) => {
    setSelectedDraconicAncestry(ancestry);
    setStep(CreationStep.Class);
  };

  const handleElvenLineageSelect = (lineageId: ElvenLineageType, spellAbility: AbilityScoreName) => {
    setSelectedElvenLineageId(lineageId);
    setElvenLineageSpellcastingAbility(spellAbility);
    setStep(CreationStep.Class);
  };
  
  const handleGnomeSubraceSelect = (subraceId: GnomeSubraceType, spellAbility: AbilityScoreName) => {
    setSelectedGnomeSubraceId(subraceId);
    setGnomeSubraceSpellcastingAbility(spellAbility);
    setStep(CreationStep.Class);
  };

  const handleClassSelect = (classId: string) => {
    setSelectedClass(CLASSES_DATA[classId]);
    setSelectedFightingStyle(null);
    setSelectedDivineDomain(null);
    setSelectedCantrips([]);
    setSelectedSpellsL1([]);
    setStep(CreationStep.AbilityScores);
  };

  const handleAbilityScoresSet = (scores: AbilityScores) => {
    setBaseAbilityScores(scores);
    if (selectedRace) {
      const final = calculateFinalAbilityScores(scores, selectedRace);
      setFinalAbilityScores(final);
    }
    setStep(CreationStep.Skills);
  };
  
  const handleSkillsSelect = (skills: Skill[]) => {
    setSelectedSkills(skills);
    if (selectedClass?.fightingStyles || selectedClass?.divineDomains || selectedClass?.spellcasting) {
        setStep(CreationStep.ClassFeatures);
    } else {
        setStep(CreationStep.NameAndReview);
    }
  };

  const handleFighterFeaturesSelect = (style: FightingStyle) => {
    setSelectedFightingStyle(style);
    setStep(CreationStep.NameAndReview);
  };

  const handleClericFeaturesSelect = (domain: DivineDomain, cantrips: Spell[], spellsL1: Spell[]) => {
    setSelectedDivineDomain(domain);
    setSelectedCantrips(cantrips);
    setSelectedSpellsL1(spellsL1);
    setStep(CreationStep.NameAndReview);
  };

  const handleWizardFeaturesSelect = (cantrips: Spell[], spellsL1: Spell[]) => {
    setSelectedCantrips(cantrips);
    setSelectedSpellsL1(spellsL1);
    setStep(CreationStep.NameAndReview);
  };

  const handleNameAndReviewSubmit = (name: string) => {
    setCharacterName(name); 
    if (
        selectedRace && 
        selectedClass && 
        finalAbilityScores && 
        baseAbilityScores &&
        (selectedRace.id !== 'dragonborn' || selectedDraconicAncestry) &&
        (selectedRace.id !== 'elf' || (selectedElvenLineageId && elvenLineageSpellcastingAbility)) &&
        (selectedRace.id !== 'gnome' || (selectedGnomeSubraceId && gnomeSubraceSpellcastingAbility))
    ) {
      const conModifier = getAbilityModifier(finalAbilityScores.Constitution);
      let maxHp = selectedClass.hitDie + conModifier;
      let characterSpeed = selectedRace.traits.find(t => t.toLowerCase().startsWith('speed:'))?.split(' ')[1] ? parseInt(selectedRace.traits.find(t => t.toLowerCase().startsWith('speed:'))!.split(' ')[1]) : 30;
      
      if (selectedRace.id === 'dwarf') { 
        maxHp += 1; 
      }

      let finalKnownCantrips = [...selectedCantrips];
      let finalKnownSpells = [...selectedSpellsL1]; // For L1+ spells

      // Add Elf lineage benefits
      if (selectedRace.id === 'elf' && selectedElvenLineageId) {
        const lineage = selectedRace.elvenLineages?.find(l => l.id === selectedElvenLineageId);
        if (lineage) {
            const lvl1Benefit = lineage.benefits.find(b => b.level === 1);
            if (lvl1Benefit?.cantripId) {
                const cantrip = SPELLS_DATA[lvl1Benefit.cantripId];
                if (cantrip && !finalKnownCantrips.some(c => c.id === cantrip.id)) {
                    finalKnownCantrips.push(cantrip);
                }
            }
            if (lvl1Benefit?.speedIncrease) {
                characterSpeed += lvl1Benefit.speedIncrease;
            }
        }
      } else if (selectedRace.id === 'aasimar') { 
        const lightCantrip = SPELLS_DATA['light'];
        if (lightCantrip && !finalKnownCantrips.some(spell => spell.id === 'light')) {
          finalKnownCantrips.push(lightCantrip);
        }
      } else if (selectedRace.id === 'gnome' && selectedGnomeSubraceId) {
        const subrace = selectedRace.gnomeSubraces?.find(sr => sr.id === selectedGnomeSubraceId);
        if (subrace?.grantedCantrip) {
            const cantrip = SPELLS_DATA[subrace.grantedCantrip.id];
            if (cantrip && !finalKnownCantrips.some(c => c.id === cantrip.id)) {
                finalKnownCantrips.push(cantrip);
            }
        }
        if (subrace?.grantedSpell) {
            const spell = SPELLS_DATA[subrace.grantedSpell.id];
            // Note: Current knownSpells is for L1. This assumes grantedSpell might be higher level.
            // For simplicity, adding to knownSpells if it's L1. Higher level racial spells are noted but not mechanically distinct in spell slot usage yet.
            if (spell && !finalKnownSpells.some(s => s.id === spell.id)) { 
                finalKnownSpells.push(spell); // Add all racial spells regardless of level for tracking
            }
        }
      }
      
      const finalDarkvision = calculateFinalDarkvision(selectedRace, selectedElvenLineageId, selectedGnomeSubraceId);

      const playerCharacter: PlayerCharacter = {
        name,
        race: selectedRace,
        class: selectedClass,
        abilityScores: baseAbilityScores,
        finalAbilityScores,
        skills: selectedSkills, 
        hp: maxHp,
        maxHp,
        armorClass: 10 + getAbilityModifier(finalAbilityScores.Dexterity), 
        speed: characterSpeed,
        darkvisionRange: finalDarkvision,
        equippedItems: {},
        selectedFightingStyle: selectedFightingStyle || undefined,
        selectedDivineDomain: selectedDivineDomain || undefined,
        selectedDraconicAncestry: selectedDraconicAncestry || undefined,
        selectedElvenLineageId: selectedElvenLineageId || undefined,
        elvenLineageSpellcastingAbility: elvenLineageSpellcastingAbility || undefined,
        selectedGnomeSubraceId: selectedGnomeSubraceId || undefined,
        gnomeSubraceSpellcastingAbility: gnomeSubraceSpellcastingAbility || undefined,
        knownCantrips: finalKnownCantrips,
        knownSpells: finalKnownSpells,
        // Adding other optional fields to satisfy PlayerCharacter, even if not fully handled by this old CC version
        deepGnomeSpellcastingAbility: undefined,
        selectedGiantAncestryBenefitId: undefined,
        selectedFiendishLegacyId: undefined,
        fiendishLegacySpellcastingAbility: undefined,
        aarakocraSpellcastingAbility: undefined,
        airGenasiSpellcastingAbility: undefined,
        selectedCentaurNaturalAffinitySkillId: undefined,
        selectedChangelingInstinctSkillIds: undefined,
        duergarMagicSpellcastingAbility: undefined,
      };
      onCharacterCreate(playerCharacter);
    } else {
      console.error("Missing critical character data for final assembly.", {selectedRace, selectedClass, finalAbilityScores, baseAbilityScores, selectedDraconicAncestry, selectedElvenLineageId, elvenLineageSpellcastingAbility, selectedGnomeSubraceId, gnomeSubraceSpellcastingAbility});
      setStep(CreationStep.Race); 
    }
  };
  
  const goBack = () => {
    if (step === CreationStep.NameAndReview) {
        if (selectedClass?.fightingStyles || selectedClass?.divineDomains || selectedClass?.spellcasting) {
            setStep(CreationStep.ClassFeatures);
        } else {
            setStep(CreationStep.Skills);
        }
    } else if (step === CreationStep.ClassFeatures) {
        setStep(CreationStep.Skills);
        setSelectedFightingStyle(null);
        setSelectedDivineDomain(null);
        setSelectedCantrips([]);
        setSelectedSpellsL1([]);
    } else if (step === CreationStep.Skills) {
        setStep(CreationStep.AbilityScores);
        setSelectedSkills([]);
    } else if (step === CreationStep.AbilityScores) {
        setStep(CreationStep.Class);
        setBaseAbilityScores(null);
        setFinalAbilityScores(null);
    } else if (step === CreationStep.Class) {
        if (selectedRace?.id === 'elf') {
            setStep(CreationStep.ElvenLineage);
        } else if (selectedRace?.id === 'dragonborn') {
            setStep(CreationStep.DragonbornAncestry);
        } else if (selectedRace?.id === 'gnome') {
            setStep(CreationStep.GnomeSubrace);
        } else {
            setStep(CreationStep.Race);
        }
        setSelectedClass(null);
    } else if (step === CreationStep.GnomeSubrace) {
        setStep(CreationStep.Race);
        setSelectedGnomeSubraceId(null);
        setGnomeSubraceSpellcastingAbility(null);
    } else if (step === CreationStep.ElvenLineage) {
        setStep(CreationStep.Race);
        setSelectedElvenLineageId(null);
        setElvenLineageSpellcastingAbility(null);
    } else if (step === CreationStep.DragonbornAncestry) {
        setStep(CreationStep.Race);
        setSelectedDraconicAncestry(null);
    }
  };

  const renderStep = (): JSX.Element | null => {
    switch (step) {
      case CreationStep.Race:
        return <RaceSelection races={Object.values(RACES_DATA)} onRaceSelect={handleRaceSelect} />;
      case CreationStep.DragonbornAncestry:
        return <DragonbornAncestrySelection 
                    onAncestrySelect={handleDragonbornAncestrySelect} 
                    onBack={() => {setSelectedDraconicAncestry(null); setStep(CreationStep.Race);}} 
                />;
      case CreationStep.ElvenLineage:
        if (!selectedRace || !selectedRace.elvenLineages) {
            console.error("Elf race not selected or lineages missing. Reverting.");
            setStep(CreationStep.Race);
            return <p className="text-red-400">Error: Elf Race data error. Returning to Race Selection.</p>;
        }
        return <ElvenLineageSelection 
                    lineages={selectedRace.elvenLineages}
                    onLineageSelect={handleElvenLineageSelect}
                    onBack={() => {setSelectedElvenLineageId(null); setElvenLineageSpellcastingAbility(null); setStep(CreationStep.Race);}}
                />;
      case CreationStep.GnomeSubrace:
        if (!selectedRace || !selectedRace.gnomeSubraces) {
            console.error("Gnome race not selected or subraces missing. Reverting.");
            setStep(CreationStep.Race);
            return <p className="text-red-400">Error: Gnome Race data error. Returning to Race Selection.</p>;
        }
        return <GnomeSubraceSelection
                    subraces={selectedRace.gnomeSubraces}
                    onSubraceSelect={handleGnomeSubraceSelect}
                    onBack={() => {setSelectedGnomeSubraceId(null); setGnomeSubraceSpellcastingAbility(null); setStep(CreationStep.Race);}}
                />;
      case CreationStep.Class:
        return <ClassSelection classes={Object.values(CLASSES_DATA)} onClassSelect={handleClassSelect} onBack={goBack} />;
      case CreationStep.AbilityScores:
        if (!selectedRace) { 
            console.error("Race not selected before ability scores step. Reverting to Race Selection.");
            setStep(CreationStep.Race); 
            return <p className="text-red-400">Error: Race not selected. Returning to Race Selection.</p>;
        }
        return <AbilityScoreAllocation race={selectedRace} standardScores={STANDARD_ABILITY_SCORES} onAbilityScoresSet={handleAbilityScoresSet} onBack={goBack} />;
      case CreationStep.Skills:
        if (!selectedClass || !finalAbilityScores || !selectedRace) { 
            console.error("Class, final ability scores, or race not set before skills step. Reverting.");
            setStep(CreationStep.AbilityScores);
            return <p className="text-red-400">Error: Class, scores, or race not set. Returning.</p>;
        }
        return <SkillSelection 
                  charClass={selectedClass} 
                  abilityScores={finalAbilityScores} 
                  race={selectedRace} 
                  onSkillsSelect={handleSkillsSelect} 
                  onBack={goBack} 
                />;
      case CreationStep.ClassFeatures:
        if (!selectedClass || !finalAbilityScores) {
            console.error("Class or scores not set for features step. Reverting.");
            setStep(CreationStep.Skills);
            return <p className="text-red-400">Error: Class or scores not set for features. Returning.</p>;
        }
        if (selectedClass.id === 'fighter' && selectedClass.fightingStyles) {
          return <FighterFeatureSelection styles={selectedClass.fightingStyles} onStyleSelect={handleFighterFeaturesSelect} onBack={goBack} />;
        }
        if (selectedClass.id === 'cleric' && selectedClass.divineDomains && selectedClass.spellcasting) {
          return <ClericFeatureSelection 
            domains={selectedClass.divineDomains} 
            spellcastingInfo={selectedClass.spellcasting} 
            allSpells={SPELLS_DATA}
            onClericFeaturesSelect={handleClericFeaturesSelect} 
            onBack={goBack} 
          />;
        }
        if (selectedClass.id === 'wizard' && selectedClass.spellcasting) {
          return <WizardFeatureSelection 
            spellcastingInfo={selectedClass.spellcasting}
            allSpells={SPELLS_DATA}
            onWizardFeaturesSelect={handleWizardFeaturesSelect} 
            onBack={goBack}
           />;
        }
        setStep(CreationStep.NameAndReview);
        return null; 
      case CreationStep.NameAndReview:
        if (!selectedRace || !selectedClass || !finalAbilityScores || !baseAbilityScores || 
            (selectedRace.id === 'dragonborn' && !selectedDraconicAncestry) ||
            (selectedRace.id === 'elf' && (!selectedElvenLineageId || !elvenLineageSpellcastingAbility)) ||
            (selectedRace.id === 'gnome' && (!selectedGnomeSubraceId || !gnomeSubraceSpellcastingAbility))
        ) {
            console.error("Missing critical data for review step. Reverting to Race Selection.", {selectedRace, selectedClass, finalAbilityScores, baseAbilityScores, selectedDraconicAncestry, selectedElvenLineageId, selectedGnomeSubraceId});
            setStep(CreationStep.Race); 
            return <p className="text-red-400">Error: Missing critical character data. Returning to start.</p>;
        }
        
        let previewMaxHp = selectedClass.hitDie + getAbilityModifier(finalAbilityScores.Constitution) + (selectedRace.id === 'dwarf' ? 1 : 0);
        let previewSpeed = selectedRace.traits.find(t => t.toLowerCase().startsWith('speed:'))?.split(' ')[1] ? parseInt(selectedRace.traits.find(t => t.toLowerCase().startsWith('speed:'))!.split(' ')[1]) : 30;
        let previewKnownCantrips = [...selectedCantrips];
        let previewKnownSpells = [...selectedSpellsL1];


        if (selectedRace.id === 'elf' && selectedElvenLineageId) {
            const lineage = selectedRace.elvenLineages?.find(l => l.id === selectedElvenLineageId);
            const lvl1Benefit = lineage?.benefits.find(b => b.level === 1);
            if (lvl1Benefit?.speedIncrease) previewSpeed += lvl1Benefit.speedIncrease;
            if (lvl1Benefit?.cantripId) {
                const cantrip = SPELLS_DATA[lvl1Benefit.cantripId];
                if (cantrip && !previewKnownCantrips.some(c => c.id === cantrip.id)) {
                    previewKnownCantrips.push(cantrip);
                }
            }
        } else if (selectedRace.id === 'aasimar') {
            const lightCantrip = SPELLS_DATA['light'];
            if (lightCantrip && !previewKnownCantrips.some(spell => spell.id === 'light')) {
                previewKnownCantrips.push(lightCantrip);
            }
        } else if (selectedRace.id === 'gnome' && selectedGnomeSubraceId) {
            const subrace = selectedRace.gnomeSubraces?.find(sr => sr.id === selectedGnomeSubraceId);
            if (subrace?.grantedCantrip) {
                const cantrip = SPELLS_DATA[subrace.grantedCantrip.id];
                if (cantrip && !previewKnownCantrips.some(c => c.id === cantrip.id)) {
                    previewKnownCantrips.push(cantrip);
                }
            }
            if (subrace?.grantedSpell) {
                const spell = SPELLS_DATA[subrace.grantedSpell.id];
                 if (spell && !previewKnownSpells.some(s => s.id === spell.id)) {
                    previewKnownSpells.push(spell);
                }
            }
        }
        
        const previewDarkvision = calculateFinalDarkvision(selectedRace, selectedElvenLineageId, selectedGnomeSubraceId);

        const tempCharForReview: PlayerCharacter = {
            name: characterName || "Adventurer", 
            race: selectedRace,
            class: selectedClass,
            abilityScores: baseAbilityScores, 
            finalAbilityScores: finalAbilityScores, 
            skills: selectedSkills,
            hp: previewMaxHp,
            maxHp: previewMaxHp,
            armorClass: 10 + getAbilityModifier(finalAbilityScores.Dexterity),
            speed: previewSpeed,
            darkvisionRange: previewDarkvision,
            equippedItems: {},
            selectedFightingStyle: selectedFightingStyle || undefined,
            selectedDivineDomain: selectedDivineDomain || undefined,
            selectedDraconicAncestry: selectedDraconicAncestry || undefined,
            selectedElvenLineageId: selectedElvenLineageId || undefined,
            elvenLineageSpellcastingAbility: elvenLineageSpellcastingAbility || undefined,
            selectedGnomeSubraceId: selectedGnomeSubraceId || undefined,
            gnomeSubraceSpellcastingAbility: gnomeSubraceSpellcastingAbility || undefined,
            knownCantrips: previewKnownCantrips,
            knownSpells: previewKnownSpells,
            deepGnomeSpellcastingAbility: undefined,
            selectedGiantAncestryBenefitId: undefined,
            selectedFiendishLegacyId: undefined,
            fiendishLegacySpellcastingAbility: undefined,
            aarakocraSpellcastingAbility: undefined,
            airGenasiSpellcastingAbility: undefined,
            selectedCentaurNaturalAffinitySkillId: undefined,
            selectedChangelingInstinctSkillIds: undefined,
            duergarMagicSpellcastingAbility: undefined,
        };
        
        return <NameAndReview 
            characterPreview={tempCharForReview} 
            onConfirm={handleNameAndReviewSubmit} 
            initialName={characterName}
            onBack={goBack} 
        />;
      default:
        return <p>Unknown character creation step.</p>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 p-4 flex flex-col items-center justify-center">
      <div className="bg-gray-800 p-6 md:p-10 rounded-xl shadow-2xl border border-gray-700 w-full max-w-2xl">
        <h1 className="text-3xl md:text-4xl font-bold text-amber-400 mb-8 text-center font-cinzel">Create Your Adventurer</h1>
        {renderStep()}
      </div>
    </div>
  );
};

export default CharacterCreator;
