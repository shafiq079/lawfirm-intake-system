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
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md p-8 bg-color-secondary shadow-xl rounded-xl text-center transition-colors duration-300 ease-in-out">
        <h1 className="text-3xl font-bold mb-2 text-color-text">Welcome!</h1>
        <p className="text-lg mb-6 text-color-text-secondary">How would you like to get started?</p>
        <div className="space-y-4">
          <button
            onClick={() => handleChoice('/smart-intake/upload')}
            className="w-full text-left p-4 bg-color-accent text-white rounded-lg hover:bg-color-accent transition-all duration-300 ease-in-out transform hover:scale-105 flex items-center shadow-md"
          >
            <span className="text-3xl mr-4">📄</span>
            <div>
              <h2 className="font-bold text-lg">Upload a document</h2>
              <p className="text-sm opacity-90">We'll extract info to auto-fill the form.</p>
            </div>
          </button>
          <button
            onClick={() => handleChoice('/smart-intake/voice')}
            className="w-full text-left p-4 bg-color-success text-white rounded-lg hover:bg-color-success transition-all duration-300 ease-in-out transform hover:scale-105 flex items-center shadow-md"
          >
            <span className="text-3xl mr-4">🎤</span>
            <div>
              <h2 className="font-bold text-lg">Speak and answer questions</h2>
              <p className="text-sm opacity-90">We'll record and transcribe to fill the form.</p>
            </div>
          </button>
          <button
            onClick={() => handleChoice('/smart-intake/form')}
            className="w-full text-left p-4 bg-color-warning text-white rounded-lg hover:bg-color-warning transition-all duration-300 ease-in-out transform hover:scale-105 flex items-center shadow-md"
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
