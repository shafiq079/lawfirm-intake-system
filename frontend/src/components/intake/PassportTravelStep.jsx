import React from 'react';

const PassportTravelStep = ({ formData, updateFormData, nextStep, prevStep }) => {
  const handleChange = (e) => {
    updateFormData({ [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    nextStep();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Step 3: Passport & Travel Info</h2>
      <div>
        <label htmlFor="passportNumber" className="block text-sm font-medium text-gray-700">Passport Number</label>
        <input
          type="text"
          name="passportNumber"
          id="passportNumber"
          value={formData.passportNumber || ''}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          required
        />
      </div>
      <div>
        <label htmlFor="passportCountryOfIssue" className="block text-sm font-medium text-gray-700">Country of Issue</label>
        <input
          type="text"
          name="passportCountryOfIssue"
          id="passportCountryOfIssue"
          value={formData.passportCountryOfIssue || ''}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          required
        />
      </div>
      <div>
        <label htmlFor="passportExpiryDate" className="block text-sm font-medium text-gray-700">Passport Expiry Date</label>
        <input
          type="date"
          name="passportExpiryDate"
          id="passportExpiryDate"
          value={formData.passportExpiryDate || ''}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          required
        />
      </div>
      <div>
        <label htmlFor="i94Number" className="block text-sm font-medium text-gray-700">I-94 Number (if available)</label>
        <input
          type="text"
          name="i94Number"
          id="i94Number"
          value={formData.i94Number || ''}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="previousTravelHistory" className="block text-sm font-medium text-gray-700">Previous Travel History (free text or file upload option)</label>
        <textarea
          name="previousTravelHistory"
          id="previousTravelHistory"
          value={formData.previousTravelHistory || ''}
          onChange={handleChange}
          rows="3"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        ></textarea>
      </div>
      <div>
        <label htmlFor="overstayedVisa" className="block text-sm font-medium text-gray-700">Have you ever overstayed a visa?</label>
        <select
          name="overstayedVisa"
          id="overstayedVisa"
          value={formData.overstayedVisa || ''}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          required
        >
          <option value="">Select...</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
      </div>
      <div>
        <label htmlFor="deniedVisa" className="block text-sm font-medium text-gray-700">Have you ever been denied a visa?</label>
        <select
          name="deniedVisa"
          id="deniedVisa"
          value={formData.deniedVisa || ''}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          required
        >
          <option value="">Select...</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={prevStep}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          Previous
        </button>
        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Next
        </button>
      </div>
    </form>
  );
};

export default PassportTravelStep;
