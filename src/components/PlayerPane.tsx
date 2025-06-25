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


interface PlayerPaneProps {
  playerCharacter: PlayerCharacter;
  inventory: Item[];
}

const PlayerPane: React.FC<PlayerPaneProps> = ({
  playerCharacter,
  inventory,
}) => {
  const {
    name,
    race,
    class: charClass,
    finalAbilityScores,
    skills, 
    hp,
    maxHp,
    armorClass,
    speed,
    darkvisionRange, // Now directly from PlayerCharacter
    knownCantrips,   // Now directly from PlayerCharacter (fully aggregated)
    knownSpells,     // Now directly from PlayerCharacter (fully aggregated)
    selectedFightingStyle,
    selectedDivineDomain,
    selectedDraconicAncestry,
    selectedElvenLineageId,
    elvenLineageSpellcastingAbility,
    selectedGnomeSubraceId, 
    gnomeSubraceSpellcastingAbility, 
    deepGnomeSpellcastingAbility, 
    selectedGiantAncestryBenefitId, 
    selectedFiendishLegacyId, 
    fiendishLegacySpellcastingAbility, 
    aarakocraSpellcastingAbility,
    airGenasiSpellcastingAbility, 
    selectedCentaurNaturalAffinitySkillId,
    selectedChangelingInstinctSkillIds,
    duergarMagicSpellcastingAbility, // Added Duergar
  } = playerCharacter;

  // Details for display purposes are still looked up here
  const elvenLineageDetails =
    race.id === 'elf' && selectedElvenLineageId
      ? RACES_DATA['elf']?.elvenLineages?.find(
          (l) => l.id === selectedElvenLineageId,
        )
      : null;

  const gnomeSubraceDetails =
    race.id === 'gnome' && selectedGnomeSubraceId
      ? RACES_DATA['gnome']?.gnomeSubraces?.find(
          (sr) => sr.id === selectedGnomeSubraceId,
        )
      : null;
  
  const isDeepGnome = race.id === 'deep_gnome';
  const isDuergar = race.id === 'duergar'; // Added Duergar check

  const giantAncestryBenefitDetails = 
    race.id === 'goliath' && selectedGiantAncestryBenefitId
      ? GIANT_ANCESTRIES.find(b => b.id === selectedGiantAncestryBenefitId)
      : null;

  const fiendishLegacyDetails =
    race.id === 'tiefling' && selectedFiendishLegacyId
      ? TIEFLING_LEGACIES.find(fl => fl.id === selectedFiendishLegacyId)
      : null;
  
  // Spell lists are now used directly
  const displayCantrips = knownCantrips;
  const displaySpells = knownSpells;

  const aarakocraFlightTrait = race.traits.find(trait => trait.toLowerCase().startsWith('flight:'));
  const aarakocraTalonsTrait = race.traits.find(trait => trait.toLowerCase().startsWith('talons:'));
  const aarakocraWindCallerTrait = race.traits.find(trait => trait.toLowerCase().startsWith('wind caller:'));

  const airGenasiUnendingBreathTrait = race.traits.find(trait => trait.toLowerCase().includes('unending breath'));
  const airGenasiLightningResistanceTrait = race.traits.find(trait => trait.toLowerCase().includes('lightning resistance'));
  const airGenasiMingleWithWindTrait = race.traits.find(trait => trait.toLowerCase().includes('mingle with the wind'));

  const bugbearSneakyTrait = race.id === 'bugbear' ? race.traits.find(t => t.toLowerCase().startsWith('sneaky:')) : null;
  const bugbearLongLimbedTrait = race.id === 'bugbear' ? race.traits.find(t => t.toLowerCase().startsWith('long-limbed:')) : null;
  const bugbearPowerfulBuildTrait = race.id === 'bugbear' ? race.traits.find(t => t.toLowerCase().startsWith('powerful build:')) : null;
  const bugbearSurpriseAttackTrait = race.id === 'bugbear' ? race.traits.find(t => t.toLowerCase().startsWith('surprise attack:')) : null;
  const bugbearFeyAncestryTrait = race.id === 'bugbear' ? race.traits.find(t => t.toLowerCase().startsWith('fey ancestry:')) : null;

  const centaurChargeTrait = race.id === 'centaur' ? race.traits.find(t => t.toLowerCase().startsWith('charge:')) : null;
  const centaurEquineBuildTrait = race.id === 'centaur' ? race.traits.find(t => t.toLowerCase().startsWith('equine build:')) : null;
  const centaurHoovesTrait = race.id === 'centaur' ? race.traits.find(t => t.toLowerCase().startsWith('hooves:')) : null;
  
  const changelingShapechangerTrait = race.id === 'changeling' ? race.traits.find(t => t.toLowerCase().startsWith('shapechanger:')) : null;

  const deepGnomeGiftTrait = isDeepGnome ? race.traits.find(t => t.toLowerCase().includes('gift of the svirfneblin')) : null;
  const deepGnomeMagicResistanceTrait = isDeepGnome ? race.traits.find(t => t.toLowerCase().includes('gnomish magic resistance')) : null;
  const deepGnomeCamouflageTrait = isDeepGnome ? race.traits.find(t => t.toLowerCase().includes('svirfneblin camouflage')) : null;

  const duergarMagicTrait = isDuergar ? race.traits.find(t => t.toLowerCase().includes('duergar magic:')) : null;
  const duergarResilienceTrait = isDuergar ? race.traits.find(t => t.toLowerCase().includes('dwarven resilience:')) : null;
  const duergarPsionicFortitudeTrait = isDuergar ? race.traits.find(t => t.toLowerCase().includes('psionic fortitude:')) : null;


  return (
    <div className="md:w-1/3 lg:w-1/4 bg-gray-800 p-6 rounded-lg shadow-xl h-full md:max-h-screen overflow-y-auto scrollable-content border border-gray-700">
      <div className="border-b-2 border-amber-500 pb-3 mb-6">
        <h2 className="text-3xl font-bold text-amber-400 font-cinzel tracking-wide">
          {name}
        </h2>
        <p className="text-sky-300 text-lg">
          {race.name}
          {gnomeSubraceDetails ? ` (${gnomeSubraceDetails.name})` : ''}
          {elvenLineageDetails ? ` (${elvenLineageDetails.name})` : ''}
          {selectedDraconicAncestry
            ? ` (${selectedDraconicAncestry.type} Dragonborn)`
            : ''}
          {fiendishLegacyDetails ? ` (${fiendishLegacyDetails.name})` : ''}
          {' '}
          {charClass.name}
        </p>
      </div>

      <div className="mb-6">
        <h3 className="text-xl font-semibold text-sky-400 mb-2">Vitals</h3>
        <p className="text-gray-300">
          HP: <span className="font-semibold text-green-400">{hp}</span> /{' '}
          {maxHp}
        </p>
        <p className="text-gray-300">
          AC: <span className="font-semibold text-blue-400">{armorClass}</span>
        </p>
        <p className="text-gray-300">
          Speed: <span className="font-semibold text-blue-400">{speed}ft</span>
          {race.id === 'aarakocra' && ` (Fly ${speed}ft)`}
        </p>
        {darkvisionRange > 0 && (
          <p className="text-gray-300 text-sm">
            Darkvision: {darkvisionRange}ft
          </p>
        )}
         {fiendishLegacyDetails && (
            <p className="text-gray-300 text-sm">Resistance: {fiendishLegacyDetails.level1Benefit.resistanceType}</p>
        )}
        {race.id === 'air_genasi' && airGenasiLightningResistanceTrait && (
             <p className="text-gray-300 text-sm">Lightning Resistance</p>
        )}
        {isDuergar && duergarResilienceTrait && (
            <p className="text-gray-300 text-sm">Poison Resistance, Adv. vs Poisoned</p>
        )}
        {(race.id === 'centaur' || race.id === 'changeling') && (
            <p className="text-gray-300 text-sm">Creature Type: Fey</p>
        )}
         {(isDeepGnome || isDuergar) && <p className="text-gray-300 text-sm">Considered a {isDeepGnome ? 'Gnome' : 'Dwarf'}</p>}
      </div>
      
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-sky-400 mb-2">
          Ability Scores
        </h3>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-gray-300">
          {Object.entries(finalAbilityScores).map(([key, value]) => (
            <p key={key}>
              {key.substring(0, 3)}:{' '}
              <span className="font-semibold text-amber-300">{value}</span> (
              {getAbilityModifierString(value)})
            </p>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-xl font-semibold text-sky-400 mb-2">
          Skills Proficiencies
        </h3>
        {skills.length > 0 ? (
          <ul className="list-disc list-inside text-gray-300 text-sm pl-1">
            {skills.map((skill) => (
              <li key={skill.id}>
                {skill.name} ({skill.ability.substring(0, 3)})
                {race.id === 'centaur' && selectedCentaurNaturalAffinitySkillId === skill.id && <span className="text-xs text-yellow-400"> (Natural Affinity)</span>}
                {race.id === 'changeling' && selectedChangelingInstinctSkillIds?.includes(skill.id) && <span className="text-xs text-yellow-400"> (Changeling Instincts)</span>}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 italic text-sm">
            No skill proficiencies.
          </p>
        )}
      </div>

      {/* Racial Features Display */}
      {elvenLineageDetails && (
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-sky-400 mb-1">
            Elven Lineage: {elvenLineageDetails.name}
          </h3>
          {elvenLineageSpellcastingAbility && (
            <p className="text-xs text-gray-400">
              {' '}
              (Spell Ability: {elvenLineageSpellcastingAbility.substring(0, 3)})
            </p>
          )}
          {elvenLineageDetails.benefits
            .filter((b) => b.level === 1)
            .map((benefit) => {
              let benefitText = benefit.description || '';
              if (benefit.cantripId) {
                const cantripName =
                  SPELLS_DATA[benefit.cantripId]?.name || benefit.cantripId;
                benefitText += ` (Gained Cantrip: ${cantripName})`;
              }
              return (
                <p
                  key={`${elvenLineageDetails.id}-${benefit.level}-${
                    benefit.cantripId || benefit.description
                  }`}
                  className="text-gray-300 text-sm"
                >
                  {benefitText}
                </p>
              );
            })}
          <p className="text-xs text-gray-400 mt-1">
            Fey Ancestry, Trance, Keen Senses
          </p>
        </div>
      )}
      {gnomeSubraceDetails && ( 
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-sky-400 mb-1">
            Gnome Subrace: {gnomeSubraceDetails.name}
          </h3>
          {gnomeSubraceSpellcastingAbility &&
            (gnomeSubraceDetails.grantedCantrip ||
              gnomeSubraceDetails.grantedSpell) && (
              <p className="text-xs text-gray-400">
                {' '}
                (Spell Ability:{' '}
                {gnomeSubraceSpellcastingAbility.substring(0, 3)})
              </p>
            )}
          {gnomeSubraceDetails.traits.map((trait) => (
            <p
              key={`${gnomeSubraceDetails.id}-${trait}`}
              className="text-gray-300 text-sm"
              title={trait.length > 50 ? trait : undefined}
            >
              {trait.length > 50 ? trait.substring(0, 47) + '...' : trait}
            </p>
          ))}
          <p className="text-xs text-gray-400 mt-1">
            Gnomish Cunning, Speak with Small Beasts
          </p>
        </div>
      )}
      {isDeepGnome && ( 
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-sky-400 mb-1">Deep Gnome Traits</h3>
            {deepGnomeGiftTrait && (
                 <p className="text-gray-300 text-sm" title={deepGnomeGiftTrait}>
                    Gift of the Svirfneblin
                    {deepGnomeSpellcastingAbility && ` (Spell Ability: ${deepGnomeSpellcastingAbility.substring(0,3)})`}
                 </p>
            )}
            {deepGnomeMagicResistanceTrait && <p className="text-gray-300 text-sm" title={deepGnomeMagicResistanceTrait}>Gnomish Magic Resistance</p>}
            {deepGnomeCamouflageTrait && <p className="text-gray-300 text-sm" title={deepGnomeCamouflageTrait}>Svirfneblin Camouflage</p>}
          </div>
      )}
      {isDuergar && (
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-sky-400 mb-1">Duergar Traits</h3>
            {duergarMagicTrait && (
                 <p className="text-gray-300 text-sm" title={duergarMagicTrait.split(': ')[1] || duergarMagicTrait}>
                    Duergar Magic
                    {duergarMagicSpellcastingAbility && ` (Spell Ability: ${duergarMagicSpellcastingAbility.substring(0,3)})`}
                 </p>
            )}
            {duergarResilienceTrait && <p className="text-gray-300 text-sm" title={duergarResilienceTrait.split(': ')[1] || duergarResilienceTrait}>Dwarven Resilience</p>}
            {duergarPsionicFortitudeTrait && <p className="text-gray-300 text-sm" title={duergarPsionicFortitudeTrait.split(': ')[1] || duergarPsionicFortitudeTrait}>Psionic Fortitude</p>}
          </div>
      )}

      {selectedDraconicAncestry && (
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-sky-400 mb-1">
            Draconic Ancestry
          </h3>
          <p className="text-gray-300 text-sm">
            {selectedDraconicAncestry.type} (
            {selectedDraconicAncestry.damageType} Resistance, Breath Weapon)
          </p>
        </div>
      )}
      {giantAncestryBenefitDetails && (
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-sky-400 mb-1">
            Giant Ancestry Boon
          </h3>
          <p className="text-gray-300 text-sm" title={giantAncestryBenefitDetails.description}>
            {giantAncestryBenefitDetails.name}
          </p>
        </div>
      )}
      {fiendishLegacyDetails && (
        <div className="mb-6">
            <h3 className="text-xl font-semibold text-sky-400 mb-1">Fiendish Legacy: {fiendishLegacyDetails.name}</h3>
            {fiendishLegacySpellcastingAbility && <p className="text-xs text-gray-400">(Spell Ability: {fiendishLegacySpellcastingAbility.substring(0,3)})</p>}
            <p className="text-xs text-gray-400 mt-1">Otherworldly Presence (Thaumaturgy)</p>
        </div>
      )}
      {race.id === 'aarakocra' && (
        <div className="mb-6">
            <h3 className="text-xl font-semibold text-sky-400 mb-1">Aarakocra Traits</h3>
            {aarakocraFlightTrait && <p className="text-gray-300 text-sm" title={aarakocraFlightTrait}>{aarakocraFlightTrait.split(':')[0]}: {aarakocraFlightTrait.split(': ')[1].substring(0,100)}...</p>}
            {aarakocraTalonsTrait && <p className="text-gray-300 text-sm" title={aarakocraTalonsTrait}>{aarakocraTalonsTrait.split(':')[0]}: {aarakocraTalonsTrait.split(': ')[1].substring(0,100)}...</p>}
            {aarakocraWindCallerTrait && aarakocraSpellcastingAbility && (
              <p className="text-gray-300 text-sm" title={aarakocraWindCallerTrait}>
                Wind Caller (Spell Ability: {aarakocraSpellcastingAbility.substring(0,3)})
              </p>
            )}
        </div>
      )}
      {race.id === 'air_genasi' && (
        <div className="mb-6">
            <h3 className="text-xl font-semibold text-sky-400 mb-1">Air Genasi Traits</h3>
            {airGenasiUnendingBreathTrait && <p className="text-gray-300 text-sm" title={airGenasiUnendingBreathTrait}>Unending Breath</p>}
            {airGenasiMingleWithWindTrait && airGenasiSpellcastingAbility && (
              <p className="text-gray-300 text-sm" title={airGenasiMingleWithWindTrait}>
                Mingle with the Wind (Spell Ability: {airGenasiSpellcastingAbility.substring(0,3)})
              </p>
            )}
        </div>
      )}
      {race.id === 'bugbear' && (
        <div className="mb-6">
            <h3 className="text-xl font-semibold text-sky-400 mb-1">Bugbear Traits</h3>
            {bugbearFeyAncestryTrait && <p className="text-gray-300 text-sm" title={bugbearFeyAncestryTrait.split(': ')[1]}>Fey Ancestry</p>}
            {bugbearLongLimbedTrait && <p className="text-gray-300 text-sm" title={bugbearLongLimbedTrait.split(': ')[1]}>Long-Limbed</p>}
            {bugbearPowerfulBuildTrait && <p className="text-gray-300 text-sm" title={bugbearPowerfulBuildTrait.split(': ')[1]}>Powerful Build</p>}
            {bugbearSneakyTrait && <p className="text-gray-300 text-sm" title={bugbearSneakyTrait.split(': ')[1]}>Sneaky (Stealth Proficiency)</p>}
            {bugbearSurpriseAttackTrait && <p className="text-gray-300 text-sm" title={bugbearSurpriseAttackTrait.split(': ')[1]}>Surprise Attack</p>}
        </div>
      )}
      {race.id === 'centaur' && (
        <div className="mb-6">
            <h3 className="text-xl font-semibold text-sky-400 mb-1">Centaur Traits</h3>
            {centaurChargeTrait && <p className="text-gray-300 text-sm" title={centaurChargeTrait.split(': ')[1] || centaurChargeTrait}>Charge</p>}
            {centaurEquineBuildTrait && <p className="text-gray-300 text-sm" title={centaurEquineBuildTrait.split(': ')[1] || centaurEquineBuildTrait}>Equine Build</p>}
            {centaurHoovesTrait && <p className="text-gray-300 text-sm" title={centaurHoovesTrait.split(': ')[1] || centaurHoovesTrait}>Hooves</p>}
        </div>
      )}
      {race.id === 'changeling' && (
        <div className="mb-6">
            <h3 className="text-xl font-semibold text-sky-400 mb-1">Changeling Traits</h3>
            {changelingShapechangerTrait && <p className="text-gray-300 text-sm" title={changelingShapechangerTrait.split(': ')[1] || changelingShapechangerTrait}>Shapechanger</p>}
        </div>
      )}


      {/* Class Features Display */}
      {selectedFightingStyle && (
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-sky-400 mb-1">
            Fighting Style
          </h3>
          <p className="text-gray-300 text-sm">
            {selectedFightingStyle.name}
          </p>
        </div>
      )}
      {selectedDivineDomain && (
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-sky-400 mb-1">
            Divine Domain
          </h3>
          <p className="text-gray-300 text-sm">{selectedDivineDomain.name}</p>
          {selectedDivineDomain.features?.map((feature) => (
            <p
              key={feature.id}
              className="text-xs text-gray-400 ml-2"
              title={feature.description}
            >
              - {feature.name}
            </p>
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
                {displayCantrips.map((spell) => (
                  <li key={spell.id} title={spell.description}>
                    {spell.name}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {displaySpells.length > 0 && (
            <div>
              <h4 className="text-md font-medium text-amber-300">
                Known Spells:
              </h4>
              <ul className="list-disc list-inside text-gray-300 text-sm pl-1">
                {displaySpells.map((spell) => (
                  <li key={spell.id} title={spell.description}>
                    {spell.name} (L{spell.level})
                    {race.id === 'aarakocra' && spell.id === 'gust_of_wind' && <span className="text-xs text-gray-500"> (L3 via Wind Caller)</span>}
                    {race.id === 'air_genasi' && spell.id === 'feather_fall' && <span className="text-xs text-gray-500"> (L3 via Mingle with the Wind)</span>}
                    {race.id === 'air_genasi' && spell.id === 'levitate' && <span className="text-xs text-gray-500"> (L5 via Mingle with the Wind)</span>}
                    {isDeepGnome && spell.id === 'disguise_self' && <span className="text-xs text-gray-500"> (L3 via Gift of the Svirfneblin)</span>}
                    {isDeepGnome && spell.id === 'nondetection' && <span className="text-xs text-gray-500"> (L5 via Gift of the Svirfneblin)</span>}
                    {isDuergar && spell.id === 'enlarge_reduce' && <span className="text-xs text-gray-500"> (L3 via Duergar Magic)</span>}
                    {isDuergar && spell.id === 'invisibility' && <span className="text-xs text-gray-500"> (L5 via Duergar Magic)</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div>
        <h3 className="text-xl font-semibold text-sky-400 mb-3">Inventory</h3>
        {inventory.length > 0 ? (
          <ul className="space-y-2">
            {inventory.map((item) => (
              <li
                key={item.id}
                className="p-3 bg-gray-700 rounded shadow hover:bg-gray-600 transition-colors cursor-pointer group"
                title={item.description}
              >
                <p className="font-semibold text-amber-300">{item.name}</p>
                <p className="text-sm text-gray-400 group-hover:text-gray-300 truncate">
                  {item.description}
                </p>
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
