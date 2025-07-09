
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { submitIntake } from '../../features/intakeSlice';

const ReviewSubmitStep = ({ formData, prevStep, intakeLink, onSubmissionSuccess }) => {
  const dispatch = useDispatch();
  const [confirmAccuracy, setConfirmAccuracy] = useState(false);
  const [consentToShare, setConsentToShare] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (window.confirm('This is the final step. Please review your information carefully before submitting. Proceed?')) {
      try {
        await dispatch(submitIntake({ intakeLink, ...formData })).unwrap();
        setSubmitted(true);
        if (onSubmissionSuccess) {
          onSubmissionSuccess();
        }
        localStorage.removeItem('intakeFormData');
        localStorage.removeItem('intakeCurrentStep');
      } catch (error) {
        console.error('Submission failed:', error);
        alert(`Submission failed: ${error.message || 'Please try again.'}`);
      }
    }
  };

  if (submitted) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold text-green-600 mb-4">Thank You!</h2>
        <p className="text-gray-700">Your intake form has been submitted successfully.</p>
        <p className="text-gray-700">Our team will review your information and contact you shortly.</p>
      </div>
    );
  }

  const isSubmitDisabled = !confirmAccuracy || !consentToShare;

  // Helper to render nested objects for display
  const renderValue = (value) => {
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'object' && value !== null) {
      return (
        <ul className="list-disc list-inside ml-4">
          {Object.entries(value).map(([subKey, subValue]) => (
            <li key={subKey}>
              <span className="font-medium">{subKey}:</span> {renderValue(subValue)}
            </li>
          ))}
        </ul>
      );
    }
    return String(value);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Step 8: Final Review & Consent</h2>
      <div className="bg-gray-50 p-4 rounded-md max-h-96 overflow-y-auto">
        <h3 className="text-lg font-semibold mb-2">Summary of Information:</h3>
        {Object.keys(formData).length > 0 ? (
          <ul className="space-y-2">
            {Object.entries(formData).map(([key, value]) => (
              <li key={key} className="border-b pb-1">
                <span className="font-semibold capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                <div className="pl-2 text-gray-700">{renderValue(value)}</div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No data to display. Please go back and fill out the form.</p>
        )}
      </div>

      <div className="flex items-center mt-4">
        <input
          id="confirmAccuracy"
          name="confirmAccuracy"
          type="checkbox"
          checked={confirmAccuracy}
          onChange={(e) => setConfirmAccuracy(e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="confirmAccuracy" className="ml-2 block text-sm text-gray-900">
          I confirm all information is accurate to the best of my knowledge
        </label>
      </div>
      <div className="flex items-center mt-2">
        <input
          id="consentToShare"
          name="consentToShare"
          type="checkbox"
          checked={consentToShare}
          onChange={(e) => setConsentToShare(e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="consentToShare" className="ml-2 block text-sm text-gray-900">
          I consent to sharing this information with my attorney for case preparation
        </label>
      </div>

      <div className="flex justify-between mt-6">
        <button
          type="button"
          onClick={prevStep}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          Previous
        </button>
        <button
          type="submit"
          disabled={isSubmitDisabled}
          className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${isSubmitDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'}`}
        >
          Submit Form
        </button>
      </div>
    </form>
  );
};

export default ReviewSubmitStep;

