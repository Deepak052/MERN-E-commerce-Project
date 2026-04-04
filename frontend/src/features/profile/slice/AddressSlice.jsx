import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  addAddress,
  deleteAddressById,
  fetchAddressByUserId,
  updateAddressById,
} from "../api/AddressApi";

const initialState = {
  status: "idle",
  addressAddStatus: "idle",
  addressDeleteStatus: "idle",
  addressUpdateStatus: "idle",
  addresses: [],
  errors: null,
  successMessage: null,
};

// 🚨 FIX: Added rejectWithValue
export const addAddressAsync = createAsyncThunk(
  "address/addAddressAsync",
  async (address, { rejectWithValue }) => {
    try {
      return await addAddress(address);
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const fetchAddressByUserIdAsync = createAsyncThunk(
  "address/fetchAddressByUserIdAsync",
  async (id, { rejectWithValue }) => {
    try {
      return await fetchAddressByUserId(id);
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const updateAddressByIdAsync = createAsyncThunk(
  "address/updateAddressByIdAsync",
  async (id, { rejectWithValue }) => {
    try {
      return await updateAddressById(id);
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const deleteAddressByIdAsync = createAsyncThunk(
  "address/deleteAddressByIdAsync",
  async (id, { rejectWithValue }) => {
    try {
      return await deleteAddressById(id);
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

const addressSlice = createSlice({
  name: "addressSlice",
  initialState: initialState,
  reducers: {
    resetAddressStatus: (state) => {
      state.status = "idle";
    },
    resetAddressAddStatus: (state) => {
      state.addressAddStatus = "idle";
    },
    resetAddressDeleteStatus: (state) => {
      state.addressDeleteStatus = "idle";
    },
    resetAddressUpdateStatus: (state) => {
      state.addressUpdateStatus = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addAddressAsync.pending, (state) => {
        state.addressAddStatus = "pending";
      })
      .addCase(addAddressAsync.fulfilled, (state, action) => {
        state.addressAddStatus = "fulfilled";
        state.addresses.push(action.payload);
      })
      .addCase(addAddressAsync.rejected, (state, action) => {
        state.addressAddStatus = "rejected";
        state.errors = action.payload || action.error; // 🚨 FIX
      })

      .addCase(fetchAddressByUserIdAsync.pending, (state) => {
        state.status = "pending";
      })
      .addCase(fetchAddressByUserIdAsync.fulfilled, (state, action) => {
        state.status = "fulfilled";
        state.addresses = action.payload;
      })
      .addCase(fetchAddressByUserIdAsync.rejected, (state, action) => {
        state.status = "rejected";
        state.errors = action.payload || action.error;
      })

      .addCase(updateAddressByIdAsync.pending, (state) => {
        state.addressUpdateStatus = "pending";
      })
      .addCase(updateAddressByIdAsync.fulfilled, (state, action) => {
        state.addressUpdateStatus = "fulfilled";
        const index = state.addresses.findIndex(
          (address) => address._id === action.payload._id,
        );
        if (index !== -1) state.addresses[index] = action.payload;
      })
      .addCase(updateAddressByIdAsync.rejected, (state, action) => {
        state.addressUpdateStatus = "rejected";
        state.errors = action.payload || action.error;
      })

      .addCase(deleteAddressByIdAsync.pending, (state) => {
        state.addressDeleteStatus = "pending";
      })
      .addCase(deleteAddressByIdAsync.fulfilled, (state, action) => {
        state.addressDeleteStatus = "fulfilled";
        state.addresses = state.addresses.filter(
          (address) => address._id !== action.payload._id,
        );
      })
      .addCase(deleteAddressByIdAsync.rejected, (state, action) => {
        state.addressDeleteStatus = "rejected";
        state.errors = action.payload || action.error;
      });
  },
});

// Selectors
export const selectAddressStatus = (state) => state.AddressSlice.status;
export const selectAddresses = (state) => state.AddressSlice.addresses;
export const selectAddressErrors = (state) => state.AddressSlice.errors;
export const selectAddressSuccessMessage = (state) =>
  state.AddressSlice.successMessage;
export const selectAddressAddStatus = (state) =>
  state.AddressSlice.addressAddStatus;
export const selectAddressDeleteStatus = (state) =>
  state.AddressSlice.addressDeleteStatus;
export const selectAddressUpdateStatus = (state) =>
  state.AddressSlice.addressUpdateStatus;

export const {
  resetAddressStatus,
  resetAddressAddStatus,
  resetAddressDeleteStatus,
  resetAddressUpdateStatus,
} = addressSlice.actions;

export default addressSlice.reducer;
