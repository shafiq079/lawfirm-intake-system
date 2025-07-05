import React from 'react';

const EmploymentEducationStep = ({ formData, updateFormData, nextStep, prevStep }) => {
  const handleChange = (e) => {
    updateFormData({ [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    nextStep();
  };

  // Only show this step if visa type is employment- or study-based
  const isApplicable = formData.immigrationBenefit === 'Work Visa' || formData.immigrationBenefit === 'Student Visa';

  if (!isApplicable) {
    // If not applicable, skip this step and go to the next one
    // This logic should ideally be handled in the parent SmartIntakeScreen to control step progression
    // For now, we'll just render a message or directly call nextStep if this component is rendered conditionally
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold mb-4">Step 4: Employment & Education</h2>
        <p>This step is not applicable based on your selected immigration benefit.</p>
        <div className="flex justify-between">
          <button
            type="button"
            onClick={prevStep}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={nextStep}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Next
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Step 4: Employment & Education</h2>
      <div>
        <label htmlFor="currentEmployerName" className="block text-sm font-medium text-gray-700">Current Employer Name</label>
        <input
          type="text"
          name="currentEmployerName"
          id="currentEmployerName"
          value={formData.currentEmployerName || ''}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700">Job Title</label>
        <input
          type="text"
          name="jobTitle"
          id="jobTitle"
          value={formData.jobTitle || ''}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="employmentStartDate" className="block text-sm font-medium text-gray-700">Employment Start Date</label>
        <input
          type="date"
          name="employmentStartDate"
          id="employmentStartDate"
          value={formData.employmentStartDate || ''}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="jobDutiesDescription" className="block text-sm font-medium text-gray-700">Description of Job Duties</label>
        <textarea
          name="jobDutiesDescription"
          id="jobDutiesDescription"
          value={formData.jobDutiesDescription || ''}
          onChange={handleChange}
          rows="3"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        ></textarea>
      </div>
      <div>
        <label htmlFor="highestEducation" className="block text-sm font-medium text-gray-700">Highest Level of Education Completed</label>
        <input
          type="text"
          name="highestEducation"
          id="highestEducation"
          value={formData.highestEducation || ''}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="fieldOfStudy" className="block text-sm font-medium text-gray-700">Field of Study</label>
        <input
          type="text"
          name="fieldOfStudy"
          id="fieldOfStudy"
          value={formData.fieldOfStudy || ''}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="schoolUniversityName" className="block text-sm font-medium text-gray-700">School/University Name</label>
        <input
          type="text"
          name="schoolUniversityName"
          id="schoolUniversityName"
          value={formData.schoolUniversityName || ''}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="graduationYear" className="block text-sm font-medium text-gray-700">Graduation Year</label>
        <input
          type="number"
          name="graduationYear"
          id="graduationYear"
          value={formData.graduationYear || ''}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
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

export default EmploymentEducationStep;
