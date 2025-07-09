import React, { useState, useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import PersonalInfoStep from '../components/intake/PersonalInfoStep';
import ImmigrationIntentStep from '../components/intake/ImmigrationIntentStep';
import PassportTravelStep from '../components/intake/PassportTravelStep';
import EmploymentEducationStep from '../components/intake/EmploymentEducationStep';
import FamilyStep from '../components/intake/FamilyStep';
import LegalHistoryStep from '../components/intake/LegalHistoryStep';
import ReviewSubmitStep from '../components/intake/ReviewSubmitStep';
import DocumentUpload from '../components/intake/DocumentUpload';
import VoiceBotStart from '../components/intake/VoiceBotStart';
import InputMethodSelector from '../components/intake/InputMethodSelector';

const SmartIntakeScreen = () => {
  const { intakeLink } = useParams();

  const [inputMethod, setInputMethod] = useState(() => {
    if (intakeLink) return null;
    return localStorage.getItem('inputMethod');
  });

  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('intakeFormData');
    return saved ? JSON.parse(saved) : {};
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const savedData = localStorage.getItem('intakeFormData');
    const savedStep = localStorage.getItem('currentStep');
    const savedMethod = localStorage.getItem('inputMethod');

    if (savedData) setFormData(JSON.parse(savedData));
    if (savedStep) setCurrentStep(parseInt(savedStep, 10));
    if (savedMethod) setInputMethod(savedMethod);
  }, []);

  useEffect(() => {
    localStorage.setItem('intakeFormData', JSON.stringify(formData));
    localStorage.setItem('currentStep', currentStep.toString());
    if (inputMethod) localStorage.setItem('inputMethod', inputMethod);
  }, [formData, currentStep, inputMethod]);

  const updateFormData = useCallback((newData) => {
    setFormData((prev) => ({ ...prev, ...newData }));
  }, []);

  const handleAutoFill = useCallback((extractedData) => {
    updateFormData(extractedData);
    // If the initial input method was 'document', go directly to Review & Submit (now step 8)
    if (inputMethod === 'document') {
      setCurrentStep(8);
    } else {
      // Otherwise, if it was part of the manual/voice flow, just proceed to the next step
      // The DocumentUpload component itself calls nextStep() after this.
      // So, no change needed here for manual/voice flow.
    }
  }, [updateFormData, inputMethod]);

  const handleMethodSelection = (method) => {
    setInputMethod(method);
    localStorage.removeItem('intakeFormData');
    localStorage.removeItem('currentStep');
    localStorage.setItem('inputMethod', method);
    setFormData({});
    setCurrentStep(method === 'manual' ? 1 : (method === 'document' ? 7 : 0)); // If document, go to step 7 (Document Upload)
  };

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => prev + 1);
  }, []);

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => prev - 1);
  }, []);

  const getSectionNameByStep = (step) => {
    switch (step) {
      case 1: return 'personal';
      case 2: return 'immigration';
      case 3: return 'passport';
      case 4: return 'employment';
      case 5: return 'family';
      case 6: return 'legal';
      case 7: return 'document'; // New section name for document upload
      default: return '';
    }
  };

  const handleSubmissionSuccess = () => {
    setIsSubmitted(true);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <PersonalInfoStep formData={formData} updateFormData={updateFormData} nextStep={nextStep} prevStep={prevStep} />;
      case 2:
        return <ImmigrationIntentStep formData={formData} updateFormData={updateFormData} nextStep={nextStep} prevStep={prevStep} />;
      case 3:
        return <PassportTravelStep formData={formData} updateFormData={updateFormData} nextStep={nextStep} prevStep={prevStep} />;
      case 4:
        return <EmploymentEducationStep formData={formData} updateFormData={updateFormData} nextStep={nextStep} prevStep={prevStep} />;
      case 5:
        return <FamilyStep formData={formData} updateFormData={updateFormData} nextStep={nextStep} prevStep={prevStep} />;
      case 6:
        return <LegalHistoryStep formData={formData} updateFormData={updateFormData} nextStep={nextStep} prevStep={prevStep} />;
      case 7: // Document Upload is now a regular step
        return <DocumentUpload onAutoFill={handleAutoFill} nextStep={nextStep} prevStep={prevStep} intakeLink={intakeLink} formData={formData} updateFormData={updateFormData} />;
      case 8: // Review & Submit is now step 8
        return <ReviewSubmitStep formData={formData} updateFormData={updateFormData} nextStep={nextStep} prevStep={prevStep} intakeLink={intakeLink} onSubmissionSuccess={handleSubmissionSuccess} />;
      default:
        // This handles cases where currentStep is 0 (initial method selection) or beyond 8
        if (inputMethod === 'document' && currentStep === 0) {
          return <DocumentUpload onAutoFill={handleAutoFill} nextStep={nextStep} prevStep={prevStep} intakeLink={intakeLink} formData={formData} updateFormData={updateFormData} />;
        }
        return <ReviewSubmitStep formData={formData} updateFormData={updateFormData} nextStep={nextStep} prevStep={prevStep} intakeLink={intakeLink} onSubmissionSuccess={handleSubmissionSuccess} />;
    }
  };

  const handleChangeMethod = () => {
    if (window.confirm("Are you sure you want to change the input method? All current form data will be cleared.")) {
      setInputMethod(null);
      localStorage.removeItem('intakeFormData');
      localStorage.removeItem('currentStep');
      localStorage.removeItem('inputMethod');
      setFormData({});
      setCurrentStep(1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center p-4">
      <div className="flex w-full max-w-7xl gap-6">
        {/* Main Form Content */}
        <div className="flex-1 bg-white p-8 rounded-lg shadow-xl flex flex-col">
          {!inputMethod ? (
            <InputMethodSelector onSelect={handleMethodSelection} />
          ) : (
            <>
              {!isSubmitted && (
              <div className="flex justify-end mb-4">
                <button
                  onClick={handleChangeMethod}
                  className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out"
                >
                  Change Input Method
                </button>
              </div>
              )}

              <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">Smart Intake Form</h1>

   

              <div className="flex-1">{renderStep()}</div>
            </>
          )}
        </div>

        {/* Voice Bot Sidebar */}
        <div className="w-[350px] bg-white p-4 rounded-lg shadow-xl flex flex-col">
          <VoiceBotStart
            sectionName={getSectionNameByStep(currentStep)}
            intakeLink={intakeLink}
            onAutoFill={updateFormData}
          />
        </div>
      </div>
    </div>
  );
};

export default SmartIntakeScreen;
