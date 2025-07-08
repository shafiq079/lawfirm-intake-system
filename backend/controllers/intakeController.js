
const asyncHandler = require('express-async-handler');
const Intake = require('../models/intakeModel');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { syncToClio, getClioStatus, syncIntakeToClio } = require('./clioController');
const User = require('../models/userModel');
const sendEmail = require('../utils/sendEmail');


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateSummary = async (formData) => {  let summary = "";  if (formData.personalInfo) {    summary += `Personal Information:\n`;    summary += `  Name: ${formData.personalInfo.firstName || ''} ${formData.personalInfo.lastName || ''}\n`;    summary += `  Date of Birth: ${formData.personalInfo.dateOfBirth || ''}\n`;    summary += `  Nationality: ${formData.personalInfo.nationality || ''}\n`;    summary += `  Phone: ${formData.personalInfo.phoneNumber || ''}\n`;    summary += `  Email: ${formData.personalInfo.email || ''}\n`;  }  if (formData.immigrationIntent) {    summary += `\nImmigration Intent:\n`;    summary += `  Visa Type: ${formData.immigrationIntent.visaType || ''}\n`;    summary += `  Purpose of Visit: ${formData.immigrationIntent.purposeOfVisit || ''}\n`;    summary += `  Intended Duration: ${formData.immigrationIntent.intendedDuration || ''}\n`;    summary += `  Sponsor Info: ${formData.immigrationIntent.sponsorInformation || ''}\n`;  }  if (formData.passportTravel) {    summary += `\nPassport & Travel:\n`;    summary += `  Passport Number: ${formData.passportTravel.passportNumber || ''}\n`;    summary += `  Expiry Date: ${formData.passportTravel.expiryDate || ''}\n`;    summary += `  Country of Issue: ${formData.passportTravel.countryOfIssue || ''}\n`;    summary += `  Previous Entries: ${formData.passportTravel.previousEntries || ''}\n`;    summary += `  Current Status: ${formData.passportTravel.currentStatus || ''}\n`;  }  if (formData.familyInformation) {    summary += `\nFamily Information:\n`;    summary += `  Marital Status: ${formData.familyInformation.maritalStatus || ''}\n`;    summary += `  Spouse Details: ${formData.familyInformation.spouseDetails || ''}\n`;    summary += `  Children Count: ${formData.familyInformation.childrenCount || ''}\n`;    summary += `  Family in US: ${formData.familyInformation.familyInUS || ''}\n`;    summary += `  Emergency Contact: ${formData.familyInformation.emergencyContact || ''}\n`;  }  if (formData.legalHistory) {    summary += `\nLegal History:\n`;    summary += `  Criminal Record: ${formData.legalHistory.criminalRecord ? 'Yes' : 'No'}\n`;    summary += `  Immigration Violations: ${formData.legalHistory.immigrationViolations ? 'Yes' : 'No'}\n`;    summary += `  Deportation History: ${formData.legalHistory.deportationHistory ? 'Yes' : 'No'}\n`;    summary += `  Pending Cases: ${formData.legalHistory.pendingCases ? 'Yes' : 'No'}\n`;  }  if (formData.previousApplications) {    summary += `\nPrevious Applications:\n`;    summary += `  Prior Visa Applications: ${formData.previousApplications.priorVisaApplications ? 'Yes' : 'No'}\n`;    summary += `  Refusal History: ${formData.previousApplications.refusalHistory ? 'Yes' : 'No'}\n`;    summary += `  Application Numbers: ${formData.previousApplications.applicationNumbers || ''}\n`;  }  if (formData.employmentEducation) {    summary += `\nEmployment/Education:\n`;    summary += `  Current Job: ${formData.employmentEducation.currentJob || ''}\n`;    summary += `  Education Level: ${formData.employmentEducation.educationLevel || ''}\n`;    summary += `  Skills: ${formData.employmentEducation.skills || ''}\n`;    summary += `  Income: ${formData.employmentEducation.income || ''}\n`;    summary += `  Work Authorization: ${formData.employmentEducation.workAuthorization ? 'Yes' : 'No'}\n`;  }  if (formData.reviewSubmit) {    summary += `\nReview & Submit:\n`;    summary += `  Data Review: ${formData.reviewSubmit.dataReview ? 'Accurate' : 'Not Accurate'}\n`;    summary += `  Digital Signature: ${formData.reviewSubmit.digitalSignature || ''}\n`;  }  return summary;};

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
  console.log('--- Received Intake Submission ---');
  console.log('Request Body:', JSON.stringify(req.body, null, 2));

  const { intakeLink, ...formData } = req.body;
  console.log('Extracted formData:', JSON.stringify(formData, null, 2));

  const intake = await Intake.findOne({ intakeLink });

  if (intake) {
    console.log('Found intake to update:', intake._id);

    // Combine names and map email
    formData.fullName = [formData.firstName, formData.middleName, formData.lastName].filter(Boolean).join(' ');
    formData.email = formData.emailAddress;

    // Directly update the intake document with the form data
    Object.assign(intake, formData);

    // Risk alert logic
    const riskAlerts = [];
    if (formData.hasCriminalRecord) {
      riskAlerts.push(`Criminal record detected.`);
    }
    if (formData.hasPreviousImmigrationApps) {
      riskAlerts.push(`Previous immigration applications detected.`);
    }
    intake.riskAlerts = riskAlerts;
    intake.status = 'Completed';

    const updatedIntake = await intake.save();

    res.json(updatedIntake);

    // Send email to client
    const clientEmail = updatedIntake.email;
    const clientFullName = updatedIntake.fullName;

    if (clientEmail) {
      const subject = `Your Intake Submission for ${updatedIntake.intakeType}`;
      // Construct a summary from the structured data for the email
      const summary = `
        Full Name: ${clientFullName || 'N/A'}
        Date of Birth: ${updatedIntake.dateOfBirth || 'N/A'}
        Immigration Goal: ${updatedIntake.immigrationGoal || 'N/A'}
        Visa Type: ${updatedIntake.visaType || 'N/A'}
      `.trim();
      const text = `Dear ${clientFullName || 'client'},

Thank you for submitting your intake form. Here is a summary of your submission:

${summary}

We will review your information and get back to you shortly.

Sincerely,
Your Legal Team`;
      const html = `<p>Dear ${clientFullName || 'client'},</p><p>Thank you for submitting your intake form. Here is a summary of your submission:</p><pre>${summary}</pre><p>We will review your information and get back to you shortly.</p><p>Sincerely,<br>Your Legal Team</p>`;

      sendEmail(clientEmail, subject, text, html);
    }
  } else {
    res.status(404);
    throw new Error('Intake not found');
  }
});

module.exports = { createIntake, getIntakes, getIntakeByLink, submitIntakeForm, getIntakeById };
