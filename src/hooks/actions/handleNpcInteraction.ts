/**
 * @file src/hooks/actions/handleNpcInteraction.ts
 * Handles NPC interaction actions like 'talk'.
 */
import { GameState, Action, NPC } from '../../types';
import { AppAction } from '../../state/appState';
import * as GeminiService from '../../services/geminiService';
import { synthesizeSpeech } from '../../services/ttsService';
import { AddMessageFn, AddGeminiLogFn, PlayPcmAudioFn } from './actionHandlerTypes';
import { NPCS } from '../../constants';

interface HandleTalkProps {
  action: Action;
  gameState: GameState;
  dispatch: React.Dispatch<AppAction>;
  addMessage: AddMessageFn;
  addGeminiLog: AddGeminiLogFn;
  playPcmAudio: PlayPcmAudioFn;
  playerContext: string;
  generalActionContext: string;
}

export async function handleTalk({
  action,
  gameState,
  dispatch,
  addMessage,
  addGeminiLog,
  playPcmAudio,
  playerContext,
  generalActionContext,
}: HandleTalkProps): Promise<void> {
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
}
