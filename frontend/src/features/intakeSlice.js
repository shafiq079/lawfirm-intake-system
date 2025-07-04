
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
  intakes: [],
  selectedIntake: null,
  loading: false,
  error: null,
  success: false,
};

export const createIntake = createAsyncThunk(
  'intake/create',
  async (intakeData, { getState, rejectWithValue }) => {
    try {
      const { user: { userInfo } } = getState();

      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const { data } = await axios.post('/api/intakes', intakeData, config);
      return data;
    } catch (error) {
      return rejectWithValue(error.response.data.message || error.message);
    }
  }
);

export const listIntakes = createAsyncThunk(
  'intake/list',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { user: { userInfo } } = getState();

      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const { data } = await axios.get('/api/intakes', config);
      return data;
    } catch (error) {
      return rejectWithValue(error.response.data.message || error.message);
    }
  }
);

export const getIntakeDetails = createAsyncThunk(
  'intake/details',
  async (intakeLink, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`/api/intakes/${intakeLink}`);
      return data;
    } catch (error) {
      return rejectWithValue(error.response.data.message || error.message);
    }
  }
);

const intakeSlice = createSlice({
  name: 'intake',
  initialState,
  reducers: {
    resetSuccess: (state) => {
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createIntake.pending, (state) => {
        state.loading = true;
      })
      .addCase(createIntake.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.intakes.push(action.payload);
      })
      .addCase(createIntake.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(listIntakes.pending, (state) => {
        state.loading = true;
      })
      .addCase(listIntakes.fulfilled, (state, action) => {
        state.loading = false;
        state.intakes = action.payload;
      })
      .addCase(listIntakes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getIntakeDetails.pending, (state) => {
        state.loading = true;
      })
      .addCase(getIntakeDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedIntake = action.payload;
      })
      .addCase(getIntakeDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetSuccess } = intakeSlice.actions;

export default intakeSlice.reducer;
