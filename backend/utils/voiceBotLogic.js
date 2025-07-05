const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Define the form structure for the guided bot
const formQuestions = [
  { field: 'preferredLanguage', question: 'Please say "English" for English or "Español" for Spanish.', type: 'string', options: ['English', 'Español'], twilioLang: 'en-US' },
  { field: 'firstName', question: 'What is your first name?', type: 'string' },
  { field: 'middleName', question: 'What is your middle name? (Optional)', type: 'string', optional: true },
  { field: 'lastName', question: 'What is your last name?', type: 'string' },
  { field: 'dateOfBirth', question: 'What is your date of birth? Please say the full date, for example, January 1st, 1990.', type: 'date' },
  { field: 'gender', question: 'What is your gender? You can say Male, Female, Non-binary, or Prefer not to say.', type: 'string', options: ['Male', 'Female', 'Non-binary', 'Prefer not to say'] },
  { field: 'countryOfBirth', question: 'What is your country of birth?', type: 'string' },
  { field: 'countryOfCitizenship', question: 'What is your country of citizenship?', type: 'string' },
  { field: 'nationality', question: 'What is your nationality, if different from your country of citizenship? (Optional)', type: 'string', optional: true },
  { field: 'phoneNumber', question: 'What is your phone number, including area code?', type: 'string' },
  { field: 'emailAddress', question: 'What is your email address?', type: 'string' },
  { field: 'inUS', question: 'Are you currently in the U.S.? Please say Yes or No.', type: 'boolean' },
  { field: 'dateOfEntry', question: 'What was your date of entry into the U.S.? Please say the full date.', type: 'date', condition: (formData) => formData.inUS === 'Yes' },
  { field: 'portOfEntry', question: 'What was your port of entry into the U.S.?', type: 'string', condition: (formData) => formData.inUS === 'Yes' },
  { field: 'currentVisaType', question: 'What is your current visa type or status?', type: 'string', condition: (formData) => formData.inUS === 'Yes' },
  { field: 'visaExpiryDate', question: 'What is your visa expiry date? Please say the full date.', type: 'date', condition: (formData) => formData.inUS === 'Yes' },
  { field: 'immigrationBenefit', question: 'What immigration benefit are you seeking? For example, Green Card, Student Visa, Work Visa, Asylum, Family Petition, Citizenship, or Other.', type: 'string', options: ['Green Card', 'Student Visa', 'Work Visa', 'Asylum', 'Family Petition', 'Citizenship', 'Other'] },
  { field: 'otherImmigrationBenefit', question: 'Please specify the immigration benefit you are seeking.', type: 'string', condition: (formData) => formData.immigrationBenefit === 'Other' },
  { field: 'applicationReason', question: 'Why are you applying? Please provide a short description.', type: 'string' },
  { field: 'passportNumber', question: 'What is your passport number?', type: 'string' },
  { field: 'passportCountryOfIssue', question: 'What is your passport\'s country of issue?', type: 'string' },
  { field: 'passportExpiryDate', question: 'What is your passport expiry date? Please say the full date.', type: 'date' },
  { field: 'i94Number', question: 'What is your I-94 number, if available? (Optional)', type: 'string', optional: true },
  { field: 'previousTravelHistory', question: 'Please describe your previous travel history. (Optional)', type: 'string', optional: true },
  { field: 'overstayedVisa', question: 'Have you ever overstayed a visa? Please say Yes or No.', type: 'boolean' },
  { field: 'deniedVisa', question: 'Have you ever been denied a visa? Please say Yes or No.', type: 'boolean' },
  { field: 'maritalStatus', question: 'What is your marital status? For example, Single, Married, Divorced, or Widowed.', type: 'string', options: ['Single', 'Married', 'Divorced', 'Widowed'] },
  { field: 'spouseFullName', question: 'What is your spouse\'s full name?', type: 'string', condition: (formData) => formData.maritalStatus === 'Married' },
  { field: 'spouseImmigrationStatus', question: 'What is your spouse\'s immigration status?', type: 'string', condition: (formData) => formData.maritalStatus === 'Married' },
  { field: 'numChildren', question: 'How many children do you have?', type: 'number' },
  // Children details will be handled dynamically based on numChildren
  { field: 'sponsoredByFamily', question: 'Are you being sponsored by a family member? Please say Yes or No.', type: 'boolean' },
  { field: 'sponsorRelationship', question: 'What is your relationship to the sponsor?', type: 'string', condition: (formData) => formData.sponsoredByFamily === 'Yes' },
  { field: 'everArrested', question: 'Have you ever been arrested? Please say Yes or No.', type: 'boolean' },
  { field: 'everConvicted', question: 'Have you ever been convicted of a crime? Please say Yes or No.', type: 'boolean' },
  { field: 'everDetained', question: 'Have you ever been detained by immigration authorities? Please say Yes or No.', type: 'boolean' },
  { field: 'everDeported', question: 'Have you ever been deported or removed from any country? Please say Yes or No.', type: 'boolean' },
  { field: 'pendingApplication', question: 'Do you currently have a pending immigration application? Please say Yes or No.', type: 'boolean' },
  { field: 'liedOnVisa', question: 'Have you ever lied or misrepresented facts in any visa application? Please say Yes or No.', type: 'boolean' },
];

const getNextQuestion = (formData, currentQuestionIndex) => {
  for (let i = currentQuestionIndex; i < formQuestions.length; i++) {
    const question = formQuestions[i];
    // Check if the question has a condition and if it's met
    if (question.condition && !question.condition(formData)) {
      continue; // Skip this question if condition not met
    }
    // Check if the field is already filled and not optional
    if (!question.optional && formData[question.field] !== undefined && formData[question.field] !== null && formData[question.field] !== '') {
      continue; // Skip if already filled and not optional
    }
    return { question: question.question, field: question.field, index: i, type: question.type, options: question.options, twilioLang: question.twilioLang };
  }
  return null; // All questions answered
};

const analyzeSpeechWithGemini = async (speechResult, currentIntakeData, currentQuestion, preferredLanguage = 'en') => {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  let prompt = `You are an expert assistant for an immigration law firm. You are guiding a user through an intake form. The user's preferred language is ${preferredLanguage}.`;

  if (currentQuestion.field === 'preferredLanguage') {
    prompt += `The user said: "${speechResult}". Determine if they want English or Spanish. Respond with a JSON object: { "action": "set_language", "value": "English" } or { "action": "set_language", "value": "Español" }. If neither, respond with { "action": "clarify", "question": "I didn't understand. Please say "English" or "Español"." }.`;
  } else {
    prompt += `
The current question asked was: "${currentQuestion.question}". The user said: "${speechResult}". Current intake data collected so far: ${JSON.stringify(currentIntakeData)}.
Your task is to:
1. Extract the value for the field "${currentQuestion.field}" from the user's response.
2. Validate the extracted value based on its expected type (${currentQuestion.type}) and any provided options (${currentQuestion.options ? currentQuestion.options.join(', ') : 'none'}).
3. If the value is valid, respond with a JSON object: { "action": "update_data", "field": "${currentQuestion.field}", "value": "extracted_value" }.
4. If the value is invalid, ambiguous, or the user's response is not relevant to the question, respond with: { "action": "clarify", "question": "Please clarify your answer for ${currentQuestion.field}." }.
5. For boolean questions (Yes/No), ensure the value is 'Yes' or 'No'.
6. For date questions, extract the date in YYYY-MM-DD format.
7. For number questions, extract the number.
8. If the user indicates they don't know or prefer not to answer an optional question, set the value to null.

Respond ONLY with the JSON object.`;
  }

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const responseText = response.text();
  const jsonResponse = responseText.replace(/```json\n|```/g, '').trim();
  try {
    return JSON.parse(jsonResponse);
  } catch (e) {
    console.error("Failed to parse JSON from Gemini API:", jsonResponse, e);
    return { action: 'clarify', question: 'I apologize, I had trouble understanding. Could you please rephrase that?' };
  }
};

module.exports = { formQuestions, getNextQuestion, analyzeSpeechWithGemini };
