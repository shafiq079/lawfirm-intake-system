
import React from 'react';
import { Link } from 'react-router-dom';

const HomeScreen = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 transition-colors duration-300 ease-in-out">
      <div className="text-center max-w-4xl mx-auto">
        <h1 className="text-5xl font-extrabold text-color-text leading-tight mb-4">
          Welcome to the <span className="text-color-accent">AI-Powered Intake Solution</span>
        </h1>
        <p className="text-xl text-color-text-secondary mb-8">
          Streamline your client intake process with intelligent automation, voice-to-text, and AI validation.
        </p>
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Link
            to="/admin/dashboard"
            className="bg-color-accent hover:bg-color-accent text-white font-bold py-3 px-8 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
          >
            Go to Dashboard
          </Link>
          <Link
            to="/admin/intakes/create"
            className="bg-color-success hover:bg-color-success text-white font-bold py-3 px-8 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
          >
            Create New Intake
          </Link>
        </div>
      </div>

      <div className="mt-16 w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-color-secondary p-6 rounded-lg shadow-md text-center transition-colors duration-300 ease-in-out">
          <h2 className="text-2xl font-bold text-color-text mb-3">Voice Intake</h2>
          <p className="text-color-text-secondary">Capture client information effortlessly through voice-to-text transcription and AI analysis.</p>
        </div>
        <div className="bg-color-secondary p-6 rounded-lg shadow-md text-center transition-colors duration-300 ease-in-out">
          <h2 className="text-2xl font-bold text-color-text mb-3">Dynamic Forms</h2>
          <p className="text-color-text-secondary">Intelligent forms that adapt to client input, ensuring all necessary details are collected.</p>
        </div>
        <div className="bg-color-secondary p-6 rounded-lg shadow-md text-center transition-colors duration-300 ease-in-out">
          <h2 className="text-2xl font-bold text-color-text mb-3">Document OCR</h2>
          <p className="text-color-text-secondary">Automate data extraction from documents with integrated OCR capabilities.</p>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
