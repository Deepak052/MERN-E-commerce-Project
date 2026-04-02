import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  fetchAllBrands,
  fetchAllBrandsForAdmin,
  addBrand,
  updateBrandById,
  deleteBrandById,
  getBrandById,
} from "./BrandApi";

const initialState = {
  status: "idle",
  addStatus: "idle",
  updateStatus: "idle",
  deleteStatus: "idle",

  brands: [], // storefront
  adminBrands: [], // admin

  selectedBrand: null,

  errors: null,
};

// ✅ Public fetch
export const fetchAllBrandsAsync = createAsyncThunk(
  "brands/fetchAllBrands",
  async () => await fetchAllBrands(),
);

// ✅ Admin fetch
export const fetchAllBrandsForAdminAsync = createAsyncThunk(
  "brands/fetchAllBrandsForAdmin",
  async () => await fetchAllBrandsForAdmin(),
);

// ✅ Get by ID
export const getBrandByIdAsync = createAsyncThunk(
  "brands/getBrandById",
  async (id) => await getBrandById(id),
);

// ✅ Add
export const addBrandAsync = createAsyncThunk(
  "brands/addBrand",
  async (data) => await addBrand(data),
);

// ✅ Update
export const updateBrandAsync = createAsyncThunk(
  "brands/updateBrand",
  async (data) => await updateBrandById(data),
);

// ✅ Delete
export const deleteBrandAsync = createAsyncThunk(
  "brands/deleteBrand",
  async (id) => await deleteBrandById(id),
);

const brandSlice = createSlice({
  name: "BrandSlice",
  initialState,
  reducers: {
    resetBrandStatus: (state) => {
      state.addStatus = "idle";
      state.updateStatus = "idle";
      state.deleteStatus = "idle";
      state.errors = null;
    },
    clearBrandErrors: (state) => {
      state.errors = null;
    },
  },
  extraReducers: (builder) => {
    builder

      // 🔹 FETCH (Storefront)
      .addCase(fetchAllBrandsAsync.pending, (state) => {
        state.status = "pending";
      })
      .addCase(fetchAllBrandsAsync.fulfilled, (state, action) => {
        state.status = "fulfilled";
        state.brands = action.payload;
      })
      .addCase(fetchAllBrandsAsync.rejected, (state, action) => {
        state.status = "rejected";
        state.errors = action.error;
      })

      // 🔹 FETCH (Admin)
      .addCase(fetchAllBrandsForAdminAsync.pending, (state) => {
        state.status = "pending";
      })
      .addCase(fetchAllBrandsForAdminAsync.fulfilled, (state, action) => {
        state.status = "fulfilled";
        state.adminBrands = action.payload;
      })
      .addCase(fetchAllBrandsForAdminAsync.rejected, (state, action) => {
        state.status = "rejected";
        state.errors = action.error;
      })

      // 🔹 GET BY ID
      .addCase(getBrandByIdAsync.fulfilled, (state, action) => {
        state.selectedBrand = action.payload;
      })

      // 🔹 ADD
      .addCase(addBrandAsync.pending, (state) => {
        state.addStatus = "pending";
      })
      .addCase(addBrandAsync.fulfilled, (state, action) => {
        state.addStatus = "fulfilled";
        state.adminBrands.push(action.payload);
      })
      .addCase(addBrandAsync.rejected, (state, action) => {
        state.addStatus = "rejected";
        state.errors = action.error;
      })

      // 🔹 UPDATE
      .addCase(updateBrandAsync.pending, (state) => {
        state.updateStatus = "pending";
      })
      .addCase(updateBrandAsync.fulfilled, (state, action) => {
        state.updateStatus = "fulfilled";

        const index = state.adminBrands.findIndex(
          (b) => b._id === action.payload._id,
        );

        if (index !== -1) {
          state.adminBrands[index] = action.payload;
        }
      })
      .addCase(updateBrandAsync.rejected, (state, action) => {
        state.updateStatus = "rejected";
        state.errors = action.error;
      })

      // 🔹 DELETE (Soft delete)
      .addCase(deleteBrandAsync.pending, (state) => {
        state.deleteStatus = "pending";
      })
      .addCase(deleteBrandAsync.fulfilled, (state, action) => {
        state.deleteStatus = "fulfilled";

        // remove from UI
        state.adminBrands = state.adminBrands.filter(
          (b) => b._id !== action.payload._id,
        );
      })
      .addCase(deleteBrandAsync.rejected, (state, action) => {
        state.deleteStatus = "rejected";
        state.errors = action.error;
      });
  },
});

// ✅ Selectors
export const selectBrandStatus = (state) => state.BrandSlice.status;
export const selectBrandAddStatus = (state) => state.BrandSlice.addStatus;
export const selectBrandUpdateStatus = (state) => state.BrandSlice.updateStatus;
export const selectBrandDeleteStatus = (state) => state.BrandSlice.deleteStatus;

export const selectBrands = (state) => state.BrandSlice.brands;
export const selectAdminBrands = (state) => state.BrandSlice.adminBrands;

export const selectSelectedBrand = (state) => state.BrandSlice.selectedBrand;

export const selectBrandErrors = (state) => state.BrandSlice.errors;

// ✅ Actions
export const { resetBrandStatus, clearBrandErrors } = brandSlice.actions;

export default brandSlice.reducer;
