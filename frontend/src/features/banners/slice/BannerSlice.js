import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  fetchAllBanners,
  getBannerById,
  addBanner,
  updateBannerById,
  deleteBannerById,
} from "../api/BannerApi"; // 🚨 FIX: Corrected API import

const initialState = {
  status: "idle",
  banners: [],
  selectedBanner: null,
  errors: null,
};

// --- Thunks (🚨 FIXED WITH rejectWithValue) ---
export const fetchAllBannersAsync = createAsyncThunk(
  "banners/fetchAll",
  async (admin, { rejectWithValue }) => {
    try {
      return await fetchAllBanners(admin);
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const getBannerByIdAsync = createAsyncThunk(
  "banners/getById",
  async (id, { rejectWithValue }) => {
    try {
      return await getBannerById(id);
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const addBannerAsync = createAsyncThunk(
  "banners/add",
  async (data, { rejectWithValue }) => {
    try {
      return await addBanner(data);
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const updateBannerByIdAsync = createAsyncThunk(
  "banners/update",
  async (data, { rejectWithValue }) => {
    try {
      return await updateBannerById(data);
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const deleteBannerByIdAsync = createAsyncThunk(
  "banners/delete",
  async (id, { rejectWithValue }) => {
    try {
      return await deleteBannerById(id);
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

// --- Slice ---
const bannerSlice = createSlice({
  name: "bannerSlice",
  initialState,
  reducers: {
    resetBannerStatus: (state) => {
      state.status = "idle";
      state.errors = null;
    },
    clearSelectedBanner: (state) => {
      state.selectedBanner = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All
      .addCase(fetchAllBannersAsync.pending, (state) => {
        state.status = "pending";
      })
      .addCase(fetchAllBannersAsync.fulfilled, (state, action) => {
        state.status = "fulfilled";
        state.banners = action.payload;
      })
      .addCase(fetchAllBannersAsync.rejected, (state, action) => {
        state.status = "rejected";
        state.errors = action.payload || action.error; // 🚨 FIX
      })
      // Get By ID
      .addCase(getBannerByIdAsync.pending, (state) => {
        state.status = "pending";
      })
      .addCase(getBannerByIdAsync.fulfilled, (state, action) => {
        state.status = "fulfilled";
        state.selectedBanner = action.payload;
      })
      .addCase(getBannerByIdAsync.rejected, (state, action) => {
        state.status = "rejected";
        state.errors = action.payload || action.error;
      })
      // Add
      .addCase(addBannerAsync.pending, (state) => {
        state.status = "pending";
      })
      .addCase(addBannerAsync.fulfilled, (state, action) => {
        state.status = "fulfilled";
        state.banners.unshift(action.payload);
      })
      .addCase(addBannerAsync.rejected, (state, action) => {
        state.status = "rejected";
        state.errors = action.payload || action.error;
      })
      // Update
      .addCase(updateBannerByIdAsync.pending, (state) => {
        state.status = "pending";
      })
      .addCase(updateBannerByIdAsync.fulfilled, (state, action) => {
        state.status = "fulfilled";
        const index = state.banners.findIndex(
          (b) => b._id === action.payload._id,
        );
        if (index !== -1) state.banners[index] = action.payload;
      })
      .addCase(updateBannerByIdAsync.rejected, (state, action) => {
        state.status = "rejected";
        state.errors = action.payload || action.error;
      })
      // Delete
      .addCase(deleteBannerByIdAsync.fulfilled, (state, action) => {
        const index = state.banners.findIndex(
          (b) => b._id === action.payload._id,
        );
        if (index !== -1) state.banners[index] = action.payload;
      });
  },
});

export const { resetBannerStatus, clearSelectedBanner } = bannerSlice.actions;

export const selectBannerStatus = (state) => state.BannerSlice.status;
export const selectBanners = (state) => state.BannerSlice.banners;
export const selectSelectedBanner = (state) => state.BannerSlice.selectedBanner;
export const selectBannerErrors = (state) => state.BannerSlice.errors;

export default bannerSlice.reducer;
