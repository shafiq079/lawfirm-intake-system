import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const initialState = {
  isActive: false,
  currentSection: null,
  currentQuestion: 0,
  isRecording: false,
  isProcessing: false,
  conversation: [],
  errors: [],
  isSubmitting: false,
  submissionSuccess: false,
  submissionError: null,
  form: {
    personalInfo: {},
    immigrationIntent: {},
    passportTravel: {},
    familyInfo: {},
    legalHistory: {},
    previousApplications: {},
    employmentEducation: {},
    reviewSubmit: {}
  },
  session: {
    sessionId: null,
    progress: 0,
    completedSections: [],
    lastSaved: null
  }
};

const voiceBotSlice = createSlice({
  name: 'voiceBot',
  initialState,
  reducers: {
    // Reducers will be added here as functionality is implemented
    setVoiceBotActive: (state, action) => {
      state.isActive = action.payload;
    },
    setCurrentSection: (state, action) => {
      state.currentSection = action.payload;
    },
    setCurrentQuestion: (state, action) => {
      state.currentQuestion = action.payload;
    },
    setIsRecording: (state, action) => {
      state.isRecording = action.payload;
    },
    setIsProcessing: (state, action) => {
      state.isProcessing = action.payload;
    },
    addConversationEntry: (state, action) => {
      state.conversation.push(action.payload);
    },
    addError: (state, action) => {
      state.errors.push(action.payload);
    },
    updateFormField: (state, action) => {
      const { section, field, value } = action.payload;
      if (state.form[section]) {
        state.form[section][field] = value;
      }
    },
    setSessionId: (state, action) => {
      state.session.sessionId = action.payload;
    },
    updateProgress: (state, action) => {
      state.session.progress = action.payload;
    },
    addCompletedSection: (state, action) => {
      state.session.completedSections.push(action.payload);
    },
    setLastSaved: (state, action) => {
      state.session.lastSaved = action.payload;
    },
    setSubmitting: (state, action) => {
      state.isSubmitting = action.payload;
    },
    setSubmissionSuccess: (state, action) => {
      state.submissionSuccess = action.payload;
    },
    setSubmissionError: (state, action) => {
      state.submissionError = action.payload;
    },
    resetVoiceBotState: (state) => {
      Object.assign(state, initialState);
    }
  },
});

export const submitVoiceForm = createAsyncThunk(
  'voiceBot/submitForm',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/intakes/submit-voice-form', formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message || error.message);
    }
  }
);

export const {
  setVoiceBotActive,
  setCurrentSection,
  setCurrentQuestion,
  setIsRecording,
  setIsProcessing,
  addConversationEntry,
  addError,
  updateFormField,
  setSessionId,
  updateProgress,
  addCompletedSection,
  setLastSaved,
  setSubmitting,
  setSubmissionSuccess,
  setSubmissionError,
  resetVoiceBotState,
  skipQuestion
} = voiceBotSlice.actions;

export default voiceBotSlice.reducer;
