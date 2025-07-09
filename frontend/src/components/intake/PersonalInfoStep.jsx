import React from 'react';

const PersonalInfoStep = ({ formData, updateFormData, nextStep }) => {
  const handleChange = (e) => {
    updateFormData({ [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add validation logic here if needed
    nextStep();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6 bg-color-secondary rounded-lg shadow-lg transition-colors duration-300 ease-in-out">
      <h2 className="text-xl font-bold text-color-text mb-4 border-b pb-2 border-color-border">Step 1: Personal Information</h2>
      <div>
        <label htmlFor="firstName" className="block text-sm font-medium text-color-text">First Name</label>
        <input
          type="text"
          name="firstName"
          id="firstName"
          value={formData.firstName || ''}
          onChange={handleChange}
          className="mt-1 block w-full px-4 py-2.5 rounded-md border-color-border shadow-sm focus:border-color-accent focus:ring-color-accent sm:text-sm bg-color-primary text-color-text transition-colors duration-300 ease-in-out"
          required
        />
      </div>
      <div>
        <label htmlFor="middleName" className="block text-sm font-medium text-color-text">Middle Name (optional)</label>
        <input
          type="text"
          name="middleName"
          id="middleName"
          value={formData.middleName || ''}
          onChange={handleChange}
          className="mt-1 block w-full px-4 py-2.5 rounded-md border-color-border shadow-sm focus:border-color-accent focus:ring-color-accent sm:text-sm bg-color-primary text-color-text transition-colors duration-300 ease-in-out"
        />
      </div>
      <div>
        <label htmlFor="lastName" className="block text-sm font-medium text-color-text">Last Name</label>
        <input
          type="text"
          name="lastName"
          id="lastName"
          value={formData.lastName || ''}
          onChange={handleChange}
          className="mt-1 block w-full px-4 py-2.5 rounded-md border-color-border shadow-sm focus:border-color-accent focus:ring-color-accent sm:text-sm bg-color-primary text-color-text transition-colors duration-300 ease-in-out"
          required
        />
      </div>
      <div>
        <label htmlFor="dateOfBirth" className="block text-sm font-medium text-color-text">Date of Birth</label>
        <input
          type="date"
          name="dateOfBirth"
          id="dateOfBirth"
          value={formData.dateOfBirth || ''}
          onChange={handleChange}
          className="mt-1 block w-full px-4 py-2.5 rounded-md border-color-border shadow-sm focus:border-color-accent focus:ring-color-accent sm:text-sm bg-color-primary text-color-text transition-colors duration-300 ease-in-out"
          required
        />
      </div>
      <div>
        <label htmlFor="gender" className="block text-sm font-medium text-color-text">Gender</label>
        <select
          name="gender"
          id="gender"
          value={formData.gender || ''}
          onChange={handleChange}
          className="mt-1 block w-full px-4 py-2.5 rounded-md border-color-border shadow-sm focus:border-color-accent focus:ring-color-accent sm:text-sm bg-color-primary text-color-text transition-colors duration-300 ease-in-out"
          required
        >
          <option value="">Select...</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Non-binary">Non-binary</option>
          <option value="Prefer not to say">Prefer not to say</option>
        </select>
      </div>
      <div>
        <label htmlFor="countryOfBirth" className="block text-sm font-medium text-color-text">Country of Birth</label>
        <input
          type="text"
          name="countryOfBirth"
          id="countryOfBirth"
          value={formData.countryOfBirth || ''}
          onChange={handleChange}
          className="mt-1 block w-full px-4 py-2.5 rounded-md border-color-border shadow-sm focus:border-color-accent focus:ring-color-accent sm:text-sm bg-color-primary text-color-text transition-colors duration-300 ease-in-out"
          required
        />
      </div>
      <div>
        <label htmlFor="countryOfCitizenship" className="block text-sm font-medium text-color-text">Country of Citizenship</label>
        <input
          type="text"
          name="countryOfCitizenship"
          id="countryOfCitizenship"
          value={formData.countryOfCitizenship || ''}
          onChange={handleChange}
          className="mt-1 block w-full px-4 py-2.5 rounded-md border-color-border shadow-sm focus:border-color-accent focus:ring-color-accent sm:text-sm bg-color-primary text-color-text transition-colors duration-300 ease-in-out"
          required
        />
      </div>
      <div>
        <label htmlFor="nationality" className="block text-sm font-medium text-color-text">Nationality (if different)</label>
        <input
          type="text"
          name="nationality"
          id="nationality"
          value={formData.nationality || ''}
          onChange={handleChange}
          className="mt-1 block w-full px-4 py-2.5 rounded-md border-color-border shadow-sm focus:border-color-accent focus:ring-color-accent sm:text-sm bg-color-primary text-color-text transition-colors duration-300 ease-in-out"
        />
      </div>
      <div>
        <label htmlFor="phoneNumber" className="block text-sm font-medium text-color-text">Phone Number</label>
        <input
          type="tel"
          name="phoneNumber"
          id="phoneNumber"
          value={formData.phoneNumber || ''}
          onChange={handleChange}
          className="mt-1 block w-full px-4 py-2.5 rounded-md border-color-border shadow-sm focus:border-color-accent focus:ring-color-accent sm:text-sm bg-color-primary text-color-text transition-colors duration-300 ease-in-out"
          required
        />
      </div>
      <div>
        <label htmlFor="emailAddress" className="block text-sm font-medium text-color-text">Email Address</label>
        <input
          type="email"
          name="emailAddress"
          id="emailAddress"
          value={formData.emailAddress || ''}
          onChange={handleChange}
          className="mt-1 block w-full px-4 py-2.5 rounded-md border-color-border shadow-sm focus:border-color-accent focus:ring-color-accent sm:text-sm bg-color-primary text-color-text transition-colors duration-300 ease-in-out"
          required
        />
      </div>
      <div>
        <label htmlFor="preferredLanguage" className="block text-sm font-medium text-color-text">Preferred Language</label>
        <input
          type="text"
          name="preferredLanguage"
          id="preferredLanguage"
          value={formData.preferredLanguage || ''}
          onChange={handleChange}
          className="mt-1 block w-full px-4 py-2.5 rounded-md border-color-border shadow-sm focus:border-color-accent focus:ring-color-accent sm:text-sm bg-color-primary text-color-text transition-colors duration-300 ease-in-out"
          required
        />
      </div>
      <div className="flex justify-end mt-6">
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

export default PersonalInfoStep;
