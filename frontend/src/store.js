
import { configureStore } from '@reduxjs/toolkit';
import userReducer from './features/userSlice';
import intakeReducer from './features/intakeSlice';

const store = configureStore({
  reducer: {
    user: userReducer,
    intake: intakeReducer,
  },
});

export default store;
