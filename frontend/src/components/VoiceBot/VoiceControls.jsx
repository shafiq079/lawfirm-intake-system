import React from 'react';
import { useSelector } from 'react-redux';

const VoiceControls = () => {
  const { isProcessing } = useSelector((state) => state.voiceBot);

  return (
    <div className="mt-4 flex flex-wrap justify-center gap-4">
      <button
        className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold transition duration-300"
        disabled={isProcessing}
      >
        Retry
      </button>
      <button
        className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold transition duration-300"
        disabled={isProcessing}
      >
        Pause
      </button>
      <button
        className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold transition duration-300"
        disabled={isProcessing}
      >
        Type Instead
      </button>
      <button
        onClick={onSkip}
        className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold transition duration-300"
        disabled={isProcessing}
      >
        Skip
      </button>
      <button
        className="px-4 py-2 rounded-lg bg-red-200 hover:bg-red-300 text-red-800 font-semibold transition duration-300"
        disabled={isProcessing}
      >
        Cancel Section
      </button>
    </div>
  );
};

export default VoiceControls;