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
    <form onSubmit={handleSubmit} className="space-y-4 p-6 bg-color-secondary rounded-lg shadow-lg transition-colors duration-300 ease-in-out">
      <h2 className="text-xl font-bold text-color-text mb-4 border-b pb-2 border-color-border">Step 3: Passport & Travel Info</h2>
      <div>
        <label htmlFor="passportNumber" className="block text-sm font-medium text-color-text">Passport Number</label>
        <input
          type="text"
          name="passportNumber"
          id="passportNumber"
          value={formData.passportNumber || ''}
          onChange={handleChange}
          className="mt-1 block w-full px-4 py-2.5 rounded-md border-color-border shadow-sm focus:border-color-accent focus:ring-color-accent sm:text-sm bg-color-primary text-color-text transition-colors duration-300 ease-in-out"
          required
        />
      </div>
      <div>
        <label htmlFor="passportCountryOfIssue" className="block text-sm font-medium text-color-text">Country of Issue</label>
        <input
          type="text"
          name="passportCountryOfIssue"
          id="passportCountryOfIssue"
          value={formData.passportCountryOfIssue || ''}
          onChange={handleChange}
          className="mt-1 block w-full px-4 py-2.5 rounded-md border-color-border shadow-sm focus:border-color-accent focus:ring-color-accent sm:text-sm bg-color-primary text-color-text transition-colors duration-300 ease-in-out"
          required
        />
      </div>
      <div>
        <label htmlFor="passportExpiryDate" className="block text-sm font-medium text-color-text">Passport Expiry Date</label>
        <input
          type="date"
          name="passportExpiryDate"
          id="passportExpiryDate"
          value={formData.passportExpiryDate || ''}
          onChange={handleChange}
          className="mt-1 block w-full px-4 py-2.5 rounded-md border-color-border shadow-sm focus:border-color-accent focus:ring-color-accent sm:text-sm bg-color-primary text-color-text transition-colors duration-300 ease-in-out"
          required
        />
      </div>
      <div>
        <label htmlFor="i94Number" className="block text-sm font-medium text-color-text">I-94 Number (if available)</label>
        <input
          type="text"
          name="i94Number"
          id="i94Number"
          value={formData.i94Number || ''}
          onChange={handleChange}
          className="mt-1 block w-full px-4 py-2.5 rounded-md border-color-border shadow-sm focus:border-color-accent focus:ring-color-accent sm:text-sm bg-color-primary text-color-text transition-colors duration-300 ease-in-out"
        />
      </div>
      <div>
        <label htmlFor="previousTravelHistory" className="block text-sm font-medium text-color-text">Previous Travel History (free text or file upload option)</label>
        <textarea
          name="previousTravelHistory"
          id="previousTravelHistory"
          value={formData.previousTravelHistory || ''}
          onChange={handleChange}
          rows="3"
          className="mt-1 block w-full px-4 py-2.5 rounded-md border-color-border shadow-sm focus:border-color-accent focus:ring-color-accent sm:text-sm bg-color-primary text-color-text transition-colors duration-300 ease-in-out"
        ></textarea>
      </div>
      <div>
        <label htmlFor="overstayedVisa" className="block text-sm font-medium text-color-text">Have you ever overstayed a visa?</label>
        <select
          name="overstayedVisa"
          id="overstayedVisa"
          value={formData.overstayedVisa || ''}
          onChange={handleChange}
          className="mt-1 block w-full px-4 py-2.5 rounded-md border-color-border shadow-sm focus:border-color-accent focus:ring-color-accent sm:text-sm bg-color-primary text-color-text transition-colors duration-300 ease-in-out"
          required
        >
          <option value="">Select...</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
      </div>
      <div>
        <label htmlFor="deniedVisa" className="block text-sm font-medium text-color-text">Have you ever been denied a visa?</label>
        <select
          name="deniedVisa"
          id="deniedVisa"
          value={formData.deniedVisa || ''}
          onChange={handleChange}
          className="mt-1 block w-full px-4 py-2.5 rounded-md border-color-border shadow-sm focus:border-color-accent focus:ring-color-accent sm:text-sm bg-color-primary text-color-text transition-colors duration-300 ease-in-out"
          required
        >
          <option value="">Select...</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
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

export default PassportTravelStep;
