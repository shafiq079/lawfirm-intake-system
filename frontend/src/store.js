
import { configureStore } from '@reduxjs/toolkit';
import userReducer from './features/userSlice';
import intakeReducer from './features/intakeSlice';
import voiceBotReducer from './features/voiceBotSlice';

const store = configureStore({
  reducer: {
    user: userReducer,
    intake: intakeReducer,
    voiceBot: voiceBotReducer,
  },
});

export default store;
