const multer = require('multer');
const { ImageAnnotatorClient } = require('@google-cloud/vision');
const asyncHandler = require('express-async-handler');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Set up multer for file uploads
const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({ storage: storage });

// Creates a client for Google Vision AI
const visionClient = new ImageAnnotatorClient();

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const analyzeDocumentText = async (text) => {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  const prompt = `Analyze the following text extracted from an immigration document (e.g., passport, ID). Extract the following information: full name, date of birth (YYYY-MM-DD), document type (e.g., Passport, Driver's License), and document number. Return the data as a JSON object. If any information is missing, set the value to null. Text: "${text}"`;
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const responseText = response.text();
  const jsonResponse = responseText.replace(/```json\n|```/g, '').trim();
  return JSON.parse(jsonResponse);
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
    const [result] = await visionClient.textDetection({
      image: { content: req.file.buffer.toString('base64') },
    });
    const detections = result.textAnnotations;
    const extractedText = detections.length > 0 ? detections[0].description : '';

    const structuredData = await analyzeDocumentText(extractedText);

    res.json({ text: extractedText, structuredData });
  } catch (error) {
    console.error(error);
    res.status(500);
    throw new Error('Error processing document with OCR');
  }
});

module.exports = { upload, processImage };