import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { transcribeAudio } from '../services/transcriptionService';
import { validateAndExtractFormData } from '../services/formService';

const useVoiceBot = (formSections, updateFormField, formData) => {
  const [sessionId, setSessionId] = useState(null);
  const [currentSection, setCurrentSection] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setSessionId(uuidv4());
  }, []);

  const askQuestion = (section, questionIndex) => {
    const sectionConfig = formSections[section];
    if (sectionConfig && sectionConfig.fields[questionIndex]) {
      const question = `What is your ${sectionConfig.fields[questionIndex].label.toLowerCase()}?`;
      setConversationHistory(prev => [...prev, { speaker: 'Bot', text: question }]);
      return question;
    } else if (sectionConfig && questionIndex >= sectionConfig.fields.length) {
      setConversationHistory(prev => [...prev, { speaker: 'Bot', text: `You have completed the ${sectionConfig.title} section. Would you like to review or move to the next section?` }]);
      return `You have completed the ${sectionConfig.title} section. Would you like to review or move to the next section?`;
    }
    return null;
  };

  const startVoiceBot = (section) => {
    setCurrentSection(section);
    setCurrentQuestionIndex(0);
    setConversationHistory([]);
    setError(null);
    askQuestion(section, 0);
  };

  const processVoiceInput = async (audioBlob) => {
    setIsProcessing(true);
    setError(null);
    setConversationHistory(prev => [...prev, { speaker: 'You', text: '[Audio Input]' }]);

    try {
      const { transcript } = await transcribeAudio(audioBlob);
      setConversationHistory(prev => [...prev, { speaker: 'You', text: transcript }]);

      const currentField = formSections[currentSection].fields[currentQuestionIndex].id;
      const currentSectionTitle = formSections[currentSection].title;

      const { isValid, extractedValue, errors, action, nextQuestion } = await validateAndExtractFormData(
        transcript,
        formData,
        currentField,
        currentSectionTitle
      );

      if (action === 'update' && isValid) {
        updateFormField(currentSection, currentField, extractedValue);
        const nextQIndex = currentQuestionIndex + 1;
        setCurrentQuestionIndex(nextQIndex);
        askQuestion(currentSection, nextQIndex);
      } else if (action === 'clarify' || !isValid) {
        setConversationHistory(prev => [...prev, { speaker: 'Bot', text: nextQuestion || errors.join(' ') || "I didn't understand that. Could you please rephrase?" }]);
      } else {
        setConversationHistory(prev => [...prev, { speaker: 'Bot', text: "I didn't understand that. Could you please rephrase?" }]);
      }

    } catch (err) {
      console.error('Voice bot processing error:', err);
      setError('Failed to process voice input.');
      setConversationHistory(prev => [...prev, { speaker: 'Bot', text: 'I encountered an error. Please try again.' }]);
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    sessionId,
    currentSection,
    currentQuestionIndex,
    conversationHistory,
    isProcessing,
    error,
    startVoiceBot,
    processVoiceInput,
  };
};

export default useVoiceBot;