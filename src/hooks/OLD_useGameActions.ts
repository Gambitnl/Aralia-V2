/**
 * @file src/hooks/useGameActions.ts
 * Custom hook for managing game action processing.
 */
import { useCallback } from 'react';
import { GameState, Action, NPC, Location, MapTile, PlayerCharacter, InspectSubmapTilePayload, SeededFeatureConfig, GeminiLogEntry, UpdateInspectedTileDescriptionPayload, DiscoveryType, DiscoveryEntry, DiscoverySource, EquipItemPayload, UnequipItemPayload, DropItemPayload, Item, UseItemPayload } from '../types';
import { AppAction } from '../state/appState';
import { ITEMS, BIOMES, DIRECTION_VECTORS, SUBMAP_DIMENSIONS, LOCATIONS, NPCS, USE_DUMMY_CHARACTER_FOR_DEV, GamePhase } from '../constants';
import * as GeminiService from '../services/geminiService';
import { synthesizeSpeech } from '../services/ttsService';
import * as SaveLoadService from '../services/saveLoadService';

type AddMessageFn = (text: string, sender?: 'system' | 'player' | 'npc') => void;
type PlayPcmAudioFn = (base64PcmData: string) => Promise<void>;
type GetCurrentLocationFn = () => Location;
type GetCurrentNPCsFn = () => NPC[];
type GetTileTooltipTextFn = (worldMapTile: MapTile) => string;

interface UseGameActionsProps {
  gameState: GameState;
  dispatch: React.Dispatch<AppAction>;
  addMessage: AddMessageFn;
  playPcmAudio: PlayPcmAudioFn;
  getCurrentLocation: GetCurrentLocationFn;
  getCurrentNPCs: GetCurrentNPCsFn;
  getTileTooltipText: GetTileTooltipTextFn;
}

// Helper function to determine dynamic NPCs for a location
function determineActiveDynamicNpcsForLocation(locationId: string, locationsData: Record<string, Location>): string[] | null {
  const location = locationsData[locationId];
  if (location?.dynamicNpcConfig) {
    const config = location.dynamicNpcConfig;
    if (Math.random() < config.baseSpawnChance) {
      const numToSpawn = Math.floor(Math.random() * (config.maxSpawnCount + 1)); // Max is inclusive
      if (numToSpawn === 0 && config.maxSpawnCount > 0) {
          // This case can be fine if 0 is a valid outcome. Or adjust logic for min 1.
          // For now, allowing 0 if Math.random gives 0 for numToSpawn.
      }
      // Shuffle possible NPCs and take the required number
      const shuffledNpcIds = [...config.possibleNpcIds].sort(() => 0.5 - Math.random());
      return shuffledNpcIds.slice(0, Math.min(numToSpawn, shuffledNpcIds.length));
    }
    return []; // Spawn chance failed, but config exists, so explicitly empty.
  }
  return null; // No dynamic NPC config for this location.
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
        if (DIRECTION_VECTORS[action.targetId as keyof typeof DIRECTION_VECTORS]) {
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
    case 'use_item': // Corrected from USE_ITEM based on type ActionType
        if(action.payload?.itemId && ITEMS[action.payload.itemId]) {
            return `You use the ${ITEMS[action.payload.itemId].name}.`;
        }
        return `You use an item.`;
    case 'DROP_ITEM':
        if(action.payload?.itemId && ITEMS[action.payload.itemId]) {
            return `You drop the ${ITEMS[action.payload.itemId].name}.`;
        }
        return `You drop an item.`;
    case 'ask_oracle':
    case 'toggle_map':
    case 'toggle_submap_visibility':
    case 'save_game':
    case 'go_to_main_menu':
    case 'toggle_dev_menu':
    case 'UPDATE_INSPECTED_TILE_DESCRIPTION':
    case 'TOGGLE_DISCOVERY_LOG':
      return null;
    default:
      if (action.label && !action.type.startsWith('SET_') && !action.type.startsWith('TOGGLE_')) {
         return `> ${action.label}`;
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

  const addGeminiLog = useCallback((functionName: string, prompt: string, response: string) => {
    const logEntry: GeminiLogEntry = {
      timestamp: new Date(),
      functionName,
      prompt,
      response,
    };
    dispatch({ type: 'ADD_GEMINI_LOG_ENTRY', payload: logEntry });
  }, [dispatch]);

  const logDiscovery = useCallback((newLocation: Location) => {
    const alreadyDiscovered = gameState.discoveryLog.some(entry =>
      entry.type === DiscoveryType.LOCATION_DISCOVERY &&
      entry.flags.some(f => f.key === 'locationId' && f.value === newLocation.id)
    );

    if (!alreadyDiscovered) {
      const discoveryEntry: Omit<DiscoveryEntry, 'id' | 'timestamp' | 'isRead'> = {
        gameTime: gameState.gameTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
        type: DiscoveryType.LOCATION_DISCOVERY,
        title: `Location Discovered: ${newLocation.name}`,
        content: `You have discovered ${newLocation.name}. ${newLocation.baseDescription}`,
        source: {
          type: 'LOCATION',
          id: newLocation.id,
          name: newLocation.name,
        },
        flags: [{ key: 'locationId', value: newLocation.id, label: newLocation.name }],
        isQuestRelated: false,
        associatedLocationId: newLocation.id,
        worldMapCoordinates: newLocation.mapCoordinates,
      };
      dispatch({ type: 'ADD_DISCOVERY_ENTRY', payload: discoveryEntry });
    }
  }, [gameState.discoveryLog, gameState.gameTime, dispatch]);


  const handleMoveAction = useCallback(async (action: Action, playerContext: string) => {
    if (!action.targetId || !gameState.subMapCoordinates || !gameState.mapData) {
        addMessage("Cannot determine movement destination.", "system");
        dispatch({ type: 'SET_GEMINI_ACTIONS', payload: null });
        return;
    }

    const directionKey = action.targetId as keyof typeof DIRECTION_VECTORS;
    const currentLoc = getCurrentLocation();
    const currentWorldX = currentLoc.mapCoordinates.x;
    const currentWorldY = currentLoc.mapCoordinates.y;

    let newLocationId = gameState.currentLocationId;
    let newSubMapCoordinates = { ...gameState.subMapCoordinates };
    let newMapDataForDispatch = gameState.mapData;
    let newDescriptionResult: GeminiService.GenerateTextResult | null = null;
    let activeDynamicNpcIdsForNewLocation: string[] | null = null;
    let timeToAdvanceSeconds = 0;
    let movedToNewNamedLocation: Location | null = null;


    if (!DIRECTION_VECTORS[directionKey]) {
        const targetLocation = LOCATIONS[action.targetId];
        if (targetLocation) {
            newLocationId = action.targetId;
            newSubMapCoordinates = { x: Math.floor(SUBMAP_DIMENSIONS.cols / 2), y: Math.floor(SUBMAP_DIMENSIONS.rows / 2) };
            activeDynamicNpcIdsForNewLocation = determineActiveDynamicNpcsForLocation(newLocationId, LOCATIONS);
            timeToAdvanceSeconds = 3600;
            movedToNewNamedLocation = targetLocation;


            if (newMapDataForDispatch) {
                const newTiles = newMapDataForDispatch.tiles.map(row => row.map(t => ({ ...t, isPlayerCurrent: false })));
                if (newTiles[targetLocation.mapCoordinates.y] && newTiles[targetLocation.mapCoordinates.y][targetLocation.mapCoordinates.x]) {
                    newTiles[targetLocation.mapCoordinates.y][targetLocation.mapCoordinates.x].isPlayerCurrent = true;
                    newTiles[targetLocation.mapCoordinates.y][targetLocation.mapCoordinates.x].discovered = true;
                     for (let y_offset = -1; y_offset <= 1; y_offset++) {
                        for (let x_offset = -1; x_offset <= 1; x_offset++) {
                            const adjY = targetLocation.mapCoordinates.y + y_offset;
                            const adjX = targetLocation.mapCoordinates.x + x_offset;
                            if (adjY >= 0 && adjY < newMapDataForDispatch.gridSize.rows && adjX >= 0 && adjX < newMapDataForDispatch.gridSize.cols) {
                                newTiles[adjY][adjX].discovered = true;
                            }
                        }
                    }
                }
                newMapDataForDispatch = { ...newMapDataForDispatch, tiles: newTiles };
            }

            newDescriptionResult = await GeminiService.generateLocationDescription(targetLocation.name, `Player (${playerContext}) enters ${targetLocation.name}.`);
            addGeminiLog('generateLocationDescription', newDescriptionResult.promptSent, newDescriptionResult.rawResponse);
        } else {
            addMessage(`Cannot move to ${action.targetId}. Location does not exist.`, 'system');
            dispatch({ type: 'SET_GEMINI_ACTIONS', payload: null });
            return;
        }
    } else {
        const { dx, dy } = DIRECTION_VECTORS[directionKey];
        let nextSubMapX = gameState.subMapCoordinates.x + dx;
        let nextSubMapY = gameState.subMapCoordinates.y + dy;

        newSubMapCoordinates = { x: nextSubMapX, y: nextSubMapY };

        if (nextSubMapX >= 0 && nextSubMapX < SUBMAP_DIMENSIONS.cols && nextSubMapY >= 0 && nextSubMapY < SUBMAP_DIMENSIONS.rows) {
            newLocationId = gameState.currentLocationId;
            activeDynamicNpcIdsForNewLocation = gameState.currentLocationActiveDynamicNpcIds;
            timeToAdvanceSeconds = 1800;

            const biome = BIOMES[currentLoc.biomeId];
            newDescriptionResult = await GeminiService.generateWildernessLocationDescription(biome?.name || 'Unknown Biome', {x: currentWorldX, y: currentWorldY}, newSubMapCoordinates, playerContext, getTileTooltipText(gameState.mapData.tiles[currentWorldY][currentWorldX]));
            addGeminiLog('generateWildernessLocationDescription', newDescriptionResult.promptSent, newDescriptionResult.rawResponse);
        } else {
            const targetWorldMapX = currentWorldX + dx;
            const targetWorldMapY = currentWorldY + dy;

            if (targetWorldMapY < 0 || targetWorldMapY >= gameState.mapData.gridSize.rows ||
                targetWorldMapX < 0 || targetWorldMapX >= gameState.mapData.gridSize.cols) {
                addMessage("You can't go that way; it's the edge of the known world.", "system");
                dispatch({ type: 'SET_GEMINI_ACTIONS', payload: null });
                return;
            }

            const targetWorldTile = gameState.mapData.tiles[targetWorldMapY][targetWorldMapX];
            const targetBiome = BIOMES[targetWorldTile.biomeId];

            if (!targetBiome?.passable) {
                addMessage(targetBiome.impassableReason || `You cannot enter the ${targetBiome.name}.`, "system");
                dispatch({ type: 'SET_GEMINI_ACTIONS', payload: null });
                return;
            }

            newLocationId = targetWorldTile.locationId || `coord_${targetWorldMapX}_${targetWorldMapY}`;
            activeDynamicNpcIdsForNewLocation = determineActiveDynamicNpcsForLocation(newLocationId, LOCATIONS);
            timeToAdvanceSeconds = 3600;

            if (nextSubMapX < 0) newSubMapCoordinates.x = SUBMAP_DIMENSIONS.cols - 1;
            else if (nextSubMapX >= SUBMAP_DIMENSIONS.cols) newSubMapCoordinates.x = 0;
            else newSubMapCoordinates.x = nextSubMapX;

            if (nextSubMapY < 0) newSubMapCoordinates.y = SUBMAP_DIMENSIONS.rows - 1;
            else if (nextSubMapY >= SUBMAP_DIMENSIONS.rows) newSubMapCoordinates.y = 0;
            else newSubMapCoordinates.y = nextSubMapY;

            const newTiles = newMapDataForDispatch.tiles.map(row => row.map(tile => ({ ...tile, isPlayerCurrent: false })));
            if (newTiles[targetWorldMapY] && newTiles[targetWorldMapY][targetWorldMapX]) {
                newTiles[targetWorldMapY][targetWorldMapX].isPlayerCurrent = true;
                newTiles[targetWorldMapY][targetWorldMapX].discovered = true;
                for (let y_offset = -1; y_offset <= 1; y_offset++) {
                    for (let x_offset = -1; x_offset <= 1; x_offset++) {
                        const adjY = targetWorldMapY + y_offset;
                        const adjX = targetWorldMapX + x_offset;
                        if (adjY >= 0 && adjY < newMapDataForDispatch.gridSize.rows && adjX >= 0 && adjX < newMapDataForDispatch.gridSize.cols) {
                            newTiles[adjY][adjX].discovered = true;
                        }
                    }
                }
            }
            newMapDataForDispatch = { ...newMapDataForDispatch, tiles: newTiles };

            if (LOCATIONS[newLocationId]) {
                const targetDefLocation = LOCATIONS[newLocationId];
                newDescriptionResult = await GeminiService.generateLocationDescription(targetDefLocation.name, `Player (${playerContext}) enters ${targetDefLocation.name}.`);
                addGeminiLog('generateLocationDescription', newDescriptionResult.promptSent, newDescriptionResult.rawResponse);
                newSubMapCoordinates = { x: Math.floor(SUBMAP_DIMENSIONS.cols / 2), y: Math.floor(SUBMAP_DIMENSIONS.rows / 2) };
                movedToNewNamedLocation = targetDefLocation;
            } else {
                newDescriptionResult = await GeminiService.generateWildernessLocationDescription(targetBiome?.name || 'Unknown Biome', {x: targetWorldMapX, y: targetWorldMapY}, newSubMapCoordinates, playerContext, getTileTooltipText(targetWorldTile));
                addGeminiLog('generateWildernessLocationDescription', newDescriptionResult.promptSent, newDescriptionResult.rawResponse);
            }
        }
    }

    if (timeToAdvanceSeconds > 0) {
        dispatch({ type: 'ADVANCE_TIME', payload: { seconds: timeToAdvanceSeconds } });
    }
    dispatch({ type: 'MOVE_PLAYER', payload: { newLocationId, newSubMapCoordinates, mapData: newMapDataForDispatch, activeDynamicNpcIds: activeDynamicNpcIdsForNewLocation } });

    if (movedToNewNamedLocation) {
        logDiscovery(movedToNewNamedLocation);
    }

    if (newDescriptionResult && newDescriptionResult.text && !newDescriptionResult.text.startsWith("Error in")) {
        addMessage(newDescriptionResult.text, 'system');
    } else if (newDescriptionResult && newDescriptionResult.text.startsWith("Error in")) {
        addMessage("There was an issue describing your new surroundings.", 'system');
    }
    dispatch({ type: 'SET_GEMINI_ACTIONS', payload: null });
  }, [addMessage, dispatch, gameState.mapData, gameState.subMapCoordinates, gameState.currentLocationId, gameState.currentLocationActiveDynamicNpcIds, getCurrentLocation, getTileTooltipText, addGeminiLog, logDiscovery]);


  const handleLookAroundAction = useCallback(async (generalActionContext: string) => {
    let worldMapTileTooltipForGemini: string | null = null;
    if (gameState.mapData && gameState.currentLocationId.startsWith('coord_')) {
        const parts = gameState.currentLocationId.split('_');
        const worldX = parseInt(parts[1]);
        const worldY = parseInt(parts[2]);
        if (gameState.mapData.tiles[worldY] && gameState.mapData.tiles[worldY][worldX]) {
            worldMapTileTooltipForGemini = getTileTooltipText(gameState.mapData.tiles[worldY][worldX]);
        }
    }
    const lookDescResult = await GeminiService.generateActionOutcome('Player looks around the area.', generalActionContext, false, worldMapTileTooltipForGemini);
    addGeminiLog('generateActionOutcome (look_around)', lookDescResult.promptSent, lookDescResult.rawResponse);
    if (lookDescResult.text && !lookDescResult.text.startsWith("Error in")) {
        addMessage(lookDescResult.text, 'system');
    } else {
        addMessage("You look around, but nothing new catches your eye.", 'system');
    }

    if (lookDescResult.text && !lookDescResult.text.startsWith("Error in")) {
        const customActionsResult = await GeminiService.generateCustomActions(lookDescResult.text, generalActionContext);
        addGeminiLog('generateCustomActions', customActionsResult.promptSent, customActionsResult.rawResponse);

        const existingCompassDirections = Object.keys(DIRECTION_VECTORS);
        const filteredActions = customActionsResult.actions.filter(action => {
            const labelLower = action.label.toLowerCase();
            const promptLower = action.payload?.geminiPrompt?.toLowerCase() || "";
            return !existingCompassDirections.some(dir =>
                labelLower.includes(dir.toLowerCase()) || promptLower.includes(dir.toLowerCase())
            );
        });
        dispatch({ type: 'SET_GEMINI_ACTIONS', payload: filteredActions.length > 0 ? filteredActions : null });
    } else {
        dispatch({ type: 'SET_GEMINI_ACTIONS', payload: null });
    }
    dispatch({ type: 'RESET_NPC_INTERACTION_CONTEXT' });
  }, [addMessage, dispatch, gameState.mapData, gameState.currentLocationId, getTileTooltipText, addGeminiLog]);

  const handleTalkAction = useCallback(async (action: Action, playerContext: string, generalActionContext: string) => {
    if (!action.targetId) {
        addMessage("Invalid talk target.", "system");
        return;
    }
    const npc = NPCS[action.targetId];
    if (npc) {
        const isFollowUp = npc.id === gameState.lastInteractedNpcId;
        const npcResponseResult = await GeminiService.generateNPCResponse(
            npc.name,
            `Player (${playerContext}) approaches and wants to talk. Initial greeting or observation.`,
            generalActionContext,
            isFollowUp,
            gameState.lastNpcResponse || undefined
        );
        addGeminiLog('generateNPCResponse', npcResponseResult.promptSent, npcResponseResult.rawResponse);

        if (npcResponseResult.text && !npcResponseResult.text.startsWith("Error in")) {
            addMessage(`${npc.name}: "${npcResponseResult.text}"`, 'npc');
            dispatch({ type: 'SET_LAST_NPC_INTERACTION', payload: { npcId: npc.id, response: npcResponseResult.text } });
            try {
                const audioContent = await synthesizeSpeech(npcResponseResult.text, npc.voice?.name || 'Kore');
                await playPcmAudio(audioContent);
            } catch (ttsError: any) {
                addMessage(`(TTS Error: Could not synthesize speech for ${npc.name})`, 'system');
            }
        } else {
            addMessage(`${npc.name} seems unresponsive or an error occurred.`, 'system');
            dispatch({ type: 'RESET_NPC_INTERACTION_CONTEXT' });
        }
    } else {
        addMessage(`There is no one named ${action.targetId} to talk to here.`, 'system');
        dispatch({ type: 'RESET_NPC_INTERACTION_CONTEXT' });
    }
    dispatch({ type: 'SET_GEMINI_ACTIONS', payload: null });
  }, [addMessage, playPcmAudio, dispatch, gameState.lastInteractedNpcId, gameState.lastNpcResponse, addGeminiLog]);

  const handleTakeItemAction = useCallback(async (action: Action) => {
    if (!action.targetId) {
        addMessage("Invalid item target.", "system");
        dispatch({ type: 'SET_GEMINI_ACTIONS', payload: null });
        return;
    }
    const itemToTake = ITEMS[action.targetId];
    const currentLocId = gameState.currentLocationId;
    if (currentLocId.startsWith('coord_')) {
        addMessage(`There are no specific items to take in this wilderness area.`, 'system');
        dispatch({ type: 'SET_GEMINI_ACTIONS', payload: null });
        return;
    }
    const itemsCurrentlyInLoc = gameState.dynamicLocationItemIds[currentLocId] || [];
    if (itemToTake && itemsCurrentlyInLoc.includes(action.targetId)) {
        dispatch({ type: 'TAKE_ITEM', payload: { item: itemToTake, locationId: currentLocId } });
        // Message about taking item is now handled by the reducer via ADD_DISCOVERY_ENTRY
    } else {
        addMessage(`Cannot take ${ITEMS[action.targetId]?.name || action.targetId}. It's not here or doesn't exist.`, 'system');
    }
    dispatch({ type: 'SET_GEMINI_ACTIONS', payload: null });
    dispatch({ type: 'RESET_NPC_INTERACTION_CONTEXT' });
  }, [addMessage, dispatch, gameState.currentLocationId, gameState.dynamicLocationItemIds]);

  const handleAskOracleAction = useCallback(async (action: Action, generalActionContext: string) => {
    if (action.payload?.query) {
        const playerQuery = action.payload.query;
        addMessage(`You approach the Oracle and ask: "${playerQuery}"`, 'player');
        dispatch({ type: 'ADVANCE_TIME', payload: { seconds: 3600 } });
        const oracleResponseResult = await GeminiService.generateOracleResponse(playerQuery, generalActionContext);
        addGeminiLog('generateOracleResponse', oracleResponseResult.promptSent, oracleResponseResult.rawResponse);
        if (oracleResponseResult.text && !oracleResponseResult.text.startsWith("Error in")) {
            addMessage(oracleResponseResult.text, 'system');
            try {
                const audioContent = await synthesizeSpeech(oracleResponseResult.text, 'Charon');
                await playPcmAudio(audioContent);
            } catch (ttsError: any) {
                addMessage(`(TTS Error: Could not synthesize speech for Oracle)`, 'system');
            }
        } else {
            addMessage("The Oracle remains silent, or an error prevented their response.", 'system');
        }
    } else {
        addMessage('You ponder, but ask nothing of the Oracle.', 'system');
    }
    dispatch({ type: 'SET_GEMINI_ACTIONS', payload: null });
    dispatch({ type: 'RESET_NPC_INTERACTION_CONTEXT' });
  }, [addMessage, playPcmAudio, dispatch, addGeminiLog]);

  const handleGeminiCustomAction = useCallback(async (action: Action, generalActionContext: string) => {
    if (action.payload?.geminiPrompt) {
      const outcomeResult = await GeminiService.generateActionOutcome(action.payload.geminiPrompt, generalActionContext, true);
      addGeminiLog('generateActionOutcome (custom)', outcomeResult.promptSent, outcomeResult.rawResponse);
      if (outcomeResult.text && !outcomeResult.text.startsWith("Error in")) {
        addMessage(outcomeResult.text, 'system');
      } else {
        addMessage("You attempt the action, but the outcome is unclear or an error occurred.", "system");
      }
      dispatch({ type: 'SET_GEMINI_ACTIONS', payload: null });
      dispatch({ type: 'RESET_NPC_INTERACTION_CONTEXT' });
    } else {
      addMessage('Invalid custom action.', 'system');
      dispatch({ type: 'SET_GEMINI_ACTIONS', payload: null });
    }
  }, [addMessage, dispatch, addGeminiLog]);

  const handleToggleMapAction = useCallback(() => {
    dispatch({ type: 'TOGGLE_MAP_VISIBILITY' });
    dispatch({ type: 'RESET_NPC_INTERACTION_CONTEXT' });
  }, [dispatch]);

  const handleToggleSubmapAction = useCallback(() => {
    dispatch({ type: 'TOGGLE_SUBMAP_VISIBILITY' });
    dispatch({ type: 'RESET_NPC_INTERACTION_CONTEXT' });
  }, [dispatch]);

  const handleSaveGameAction = useCallback(async () => {
    dispatch({type: 'SET_LOADING', payload: { isLoading: true, message: "Saving your progress..." }});
    const success = await SaveLoadService.saveGame(gameState);
    if (success) {
        addMessage("Game Saved!", 'system');
    } else {
        addMessage("Failed to save game. Check console or try again later.", 'system');
    }
    dispatch({type: 'SET_LOADING', payload: { isLoading: false }});
    dispatch({ type: 'SET_GEMINI_ACTIONS', payload: null });
  }, [gameState, addMessage, dispatch]);

  const handleGoToMainMenuAction = useCallback(async () => {
    addMessage("Returning to Main Menu...", 'system');
    if (!USE_DUMMY_CHARACTER_FOR_DEV) {
        await handleSaveGameAction();
    }
    dispatch({ type: 'SET_GAME_PHASE', payload: GamePhase.MAIN_MENU });
  }, [addMessage, handleSaveGameAction, dispatch]);

  const handleInspectSubmapTileAction = useCallback(async(action: Action) => {
    if (!action.payload?.inspectTileDetails || !gameState.playerCharacter) {
        addMessage("Cannot inspect tile: missing details.", "system");
        return;
    }
    const { inspectTileDetails } = action.payload;
    const playerChar = gameState.playerCharacter;
    const gameTimeStr = gameState.gameTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });

    const inspectionResult = await GeminiService.generateTileInspectionDetails(
        inspectTileDetails,
        playerChar,
        gameTimeStr
    );
    addGeminiLog('generateTileInspectionDetails', inspectionResult.promptSent, inspectionResult.rawResponse);
    if (inspectionResult.text && !inspectionResult.text.startsWith("Error in")) {
        addMessage(inspectionResult.text, "system");
        const tileKey = `${inspectTileDetails.parentWorldMapCoords.x}_${inspectTileDetails.parentWorldMapCoords.y}_${inspectTileDetails.tileX}_${inspectTileDetails.tileY}`;
        const updatePayload: UpdateInspectedTileDescriptionPayload = {
            tileKey,
            description: inspectionResult.text,
        };
        dispatch({ type: 'UPDATE_INSPECTED_TILE_DESCRIPTION', payload: updatePayload });
    } else {
        addMessage("Your inspection reveals nothing new or an error occurred.", "system");
    }

    dispatch({ type: 'ADVANCE_TIME', payload: { seconds: 300 } });
    dispatch({ type: 'SET_GEMINI_ACTIONS', payload: null });
    dispatch({ type: 'RESET_NPC_INTERACTION_CONTEXT' });
  }, [addMessage, dispatch, gameState.playerCharacter, gameState.gameTime, addGeminiLog]);


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

      const currentLoc = getCurrentLocation();
      const npcsInLocation = getCurrentNPCs();
      const itemsInLocationNames =
        currentLoc.itemIds
          ?.map((id) => ITEMS[id]?.name)
          .filter(Boolean)
          .join(', ') || 'nothing special';

      const subMapCtx = gameState.subMapCoordinates ? `sub-tile (${gameState.subMapCoordinates.x},${gameState.subMapCoordinates.y}) within ` : '';
      const detailedLocationContext = `${subMapCtx}${currentLoc.name}. Biome: ${BIOMES[currentLoc.biomeId]?.name || 'Unknown'}. Game Time: ${gameState.gameTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}`;

      const generalActionContext = `Player (${playerContext}) is at ${detailedLocationContext} NPCs present: ${
        npcsInLocation.map((n) => n.name).join(', ') || 'no one'
      }. Visible items: ${itemsInLocationNames}.`;

      try {
        switch (action.type) {
          case 'move':
            await handleMoveAction(action, playerContext);
            break;
          case 'look_around':
            await handleLookAroundAction(generalActionContext);
            break;
          case 'talk':
            await handleTalkAction(action, playerContext, generalActionContext);
            break;
          case 'take_item':
            await handleTakeItemAction(action);
            break;
          case 'EQUIP_ITEM':
            dispatch({ type: 'EQUIP_ITEM', payload: action.payload as EquipItemPayload });
            break;
          case 'UNEQUIP_ITEM':
            dispatch({ type: 'UNEQUIP_ITEM', payload: action.payload as UnequipItemPayload });
            break;
          case 'use_item':
            dispatch({ type: 'USE_ITEM', payload: action.payload as UseItemPayload });
            break;
          case 'DROP_ITEM':
            dispatch({ type: 'DROP_ITEM', payload: action.payload as DropItemPayload });
            break;
          case 'ask_oracle':
            await handleAskOracleAction(action, generalActionContext);
            break;
          case 'gemini_custom_action':
            await handleGeminiCustomAction(action, generalActionContext);
            break;
          case 'inspect_submap_tile':
            await handleInspectSubmapTileAction(action);
            break;
          case 'save_game':
            await handleSaveGameAction();
            return;
          case 'go_to_main_menu':
            await handleGoToMainMenuAction();
            return;
          case 'toggle_map':
            handleToggleMapAction();
            return;
          case 'toggle_submap_visibility':
            handleToggleSubmapAction();
            return;
          case 'TOGGLE_DISCOVERY_LOG':
            dispatch({ type: 'TOGGLE_DISCOVERY_LOG_VISIBILITY' });
            return;
          case 'TOGGLE_GLOSSARY_VISIBILITY':
             dispatch({ type: 'TOGGLE_GLOSSARY_VISIBILITY' });
             return;
          case 'toggle_dev_menu':
            dispatch({ type: 'TOGGLE_DEV_MENU' });
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
             // Ensure loading is false unless it's a save game action that sets its own loading.
             if (gameState.isLoading && action.type !== 'save_game') {
                dispatch({ type: 'SET_LOADING', payload: { isLoading: false } });
             }
        }
      }
    },
    [
      gameState, dispatch, addMessage, playPcmAudio, getCurrentLocation, getCurrentNPCs, getTileTooltipText, addGeminiLog, logDiscovery,
      handleMoveAction, handleLookAroundAction, handleTalkAction,
      handleTakeItemAction, handleAskOracleAction, handleToggleMapAction,
      handleToggleSubmapAction, handleGeminiCustomAction, handleSaveGameAction, handleGoToMainMenuAction,
      handleInspectSubmapTileAction
    ],
  );

  return { processAction };
}