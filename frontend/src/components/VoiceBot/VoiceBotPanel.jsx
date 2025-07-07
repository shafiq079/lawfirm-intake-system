import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import AudioRecorder from './AudioRecorder';
import ConversationHistory from './ConversationHistory';
import VoiceControls from './VoiceControls';
import {
  addConversationEntry,
  addError,
  setIsProcessing,
  setIsRecording,
  setCurrentQuestion,
  setCurrentSection,
  setCurrentQuestion as setReduxCurrentQuestion, // Rename to avoid conflict
  updateFormField,
} from '../../features/voiceBotSlice';
import { startTranscription, stopTranscription } from '../../services/transcriptionService';
import { analyzeVoiceInput } from '../../services/geminiService';
import { formConfig, getNextQuestion, getFieldById } from '../../utils/formConfig';

const VoiceBotPanel = () => {
  const dispatch = useDispatch();
  const { conversation, isProcessing, isRecording, errors, currentQuestion, currentSection, currentQuestion: currentQuestionIndex, form } = useSelector((state) => state.voiceBot);

  const currentSectionTitle = currentSection ? formConfig[currentSection]?.title : "";
  const totalQuestionsInSection = currentSection ? formConfig[currentSection]?.fields.length : 0;

  useEffect(() => {
    // Initialize the voice bot with the first question when it becomes active
    if (!currentQuestion && !isProcessing && !isRecording) {
      const firstQuestion = getNextQuestion(Object.keys(formConfig)[0], 0, form);
      if (firstQuestion) {
        dispatch(setCurrentSection(firstQuestion.sectionId));
        dispatch(setReduxCurrentQuestion(firstQuestion.questionIndex));
        dispatch(setCurrentQuestion(firstQuestion.question));
        dispatch(addConversationEntry({ sender: 'Bot', type: 'text', content: firstQuestion.question }));
      }
    }
  }, [currentQuestion, isProcessing, isRecording, dispatch, form]);

  const handleTranscriptionResult = async ({ transcript, confidence }) => {
    dispatch(addConversationEntry({ sender: 'You', type: 'text', content: transcript, confidence }));

    try {
      const currentFieldId = currentSection && currentQuestionIndex !== undefined
        ? formConfig[currentSection]?.fields[currentQuestionIndex]?.id
        : null;

      const geminiResponse = await analyzeVoiceInput({
        audio: null, // Audio blob will be handled separately if needed for Gemini
        sessionId: "", // TODO: Implement session management
        currentSection: currentSection,
        currentField: currentFieldId,
        questionIndex: currentQuestionIndex,
        context: form, // Pass the entire form state as context
        transcript: transcript, // Pass the transcribed text
      });

      if (geminiResponse.success) {
        if (geminiResponse.action === "update") {
          dispatch(updateFormField({
            section: geminiResponse.field.section,
            field: geminiResponse.field.id,
            value: geminiResponse.value
          }));
          dispatch(addConversationEntry({ sender: 'Bot', type: 'text', content: `Got it. I've updated your ${geminiResponse.field.id}.` }));

          const nextQ = getNextQuestion(geminiResponse.field.section, geminiResponse.field.questionIndex + 1, {
            ...form,
            [geminiResponse.field.section]: {
              ...form[geminiResponse.field.section],
              [geminiResponse.field.id]: geminiResponse.value
            }
          });

          if (geminiResponse.validation && !geminiResponse.validation.isValid) {
            const errorMsg = geminiResponse.validation.errors.join(" ") + " Please try again.";
            dispatch(addError(errorMsg));
            dispatch(addConversationEntry({ sender: 'Bot', type: 'error', content: errorMsg }));
            dispatch(setCurrentQuestion(errorMsg));
          } else if (nextQ) {
            dispatch(setCurrentSection(nextQ.sectionId));
            dispatch(setReduxCurrentQuestion(nextQ.questionIndex));
            dispatch(setCurrentQuestion(nextQ.question));
            dispatch(addConversationEntry({ sender: 'Bot', type: 'text', content: nextQ.question }));
          } else {
            dispatch(setCurrentQuestion("All questions answered! Submitting your form..."));
            dispatch(addConversationEntry({ sender: 'Bot', type: 'text', content: "All questions answered! Submitting your form..." }));
            dispatch(submitVoiceForm(form));
          }
        } else if (geminiResponse.action === "clarify") {
          dispatch(addConversationEntry({ sender: 'Bot', type: 'text', content: geminiResponse.clarificationQuestion }));
          dispatch(setCurrentQuestion(geminiResponse.clarificationQuestion));
        } else if (geminiResponse.action === "error") {
          dispatch(addError(geminiResponse.errors[0]));
          dispatch(addConversationEntry({ sender: 'Bot', type: 'error', content: geminiResponse.errors[0] }));
          dispatch(setCurrentQuestion("I didn't quite understand. Could you please rephrase?"));
          dispatch(addConversationEntry({ sender: 'Bot', type: 'text', content: "I didn't quite understand. Could you please rephrase?" }));
        }
      } else {
        dispatch(addError("Gemini analysis failed."));
        dispatch(addConversationEntry({ sender: 'Bot', type: 'error', content: "Gemini analysis failed." }));
        dispatch(setCurrentQuestion("I'm having trouble processing that. Can you try again?"));
        dispatch(addConversationEntry({ sender: 'Bot', type: 'text', content: "I'm having trouble processing that. Can you try again?" }));
      }

    } catch (err) {
      console.error("Gemini API error:", err);
      dispatch(addError(err.message));
      dispatch(addConversationEntry({ sender: 'Bot', type: 'error', content: `An error occurred: ${err.message}` }));
      dispatch(setCurrentQuestion("There was an issue connecting to the service. Please try again."));
      dispatch(addConversationEntry({ sender: 'Bot', type: 'text', content: "There was an issue connecting to the service. Please try again." }));
    } finally {
      dispatch(setIsProcessing(false));
    }
  };

  const handleTranscriptionError = (error) => {
    console.error("Transcription error:", error);
    dispatch(addError(error.message));
    dispatch(addConversationEntry({ sender: 'Bot', type: 'error', content: error.message }));
    dispatch(setIsProcessing(false));
  };

  const handleStartRecording = () => {
    dispatch(setIsRecording(true));
    dispatch(setIsProcessing(true)); // Indicate processing while recording and transcribing
    startTranscription(handleTranscriptionResult, handleTranscriptionError);
  };

  const handleStopRecording = (audioBlob) => {
    dispatch(setIsRecording(false));
    stopTranscription();
    // Store the audioBlob in Redux if needed for later processing (e.g., Gemini API)
    dispatch(addConversationEntry({ sender: 'You', type: 'audio', content: audioBlob }));
    // setIsProcessing(false) will be handled after Gemini response
  };

  const handleSkipQuestion = () => {
    const nextQ = getNextQuestion(currentSection, currentQuestionIndex + 1, form);
    if (nextQ) {
      dispatch(setCurrentSection(nextQ.sectionId));
      dispatch(setReduxCurrentQuestion(nextQ.questionIndex));
      dispatch(setCurrentQuestion(nextQ.question));
      dispatch(addConversationEntry({ sender: 'Bot', type: 'text', content: `Okay, skipping that. ${nextQ.question}` }));
    } else {
      dispatch(setCurrentQuestion("All questions answered! Submitting your form..."));
      dispatch(addConversationEntry({ sender: 'Bot', type: 'text', content: "All questions answered! Submitting your form..." }));
      dispatch(submitVoiceForm(form));
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border-2 border-red-500">
      <h2 className="text-2xl font-semibold mb-4">Voice Assistant</h2>

      <ConversationHistory />

      <div className="mt-4 p-4 bg-blue-50 rounded-md">
        <p className="text-lg font-medium">Bot: {currentQuestion || "Hello! How can I help you today?"}</p>
        <p className="text-sm text-gray-600 mt-1">Progress: Question {currentQuestionIndex + 1} of {totalQuestionsInSection} in {currentSectionTitle}</p>
      </div>

      {errors.length > 0 && <p className="text-red-500 mt-2">Error: {errors[errors.length - 1]}</p>}

      <AudioRecorder onStartRecording={handleStartRecording} onStopRecording={handleStopRecording} />

      <VoiceControls onSkip={handleSkipQuestion} />
    </div>
  );
}; 

export default VoiceBotPanel;