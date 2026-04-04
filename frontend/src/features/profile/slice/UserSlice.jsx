import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  createStoreAdmin,
  fetchAllAdmins,
  fetchAllCustomers,
  fetchLoggedInUserById,
  updateCustomerById,
  updateUserById,
} from "../api/UserApi";

const initialState = {
  status: "idle",
  userInfo: null,
  errors: null,
  successMessage: null,
  customers: [],
  customerFetchStatus: "idle",
  storeAdmins: [],
};

// ================= THUNKS (FIXED WITH rejectWithValue) =================

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

export const fetchAllCustomersAsync = createAsyncThunk(
  "user/fetchAllCustomers",
  async (_, { rejectWithValue }) => {
    try {
      return await fetchAllCustomers();
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const updateCustomerByIdAsync = createAsyncThunk(
  "user/updateCustomerById",
  async (update, { rejectWithValue }) => {
    try {
      return await updateCustomerById(update);
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const fetchAllAdminsAsync = createAsyncThunk(
  "user/fetchAllAdmins",
  async (_, { rejectWithValue }) => {
    try {
      return await fetchAllAdmins();
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const createStoreAdminAsync = createAsyncThunk(
  "user/createStoreAdmin",
  async (data, { rejectWithValue }) => {
    try {
      return await createStoreAdmin(data);
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
      // ===== USER =====
      .addCase(fetchLoggedInUserByIdAsync.pending, (state) => {
        state.status = "pending";
      })
      .addCase(fetchLoggedInUserByIdAsync.fulfilled, (state, action) => {
        state.status = "fulfilled";
        state.userInfo = action.payload;
      })
      .addCase(fetchLoggedInUserByIdAsync.rejected, (state, action) => {
        state.status = "rejected";
        state.errors = action.payload || action.error; // 🚨 FIX
      })

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
      })

      // ===== CUSTOMERS =====
      .addCase(fetchAllCustomersAsync.pending, (state) => {
        state.customerFetchStatus = "pending";
      })
      .addCase(fetchAllCustomersAsync.fulfilled, (state, action) => {
        state.customerFetchStatus = "fulfilled";
        state.customers = action.payload;
      })
      .addCase(fetchAllCustomersAsync.rejected, (state, action) => {
        state.customerFetchStatus = "rejected";
        state.errors = action.payload || action.error;
      })

      .addCase(updateCustomerByIdAsync.fulfilled, (state, action) => {
        const index = state.customers.findIndex(
          (c) => c._id === action.payload._id,
        );
        if (index !== -1) {
          state.customers[index] = action.payload;
        }
      })

      // ===== ADMINS =====
      .addCase(fetchAllAdminsAsync.fulfilled, (state, action) => {
        state.storeAdmins = action.payload;
      })
      .addCase(createStoreAdminAsync.fulfilled, (state, action) => {
        state.storeAdmins.unshift(action.payload);
      });
  },
});

// Selectors
export const selectUserStatus = (state) => state.UserSlice.status;
export const selectUserInfo = (state) => state.UserSlice.userInfo;
export const selectUserErrors = (state) => state.UserSlice.errors;
export const selectUserSuccessMessage = (state) =>
  state.UserSlice.successMessage;
export const selectCustomers = (state) => state.UserSlice.customers;
export const selectCustomerFetchStatus = (state) =>
  state.UserSlice.customerFetchStatus;
export const selectStoreAdmins = (state) => state.UserSlice.storeAdmins;

export default userSlice.reducer;
