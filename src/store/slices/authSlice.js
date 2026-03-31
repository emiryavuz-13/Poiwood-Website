import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  emailVerified: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.emailVerified = action.payload.emailVerified ?? false;
    },
    setEmailVerified: (state, action) => {
      state.emailVerified = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.emailVerified = false;
    },
  },
});

export const { login, setEmailVerified, logout } = authSlice.actions;
export default authSlice.reducer;
