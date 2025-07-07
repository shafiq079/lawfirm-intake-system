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
    setCurrentStep(1);
  }, [updateFormData]);

  const handleMethodSelection = (method) => {
    setInputMethod(method);
    localStorage.removeItem('intakeFormData');
    localStorage.removeItem('currentStep');
    localStorage.setItem('inputMethod', method);
    setFormData({});
    setCurrentStep(method === 'manual' ? 1 : 0);
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
      default: return '';
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        if (inputMethod === 'document') {
          return <DocumentUpload onAutoFill={handleAutoFill} nextStep={nextStep} prevStep={prevStep} intakeLink={intakeLink} />;
        } else if (inputMethod === 'voice') {
          return (
            <div className="w-full">
              <VoiceBotStart onAutoFill={handleAutoFill} nextStep={nextStep} prevStep={prevStep} intakeLink={intakeLink} />
            </div>
          );
        }
        return null;
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
      case 7:
        return <ReviewSubmitStep formData={formData} updateFormData={updateFormData} nextStep={nextStep} prevStep={prevStep} />;
      default:
        return <ReviewSubmitStep formData={formData} updateFormData={updateFormData} nextStep={nextStep} prevStep={prevStep} />;
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
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-6xl flex flex-col">
        {!inputMethod ? (
          <InputMethodSelector onSelect={handleMethodSelection} />
        ) : (
          <>
            <div className="flex justify-end mb-4">
              <button
                onClick={handleChangeMethod}
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out"
              >
                Change Input Method
              </button>
            </div>

            <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">Smart Intake Form</h1>

            <div className="flex justify-between mb-6">
              {inputMethod === 'manual' && [
                { id: 1, name: 'Personal Info' },
                { id: 2, name: 'Immigration Intent' },
                { id: 3, name: 'Passport & Travel' },
                { id: 4, name: 'Employment & Education' },
                { id: 5, name: 'Family Details' },
                { id: 6, name: 'Legal History' },
                { id: 7, name: 'Review & Consent' },
              ].map((step) => (
                <div
                  key={step.id}
                  className={`flex-1 text-center py-2 rounded-full text-sm font-medium ${
                    currentStep === step.id ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {step.name}
                </div>
              ))}
            </div>

            <div className="flex gap-6">
              <div className="flex-1">{renderStep()}</div>

              {inputMethod === 'voice' && currentStep > 0 && (
                <div className="w-[300px]">
                  <VoiceBotStart
                    sectionName={getSectionNameByStep(currentStep)}
                    intakeLink={intakeLink}
                    onAutoFill={updateFormData}
                  />
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SmartIntakeScreen;
