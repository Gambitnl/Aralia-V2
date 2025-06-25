/**
 * @file src/hooks/actions/handleSystemAndUi.ts
 * Handles system and UI actions like saving, main menu, and toggling UI panes.
 */
import { GameState, Action } from '../../types';
import { AppAction } from '../../state/appState';
import * as SaveLoadService from '../../services/saveLoadService';
import { AddMessageFn } from './actionHandlerTypes';
import { GamePhase, USE_DUMMY_CHARACTER_FOR_DEV } from '../../constants';

interface HandleSystemAndUiProps {
  action: Action;
  gameState: GameState;
  dispatch: React.Dispatch<AppAction>;
  addMessage: AddMessageFn;
  // Specific handlers might be needed if they involve more complex logic,
  // but for simple dispatches, just the dispatch function is often enough.
}

export async function handleSaveGame({
  gameState,
  dispatch,
  addMessage,
}: Omit<HandleSystemAndUiProps, 'action'>): Promise<void> {
  dispatch({ type: 'SET_LOADING', payload: { isLoading: true, message: "Saving your progress..." } });
  const success = await SaveLoadService.saveGame(gameState);
  if (success) {
    addMessage("Game Saved!", 'system');
  } else {
    addMessage("Failed to save game. Check console or try again later.", 'system');
  }
  dispatch({ type: 'SET_LOADING', payload: { isLoading: false } });
  dispatch({ type: 'SET_GEMINI_ACTIONS', payload: null });
}

export async function handleGoToMainMenu({
  gameState,
  dispatch,
  addMessage,
}: Omit<HandleSystemAndUiProps, 'action'>): Promise<void> {
  addMessage("Returning to Main Menu...", 'system');
  if (!USE_DUMMY_CHARACTER_FOR_DEV) {
    // Call the save game logic directly if needed, or ensure it's called by the caller
    // For simplicity, assuming save is handled if needed before calling this.
    // If save is always part of this action:
    await handleSaveGame({ gameState, dispatch, addMessage });
  }
  dispatch({ type: 'SET_GAME_PHASE', payload: GamePhase.MAIN_MENU });
}

export function handleToggleMap(dispatch: React.Dispatch<AppAction>): void {
  dispatch({ type: 'TOGGLE_MAP_VISIBILITY' });
  dispatch({ type: 'RESET_NPC_INTERACTION_CONTEXT' });
}

export function handleToggleSubmap(dispatch: React.Dispatch<AppAction>): void {
  dispatch({ type: 'TOGGLE_SUBMAP_VISIBILITY' });
  dispatch({ type: 'RESET_NPC_INTERACTION_CONTEXT' });
}

export function handleToggleDevMenu(dispatch: React.Dispatch<AppAction>): void {
  dispatch({ type: 'TOGGLE_DEV_MENU' });
}

export function handleToggleDiscoveryLog(dispatch: React.Dispatch<AppAction>): void {
    dispatch({ type: 'TOGGLE_DISCOVERY_LOG_VISIBILITY' });
}

export function handleToggleGlossary(dispatch: React.Dispatch<AppAction>): void {
    dispatch({ type: 'TOGGLE_GLOSSARY_VISIBILITY' });
}
