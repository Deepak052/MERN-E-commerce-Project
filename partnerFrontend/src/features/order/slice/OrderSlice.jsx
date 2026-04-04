import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  createOrder,
  getAllOrders,
  getOrderByUserId,
  updateOrderById,
  verifyAndCreateOrder,
} from "../api/OrderApi";

const initialState = {
  status: "idle",
  orderUpdateStatus: "idle",
  orderFetchStatus: "idle",
  orders: [],
  currentOrder: null,
  errors: null,
  successMessage: null,
};

// ==========================================
// 🚨 THUNKS (FIXED WITH rejectWithValue)
// ==========================================

export const createOrderAsync = createAsyncThunk(
  "orders/createOrderAsync",
  async (order, { rejectWithValue }) => {
    try {
      const createdOrder = await createOrder(order);
      return createdOrder;
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const verifyAndCreateOrderAsync = createAsyncThunk(
  "orders/verifyAndCreateOrderAsync",
  async (data, { rejectWithValue }) => {
    try {
      const verifiedOrder = await verifyAndCreateOrder(data);
      return verifiedOrder;
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const getAllOrdersAsync = createAsyncThunk(
  "orders/getAllOrdersAsync",
  async (_, { rejectWithValue }) => {
    try {
      const orders = await getAllOrders();
      return orders;
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const getOrderByUserIdAsync = createAsyncThunk(
  "orders/getOrderByUserIdAsync",
  async (id, { rejectWithValue }) => {
    try {
      const orders = await getOrderByUserId(id);
      return orders;
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const updateOrderByIdAsync = createAsyncThunk(
  "orders/updateOrderByIdAsync",
  async (update, { rejectWithValue }) => {
    try {
      const updatedOrder = await updateOrderById(update);
      return updatedOrder;
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

// ==========================================
// SLICE
// ==========================================

const orderSlice = createSlice({
  name: "orderSlice",
  initialState: initialState,
  reducers: {
    resetCurrentOrder: (state) => {
      state.currentOrder = null;
    },
    resetOrderUpdateStatus: (state) => {
      state.orderUpdateStatus = "idle";
    },
    resetOrderFetchStatus: (state) => {
      state.orderFetchStatus = "idle";
    },
    // Optional: Add a clear error reducer if you want to dismiss toasts
    clearOrderErrors: (state) => {
      state.errors = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrderAsync.pending, (state) => {
        state.status = "pending";
      })
      .addCase(createOrderAsync.fulfilled, (state, action) => {
        state.status = "fulfilled";
        state.orders.push(action.payload);
        state.currentOrder = action.payload;
      })
      .addCase(createOrderAsync.rejected, (state, action) => {
        state.status = "rejected";
        state.errors = action.payload || action.error; // 🚨 FIX
      })

      .addCase(verifyAndCreateOrderAsync.pending, (state) => {
        state.status = "pending";
      })
      .addCase(verifyAndCreateOrderAsync.fulfilled, (state, action) => {
        state.status = "fulfilled";
        state.orders.push(action.payload);
        state.currentOrder = action.payload;
      })
      .addCase(verifyAndCreateOrderAsync.rejected, (state, action) => {
        state.status = "rejected";
        state.errors = action.payload || action.error; // 🚨 FIX
      })

      .addCase(getAllOrdersAsync.pending, (state) => {
        state.orderFetchStatus = "pending";
      })
      .addCase(getAllOrdersAsync.fulfilled, (state, action) => {
        state.orderFetchStatus = "fulfilled";
        state.orders = action.payload;
      })
      .addCase(getAllOrdersAsync.rejected, (state, action) => {
        state.orderFetchStatus = "rejected";
        state.errors = action.payload || action.error; // 🚨 FIX
      })

      .addCase(getOrderByUserIdAsync.pending, (state) => {
        state.orderFetchStatus = "pending";
      })
      .addCase(getOrderByUserIdAsync.fulfilled, (state, action) => {
        state.orderFetchStatus = "fulfilled";
        state.orders = action.payload;
      })
      .addCase(getOrderByUserIdAsync.rejected, (state, action) => {
        state.orderFetchStatus = "rejected";
        state.errors = action.payload || action.error; // 🚨 FIX
      })

      .addCase(updateOrderByIdAsync.pending, (state) => {
        state.orderUpdateStatus = "pending";
      })
      .addCase(updateOrderByIdAsync.fulfilled, (state, action) => {
        state.orderUpdateStatus = "fulfilled";
        const index = state.orders.findIndex(
          (order) => order._id === action.payload._id,
        );
        state.orders[index] = action.payload;
      })
      .addCase(updateOrderByIdAsync.rejected, (state, action) => {
        state.orderUpdateStatus = "rejected";
        state.errors = action.payload || action.error; // 🚨 FIX
      });
  },
});

export const {
  resetCurrentOrder,
  resetOrderUpdateStatus,
  resetOrderFetchStatus,
  clearOrderErrors,
} = orderSlice.actions;

export const selectOrderStatus = (state) => state.OrderSlice.status;
export const selectOrders = (state) => state.OrderSlice.orders;
export const selectOrdersErrors = (state) => state.OrderSlice.errors;
export const selectOrdersSuccessMessage = (state) =>
  state.OrderSlice.successMessage;
export const selectCurrentOrder = (state) => state.OrderSlice.currentOrder;
export const selectOrderUpdateStatus = (state) =>
  state.OrderSlice.orderUpdateStatus;
export const selectOrderFetchStatus = (state) =>
  state.OrderSlice.orderFetchStatus;

export default orderSlice.reducer;
