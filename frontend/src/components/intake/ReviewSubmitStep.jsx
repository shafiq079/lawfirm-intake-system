import React from 'react';

const ReviewSubmitStep = ({ formData, nextStep, prevStep }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the formData to your backend
    console.log('Submitting form data:', formData);
    alert('Form Submitted Successfully!');
    // Optionally navigate to a thank you page or reset the form
    localStorage.removeItem('intakeFormData');
    localStorage.removeItem('intakeCurrentStep');
    nextStep(); // Or navigate to a confirmation page
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Step 8: Final Review & Consent</h2>
      <div className="bg-gray-50 p-4 rounded-md max-h-96 overflow-y-auto">
        <h3 className="text-lg font-semibold mb-2">Summary of Information:</h3>
        {Object.keys(formData).length > 0 ? (
          <ul className="list-disc list-inside space-y-1">
            {Object.entries(formData).map(([key, value]) => {
              if (typeof value === 'object' && value !== null) {
                return (
                  <li key={key}>
                    <span className="font-medium">{key}:</span>
                    <ul className="list-disc list-inside ml-4">
                      {Object.entries(value).map(([subKey, subValue]) => (
                        <li key={subKey}><span className="font-medium">{subKey}:</span> {JSON.stringify(subValue)}</li>
                      ))}
                    </ul>
                  </li>
                );
              } else {
                return (
                  <li key={key}>
                    <span className="font-medium">{key}:</span> {String(value)}
                  </li>
                );
              }
            })}
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
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          required
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
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          required
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
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          Submit Form
        </button>
      </div>
    </form>
  );
};

export default ReviewSubmitStep;
