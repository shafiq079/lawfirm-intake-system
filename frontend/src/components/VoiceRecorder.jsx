
import React, { useState, useRef } from 'react';
import axios from 'axios';

const VoiceRecorder = ({ onRecordingComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        audioChunksRef.current = [];
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please ensure you have given permission.');
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setIsRecording(false);
  };

  const sendAudio = async () => {
    if (!audioBlob) return;

    setIsProcessing(true);
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');

    try {
      const { data } = await axios.post('/api/voice/process', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      onRecordingComplete(data);
    } catch (error) {
      console.error('Error uploading audio:', error);
      alert('Failed to process audio. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {!isRecording && !audioBlob && (
        <button
          onClick={startRecording}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
        >
          Start Recording
        </button>
      )}
      {isRecording && (
        <button
          onClick={stopRecording}
          className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-4 px-8 rounded-full shadow-lg"
        >
          Stop Recording
        </button>
      )}
      {audioBlob && !isRecording && (
        <div className="flex items-center space-x-4">
          <audio src={URL.createObjectURL(audioBlob)} controls />
          <button
            onClick={sendAudio}
            disabled={isProcessing}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg disabled:bg-blue-300"
          >
            {isProcessing ? 'Processing...' : 'Send for Analysis'}
          </button>
        </div>
      )}
    </div>
  );
};

export default VoiceRecorder;
