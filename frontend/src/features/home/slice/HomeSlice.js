import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import * as HomeApi from "../api/HomeApi";

const initialState = {
  status: "idle",
  newArrivals: [],
  deals: [],
  explore: [],
  bestSellers: [],
  budgetPicks: [],
  flashSales: [],
  combos: [],
  recommendations: [],
  errors: null,
};

// --- THUNKS ---
export const fetchNewArrivalsAsync = createAsyncThunk(
  "home/newArrivals",
  async (limit) => await HomeApi.fetchNewArrivals(limit),
);
export const fetchDealsAsync = createAsyncThunk(
  "home/deals",
  async (limit) => await HomeApi.fetchDealsOfTheDay(limit),
);
export const fetchExploreAsync = createAsyncThunk(
  "home/explore",
  async (limit) => await HomeApi.fetchExploreMore(limit),
);
export const fetchBestSellersAsync = createAsyncThunk(
  "home/bestSellers",
  async (limit) => await HomeApi.fetchBestSellers(limit),
);
export const fetchBudgetPicksAsync = createAsyncThunk(
  "home/budgetPicks",
  async (args) => await HomeApi.fetchBudgetPicks(args?.limit, args?.maxPrice),
);
export const fetchFlashSalesAsync = createAsyncThunk(
  "home/flashSales",
  async (limit) => await HomeApi.fetchFlashSales(limit),
);
export const fetchCombosAsync = createAsyncThunk(
  "home/combos",
  async (limit) => await HomeApi.fetchComboOffers(limit),
);
export const fetchRecommendationsAsync = createAsyncThunk(
  "home/recommendations",
  async (limit) => await HomeApi.fetchRecommendations(limit),
);

const homeSlice = createSlice({
  name: "home",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNewArrivalsAsync.fulfilled, (state, action) => {
        state.newArrivals = action.payload;
      })
      .addCase(fetchDealsAsync.fulfilled, (state, action) => {
        state.deals = action.payload;
      })
      .addCase(fetchExploreAsync.fulfilled, (state, action) => {
        state.explore = action.payload;
      })
      .addCase(fetchBestSellersAsync.fulfilled, (state, action) => {
        state.bestSellers = action.payload;
      })
      .addCase(fetchBudgetPicksAsync.fulfilled, (state, action) => {
        state.budgetPicks = action.payload;
      })
      .addCase(fetchFlashSalesAsync.fulfilled, (state, action) => {
        state.flashSales = action.payload;
      })
      .addCase(fetchCombosAsync.fulfilled, (state, action) => {
        state.combos = action.payload;
      })
      .addCase(fetchRecommendationsAsync.fulfilled, (state, action) => {
        state.recommendations = action.payload;
      });
  },
});

// --- SELECTORS ---
export const selectNewArrivals = (state) => state.HomeSlice.newArrivals;
export const selectDeals = (state) => state.HomeSlice.deals;
export const selectExplore = (state) => state.HomeSlice.explore;
export const selectBestSellers = (state) => state.HomeSlice.bestSellers;
export const selectBudgetPicks = (state) => state.HomeSlice.budgetPicks;
export const selectFlashSales = (state) => state.HomeSlice.flashSales;
export const selectCombos = (state) => state.HomeSlice.combos;
export const selectRecommendations = (state) => state.HomeSlice.recommendations;

export default homeSlice.reducer;
