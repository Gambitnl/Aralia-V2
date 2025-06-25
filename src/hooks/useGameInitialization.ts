/**
 * @file src/hooks/useGameInitialization.ts
 * Custom hook for managing game initialization, new game setup, and loading games.
 */
import { useCallback } from 'react';
import { GameState, GamePhase, PlayerCharacter, MapData, Location } from '../types';
import { AppAction } from '../state/appState';
import { STARTING_LOCATION_ID, LOCATIONS, MAP_GRID_SIZE, BIOMES, SUBMAP_DIMENSIONS } from '../constants';
import { generateMap } from '../services/mapService';
import * as SaveLoadService from '../services/saveLoadService';
import { determineActiveDynamicNpcsForLocation } from '../utils/locationUtils'; // Import centralized utility

type AddMessageFn = (text: string, sender?: 'system' | 'player' | 'npc') => void;

interface UseGameInitializationProps {
  dispatch: React.Dispatch<AppAction>;
  addMessage: AddMessageFn;
  currentMapData: MapData | null; // Pass current map data from App state
}

export function useGameInitialization({
  dispatch,
  addMessage,
  currentMapData,
}: UseGameInitializationProps) {

  const handleNewGame = useCallback(() => {
    const initialDynamicItems: Record<string, string[]> = {};
    Object.values(LOCATIONS).forEach(loc => {
        initialDynamicItems[loc.id] = loc.itemIds ? [...loc.itemIds] : [];
    });
    const newMapData = generateMap(MAP_GRID_SIZE.rows, MAP_GRID_SIZE.cols, LOCATIONS, BIOMES);
    // Note: Dynamic NPCs for STARTING_LOCATION_ID will be determined by the reducer in START_NEW_GAME_SETUP.
    dispatch({ type: 'START_NEW_GAME_SETUP', payload: { mapData: newMapData, dynamicLocationItemIds: initialDynamicItems } });
  }, [dispatch]);

  const handleSkipCharacterCreator = useCallback(() => {
    const initialDynamicItems: Record<string, string[]> = {};
    Object.values(LOCATIONS).forEach(loc => {
        initialDynamicItems[loc.id] = loc.itemIds ? [...loc.itemIds] : [];
    });
    const newMapData = generateMap(MAP_GRID_SIZE.rows, MAP_GRID_SIZE.cols, LOCATIONS, BIOMES);
    // Note: Dynamic NPCs for STARTING_LOCATION_ID will be determined by the reducer in START_GAME_FOR_DUMMY.
    dispatch({ type: 'START_GAME_FOR_DUMMY', payload: { mapData: newMapData, dynamicLocationItemIds: initialDynamicItems }});
  }, [dispatch]);

  const handleLoadGameFlow = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: { isLoading: true } });
    const loadedState = await SaveLoadService.loadGame();
    if (loadedState) {
        // Note: Dynamic NPCs for loadedState.currentLocationId will be determined by the reducer in LOAD_GAME_SUCCESS.
        dispatch({ type: 'LOAD_GAME_SUCCESS', payload: loadedState });
        addMessage("Game loaded successfully.", "system");
    } else {
        addMessage("Failed to load game. No save data found or data corrupted.", "system");
        dispatch({ type: 'SET_GAME_PHASE', payload: GamePhase.MAIN_MENU });
    }
    dispatch({ type: 'SET_LOADING', payload: { isLoading: false } });
  }, [addMessage, dispatch]);

  const startGame = useCallback(
    async (character: PlayerCharacter) => {
      const initialLocation = LOCATIONS[STARTING_LOCATION_ID];
      const initialDynamicItems: Record<string, string[]> = {};
      Object.values(LOCATIONS).forEach(loc => {
          initialDynamicItems[loc.id] = loc.itemIds ? [...loc.itemIds] : [];
      });
      const mapDataToUse = currentMapData || generateMap(MAP_GRID_SIZE.rows, MAP_GRID_SIZE.cols, LOCATIONS, BIOMES);
      const initialSubMapCoords = { x: Math.floor(SUBMAP_DIMENSIONS.cols / 2), y: Math.floor(SUBMAP_DIMENSIONS.rows / 2) };
      const initialActiveDynamicNpcs = determineActiveDynamicNpcsForLocation(STARTING_LOCATION_ID, LOCATIONS);

      dispatch({
        type: 'START_GAME_SUCCESS',
        payload: {
          character,
          mapData: mapDataToUse,
          dynamicLocationItemIds: initialDynamicItems,
          initialLocationDescription: initialLocation.baseDescription,
          initialSubMapCoordinates: initialSubMapCoords,
          initialActiveDynamicNpcIds: initialActiveDynamicNpcs,
        }
      });
    },
    [currentMapData, dispatch],
  );

  const initializeDummyPlayerState = useCallback(() => {
      const initialLocation = LOCATIONS[STARTING_LOCATION_ID];
      const mapToUse = currentMapData || generateMap(MAP_GRID_SIZE.rows, MAP_GRID_SIZE.cols, LOCATIONS, BIOMES);
      const initialSubMapCoords = { x: Math.floor(SUBMAP_DIMENSIONS.cols / 2), y: Math.floor(SUBMAP_DIMENSIONS.rows / 2) };
      const initialActiveDynamicNpcs = determineActiveDynamicNpcsForLocation(STARTING_LOCATION_ID, LOCATIONS);

      let dynamicItemsToUse: Record<string, string[]> = {};
      Object.values(LOCATIONS).forEach(loc => {
          dynamicItemsToUse[loc.id] = loc.itemIds ? [...loc.itemIds] : [];
      });
      dispatch({
        type: 'INITIALIZE_DUMMY_PLAYER_STATE',
        payload: {
            mapData: mapToUse,
            dynamicLocationItemIds: dynamicItemsToUse,
            initialLocationDescription: initialLocation.baseDescription,
            initialSubMapCoordinates: initialSubMapCoords,
            initialActiveDynamicNpcIds: initialActiveDynamicNpcs,
        }
      });
  }, [currentMapData, dispatch]);

  return {
    handleNewGame,
    handleSkipCharacterCreator,
    handleLoadGameFlow,
    startGame,
    initializeDummyPlayerState,
  };
}
