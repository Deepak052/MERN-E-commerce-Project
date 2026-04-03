import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  createStoreAdmin,
  fetchAllAdmins,
  fetchAllCustomers,
  fetchLoggedInUserById,
  updateCustomerById,
  updateUserById,
} from "./UserApi";

const initialState = {
  status: "idle",
  userInfo: null,
  errors: null,
  successMessage: null,

  // ✅ add missing states
  customers: [],
  customerFetchStatus: "idle",
  storeAdmins: [],
};

// ================= THUNKS =================

export const fetchLoggedInUserByIdAsync = createAsyncThunk(
  "user/fetchLoggedInUserByIdAsync",
  async (id) => {
    const userInfo = await fetchLoggedInUserById(id);
    return userInfo;
  },
);

export const updateUserByIdAsync = createAsyncThunk(
  "user/updateUserByIdAsync",
  async (update) => {
    const updatedUser = await updateUserById(update);
    return updatedUser;
  },
);

export const fetchAllCustomersAsync = createAsyncThunk(
  "user/fetchAllCustomers",
  async () => {
    return await fetchAllCustomers();
  },
);

export const updateCustomerByIdAsync = createAsyncThunk(
  "user/updateCustomerById",
  async (update) => {
    return await updateCustomerById(update);
  },
);

export const fetchAllAdminsAsync = createAsyncThunk(
  "user/fetchAllAdmins",
  async () => {
    return await fetchAllAdmins();
  },
);

// ❌ BUG FIXED HERE (missing closing bracket earlier)
export const createStoreAdminAsync = createAsyncThunk(
  "user/createStoreAdmin",
  async (data) => {
    return await createStoreAdmin(data);
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
        state.errors = action.error;
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
        state.errors = action.error;
      })

      // ===== CUSTOMERS =====
      .addCase(fetchAllCustomersAsync.pending, (state) => {
        state.customerFetchStatus = "pending";
      })
      .addCase(fetchAllCustomersAsync.fulfilled, (state, action) => {
        state.customerFetchStatus = "fulfilled";
        state.customers = action.payload;
      })
      .addCase(fetchAllCustomersAsync.rejected, (state) => {
        state.customerFetchStatus = "rejected";
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

// ================= SELECTORS =================

export const selectUserStatus = (state) => state.UserSlice.status;
export const selectUserInfo = (state) => state.UserSlice.userInfo;
export const selectUserErrors = (state) => state.UserSlice.errors;
export const selectUserSuccessMessage = (state) =>
  state.UserSlice.successMessage;

export const selectCustomers = (state) => state.UserSlice.customers;
export const selectCustomerFetchStatus = (state) =>
  state.UserSlice.customerFetchStatus;

export const selectStoreAdmins = (state) => state.UserSlice.storeAdmins;

// ================= EXPORT =================

export default userSlice.reducer;
