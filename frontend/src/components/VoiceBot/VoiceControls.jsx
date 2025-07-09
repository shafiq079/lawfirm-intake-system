import React from 'react';
import { useSelector } from 'react-redux';

const VoiceControls = ({ onSkip }) => {
  const { isProcessing } = useSelector((state) => state.voiceBot);

  return (
    <div className="mt-4 flex flex-wrap justify-center gap-4">
      <button
        className="px-4 py-2 rounded-lg bg-color-primary hover:bg-color-primary text-color-text font-semibold transition duration-300 shadow-sm"
        disabled={isProcessing}
      >
        Retry
      </button>
      <button
        className="px-4 py-2 rounded-lg bg-color-primary hover:bg-color-primary text-color-text font-semibold transition duration-300 shadow-sm"
        disabled={isProcessing}
      >
        Pause
      </button>
      <button
        className="px-4 py-2 rounded-lg bg-color-primary hover:bg-color-primary text-color-text font-semibold transition duration-300 shadow-sm"
        disabled={isProcessing}
      >
        Type Instead
      </button>
      <button
        onClick={onSkip}
        className="px-4 py-2 rounded-lg bg-color-accent hover:bg-color-accent text-white font-semibold transition duration-300 shadow-sm"
        disabled={isProcessing}
      >
        Skip
      </button>
      <button
        className="px-4 py-2 rounded-lg bg-color-error hover:bg-color-error text-white font-semibold transition duration-300 shadow-sm"
        disabled={isProcessing}
      >
        Cancel Section
      </button>
    </div>
  );
};

export default VoiceControls;