import React from 'react';

const ImmigrationIntentStep = ({ formData, updateFormData, nextStep, prevStep }) => {
  const handleChange = (e) => {
    updateFormData({ [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    nextStep();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Step 2: Immigration Intent</h2>
      <div>
        <label htmlFor="inUS" className="block text-sm font-medium text-gray-700">Are you currently in the U.S.?</label>
        <select
          name="inUS"
          id="inUS"
          value={formData.inUS || ''}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          required
        >
          <option value="">Select...</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
      </div>

      {formData.inUS === 'Yes' && (
        <>
          <div>
            <label htmlFor="dateOfEntry" className="block text-sm font-medium text-gray-700">Date of Entry</label>
            <input
              type="date"
              name="dateOfEntry"
              id="dateOfEntry"
              value={formData.dateOfEntry || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            />
          </div>
          <div>
            <label htmlFor="portOfEntry" className="block text-sm font-medium text-gray-700">Port of Entry</label>
            <input
              type="text"
              name="portOfEntry"
              id="portOfEntry"
              value={formData.portOfEntry || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            />
          </div>
          <div>
            <label htmlFor="currentVisaType" className="block text-sm font-medium text-gray-700">Current Visa Type/Status</label>
            <input
              type="text"
              name="currentVisaType"
              id="currentVisaType"
              value={formData.currentVisaType || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            />
          </div>
          <div>
            <label htmlFor="visaExpiryDate" className="block text-sm font-medium text-gray-700">Expiry Date</label>
            <input
              type="date"
              name="visaExpiryDate"
              id="visaExpiryDate"
              value={formData.visaExpiryDate || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            />
          </div>
        </>
      )}

      <div>
        <label htmlFor="immigrationBenefit" className="block text-sm font-medium text-gray-700">What immigration benefit are you seeking?</label>
        <select
          name="immigrationBenefit"
          id="immigrationBenefit"
          value={formData.immigrationBenefit || ''}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          required
        >
          <option value="">Select...</option>
          <option value="Green Card">Green Card</option>
          <option value="Student Visa">Student Visa</option>
          <option value="Work Visa">Work Visa</option>
          <option value="Asylum">Asylum</option>
          <option value="Family Petition">Family Petition</option>
          <option value="Citizenship">Citizenship</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {formData.immigrationBenefit === 'Other' && (
        <div>
          <label htmlFor="otherImmigrationBenefit" className="block text-sm font-medium text-gray-700">Please specify:</label>
          <input
            type="text"
            name="otherImmigrationBenefit"
            id="otherImmigrationBenefit"
            value={formData.otherImmigrationBenefit || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            required
          />
        </div>
      )}

      <div>
        <label htmlFor="applicationReason" className="block text-sm font-medium text-gray-700">Why are you applying? (Short description)</label>
        <textarea
          name="applicationReason"
          id="applicationReason"
          value={formData.applicationReason || ''}
          onChange={handleChange}
          rows="3"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          required
        ></textarea>
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

export default ImmigrationIntentStep;
