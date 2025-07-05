import React from 'react';

const InputMethodSelector = ({ onSelect }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md p-8 bg-white shadow-2xl rounded-xl text-center">
        <h1 className="text-3xl font-bold mb-2 text-gray-800">How would you like to provide your information?</h1>
        <div className="space-y-4 mt-6">
          <button
            onClick={() => onSelect('document')}
            className="w-full text-left p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 ease-in-out transform hover:scale-105 flex items-center shadow-md"
          >
            <span className="text-3xl mr-4">📄</span>
            <div>
              <h2 className="font-bold text-lg">Upload a Document</h2>
              <p className="text-sm opacity-90">We'll extract your information from your uploaded files.</p>
            </div>
          </button>
          <button
            onClick={() => onSelect('voice')}
            className="w-full text-left p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-300 ease-in-out transform hover:scale-105 flex items-center shadow-md"
          >
            <span className="text-3xl mr-4">🎤</span>
            <div>
              <h2 className="font-bold text-lg">Use Voice Bot</h2>
              <p className="text-sm opacity-90">Answer questions by speaking — our bot will help you fill the form.</p>
            </div>
          </button>
          <button
            onClick={() => onSelect('manual')}
            className="w-full text-left p-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-300 ease-in-out transform hover:scale-105 flex items-center shadow-md"
          >
            <span className="text-3xl mr-4">✍️</span>
            <div>
              <h2 className="font-bold text-lg">Fill Manually</h2>
              <p className="text-sm opacity-90">Fill the form step-by-step yourself.</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default InputMethodSelector;
