/**
 * @file src/hooks/actions/handleMovement.ts
 * Handles 'move' actions for the game.
 */
import { GameState, Action, Location, MapData } from '../../types';
import { AppAction } from '../../state/appState';
import * as GeminiService from '../../services/geminiService';
import { AddMessageFn, AddGeminiLogFn, LogDiscoveryFn, GetTileTooltipTextFn } from './actionHandlerTypes';
import { LOCATIONS, DIRECTION_VECTORS, SUBMAP_DIMENSIONS, BIOMES, STARTING_LOCATION_ID } from '../../constants';
import { determineActiveDynamicNpcsForLocation } from '../../utils/locationUtils';

interface HandleMovementProps {
  action: Action;
  gameState: GameState;
  dispatch: React.Dispatch<AppAction>;
  addMessage: AddMessageFn;
  addGeminiLog: AddGeminiLogFn;
  logDiscovery: LogDiscoveryFn;
  getTileTooltipText: GetTileTooltipTextFn;
  playerContext: string;
}

export async function handleMovement({
  action,
  gameState,
  dispatch,
  addMessage,
  addGeminiLog,
  logDiscovery,
  getTileTooltipText,
  playerContext,
}: HandleMovementProps): Promise<void> {
  if (!action.targetId || !gameState.subMapCoordinates || !gameState.mapData) {
    addMessage("Cannot determine movement destination.", "system");
    dispatch({ type: 'SET_GEMINI_ACTIONS', payload: null });
    return;
  }

  const directionKey = action.targetId as keyof typeof DIRECTION_VECTORS;
  const currentLocData = gameState.currentLocationId.startsWith('coord_')
    ? {
        id: gameState.currentLocationId,
        name: BIOMES[LOCATIONS[STARTING_LOCATION_ID]?.biomeId || 'plains']?.name || 'Wilderness', // Fallback name
        mapCoordinates: {
            x: parseInt(gameState.currentLocationId.split('_')[1]),
            y: parseInt(gameState.currentLocationId.split('_')[2])
        },
        biomeId: LOCATIONS[STARTING_LOCATION_ID]?.biomeId || 'plains', // Fallback biomeId
        exits: {}, // Wilderness has no predefined exits in this context
      } as Location // Cast to Location, assuming these props are enough for this context
    : LOCATIONS[gameState.currentLocationId];
  
  const currentLoc = currentLocData;


  const currentWorldX = currentLoc.mapCoordinates.x;
  const currentWorldY = currentLoc.mapCoordinates.y;

  let newLocationId = gameState.currentLocationId;
  let newSubMapCoordinates = { ...gameState.subMapCoordinates };
  let newMapDataForDispatch: MapData | undefined = gameState.mapData ? { ...gameState.mapData, tiles: gameState.mapData.tiles.map(row => row.map(tile => ({...tile}))) } : undefined;
  let newDescriptionResult: GeminiService.GenerateTextResult | null = null;
  let activeDynamicNpcIdsForNewLocation: string[] | null = null;
  let timeToAdvanceSeconds = 0;
  let movedToNewNamedLocation: Location | null = null;

  if (!DIRECTION_VECTORS[directionKey]) { // Moving to a named exit
    const targetLocation = LOCATIONS[action.targetId];
    if (targetLocation) {
      newLocationId = action.targetId;
      newSubMapCoordinates = { x: Math.floor(SUBMAP_DIMENSIONS.cols / 2), y: Math.floor(SUBMAP_DIMENSIONS.rows / 2) };
      activeDynamicNpcIdsForNewLocation = determineActiveDynamicNpcsForLocation(newLocationId, LOCATIONS);
      timeToAdvanceSeconds = 3600;
      movedToNewNamedLocation = targetLocation;

      if (newMapDataForDispatch) {
        const newTiles = newMapDataForDispatch.tiles.map(row => row.map(t => ({ ...t, isPlayerCurrent: false })));
        if (newTiles[targetLocation.mapCoordinates.y]?.[targetLocation.mapCoordinates.x]) {
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
        newMapDataForDispatch.tiles = newTiles;
      }
      newDescriptionResult = await GeminiService.generateLocationDescription(targetLocation.name, `Player (${playerContext}) enters ${targetLocation.name}.`);
      addGeminiLog('generateLocationDescription', newDescriptionResult.promptSent, newDescriptionResult.rawResponse);
    } else {
      addMessage(`Cannot move to ${action.targetId}. Location does not exist.`, 'system');
      dispatch({ type: 'SET_GEMINI_ACTIONS', payload: null });
      return;
    }
  } else { // Moving via compass direction
    const { dx, dy } = DIRECTION_VECTORS[directionKey];
    let nextSubMapX = gameState.subMapCoordinates.x + dx;
    let nextSubMapY = gameState.subMapCoordinates.y + dy;
    newSubMapCoordinates = { x: nextSubMapX, y: nextSubMapY };

    if (nextSubMapX >= 0 && nextSubMapX < SUBMAP_DIMENSIONS.cols && nextSubMapY >= 0 && nextSubMapY < SUBMAP_DIMENSIONS.rows) { // Moving within current submap
      newLocationId = gameState.currentLocationId;
      activeDynamicNpcIdsForNewLocation = gameState.currentLocationActiveDynamicNpcIds;
      timeToAdvanceSeconds = 1800;
      const biome = BIOMES[currentLoc.biomeId];
      const currentWorldTile = gameState.mapData?.tiles[currentWorldY]?.[currentWorldX];
      const tooltip = currentWorldTile ? getTileTooltipText(currentWorldTile) : null;
      newDescriptionResult = await GeminiService.generateWildernessLocationDescription(biome?.name || 'Unknown Biome', {x: currentWorldX, y: currentWorldY}, newSubMapCoordinates, playerContext, tooltip);
      addGeminiLog('generateWildernessLocationDescription', newDescriptionResult.promptSent, newDescriptionResult.rawResponse);
    } else { // Moving to a new world map tile
      const targetWorldMapX = currentWorldX + dx;
      const targetWorldMapY = currentWorldY + dy;

      if (!newMapDataForDispatch || targetWorldMapY < 0 || targetWorldMapY >= newMapDataForDispatch.gridSize.rows ||
          targetWorldMapX < 0 || targetWorldMapX >= newMapDataForDispatch.gridSize.cols) {
        addMessage("You can't go that way; it's the edge of the known world.", "system");
        dispatch({ type: 'SET_GEMINI_ACTIONS', payload: null });
        return;
      }

      const targetWorldTile = newMapDataForDispatch.tiles[targetWorldMapY][targetWorldMapX];
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
      // else newSubMapCoordinates.x remains nextSubMapX;

      if (nextSubMapY < 0) newSubMapCoordinates.y = SUBMAP_DIMENSIONS.rows - 1;
      else if (nextSubMapY >= SUBMAP_DIMENSIONS.rows) newSubMapCoordinates.y = 0;
      // else newSubMapCoordinates.y remains nextSubMapY;
      
      const newTiles = newMapDataForDispatch.tiles.map(row => row.map(tile => ({ ...tile, isPlayerCurrent: false })));
      if (newTiles[targetWorldMapY]?.[targetWorldMapX]) {
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
      newMapDataForDispatch.tiles = newTiles;

      if (LOCATIONS[newLocationId]) {
        const targetDefLocation = LOCATIONS[newLocationId];
        newDescriptionResult = await GeminiService.generateLocationDescription(targetDefLocation.name, `Player (${playerContext}) enters ${targetDefLocation.name}.`);
        addGeminiLog('generateLocationDescription (world move)', newDescriptionResult.promptSent, newDescriptionResult.rawResponse);
        newSubMapCoordinates = { x: Math.floor(SUBMAP_DIMENSIONS.cols / 2), y: Math.floor(SUBMAP_DIMENSIONS.rows / 2) };
        movedToNewNamedLocation = targetDefLocation;
      } else {
        newDescriptionResult = await GeminiService.generateWildernessLocationDescription(targetBiome?.name || 'Unknown Biome', {x: targetWorldMapX, y: targetWorldMapY}, newSubMapCoordinates, playerContext, getTileTooltipText(targetWorldTile));
        addGeminiLog('generateWildernessLocationDescription (world move)', newDescriptionResult.promptSent, newDescriptionResult.rawResponse);
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
}
