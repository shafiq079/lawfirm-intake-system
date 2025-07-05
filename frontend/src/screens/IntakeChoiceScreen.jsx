import React from 'react';
import { useNavigate } from 'react-router-dom';

const IntakeChoiceScreen = () => {
  const navigate = useNavigate();

  const handleChoice = (path) => {
    // Clear previous form data when starting a new intake
    localStorage.removeItem('intakeFormData');
    navigate(path);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md p-8 bg-white shadow-2xl rounded-xl text-center">
        <h1 className="text-3xl font-bold mb-2 text-gray-800">Welcome!</h1>
        <p className="text-lg mb-6 text-gray-600">How would you like to get started?</p>
        <div className="space-y-4">
          <button
            onClick={() => handleChoice('/smart-intake/upload')}
            className="w-full text-left p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 ease-in-out transform hover:scale-105 flex items-center shadow-md"
          >
            <span className="text-3xl mr-4">📄</span>
            <div>
              <h2 className="font-bold text-lg">Upload a document</h2>
              <p className="text-sm opacity-90">We'll extract info to auto-fill the form.</p>
            </div>
          </button>
          <button
            onClick={() => handleChoice('/smart-intake/voice')}
            className="w-full text-left p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-300 ease-in-out transform hover:scale-105 flex items-center shadow-md"
          >
            <span className="text-3xl mr-4">🎤</span>
            <div>
              <h2 className="font-bold text-lg">Speak and answer questions</h2>
              <p className="text-sm opacity-90">We'll record and transcribe to fill the form.</p>
            </div>
          </button>
          <button
            onClick={() => handleChoice('/smart-intake/form')}
            className="w-full text-left p-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-300 ease-in-out transform hover:scale-105 flex items-center shadow-md"
          >
            <span className="text-3xl mr-4">✍️</span>
            <div>
              <h2 className="font-bold text-lg">Fill the form manually</h2>
              <p className="text-sm opacity-90">Proceed directly to our intake questionnaire.</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default IntakeChoiceScreen;
