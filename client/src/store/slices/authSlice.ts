import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { IUser } from '../../types';

import { getCookie, setCookie, deleteCookie } from '../../utils/cookie';

interface AuthState {
  user: IUser | null;
  token: string | null;
  isAuthenticated: boolean;
}

const getStoredToken = (): string | null => {
  return getCookie('token');
};

const getStoredUser = (): IUser | null => {
  try {
    const raw = getCookie('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const token = getStoredToken();
const user = getStoredUser();

// Clean up any legacy localStorage tokens
try {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
} catch {}

const initialState: AuthState = {
  user,
  token,
  isAuthenticated: !!token,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: IUser; token: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      setCookie('token', action.payload.token, 7);
      setCookie('user', JSON.stringify(action.payload.user), 7);
      try {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } catch {}
    },
    updateUser: (state, action: PayloadAction<IUser>) => {
      state.user = action.payload;
      setCookie('user', JSON.stringify(action.payload), 7);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      deleteCookie('token');
      deleteCookie('user');
      try {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } catch {}
    },
  },
});

export const { setCredentials, updateUser, logout } = authSlice.actions;
export default authSlice.reducer;
