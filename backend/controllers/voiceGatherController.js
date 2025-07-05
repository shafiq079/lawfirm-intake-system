
const VoiceResponse = require('twilio').twiml.VoiceResponse;
const asyncHandler = require('express-async-handler');
const sendEmail = require('../utils/sendEmail');

const Intake = require('../models/intakeModel');

const { formQuestions, getNextQuestion, analyzeSpeechWithGemini } = require('../utils/voiceBotLogic');

const handleGatheredSpeech = asyncHandler(async (req, res) => {
  const twiml = new VoiceResponse();
  const speechResult = req.body.SpeechResult;
  const intakeLink = req.query.intakeLink;
  let currentQuestionIndex = parseInt(req.query.currentQuestionIndex || '0', 10);
  let preferredLanguage = req.query.preferredLanguage || 'en';

  let intake = await Intake.findOne({ intakeLink });

  if (!intake) {
    res.status(404);
    throw new Error('Intake not found');
  }

  // Initialize formData if it's empty
  if (!intake.formData) {
    intake.formData = {};
  }

  // If this is the very first interaction, ask for language preference
  if (currentQuestionIndex === 0 && !intake.formData.preferredLanguage) {
    const languageQuestion = formQuestions[0]; // This is the preferredLanguage question
    twiml.say({ language: languageQuestion.twilioLang }, languageQuestion.question);
    twiml.gather({
      input: 'speech',
      action: `/api/voice/gather?intakeLink=${intakeLink}&currentQuestionIndex=0&preferredLanguage=${preferredLanguage}`,
      speechTimeout: 'auto',
      language: languageQuestion.twilioLang,
    });
    res.type('text/xml');
    return res.send(twiml.toString());
  }

  // Process speech result
  if (speechResult) {
    const currentQuestion = formQuestions[currentQuestionIndex];
    const analysis = await analyzeSpeechWithGemini(speechResult, intake.formData, currentQuestion, preferredLanguage);

    if (analysis.action === 'set_language') {
      intake.formData.preferredLanguage = analysis.value;
      preferredLanguage = (analysis.value === 'Español') ? 'es' : 'en';
      // Move to the next question after setting language
      currentQuestionIndex++;
      await intake.save();
    } else if (analysis.action === 'update_data') {
      intake.formData[analysis.field] = analysis.value;
      await intake.save();
      currentQuestionIndex++; // Move to the next question
    } else if (analysis.action === 'clarify') {
      // Stay on the same question, ask for clarification
      twiml.say({ language: preferredLanguage === 'es' ? 'es-ES' : 'en-US' }, analysis.question);
      twiml.gather({
        input: 'speech',
        action: `/api/voice/gather?intakeLink=${intakeLink}&currentQuestionIndex=${currentQuestionIndex}&preferredLanguage=${preferredLanguage}`,
        speechTimeout: 'auto',
        language: preferredLanguage === 'es' ? 'es-ES' : 'en-US',
      });
      res.type('text/xml');
      return res.send(twiml.toString());
    } else {
      // Fallback for unexpected analysis action
      twiml.say({ language: preferredLanguage === 'es' ? 'es-ES' : 'en-US' }, 'I didn\'t understand that. Please try again.');
      twiml.gather({
        input: 'speech',
        action: `/api/voice/gather?intakeLink=${intakeLink}&currentQuestionIndex=${currentQuestionIndex}&preferredLanguage=${preferredLanguage}`,
        speechTimeout: 'auto',
        language: preferredLanguage === 'es' ? 'es-ES' : 'en-US',
      });
      res.type('text/xml');
      return res.send(twiml.toString());
    }
  } else {
    // If no speech result, re-ask the current question
    const currentQuestion = formQuestions[currentQuestionIndex];
    twiml.say({ language: preferredLanguage === 'es' ? 'es-ES' : 'en-US' }, `I didn\'t hear anything. ${currentQuestion.question}`);
    twiml.gather({
      input: 'speech',
      action: `/api/voice/gather?intakeLink=${intakeLink}&currentQuestionIndex=${currentQuestionIndex}&preferredLanguage=${preferredLanguage}`,
      speechTimeout: 'auto',
      language: preferredLanguage === 'es' ? 'es-ES' : 'en-US',
    });
    res.type('text/xml');
    return res.send(twiml.toString());
  }

  // After processing speech and potentially updating data, determine the next question
  const nextQuestion = getNextQuestion(intake.formData, currentQuestionIndex);

  if (nextQuestion) {
    twiml.say({ language: preferredLanguage === 'es' ? 'es-ES' : 'en-US' }, nextQuestion.question);
    twiml.gather({
      input: 'speech',
      action: `/api/voice/gather?intakeLink=${intakeLink}&currentQuestionIndex=${nextQuestion.index}&preferredLanguage=${preferredLanguage}`,
      speechTimeout: 'auto',
      language: nextQuestion.twilioLang || (preferredLanguage === 'es' ? 'es-ES' : 'en-US'),
    });
  } else {
    // All questions answered
    intake.status = 'Completed';
    await intake.save();
    twiml.say({ language: preferredLanguage === 'es' ? 'es-ES' : 'en-US' }, 'Thank you. Your intake form has been completed. We will send a summary to your email.');
    twiml.hangup();

    // Send summary email
    const summary = `Intake for ${intake.formData.firstName || ''} ${intake.formData.lastName || ''} has been completed via voice.`;
    const attorneyEmail = process.env.ATTORNEY_EMAIL || 'attorney@example.com'; // Replace with actual attorney email
    const userEmail = intake.formData.emailAddress;

    if (userEmail) {
      await sendEmail(userEmail, 'Your Immigration Intake Summary', `Dear ${intake.formData.firstName || 'Client'},\n\nThank you for completing your immigration intake form via our voice bot. Here is a summary of the information we collected:\n\n${JSON.stringify(intake.formData, null, 2)}\n\nWe will be in touch shortly.\n\nSincerely,\nYour Legal Team`);
    }

    await sendEmail(attorneyEmail, `New Voice Intake Completed: ${intake.formData.firstName || ''} ${intake.formData.lastName || ''}`, `A new voice intake has been completed.\n\nIntake ID: ${intake._id}\nIntake Link: ${process.env.SERVER_URL}/admin/intakes/${intake._id}\n\nFull Data:\n${JSON.stringify(intake.formData, null, 2)}\n\nRisk Alerts: ${intake.riskAlerts.join(', ') || 'None'}`);
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

