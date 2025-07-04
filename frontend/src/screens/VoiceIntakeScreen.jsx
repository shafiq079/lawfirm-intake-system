import React from 'react';
import VoiceRecorder from '../components/VoiceRecorder';

const VoiceIntakeScreen = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Client Voice Intake</h1>
      <p className="text-lg text-gray-600 mb-8 text-center">
        Click the button below to start recording your voice for the intake process.
        Please state your full name, email address, phone number, and the type of immigration case you are interested in.
        For example: "Hello, my name is John Smith, and I'd like to apply for a spouse visa. You can reach me at john.smith@email.com or 555-123-4567."
      </p>
      <VoiceRecorder />
    </div>
  );
};

export default VoiceIntakeScreen;
