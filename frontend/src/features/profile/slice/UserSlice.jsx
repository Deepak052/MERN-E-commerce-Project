import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchLoggedInUserById, updateUserById } from "../api/UserApi";

const initialState = {
  status: "idle",
  userInfo: null,
  errors: null,
  successMessage: null,
};

// ================= THUNKS =================

export const fetchLoggedInUserByIdAsync = createAsyncThunk(
  "user/fetchLoggedInUserByIdAsync",
  async (id, { rejectWithValue }) => {
    try {
      return await fetchLoggedInUserById(id);
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const updateUserByIdAsync = createAsyncThunk(
  "user/updateUserByIdAsync",
  async (update, { rejectWithValue }) => {
    try {
      return await updateUserById(update);
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

// ================= SLICE =================

const userSlice = createSlice({
  name: "UserSlice",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // ===== FETCH LOGGED IN USER =====
      .addCase(fetchLoggedInUserByIdAsync.pending, (state) => {
        state.status = "pending";
      })
      .addCase(fetchLoggedInUserByIdAsync.fulfilled, (state, action) => {
        state.status = "fulfilled";
        state.userInfo = action.payload;
      })
      .addCase(fetchLoggedInUserByIdAsync.rejected, (state, action) => {
        state.status = "rejected";
        state.errors = action.payload || action.error;
      })

      // ===== UPDATE LOGGED IN USER =====
      .addCase(updateUserByIdAsync.pending, (state) => {
        state.status = "pending";
      })
      .addCase(updateUserByIdAsync.fulfilled, (state, action) => {
        state.status = "fulfilled";
        state.userInfo = action.payload;
      })
      .addCase(updateUserByIdAsync.rejected, (state, action) => {
        state.status = "rejected";
        state.errors = action.payload || action.error;
      });
  },
});

// ================= SELECTORS =================
export const selectUserStatus = (state) => state.UserSlice.status;
export const selectUserInfo = (state) => state.UserSlice.userInfo;
export const selectUserErrors = (state) => state.UserSlice.errors;
export const selectUserSuccessMessage = (state) =>
  state.UserSlice.successMessage;

export default userSlice.reducer;
