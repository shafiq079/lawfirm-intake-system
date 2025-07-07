import { validateField } from '../utils/validationUtils';

const validateAndExtractFormData = async (transcript, context, currentField, currentSection) => {
  try {
    // Construct the prompt for Gemini API
    const prompt = `
      Analyze this voice input for immigration form completion:
      Input: "${transcript}"
      Context: Asking for ${currentField} in ${currentSection}
      Previous answers for context: ${JSON.stringify(context)}
      
      Extract and validate the information, return JSON:
      {
        "understood": boolean,
        "value": extractedValue,
        "confidence": 0-1,
        "needsClarification": boolean,
        "clarificationQuestion": string
      }
    `;

    // Make a hypothetical API call to a backend endpoint that handles Gemini API
    const response = await fetch('/api/gemini-process-form', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, currentField, currentSection }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const geminiResponse = await response.json();

    // Perform client-side validation using the extracted value
    const { isValid, errors } = validateField(currentField, geminiResponse.value);

    return {
      isValid: isValid && geminiResponse.understood,
      extractedValue: geminiResponse.value,
      errors: errors.concat(geminiResponse.needsClarification ? [geminiResponse.clarificationQuestion] : []),
      action: geminiResponse.needsClarification ? "clarify" : "update",
      nextQuestion: geminiResponse.clarificationQuestion || "",
      confidence: geminiResponse.confidence,
    };

  } catch (error) {
    console.error('Error in validateAndExtractFormData:', error);
    return {
      isValid: false,
      extractedValue: null,
      errors: ['Failed to process input. Please try again.'],
      action: "error",
      nextQuestion: "I encountered an error. Please try again.",
      confidence: 0,
    };
  }
};

export { validateAndExtractFormData };