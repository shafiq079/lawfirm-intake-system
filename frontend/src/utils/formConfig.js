export const formConfig = {
  personalInfo: {
    title: "Personal Information",
    fields: [
      { id: 'firstName', question: "What is your first name?", type: 'text', validation: { required: true } },
      { id: 'lastName', question: "What is your last name?", type: 'text', validation: { required: true } },
      { id: 'dateOfBirth', question: "What is your date of birth? Please state it as Month Day, Year, for example, January 1st, 1990.", type: 'date', validation: { required: true } },
      { id: 'nationality', question: "What is your nationality?", type: 'text', validation: { required: true } },
      { id: 'phoneNumber', question: "What is your phone number?", type: 'tel', validation: { required: true, pattern: /^\d{10}$/ } },
      { id: 'email', question: "What is your email address?", type: 'email', validation: { required: true, pattern: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/ } },
    ],
  },
  immigrationIntent: {
    title: "Immigration Intent",
    fields: [
      { id: 'visaType', question: "What type of visa are you interested in?", type: 'text', validation: { required: true } },
      { id: 'purposeOfVisit', question: "What is the purpose of your visit?", type: 'text', validation: { required: true } },
      { id: 'intendedDuration', question: "What is your intended duration of stay?", type: 'text', validation: { required: true } },
      { id: 'sponsorInformation', question: "Do you have any sponsor information? If so, please provide it.", type: 'text' },
    ],
  },
  passportTravel: {
    title: "Passport & Travel",
    fields: [
      { id: 'passportNumber', question: "What is your passport number?", type: 'text', validation: { required: true } },
      { id: 'expiryDate', question: "What is your passport's expiry date? Please state it as Month Day, Year.", type: 'date', validation: { required: true } },
      { id: 'countryOfIssue', question: "What is the country of issue for your passport?", type: 'text', validation: { required: true } },
      { id: 'previousEntries', question: "Have you had any previous entries to the US? If so, how many and when?", type: 'text' },
      { id: 'currentStatus', question: "What is your current immigration status in the US, if any?", type: 'text' },
    ],
  },
  familyInformation: {
    title: "Family Information",
    fields: [
      { id: 'maritalStatus', question: "What is your marital status?", type: 'text', validation: { required: true } },
      { id: 'spouseDetails', question: "If applicable, please provide your spouse's full name and date of birth.", type: 'text' },
      { id: 'childrenCount', question: "How many children do you have?", type: 'number' },
      { id: 'familyInUS', question: "Do you have any family members currently in the US? If so, who and what is their relationship to you?", type: 'text' },
      { id: 'emergencyContact', question: "Who is your emergency contact, and what is their phone number and relationship to you?", type: 'text', validation: { required: true } },
    ],
  },
  legalHistory: {
    title: "Legal History",
    fields: [
      { id: 'criminalRecord', question: "Do you have any criminal record?", type: 'boolean' },
      { id: 'immigrationViolations', question: "Have you had any immigration violations?", type: 'boolean' },
      { id: 'deportationHistory', question: "Do you have any deportation history?", type: 'boolean' },
      { id: 'pendingCases', question: "Do you have any pending legal cases?", type: 'boolean' },
    ],
  },
  previousApplications: {
    title: "Previous Applications",
    fields: [
      { id: 'priorVisaApplications', question: "Have you had any prior visa applications?", type: 'boolean' },
      { id: 'refusalHistory', question: "Have you ever been refused a visa or entry to any country?", type: 'boolean' },
      { id: 'applicationNumbers', question: "If you have previous applications, please provide their application numbers.", type: 'text' },
    ],
  },
  employmentEducation: {
    title: "Employment/Education",
    fields: [
      { id: 'currentJob', question: "What is your current occupation or job title?", type: 'text' },
      { id: 'educationLevel', question: "What is your highest level of education?", type: 'text' },
      { id: 'skills', question: "What are your key skills or qualifications?", type: 'text' },
      { id: 'income', question: "What is your approximate annual income?", type: 'number' },
      { id: 'workAuthorization', question: "Do you have work authorization in the US?", type: 'boolean' },
    ],
  },
  reviewSubmit: {
    title: "Review & Submit",
    fields: [
      { id: 'dataReview', question: "Please review the information you have provided. Is everything accurate?", type: 'boolean' },
      { id: 'digitalSignature', question: "Please state your full name to confirm your digital signature.", type: 'text', validation: { required: true } },
    ],
  },
};

export const getNextQuestion = (currentSectionId, currentQuestionIndex, formData) => {
  const sectionIds = Object.keys(formConfig);
  let currentSectionIdx = sectionIds.indexOf(currentSectionId);

  // If currentSectionId is not found, start from the first section
  if (currentSectionIdx === -1) {
    currentSectionIdx = 0;
    currentQuestionIndex = 0;
  }

  for (let s = currentSectionIdx; s < sectionIds.length; s++) {
    const sectionId = sectionIds[s];
    const section = formConfig[sectionId];
    const startFieldIdx = (s === currentSectionIdx) ? currentQuestionIndex : 0;

    for (let f = startFieldIdx; f < section.fields.length; f++) {
      const field = section.fields[f];
      // Check if the field is not yet filled
      if (!formData[sectionId] || formData[sectionId][field.id] === undefined || formData[sectionId][field.id] === null || formData[sectionId][field.id] === '') {
        return { sectionId: sectionId, fieldId: field.id, question: field.question, questionIndex: f };
      }
    }
  }

  return null; // All questions answered
};

export const getFieldById = (sectionId, fieldId) => {
  const section = formConfig[sectionId];
  if (!section) return null;
  return section.fields.find(field => field.id === fieldId);
};
