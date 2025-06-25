/**
 * @file src/state/appState.ts
 * Defines the state structure, initial state, actions, and reducer for the main application (App.tsx).
 */
import { GameState, GamePhase, GameMessage, PlayerCharacter, Item, MapData, Action, Location, InspectSubmapTilePayload, GeminiLogEntry, UpdateInspectedTileDescriptionPayload, DiscoveryEntry, DiscoveryType, EquipItemPayload, UnequipItemPayload, UseItemPayload, DropItemPayload, EquipmentSlotType, SetLoadingPayload } from '../types';
import { STARTING_LOCATION_ID, DUMMY_CHARACTER_FOR_DEV, USE_DUMMY_CHARACTER_FOR_DEV, SUBMAP_DIMENSIONS, LOCATIONS, ITEMS } from '../constants';
import * as SaveLoadService from '../services/saveLoadService';
import { determineActiveDynamicNpcsForLocation } from '../utils/locationUtils'; 
import { initialInventoryForDummyCharacter } from '../data/dev/dummyCharacter'; 
import { calculateArmorClass, getAbilityModifierValue } from '../utils/characterUtils';

export type AppAction =
  | { type: 'SET_GAME_PHASE'; payload: GamePhase }
  | { type: 'START_NEW_GAME_SETUP'; payload: { mapData: MapData; dynamicLocationItemIds: Record<string, string[]> } }
  | { type: 'START_GAME_FOR_DUMMY'; payload: { mapData: MapData; dynamicLocationItemIds: Record<string, string[]> } }
  | { type: 'START_GAME_SUCCESS'; payload: { character: PlayerCharacter; mapData: MapData; dynamicLocationItemIds: Record<string, string[]>; initialLocationDescription: string; initialSubMapCoordinates: {x: number; y:number}; initialActiveDynamicNpcIds: string[] | null } }
  | { type: 'LOAD_GAME_SUCCESS'; payload: GameState }
  | { type: 'SET_LOADING'; payload: SetLoadingPayload }
  | { type: 'SET_IMAGE_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'ADD_MESSAGE'; payload: GameMessage }
  | { type: 'MOVE_PLAYER'; payload: { newLocationId: string; newSubMapCoordinates: {x: number; y:number}; mapData?: MapData; activeDynamicNpcIds: string[] | null } }
  | { type: 'TAKE_ITEM'; payload: { item: Item; locationId: string } }
  | { type: 'TOGGLE_MAP_VISIBILITY' }
  | { type: 'TOGGLE_SUBMAP_VISIBILITY' } 
  | { type: 'SET_MAP_DATA'; payload: MapData }
  | { type: 'INITIALIZE_DUMMY_PLAYER_STATE'; payload: { mapData: MapData; dynamicLocationItemIds: Record<string, string[]>; initialLocationDescription: string; initialSubMapCoordinates: {x:number; y:number}, initialActiveDynamicNpcIds: string[] | null } }
  | { type: 'SET_GEMINI_ACTIONS'; payload: Action[] | null }
  | { type: 'OPEN_CHARACTER_SHEET'; payload: PlayerCharacter }
  | { type: 'CLOSE_CHARACTER_SHEET' }
  | { type: 'SET_LAST_NPC_INTERACTION'; payload: { npcId: string | null; response: string | null } }
  | { type: 'RESET_NPC_INTERACTION_CONTEXT' }
  | { type: 'ADVANCE_TIME'; payload: { seconds: number } }
  | { type: 'INSPECT_SUBMAP_TILE'; payload: InspectSubmapTilePayload } 
  | { type: 'TOGGLE_DEV_MENU' }
  | { type: 'TOGGLE_GEMINI_LOG_VIEWER' }
  | { type: 'ADD_GEMINI_LOG_ENTRY'; payload: GeminiLogEntry }
  | { type: 'UPDATE_INSPECTED_TILE_DESCRIPTION'; payload: UpdateInspectedTileDescriptionPayload }
  // Discovery Journal Actions
  | { type: 'ADD_DISCOVERY_ENTRY'; payload: Omit<DiscoveryEntry, 'id' | 'timestamp' | 'isRead'> }
  | { type: 'MARK_DISCOVERY_READ'; payload: { entryId: string } }
  | { type: 'MARK_ALL_DISCOVERIES_READ' }
  | { type: 'TOGGLE_DISCOVERY_LOG_VISIBILITY' }
  | { type: 'TOGGLE_GLOSSARY_VISIBILITY'; payload?: { initialTermId?: string } } // Payload is optional here
  | { type: 'SET_GLOSSARY_TERM_FOR_MODAL'; payload: string } 
  | { type: 'CLEAR_GLOSSARY_TERM_FOR_MODAL' } 
  | { type: 'UPDATE_QUEST_IN_DISCOVERY_LOG'; payload: { questId: string; newStatus: string; newContent?: string } } 
  | { type: 'CLEAR_DISCOVERY_LOG' }
  // Item Interaction Actions
  | { type: 'EQUIP_ITEM'; payload: EquipItemPayload }
  | { type: 'UNEQUIP_ITEM'; payload: UnequipItemPayload }
  | { type: 'USE_ITEM'; payload: UseItemPayload }
  | { type: 'DROP_ITEM'; payload: DropItemPayload };


// Helper function to create a date at 07:00 AM on an arbitrary fixed date
const createInitialGameTime = (): Date => {
  const initialTime = new Date(351, 0, 1, 7, 0, 0, 0); 
  return initialTime;
};


export const initialGameState: GameState = {
  phase: USE_DUMMY_CHARACTER_FOR_DEV && DUMMY_CHARACTER_FOR_DEV && !SaveLoadService.hasSaveGame() ? GamePhase.PLAYING : GamePhase.MAIN_MENU,
  playerCharacter: USE_DUMMY_CHARACTER_FOR_DEV && !SaveLoadService.hasSaveGame() ? DUMMY_CHARACTER_FOR_DEV : null,
  inventory: USE_DUMMY_CHARACTER_FOR_DEV && !SaveLoadService.hasSaveGame() ? [...initialInventoryForDummyCharacter] : [],
  currentLocationId: STARTING_LOCATION_ID,
  subMapCoordinates: USE_DUMMY_CHARACTER_FOR_DEV && !SaveLoadService.hasSaveGame() ? { x: Math.floor(SUBMAP_DIMENSIONS.cols / 2) , y: Math.floor(SUBMAP_DIMENSIONS.rows / 2) } : null,
  messages: [],
  isLoading: USE_DUMMY_CHARACTER_FOR_DEV && !!DUMMY_CHARACTER_FOR_DEV && !SaveLoadService.hasSaveGame(),
  loadingMessage: USE_DUMMY_CHARACTER_FOR_DEV && !!DUMMY_CHARACTER_FOR_DEV && !SaveLoadService.hasSaveGame() ? "Aralia is weaving fate..." : null,
  isImageLoading: false, 
  error: null,
  mapData: null,
  isMapVisible: false,
  isSubmapVisible: false,
  dynamicLocationItemIds: {},
  currentLocationActiveDynamicNpcIds: null,
  geminiGeneratedActions: null,
  characterSheetModal: { 
    isOpen: false,
    character: null,
  },
  lastInteractedNpcId: null,
  lastNpcResponse: null,
  gameTime: createInitialGameTime(),
  isDevMenuVisible: false,
  isGeminiLogViewerVisible: false,
  geminiInteractionLog: [],
  inspectedTileDescriptions: {},
  // Discovery Journal State
  discoveryLog: [],
  unreadDiscoveryCount: 0,
  isDiscoveryLogVisible: false,
  isGlossaryVisible: false,
  selectedGlossaryTermForModal: undefined, 
};

export function appReducer(state: GameState, action: AppAction): GameState {
  switch (action.type) {
    case 'SET_GAME_PHASE':
      let additionalUpdates: Partial<GameState> = { loadingMessage: null }; 
      if (action.payload === GamePhase.MAIN_MENU || action.payload === GamePhase.CHARACTER_CREATION) {
        additionalUpdates.geminiGeneratedActions = null;
        additionalUpdates.isMapVisible = false;
        additionalUpdates.isSubmapVisible = false;
        additionalUpdates.error = null;
        additionalUpdates.characterSheetModal = { isOpen: false, character: null }; 
        additionalUpdates.lastInteractedNpcId = null;
        additionalUpdates.lastNpcResponse = null;
        additionalUpdates.currentLocationActiveDynamicNpcIds = null;
        additionalUpdates.isDevMenuVisible = false; 
        additionalUpdates.isGeminiLogViewerVisible = false;
        additionalUpdates.isDiscoveryLogVisible = false; 
        additionalUpdates.isGlossaryVisible = false; 
        additionalUpdates.selectedGlossaryTermForModal = undefined;
        if (action.payload === GamePhase.CHARACTER_CREATION) {
             additionalUpdates.gameTime = createInitialGameTime(); 
             additionalUpdates.discoveryLog = []; 
             additionalUpdates.unreadDiscoveryCount = 0;
             additionalUpdates.inventory = []; 
        }
      }
      return { ...state, phase: action.payload, ...additionalUpdates };
    case 'START_NEW_GAME_SETUP':
      return {
        ...initialGameState, 
        phase: GamePhase.CHARACTER_CREATION,
        mapData: action.payload.mapData,
        dynamicLocationItemIds: action.payload.dynamicLocationItemIds,
        inventory: [], 
        currentLocationActiveDynamicNpcIds: determineActiveDynamicNpcsForLocation(STARTING_LOCATION_ID, LOCATIONS),
        gameTime: createInitialGameTime(),
        inspectedTileDescriptions: {},
        discoveryLog: [], 
        unreadDiscoveryCount: 0,
        isGlossaryVisible: false,
        selectedGlossaryTermForModal: undefined,
        isLoading: false, 
        loadingMessage: null,
      };
    case 'START_GAME_FOR_DUMMY':
      const dummyChar = DUMMY_CHARACTER_FOR_DEV;
      if (!dummyChar) {
          console.error("Attempted to start with dummy character, but DUMMY_CHARACTER_FOR_DEV is null.");
          return { ...state, error: "Dummy character data not available.", phase: GamePhase.MAIN_MENU, isLoading: false, loadingMessage: null };
      }
      const initialDummyLocation = LOCATIONS[STARTING_LOCATION_ID];
      return {
        ...initialGameState, 
        phase: GamePhase.PLAYING,
        playerCharacter: { 
            ...dummyChar,
            equippedItems: dummyChar.equippedItems || {}
        },
        inventory: [...initialInventoryForDummyCharacter], 
        currentLocationId: STARTING_LOCATION_ID,
        subMapCoordinates: { x: Math.floor(SUBMAP_DIMENSIONS.cols / 2), y: Math.floor(SUBMAP_DIMENSIONS.rows / 2) },
        messages: [
            { id: Date.now(), text: `Welcome, ${dummyChar.name} the ${dummyChar.race.name} ${dummyChar.class.name}! Your adventure begins (Dev Mode).`, sender: 'system', timestamp: new Date() },
            { id: Date.now() + 1, text: initialDummyLocation.baseDescription, sender: 'system', timestamp: new Date() }
        ],
        mapData: action.payload.mapData,
        dynamicLocationItemIds: action.payload.dynamicLocationItemIds,
        currentLocationActiveDynamicNpcIds: determineActiveDynamicNpcsForLocation(STARTING_LOCATION_ID, LOCATIONS),
        gameTime: createInitialGameTime(),
        inspectedTileDescriptions: {},
        discoveryLog: [], 
        unreadDiscoveryCount: 0,
        isLoading: false, 
        loadingMessage: null,
        isGlossaryVisible: false,
        selectedGlossaryTermForModal: undefined,
      };
    case 'START_GAME_SUCCESS':
      return {
        ...initialGameState, 
        phase: GamePhase.PLAYING,
        playerCharacter: { 
            ...action.payload.character,
            equippedItems: action.payload.character.equippedItems || {}
        },
        inventory: [], 
        messages: [
          { id: Date.now() + Math.random(), text: `Welcome, ${action.payload.character.name} the ${action.payload.character.race.name} ${action.payload.character.class.name}! Your adventure begins.`, sender: 'system', timestamp: new Date() },
          { id: Date.now() + Math.random() + 1, text: action.payload.initialLocationDescription, sender: 'system', timestamp: new Date() }
        ],
        currentLocationId: STARTING_LOCATION_ID,
        subMapCoordinates: action.payload.initialSubMapCoordinates,
        mapData: action.payload.mapData,
        dynamicLocationItemIds: action.payload.dynamicLocationItemIds,
        currentLocationActiveDynamicNpcIds: action.payload.initialActiveDynamicNpcIds,
        gameTime: createInitialGameTime(), 
        inspectedTileDescriptions: {},
        discoveryLog: [], 
        unreadDiscoveryCount: 0,
        isGlossaryVisible: false,
        selectedGlossaryTermForModal: undefined,
        isLoading: false, 
        loadingMessage: null,
      };
    case 'LOAD_GAME_SUCCESS':
      const loadedState = action.payload;
      const gameTimeFromLoad = typeof loadedState.gameTime === 'string' ? new Date(loadedState.gameTime) : loadedState.gameTime;
      return {
        ...loadedState, 
        phase: GamePhase.PLAYING, 
        isLoading: false, 
        loadingMessage: null,
        isImageLoading: false,
        error: null,
        isMapVisible: false,
        isSubmapVisible: false,
        isDevMenuVisible: false,
        isGeminiLogViewerVisible: false,
        isDiscoveryLogVisible: false, 
        isGlossaryVisible: false, 
        selectedGlossaryTermForModal: undefined,
        geminiGeneratedActions: null,
        playerCharacter: loadedState.playerCharacter ? { 
            ...loadedState.playerCharacter,
            darkvisionRange: loadedState.playerCharacter.darkvisionRange ?? 0, 
            equippedItems: loadedState.playerCharacter.equippedItems || {}
        } : null,
        inventory: loadedState.inventory || [], 
        currentLocationActiveDynamicNpcIds: determineActiveDynamicNpcsForLocation(loadedState.currentLocationId, LOCATIONS),
        characterSheetModal: loadedState.characterSheetModal || { isOpen: false, character: null },
        lastInteractedNpcId: loadedState.lastInteractedNpcId || null, 
        lastNpcResponse: loadedState.lastNpcResponse || null,
        gameTime: gameTimeFromLoad,
        geminiInteractionLog: loadedState.geminiInteractionLog || [], 
        inspectedTileDescriptions: loadedState.inspectedTileDescriptions || {},
        discoveryLog: loadedState.discoveryLog || [], 
        unreadDiscoveryCount: loadedState.unreadDiscoveryCount || 0, 
      };
    case 'SET_LOADING':
      return { 
        ...state, 
        isLoading: action.payload.isLoading,
        loadingMessage: action.payload.isLoading 
          ? (action.payload.message || "Aralia is weaving fate...") 
          : null 
      };
    case 'SET_IMAGE_LOADING':
      return { ...state, isImageLoading: action.payload, loadingMessage: action.payload ? "A vision forms in the æther..." : null };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false, isImageLoading: false, loadingMessage: null };
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.payload] };
    case 'MOVE_PLAYER':
      return {
        ...state,
        currentLocationId: action.payload.newLocationId,
        subMapCoordinates: action.payload.newSubMapCoordinates,
        mapData: action.payload.mapData || state.mapData,
        currentLocationActiveDynamicNpcIds: action.payload.activeDynamicNpcIds,
        geminiGeneratedActions: null,
        lastInteractedNpcId: null, 
        lastNpcResponse: null,
      };
    case 'TAKE_ITEM': {
      const itemToAdd = action.payload.item;
      const discoveryEntry: Omit<DiscoveryEntry, 'id' | 'timestamp' | 'isRead'> = {
        gameTime: state.gameTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
        type: DiscoveryType.ITEM_ACQUISITION,
        title: `Item Acquired: ${itemToAdd.name}`,
        content: `You found and picked up ${itemToAdd.name}. ${itemToAdd.description}`,
        source: { type: 'LOCATION', id: action.payload.locationId, name: LOCATIONS[action.payload.locationId]?.name },
        flags: [{key: 'itemId', value: itemToAdd.id, label: itemToAdd.name}],
      };
      return {
        ...state,
        inventory: [...state.inventory, itemToAdd],
        dynamicLocationItemIds: {
          ...state.dynamicLocationItemIds,
          [action.payload.locationId]: state.dynamicLocationItemIds[action.payload.locationId]?.filter(id => id !== itemToAdd.id) || [],
        },
        geminiGeneratedActions: null,
        lastInteractedNpcId: null, 
        lastNpcResponse: null,
        discoveryLog: [ { ...discoveryEntry, id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`, timestamp: Date.now(), isRead: false }, ...state.discoveryLog],
        unreadDiscoveryCount: state.unreadDiscoveryCount + 1,
      };
    }
    case 'TOGGLE_MAP_VISIBILITY':
      return { ...state, isMapVisible: !state.isMapVisible, isLoading: false, loadingMessage: null, isSubmapVisible: false, geminiGeneratedActions: null, isDevMenuVisible: false, isGeminiLogViewerVisible: false, isDiscoveryLogVisible: false, isGlossaryVisible: false, selectedGlossaryTermForModal: undefined };
    case 'TOGGLE_SUBMAP_VISIBILITY':
      return { ...state, isSubmapVisible: !state.isSubmapVisible, isLoading: false, loadingMessage: null, isMapVisible: false, geminiGeneratedActions: null, isDevMenuVisible: false, isGeminiLogViewerVisible: false, isDiscoveryLogVisible: false, isGlossaryVisible: false, selectedGlossaryTermForModal: undefined };
    case 'SET_MAP_DATA':
      return { ...state, mapData: action.payload };
    case 'INITIALIZE_DUMMY_PLAYER_STATE':
        return {
            ...state,
            messages: [
                { id: Date.now() + Math.random(), text: `Welcome, ${state.playerCharacter!.name} the ${state.playerCharacter!.race.name} ${state.playerCharacter!.class.name}! Your adventure begins (Dev Mode - Auto Start).`, sender: 'system', timestamp: new Date() },
                { id: Date.now() + Math.random() + 1, text: action.payload.initialLocationDescription, sender: 'system', timestamp: new Date() }
            ],
            subMapCoordinates: action.payload.initialSubMapCoordinates,
            isLoading: false,
            loadingMessage: null,
            isImageLoading: false,
            mapData: action.payload.mapData,
            isSubmapVisible: false,
            dynamicLocationItemIds: action.payload.dynamicLocationItemIds,
            inventory: [...initialInventoryForDummyCharacter], 
            currentLocationActiveDynamicNpcIds: action.payload.initialActiveDynamicNpcIds,
            geminiGeneratedActions: null,
            lastInteractedNpcId: null,
            lastNpcResponse: null,
            gameTime: createInitialGameTime(),
            inspectedTileDescriptions: {},
            discoveryLog: [], 
            unreadDiscoveryCount: 0,
            isGlossaryVisible: false,
            selectedGlossaryTermForModal: undefined,
        };
    case 'SET_GEMINI_ACTIONS':
        return { ...state, geminiGeneratedActions: action.payload };
    case 'OPEN_CHARACTER_SHEET':
      return { ...state, characterSheetModal: { isOpen: true, character: action.payload }, isDevMenuVisible: false, isGeminiLogViewerVisible: false, isDiscoveryLogVisible: false, isGlossaryVisible: false, selectedGlossaryTermForModal: undefined };
    case 'CLOSE_CHARACTER_SHEET':
      return { ...state, characterSheetModal: { isOpen: false, character: null } };
    case 'SET_LAST_NPC_INTERACTION':
      return {
        ...state,
        lastInteractedNpcId: action.payload.npcId,
        lastNpcResponse: action.payload.response,
      };
    case 'RESET_NPC_INTERACTION_CONTEXT':
      return {
        ...state,
        lastInteractedNpcId: null,
        lastNpcResponse: null,
      };
    case 'ADVANCE_TIME':
      const newTime = new Date(state.gameTime.getTime());
      newTime.setSeconds(newTime.getSeconds() + action.payload.seconds);
      return { ...state, gameTime: newTime };
    case 'INSPECT_SUBMAP_TILE': 
        return state;
    case 'UPDATE_INSPECTED_TILE_DESCRIPTION':
      return {
        ...state,
        inspectedTileDescriptions: {
          ...state.inspectedTileDescriptions,
          [action.payload.tileKey]: action.payload.description,
        },
      };
    case 'TOGGLE_DEV_MENU':
      return { ...state, isDevMenuVisible: !state.isDevMenuVisible, isMapVisible: false, isSubmapVisible: false, isGeminiLogViewerVisible: false, characterSheetModal: { isOpen: false, character: null }, isDiscoveryLogVisible: false, isGlossaryVisible: false, selectedGlossaryTermForModal: undefined };
    case 'TOGGLE_GEMINI_LOG_VIEWER':
      return { ...state, isGeminiLogViewerVisible: !state.isGeminiLogViewerVisible, isDevMenuVisible: false }; 
    case 'ADD_GEMINI_LOG_ENTRY':
      return {
        ...state,
        geminiInteractionLog: [action.payload, ...state.geminiInteractionLog].slice(0, 100), 
      };
    case 'ADD_DISCOVERY_ENTRY': {
        const newEntryData: DiscoveryEntry = {
            ...action.payload,
            id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            timestamp: Date.now(),
            isRead: false,
        };
        if (newEntryData.type === DiscoveryType.LOCATION_DISCOVERY) {
            const existingEntry = state.discoveryLog.find(entry => 
                entry.type === newEntryData.type && 
                entry.flags.some(f => f.key === 'locationId' && f.value === newEntryData.flags.find(nf => nf.key === 'locationId')?.value)
            );
            if (existingEntry) return state; 
        }
        return {
            ...state,
            discoveryLog: [newEntryData, ...state.discoveryLog],
            unreadDiscoveryCount: state.unreadDiscoveryCount + 1,
        };
      }
    case 'MARK_DISCOVERY_READ': {
        let newUnreadCountAfterMarkRead = state.unreadDiscoveryCount;
        const updatedLog = state.discoveryLog.map(entry => {
            if (entry.id === action.payload.entryId && !entry.isRead) {
                newUnreadCountAfterMarkRead = Math.max(0, newUnreadCountAfterMarkRead - 1);
                return { ...entry, isRead: true };
            }
            return entry;
        });
        return {
            ...state,
            discoveryLog: updatedLog,
            unreadDiscoveryCount: newUnreadCountAfterMarkRead,
        };
      }
    case 'MARK_ALL_DISCOVERIES_READ':
        return {
            ...state,
            discoveryLog: state.discoveryLog.map(entry => ({ ...entry, isRead: true })),
            unreadDiscoveryCount: 0,
        };
    case 'TOGGLE_DISCOVERY_LOG_VISIBILITY':
      return { ...state, isDiscoveryLogVisible: !state.isDiscoveryLogVisible, isMapVisible: false, isSubmapVisible: false, isDevMenuVisible: false, isGeminiLogViewerVisible: false, characterSheetModal: { isOpen: false, character: null }, isGlossaryVisible: false, selectedGlossaryTermForModal: undefined };
    case 'TOGGLE_GLOSSARY_VISIBILITY': {
      const openingGlossary = !state.isGlossaryVisible;
      return {
        ...state,
        isGlossaryVisible: openingGlossary,
        selectedGlossaryTermForModal: openingGlossary && action.payload?.initialTermId ? action.payload.initialTermId : undefined,
        // Close other modals when opening glossary
        isMapVisible: openingGlossary ? false : state.isMapVisible,
        isSubmapVisible: openingGlossary ? false : state.isSubmapVisible,
        isDevMenuVisible: openingGlossary ? false : state.isDevMenuVisible,
        isGeminiLogViewerVisible: openingGlossary ? false : state.isGeminiLogViewerVisible,
        characterSheetModal: openingGlossary ? { isOpen: false, character: null } : state.characterSheetModal,
        isDiscoveryLogVisible: openingGlossary ? false : state.isDiscoveryLogVisible,
      };
    }
    case 'SET_GLOSSARY_TERM_FOR_MODAL':
      return { ...state, selectedGlossaryTermForModal: action.payload };
    case 'CLEAR_GLOSSARY_TERM_FOR_MODAL': // Should not be needed if TOGGLE_GLOSSARY_VISIBILITY handles reset
      return { ...state, selectedGlossaryTermForModal: undefined };
    case 'CLEAR_DISCOVERY_LOG':
        return {
            ...state,
            discoveryLog: [],
            unreadDiscoveryCount: 0,
        };
    case 'UPDATE_QUEST_IN_DISCOVERY_LOG': 
        return {
            ...state,
            discoveryLog: state.discoveryLog.map(entry => {
                if (entry.isQuestRelated && entry.questId === action.payload.questId) {
                    return {
                        ...entry,
                        content: action.payload.newContent ? `${entry.content}\n\nUpdate: ${action.payload.newContent}` : entry.content,
                        questStatus: action.payload.newStatus,
                        isRead: false, 
                    };
                }
                return entry;
            }),
            unreadDiscoveryCount: state.discoveryLog.some(entry => entry.isQuestRelated && entry.questId === action.payload.questId && !entry.isRead) 
                                 ? state.unreadDiscoveryCount 
                                 : state.unreadDiscoveryCount + (state.discoveryLog.some(entry => entry.isQuestRelated && entry.questId === action.payload.questId) ? 1 : 0),
        };
    case 'EQUIP_ITEM': {
        if (!state.playerCharacter) return state;
        const itemToEquip = state.inventory.find(item => item.id === action.payload.itemId);
        if (!itemToEquip || !itemToEquip.slot) return state;

        const newEquippedItems = { ...state.playerCharacter.equippedItems };
        const newInventory = [...state.inventory];
        const itemInSlot = newEquippedItems[itemToEquip.slot];

        if (itemInSlot) {
            newInventory.push(itemInSlot);
            delete newEquippedItems[itemToEquip.slot];
        }
        
        newEquippedItems[itemToEquip.slot] = itemToEquip;
        const itemIndexInInventory = newInventory.findIndex(item => item.id === action.payload.itemId);
        if (itemIndexInInventory > -1) {
            newInventory.splice(itemIndexInInventory, 1);
        }

        let updatedPlayerCharacter = {
            ...state.playerCharacter,
            equippedItems: newEquippedItems,
        };
        updatedPlayerCharacter.armorClass = calculateArmorClass(updatedPlayerCharacter);
        
        const equipDiscovery: Omit<DiscoveryEntry, 'id' | 'timestamp' | 'isRead'> = {
            gameTime: state.gameTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
            type: DiscoveryType.ITEM_EQUIPPED,
            title: `Equipped: ${itemToEquip.name}`,
            content: `You equipped the ${itemToEquip.name}.`,
            source: { type: 'PLAYER_ACTION' },
            flags: [{key: 'itemId', value: itemToEquip.id, label: itemToEquip.name}],
        };
        
        const newCharacterSheetModalState = state.characterSheetModal.isOpen && state.characterSheetModal.character?.name === updatedPlayerCharacter.name
            ? { ...state.characterSheetModal, character: updatedPlayerCharacter }
            : state.characterSheetModal;

        return {
            ...state,
            playerCharacter: updatedPlayerCharacter,
            characterSheetModal: newCharacterSheetModalState,
            inventory: newInventory,
            discoveryLog: [ { ...equipDiscovery, id: `${Date.now()}-${Math.random().toString(36).substring(2,9)}`, timestamp: Date.now(), isRead: false }, ...state.discoveryLog],
            unreadDiscoveryCount: state.unreadDiscoveryCount + 1,
            messages: [...state.messages, {id: Date.now(), text: `You equip the ${itemToEquip.name}.`, sender: 'system', timestamp: new Date()}],
        };
    }
    case 'UNEQUIP_ITEM': {
        if (!state.playerCharacter) return state;
        const slotToUnequip = action.payload.slot;
        const itemToUnequip = state.playerCharacter.equippedItems[slotToUnequip];
        if (!itemToUnequip) return state;

        const newEquippedItems = { ...state.playerCharacter.equippedItems };
        delete newEquippedItems[slotToUnequip];
        
        let updatedPlayerCharacter = {
            ...state.playerCharacter,
            equippedItems: newEquippedItems,
        };
        updatedPlayerCharacter.armorClass = calculateArmorClass(updatedPlayerCharacter);
        
        const unequipDiscovery: Omit<DiscoveryEntry, 'id' | 'timestamp' | 'isRead'> = {
            gameTime: state.gameTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
            type: DiscoveryType.ITEM_UNEQUIPPED,
            title: `Unequipped: ${itemToUnequip.name}`,
            content: `You unequipped the ${itemToUnequip.name}.`,
            source: { type: 'PLAYER_ACTION' },
            flags: [{key: 'itemId', value: itemToUnequip.id, label: itemToUnequip.name}],
        };

        const newCharacterSheetModalState = state.characterSheetModal.isOpen && state.characterSheetModal.character?.name === updatedPlayerCharacter.name
            ? { ...state.characterSheetModal, character: updatedPlayerCharacter }
            : state.characterSheetModal;

        return {
            ...state,
            playerCharacter: updatedPlayerCharacter,
            characterSheetModal: newCharacterSheetModalState,
            inventory: [...state.inventory, itemToUnequip],
            discoveryLog: [ { ...unequipDiscovery, id: `${Date.now()}-${Math.random().toString(36).substring(2,9)}`, timestamp: Date.now(), isRead: false }, ...state.discoveryLog],
            unreadDiscoveryCount: state.unreadDiscoveryCount + 1,
            messages: [...state.messages, {id: Date.now(), text: `You unequip the ${itemToUnequip.name}.`, sender: 'system', timestamp: new Date()}],
        };
    }
    case 'USE_ITEM': {
        if (!state.playerCharacter) return state;
        const itemToUse = state.inventory.find(item => item.id === action.payload.itemId);
        if (!itemToUse || itemToUse.type !== 'consumable' || !itemToUse.effect) return state;

        let playerAfterEffect = { ...state.playerCharacter };
        let effectMessage = `You used ${itemToUse.name}.`;

        if (itemToUse.effect.startsWith('heal_')) {
            const healAmount = parseInt(itemToUse.effect.split('_')[1]);
            if (!isNaN(healAmount)) {
                const oldHp = playerAfterEffect.hp;
                playerAfterEffect.hp = Math.min(playerAfterEffect.maxHp, playerAfterEffect.hp + healAmount);
                effectMessage = `You used ${itemToUse.name} and healed ${playerAfterEffect.hp - oldHp} HP.`;
            }
        }
        // Add more effect parsing here
        
        const useDiscovery: Omit<DiscoveryEntry, 'id' | 'timestamp' | 'isRead'> = {
            gameTime: state.gameTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
            type: DiscoveryType.ITEM_USED,
            title: `Used: ${itemToUse.name}`,
            content: effectMessage,
            source: { type: 'PLAYER_ACTION' },
            flags: [{key: 'itemId', value: itemToUse.id, label: itemToUse.name}],
        };
        
        const newCharacterSheetModalState = state.characterSheetModal.isOpen && state.characterSheetModal.character?.name === playerAfterEffect.name
            ? { ...state.characterSheetModal, character: playerAfterEffect }
            : state.characterSheetModal;

        return {
            ...state,
            playerCharacter: playerAfterEffect,
            characterSheetModal: newCharacterSheetModalState,
            inventory: state.inventory.filter(item => item.id !== action.payload.itemId),
            discoveryLog: [ { ...useDiscovery, id: `${Date.now()}-${Math.random().toString(36).substring(2,9)}`, timestamp: Date.now(), isRead: false }, ...state.discoveryLog],
            unreadDiscoveryCount: state.unreadDiscoveryCount + 1,
            messages: [...state.messages, {id: Date.now(), text: effectMessage, sender: 'system', timestamp: new Date()}],
        };
    }
    case 'DROP_ITEM': {
        const itemToDrop = state.inventory.find(item => item.id === action.payload.itemId);
        if (!itemToDrop) return state;

        const newDynamicItems = { ...state.dynamicLocationItemIds };
        if (!state.currentLocationId.startsWith('coord_')) { 
            newDynamicItems[state.currentLocationId] = [
                ...(newDynamicItems[state.currentLocationId] || []),
                itemToDrop.id
            ];
        }
        
        const dropDiscovery: Omit<DiscoveryEntry, 'id' | 'timestamp' | 'isRead'> = {
            gameTime: state.gameTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
            type: DiscoveryType.ITEM_DROPPED,
            title: `Dropped: ${itemToDrop.name}`,
            content: `You dropped the ${itemToDrop.name} in ${LOCATIONS[state.currentLocationId]?.name || 'the area'}.`,
            source: { type: 'PLAYER_ACTION' },
            flags: [{key: 'itemId', value: itemToDrop.id, label: itemToDrop.name}],
            associatedLocationId: state.currentLocationId,
        };

        return {
            ...state,
            inventory: state.inventory.filter(item => item.id !== action.payload.itemId),
            dynamicLocationItemIds: newDynamicItems,
            discoveryLog: [ { ...dropDiscovery, id: `${Date.now()}-${Math.random().toString(36).substring(2,9)}`, timestamp: Date.now(), isRead: false }, ...state.discoveryLog],
            unreadDiscoveryCount: state.unreadDiscoveryCount + 1,
            messages: [...state.messages, {id: Date.now(), text: `You drop the ${itemToDrop.name}.`, sender: 'system', timestamp: new Date()}],
        };
    }
    default:
      return state;
  }
}