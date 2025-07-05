import React from 'react';

const LegalHistoryStep = ({ formData, updateFormData, nextStep, prevStep }) => {
  const handleChange = (e) => {
    updateFormData({ [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    nextStep();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Step 6: Legal & Immigration History</h2>
      <div>
        <label htmlFor="everArrested" className="block text-sm font-medium text-gray-700">Have you ever been arrested?</label>
        <select
          name="everArrested"
          id="everArrested"
          value={formData.everArrested || ''}
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
        <label htmlFor="everConvicted" className="block text-sm font-medium text-gray-700">Have you ever been convicted of a crime?</label>
        <select
          name="everConvicted"
          id="everConvicted"
          value={formData.everConvicted || ''}
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
        <label htmlFor="everDetained" className="block text-sm font-medium text-gray-700">Have you ever been detained by immigration authorities?</label>
        <select
          name="everDetained"
          id="everDetained"
          value={formData.everDetained || ''}
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
        <label htmlFor="everDeported" className="block text-sm font-medium text-gray-700">Have you ever been deported or removed from any country?</label>
        <select
          name="everDeported"
          id="everDeported"
          value={formData.everDeported || ''}
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
        <label htmlFor="pendingApplication" className="block text-sm font-medium text-gray-700">Do you currently have a pending immigration application?</label>
        <select
          name="pendingApplication"
          id="pendingApplication"
          value={formData.pendingApplication || ''}
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
        <label htmlFor="liedOnVisa" className="block text-sm font-medium text-gray-700">Have you ever lied or misrepresented facts in any visa application?</label>
        <select
          name="liedOnVisa"
          id="liedOnVisa"
          value={formData.liedOnVisa || ''}
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

export default LegalHistoryStep;
