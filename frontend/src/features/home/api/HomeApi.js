import { axiosi } from "../../../config/axios";

export const fetchNewArrivals = async (limit = 10) => {
  const res = await axiosi.get(`/products/new-arrivals?limit=${limit}`);
  return res.data;
};

export const fetchDealsOfTheDay = async (limit = 10) => {
  const res = await axiosi.get(`/products/deals?limit=${limit}`);
  return res.data;
};

export const fetchExploreMore = async (limit = 12) => {
  const res = await axiosi.get(`/products/explore?limit=${limit}`);
  return res.data;
};

export const fetchBestSellers = async (limit = 10) => {
  const res = await axiosi.get(`/products/best-sellers?limit=${limit}`);
  return res.data;
};

export const fetchBudgetPicks = async (limit = 10, maxPrice = 50) => {
  const res = await axiosi.get(
    `/products/budget-picks?limit=${limit}&maxPrice=${maxPrice}`,
  );
  return res.data;
};

export const fetchFlashSales = async (limit = 10) => {
  const res = await axiosi.get(`/products/flash-sale?limit=${limit}`);
  return res.data;
};

export const fetchComboOffers = async (limit = 10) => {
  const res = await axiosi.get(`/products/combo-offers?limit=${limit}`);
  return res.data;
};

export const fetchRecommendations = async (limit = 10) => {
  const res = await axiosi.get(`/products/recommended?limit=${limit}`);
  return res.data;
};
