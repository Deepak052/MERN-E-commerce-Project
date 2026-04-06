import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  createOrder,
  getAllOrders,
  getOrderByUserId,
  getOrderById, // 🚨 NEW
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

export const createOrderAsync = createAsyncThunk(
  "orders/createOrderAsync",
  async (order, { rejectWithValue }) => {
    try {
      return await createOrder(order);
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const verifyAndCreateOrderAsync = createAsyncThunk(
  "orders/verifyAndCreateOrderAsync",
  async (data, { rejectWithValue }) => {
    try {
      return await verifyAndCreateOrder(data);
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const getAllOrdersAsync = createAsyncThunk(
  "orders/getAllOrdersAsync",
  async (_, { rejectWithValue }) => {
    try {
      return await getAllOrders();
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const getOrderByUserIdAsync = createAsyncThunk(
  "orders/getOrderByUserIdAsync",
  async (_, { rejectWithValue }) => {
    try {
      return await getOrderByUserId();
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

// 🚨 NEW: Thunk to fetch a single order by ID
export const getOrderByIdAsync = createAsyncThunk(
  "orders/getOrderByIdAsync",
  async (id, { rejectWithValue }) => {
    try {
      return await getOrderById(id);
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const updateOrderByIdAsync = createAsyncThunk(
  "orders/updateOrderByIdAsync",
  async (update, { rejectWithValue }) => {
    try {
      return await updateOrderById(update);
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

const orderSlice = createSlice({
  name: "orderSlice",
  initialState: initialState,
  reducers: {
    clearCurrentOrder: (state) => {
      // 🚨 FIX: Renamed to clearCurrentOrder to match UI pages
      state.currentOrder = null;
    },
    resetOrderUpdateStatus: (state) => {
      state.orderUpdateStatus = "idle";
    },
    resetOrderFetchStatus: (state) => {
      state.orderFetchStatus = "idle";
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
        state.errors = action.payload || action.error;
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
        state.errors = action.payload || action.error;
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
        state.errors = action.payload || action.error;
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
        state.errors = action.payload || action.error;
      })

      // 🚨 NEW: Handle Single Order Fetch
      .addCase(getOrderByIdAsync.pending, (state) => {
        state.orderFetchStatus = "pending";
      })
      .addCase(getOrderByIdAsync.fulfilled, (state, action) => {
        state.orderFetchStatus = "fulfilled";
        state.currentOrder = action.payload;
      })
      .addCase(getOrderByIdAsync.rejected, (state, action) => {
        state.orderFetchStatus = "rejected";
        state.errors = action.payload || action.error;
      })

      .addCase(updateOrderByIdAsync.pending, (state) => {
        state.orderUpdateStatus = "pending";
      })
      .addCase(updateOrderByIdAsync.fulfilled, (state, action) => {
        state.orderUpdateStatus = "fulfilled";
        const index = state.orders.findIndex(
          (order) => order._id === action.payload._id,
        );
        if (index !== -1) state.orders[index] = action.payload;
      })
      .addCase(updateOrderByIdAsync.rejected, (state, action) => {
        state.orderUpdateStatus = "rejected";
        state.errors = action.payload || action.error;
      });
  },
});

export const {
  clearCurrentOrder,
  resetOrderUpdateStatus,
  resetOrderFetchStatus,
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
