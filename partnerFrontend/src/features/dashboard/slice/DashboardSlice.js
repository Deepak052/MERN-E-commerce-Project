import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchDashboardStats } from "../api/DashboardApi";

const initialState = {
  status: "idle",
  stats: null, // Will hold our combined KPIs, charts, and recent orders
  errors: null,
};

export const fetchDashboardStatsAsync = createAsyncThunk(
  "dashboard/fetchStats",
  async () => {
    const data = await fetchDashboardStats();
    return data;
  },
);

const dashboardSlice = createSlice({
  name: "dashboardSlice",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStatsAsync.pending, (state) => {
        state.status = "pending";
      })
      .addCase(fetchDashboardStatsAsync.fulfilled, (state, action) => {
        state.status = "fulfilled";
        state.stats = action.payload;
      })
      .addCase(fetchDashboardStatsAsync.rejected, (state, action) => {
        state.status = "rejected";
        state.errors = action.error;
      });
  },
});

export const selectDashboardStatus = (state) => state.DashboardSlice.status;
export const selectDashboardStats = (state) => state.DashboardSlice.stats;

export default dashboardSlice.reducer;
