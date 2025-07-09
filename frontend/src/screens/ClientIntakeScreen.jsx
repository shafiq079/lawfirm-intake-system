
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getIntakeByLink, clearIntakeDetails } from '../features/intakeSlice';
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
      dispatch(getIntakeByLink(intakeLink));
    }
    return () => {
      dispatch(clearIntakeDetails());
    };
  }, [dispatch, intakeLink]);

  const handleRecordingComplete = (data) => {
    setProcessedVoiceData(data.analysis);
    setShowVoiceRecorder(false);
    setShowTextForm(true); // Switch to the form view
  };

  if (loading) {
    return <div className="container mx-auto p-4 text-color-text-secondary">Loading intake details...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-4 bg-color-error border border-color-error text-white px-4 py-3 rounded relative shadow-md">Error: {error}</div>;
  }

  if (!selectedIntake) {
    return <div className="container mx-auto p-4 text-color-text-secondary">Intake not found.</div>;
  }

  const renderInitialChoices = () => (
    <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-8 p-6 bg-color-secondary rounded-lg shadow-lg">
      <button
        // const handleStartVoiceIntake = () => {
        // setIsVoiceIntakeActive(true);
        // setShowTextForm(true); // The voice bot will fill this form
        // console.log('isVoiceIntakeActive set to:', true);
        // };
        className="bg-color-accent hover:bg-color-accent text-white font-bold py-4 px-8 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
      >
        Start Voice Intake
      </button>
      <button
        onClick={() => setShowTextForm(true)}
        className="bg-color-success hover:bg-color-success text-white font-bold py-4 px-8 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
      >
        Start Text Intake
      </button>
      <button
        onClick={() => setShowDocumentUpload(true)}
        className="bg-color-warning hover:bg-color-warning text-white font-bold py-4 px-8 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
      >
        Upload Document
      </button>
    </div>
  );

  return (
    <div className="container mx-auto p-4 text-center transition-colors duration-300 ease-in-out">
      <h1 className="text-3xl font-bold mb-6 text-color-text">Welcome to Your Intake</h1>
      <p className="text-lg mb-8 text-color-text-secondary">Please choose your preferred intake method for: <span className="font-semibold text-color-accent">{selectedIntake.intakeType}</span></p>

      {!showTextForm && !showDocumentUpload && !isVoiceIntakeActive && renderInitialChoices()}

      {(showTextForm || isVoiceIntakeActive) && (
        <div className="flex flex-col md:flex-row gap-4 p-6 bg-color-secondary rounded-lg shadow-lg">
          <div className="flex-1">
            <ClientTextIntakeScreen initialData={processedVoiceData} />
          </div>
          {isVoiceIntakeActive && (
            <div className="flex-1">
              <VoiceBotPanel />
            </div>
          )}
        </div>
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
