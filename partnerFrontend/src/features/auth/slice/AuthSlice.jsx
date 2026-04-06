import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  checkAuth,
  forgotPassword,
  login,
  logout,
  resetPassword,
} from "../api/AuthApi";

const initialState = {
  status: "idle",
  errors: null,

  // Login State
  loginStatus: "idle",
  loginError: null,
  loggedInUser: null,

  // Forgot Password State
  forgotPasswordStatus: "idle",
  forgotPasswordSuccessMessage: null,
  forgotPasswordError: null,

  // Reset Password State
  resetPasswordStatus: "idle",
  resetPasswordSuccessMessage: null,
  resetPasswordError: null,

  // Global Auth State
  successMessage: null,
  isAuthChecked: false,
};

// ==========================================
// 🚨 THUNKS
// ==========================================

export const loginAdminAsync = createAsyncThunk(
  "adminAuth/loginAdminAsync",
  async (cred, { rejectWithValue }) => {
    try {
      const res = await login(cred);
      return res;
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const forgotPasswordAsync = createAsyncThunk(
  "adminAuth/forgotPasswordAsync",
  async (cred, { rejectWithValue }) => {
    try {
      const res = await forgotPassword(cred);
      return res;
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const resetPasswordAsync = createAsyncThunk(
  "adminAuth/resetPasswordAsync",
  async (cred, { rejectWithValue }) => {
    try {
      const res = await resetPassword(cred);
      return res;
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const checkAuthAsync = createAsyncThunk(
  "adminAuth/checkAuthAsync",
  async (_, { rejectWithValue }) => {
    try {
      const res = await checkAuth();
      return res;
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const logoutAsync = createAsyncThunk(
  "adminAuth/logoutAsync",
  async (_, { rejectWithValue }) => {
    try {
      const res = await logout();
      return res;
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

// ==========================================
// SLICE
// ==========================================

const adminAuthSlice = createSlice({
  name: "adminAuthSlice", // 🚨 renamed
  initialState: initialState,
  reducers: {
    clearAuthSuccessMessage: (state) => {
      state.successMessage = null;
    },
    clearAuthErrors: (state) => {
      state.errors = null;
    },
    resetAuthStatus: (state) => {
      state.status = "idle";
    },

    resetLoginStatus: (state) => {
      state.loginStatus = "idle";
    },
    clearLoginError: (state) => {
      state.loginError = null;
    },

    resetForgotPasswordStatus: (state) => {
      state.forgotPasswordStatus = "idle";
    },
    clearForgotPasswordSuccessMessage: (state) => {
      state.forgotPasswordSuccessMessage = null;
    },
    clearForgotPasswordError: (state) => {
      state.forgotPasswordError = null;
    },

    resetResetPasswordStatus: (state) => {
      state.resetPasswordStatus = "idle";
    },
    clearResetPasswordSuccessMessage: (state) => {
      state.resetPasswordSuccessMessage = null;
    },
    clearResetPasswordError: (state) => {
      state.resetPasswordError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // LOGIN
      .addCase(loginAdminAsync.pending, (state) => {
        state.loginStatus = "pending";
      })
      .addCase(loginAdminAsync.fulfilled, (state, action) => {
        state.loginStatus = "fulfilled";
        state.loggedInUser = action.payload;
      })
      .addCase(loginAdminAsync.rejected, (state, action) => {
        state.loginStatus = "rejected";
        state.loginError = action.payload || action.error;
      })

      // FORGOT PASSWORD
      .addCase(forgotPasswordAsync.pending, (state) => {
        state.forgotPasswordStatus = "pending";
      })
      .addCase(forgotPasswordAsync.fulfilled, (state, action) => {
        state.forgotPasswordStatus = "fulfilled";
        state.forgotPasswordSuccessMessage = action.payload;
      })
      .addCase(forgotPasswordAsync.rejected, (state, action) => {
        state.forgotPasswordStatus = "rejected";
        state.forgotPasswordError = action.payload || action.error;
      })

      // RESET PASSWORD
      .addCase(resetPasswordAsync.pending, (state) => {
        state.resetPasswordStatus = "pending";
      })
      .addCase(resetPasswordAsync.fulfilled, (state, action) => {
        state.resetPasswordStatus = "fulfilled";
        state.resetPasswordSuccessMessage = action.payload;
      })
      .addCase(resetPasswordAsync.rejected, (state, action) => {
        state.resetPasswordStatus = "rejected";
        state.resetPasswordError = action.payload || action.error;
      })

      // LOGOUT
      .addCase(logoutAsync.pending, (state) => {
        state.status = "pending";
      })
      .addCase(logoutAsync.fulfilled, (state) => {
        state.status = "fulfilled";
        state.loggedInUser = null;
      })
      .addCase(logoutAsync.rejected, (state, action) => {
        state.status = "rejected";
        state.errors = action.payload || action.error;
      })

      // CHECK AUTH
      .addCase(checkAuthAsync.pending, (state) => {
        state.status = "pending";
      })
      .addCase(checkAuthAsync.fulfilled, (state, action) => {
        state.status = "fulfilled";
        state.loggedInUser = action.payload;
        state.isAuthChecked = true;
      })
      .addCase(checkAuthAsync.rejected, (state, action) => {
        state.status = "rejected";
        state.errors = action.payload || action.error;
        state.isAuthChecked = true;
      });
  },
});

// ==========================================
// SELECTORS
// ==========================================
export const selectAuthStatus = (state) => state.AuthSlice.status;
export const selectAuthErrors = (state) => state.AuthSlice.errors;
export const selectLoggedInAdmin = (state) => state.AuthSlice.loggedInUser;
export const selectAuthSuccessMessage = (state) =>
  state.AuthSlice.successMessage;
export const selectIsAuthChecked = (state) => state.AuthSlice.isAuthChecked;

export const selectLoginStatus = (state) => state.AuthSlice.loginStatus;
export const selectLoginError = (state) => state.AuthSlice.loginError;

export const selectForgotPasswordStatus = (state) =>
  state.AuthSlice.forgotPasswordStatus;
export const selectForgotPasswordSuccessMessage = (state) =>
  state.AuthSlice.forgotPasswordSuccessMessage;
export const selectForgotPasswordError = (state) =>
  state.AuthSlice.forgotPasswordError;

export const selectResetPasswordStatus = (state) =>
  state.AuthSlice.resetPasswordStatus;
export const selectResetPasswordSuccessMessage = (state) =>
  state.AuthSlice.resetPasswordSuccessMessage;
export const selectResetPasswordError = (state) =>
  state.AuthSlice.resetPasswordError;

// ==========================================
// ACTIONS & EXPORTS
// ==========================================
export const {
  clearAuthSuccessMessage,
  clearAuthErrors,
  resetAuthStatus,
  clearLoginError,
  resetLoginStatus,
  clearForgotPasswordError,
  clearForgotPasswordSuccessMessage,
  resetForgotPasswordStatus,
  clearResetPasswordError,
  clearResetPasswordSuccessMessage,
  resetResetPasswordStatus,
} = adminAuthSlice.actions; // 🚨 FIX: Extracting from adminAuthSlice.actions

export default adminAuthSlice.reducer; // 🚨 FIX: Exporting adminAuthSlice.reducer
