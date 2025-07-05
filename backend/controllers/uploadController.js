const multer = require('multer');
const { createWorker } = require('tesseract.js');
const asyncHandler = require('express-async-handler');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Set up multer for file uploads
const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({ storage: storage });

// Creates a client for Google Vision AI
const visionClient = null;

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const analyzeDocumentText = async (text) => {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const prompt = `Analyze the following text extracted from a document. Extract all relevant immigration intake information. Return the data as a JSON object with the following keys. If information is missing or cannot be confidently extracted, set its value to null. For dates, use YYYY-MM-DD format. For boolean questions, use "Yes" or "No".

Keys to extract:
- firstName
- middleName
- lastName
- dateOfBirth (YYYY-MM-DD)
- gender (Male, Female, Non-binary, Prefer not to say)
- countryOfBirth
- countryOfCitizenship
- nationality
- phoneNumber
- emailAddress
- preferredLanguage (English, Español)
- inUS (Yes/No)
- dateOfEntry (YYYY-MM-DD)
- portOfEntry
- currentVisaType
- visaExpiryDate (YYYY-MM-DD)
- immigrationBenefit (Green Card, Student Visa, Work Visa, Asylum, Family Petition, Citizenship, Other)
- otherImmigrationBenefit
- applicationReason
- passportNumber
- passportCountryOfIssue
- passportExpiryDate (YYYY-MM-DD)
- i94Number
- previousTravelHistory
- overstayedVisa (Yes/No)
- deniedVisa (Yes/No)
- maritalStatus (Single, Married, Divorced, Widowed)
- spouseFullName
- spouseImmigrationStatus
- numChildren (number)
- sponsoredByFamily (Yes/No)
- sponsorRelationship
- everArrested (Yes/No)
- everConvicted (Yes/No)
- everDetained (Yes/No)
- everDeported (Yes/No)
- pendingApplication (Yes/No)
- liedOnVisa (Yes/No)

Text: "${text}"

Your JSON Output:`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const responseText = response.text();
  // Clean the response to ensure it's valid JSON
  const jsonResponse = responseText.replace(/```json\n|```/g, '').trim();
  try {
    return JSON.parse(jsonResponse);
  } catch (e) {
    console.error("Failed to parse JSON from Gemini API:", jsonResponse, e);
    return {}; // Return an empty object on error to prevent breaking the form
  }
};

// @desc    Process uploaded image with OCR
// @route   POST /api/uploads/ocr
// @access  Private
const processImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No document uploaded');
  }

  try {
    const worker = await createWorker();
    const { data: { text } } = await worker.recognize(req.file.buffer);
    await worker.terminate();

    const structuredData = await analyzeDocumentText(text);

    res.json({ text, structuredData });
  } catch (error) {
    console.error(error);
    res.status(500);
    throw new Error('Error processing document with OCR');
  }
});

module.exports = { upload, processImage };