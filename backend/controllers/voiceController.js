const VoiceResponse = require('twilio').twiml.VoiceResponse;
const { GoogleGenerativeAI } = require('@google/generative-ai');
const asyncHandler = require('express-async-handler');
const { DeepgramClient } = require('@deepgram/sdk');
const fs = require('fs');
const path = require('path');

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Initialize Deepgram
const deepgram = new DeepgramClient(process.env.DEEPGRAM_API_KEY);

// Helper function to transcribe audio using Deepgram
const transcribeAudio = async (audioBuffer, mimetype) => {
  console.log('Transcribing audio with Deepgram:', { bufferLength: audioBuffer.length, mimetype });
  const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
    audioBuffer,
    {
      smart_format: true,
      model: 'nova',
      mimetype: mimetype,
    },
  );

  if (error) {
    console.error('Deepgram transcription error:', error);
    throw error;
  }

  if (!result.results || !result.results.channels || result.results.channels.length === 0) {
    throw new Error('Deepgram did not return a valid transcription result.');
  }

  return result.results.channels[0].alternatives[0].transcript;
};

// Helper function to analyze text with Gemini
const analyzeText = async (text) => {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const prompt = `You are an expert assistant for an immigration law firm. Your task is to carefully analyze the following text transcribed from a potential client's voice message and extract key information.

**Instructions:**
1. Identify the client's full name, email address, and phone number.
2. Identify the type of immigration case they are asking about (e.g., Family Visa, Spouse Visa, Work Visa, Asylum, Green Card, Citizenship).
3. Return the extracted information in a valid JSON object with the following keys: "fullName", "email", "phoneNumber", "caseType".
4. If a piece of information is not mentioned in the text, the value for its key should be null. Do not make up information.

**Example 1:**
Text: "Hi my name is John Doe, I'd like to ask about a spouse visa. My email is john.doe@example.com and you can reach me at 123-456-7890."
Output:
\`\`\`json
{
  "fullName": "John Doe",
  "email": "john.doe@example.com",
  "phoneNumber": "123-456-7890",
  "caseType": "Spouse Visa"
}
\`\`\`

**Example 2:**
Text: "Hello, I was hoping to get some information on the green card process. My name is Jane Smith."
Output:
\`\`\`json
{
  "fullName": "Jane Smith",
  "email": null,
  "phoneNumber": null,
  "caseType": "Green Card"
}
\`\`\`

**Client's Message to Analyze:**
Text: "${text}"

**Your JSON Output:**
`;

  const maxRetries = 1; // Set to 1 for a single retry
  const baseDelay = 5000; // 5 seconds

  for (let i = 0; i < maxRetries + 1; i++) {
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      let responseText = response.text();

      // Log the raw response for debugging
      console.log('Raw Gemini response:', responseText);

      // Clean the response to extract valid JSON
      let jsonResponse = responseText
        .replace(/```json\n|```/g, '') // Remove ```json and ```
        .replace(/^\s*|\s*$/g, '') // Trim leading/trailing whitespace
        .replace(/\n/g, ''); // Remove newlines

      // Check if the response is valid JSON
      if (!jsonResponse.startsWith('{') || !jsonResponse.endsWith('}')) {
        throw new Error('Response is not valid JSON');
      }

      // Parse the JSON
      const parsedResponse = JSON.parse(jsonResponse);

      // Generate detailed description
      const descriptionPrompt = `Based on the following client intake information and their original message, generate a concise yet detailed description of their needs for an immigration law firm. Focus on the core request and any relevant details provided.

Client's Original Message: "${text}"
Extracted Information: ${JSON.stringify(parsedResponse, null, 2)}

Detailed Description:`;

      const descriptionResult = await model.generateContent(descriptionPrompt);
      const descriptionResponse = await descriptionResult.response;
      const detailedDescription = descriptionResponse.text().trim();

      parsedResponse.description = detailedDescription;

      // Validate the structure of the parsed JSON
      const requiredKeys = ['fullName', 'email', 'phoneNumber', 'caseType', 'description'];
      const isValid = requiredKeys.every(key => Object.prototype.hasOwnProperty.call(parsedResponse, key));
      if (!isValid) {
        throw new Error('Parsed JSON does not contain required keys');
      }

      return parsedResponse;
    } catch (error) {
      if (error.status === 429 && i < maxRetries) {
        const delay = baseDelay + Math.random() * 1000;
        console.warn(`Rate limit hit. Retrying in ${delay / 1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        console.error('Error analyzing text with Gemini:', error.message);
        throw new Error(`Failed to analyze text: ${error.message}`);
      }
    }
  }
};

// @desc    Process uploaded voice recording
// @route   POST /api/voice/process
// @access  Public
const processVoice = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No audio file uploaded.');
  }

  const tempDir = path.join(__dirname, '..', 'temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
  }
  const tempFilePath = path.join(tempDir, `${Date.now()}-${req.file.originalname}`);
  fs.writeFileSync(tempFilePath, req.file.buffer);

  try {
    // 1. Transcribe Audio
    const transcription = await transcribeAudio(tempFilePath);

    console.log('Transcription result from Deepgram:', transcription); // <-- ADDING LOG

    // 2. Analyze Text
    const analysis = await analyzeText(transcription);

    console.log('Analysis result from Gemini:', analysis);

    res.status(200).json({
      transcription,
      analysis,
    });
  } catch (error) {
    console.error('Error processing voice:', error);
    res.status(500).json({ message: 'Failed to process voice input.', error: error.message });
  } finally {
    fs.unlinkSync(tempFilePath);
  }
});

// --- Existing Twilio Functions ---

const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// @desc    Handle incoming Twilio voice calls
// @route   POST /api/voice
// @access  Public
const handleVoiceCall = asyncHandler(async (req, res) => {
  const twiml = new VoiceResponse();
  const intakeLink = req.query.intakeLink; // Get intakeLink from query params

  twiml.say('Hello, welcome to the AI intake system. Please say "English" for English or "Español" for Spanish.');

  twiml.gather({
    input: 'speech',
    action: `/api/voice/gather?intakeLink=${intakeLink}&step=language_selection`,
    speechTimeout: 'auto',
    language: 'en-US', // Default to English for language selection
  });

  res.type('text/xml');
  res.send(twiml.toString());
});

// @desc    Initiate an outbound Twilio voice call
// @route   POST /api/voice/initiate
// @access  Private
const initiateVoiceCall = asyncHandler(async (req, res) => {
  const { phoneNumber, intakeLink } = req.body;

  if (!phoneNumber || !intakeLink) {
    res.status(400);
    throw new Error('Please provide a phone number and intake link');
  }

  try {
    await client.calls.create({
      url: `${process.env.SERVER_URL}/api/voice?intakeLink=${intakeLink}`,
      to: phoneNumber,
      from: process.env.TWILIO_PHONE_NUMBER,
    });
    res.status(200).json({ message: 'Call initiated successfully' });
  } catch (error) {
    console.error('Twilio call initiation error:', error);
    res.status(500).json({ message: 'Failed to initiate call', error: error.message });
  }
});

const Intake = require('../models/intakeModel');
const { getNextQuestion, analyzeSpeechWithGemini, formQuestions } = require('../utils/voiceBotLogic');

const handleGuidedVoiceIntake = asyncHandler(async (req, res) => {
  const { intakeLink, currentQuestionIndex, preferredLanguage } = req.body;
  const file = req.file; // Audio file from frontend

  if (!file) {
    return res.status(400).json({ message: 'No audio file provided.' });
  }

  let intake = await Intake.findOne({ intakeLink });

  if (!intake) {
    return res.status(404).json({ message: 'Intake not found.' });
  }

  let transcription; // Declare transcription here

  try {
    // Log file details before transcription
    console.log('Received audio file:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      bufferLength: file.buffer.length,
    });

    try {
      transcription = await transcribeAudio(file.buffer, file.mimetype); // Assign to the outer variable
      console.log('Frontend Voice Transcription:', transcription);
    } catch (deepgramError) {
      console.error('Deepgram transcription failed:', deepgramError);
      // Re-throw the error to be caught by the outer catch block
      throw deepgramError;
    }

    // Determine the current question based on the index
    const currentQuestion = formQuestions[currentQuestionIndex];

    const analysis = await analyzeSpeechWithGemini(transcription, intake.formData, currentQuestion, preferredLanguage);

    if (analysis.action === 'set_language') {
      intake.formData.preferredLanguage = analysis.value;
      // preferredLanguage is updated in the frontend state
      await intake.save();
    } else if (analysis.action === 'update_data') {
      intake.formData[analysis.field] = analysis.value;
      await intake.save();
    } else if (analysis.action === 'clarify') {
      return res.json({ action: 'clarify', question: analysis.question });
    }

    // Determine the next question to ask
    const nextQuestion = getNextQuestion(intake.formData, parseInt(currentQuestionIndex, 10) + 1);

    if (nextQuestion) {
      res.json({
        action: 'ask_question',
        question: nextQuestion.question,
        field: nextQuestion.field,
        index: nextQuestion.index,
        type: nextQuestion.type,
        options: nextQuestion.options,
        twilioLang: nextQuestion.twilioLang,
        updatedFormData: intake.formData, // Send updated form data back to frontend
      });
    } else {
      // All questions answered
      intake.status = 'Completed';
      await intake.save();

      // Send summary email (re-using logic from voiceGatherController)
      const summary = `Intake for ${intake.formData.firstName || ''} ${intake.formData.lastName || ''} has been completed via guided voice intake.`;
      const attorneyEmail = process.env.ATTORNEY_EMAIL || 'attorney@example.com';
      const userEmail = intake.formData.emailAddress;

      if (userEmail) {
        await sendEmail(userEmail, 'Your Immigration Intake Summary', `Dear ${intake.formData.firstName || 'Client'},

Thank you for completing your immigration intake form via our voice bot. Here is a summary of the information we collected:

${JSON.stringify(intake.formData, null, 2)}

We will be in touch shortly.

Sincerely,
Your Legal Team`);
      }

      await sendEmail(attorneyEmail, `New Guided Voice Intake Completed: ${intake.formData.firstName || ''} ${intake.formData.lastName || ''}`, `A new guided voice intake has been completed.

Intake ID: ${intake._id}
Intake Link: ${process.env.SERVER_URL}/admin/intakes/${intake._id}

Full Data:
${JSON.stringify(intake.formData, null, 2)}

Risk Alerts: ${intake.riskAlerts.join(', ') || 'None'}`);

      res.json({ action: 'complete_intake', updatedFormData: intake.formData });
    }
  } catch (error) {
    console.error('Error in guided voice intake:', error);
    res.status(500).json({ message: 'Error processing voice input.', error: error.message });
  }
});

module.exports = { handleVoiceCall, initiateVoiceCall, processVoice, handleGuidedVoiceIntake };