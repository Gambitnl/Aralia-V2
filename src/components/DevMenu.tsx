/**
 * @file DevMenu.tsx
 * This component displays a developer menu modal with various debug/utility actions.
 */
import React, { useEffect, useRef } from 'react';

type DevMenuActionType = 'main_menu' | 'char_creator' | 'save' | 'load' | 'toggle_log_viewer';

interface DevMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onDevAction: (actionType: DevMenuActionType) => void;
}

const DevMenu: React.FC<DevMenuProps> = ({ isOpen, onClose, onDevAction }) => {
  const firstFocusableElementRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
      firstFocusableElementRef.current?.focus();
    }
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const devActionButtons: Array<{ label: string; action: DevMenuActionType; style?: string }> = [
    { label: 'Go to Main Menu', action: 'main_menu', style: 'bg-blue-600 hover:bg-blue-500' },
    { label: 'Go to Character Creator', action: 'char_creator', style: 'bg-green-600 hover:bg-green-500' },
    { label: 'Force Save Game', action: 'save', style: 'bg-yellow-500 hover:bg-yellow-400 text-gray-900' },
    { label: 'Force Load Game', action: 'load', style: 'bg-teal-500 hover:bg-teal-400' },
    { label: 'View Gemini Prompt Log', action: 'toggle_log_viewer', style: 'bg-purple-600 hover:bg-purple-500' },
  ];

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60] p-4" // Higher z-index than map/submap
      aria-modal="true"
      role="dialog"
      aria-labelledby="dev-menu-title"
    >
      <div className="bg-gray-800 p-6 rounded-xl shadow-2xl border border-gray-700 w-full max-w-md flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 id="dev-menu-title" className="text-2xl font-bold text-amber-400 font-cinzel">
            Developer Menu
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 text-3xl"
            aria-label="Close developer menu"
          >
            &times;
          </button>
        </div>

        <div className="space-y-3 mb-6">
          {devActionButtons.map((btn, index) => (
            <button
              key={btn.action}
              ref={index === 0 ? firstFocusableElementRef : null}
              onClick={() => onDevAction(btn.action)}
              className={`w-full text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-colors text-lg ${btn.style || 'bg-gray-600 hover:bg-gray-500'}`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        <button
          onClick={onClose}
          className="mt-4 bg-red-700 hover:bg-red-600 text-white font-semibold py-3 px-4 rounded-lg shadow"
          aria-label="Close developer menu"
        >
          Close Dev Menu
        </button>
      </div>
    </div>
  );
};

export default DevMenu;