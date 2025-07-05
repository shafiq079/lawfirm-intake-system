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
  const prompt = `Analyze the following text extracted from a document. Extract ONLY the following information: full name, email, phone number, date of birth (YYYY-MM-DD), document type (e.g., Passport, Driver's License, National Identity Card), and document number. Ignore any other information. Return the data as a JSON object with these exact keys: "fullName", "email", "phoneNumber", "dateOfBirth", "documentType", "documentNumber". If any information is missing or cannot be confidently extracted, set its value to null. Text: "${text}"`;
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const responseText = response.text();
  // Clean the response to ensure it's valid JSON
  const jsonResponse = responseText.replace(/```json\n|```/g, '').trim();
  try {
    return JSON.parse(jsonResponse);
  } catch (e) {
    console.error("Failed to parse JSON from Gemini API:", jsonResponse, e);
    return { fullName: null, email: null, phoneNumber: null, dateOfBirth: null, documentType: null, documentNumber: null }; // Return a default empty structure on error
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