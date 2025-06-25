/**
 * @file src/hooks/actions/handleOracle.ts
 * Handles 'ask_oracle' actions.
 */
import { GameState, Action } from '../../types';
import { AppAction } from '../../state/appState';
import * as GeminiService from '../../services/geminiService';
import { synthesizeSpeech } from '../../services/ttsService';
import { AddMessageFn, AddGeminiLogFn, PlayPcmAudioFn } from './actionHandlerTypes';

interface HandleOracleProps {
  action: Action;
  dispatch: React.Dispatch<AppAction>;
  addMessage: AddMessageFn;
  addGeminiLog: AddGeminiLogFn;
  playPcmAudio: PlayPcmAudioFn;
  generalActionContext: string;
}

export async function handleOracle({
  action,
  dispatch,
  addMessage,
  addGeminiLog,
  playPcmAudio,
  generalActionContext,
}: HandleOracleProps): Promise<void> {
  if (action.payload?.query) {
    const playerQuery = action.payload.query as string;
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
}
