/**
 * @file WorldPane.tsx
 * This component displays the game's message log, showing system messages,
 * player actions, and NPC dialogue. It automatically scrolls to the latest message.
 */
import React, { useEffect, useRef } from 'react';
import { GameMessage } from '../types';

interface WorldPaneProps {
  messages: GameMessage[];
}

/**
 * WorldPane component.
 * Renders the list of game messages with appropriate styling for different senders.
 * Automatically scrolls to the bottom when new messages are added.
 * @param {WorldPaneProps} props - The props for the component.
 * @returns {React.FC} The rendered WorldPane component.
 */
const WorldPane: React.FC<WorldPaneProps> = ({ messages }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  /**
   * Scrolls the message container to the bottom.
   */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]); // Scroll when messages change

  /**
   * Determines the CSS class for a message based on its sender.
   * @param {GameMessage['sender']} sender - The sender of the message.
   * @returns {string} The CSS class string.
   */
  const getMessageStyle = (sender: GameMessage['sender']): string => {
    switch (sender) {
      case 'system':
        return 'text-sky-300 italic';
      case 'player':
        return 'text-amber-300';
      case 'npc':
        return 'text-emerald-300';
      default:
        return 'text-gray-300';
    }
  };

  return (
    <div className="flex-grow bg-gray-800 p-6 rounded-lg shadow-xl overflow-y-auto scrollable-content border border-gray-700 min-h-0"> {/* Added min-h-0 for flex-grow with overflow */}
      <h2 className="text-2xl font-bold text-amber-400 mb-4 border-b-2 border-amber-500 pb-2">Log</h2>
      <div className="space-y-3 text-lg leading-relaxed">
        {messages.map((msg) => (
          <div key={msg.id} className={`p-2 rounded ${msg.sender === 'player' ? 'text-right' : ''}`}>
            {/* Using dangerouslySetInnerHTML for potential HTML in messages from Gemini, ensure sanitization if used.
                For now, assuming text is plain or simple markdown handled by browser.
                A more robust solution would use a markdown parser.
            */}
            <p className={`${getMessageStyle(msg.sender)}`}>
              {msg.text}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        ))}
        <div ref={messagesEndRef} /> {/* Anchor for scrolling to bottom */}
      </div>
    </div>
  );
};

export default WorldPane;
