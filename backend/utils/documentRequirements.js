const getRequiredDocuments = (formData) => {
  const requiredDocuments = new Set();

  // Always required documents
  requiredDocuments.add('Passport Copy (Bio Page)');
  if (formData.inUS === 'Yes') {
    requiredDocuments.add('I-94 Arrival/Departure Record');
    requiredDocuments.add('Current Visa Copy (if applicable)');
  }

  // Documents based on Immigration Benefit
  switch (formData.immigrationBenefit) {
    case 'Green Card':
      requiredDocuments.add('Birth Certificate');
      if (formData.maritalStatus === 'Married') {
        requiredDocuments.add('Marriage Certificate');
      }
      // Add more specific documents for different Green Card categories (e.g., employment-based, family-based)
      break;
    case 'Student Visa':
      requiredDocuments.add('Academic Transcripts');
      requiredDocuments.add('Proof of Funds');
      requiredDocuments.add('Acceptance Letter from Educational Institution (I-20)');
      break;
    case 'Work Visa':
      requiredDocuments.add('Resume/CV');
      requiredDocuments.add('Educational Degrees/Diplomas');
      requiredDocuments.add('Employment Offer Letter');
      requiredDocuments.add('Professional Licenses/Certifications (if applicable)');
      break;
    case 'Asylum':
      requiredDocuments.add('Any supporting documents for asylum claim'); // Placeholder
      break;
    case 'Family Petition':
      requiredDocuments.add('Birth Certificate (of petitioner and beneficiary)');
      requiredDocuments.add('Marriage Certificate (if applicable)');
      requiredDocuments.add('Proof of Relationship');
      break;
    case 'Citizenship':
      requiredDocuments.add('Green Card Copy');
      requiredDocuments.add('Proof of Physical Presence in U.S.');
      requiredDocuments.add('Tax Transcripts (last 5 years)');
      break;
    default:
      // For 'Other' or unspecified, might need to ask for more details
      break;
  }

  // Documents based on Legal History
  if (formData.hasCriminalRecord === 'Yes') {
    requiredDocuments.add('Court Dispositions for Criminal Offenses');
  }
  if (formData.hasPreviousImmigrationApps === 'Yes') {
    requiredDocuments.add('Previous Immigration Application Receipts/Decisions');
  }

  // Documents based on Passport & Travel (if applicable)
  if (formData.hasPreviousTravel === 'Yes') {
    requiredDocuments.add('Previous Visa Stamps/Entry Stamps');
  }

  // Convert Set to Array for consistent output
  return Array.from(requiredDocuments);
};

module.exports = { getRequiredDocuments };
