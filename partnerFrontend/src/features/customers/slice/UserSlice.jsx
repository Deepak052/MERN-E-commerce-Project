import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
// 🚨 Ensure this points to the API file we created for the Admin app
import {
  createStoreAdmin,
  fetchAllAdmins,
  fetchAllCustomers,
 // Used to fetch the Admin's own profile
  updateCustomerById,
  // updateUserById, // Used to update the Admin's own profile
} from "../api/UserApi";

const initialState = {
  status: "idle",
  userInfo: null,
  errors: null,
  successMessage: null,

  // Admin-specific management states
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
  reducers: {
    clearUserErrors: (state) => {
      state.errors = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ===== LOGGED IN ADMIN PROFILE =====
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

      // ===== CUSTOMERS MANAGEMENT =====
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

      .addCase(updateCustomerByIdAsync.pending, (state) => {
        state.status = "pending";
      })
      .addCase(updateCustomerByIdAsync.fulfilled, (state, action) => {
        state.status = "fulfilled";
        const index = state.customers.findIndex(
          (c) => c._id === action.payload._id,
        );
        if (index !== -1) {
          state.customers[index] = action.payload;
        }
      })
      .addCase(updateCustomerByIdAsync.rejected, (state, action) => {
        state.status = "rejected";
        state.errors = action.payload || action.error;
      })

      // ===== STORE ADMINS MANAGEMENT =====
      .addCase(fetchAllAdminsAsync.pending, (state) => {
        state.status = "pending";
      })
      .addCase(fetchAllAdminsAsync.fulfilled, (state, action) => {
        state.status = "fulfilled";
        state.storeAdmins = action.payload;
      })
      .addCase(fetchAllAdminsAsync.rejected, (state, action) => {
        state.status = "rejected";
        state.errors = action.payload || action.error;
      })

      .addCase(createStoreAdminAsync.pending, (state) => {
        state.status = "pending";
      })
      .addCase(createStoreAdminAsync.fulfilled, (state, action) => {
        state.status = "fulfilled";
        state.storeAdmins.unshift(action.payload); // Add new admin to the top of the list
      })
      .addCase(createStoreAdminAsync.rejected, (state, action) => {
        state.status = "rejected";
        state.errors = action.payload || action.error;
      });
  },
});

// ================= ACTIONS & SELECTORS =================

export const { clearUserErrors } = userSlice.actions;

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
