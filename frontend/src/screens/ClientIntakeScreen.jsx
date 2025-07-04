
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getIntakeDetails } from '../features/intakeSlice';
import ClientTextIntakeScreen from './ClientTextIntakeScreen';
import DocumentUpload from '../components/DocumentUpload';
import VoiceRecorder from '../components/VoiceRecorder';

const ClientIntakeScreen = () => {
  const { intakeLink } = useParams();
  const dispatch = useDispatch();

  const [showTextForm, setShowTextForm] = useState(false);
  const [showDocumentUpload, setShowDocumentUpload] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [processedVoiceData, setProcessedVoiceData] = useState(null);

  const intakeDetailsState = useSelector((state) => state.intake);
  const { loading, error, selectedIntake } = intakeDetailsState;

  useEffect(() => {
    if (intakeLink) {
      dispatch(getIntakeDetails(intakeLink));
    }
  }, [dispatch, intakeLink]);

  const handleRecordingComplete = (data) => {
    setProcessedVoiceData(data.analysis);
    setShowVoiceRecorder(false);
    setShowTextForm(true); // Switch to the form view
  };

  if (loading) {
    return <div className="container mx-auto p-4">Loading intake details...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">Error: {error}</div>;
  }

  if (!selectedIntake) {
    return <div className="container mx-auto p-4">Intake not found.</div>;
  }

  const renderInitialChoices = () => (
    <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-8">
      <button
        onClick={() => setShowVoiceRecorder(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
      >
        Start Voice Intake
      </button>
      <button
        onClick={() => setShowTextForm(true)}
        className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
      >
        Start Text Intake
      </button>
      <button
        onClick={() => setShowDocumentUpload(true)}
        className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-4 px-8 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
      >
        Upload Document
      </button>
    </div>
  );

  return (
    <div className="container mx-auto p-4 text-center">
      <h1 className="text-3xl font-bold mb-6">Welcome to Your Intake</h1>
      <p className="text-lg mb-8">Please choose your preferred intake method for: <span className="font-semibold">{selectedIntake.intakeType}</span></p>

      {!showTextForm && !showDocumentUpload && !showVoiceRecorder && renderInitialChoices()}

      {showVoiceRecorder && (
        <>
          <p className="text-lg text-gray-600 mb-8 text-center">
            Please state your full name, email address, phone number, and the type of immigration case you are interested in.
            For example: "Hello, my name is John Smith, and I'd like to apply for a spouse visa. You can reach me at john.smith@email.com or 555-123-4567."
          </p>
          <VoiceRecorder onRecordingComplete={handleRecordingComplete} />
        </>
      )}

      {showTextForm && (
        <ClientTextIntakeScreen initialData={processedVoiceData} />
      )}

      {showDocumentUpload && (
        <DocumentUpload onOcrComplete={(data) => {
          setProcessedVoiceData(data); // Assuming OCR data structure is similar
          setShowDocumentUpload(false);
          setShowTextForm(true);
        }} />
      )}
    </div>
  );
};

export default ClientIntakeScreen;
