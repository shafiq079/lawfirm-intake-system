import React from 'react';
import { useSelector } from 'react-redux';
import useVoiceRecording from '../../hooks/useVoiceRecording';

const AudioRecorder = ({ onStartRecording, onStopRecording }) => {
  const { isRecording } = useSelector((state) => state.voiceBot);
  const { startRecording, stopRecording, audioBlob } = useVoiceRecording();
  const { isProcessing } = useSelector((state) => state.voiceBot);

  const handleStart = () => {
    startRecording();
    onStartRecording();
  };

  const handleStop = () => {
    stopRecording();
    if (audioBlob) {
      onStopRecording(audioBlob);
    }
  };

  return (
    <div className="mt-4 flex justify-center space-x-4">
      <button
        onClick={handleStart}
        disabled={isRecording || isProcessing}
        className={`px-6 py-3 rounded-lg font-semibold transition duration-300 shadow-md
          ${isRecording || isProcessing ? 'bg-color-border text-color-text-secondary cursor-not-allowed' : 'bg-color-error hover:bg-color-error text-white'}`}
      >
        {isRecording ? 'Recording...' : 'Start Recording'}
      </button>
      <button
        onClick={handleStop}
        disabled={!isRecording || isProcessing}
        className={`px-6 py-3 rounded-lg font-semibold transition duration-300 shadow-md
          ${!isRecording || isProcessing ? 'bg-color-border text-color-text-secondary cursor-not-allowed' : 'bg-color-accent hover:bg-color-accent text-white'}`}
      >
        Stop Recording
      </button>
    </div>
  );
};

export default AudioRecorder;