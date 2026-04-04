import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  addToCart,
  fetchCartByUserId,
  updateCartItemById,
  deleteCartItemById,
  resetCartByUserId,
} from "../api/CartApi";

const initialState = {
  status: "idle",
  items: [],
  cartItemAddStatus: "idle",
  cartItemRemoveStatus: "idle",
  errors: null,
  successMessage: null,
};

// 🚨 FIX: Added rejectWithValue to all Thunks
export const addToCartAsync = createAsyncThunk(
  "cart/addToCartAsync",
  async (item, { rejectWithValue }) => {
    try {
      return await addToCart(item);
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const fetchCartByUserIdAsync = createAsyncThunk(
  "cart/fetchCartByUserIdAsync",
  async (id, { rejectWithValue }) => {
    try {
      return await fetchCartByUserId(); // ID no longer passed to API
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const updateCartItemByIdAsync = createAsyncThunk(
  "cart/updateCartItemByIdAsync",
  async (update, { rejectWithValue }) => {
    try {
      return await updateCartItemById(update);
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const deleteCartItemByIdAsync = createAsyncThunk(
  "cart/deleteCartItemByIdAsync",
  async (id, { rejectWithValue }) => {
    try {
      return await deleteCartItemById(id);
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const resetCartByUserIdAsync = createAsyncThunk(
  "cart/resetCartByUserIdAsync",
  async (userId, { rejectWithValue }) => {
    try {
      return await resetCartByUserId(); // ID no longer passed to API
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

const cartSlice = createSlice({
  name: "cartSlice",
  initialState: initialState,
  reducers: {
    resetCartItemAddStatus: (state) => {
      state.cartItemAddStatus = "idle";
    },
    resetCartItemRemoveStatus: (state) => {
      state.cartItemRemoveStatus = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addToCartAsync.pending, (state) => {
        state.cartItemAddStatus = "pending";
      })
      .addCase(addToCartAsync.fulfilled, (state, action) => {
        state.cartItemAddStatus = "fulfilled";
        state.items.push(action.payload);
      })
      .addCase(addToCartAsync.rejected, (state, action) => {
        state.cartItemAddStatus = "rejected";
        state.errors = action.payload || action.error; // 🚨 FIX
      })

      .addCase(fetchCartByUserIdAsync.pending, (state) => {
        state.status = "pending";
      })
      .addCase(fetchCartByUserIdAsync.fulfilled, (state, action) => {
        state.status = "fulfilled";
        state.items = action.payload;
      })
      .addCase(fetchCartByUserIdAsync.rejected, (state, action) => {
        state.status = "rejected";
        state.errors = action.payload || action.error; // 🚨 FIX
      })

      .addCase(updateCartItemByIdAsync.pending, (state) => {
        state.status = "pending";
      })
      .addCase(updateCartItemByIdAsync.fulfilled, (state, action) => {
        state.status = "fulfilled";
        const index = state.items.findIndex(
          (item) => item._id === action.payload._id,
        );
        if (index !== -1) state.items[index] = action.payload;
      })
      .addCase(updateCartItemByIdAsync.rejected, (state, action) => {
        state.status = "rejected";
        state.errors = action.payload || action.error; // 🚨 FIX
      })

      .addCase(deleteCartItemByIdAsync.pending, (state) => {
        state.cartItemRemoveStatus = "pending";
      })
      .addCase(deleteCartItemByIdAsync.fulfilled, (state, action) => {
        state.cartItemRemoveStatus = "fulfilled";
        state.items = state.items.filter(
          (item) => item._id !== action.payload._id,
        );
      })
      .addCase(deleteCartItemByIdAsync.rejected, (state, action) => {
        state.cartItemRemoveStatus = "rejected";
        state.errors = action.payload || action.error; // 🚨 FIX
      })

      .addCase(resetCartByUserIdAsync.pending, (state) => {
        state.status = "pending";
      })
      .addCase(resetCartByUserIdAsync.fulfilled, (state) => {
        state.status = "fulfilled";
        state.items = [];
      })
      .addCase(resetCartByUserIdAsync.rejected, (state, action) => {
        state.status = "rejected";
        state.errors = action.payload || action.error; // 🚨 FIX
      });
  },
});

// Selectors
export const selectCartStatus = (state) => state.CartSlice.status;
export const selectCartItems = (state) => state.CartSlice.items;
export const selectCartErrors = (state) => state.CartSlice.errors;
export const selectCartSuccessMessage = (state) =>
  state.CartSlice.successMessage;
export const selectCartItemAddStatus = (state) =>
  state.CartSlice.cartItemAddStatus;
export const selectCartItemRemoveStatus = (state) =>
  state.CartSlice.cartItemRemoveStatus;

export const { resetCartItemAddStatus, resetCartItemRemoveStatus } =
  cartSlice.actions;

export default cartSlice.reducer;
