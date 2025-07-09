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
    <form onSubmit={handleSubmit} className="space-y-4 p-6 bg-color-secondary rounded-lg shadow-lg transition-colors duration-300 ease-in-out">
      <h2 className="text-xl font-bold text-color-text mb-4 border-b pb-2 border-color-border">Step 2: Immigration Intent</h2>
      <div>
        <label htmlFor="inUS" className="block text-sm font-medium text-color-text">Are you currently in the U.S.?</label>
        <select
          name="inUS"
          id="inUS"
          value={formData.inUS || ''}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-color-border shadow-sm focus:border-color-accent focus:ring-color-accent sm:text-sm bg-color-primary text-color-text transition-colors duration-300 ease-in-out"
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
            <label htmlFor="dateOfEntry" className="block text-sm font-medium text-color-text">Date of Entry</label>
            <input
              type="date"
              name="dateOfEntry"
              id="dateOfEntry"
              value={formData.dateOfEntry || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-color-border shadow-sm focus:border-color-accent focus:ring-color-accent sm:text-sm bg-color-primary text-color-text transition-colors duration-300 ease-in-out"
              required
            />
          </div>
          <div>
            <label htmlFor="portOfEntry" className="block text-sm font-medium text-color-text">Port of Entry</label>
            <input
              type="text"
              name="portOfEntry"
              id="portOfEntry"
              value={formData.portOfEntry || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-color-border shadow-sm focus:border-color-accent focus:ring-color-accent sm:text-sm bg-color-primary text-color-text transition-colors duration-300 ease-in-out"
              required
            />
          </div>
          <div>
            <label htmlFor="currentVisaType" className="block text-sm font-medium text-color-text">Current Visa Type/Status</label>
            <input
              type="text"
              name="currentVisaType"
              id="currentVisaType"
              value={formData.currentVisaType || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-color-border shadow-sm focus:border-color-accent focus:ring-color-accent sm:text-sm bg-color-primary text-color-text transition-colors duration-300 ease-in-out"
              required
            />
          </div>
          <div>
            <label htmlFor="visaExpiryDate" className="block text-sm font-medium text-color-text">Expiry Date</label>
            <input
              type="date"
              name="visaExpiryDate"
              id="visaExpiryDate"
              value={formData.visaExpiryDate || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-color-border shadow-sm focus:border-color-accent focus:ring-color-accent sm:text-sm bg-color-primary text-color-text transition-colors duration-300 ease-in-out"
              required
            />
          </div>
        </>
      )}

      <div>
        <label htmlFor="immigrationBenefit" className="block text-sm font-medium text-color-text">What immigration benefit are you seeking?</label>
        <select
          name="immigrationBenefit"
          id="immigrationBenefit"
          value={formData.immigrationBenefit || ''}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-color-border shadow-sm focus:border-color-accent focus:ring-color-accent sm:text-sm bg-color-primary text-color-text transition-colors duration-300 ease-in-out"
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
          <label htmlFor="otherImmigrationBenefit" className="block text-sm font-medium text-color-text">Please specify:</label>
          <input
            type="text"
            name="otherImmigrationBenefit"
            id="otherImmigrationBenefit"
            value={formData.otherImmigrationBenefit || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-color-border shadow-sm focus:border-color-accent focus:ring-color-accent sm:text-sm bg-color-primary text-color-text transition-colors duration-300 ease-in-out"
            required
          />
        </div>
      )}

      <div>
        <label htmlFor="applicationReason" className="block text-sm font-medium text-color-text">Why are you applying? (Short description)</label>
        <textarea
          name="applicationReason"
          id="applicationReason"
          value={formData.applicationReason || ''}
          onChange={handleChange}
          rows="3"
          className="mt-1 block w-full rounded-md border-color-border shadow-sm focus:border-color-accent focus:ring-color-accent sm:text-sm bg-color-primary text-color-text transition-colors duration-300 ease-in-out"
          required
        ></textarea>
      </div>

      <div className="flex justify-between mt-6">
        <button
          type="button"
          onClick={prevStep}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-color-text-secondary hover:bg-color-text-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-color-text-secondary"
        >
          Previous
        </button>
        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-color-accent hover:bg-color-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-color-accent"
        >
          Next
        </button>
      </div>
    </form>
  );
};

export default ImmigrationIntentStep;
