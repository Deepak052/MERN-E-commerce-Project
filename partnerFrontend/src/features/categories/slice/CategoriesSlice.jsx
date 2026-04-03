import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  fetchAllCategories,
  getCategoryById,
  addCategory,
  updateCategoryById,
  deleteCategoryById,
} from "../api/CategoriesApi";

const initialState = {
  status: "idle",
  categories: [],
  selectedCategory: null,
  errors: null,
};

// Thunks
export const fetchAllCategoriesAsync = createAsyncThunk(
  "categories/fetchAllCategories",
  async () => {
    return await fetchAllCategories();
  },
);

export const getCategoryByIdAsync = createAsyncThunk(
  "categories/getById",
  async (id) => {
    return await getCategoryById(id);
  },
);

export const addCategoryAsync = createAsyncThunk(
  "categories/addCategory",
  async (data) => {
    return await addCategory(data);
  },
);

export const updateCategoryByIdAsync = createAsyncThunk(
  "categories/updateCategory",
  async (data) => {
    return await updateCategoryById(data);
  },
);

export const deleteCategoryByIdAsync = createAsyncThunk(
  "categories/deleteCategory",
  async (id) => {
    return await deleteCategoryById(id);
  },
);

const categorySlice = createSlice({
  name: "categorySlice",
  initialState,
  reducers: {
    resetCategoryStatus: (state) => {
      state.status = "idle";
      state.errors = null;
    },
    clearSelectedCategory: (state) => {
      state.selectedCategory = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All
      .addCase(fetchAllCategoriesAsync.pending, (state) => {
        state.status = "pending";
      })
      .addCase(fetchAllCategoriesAsync.fulfilled, (state, action) => {
        state.status = "fulfilled";
        state.categories = action.payload;
      })
      .addCase(fetchAllCategoriesAsync.rejected, (state, action) => {
        state.status = "rejected";
        state.errors = action.error;
      })
      // Get By ID
      .addCase(getCategoryByIdAsync.pending, (state) => {
        state.status = "pending";
      })
      .addCase(getCategoryByIdAsync.fulfilled, (state, action) => {
        state.status = "fulfilled";
        state.selectedCategory = action.payload;
      })
      .addCase(getCategoryByIdAsync.rejected, (state, action) => {
        state.status = "rejected";
        state.errors = action.error;
      })
      // Add
      .addCase(addCategoryAsync.pending, (state) => {
        state.status = "pending";
      })
      .addCase(addCategoryAsync.fulfilled, (state, action) => {
        state.status = "fulfilled";
        state.categories.push(action.payload);
      })
      .addCase(addCategoryAsync.rejected, (state, action) => {
        state.status = "rejected";
        state.errors = action.error;
      })
      // Update
      .addCase(updateCategoryByIdAsync.pending, (state) => {
        state.status = "pending";
      })
      .addCase(updateCategoryByIdAsync.fulfilled, (state, action) => {
        state.status = "fulfilled";
        const index = state.categories.findIndex(
          (c) => c._id === action.payload._id,
        );
        if (index !== -1) state.categories[index] = action.payload;
      })
      .addCase(updateCategoryByIdAsync.rejected, (state, action) => {
        state.status = "rejected";
        state.errors = action.error;
      })
      // Delete
      .addCase(deleteCategoryByIdAsync.fulfilled, (state, action) => {
        const index = state.categories.findIndex(
          (c) => c._id === action.payload._id,
        );
        if (index !== -1) state.categories[index] = action.payload; // Update to soft-deleted state
      });
  },
});

export const { resetCategoryStatus, clearSelectedCategory } =
  categorySlice.actions;

export const selectCategoryStatus = (state) => state.CategoriesSlice.status;
export const selectCategories = (state) => state.CategoriesSlice.categories;
export const selectSelectedCategory = (state) =>
  state.CategoriesSlice.selectedCategory;
export const selectCategoryErrors = (state) => state.CategoriesSlice.errors;

export default categorySlice.reducer;
