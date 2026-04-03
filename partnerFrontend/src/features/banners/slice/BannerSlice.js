import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  fetchAllBanners,
  getBannerById,
  addBanner,
  updateBannerById,
  deleteBannerById,
} from "../api/BannerApi";

const initialState = {
  status: "idle",
  banners: [],
  selectedBanner: null,
  errors: null,
};

// --- Thunks ---
export const fetchAllBannersAsync = createAsyncThunk(
  "banners/fetchAll",
  async (admin) => {
    return await fetchAllBanners(admin);
  },
);

export const getBannerByIdAsync = createAsyncThunk(
  "banners/getById",
  async (id) => {
    return await getBannerById(id);
  },
);

export const addBannerAsync = createAsyncThunk("banners/add", async (data) => {
  return await addBanner(data);
});

export const updateBannerByIdAsync = createAsyncThunk(
  "banners/update",
  async (data) => {
    return await updateBannerById(data);
  },
);

export const deleteBannerByIdAsync = createAsyncThunk(
  "banners/delete",
  async (id) => {
    return await deleteBannerById(id);
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
        state.errors = action.error;
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
        state.errors = action.error;
      })
      // Add
      .addCase(addBannerAsync.pending, (state) => {
        state.status = "pending";
      })
      .addCase(addBannerAsync.fulfilled, (state, action) => {
        state.status = "fulfilled";
        state.banners.unshift(action.payload); // Add new banner to top of list
      })
      .addCase(addBannerAsync.rejected, (state, action) => {
        state.status = "rejected";
        state.errors = action.error;
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
        state.errors = action.error;
      })
      // Delete (Soft Delete handled by backend, so we just update the object in state)
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
