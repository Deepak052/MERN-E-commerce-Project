import { axiosi } from "../../../config/axios";

export const addToCart = async (item) => {
  try {
    const res = await axiosi.post("/cart", item);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// 🚨 FIX: Removed ID from URL. Backend uses the JWT token securely.
export const fetchCartByUserId = async () => {
  try {
    const res = await axiosi.get(`/cart`);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateCartItemById = async (update) => {
  try {
    const res = await axiosi.patch(`/cart/${update._id}`, update);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deleteCartItemById = async (id) => {
  try {
    const res = await axiosi.delete(`/cart/${id}`);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// 🚨 FIX: Removed ID from URL. Backend uses the JWT token securely.
export const resetCartByUserId = async () => {
  try {
    const res = await axiosi.delete(`/cart`);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
