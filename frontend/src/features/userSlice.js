import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const userInfoFromStorage = localStorage.getItem('userInfo')
  ? JSON.parse(localStorage.getItem('userInfo'))
  : null;

const initialState = {
  userInfo: userInfoFromStorage,
  loading: false,
  error: null,
  clioConnected: false,
};

export const login = createAsyncThunk('user/login', async ({ email, password }) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
    },
  };
  const { data } = await axios.post('/api/users/login', { email, password }, config);
  localStorage.setItem('userInfo', JSON.stringify(data));
  return data;
});

export const register = createAsyncThunk('user/register', async ({ name, email, password }) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
    },
  };
  const { data } = await axios.post('/api/users', { name, email, password }, config);
  localStorage.setItem('userInfo', JSON.stringify(data));
  return data;
});

export const checkClioConnection = createAsyncThunk('user/checkClioConnection', async (_, { getState }) => {
  const { user: { userInfo } } = getState();
  const config = {
    headers: {
      Authorization: `Bearer ${userInfo.token}`,
    },
  };
  const { data } = await axios.get('/api/clio/status', config);
  return data.isConnected;
});

export const logoutUser = createAsyncThunk('user/logoutUser', async (_, { getState }) => {
  const { user: { userInfo } } = getState();
  const config = {
    headers: {
      Authorization: `Bearer ${userInfo.token}`,
    },
  };
  await axios.post('/api/users/logout', {}, config);
  localStorage.removeItem('userInfo');
  return null;
});

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    logout: (state) => {
      state.userInfo = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.userInfo = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(register.pending, (state) => {
        state.loading = true;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.userInfo = action.payload;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(checkClioConnection.fulfilled, (state, action) => {
        state.clioConnected = action.payload;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.userInfo = null;
        state.clioConnected = false;
      });
  },
});

export const { logout } = userSlice.actions;

export default userSlice.reducer;