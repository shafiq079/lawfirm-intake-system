
const asyncHandler = require('express-async-handler');
const Intake = require('../models/intakeModel');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { syncToClio, getClioStatus, syncIntakeToClio } = require('./clioController');
const User = require('../models/userModel');
const sendEmail = require('../utils/sendEmail');


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateSummary = async (formData) => {
  // Mocking Gemini API response to avoid quota limits
  return `Summary for ${formData.fullName || 'client'}: ${formData.description || 'No description provided.'} Case Type: ${formData.serviceType || 'N/A'}.`;
};

// @desc    Create new intake
// @route   POST /api/intakes
// @access  Private
const createIntake = asyncHandler(async (req, res) => {
  const { intakeType } = req.body;

  if (!intakeType) {
    res.status(400);
    throw new Error('Please add an intake type');
  }

  // Generate a unique intake link (simple example, can be more robust)
  const intakeLink = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

  const intake = new Intake({
    user: req.user._id,
    intakeType,
    intakeLink,
  });

  const createdIntake = await intake.save();
  res.status(201).json(createdIntake);
});

// @desc    Get all intakes
// @route   GET /api/intakes
// @access  Private
const getIntakes = asyncHandler(async (req, res) => {
  const intakes = await Intake.find({ user: req.user._id });
  res.json(intakes);
});

// @desc    Get single intake by link
// @route   GET /api/intakes/:intakeLink
// @access  Public
const getIntakeByLink = asyncHandler(async (req, res) => {
  const intake = await Intake.findOne({ intakeLink: req.params.intakeLink });

  if (intake) {
    res.json(intake);
  } else {
    res.status(404);
    throw new Error('Intake not found');
  }
});

// @desc    Get single intake by ID
// @route   GET /api/intakes/id/:intakeId
// @access  Private
const getIntakeById = asyncHandler(async (req, res) => {
  const intake = await Intake.findById(req.params.intakeId);

  if (intake) {
    res.json(intake);
  } else {
    res.status(404);
    throw new Error('Intake not found');
  }
});

// @desc    Submit intake form data
// @route   POST /api/intakes/submit
// @access  Public
const submitIntakeForm = asyncHandler(async (req, res) => {
  const { intakeLink, formData } = req.body;

  const intake = await Intake.findOne({ intakeLink });

  if (intake) {
    intake.formData = formData;
    // Basic risk alert logic (example)
    const riskAlerts = [];
    if (formData.hasPreviousVisa === 'Yes' && formData.visaDenialReason) {
      riskAlerts.push(`Previous visa denial: ${formData.visaDenialReason}`);
    }
    if (formData.hasCriminalRecord === 'Yes' && formData.criminalRecordDetails) {
      riskAlerts.push(`Criminal record: ${formData.criminalRecordDetails}`);
    }
    if (formData.hasPreviousVisaDenial === 'Yes' && formData.visaDenialReason) {
      riskAlerts.push(`Previous visa denial: ${formData.visaDenialReason}`);
    }
    if (formData.hasOverstayedVisa === 'Yes' && formData.overstayedVisaDetails) {
      riskAlerts.push(`History of overstaying a visa: ${formData.overstayedVisaDetails}`);
    }
    // Add more risk rules here based on your requirements
    intake.riskAlerts = riskAlerts;
    intake.status = 'In Progress'; // Or 'Completed' depending on form completion logic

    // Generate and save summary
    intake.summary = await generateSummary(formData);

    const updatedIntake = await intake.save();

    // Attempt to sync to Clio
    let user = await User.findById(intake.user); // Re-fetch user to ensure latest tokens
    if (user && user.clioAccessToken) {
      try {
        await syncIntakeToClio(updatedIntake, user.clioAccessToken, user);
      } catch (error) {
        console.error('Clio sync failed:', error);
        // Optional: Update intake status to indicate sync failure
        intake.status = 'Sync Failed';
        await intake.save();
      }
    }

    res.json(updatedIntake);

    // Send email to client
    if (updatedIntake.formData.email) {
      const subject = `Your Intake Submission for ${updatedIntake.intakeType}`;
      const text = `Dear ${updatedIntake.formData.fullName},

Thank you for submitting your intake form. Here is a summary of your submission:

${updatedIntake.summary}

We will review your information and get back to you shortly.

Sincerely,
Your Legal Team`;
      const html = `<p>Dear ${updatedIntake.formData.fullName},</p>
<p>Thank you for submitting your intake form. Here is a summary of your submission:</p>
<p>${updatedIntake.summary}</p>
<p>We will review your information and get back to you shortly.</p>
<p>Sincerely,<br>Your Legal Team</p>`;

      sendEmail(updatedIntake.formData.email, subject, updatedIntake.formData, updatedIntake.summary);
    }
  } else {
    res.status(404);
    throw new Error('Intake not found');
  }
});

module.exports = { createIntake, getIntakes, getIntakeByLink, submitIntakeForm, getIntakeById };
