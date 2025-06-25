
/**
 * @file LoadingSpinner.tsx
 * This component displays a loading spinner overlay, typically shown
 * when the application is waiting for an asynchronous operation to complete,
 * such as an API call to Gemini.
 */
import React from 'react';

/**
 * LoadingSpinner component.
 * Renders a full-screen overlay with an animated spinner and a loading message.
 * @returns {React.FC} The rendered LoadingSpinner component.
 */
const LoadingSpinner: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" aria-label="Loading content" role="status">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-amber-500" aria-hidden="true"></div>
        <p className="text-white text-xl mt-4">Aralia is weaving fate...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;