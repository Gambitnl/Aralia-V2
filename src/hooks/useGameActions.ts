/**
 * @file src/hooks/useGameActions.ts
 * Custom hook for managing game action processing.
 * This is the refactored version that orchestrates calls to specific action handlers.
 */
import { useCallback } from 'react';
import { GameState, Action, NPC, Location, MapTile, PlayerCharacter, GeminiLogEntry, EquipItemPayload, UnequipItemPayload, DropItemPayload, UseItemPayload } from '../types';
import { AppAction } from '../state/appState';
import { ITEMS, BIOMES, LOCATIONS, NPCS } from '../constants';
import { AddMessageFn, PlayPcmAudioFn, GetCurrentLocationFn, GetCurrentNPCsFn, GetTileTooltipTextFn, AddGeminiLogFn, LogDiscoveryFn } from './actions/actionHandlerTypes';

// Import specific action handlers
import { handleMovement } from './actions/handleMovement';
import { handleLookAround, handleInspectSubmapTile } from './actions/handleObservation';
import { handleTalk } from './actions/handleNpcInteraction';
import { handleTakeItem, handleEquipItem, handleUnequipItem, handleUseItem, handleDropItem } from './actions/handleItemInteraction';
import { handleOracle } from './actions/handleOracle';
import { handleGeminiCustom } from './actions/handleGeminiCustom';
import { 
  handleSaveGame, 
  handleGoToMainMenu, 
  handleToggleMap, 
  handleToggleSubmap, 
  handleToggleDevMenu,
  handleToggleDiscoveryLog,
  handleToggleGlossary
} from './actions/handleSystemAndUi';
import { DiscoveryType } from '../types';


interface UseGameActionsProps {
  gameState: GameState;
  dispatch: React.Dispatch<AppAction>;
  addMessage: AddMessageFn;
  playPcmAudio: PlayPcmAudioFn;
  getCurrentLocation: GetCurrentLocationFn;
  getCurrentNPCs: GetCurrentNPCsFn;
  getTileTooltipText: GetTileTooltipTextFn;
}

function getDiegeticPlayerActionMessage(
  action: Action,
  gameNpcs: Record<string, NPC>,
  gameLocations: Record<string, Location>,
  playerCharacter: PlayerCharacter | null
): string | null {
  switch (action.type) {
    case 'move':
      if (action.targetId) {
        const dirVectorKeys = ['North', 'South', 'East', 'West', 'NorthEast', 'NorthWest', 'SouthEast', 'SouthWest'];
        if (dirVectorKeys.includes(action.targetId)) {
          return `You head ${action.targetId}.`;
        }
        const targetLocation = gameLocations[action.targetId];
        if (targetLocation) {
          return `You decide to travel to ${targetLocation.name}.`;
        }
      }
      return `You decide to move.`;
    case 'look_around':
      return "You take a moment to survey your surroundings.";
    case 'talk':
      if (action.targetId) {
        const npc = gameNpcs[action.targetId];
        if (npc) {
          return `You approach ${npc.name} to speak.`;
        }
      }
      return `You attempt to speak to someone nearby.`;
    case 'take_item':
      if (action.targetId) {
        const item = ITEMS[action.targetId];
        if (item) {
          return `You attempt to take the ${item.name}.`;
        }
      }
      return `You try to pick something up.`;
    case 'inspect_submap_tile':
      return `You carefully examine the terrain nearby.`;
    case 'gemini_custom_action':
      if (action.label) {
        return `You decide to: ${action.label}.`;
      }
      return `You decide to try something specific.`;
    case 'EQUIP_ITEM':
        if(action.payload?.itemId && ITEMS[action.payload.itemId]) {
            return `You attempt to equip the ${ITEMS[action.payload.itemId].name}.`;
        }
        return `You attempt to equip an item.`;
    case 'UNEQUIP_ITEM':
        if(action.payload?.slot && playerCharacter?.equippedItems[action.payload.slot]) {
            return `You attempt to unequip the ${playerCharacter.equippedItems[action.payload.slot]!.name}.`;
        }
        return `You attempt to unequip an item.`;
    case 'use_item':
        if(action.payload?.itemId && ITEMS[action.payload.itemId]) {
            return `You use the ${ITEMS[action.payload.itemId].name}.`;
        }
        return `You use an item.`;
    case 'DROP_ITEM':
        if(action.payload?.itemId && ITEMS[action.payload.itemId]) {
            return `You drop the ${ITEMS[action.payload.itemId].name}.`;
        }
        return `You drop an item.`;
    case 'ask_oracle': // Oracle queries have custom pre-logging
    case 'toggle_map':
    case 'toggle_submap_visibility':
    case 'save_game':
    case 'go_to_main_menu':
    case 'toggle_dev_menu':
    case 'UPDATE_INSPECTED_TILE_DESCRIPTION': // Internal action
    case 'TOGGLE_DISCOVERY_LOG':
    case 'TOGGLE_GLOSSARY_VISIBILITY':
      return null; // No generic diegetic message for these
    default:
      if (action.label && !action.type.startsWith('SET_') && !action.type.startsWith('TOGGLE_')) {
         return `> ${action.label}`; // Fallback for other labeled actions
      }
      return null;
  }
}


export function useGameActions({
  gameState,
  dispatch,
  addMessage,
  playPcmAudio,
  getCurrentLocation,
  getCurrentNPCs,
  getTileTooltipText,
}: UseGameActionsProps) {

  const addGeminiLog = useCallback<AddGeminiLogFn>((functionName, prompt, response) => {
    const logEntry: GeminiLogEntry = {
      timestamp: new Date(),
      functionName,
      prompt,
      response,
    };
    dispatch({ type: 'ADD_GEMINI_LOG_ENTRY', payload: logEntry });
  }, [dispatch]);

  const logDiscovery = useCallback<LogDiscoveryFn>((newLocation: Location) => {
    const alreadyDiscovered = gameState.discoveryLog.some(entry =>
      entry.type === DiscoveryType.LOCATION_DISCOVERY &&
      entry.flags.some(f => f.key === 'locationId' && f.value === newLocation.id)
    );

    if (!alreadyDiscovered) {
      dispatch({ 
        type: 'ADD_DISCOVERY_ENTRY', 
        payload: {
            gameTime: gameState.gameTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
            type: DiscoveryType.LOCATION_DISCOVERY,
            title: `Location Discovered: ${newLocation.name}`,
            content: `You have discovered ${newLocation.name}. ${newLocation.baseDescription}`,
            source: { type: 'LOCATION', id: newLocation.id, name: newLocation.name },
            flags: [{ key: 'locationId', value: newLocation.id, label: newLocation.name }],
            isQuestRelated: false,
            associatedLocationId: newLocation.id,
            worldMapCoordinates: newLocation.mapCoordinates,
        }
      });
    }
  }, [gameState.discoveryLog, gameState.gameTime, dispatch]);

  const processAction = useCallback(
    async (action: Action) => {
      dispatch({ type: 'SET_LOADING', payload: { isLoading: true, message: "Processing action..." } });
      dispatch({ type: 'SET_ERROR', payload: null });

      if (action.type !== 'talk' && action.type !== 'inspect_submap_tile') {
        if (gameState.lastInteractedNpcId !== null) {
            dispatch({ type: 'RESET_NPC_INTERACTION_CONTEXT' });
        }
      }
      
      const diegeticMessage = getDiegeticPlayerActionMessage(action, NPCS, LOCATIONS, gameState.playerCharacter);
      if (diegeticMessage) {
        addMessage(diegeticMessage, 'player');
      }

      let playerContext = 'An adventurer';
      if (gameState.playerCharacter) {
        playerContext = `${gameState.playerCharacter.name}, a ${gameState.playerCharacter.race.name} ${gameState.playerCharacter.class.name}`;
      }

      const currentLoc = getCurrentLocation(); // Call once
      const npcsInLocation = getCurrentNPCs(); // Call once
      const itemsInLocationNames =
        currentLoc.itemIds
          ?.map((id) => ITEMS[id]?.name)
          .filter(Boolean)
          .join(', ') || 'nothing special';

      const subMapCtx = gameState.subMapCoordinates ? `sub-tile (${gameState.subMapCoordinates.x},${gameState.subMapCoordinates.y}) within ` : '';
      const detailedLocationContext = `${subMapCtx}${currentLoc.name}. Biome: ${BIOMES[currentLoc.biomeId]?.name || 'Unknown'}. Game Time: ${gameState.gameTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}`;
      const generalActionContext = `Player (${playerContext}) is at ${detailedLocationContext} NPCs present: ${npcsInLocation.map((n) => n.name).join(', ') || 'no one'}. Visible items: ${itemsInLocationNames}.`;

      try {
        switch (action.type) {
          case 'move':
            await handleMovement({ action, gameState, dispatch, addMessage, addGeminiLog, logDiscovery, getTileTooltipText, playerContext });
            break;
          case 'look_around':
            await handleLookAround({ gameState, dispatch, addMessage, addGeminiLog, generalActionContext, getTileTooltipText });
            break;
          case 'talk':
            await handleTalk({ action, gameState, dispatch, addMessage, addGeminiLog, playPcmAudio, playerContext, generalActionContext });
            break;
          case 'take_item':
            await handleTakeItem({ action, gameState, dispatch, addMessage });
            break;
          case 'EQUIP_ITEM':
            handleEquipItem(dispatch, action.payload as EquipItemPayload);
            break;
          case 'UNEQUIP_ITEM':
            handleUnequipItem(dispatch, action.payload as UnequipItemPayload);
            break;
          case 'use_item':
            handleUseItem(dispatch, action.payload as UseItemPayload);
            break;
          case 'DROP_ITEM':
            handleDropItem(dispatch, action.payload as DropItemPayload);
            break;
          case 'ask_oracle':
            await handleOracle({ action, dispatch, addMessage, addGeminiLog, playPcmAudio, generalActionContext });
            break;
          case 'gemini_custom_action':
            await handleGeminiCustom({ action, dispatch, addMessage, addGeminiLog, generalActionContext });
            break;
          case 'inspect_submap_tile':
            await handleInspectSubmapTile({ action, gameState, dispatch, addMessage, addGeminiLog });
            break;
          case 'save_game':
            await handleSaveGame({ gameState, dispatch, addMessage });
            return; // Exits early as it manages its own loading state
          case 'go_to_main_menu':
            await handleGoToMainMenu({ gameState, dispatch, addMessage });
            return; // Exits early
          case 'toggle_map':
            handleToggleMap(dispatch);
            return;
          case 'toggle_submap_visibility':
            handleToggleSubmap(dispatch);
            return;
          case 'TOGGLE_DISCOVERY_LOG':
            handleToggleDiscoveryLog(dispatch);
            return;
          case 'TOGGLE_GLOSSARY_VISIBILITY':
             handleToggleGlossary(dispatch);
             return;
          case 'toggle_dev_menu':
            handleToggleDevMenu(dispatch);
            return;
          default:
            addMessage(`Action type ${action.type} not recognized.`, 'system');
            dispatch({ type: 'SET_GEMINI_ACTIONS', payload: null });
            dispatch({ type: 'RESET_NPC_INTERACTION_CONTEXT' });
        }
      } catch (err: any) {
        addMessage(`Error processing action: ${err.message}`, 'system');
        dispatch({ type: 'SET_ERROR', payload: err.message });
        dispatch({ type: 'SET_GEMINI_ACTIONS', payload: null });
        dispatch({ type: 'RESET_NPC_INTERACTION_CONTEXT' });
      } finally {
        const nonLoadingActions = [
            'toggle_map', 'toggle_submap_visibility', 'save_game',
            'go_to_main_menu', 'toggle_dev_menu', 'TOGGLE_DISCOVERY_LOG',
            'TOGGLE_GLOSSARY_VISIBILITY',
            'EQUIP_ITEM', 'UNEQUIP_ITEM', 'use_item', 'DROP_ITEM'
        ];
        if (!nonLoadingActions.includes(action.type)) {
             dispatch({ type: 'SET_LOADING', payload: { isLoading: false } });
        } else {
             if (gameState.isLoading && action.type !== 'save_game') { 
                dispatch({ type: 'SET_LOADING', payload: { isLoading: false } });
             }
        }
      }
    },
    [
      gameState, dispatch, addMessage, playPcmAudio, getCurrentLocation, getCurrentNPCs, getTileTooltipText, addGeminiLog, logDiscovery
    ],
  );

  return { processAction };
}
