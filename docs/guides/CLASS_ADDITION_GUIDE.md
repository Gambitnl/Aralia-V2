
# Guide: Adding a New Character Class to Aralia RPG

This guide outlines the steps to add a new character class (e.g., "Sorcerer," "Warlock," "Paladin") to the character creation process in Aralia RPG.

## 1. Define Class Data

*   **File**: `src/data/classes/index.ts`
*   **Action**: Add a new entry for your class within the `CLASSES_DATA` object.
    *   Define its `id`, `name`, `description`, `hitDie`, `primaryAbility`, `savingThrowProficiencies`.
    *   Specify `skillProficienciesAvailable` (list of skill IDs) and `numberOfSkillProficiencies`.
    *   List `armorProficiencies` and `weaponProficiencies`.
    *   Define any level 1 `features` (using the `ClassFeature` type).
    *   **Spellcasting**: If it's a spellcasting class:
        *   Add a `spellcasting` object with `ability`, `knownCantrips`, `knownSpellsL1`, and a `spellList` (array of spell IDs from `src/data/spells/index.ts`).
    *   **Class-Specific Choices**: If the class has unique choices at level 1 (like a Fighter's Fighting Style or a Cleric's Divine Domain):
        *   Define the data for these choices (e.g., new `SorcererBloodline[]` array) within this file or import from a new data file.
        *   Add a corresponding optional property to the `Class` type in `src/types.ts` (e.g., `sorcererBloodlines?: SorcererBloodline[];`).
        *   Populate this property in your new class definition in `CLASSES_DATA`.
    *   **Stat Recommendations**:
        *   Add `statRecommendationFocus: AbilityScoreName[]` (e.g., `['Charisma', 'Constitution']`).
        *   Add `statRecommendationDetails: string` (e.g., "Charisma is key for spellcasting, Constitution for survivability.").
        *   Add `recommendedPointBuyPriorities: AbilityScoreName[]` (e.g. `['Charisma', 'Constitution', 'Dexterity', 'Wisdom', 'Intelligence', 'Strength']`) for the Point Buy recommender.

    **Example Snippet (Illustrative for a new "Sorcerer" class):**
    ```typescript
    // In src/data/classes/index.ts

    // (If Sorcerers have unique 'Bloodline' choices)
    // const SORCERER_BLOODLINES_DATA: SorcererBloodline[] = [ /* ... define bloodlines ... */ ];
    const SORCERER_SPELL_LIST = ['fire_bolt', 'mage_hand', /* ... other sorcerer spells ... */ ];

    export const CLASSES_DATA: Record<string, CharClass> = {
      // ... existing classes ...
      'sorcerer': {
        id: 'sorcerer',
        name: 'Sorcerer',
        description: 'An innate spellcaster drawing power from a magical bloodline or event.',
        hitDie: 6,
        primaryAbility: ['Charisma'],
        savingThrowProficiencies: ['Constitution', 'Charisma'],
        skillProficienciesAvailable: ['arcana', 'deception', 'insight', 'intimidation', 'persuasion', 'religion'],
        numberOfSkillProficiencies: 2,
        armorProficiencies: [], // Example: No armor proficiency
        weaponProficiencies: ['Daggers', 'Slings', 'Quarterstaffs'],
        features: [{ id: 'font_of_magic', name: 'Font of Magic', description: 'Harnesses sorcery points.', levelAvailable: 1 }],
        // sorcererBloodlines: SORCERER_BLOODLINES_DATA, // If applicable
        spellcasting: {
          ability: 'Charisma',
          knownCantrips: 4,
          knownSpellsL1: 2,
          spellList: SORCERER_SPELL_LIST,
        },
        statRecommendationFocus: ['Charisma', 'Constitution'],
        statRecommendationDetails: "Charisma fuels your spells. Constitution helps you survive.",
        recommendedPointBuyPriorities: ['Charisma', 'Constitution', 'Dexterity', 'Wisdom', 'Intelligence', 'Strength'],
      },
    };
    ```

## 2. Update Type Definitions

*   **File**: `src/types.ts`
*   **Actions**:
    *   If your new class has unique selectable features (e.g., "Sorcerer Bloodlines," "Warlock Pacts"), define new interfaces for these types (e.g., `interface SorcererBloodline { id: string; name: string; description: string; features: ClassFeature[]; }`).
    *   Add these new optional properties to the `Class` interface (e.g., `sorcererBloodlines?: SorcererBloodline[];`).
    *   Add corresponding optional properties to the `PlayerCharacter` interface to store the player's selection for the new class (e.g., `selectedSorcererBloodline?: SorcererBloodline;`).

## 3. Update Character Creator State (`src/components/CharacterCreator/state/characterCreatorState.ts`)

*   **File**: `src/components/CharacterCreator/state/characterCreatorState.ts`
*   **Actions**:
    *   **`CreationStep` Enum**: If your new class requires a dedicated selection screen for its unique features (e.g., choosing a Sorcerer Bloodline), add a new step to the `CreationStep` enum (e.g., `SorcererBloodlineSelection`).
    *   **`CharacterCreationState` Interface**: Add new fields to store the selections specific to your new class (e.g., `selectedSorcererBloodline: SorcererBloodline | null;`).
    *   **`initialCharacterCreatorState`**: Initialize these new fields to `null` or their appropriate default values.
    *   **`CharacterCreatorAction` Type**:
        *   If you added a new selection step, define a new action type for making that selection (e.g., `{ type: 'SELECT_SORCERER_BLOODLINE'; payload: SorcererBloodline }`).
        *   Add this new action type to the `ClassFeatureFinalSelectionAction` union type (or a similar specific union if it's not strictly a "feature" but a core choice like `RaceSpecificFinalSelectionAction`).
    *   **`characterCreatorReducer` Function**:
        *   **Handle Class Selection**: When `SELECT_CLASS` is dispatched and the payload is your new class, ensure any specific state for *other* classes is reset.
        *   **Handle New Feature Selection**: Add a case for your new action type (e.g., `SELECT_SORCERER_BLOODLINE`) to update the state with the player's choice and transition to the next appropriate step (usually `CreationStep.NameAndReview` or another feature step if applicable).
        *   **Update `GO_BACK` Logic**:
            *   In `getFieldsToResetOnGoBack`, add a case for your new selection step (if any) to reset its specific state fields when navigating back from it. Also ensure that if the user navigates back *from* a later step *to* a point before your class-specific choice, the new class-specific state is reset.
            *   In `stepDefinitions`, update the `previousStep` logic for `CreationStep.NameAndReview` (or the step just before it) to correctly point to your new class feature selection step if it's the last one before review. If your class feature selection comes before other standard steps (like skills), ensure the step *after* your feature selection correctly points back to it.
        *   **Update `handleClassFeatureFinalSelectionAction` or `handleRaceSpecificFinalSelectionAction`**: Add a case for your new class's specific selection action if it follows one of these patterns for final selections. If it's a new type of final selection, you might need to adjust the reducer structure.

## 4. Create Class-Specific Feature Selection UI Component (If Needed)

*   **Directory**: `src/components/CharacterCreator/Class/` (or `src/components/CharacterCreator/Race/` if it's more like a racial sub-choice tied to the class somehow, though unlikely for a class feature).
*   **Action**: If your class has unique choices (e.g., Sorcerer Bloodlines, Warlock Pacts), create a new React component (e.g., `SorcererFeatureSelection.tsx`).
    *   This component will receive props like available choices (e.g., `bloodlines: SorcererBloodline[]`), potentially spellcasting info (`spellcastingInfo: CharClass['spellcasting']`), and an `onSelect` callback.
    *   The `onSelect` callback should dispatch the new action type you defined in `characterCreatorState.ts` (e.g., `dispatch({ type: 'SELECT_SORCERER_BLOODLINE', payload: chosenBloodline });`).
    *   Include "Back" and "Confirm" buttons.
    *   Refer to `FighterFeatureSelection.tsx`, `ClericFeatureSelection.tsx`, or race-specific selection components like `ElfLineageSelection.tsx` for examples.
*   **README**: Create a `[NewClassName]FeatureSelection.README.md` file documenting its props and functionality.

## 5. Update Main Character Creator Component (`src/components/CharacterCreator/CharacterCreator.tsx`)

*   **File**: `src/components/CharacterCreator/CharacterCreator.tsx`
*   **Actions**:
    *   **Import**: Import your new feature selection component if you created one.
    *   **`renderStep()` Function**:
        *   Add a `case` for your new `CreationStep` (if any) to render your new feature selection component. Pass the necessary props (e.g., data for choices from `state.selectedClass`, and the appropriate handler function from `CharacterCreator.tsx` that dispatches the selection action).
        *   Modify the `case CreationStep.ClassFeatures`: If your new class doesn't fit the existing Fighter/Cleric/Wizard structure for this step but has features that need selection here, add logic to render its specific component. If it has no further choices *after* the main "Class Features" step and it uses this step, ensure it correctly transitions. If its choices are handled in a dedicated `CreationStep` (as recommended), this `ClassFeatures` step might be skipped or handle a different set of features.

## 6. Update Character Assembly Logic (`src/components/CharacterCreator/hooks/useCharacterAssembly.ts`)

*   **File**: `src/components/CharacterCreator/hooks/useCharacterAssembly.ts`
*   **Actions**:
    *   **`validateAllSelectionsMade`**: Update this function to include checks for any mandatory selections specific to your new class (e.g., ensuring a bloodline is chosen for a sorcerer if it's a required part of the class).
    *   **Stat/Spell/Skill Calculation Helpers (`calculateCharacterMaxHp`, `calculateCharacterSpeed`, `calculateCharacterDarkvision`, `assembleFinalKnownCantrips`, `assembleFinalKnownSpells`, `assembleFinalSkills`)**:
        *   If your new class has features that affect Max HP, Speed, Darkvision, or grant additional spells/skills beyond the standard class progression at level 1, update these helper functions accordingly. They take the `CharacterCreationState` as input.
    *   **`generatePreviewCharacter` & `assembleAndSubmitCharacter`**:
        *   Ensure that any new class-specific state fields (e.g., `selectedSorcererBloodline`) from `CharacterCreationState` are correctly included in the final `PlayerCharacter` object being assembled. These functions iterate over the state to build the final character.

## 7. Update Display Components (Character Sheet)

*   **File**: `src/components/CharacterSheetModal.tsx` (and potentially `src/components/PlayerPane.tsx` if it's used for a more detailed view elsewhere, though `PartyPane` is now the main game view).
*   **Action**: Modify the component to display any new class-specific information or features for your new class. For example, if a Sorcerer has "Sorcery Points," add a section to display this.

## 8. Update Constants & Data Files

*   **`src/data/classes/index.ts`**: Your primary addition will be here.
*   **`src/data/spells/index.ts`**: Add any new spells specific to this class if they don't exist.
*   **`src/constants.ts`**: Ensure `CLASSES_DATA` (which now includes your new class) is correctly re-exported.

## 9. Documentation

*   **Update `src/data/classes/CLASSES.README.md`**: Add details about your new class, its features, and any unique data structures it uses.
*   **Create Component README**: If you created a new class-specific feature selection component, add a `[NewComponent].README.md` file in its directory.
*   **Update `docs/PROJECT_OVERVIEW.README.md`**: Add the new class to the list of available classes in the "Character Creation" feature description.
*   **Update `docs/README_INDEX.md`**: Add links to any new README files created.
*   **(This Guide)** This guide (`CLASS_ADDITION_GUIDE.md`) will be part of this update.

## 10. Testing

*   Thoroughly test the character creation flow for your new class.
*   Verify that all selections are correctly stored and reflected in the `NameAndReview` step and in the final `PlayerCharacter` object.
*   Test backward navigation to ensure state is reset correctly.
*   Check the Character Sheet Modal to ensure the new class's information is displayed accurately.

---

By following these steps, you should be able to integrate a new character class smoothly into the Aralia RPG system. Remember to maintain consistency with existing patterns and to test thoroughly.
