import React from 'react';

const FamilyStep = ({ formData, updateFormData, nextStep, prevStep }) => {
  const handleChange = (e) => {
    updateFormData({ [e.target.name]: e.target.value });
  };

  const handleChildChange = (index, e) => {
    const newChildren = [...(formData.children || [])];
    newChildren[index] = { ...newChildren[index], [e.target.name]: e.target.value };
    updateFormData({ children: newChildren });
  };

  const addChild = () => {
    updateFormData({ children: [...(formData.children || []), {}] });
  };

  const removeChild = (index) => {
    const newChildren = [...(formData.children || [])];
    newChildren.splice(index, 1);
    updateFormData({ children: newChildren });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    nextStep();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Step 5: Family Details</h2>
      <div>
        <label htmlFor="maritalStatus" className="block text-sm font-medium text-gray-700">Marital Status</label>
        <select
          name="maritalStatus"
          id="maritalStatus"
          value={formData.maritalStatus || ''}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          required
        >
          <option value="">Select...</option>
          <option value="Single">Single</option>
          <option value="Married">Married</option>
          <option value="Divorced">Divorced</option>
          <option value="Widowed">Widowed</option>
        </select>
      </div>

      {formData.maritalStatus === 'Married' && (
        <>
          <div>
            <label htmlFor="spouseFullName" className="block text-sm font-medium text-gray-700">Spouse’s Full Name</label>
            <input
              type="text"
              name="spouseFullName"
              id="spouseFullName"
              value={formData.spouseFullName || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            />
          </div>
          <div>
            <label htmlFor="spouseImmigrationStatus" className="block text-sm font-medium text-gray-700">Spouse’s Immigration Status</label>
            <input
              type="text"
              name="spouseImmigrationStatus"
              id="spouseImmigrationStatus"
              value={formData.spouseImmigrationStatus || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            />
          </div>
        </>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">Children</label>
        {(formData.children || []).map((child, index) => (
          <div key={index} className="flex space-x-2 mb-2 items-end">
            <div className="flex-grow">
              <label htmlFor={`childName-${index}`} className="block text-xs font-medium text-gray-500">Name</label>
              <input
                type="text"
                name="name"
                id={`childName-${index}`}
                value={child.name || ''}
                onChange={(e) => handleChildChange(index, e)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>
            <div className="flex-grow">
              <label htmlFor={`childDOB-${index}`} className="block text-xs font-medium text-gray-500">Date of Birth</label>
              <input
                type="date"
                name="dateOfBirth"
                id={`childDOB-${index}`}
                value={child.dateOfBirth || ''}
                onChange={(e) => handleChildChange(index, e)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>
            <div className="flex-grow">
              <label htmlFor={`childImmigrationStatus-${index}`} className="block text-xs font-medium text-gray-500">Immigration Status (if any)</label>
              <input
                type="text"
                name="immigrationStatus"
                id={`childImmigrationStatus-${index}`}
                value={child.immigrationStatus || ''}
                onChange={(e) => handleChildChange(index, e)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
            <button
              type="button"
              onClick={() => removeChild(index)}
              className="p-2 text-red-600 hover:text-red-800"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addChild}
          className="mt-2 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Add Child
        </button>
      </div>

      <div>
        <label htmlFor="sponsoredByFamily" className="block text-sm font-medium text-gray-700">Are you being sponsored by a family member?</label>
        <select
          name="sponsoredByFamily"
          id="sponsoredByFamily"
          value={formData.sponsoredByFamily || ''}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          required
        >
          <option value="">Select...</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
      </div>

      {formData.sponsoredByFamily === 'Yes' && (
        <div>
          <label htmlFor="sponsorRelationship" className="block text-sm font-medium text-gray-700">Relationship to the sponsor</label>
          <input
            type="text"
            name="sponsorRelationship"
            id="sponsorRelationship"
            value={formData.sponsorRelationship || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            required
          />
        </div>
      )}

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

export default FamilyStep;
