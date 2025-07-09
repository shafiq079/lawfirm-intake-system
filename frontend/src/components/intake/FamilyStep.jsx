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
    <form onSubmit={handleSubmit} className="space-y-4 p-6 bg-color-secondary rounded-lg shadow-lg transition-colors duration-300 ease-in-out">
      <h2 className="text-xl font-bold text-color-text mb-4 border-b pb-2 border-color-border">Step 5: Family Details</h2>
      <div>
        <label htmlFor="maritalStatus" className="block text-sm font-medium text-color-text">Marital Status</label>
        <select
          name="maritalStatus"
          id="maritalStatus"
          value={formData.maritalStatus || ''}
          onChange={handleChange}
          className="mt-1 block w-full px-4 py-2.5 rounded-md border-color-border shadow-sm focus:border-color-accent focus:ring-color-accent sm:text-sm bg-color-primary text-color-text transition-colors duration-300 ease-in-out"
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
            <label htmlFor="spouseFullName" className="block text-sm font-medium text-color-text">Spouse’s Full Name</label>
            <input
              type="text"
              name="spouseFullName"
              id="spouseFullName"
              value={formData.spouseFullName || ''}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-2.5 rounded-md border-color-border shadow-sm focus:border-color-accent focus:ring-color-accent sm:text-sm bg-color-primary text-color-text transition-colors duration-300 ease-in-out"
              required
            />
          </div>
          <div>
            <label htmlFor="spouseImmigrationStatus" className="block text-sm font-medium text-color-text">Spouse’s Immigration Status</label>
            <input
              type="text"
              name="spouseImmigrationStatus"
              id="spouseImmigrationStatus"
              value={formData.spouseImmigrationStatus || ''}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-2.5 rounded-md border-color-border shadow-sm focus:border-color-accent focus:ring-color-accent sm:text-sm bg-color-primary text-color-text transition-colors duration-300 ease-in-out"
              required
            />
          </div>
        </>
      )}

      <div>
        <label className="block text-sm font-medium text-color-text">Children</label>
        {(formData.children || []).map((child, index) => (
          <div key={index} className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mb-4 items-end p-3 border border-color-border rounded-md bg-color-primary shadow-sm">
            <div className="flex-grow w-full">
              <label htmlFor={`childName-${index}`} className="block text-xs font-medium text-color-text-secondary">Name</label>
              <input
                type="text"
                name="name"
                id={`childName-${index}`}
                value={child.name || ''}
                onChange={(e) => handleChildChange(index, e)}
                className="mt-1 block w-full rounded-md border-color-border shadow-sm focus:border-color-accent focus:ring-color-accent sm:text-sm bg-color-secondary text-color-text transition-colors duration-300 ease-in-out"
                required
              />
            </div>
            <div className="flex-grow w-full">
              <label htmlFor={`childDOB-${index}`} className="block text-xs font-medium text-color-text-secondary">Date of Birth</label>
              <input
                type="date"
                name="dateOfBirth"
                id={`childDOB-${index}`}
                value={child.dateOfBirth || ''}
                onChange={(e) => handleChildChange(index, e)}
                className="mt-1 block w-full rounded-md border-color-border shadow-sm focus:border-color-accent focus:ring-color-accent sm:text-sm bg-color-secondary text-color-text transition-colors duration-300 ease-in-out"
                required
              />
            </div>
            <div className="flex-grow w-full">
              <label htmlFor={`childImmigrationStatus-${index}`} className="block text-xs font-medium text-color-text-secondary">Immigration Status (if any)</label>
              <input
                type="text"
                name="immigrationStatus"
                id={`childImmigrationStatus-${index}`}
                value={child.immigrationStatus || ''}
                onChange={(e) => handleChildChange(index, e)}
                className="mt-1 block w-full rounded-md border-color-border shadow-sm focus:border-color-accent focus:ring-color-accent sm:text-sm bg-color-secondary text-color-text transition-colors duration-300 ease-in-out"
              />
            </div>
            <button
              type="button"
              onClick={() => removeChild(index)}
              className="p-2 text-color-error hover:text-color-error transition-colors duration-300 ease-in-out"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addChild}
          className="mt-2 inline-flex items-center px-3 py-2 border border-color-border shadow-sm text-sm leading-4 font-medium rounded-md text-color-text bg-color-primary hover:bg-color-accent hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-color-accent transition-all duration-300 ease-in-out"
        >
          Add Child
        </button>
      </div>

      <div>
        <label htmlFor="sponsoredByFamily" className="block text-sm font-medium text-color-text">Are you being sponsored by a family member?</label>
        <select
          name="sponsoredByFamily"
          id="sponsoredByFamily"
          value={formData.sponsoredByFamily || ''}
          onChange={handleChange}
          className="mt-1 block w-full px-4 py-2.5 rounded-md border-color-border shadow-sm focus:border-color-accent focus:ring-color-accent sm:text-sm bg-color-primary text-color-text transition-colors duration-300 ease-in-out"
          required
        >
          <option value="">Select...</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
      </div>

      {formData.sponsoredByFamily === 'Yes' && (
        <div>
          <label htmlFor="sponsorRelationship" className="block text-sm font-medium text-color-text">Relationship to the sponsor</label>
          <input
            type="text"
            name="sponsorRelationship"
            id="sponsorRelationship"
            value={formData.sponsorRelationship || ''}
            onChange={handleChange}
            className="mt-1 block w-full px-4 py-2.5 rounded-md border-color-border shadow-sm focus:border-color-accent focus:ring-color-accent sm:text-sm bg-color-primary text-color-text transition-colors duration-300 ease-in-out"
            required
          />
        </div>
      )}

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

export default FamilyStep;
