
const VoiceResponse = require('twilio').twiml.VoiceResponse;
const { GoogleGenerativeAI } = require('@google/generative-ai');
const asyncHandler = require('express-async-handler');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const Intake = require('../models/intakeModel');

// @desc    Handle gathered speech from Twilio
// @route   POST /api/voice/gather
// @access  Public
const analyzeSpeechWithGemini = async (speechResult, currentIntakeData) => {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  const prompt = `The user said: "${speechResult}". Current intake data: ${JSON.stringify(currentIntakeData)}. Based on this, what information is being provided or what question should be asked next to complete an immigration intake form (full name, email, phone number, type of immigration case)? Respond with a JSON object containing 'action' (e.g., 'update_data', 'ask_question', 'complete_intake'), 'field' (if updating data or asking a specific question), 'value' (if updating data), and 'question' (if asking a question). If the intake is complete, set action to 'complete_intake'.`;
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const responseText = response.text();
  const jsonResponse = responseText.replace(/```json\n|```/g, '').trim();
  return JSON.parse(jsonResponse);
};

const handleGatheredSpeech = asyncHandler(async (req, res) => {
  const twiml = new VoiceResponse();
  const speechResult = req.body.SpeechResult;
  const intakeLink = req.query.intakeLink;

  let intake = await Intake.findOne({ intakeLink });

  if (!intake) {
    res.status(404);
    throw new Error('Intake not found');
  }

  if (speechResult) {
    const analysis = await analyzeSpeechWithGemini(speechResult, intake.formData);

    if (analysis.action === 'update_data') {
      intake.formData[analysis.field] = analysis.value;
      await intake.save();
      twiml.say(`Got it. ${analysis.question || 'What else can I help you with?'}`);
      twiml.gather({
        input: 'speech',
        action: `/api/voice/gather?intakeLink=${intakeLink}`,
        speechTimeout: 'auto',
      });
    } else if (analysis.action === 'ask_question') {
      twiml.say(analysis.question);
      twiml.gather({
        input: 'speech',
        action: `/api/voice/gather?intakeLink=${intakeLink}`,
        speechTimeout: 'auto',
      });
    } else if (analysis.action === 'complete_intake') {
      twiml.say('Thank you. Your intake form has been completed.');
      twiml.hangup();
    } else {
      twiml.say('I didn\'t understand that. Please try again.');
      twiml.gather({
        input: 'speech',
        action: `/api/voice/gather?intakeLink=${intakeLink}`,
        speechTimeout: 'auto',
      });
    }
  } else {
    twiml.say('I didn\'t hear anything. Please try again.');
    twiml.redirect(`/api/voice?intakeLink=${intakeLink}`);
  }

  res.type('text/xml');
  res.send(twiml.toString());
});

const handleGatheredEmail = asyncHandler(async (req, res) => {
  const { emailContent, intakeLink } = req.body;

  let intake = await Intake.findOne({ intakeLink });

  if (!intake) {
    res.status(404);
    throw new Error('Intake not found');
  }

  if (emailContent) {
    // Placeholder for AI analysis of email content
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const prompt = `Analyze the following email content for immigration intake information (full name, email, phone number, type of immigration case): "${emailContent}". Current intake data: ${JSON.stringify(intake.formData)}. Respond with a JSON object containing 'action' (e.g., 'update_data', 'ask_question', 'complete_intake'), 'field' (if updating data or asking a specific question), 'value' (if updating data), and 'response' (a natural language response to the user). If the intake is complete, set action to 'complete_intake'.`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();
    const jsonResponse = responseText.replace(/```json\n|```/g, '').trim();
    const analysis = JSON.parse(jsonResponse);

    if (analysis.action === 'update_data') {
      intake.formData[analysis.field] = analysis.value;
      await intake.save();
      res.json({ message: analysis.response || 'Email content processed and intake updated.' });
    } else if (analysis.action === 'ask_question') {
      res.json({ message: analysis.response || 'Further information needed.' });
    } else if (analysis.action === 'complete_intake') {
      res.json({ message: 'Thank you. Your intake form has been completed based on the email content.' });
    } else {
      res.json({ message: 'Could not process email content. Please try again.' });
    }
  } else {
    res.status(400).json({ message: 'No email content provided.' });
  }
});

module.exports = { handleGatheredSpeech, handleGatheredEmail };

