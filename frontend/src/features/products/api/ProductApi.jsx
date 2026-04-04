import { axiosi } from "../../../config/axios";

export const addProduct = async (data) => {
  try {
    const res = await axiosi.post("/products", data);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const fetchProducts = async (filters) => {
  let queryParams = new URLSearchParams();

  if (filters.search) queryParams.append("search", filters.search);
  if (filters.brand?.length)
    queryParams.append("brand", filters.brand.join(","));
  if (filters.category?.length)
    queryParams.append("category", filters.category.join(","));
  if (filters.minPrice) queryParams.append("minPrice", filters.minPrice);
  if (filters.maxPrice) queryParams.append("maxPrice", filters.maxPrice);

  if (filters.pagination) {
    queryParams.append("page", filters.pagination.page);
    queryParams.append("limit", filters.pagination.limit);
  }

  if (filters.sort) {
    queryParams.append("sort", filters.sort.sort);
    queryParams.append("order", filters.sort.order);
  }

  if (filters.user) queryParams.append("user", true);

  // 🚨 FIX: Determine the correct endpoint based on admin status
  const endpoint = filters.admin ? "/products/admin" : "/products";

  try {
    const res = await axiosi.get(`${endpoint}?${queryParams.toString()}`);
    const totalResults = res.headers["x-total-count"];
    return { data: res.data, totalResults };
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const fetchProductById = async (id) => {
  try {
    const res = await axiosi.get(`/products/${id}`);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateProductById = async (update) => {
  try {
    const res = await axiosi.patch(`/products/${update._id}`, update);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const undeleteProductById = async (id) => {
  try {
    const res = await axiosi.patch(`/products/undelete/${id}`);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deleteProductById = async (id) => {
  try {
    const res = await axiosi.delete(`/products/${id}`);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const fetchNewArrivals = async (limit = 10) => {
  try {
    const res = await axiosi.get(`/products/new-arrivals?limit=${limit}`);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
