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
        className={`px-6 py-3 rounded-lg font-semibold transition duration-300
          ${isRecording || isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600 text-white'}`}
      >
        {isRecording ? 'Recording...' : 'Start Recording'}
      </button>
      <button
        onClick={handleStop}
        disabled={!isRecording || isProcessing}
        className={`px-6 py-3 rounded-lg font-semibold transition duration-300
          ${!isRecording || isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
      >
        Stop Recording
      </button>
    </div>
  );
};

export default AudioRecorder;