/**
 * @file src/hooks/actions/handleGeminiCustom.ts
 * Handles 'gemini_custom_action'.
 */
import { Action } from '../../types';
import { AppAction } from '../../state/appState';
import * as GeminiService from '../../services/geminiService';
import { AddMessageFn, AddGeminiLogFn } from './actionHandlerTypes';

interface HandleGeminiCustomProps {
  action: Action;
  dispatch: React.Dispatch<AppAction>;
  addMessage: AddMessageFn;
  addGeminiLog: AddGeminiLogFn;
  generalActionContext: string;
}

export async function handleGeminiCustom({
  action,
  dispatch,
  addMessage,
  addGeminiLog,
  generalActionContext,
}: HandleGeminiCustomProps): Promise<void> {
  if (action.payload?.geminiPrompt) {
    const outcomeResult = await GeminiService.generateActionOutcome(action.payload.geminiPrompt as string, generalActionContext, true);
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
}
