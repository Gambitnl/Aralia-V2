/**
 *
 * @file App.tsx
 * This is the root component of the Aralia RPG application.
 * It manages the overall game state, including the current game phase (main menu, character creation, playing),
 * player character data, inventory, location, messages, loading/error states, and scene visuals.
 * It orchestrates the rendering of different UI views based on the game phase.
 * 
 * READMEs reviewed for this modularization refactor:
 * - docs/PROJECT_OVERVIEW.README.md
 * - docs/README_INDEX.md
 * - src/App.README.md
 * - src/services/saveLoad.README.md
 * - src/state/appState.README.md
 * - src/hooks/useAudio.README.md
 * - src/hooks/useGameActions.README.md
 * - src/hooks/useGameInitialization.README.md
 */
import React, { useReducer, useCallback, useEffect } from 'react';
import { Location, GameMessage, NPC, MapTile, Biome, Item, PlayerCharacter } from './types';
import { appReducer, initialGameState } from './state/appState';
import { useAudio } from './hooks/useAudio';
import { useGameActions } from './hooks/useGameActions';
import { useGameInitialization } from './hooks/useGameInitialization';
import { determineActiveDynamicNpcsForLocation } from './utils/locationUtils'; 
import { GlossaryProvider } from './context/GlossaryContext'; // Added import

import {
  STARTING_LOCATION_ID,
  LOCATIONS,
  ITEMS,
  NPCS,
  GamePhase,
  DUMMY_CHARACTER_FOR_DEV,
  USE_DUMMY_CHARACTER_FOR_DEV,
  BIOMES,
  SUBMAP_DIMENSIONS,
} from './constants';

import PartyPane from './components/PartyPane'; 
import WorldPane from './components/WorldPane';
import ActionPane from './components/ActionPane';
import CompassPane from './components/CompassPane';
import CharacterCreator from './components/CharacterCreator/CharacterCreator';
import MainMenu from './components/MainMenu'; 
import MapPane from './components/MapPane';
import SubmapPane from './components/SubmapPane';
import ErrorBoundary from './components/ErrorBoundary';
import * as SaveLoadService from './services/saveLoadService';
import LoadingSpinner from './components/LoadingSpinner';
import CharacterSheetModal from './components/CharacterSheetModal'; 
import DevMenu from './components/DevMenu'; 
import GeminiLogViewer from './components/GeminiLogViewer'; 
import DiscoveryLogPane from './components/DiscoveryLogPane';
import Glossary from './components/Glossary'; 


/**
 * The main application component.
 * @returns {React.FC} The rendered App component.
 */
const App: React.FC = () => {
  const [gameState, dispatch] = useReducer(appReducer, initialGameState);

  const addMessage = useCallback(
    (text: string, sender: 'system' | 'player' | 'npc' = 'system') => {
      const newMessage: GameMessage = {
        id: Date.now() + Math.random(),
        text,
        sender,
        timestamp: new Date(),
      };
      dispatch({ type: 'ADD_MESSAGE', payload: newMessage });
    },
    [],
  );

  const { playPcmAudio, cleanupAudioContext } = useAudio(addMessage);

  const getCurrentLocation = useCallback((): Location => {
    const currentId = gameState.currentLocationId;
    if (LOCATIONS[currentId]) {
        const baseLocation = LOCATIONS[currentId];
        return {
            ...baseLocation,
            itemIds: gameState.dynamicLocationItemIds[currentId] || baseLocation.itemIds || []
        };
    }

    if (currentId.startsWith('coord_') && gameState.mapData && gameState.subMapCoordinates) {
        const parts = currentId.split('_');
        const worldX = parseInt(parts[1]);
        const worldY = parseInt(parts[2]);

        if (gameState.mapData.tiles[worldY] && gameState.mapData.tiles[worldY][worldX]) {
            const worldTile = gameState.mapData.tiles[worldY][worldX];
            const biome = BIOMES[worldTile.biomeId];
            
            const subMapExits: { [direction: string]: string } = {};
             Object.keys(USE_DUMMY_CHARACTER_FOR_DEV ? {} : {}).forEach(dir => { 
                subMapExits[dir] = dir; 
            });
            
            return {
                id: currentId, 
                name: `${biome?.name || 'Unknown Biome'} sector (${worldX},${worldY}), sub-tile (${gameState.subMapCoordinates.x},${gameState.subMapCoordinates.y})`,
                baseDescription: `You are at sub-tile (${gameState.subMapCoordinates.x},${gameState.subMapCoordinates.y}) within the ${biome?.name || 'unknown terrain'} world sector at (${worldX},${worldY}). ${biome?.description || ''}`,
                exits: subMapExits, 
                itemIds: gameState.dynamicLocationItemIds[currentId] || [], 
                npcIds: [], 
                mapCoordinates: { x: worldX, y: worldY },
                biomeId: worldTile.biomeId,
            };
        }
    }
    const fallbackLoc = LOCATIONS[STARTING_LOCATION_ID];
    return {
        ...fallbackLoc,
        itemIds: gameState.dynamicLocationItemIds[STARTING_LOCATION_ID] || fallbackLoc.itemIds || []
    };
  }, [gameState.currentLocationId, gameState.mapData, gameState.subMapCoordinates, gameState.dynamicLocationItemIds]);

  const getCurrentNPCs = useCallback((): NPC[] => {
    const location = getCurrentLocation();
    let npcList: NPC[] = [];

    if (location?.npcIds && !location.id.startsWith('coord_')) {
        npcList = location.npcIds.map((npcId) => NPCS[npcId]).filter(Boolean) as NPC[];
    }
    
    if (gameState.currentLocationActiveDynamicNpcIds) {
        const dynamicNpcs = gameState.currentLocationActiveDynamicNpcIds
            .map(npcId => NPCS[npcId])
            .filter(Boolean) as NPC[];
        npcList = [...npcList, ...dynamicNpcs];
    }
    
    const uniqueNpcList = npcList.reduce((acc, current) => {
        if (!acc.find(item => item.id === current.id)) {
            acc.push(current);
        }
        return acc;
    }, [] as NPC[]);

    return uniqueNpcList;
  }, [getCurrentLocation, gameState.currentLocationActiveDynamicNpcIds]);

  const getTileTooltipText = useCallback((worldMapTile: MapTile): string => {
    const biome = BIOMES[worldMapTile.biomeId];
    if (!worldMapTile.discovered) {
      return `Undiscovered area (${worldMapTile.x}, ${worldMapTile.y}). Potential biome: ${biome?.name || 'Unknown'}.`;
    }
    let tooltip = `${biome?.name || 'Unknown Area'} at world map coordinates (${worldMapTile.x}, ${worldMapTile.y})`;
    if (worldMapTile.locationId && LOCATIONS[worldMapTile.locationId]) {
      tooltip += ` - Location: ${LOCATIONS[worldMapTile.locationId].name}.`;
    } else {
      tooltip += ".";
    }
    if (biome?.description) {
        tooltip += ` General description: ${biome.description}`;
    }
    return tooltip;
  }, []);

  const { processAction } = useGameActions({
    gameState,
    dispatch,
    addMessage,
    playPcmAudio,
    getCurrentLocation,
    getCurrentNPCs,
    getTileTooltipText,
  });
  
  const {
    handleNewGame,
    handleSkipCharacterCreator,
    handleLoadGameFlow,
    startGame,
    initializeDummyPlayerState,
  } = useGameInitialization({
    dispatch,
    addMessage,
    currentMapData: gameState.mapData,
  });

  useEffect(() => {
    return () => {
      cleanupAudioContext();
    };
  }, [cleanupAudioContext]);
  
  useEffect(() => {
    if (
      USE_DUMMY_CHARACTER_FOR_DEV &&
      DUMMY_CHARACTER_FOR_DEV && 
      gameState.phase === GamePhase.PLAYING && 
      gameState.playerCharacter && 
      gameState.messages.length === 0 && 
      !SaveLoadService.hasSaveGame() 
    ) {
      initializeDummyPlayerState();
    }
  }, [ 
    gameState.phase, 
    gameState.playerCharacter, 
    gameState.messages.length,
    initializeDummyPlayerState,
  ]); 

  useEffect(() => {
    let timerId: number | undefined;

    const shouldClockRun = 
      gameState.phase === GamePhase.PLAYING &&
      !gameState.isLoading &&
      !gameState.isImageLoading &&
      !gameState.characterSheetModal.isOpen &&
      !gameState.isMapVisible &&
      !gameState.isSubmapVisible &&
      !gameState.isDevMenuVisible && 
      !gameState.isGeminiLogViewerVisible &&
      !gameState.isDiscoveryLogVisible &&
      !gameState.isGlossaryVisible; 


    if (shouldClockRun) {
      timerId = window.setInterval(() => {
        dispatch({ type: 'ADVANCE_TIME', payload: { seconds: 1 } });
      }, 1000); 
    }

    return () => {
      if (timerId) {
        window.clearInterval(timerId);
      }
    };
  }, [
    gameState.phase, 
    gameState.isLoading, 
    gameState.isImageLoading, 
    gameState.characterSheetModal.isOpen, 
    gameState.isMapVisible, 
    gameState.isSubmapVisible, 
    gameState.isDevMenuVisible,
    gameState.isGeminiLogViewerVisible,
    gameState.isDiscoveryLogVisible, 
    gameState.isGlossaryVisible, 
    dispatch
  ]);


  const handleOpenGlossary = useCallback((initialTermId?: string) => {
     if (initialTermId) {
        dispatch({ type: 'SET_GLOSSARY_TERM_FOR_MODAL', payload: initialTermId });
     }
     // Dispatch a single action to handle visibility and potential term setting
     processAction({ type: 'TOGGLE_GLOSSARY_VISIBILITY', label: 'Toggle Glossary', payload: { initialTermId } });
  }, [dispatch, processAction]);

  const handleCloseGlossary = useCallback(() => {
    // The reducer now handles clearing selectedGlossaryTermForModal when TOGGLE_GLOSSARY_VISIBILITY turns it off
    processAction({ type: 'TOGGLE_GLOSSARY_VISIBILITY', label: 'Close Glossary' });
  }, [processAction]);


  const handleExitCharacterCreatorToMainMenu = useCallback(() => {
    dispatch({ type: 'SET_GAME_PHASE', payload: GamePhase.MAIN_MENU });
  }, [dispatch]);

  const handleTileClick = useCallback((x: number, y: number, tile: MapTile) => {
    const targetBiome = BIOMES[tile.biomeId];

    if (!targetBiome) {
      addMessage("The nature of this terrain is unknown.", 'system');
      return;
    }
  
    if (!targetBiome.passable) {
      const reason = targetBiome.impassableReason || `You cannot travel to the ${targetBiome.name}. It is impassable by normal means.`;
      addMessage(reason, 'system');
      return; 
    }
  
    if (tile.discovered && tile.locationId && tile.locationId !== gameState.currentLocationId) {
           const newSubMapCoordinates = { x: Math.floor(SUBMAP_DIMENSIONS.cols / 2), y: Math.floor(SUBMAP_DIMENSIONS.rows / 2) };
           let newMapDataForDispatch = gameState.mapData;
           if (newMapDataForDispatch) {
                const newTiles = newMapDataForDispatch.tiles.map(row => row.map(t => ({ ...t, isPlayerCurrent: false })));
                if (newTiles[y] && newTiles[y][x]) {
                    newTiles[y][x].isPlayerCurrent = true;
                    newTiles[y][x].discovered = true; 
                     for (let y_offset = -1; y_offset <= 1; y_offset++) {
                        for (let x_offset = -1; x_offset <= 1; x_offset++) {
                            const adjY = y + y_offset;
                            const adjX = x + x_offset;
                            if (adjY >= 0 && adjY < newMapDataForDispatch.gridSize.rows && adjX >= 0 && adjX < newMapDataForDispatch.gridSize.cols) {
                                newTiles[adjY][adjX].discovered = true;
                            }
                        }
                    }
                }
                newMapDataForDispatch = { ...newMapDataForDispatch, tiles: newTiles };
           }
           dispatch({ type: 'MOVE_PLAYER', payload: { newLocationId: tile.locationId, newSubMapCoordinates, mapData: newMapDataForDispatch, activeDynamicNpcIds: determineActiveDynamicNpcsForLocation(tile.locationId, LOCATIONS) } });
           dispatch({ type: 'ADVANCE_TIME', payload: { seconds: 3600 }}); 
           dispatch({ type: 'TOGGLE_MAP_VISIBILITY' }); 
    } else if (tile.discovered && !tile.locationId) { 
        const targetCoordId = `coord_${x}_${y}`;
        if (targetCoordId !== gameState.currentLocationId) {
            const newSubMapCoordinates = { x: Math.floor(SUBMAP_DIMENSIONS.cols / 2), y: Math.floor(SUBMAP_DIMENSIONS.rows / 2) };
            let newMapDataForDispatch = gameState.mapData;
            if (newMapDataForDispatch) {
                const newTiles = newMapDataForDispatch.tiles.map(row => row.map(t => ({ ...t, isPlayerCurrent: false })));
                 if (newTiles[y] && newTiles[y][x]) {
                    newTiles[y][x].isPlayerCurrent = true;
                    newTiles[y][x].discovered = true; 
                 }
                newMapDataForDispatch = { ...newMapDataForDispatch, tiles: newTiles };
            }
            dispatch({ type: 'MOVE_PLAYER', payload: { newLocationId: targetCoordId, newSubMapCoordinates, mapData: newMapDataForDispatch, activeDynamicNpcIds: determineActiveDynamicNpcsForLocation(targetCoordId, LOCATIONS) } });
            dispatch({ type: 'ADVANCE_TIME', payload: { seconds: 3600 }}); 
            dispatch({ type: 'TOGGLE_MAP_VISIBILITY' });
        } else {
            addMessage(`This is your current world map area: ${targetBiome.name} at (${x},${y}).`, 'system');
        }
    } else if (tile.discovered) { 
        addMessage(`This is the ${targetBiome.name} at world coordinates (${x},${y}). ${targetBiome.description}`, 'system');
    }
  
  }, [gameState.currentLocationId, gameState.mapData, addMessage, dispatch]);

  const handleOpenCharacterSheet = useCallback((character: PlayerCharacter) => {
    dispatch({ type: 'OPEN_CHARACTER_SHEET', payload: character });
  }, [dispatch]);

  const handleCloseCharacterSheet = useCallback(() => {
    dispatch({ type: 'CLOSE_CHARACTER_SHEET' });
  }, [dispatch]);

  const handleDevMenuAction = useCallback((actionType: 'main_menu' | 'char_creator' | 'save' | 'load' | 'toggle_log_viewer') => {
    switch(actionType) {
        case 'main_menu':
            dispatch({ type: 'SET_GAME_PHASE', payload: GamePhase.MAIN_MENU });
            break;
        case 'char_creator':
            handleNewGame(); 
            break;
        case 'save':
            processAction({type: 'save_game', label: 'Force Save'});
            break;
        case 'load':
            handleLoadGameFlow();
            break;
        case 'toggle_log_viewer':
            dispatch({ type: 'TOGGLE_GEMINI_LOG_VIEWER' });
            break;
    }
    if (actionType !== 'toggle_log_viewer') { 
        dispatch({ type: 'TOGGLE_DEV_MENU' }); 
    }
  }, [dispatch, handleNewGame, processAction, handleLoadGameFlow]);

  const handleNavigateToGlossaryFromTooltip = useCallback((termId: string) => {
    // This function ensures that if the glossary is already open, it navigates.
    // If closed, it opens to the specific term.
    if (!gameState.isGlossaryVisible) {
        dispatch({ type: 'SET_GLOSSARY_TERM_FOR_MODAL', payload: termId });
        processAction({ type: 'TOGGLE_GLOSSARY_VISIBILITY', label: 'Open Glossary' });
    } else {
        dispatch({ type: 'SET_GLOSSARY_TERM_FOR_MODAL', payload: termId });
    }
  }, [dispatch, processAction, gameState.isGlossaryVisible]);


  // --- Main Content Rendering Logic ---
  let mainContent: React.ReactNode = null;
  const currentLocationData = getCurrentLocation(); 
  const npcs = getCurrentNPCs();
  const itemsInCurrentLocation =
    (!currentLocationData.id.startsWith('coord_') && currentLocationData.itemIds 
      ?.map((id) => ITEMS[id])
      .filter(Boolean) as Item[]) || [];
  const currentBiome = currentLocationData ? BIOMES[currentLocationData.biomeId] : null;
  
  const isUIInteractive = !gameState.isLoading && 
                          !gameState.isImageLoading && 
                          !gameState.characterSheetModal.isOpen && 
                          !gameState.isMapVisible && 
                          !gameState.isSubmapVisible && 
                          !gameState.isDevMenuVisible && 
                          !gameState.isGeminiLogViewerVisible &&
                          !gameState.isDiscoveryLogVisible &&
                          !gameState.isGlossaryVisible;

  const submapPaneDisabled = gameState.isLoading ||
                             gameState.isImageLoading ||
                             gameState.characterSheetModal.isOpen ||
                             gameState.isMapVisible || 
                             gameState.isDevMenuVisible ||
                             gameState.isGeminiLogViewerVisible ||
                             gameState.isDiscoveryLogVisible ||
                             gameState.isGlossaryVisible;


  if (gameState.phase === GamePhase.MAIN_MENU) {
    mainContent = (
      <ErrorBoundary fallbackMessage="An error occurred in the Main Menu.">
        <MainMenu
          onNewGame={handleNewGame}
          onLoadGame={handleLoadGameFlow}
          onShowCompendium={handleOpenGlossary}
          hasSaveGame={SaveLoadService.hasSaveGame()}
          latestSaveTimestamp={SaveLoadService.getLatestSaveTimestamp()}
          isDevDummyActive={USE_DUMMY_CHARACTER_FOR_DEV}
          onSkipCharacterCreator={handleSkipCharacterCreator}
        />
      </ErrorBoundary>
    );
  } else if (gameState.phase === GamePhase.CHARACTER_CREATION) {
    mainContent = (
      <ErrorBoundary fallbackMessage="An error occurred during Character Creation.">
        <CharacterCreator 
          onCharacterCreate={startGame}
          onExitToMainMenu={handleExitCharacterCreatorToMainMenu} 
        />
      </ErrorBoundary>
    );
  } else if (gameState.phase === GamePhase.PLAYING && gameState.playerCharacter && gameState.subMapCoordinates) {
    mainContent = (
      <div className="flex flex-col md:flex-row h-screen p-2 sm:p-4 gap-2 sm:gap-4 bg-gray-900 text-gray-200">
        {/* Left Column: Player Info, Compass, Actions */}
        <div className="md:w-2/5 lg:w-1/3 flex flex-col gap-2 sm:gap-4 min-h-0">
          {gameState.playerCharacter && (
             <ErrorBoundary fallbackMessage="Error in Party Pane.">
              <PartyPane 
                playerCharacter={gameState.playerCharacter} 
                onViewCharacterSheet={handleOpenCharacterSheet}
              />
            </ErrorBoundary>
          )}
          <ErrorBoundary fallbackMessage="Error in Compass Pane.">
            <CompassPane
                currentLocation={currentLocationData}
                currentSubMapCoordinates={gameState.subMapCoordinates}
                worldMapCoords={currentLocationData.mapCoordinates}
                subMapCoords={gameState.subMapCoordinates}
                onAction={processAction}
                disabled={!isUIInteractive}
                mapData={gameState.mapData}
                gameTime={gameState.gameTime}
            />
          </ErrorBoundary>
          <ErrorBoundary fallbackMessage="Error in Action Pane.">
            <ActionPane
                currentLocation={currentLocationData}
                npcsInLocation={npcs}
                itemsInLocation={itemsInCurrentLocation}
                onAction={processAction}
                disabled={!isUIInteractive}
                geminiGeneratedActions={gameState.geminiGeneratedActions}
                isDevDummyActive={USE_DUMMY_CHARACTER_FOR_DEV}
                unreadDiscoveryCount={gameState.unreadDiscoveryCount}
            />
          </ErrorBoundary>
        </div>

        {/* Right Column: World Log */}
        <div className="md:w-3/5 lg:w-2/3 flex flex-col gap-2 sm:gap-4 min-h-0">
          <ErrorBoundary fallbackMessage="Error in World Pane.">
            <WorldPane messages={gameState.messages} />
          </ErrorBoundary>
        </div>
      </div>
    );
  } else if (gameState.phase === GamePhase.GAME_OVER) {
    mainContent = (
      <div className="text-center p-8">
        <h1 className="text-4xl text-red-500 mb-4">Game Over</h1>
        <button onClick={handleNewGame} className="bg-blue-500 text-white px-4 py-2 rounded">New Game</button>
      </div>
    );
  } else {
    // Fallback or initial loading state if phase isn't matched (should ideally not happen with proper initial state)
    mainContent = <LoadingSpinner message={gameState.loadingMessage} />;
  }

  return (
    <GlossaryProvider>
      <div className="App min-h-screen bg-gray-900">
        {(gameState.isLoading || gameState.isImageLoading) && <LoadingSpinner message={gameState.loadingMessage || (gameState.isImageLoading ? "A vision forms in the æther..." : "Aralia is weaving fate...")} />}
        {gameState.error && (
          <div className="bg-red-800 text-white p-4 fixed top-0 left-0 right-0 z-[100] text-center">
            Error: {gameState.error}
            <button onClick={() => dispatch({ type: 'SET_ERROR', payload: null })} className="ml-4 bg-red-600 px-2 py-1 rounded">Dismiss</button>
          </div>
        )}
        {mainContent}
        {gameState.isMapVisible && gameState.mapData && (
          <ErrorBoundary fallbackMessage="Error displaying the World Map.">
            <MapPane
              mapData={gameState.mapData}
              onTileClick={handleTileClick}
              onClose={() => processAction({type: 'toggle_map', label: 'Close Map'})}
            />
          </ErrorBoundary>
        )}
         {gameState.isSubmapVisible && gameState.playerCharacter && gameState.mapData && gameState.subMapCoordinates && currentBiome && (
          <ErrorBoundary fallbackMessage="Error displaying the Submap.">
            <SubmapPane
              currentLocation={currentLocationData}
              currentWorldBiomeId={currentLocationData.biomeId}
              playerSubmapCoords={gameState.subMapCoordinates}
              onClose={() => processAction({type: 'toggle_submap_visibility', label: 'Close Submap'})}
              submapDimensions={SUBMAP_DIMENSIONS}
              parentWorldMapCoords={currentLocationData.mapCoordinates}
              onAction={processAction}
              disabled={submapPaneDisabled}
              inspectedTileDescriptions={gameState.inspectedTileDescriptions}
              mapData={gameState.mapData}
              gameTime={gameState.gameTime}
            />
          </ErrorBoundary>
        )}
        {gameState.characterSheetModal.isOpen && gameState.characterSheetModal.character && (
          <ErrorBoundary fallbackMessage="Error displaying Character Sheet.">
            <CharacterSheetModal
              isOpen={gameState.characterSheetModal.isOpen}
              character={gameState.characterSheetModal.character}
              inventory={gameState.inventory}
              onClose={handleCloseCharacterSheet}
              onAction={processAction}
              onNavigateToGlossary={handleNavigateToGlossaryFromTooltip}
            />
          </ErrorBoundary>
        )}
        {gameState.isDevMenuVisible && USE_DUMMY_CHARACTER_FOR_DEV && (
            <ErrorBoundary fallbackMessage="Error in Developer Menu.">
              <DevMenu
                  isOpen={gameState.isDevMenuVisible}
                  onClose={() => dispatch({ type: 'TOGGLE_DEV_MENU' })}
                  onDevAction={handleDevMenuAction}
              />
            </ErrorBoundary>
        )}
        {gameState.isGeminiLogViewerVisible && USE_DUMMY_CHARACTER_FOR_DEV && (
            <ErrorBoundary fallbackMessage="Error in Gemini Log Viewer.">
              <GeminiLogViewer
                  isOpen={gameState.isGeminiLogViewerVisible}
                  onClose={() => dispatch({ type: 'TOGGLE_GEMINI_LOG_VIEWER' })}
                  logEntries={gameState.geminiInteractionLog}
              />
            </ErrorBoundary>
        )}
        {gameState.isDiscoveryLogVisible && (
          <ErrorBoundary fallbackMessage="Error in Discovery Journal.">
              <DiscoveryLogPane
                  isOpen={gameState.isDiscoveryLogVisible}
                  entries={gameState.discoveryLog}
                  unreadCount={gameState.unreadDiscoveryCount}
                  onClose={() => dispatch({ type: 'TOGGLE_DISCOVERY_LOG_VISIBILITY' })}
                  onMarkRead={(entryId) => dispatch({ type: 'MARK_DISCOVERY_READ', payload: { entryId } })}
                  onMarkAllRead={() => dispatch({ type: 'MARK_ALL_DISCOVERIES_READ' })}
              />
          </ErrorBoundary>
        )}
        {gameState.isGlossaryVisible && (
          <ErrorBoundary fallbackMessage="Error in Glossary.">
            <Glossary
              isOpen={gameState.isGlossaryVisible}
              onClose={handleCloseGlossary}
              initialTermId={gameState.selectedGlossaryTermForModal}
            />
          </ErrorBoundary>
        )}
      </div>
    </GlossaryProvider>
  );
};

export default App;