import axios from 'axios';

const GEMINI_API_URL = '/api/gemini'; // This will be your backend endpoint

export const analyzeVoiceInput = async (payload) => {
  try {
    const response = await axios.post(GEMINI_API_URL, payload);
    return response.data;
  } catch (error) {
    console.error('Error analyzing voice input with Gemini:', error);
    throw error;
  }
};
