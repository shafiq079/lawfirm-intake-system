const asyncHandler = require('express-async-handler');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { formConfig, getFieldById } = require('../config/formConfig');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Validation function
const validateField = (fieldConfig, value) => {
  const errors = [];
  let isValid = true;

  if (fieldConfig.validation?.required && (value === null || value === undefined || value === '')) {
    isValid = false;
    errors.push(`${fieldConfig.id} is required.`);
  }

  if (value !== null && value !== undefined && value !== '') {
    switch (fieldConfig.type) {
      case 'email':
        if (!/^[
-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value)) {
          isValid = false;
          errors.push(`Invalid email format for ${fieldConfig.id}.`);
        }
        break;
      case 'tel':
        // Relaxed phone number validation to allow common formats
        if (!/^\(?(\d{3})\)?[-.\s]?(\d{3})[-.\s]?(\d{4})$/.test(value)) {
          isValid = false;
          errors.push(`Invalid phone number format for ${fieldConfig.id}. Please enter a 10-digit number, optionally with parentheses, dashes, or spaces.`);
        }
        break;
      case 'date':
        // Basic date validation, can be expanded
        if (isNaN(new Date(value).getTime())) {
          isValid = false;
          errors.push(`Invalid date format for ${fieldConfig.id}.`);
        }
        break;
      case 'number':
        if (isNaN(Number(value))) {
          isValid = false;
          errors.push(`Invalid number format for ${fieldConfig.id}.`);
        }
        break;
      case 'boolean':
        if (typeof value !== 'boolean') {
          isValid = false;
          errors.push(`Invalid boolean value for ${fieldConfig.id}.`);
        }
        break;
      case 'text':
      default:
        // No specific format validation for generic text
        break;
    }

    if (fieldConfig.validation?.pattern && !new RegExp(fieldConfig.validation.pattern).test(value)) {
      isValid = false;
      errors.push(`${fieldConfig.id} does not match the required pattern.`);
    }
  }

  return { isValid, errors };
};

const processGeminiRequest = asyncHandler(async (req, res) => {
  const { transcript, currentSection, currentField, questionIndex, context } = req.body;

  // Construct the prompt for Gemini
  let prompt = `You are an AI assistant for an immigration law firm intake form. Your task is to extract information from user's voice input and format it as JSON.`;

  let fieldConfig = null;
  if (currentSection && currentField !== undefined) {
    fieldConfig = formConfig[currentSection]?.fields[questionIndex];
    if (fieldConfig) {
      prompt += `\n\nThe user is currently being asked for their ${fieldConfig.id} in the ${formConfig[currentSection].title} section.`;
      prompt += `\nExpected format for ${fieldConfig.id}: ${fieldConfig.type}.`;
      if (fieldConfig.validation?.pattern) {
        prompt += ` It should match the pattern: ${fieldConfig.validation.pattern}.`;
      }
      prompt += `\nUser's input: "${transcript}"`;
      prompt += `\n\nBased on the user's input, extract the value for ${fieldConfig.id}. If the input is unclear or doesn't match the expected format, ask a clarifying question.`;
      prompt += `\n\nReturn a JSON object with the following structure:`;
      prompt += `\n{\n  "action": "update" | "clarify" | "complete" | "error",\n  "transcript": "What was heard",\n  "confidence": 0-1,\n  "field": { "section": "sectionId", "id": "fieldId", "questionIndex": number },\n  "value": "extractedValue",\n  "nextQuestion": "Next question to ask",\n  "validation": { "isValid": boolean, "errors": string[] },\n  "suggestions": ["alternativeInterpretation1", "alternativeInterpretation2"]\n}`; // Added suggestions
    } else {
      prompt += `\nUser's input: "${transcript}"\nI am unable to determine the current field. Please ask the user to clarify.`;
    }
  } else {
    prompt += `\nUser's input: "${transcript}"\nI am not currently asking a specific question. Please determine the user's intent.`;
  }

  // Add context of previous answers
  if (Object.keys(context).length > 0) {
    prompt += `\n\nPrevious answers for context: ${JSON.stringify(context)}`;
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(text);
    } catch (jsonError) {
      console.error('Failed to parse Gemini response as JSON:', text, jsonError);
      return res.status(500).json({
        success: false,
        action: "error",
        transcript: transcript,
        confidence: 0,
        field: null,
        value: null,
        nextQuestion: "",
        validation: { isValid: false, errors: ["Invalid response from AI. Please try again."] },
        suggestions: [],
      });
    }

    // Perform server-side validation
    if (parsedResponse.action === "update" && fieldConfig) {
      const validationResult = validateField(fieldConfig, parsedResponse.value);
      parsedResponse.validation = validationResult;
      if (!validationResult.isValid) {
        parsedResponse.action = "clarify"; // Change action to clarify if validation fails
        parsedResponse.clarificationQuestion = validationResult.errors.join(" ") + " Please try again.";
      }
    }

    res.json({
      success: true,
      ...parsedResponse,
      transcript: transcript, // Ensure transcript is always returned
    });

  } catch (error) {
    console.error('Error processing Gemini request:', error);
    res.status(500).json({ message: 'Error processing Gemini request', error: error.message });
  }
});

module.exports = { processGeminiRequest };